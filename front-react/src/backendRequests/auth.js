import { get_csrf_token } from "./requests";

const handleLoginSubmit = async (
  e,
  redirectCallback,
  signedUpLocation,
  loggedInLocation
) => {
  console.log("handleLoginSubmit");
  if (e.target[0].value.trim() === "") {
    return;
  }
  console.log("handleLoginSubmit");

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
      console.log(response);
      if (response.ok) {
        console.log("handleLoginSubmit");

        return response.json();
      } else {
        throw new Error("Error logging in");
      }
    })
    .then((data) => {
      console.log("handleLoginSubmit");
      console.log(data);
      if (data.success === true) {
        console.log("handleLoginSubmit");

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

export { handleLoginSubmit };
