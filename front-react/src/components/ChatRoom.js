import React, { useState, useEffect, useRef, useReducer } from "react";
import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import TextField from "@mui/material/TextField";
import Badge from "@mui/material/Badge";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MailIcon from "@mui/icons-material/Mail";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MoreIcon from "@mui/icons-material/MoreVert";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import io from "socket.io-client";
import { get_csrf_token } from "../backendRequests/requests";

const MessageBox = ({ message, time, sender }) => {
  console.log(message);
  console.log(time);
  console.log(sender);
  return (
    <div className={sender ? "message sender" : "message receiver"}>
      <p>{message}</p>
      <span className="timestamp">{time}</span>
    </div>
  );
};

const ProfileBox = ({
  name,
  onClickCallback = (e) => {
    e.preventDefault();
  },
  isActive = false,
}) => {
  return (
    <>
      <div
        style={{
          width: "100%",
          color: "white",
          padding: "20px",
          borderBottom: "2px solid #145ea8",
          cursor: "pointer",
        }}
        onClick={onClickCallback}
        className={isActive ? "active" : ""}
      >
        <p>{name}</p>
      </div>
    </>
  );
};

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

export default () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [any, forceUpdate] = useReducer((x) => x + 1, 0);

  const searchInput = useRef(null);
  const messageInput = useRef(null);
  const messagesEnd = useRef(null);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const connectedListener = async () => {
    setConnected(true);
  };

  const disconnectedListener = async () => {
    setConnected(false);
  };

  const handleMessageReceived = async (message) => {
    console.log(message["from"]);
    console.log(activeChat);
    if (message["from"] === activeChat) {
      setMessages((messages) => [...messages, message]);
    }
  };

  const handleMessageSent = async (message) => {
    setMessages((messages) => [...messages, message]);
    messageInput.current.value = "";
  };

  useEffect(() => {
    const _socket = io("http://" + document.domain + ":5000/", {
      withCredentials: true,
    });
    setSocket(_socket);

    _socket.on("connect", connectedListener);

    _socket.on("disconnect", disconnectedListener);

    fetch("/api/load-friends/")
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw new Error("Failed to load friends");
      })
      .then((data) => {
        if (data.success === true) {
          setFriends(data.friends);
        }
      });

    return () => {
      _socket.off("connect", connectedListener);
      _socket.off("disconnect", disconnectedListener);
      _socket.close();
    };
  }, [setSocket]);

  useEffect(() => {
    if (socket === null) return;
    socket.on("messageReceived", handleMessageReceived);
    socket.on("messageSent", handleMessageSent);

    return () => {
      socket.off("messageReceived", handleMessageReceived);
      socket.off("messageSent", handleMessageSent);
    };
  }, [socket, activeChat]);

  useEffect(() => {
    if (messagesEnd.current) {
      messagesEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSearchInputChange = async (e) => {
    const value = e.target.value;
    if (value.trim() === "") {
      setUserSearchResults([]);
      return;
    }
    const results = [];
    if (value.length > 0) {
      fetch("/api/search/" + value.trim() + "/", {
        method: "GET",
        credentials: "include",
      })
        .then((_res) => {
          if (_res.ok) {
            return _res.json();
          } else {
            return new Error("Error searching for users");
          }
        })
        .then((data) => {
          console.log(data);
          setUserSearchResults(data);
        })
        .catch((err) => console.error(err));
    }
  };

  const handleProfileBoxClick = async (e, id) => {
    fetch("/api/add-friend/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": await get_csrf_token(),
      },
      credentials: "include",
      body: JSON.stringify({ id: id }),
    })
      .then((_res) => _res.json())
      .then((data) => {
        if (data["success"] === true) {
          searchInput.current.childNodes[0].value = "";
          setUserSearchResults([]);
          setFriends((friends) => [...friends, data["friend"]]);
          // forceUpdate();
          setActiveChat(data["friend"].id);
        } else {
          return new Error("Error adding friend");
        }
      })
      .catch((e) => console.error(e));
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    const message = messageInput.current.value;
    if (message.trim().length === 0) return;

    socket.emit("send", {
      message: message,
      to: activeChat,
    });
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleMenuClose}>My account</MenuItem>
    </Menu>
  );

  const mobileMenuId = "primary-search-account-menu-mobile";
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem>
        <IconButton size="large" aria-label="show 4 new mails" color="inherit">
          <Badge badgeContent={4} color="error">
            <MailIcon />
          </Badge>
        </IconButton>
        <p>Messages</p>
      </MenuItem>
      <MenuItem>
        <IconButton
          size="large"
          aria-label="show 17 new notifications"
          color="inherit"
        >
          <Badge badgeContent={17} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Notifications</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  const renderMainMenu = () => {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            {/* <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="open drawer"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton> */}
            {/* the future menu */}
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ display: { xs: "none", sm: "block" } }}
            >
              Chat-App
            </Typography>
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ "aria-label": "search" }}
                ref={searchInput}
                onKeyUp={(e) => {
                  handleSearchInputChange(e);
                }}
              />
            </Search>
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: { xs: "none", md: "flex" } }}>
              {/* <IconButton
                size="large"
                aria-label="show 4 new mails"
                color="inherit"
              >
                <Badge badgeContent={4} color="error">
                  <MailIcon />
                </Badge>
              </IconButton>
              <IconButton
                size="large"
                aria-label="show 17 new notifications"
                color="inherit"
              >
                <Badge badgeContent={17} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton> */}
              {/* will add in the future */}

              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls={menuId}
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
            </Box>
            <Box sx={{ display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="show more"
                aria-controls={mobileMenuId}
                aria-haspopup="true"
                onClick={handleMobileMenuOpen}
                color="inherit"
              >
                <MoreIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        {renderMobileMenu}
        {renderMenu}
      </Box>
    );
  };

  const renderFriends = (friends) => {
    if (friends.length < 1) return;
    console.log("rendering friends.");
    return (
      <>
        {friends.map((friend, index) => {
          console.log("rendering friend " + index);
          return (
            <ProfileBox
              name={friend.name}
              key={index}
              onClickCallback={(e) => {
                setActiveChat(friend.id);
              }}
              isActive={activeChat === friend.id}
            />
          );
        })}
      </>
    );
  };

  const renderMessages = () => {
    if (activeChat === null) {
      return (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <h2 style={{ color: "white" }}>Select a chat to start messaging</h2>
          </div>
        </>
      );
    }

    return (
      <>
        <div style={{ height: "calc(100vh - 170px)", overflowY: "hidden" }}>
          <div
            style={{
              height: "100%",
              overflowX: "hidden",
              overflowY: "auto",
            }}
          >
            {messages.length > 0 &&
              messages.map((message, index) => {
                console.log(message);
                return (
                  <>
                    <MessageBox
                      key={index}
                      message={message["message"]}
                      time={message["timestamp"]}
                      sender={message["sender"]}
                    />
                  </>
                );
              })}
            <div ref={messagesEnd} style={{ clear: "both" }}></div>
          </div>
        </div>
        <div style={{ height: "100px" }}>
          <input
            type="text"
            ref={messageInput}
            placeholder="Message..."
            style={{
              height: "50%",
              width: "100%",
              padding: "20px",
              fontSize: "12pt",
              border: "none",
              borderTop: "2px solid #145ea8",
              borderBottom: "2px solid #145ea8",
              backgroundColor: "#181a1b",
              color: "#736b5e",
            }}
            className="no-focus-border"
            onKeyDown={(e) => {
              if (e.code === "Enter") {
                if (e.target.value.trim() === "") return;
                handleSendMessage(e);
                e.preventDefault();
              }
            }}
          />
        </div>
      </>
    );
  };

  const render = () => {
    console.log("rendering");
    console.log(activeChat);
    return (
      <>
        {renderMainMenu()}
        <div style={{ height: "calc(100vh - 64px)", width: "100%" }}>
          <Grid container style={{ height: "100%" }}>
            <Grid
              item
              xs={3}
              style={{
                backgroundColor: "#1d2229",
                borderRight: "1px solid #145ea8",
              }}
            >
              {userSearchResults.length > 0
                ? userSearchResults.map((user, index) => {
                    console.log("rendering search results");
                    return (
                      <ProfileBox
                        key={index}
                        name={user.name}
                        onClickCallback={(e) => {
                          handleProfileBoxClick(e, user.id);
                        }}
                      />
                    );
                  })
                : renderFriends(friends)}
            </Grid>
            <Grid item xs={9} style={{ backgroundColor: "#1d2229" }}>
              {renderMessages()}
            </Grid>
          </Grid>
        </div>
      </>
    );
  };

  return (
    <>
      <Container style={{ height: "100vh" }}>
        {socket && connected ? render() : <div>Loading...</div>}
      </Container>
    </>
  );
};
