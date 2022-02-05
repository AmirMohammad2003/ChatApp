import { get_csrf_token } from "./requests";

const handleLoginSubmit = async (e) => {
  if (e.target[0].value.trim() === "" || e.target[1].value.trim() === "") {
    return;
  }
  const data = FormData(e.target);
  const requestOptions = {
    method: "POST",
    headers: { "X-CSRFToken": await get_csrf_token() },
    body: data,
  };

  fetch("/auth/login/", requestOptions);
};

export { handleLoginSubmit };
