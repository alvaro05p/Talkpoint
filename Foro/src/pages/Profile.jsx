// src/pages/Profile.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";


// Componente para un post dentro del perfil
const ProfilePost = ({ title, excerpt, likes, comments }) => {
  return (
    <div className="post-card">
      <div className="post-image">
        <div className="cloud"></div>
      </div>
      <h3 className="post-title">{title}</h3>
      <p className="post-excerpt">{excerpt}</p>
      <div className="post-stats">
        <span className="post-stat">👍 {likes}</span>
        <span className="post-stat">💬 {comments}</span>
      </div>
    </div>
  );
};
const PostLike = ({ title, user, date }) => {
  return (
    <div className="post-card">
      <div className="post-image">
        <div className="cloud"></div>
      </div>
      <h3 className="post-title">{title}</h3>
      <p className="post-excerpt">Le gustó a {user} el {date}</p>
      <div className="post-stats">
        <span className="post-stat">💖 {Math.floor(Math.random() * 5000)}</span>
      </div>
    </div>
  );
};

const PostResponse = ({ title, user, comment }) => {
  return (
    <div className="post-card">
      <div className="post-image">
        <div className="cloud"></div>
      </div>
      <h3 className="post-title">{title}</h3>
      <p className="post-excerpt">{user} respondió: "{comment}"</p>
      <div className="post-stats">
        <span className="post-stat">💬 {Math.floor(Math.random() * 200)}</span>
      </div>
    </div>
  );
};



const Profile = () => {
  const navigate = useNavigate(); // Hook para navegación
  const [activeTab, setActiveTab] = useState("Posts"); // <-- aquí dentro

  const posts = [
    { title: "Post 1", excerpt: "Lorem Ipsum is simply dummy text...", likes: 3923, comments: 233 },
    { title: "Post 2", excerpt: "Lorem Ipsum is simply dummy text...", likes: 2845, comments: 156 },
    { title: "Post 3", excerpt: "Lorem Ipsum is simply dummy text...", likes: 4521, comments: 389 },
    { title: "Post 4", excerpt: "Lorem Ipsum is simply dummy text...", likes: 1892, comments: 98 },
    { title: "Post 5", excerpt: "Lorem Ipsum is simply dummy text...", likes: 5234, comments: 412 },
    { title: "Post 6", excerpt: "Lorem Ipsum is simply dummy text...", likes: 3156, comments: 201 },
  ];

  const likesData = [
    { title: "Post sobre React", user: "Ana", date: "28/12/2025" },
    { title: "Tutorial de CSS", user: "Carlos", date: "27/12/2025" },
  ];

  const responsesData = [
    { title: "Post sobre React", user: "Lucía", comment: "¡Muy útil, gracias!" },
    { title: "Tutorial de CSS", user: "Miguel", comment: "No entendí la parte de flexbox 😅" },
  ];


  return (

    <div className="container">
      <button 
        className="btn btn-secondary" 
        style={{ marginBottom: "20px" }}
        onClick={() => navigate(-1)} // Volver a la página anterior
      >
        ← Volver
      </button>

      <div className="profile-header">
        <div className="profile-top">
          <div className="profile-avatar"><img className="profile-avatar-img" src="/images/fotoPerfilEjemplo.jpg" alt="Foto perfil usuario" /></div>
          <div className="profile-info">
            <h1 className="profile-name">Juan Pérez</h1>
            <p className="profile-username">@juanperez</p>

            <div className="profile-stats">
              <div className="stat-item">
                <div className="stat-number">245</div>
                <div className="stat-label">Posts</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">1.2K</div>
                <div className="stat-label">Seguidores</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">892</div>
                <div className="stat-label">Siguiendo</div>
              </div>
            </div>

            <div className="profile-actions">
              <button className="btn btn-primary">Seguir</button>
              <button className="btn btn-secondary">Mensaje</button>
              <button className="btn btn-secondary">Más</button>
            </div>
          </div>
        </div>

        <div className="profile-bio">
          Apasionado por la tecnología y el diseño. Compartiendo mi viaje creativo y proyectos personales. 📍 Valencia, España | 💼 Diseñador Web
        </div>
      </div>

      <div className="profile-tabs">
        <div className="tabs">
          <div 
            className={`tab ${activeTab === "Posts" ? "active" : ""}`} 
            onClick={() => setActiveTab("Posts")}
          >
            Posts
          </div>

          <div 
            className={`tab ${activeTab === "Likes" ? "active" : ""}`} 
            onClick={() => setActiveTab("Likes")}
          >
            Likes
          </div>

          <div 
            className={`tab ${activeTab === "Respuestas" ? "active" : ""}`} 
            onClick={() => setActiveTab("Respuestas")}
          >
            Respuestas
          </div>
        </div>
      </div>


      <div className="posts-grid">
        {activeTab === "Posts" &&
          posts.map((post, index) => (
            <ProfilePost
              key={index}
              title={post.title}
              excerpt={post.excerpt}
              likes={post.likes}
              comments={post.comments}
            />
          ))
        }

        {activeTab === "Likes" &&
          likesData.map((like, index) => (
            <PostLike
              key={index}
              title={like.title}
              user={like.user}
              date={like.date}
            />
          ))
        }

        {activeTab === "Respuestas" &&
          responsesData.map((response, index) => (
            <PostResponse
              key={index}
              title={response.title}
              user={response.user}
              comment={response.comment}
            />
          ))
        }
      </div>

    </div>
  );
};

export default Profile;
