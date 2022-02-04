function dateNow() {
  var date = new Date();
  var aaaa = date.getFullYear();
  var gg = date.getDate();
  var mm = date.getMonth() + 1;

  if (gg < 10) gg = "0" + gg;

  if (mm < 10) mm = "0" + mm;

  var cur_day = aaaa + "-" + mm + "-" + gg;

  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();

  if (hours < 10) hours = "0" + hours;

  if (minutes < 10) minutes = "0" + minutes;

  if (seconds < 10) seconds = "0" + seconds;

  return cur_day + " " + hours + ":" + minutes;
}

$(document).ready(function () {
  var socket = io.connect("http://" + document.domain + ":" + location.port,
                          {withCredentials: true});
  socket.on('connect', async function() {
      $("#disconnected").hide();
      $("#connected").fadeIn();
      setTimeout(() => {
          $("#connected").fadeOut();
      }, 2000);
  })
  socket.on('disconnect', async function() { $("#disconnected").show() })

  var d = $('#convHistory');
  d.scrollTop(d.prop("scrollHeight"));
  var sendTo;
  var chats;
  var add_message = function (message, time, send=true, noanimation=false) {
    elm = '<div class="msg ';
    if (send === true)
      elm += 'messageSent">';
    else
      elm += 'messageReceived">';
    elm += message;
    elm += '<span class="timestamp">';
    elm += time;
    elm += '</span></div>';
    pmsgs = $("#convHistory").html();
    $("#convHistory").html(pmsgs + elm);
    if (noanimation) d.scrollTop(d.prop("scrollHeight"));
    else
    $("#convHistory").animate({ scrollTop: $("#convHistory").prop("scrollHeight") }, "fast");
  }
  var add_search_result = function (res) {
    let bp = `<div title="Add as friend" onclick="add_friend(${res["id"]})" class="chatButton active"><div class="chatInfo"><p class="name">${res["name"]}</p></div><div class="status onTop"></div></div>`;
    let ca = $("#chat-aside").html();
    $("#chat-aside").html(ca + bp);
  };
  var add_search_results = function (res) {
    for (let i = 0; i < res.length; i++) {
      add_search_result(res[i]);
    }
  };
  $("#search-bar").keyup(function () {
    if ($(this).val() != "") {
      if (chats == undefined) chats = $("#chat-aside").html();
      $("#chat-aside").html("");

      fetch(`/api/search/${$(this).val()}`, { method: "GET" })
        .then(function (_res) {
          return _res.json();
        })
        .then(function (data) {
          if (data.length > 0) add_search_results(data);
        })
        .catch(function (err) {});
    } else {
      if (chats != undefined) $("#chat-aside").html(chats);
      chats = undefined;
    }
  });
  load_messages = function (elm, userId) {
    if ((userId != sendTo) && (!elm.classList.contains("active"))){
      $(".chatButton.active").removeClass("active");
      $(elm).addClass("active");
      let name = $(elm).find("p.name").text();
      name += ' // this is where id will go'
      $("#nameAndId").text(name);
      $("#convHistory").html("");
      sendTo = userId;
      fetch(`/api/load-messages/${userId}`, { method: "GET" })
      .then(function (_res) {return _res.json();})
      .then(function (data) {
        if (data['success'] === false) return;
        msgs = data['messages'];
        for (let i = 0; i < msgs.length; i++) {
          add_message(msgs[i]['content'], msgs[i]['timestamp'], send=msgs[i]['sender'], noanimation=true);
        }
      });
    }
  };
  var add_friend_result = function (res) {
    // let bp = `<div onclick="load_messages(this, ${res["id"]})" class="chatButton"><div class="chatInfo"><p class="name">${res["name"]}</p></div><div class="status onTop"></div></div>`;
    var d = document.createElement("div");
    // d.onclick = load_messages(this, res["id"]);
    d.className = "chatButton";
    d.innerHTML = `<div class="chatInfo"><p class="name">${res["name"]}</p></div><div class="status onTop"></div>`;
    d.onclick = function () { load_messages(d, res['id']) }
    $("#chat-aside").append(d);
    // let ca = $("#chat-aside").html();
    // $("#chat-aside").html(ca + bp);
    chats = undefined;
    $("#search-bar").val('')
    return d;
  };
  add_friend = function (id) {
    fetch(`/api/add-friend/${id}`, { method: "GET" })
      .then(function (_res) {
        return _res.json();
      })
      .then(function (data) {
        if (data["success"] === true) {
          $("#chat-aside").html(chats);
          var d = add_friend_result(data["friend"]);
          load_messages(d, id)
        } else alert("Something went wrong");
      })
      .catch(function (e) {
        alert("Something went wrong");
      });
  };
  // var load_friend = function (id) {
  //   fetch(`/api/load-friend/${id}`, { method: "GET" })
  //   .then(function (_res) {
  //     return _res.json();
  //   })
  //   .then(function (data) {
  //     if (data['success'] === false) return;
  //     if (data.length > 0) add_friend_result(data['friend']);
  //   })
  //   .catch(function (err) {});
  // }
  var load_friends = function () {
    fetch(`/api/load-friends/`, { method: "GET" })
      .then(function (_res) {
        return _res.json();
      })
      .then(function (data) {
        if (data["success"] === false) return;
        if (data["friends"].length > 0) {
          var res = data["friends"];
          for (let i = 0; i < res.length; i++) {
            add_friend_result(res[i]);
          }
        }
      })
      .catch(function (err) {});
  };
  load_friends();

  $("#messageTextBox").keydown(function (e) {
    if (e.which === 13) {
      msg = this.value;
      if (msg == '') return;
      socket.emit("send", {
        'message': msg,
        'to': sendTo,
        'timestamp': dateNow()
      });
    }
  });
  socket.on('messageSent', function(data) {
    $("#messageTextBox").val("");
    add_message(data['message'], data['timestamp']);
  });
  socket.on('messageReceived', function(data) {
    if (data['from']['id'] == sendTo)
      add_message(data['message'], data['timestamp'], send=false);
    else
      alert('You just received a message from ' + data['from']['name'])
  });
  /* make side menu show up */
  $(".trigger").click(function () {
    $(".overlay, .menuWrap").fadeIn(180);
    $(".menu").animate({ opacity: "1", left: "0px" }, 180);
  });

  /* make config menu show up */
  $(".settings").click(function () {
    $(".config").animate({ opacity: "1", right: "0px" }, 180);
    /* hide others */
    $(".menuWrap").fadeOut(180);
    $(".menu").animate({ opacity: "0", left: "-320px" }, 180);
  });

  // Show/Hide the other notification options
  $(".deskNotif").click(function () {
    $(".showSName, .showPreview, .playSounds").toggle();
  });

  /* close all overlay elements */
  $(".overlay").click(function () {
    $(".overlay, .menuWrap").fadeOut(180);
    $(".menu").animate({ opacity: "0", left: "-320px" }, 180);
    $(".config").animate({ opacity: "0", right: "-200vw" }, 180);
  });

  //This also hide everything, but when people press ESC
  $(document).keydown(function (e) {
    if (e.keyCode == 27) {
      $(".overlay, .menuWrap").fadeOut(180);
      $(".menu").animate({ opacity: "0", left: "-320px" }, 180);
      $(".config").animate({ opacity: "0", right: "-200vw" }, 180);
    }
  });

  //Enable/Disable night mode
  $(".DarkThemeTrigger").click(function () {
    $("body").toggleClass("DarkTheme");
  });

  /* small conversation menu */
  $(".otherOptions").click(function () {
    $(".moreMenu").slideToggle("fast");
  });

  /* clicking the search button from the conversation focus the search bar outside it, as on desktop */
  $(".search").click(function () {
    $(".searchChats").focus();
  });

  /* Show or Hide Emoji Panel */
  $(".emoji").click(function () {
    $(".emojiBar").fadeToggle(120);
  });

  /* if the user click the conversation or the type panel will also hide the emoji panel */
  $(".convHistory, .replyMessage").click(function () {
    $(".emojiBar").fadeOut(120);
  });
});
