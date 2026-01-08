// App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Articles from "./pages/Articles";
import ArticleDetail from "./pages/ArticleDetail";
import AdminArticles from "./pages/AdminArticles";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/perfil" element={<Profile />} />
      <Route path="/articulos" element={<Articles />} />
      <Route path="/articulos/:id" element={<ArticleDetail />} />
      <Route path="/admin/articulos" element={<AdminArticles />} />
    </Routes>
  );
}

export default App;
