export const get_csrf_token = async () => {
  const response = await fetch("/api/csrf", {
    method: "GET",
    credentials: "include",
  });
  const data = await response.json();
  return data.csrf_token;
};
