import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import ChooseUsernamePage from "./components/ChooseUsernamePage";

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/login/choose-username"
            element={<ChooseUsernamePage />}
          />
        </Routes>
      </Router>
    </>
  );
};

export default App;
