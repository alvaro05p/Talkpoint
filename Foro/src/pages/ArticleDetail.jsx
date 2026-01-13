// src/pages/ArticleDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Articles.css";

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://talkpoint-api.onrender.com/api/articles/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Artículo no encontrado");
        return res.json();
      })
      .then(data => {
        setArticle(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className="article-detail-page"><p>Cargando...</p></div>;
  }

  if (!article) {
    return (
      <div className="article-detail-page">
        <p>Artículo no encontrado</p>
        <button onClick={() => navigate("/articulos")}>Volver a artículos</button>
      </div>
    );
  }

  return (
    <div className="article-detail-page">
      <button className="back-btn" onClick={() => navigate("/articulos")}>
        ← Volver a artículos
      </button>

      <article className="article-content">
        {article.coverImage && (
          <div className="article-cover">
            <img src={article.coverImage} alt={article.title} />
          </div>
        )}

        <div className="article-header">
          <span className="article-category-tag">{article.category}</span>
          <h1 className="article-title">{article.title}</h1>
          <div className="article-meta">
            <span className="article-author">Por {article.authorName}</span>
            <span className="article-date">{formatDate(article.createdAt)}</span>
          </div>
        </div>

        <div 
          className="article-body"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>
    </div>
  );
};

export default ArticleDetail;