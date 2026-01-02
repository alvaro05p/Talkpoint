import React, { useState } from "react";
import "./AuthModal.css";

const AuthModal = ({ isOpen, onClose, onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isLoginMode ? "login" : "register";
    const body = isLoginMode 
      ? { username, password }
      : { username, email, password };

    try {
      const res = await fetch(`http://localhost:8080/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error en la autenticación");
      }

      // Guardar usuario y cerrar modal
      onLogin(data);
      handleClose();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setError(null);
    setIsLoginMode(true);
    onClose();
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>{isLoginMode ? "Iniciar sesión" : "Crear cuenta"}</h2>
          <button className="modal-close" onClick={handleClose}>
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
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <input
              type="text"
              placeholder="Nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {!isLoginMode && (
            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="submit-btn auth-submit"
            disabled={loading}
          >
            {loading 
              ? "Cargando..." 
              : isLoginMode ? "Entrar" : "Registrarse"
            }
          </button>
        </form>

        {/* Toggle login/registro */}
        <div className="auth-toggle">
          {isLoginMode ? (
            <p>¿No tienes cuenta? <span onClick={toggleMode}>Regístrate</span></p>
          ) : (
            <p>¿Ya tienes cuenta? <span onClick={toggleMode}>Inicia sesión</span></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;