// src/pages/AdminArticles.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminArticles.css";

const AdminArticles = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    title: "",
    summary: "",
    content: "",
    category: "",
  });
  const [coverImage, setCoverImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      // Verificar que es admin
      if (userData.role !== "ADMIN") {
        navigate("/articulos");
      }
    } else {
      navigate("/");
    }

    // Cargar categorías
    fetch("https://talkpoint-api.onrender.com/api/articles/categories")
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setForm(prev => ({ ...prev, category: data[0] }));
      })
      .catch(err => console.error(err));
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!form.title || !form.summary || !form.content || !form.category) {
      setError("Todos los campos son obligatorios");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("summary", form.summary);
      formData.append("content", form.content);
      formData.append("category", form.category);
      formData.append("userId", user.id);
      
      if (coverImage) {
        formData.append("coverImage", coverImage);
      }

      const res = await fetch("https://talkpoint-api.onrender.com/api/articles", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al crear artículo");
      }

      setSuccess(true);
      setForm({ title: "", summary: "", content: "", category: categories[0] });
      setCoverImage(null);
      setImagePreview(null);

      // Redirigir al artículo creado
      setTimeout(() => navigate(`/articulos/${data.id}`), 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Plantillas predefinidas
  const templates = [
    {
      name: "Noticia",
      content: `<p><strong>INTRODUCCIÓN</strong> - Describe brevemente la noticia aquí.</p>

<h2>¿Qué ha pasado?</h2>
<p>Explica los detalles principales del acontecimiento.</p>

<h2>¿Por qué es importante?</h2>
<p>Contexto y relevancia para el sector tecnológico.</p>

<h2>¿Qué opinan los expertos?</h2>
<p>Incluye citas o referencias de expertos si las hay.</p>

<h2>Conclusión</h2>
<p>Resumen y perspectivas futuras.</p>`
    },
    {
      name: "Review",
      content: `<p><strong>RESUMEN:</strong> Breve descripción del producto analizado.</p>

<h2>Especificaciones</h2>
<ul>
  <li><strong>Característica 1:</strong> Valor</li>
  <li><strong>Característica 2:</strong> Valor</li>
  <li><strong>Precio:</strong> XXX €</li>
</ul>

<h2>Diseño y construcción</h2>
<p>Describe el aspecto físico y calidad de materiales.</p>

<h2>Rendimiento</h2>
<p>¿Cómo funciona en el día a día?</p>

<h2>Puntos positivos</h2>
<ul>
  <li>Punto 1</li>
  <li>Punto 2</li>
</ul>

<h2>Puntos negativos</h2>
<ul>
  <li>Punto 1</li>
  <li>Punto 2</li>
</ul>

<h2>Veredicto final</h2>
<p>¿Merece la pena? ¿Para quién es recomendable?</p>

<p><strong>Puntuación: X/10</strong></p>`
    },
    {
      name: "Tutorial",
      content: `<p><strong>¿Qué aprenderás?</strong> Breve descripción del tutorial.</p>

<h2>Requisitos previos</h2>
<ul>
  <li>Requisito 1</li>
  <li>Requisito 2</li>
</ul>

<h2>Paso 1: Título del paso</h2>
<p>Explicación detallada del primer paso.</p>

<h2>Paso 2: Título del paso</h2>
<p>Explicación detallada del segundo paso.</p>

<h2>Paso 3: Título del paso</h2>
<p>Explicación detallada del tercer paso.</p>

<h2>Resultado final</h2>
<p>Qué deberías haber conseguido al final.</p>

<h2>Problemas comunes</h2>
<p>Soluciones a errores frecuentes.</p>`
    }
  ];

  const applyTemplate = (template) => {
    if (form.content && !window.confirm("¿Reemplazar el contenido actual?")) {
      return;
    }
    setForm({ ...form, content: template.content });
  };

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <button className="back-btn" onClick={() => navigate("/articulos")}>
          ← Volver
        </button>
        <h1>Crear Artículo</h1>
      </div>

      {/* Plantillas */}
      <div className="templates-section">
        <h3>Plantillas rápidas:</h3>
        <div className="templates-buttons">
          {templates.map(t => (
            <button 
              key={t.name} 
              className="template-btn"
              onClick={() => applyTemplate(t)}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="article-form">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">¡Artículo creado correctamente!</div>}

        <div className="form-group">
          <label>Título</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Título del artículo"
          />
        </div>

        <div className="form-group">
          <label>Categoría</label>
          <select name="category" value={form.category} onChange={handleChange}>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Resumen (para la preview)</label>
          <textarea
            name="summary"
            value={form.summary}
            onChange={handleChange}
            placeholder="Breve descripción del artículo (máx 500 caracteres)"
            rows={3}
            maxLength={500}
          />
        </div>

        <div className="form-group">
          <label>Imagen de portada</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Contenido (HTML permitido)</label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            placeholder="Escribe el contenido del artículo..."
            rows={15}
          />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Publicando..." : "Publicar artículo"}
        </button>
      </form>
    </div>
  );
};

export default AdminArticles;