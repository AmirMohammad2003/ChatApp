import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import ChooseUsernamePage from "./components/ChooseUsernamePage";
import ChatRoom from "./components/ChatRoom";

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/chat-room" element={<ChatRoom />} />
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
