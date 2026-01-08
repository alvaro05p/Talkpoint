// src/pages/Articles.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Articles.css";

const ArticleCard = ({ article }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <Link to={`/articulos/${article.id}`} className="article-card">
      <div className="article-card-image">
        {article.coverImage ? (
          <img src={article.coverImage} alt={article.title} />
        ) : (
          <div className="article-placeholder">📰</div>
        )}
        <span className="article-category">{article.category}</span>
      </div>
      <div className="article-card-body">
        <h3 className="article-card-title">{article.title}</h3>
        <p className="article-card-summary">{article.summary}</p>
        <div className="article-card-meta">
          <span className="article-author">{article.authorName}</span>
          <span className="article-date">{formatDate(article.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
};

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Cargar categorías
    fetch("http://localhost:8080/api/articles/categories")
      .then(res => res.json())
      .then(data => setCategories(["Todas", ...data]))
      .catch(err => console.error(err));

    // Cargar artículos
    loadArticles();
  }, []);

  const loadArticles = (category = null) => {
    setLoading(true);
    const url = category && category !== "Todas"
      ? `http://localhost:8080/api/articles/category/${encodeURIComponent(category)}`
      : "http://localhost:8080/api/articles";

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setArticles(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    loadArticles(category);
  };

  return (
    <div className="articles-page">
      {/* Header */}
      <div className="articles-header">
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Volver al feed
        </button>
        <h1>Artículos de Tecnología</h1>
        {user?.role === "ADMIN" && (
          <Link to="/admin/articulos" className="btn btn-primary">
            + Crear artículo
          </Link>
        )}
      </div>

      {/* Filtro de categorías */}
      <div className="categories-filter">
        {categories.map(cat => (
          <button
            key={cat}
            className={`category-btn ${selectedCategory === cat ? "active" : ""}`}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Lista de artículos */}
      <div className="articles-grid">
        {loading ? (
          <p className="loading-text">Cargando artículos...</p>
        ) : articles.length > 0 ? (
          articles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))
        ) : (
          <p className="empty-text">No hay artículos en esta categoría</p>
        )}
      </div>
    </div>
  );
};

export default Articles;