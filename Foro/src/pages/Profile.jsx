// src/pages/Profile.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const ProfilePost = ({ title, content, img, likes, comments }) => {
  return (
    <div className="post-card">
      <div className="post-image">
        {img ? (
          <img src={img} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div className="cloud"></div>
        )}
      </div>
      <h3 className="post-title">{title}</h3>
      <p className="post-excerpt">{content}</p>
      <div className="post-stats">
        <span className="post-stat">👍 {likes}</span>
        <span className="post-stat">💬 {comments}</span>
      </div>
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Posts");
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);
  
  const [editForm, setEditForm] = useState({
    displayName: "",
    bio: "",
    location: "",
    occupation: ""
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setEditForm({
        displayName: userData.displayName || userData.username,
        bio: userData.bio || "",
        location: userData.location || "",
        occupation: userData.occupation || ""
      });
      
      fetch(`http://localhost:8080/api/posts/user/${userData.id}`)
        .then(res => res.json())
        .then(data => {
          setPosts(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error cargando posts:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/auth/user/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Error actualizando perfil:", err);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch(`http://localhost:8080/api/auth/user/${user.id}/avatar`, {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error("Error subiendo avatar:", err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num;
  };

  if (loading) {
    return <div className="container">Cargando...</div>;
  }

  if (!user) {
    return (
      <div className="container">
        <button 
          className="btn btn-secondary" 
          style={{ marginBottom: "20px" }}
          onClick={() => navigate(-1)}
        >
          ← Volver
        </button>
        <p>Debes iniciar sesión para ver tu perfil.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <button 
        className="btn btn-secondary" 
        style={{ marginBottom: "20px" }}
        onClick={() => navigate(-1)}
      >
        ← Volver
      </button>

      <div className="profile-header">
        <div className="profile-top">
          <div 
            className="profile-avatar" 
            onClick={handleAvatarClick}
            style={{ cursor: "pointer", position: "relative" }}
          >
            <img 
              className="profile-avatar-img" 
              src={user.avatar || "/images/fotoPerfilEjemplo.jpg"} 
              alt="Foto perfil usuario" 
            />
            <div className="avatar-overlay">
              {uploadingAvatar ? "⏳" : "📷"}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              style={{ display: "none" }}
            />
          </div>
          <div className="profile-info">
            {isEditing ? (
              <input
                type="text"
                name="displayName"
                value={editForm.displayName}
                onChange={handleEditChange}
                className="edit-input"
                placeholder="Nombre"
              />
            ) : (
              <h1 className="profile-name">{user.displayName || user.username}</h1>
            )}
            <p className="profile-username">@{user.username}</p>

            <div className="profile-stats">
              <div className="stat-item">
                <div className="stat-number">{user.postCount || posts.length}</div>
                <div className="stat-label">Posts</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{formatNumber(user.followers || 0)}</div>
                <div className="stat-label">Seguidores</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{formatNumber(user.following || 0)}</div>
                <div className="stat-label">Siguiendo</div>
              </div>
            </div>

            <div className="profile-actions">
              {isEditing ? (
                <>
                  <button className="btn btn-primary" onClick={handleSaveProfile}>
                    Guardar
                  </button>
                  <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                    Editar perfil
                  </button>
                  <button className="btn btn-secondary">Compartir</button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="profile-bio">
          {isEditing ? (
            <div className="edit-bio-section">
              <textarea
                name="bio"
                value={editForm.bio}
                onChange={handleEditChange}
                className="edit-textarea"
                placeholder="Escribe tu biografía..."
                rows={3}
              />
              <div className="edit-row">
                <input
                  type="text"
                  name="location"
                  value={editForm.location}
                  onChange={handleEditChange}
                  className="edit-input"
                  placeholder="📍 Ubicación"
                />
                <input
                  type="text"
                  name="occupation"
                  value={editForm.occupation}
                  onChange={handleEditChange}
                  className="edit-input"
                  placeholder="💼 Ocupación"
                />
              </div>
            </div>
          ) : (
            <>
              {user.bio || "Sin biografía aún."}
              {(user.location || user.occupation) && (
                <div style={{ marginTop: "8px" }}>
                  {user.location && <span>📍 {user.location}</span>}
                  {user.location && user.occupation && <span> | </span>}
                  {user.occupation && <span>💼 {user.occupation}</span>}
                </div>
              )}
            </>
          )}
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
        {activeTab === "Posts" && (
          posts.length > 0 ? (
            posts.map((post, index) => (
              <ProfilePost
                key={index}
                title={post.title}
                content={post.content}
                img={post.img}
                likes={post.likes}
                comments={post.comments}
              />
            ))
          ) : (
            <p>No tienes posts aún. ¡Crea tu primer post!</p>
          )
        )}

        {activeTab === "Likes" && (
          <p>Próximamente: posts que te gustaron</p>
        )}

        {activeTab === "Respuestas" && (
          <p>Próximamente: tus respuestas</p>
        )}
      </div>
    </div>
  );
};

export default Profile;