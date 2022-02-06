import { get_csrf_token } from "./requests";

const handleLoginSubmit = async (
  e,
  redirectCallback,
  signedUpLocation,
  loggedInLocation
) => {
  if (e.target[0].value.trim() === "") {
    return;
  }

  const data = new FormData(e.target);
  data.append("csrf_token", await get_csrf_token());
  const requestOptions = {
    method: "POST",
    headers: {
      HTTP_X_REQUESTED_WITH: "XMLHttpRequest",
    },
    body: data,
  };

  fetch("/auth/login/", requestOptions)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Error logging in");
      }
    })
    .then((data) => {
      console.log(data);
      if (data.success === true) {
        if (data.status === "signed-up") {
          redirectCallback(signedUpLocation);
        } else if (data.status === "logged-in") {
          redirectCallback(loggedInLocation);
        }
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

const handleChooseUsernameSubmit = async (
  e,
  redirectCallback,
  successLocation,
  failureLocation
) => {
  if (e.target[0].value.trim() === "") {
    return;
  }

  const data = new FormData(e.target);
  data.append("csrf_token", await get_csrf_token());
  const requestOptions = {
    method: "POST",
    headers: {
      HTTP_X_REQUESTED_WITH: "XMLHttpRequest",
    },
    body: data,
  };

  fetch("/auth/choose-username/", requestOptions)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Error choosing username");
      }
    })
    .then((data) => {
      console.log(data);
      if (data.success === true) {
        redirectCallback(successLocation);
      } else {
        redirectCallback(failureLocation);
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

export { handleLoginSubmit, handleChooseUsernameSubmit };
