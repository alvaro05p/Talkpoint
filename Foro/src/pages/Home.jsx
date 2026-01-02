// Home.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Post from "../components/Post";
import CreatePostModal from "../components/CreatePostModal";
import AuthModal from "../components/AuthModal";

const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Cargar usuario de localStorage al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Cargar posts
  useEffect(() => {
    fetch("http://localhost:8080/api/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error("Error al cargar posts:", err));
  }, []);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setMenuOpen(false);
  };

  // Función para el botón de crear/login
  const handleCreateClick = () => {
    if (user) {
      setModalOpen(true);
    } else {
      setAuthModalOpen(true);
    }
  };

  return (
    <>
      {/* Modal para crear post */}
      <CreatePostModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onPostCreated={handlePostCreated}
      />

      {/* Modal de autenticación */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
      />

      {/* Menú lateral */}
      <div className={`side-menu ${menuOpen ? "open" : ""}`}>
        <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeLinecap="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M4 6l16 0" />
            <path d="M4 12l16 0" />
            <path d="M4 18l16 0" />
          </svg>
        </div>
        <ul>
          {user ? (
            <>
              <li className="menu-user">Hola, {user.username}</li>
              <li>Perfil</li>
              <li>Mensajes</li>
              <li>Ajustes</li>
              <li onClick={handleLogout}>Cerrar sesión</li>
            </>
          ) : (
            <>
              <li onClick={() => { setAuthModalOpen(true); setMenuOpen(false); }}>
                Iniciar sesión
              </li>
              <li>Ajustes</li>
            </>
          )}
        </ul>
      </div>

      {/* Header */}
      <div className="header">
        {/* Icono menú */}
        <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeLinecap="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M4 6l16 0" />
            <path d="M4 12l16 0" />
            <path d="M4 18l16 0" />
          </svg>
        </div>

        {/* Barra de búsqueda */}
        <div className="search-bar">
          <input type="text" placeholder="Buscar..." />
        </div>

        {/* Botón crear / login */}
        <div className="create-button" onClick={handleCreateClick}>
          {user ? (
            // Icono de crear post (usuario logueado)
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          ) : (
            // Icono de login (usuario no logueado)
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
              <path d="M20 12h-13l3 -3m0 6l-3 -3" />
            </svg>
          )}
        </div>

        {/* Avatar */}
        <Link to="/perfil">
          <div className="user-icon">
            <img
              className="profile-avatar-img"
              src={user?.avatar || "/images/fotoPerfilEjemplo.jpg"}
              alt="Foto perfil usuario"
            />
          </div>
        </Link>
      </div>

      {/* Contenedor de posts */}
      <div className="container">
        {posts.map((post, index) => (
          <Post
            key={index}
            title={post.title}
            content={post.content}
            image={post.img}
            likes={post.likes}
            comments={post.comments}
          />
        ))}
      </div>
    </>
  );
};

export default Home;