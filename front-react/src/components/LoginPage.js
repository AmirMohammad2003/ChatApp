import React from "react";
import { handleLoginSubmit } from "../backendRequests/auth";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  return (
    <div className="login-page">
      <div className="login-page__container">
        <div className="login-page__container__title">
          <h1>Login</h1>
        </div>
        <div className="login-page__container__form">
          <form
            onSubmit={(e) => {
              handleLoginSubmit(
                e,
                (location) => {
                  navigate(location);
                },
                "/login/choose-username",
                "/chat-room"
              );
              e.preventDefault();
            }}
          >
            <input
              type="email"
              id="email"
              placeholder="Email"
              name="email"
              className="login-page__container__form__input"
            />
            <input
              type="submit"
              id="submit"
              value="Login"
              name="login"
              className="login-page__container__form__input"
              style={{ cursor: "pointer" }}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
