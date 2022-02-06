import React from "react";
import { handleChooseUsernameSubmit } from "../backendRequests/auth";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  return (
    <div className="login-page">
      <div className="login-page__container">
        <div
          className="login-page__container__title"
          style={{ fontSize: "10px" }}
        >
          <h1>Choose Your Username</h1>
        </div>
        <div className="login-page__container__form">
          <form
            onSubmit={(e) => {
              handleChooseUsernameSubmit(
                e,
                (location) => {
                  navigate(location);
                },
                "/chat-room/",
                "/"
              );
              e.preventDefault();
            }}
          >
            <input
              type="text"
              id="username"
              placeholder="Username"
              name="username"
              className="login-page__container__form__input"
            />
            <input
              type="submit"
              id="submit"
              value="confirm"
              name="Confirm"
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
