// App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/perfil" element={<Profile />} />
    </Routes>
  );
}

export default App;
