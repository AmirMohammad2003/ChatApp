import { handleLoginSubmit } from "../backendRequests/auth";

const LoginPage = () => {
  return (
    <div className="login-page">
      <div className="login-page__container">
        <div className="login-page__container__title">
          <h1>Login</h1>
        </div>
        <div className="login-page__container__form">
          <form
            onSubmit={(e) => {
              handleLoginSubmit(e);
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
