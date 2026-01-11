// Home.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Post from "../components/Post";
import CreatePostModal from "../components/CreatePostModal";
import AuthModal from "../components/AuthModal";

const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const postRefs = useRef({});

  // Cargar usuario de localStorage al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Cargar posts
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const userId = savedUser ? JSON.parse(savedUser).id : null;
    
    const url = userId 
      ? `https://talkpoint-api.onrender.com/?userId=${userId}`
      : "https://talkpoint-api.onrender.com";
    
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        
        // Scroll al post si viene en la URL
        const postId = searchParams.get("post");
        if (postId) {
          setTimeout(() => {
            const element = postRefs.current[postId];
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "center" });
              element.classList.add("highlight-post");
              setTimeout(() => element.classList.remove("highlight-post"), 2000);
            }
            // Limpiar el parámetro de la URL
            navigate("/", { replace: true });
          }, 100);
        }
      })
      .catch((err) => console.error("Error al cargar posts:", err));
  }, [user, searchParams]);

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

  const handleLikeUpdate = (postId, newLikes, likedByUser) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: newLikes, likedByUser }
        : post
    ));
  };

  const handleCommentUpdate = (postId, newComments) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, comments: newComments }
        : post
    ));
  };

  return (
    <>
      {/* Modal para crear post */}
      <CreatePostModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onPostCreated={handlePostCreated}
        userId={user?.id}
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
              <li className="menu-user">Hola, {user.displayName || user.username}</li>
              <li><Link to="/perfil" style={{color: 'inherit', textDecoration: 'none'}}>Perfil</Link></li>
              <li><Link to="/articulos" style={{color: 'inherit', textDecoration: 'none'}}>Artículos</Link></li>
              {user.role === "ADMIN" && (
                <li><Link to="/admin/articulos" style={{color: 'inherit', textDecoration: 'none'}}>Crear Artículo</Link></li>
              )}
              <li>Mensajes</li>
              <li>Ajustes</li>
              <li onClick={handleLogout}>Cerrar sesión</li>
            </>
          ) : (
            <>
              <li onClick={() => { setAuthModalOpen(true); setMenuOpen(false); }}>
                Iniciar sesión
              </li>
              <li><Link to="/articulos" style={{color: 'inherit', textDecoration: 'none'}}>Artículos</Link></li>
              <li>Ajustes</li>
            </>
          )}
        </ul>
      </div>

      {/* Header */}
      <div className="header">
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

        <div className="search-bar">
          <input type="text" placeholder="Buscar..." />
        </div>

        {/* Botón crear - disabled sin sesión */}
        <div 
          className={`create-button ${!user ? "disabled" : ""}`}
          onClick={() => user && setModalOpen(true)}
        >
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
        </div>

        {/* Avatar - login si no hay sesión */}
        {user ? (
          <Link to="/perfil">
            <div className="user-icon">
              <img
                className="profile-avatar-img"
                src={user.avatar || "/images/fotoPerfilEjemplo.jpg"}
                alt="Foto perfil usuario"
              />
            </div>
          </Link>
        ) : (
          <div className="user-icon" onClick={() => setAuthModalOpen(true)}>
            <img
              className="profile-avatar-img"
              src="/images/fotoPerfilEjemplo.jpg"
              alt="Foto perfil usuario"
            />
          </div>
        )}
      </div>

      {/* Banner de anuncio superior */}
      <div className="ad-container ad-banner">
        <span className="ad-label">Publicidad</span>
        {/* Aquí irá el código de AdSense */}
        <div className="ad-placeholder">Espacio para anuncio</div>
      </div>

      {/* Contenedor de posts */}
      <div className="container">
        {posts.map((post, index) => (
          <React.Fragment key={post.id}>
            <div ref={el => postRefs.current[post.id] = el}>
              <Post
                id={post.id}
                title={post.title}
                content={post.content}
                image={post.img}
                likes={post.likes}
                comments={post.comments}
                likedByUser={post.likedByUser}
                userId={user?.id}
                onLikeUpdate={handleLikeUpdate}
                onCommentUpdate={handleCommentUpdate}
              />
            </div>
            {/* Anuncio cada 3 posts */}
            {(index + 1) % 3 === 0 && (
              <div className="ad-container ad-inline">
                <span className="ad-label">Publicidad</span>
                <div className="ad-placeholder">Espacio para anuncio</div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </>
  );
};

export default Home;