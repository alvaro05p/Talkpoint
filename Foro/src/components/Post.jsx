// src/components/Post.jsx
import React, { useState } from "react";

const Post = ({ id, title, content, image, likes, comments, likedByUser, userId, onLikeUpdate, onCommentUpdate }) => {
  const [currentLikes, setCurrentLikes] = useState(likes);
  const [currentComments, setCurrentComments] = useState(comments);
  const [isLiked, setIsLiked] = useState(likedByUser);
  const [isLoading, setIsLoading] = useState(false);
  
  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  
  // Para respuestas
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  const handleLike = async () => {
    if (!userId) {
      alert("Inicia sesión para dar like");
      return;
    }
    if (isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch(`http://localhost:8080/api/posts/${id}/like?userId=${userId}`, {
        method: "POST",
      });
      if (res.ok) {
        const updatedPost = await res.json();
        setCurrentLikes(updatedPost.likes);
        setIsLiked(updatedPost.likedByUser);
        if (onLikeUpdate) onLikeUpdate(id, updatedPost.likes, updatedPost.likedByUser);
      }
    } catch (err) {
      console.error("Error al dar like:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleComments = async () => {
    if (!showComments) {
      setLoadingComments(true);
      try {
        const res = await fetch(`http://localhost:8080/api/posts/${id}/comments`);
        if (res.ok) {
          const data = await res.json();
          setCommentsList(data);
        }
      } catch (err) {
        console.error("Error al cargar comentarios:", err);
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!userId) {
      alert("Inicia sesión para comentar");
      return;
    }
    if (!newComment.trim()) return;
    
    setSubmittingComment(true);
    try {
      const res = await fetch(`http://localhost:8080/api/posts/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, content: newComment.trim() })
      });
      if (res.ok) {
        const comment = await res.json();
        comment.replies = [];
        setCommentsList([comment, ...commentsList]);
        setCurrentComments(currentComments + 1);
        setNewComment("");
        if (onCommentUpdate) onCommentUpdate(id, currentComments + 1);
      }
    } catch (err) {
      console.error("Error al comentar:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSubmitReply = async (parentId) => {
    if (!userId) {
      alert("Inicia sesión para responder");
      return;
    }
    if (!replyContent.trim()) return;

    try {
      const res = await fetch(`http://localhost:8080/api/posts/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, content: replyContent.trim(), parentId })
      });
      if (res.ok) {
        const reply = await res.json();
        // Añadir la respuesta al comentario padre
        setCommentsList(commentsList.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), reply]
            };
          }
          return comment;
        }));
        setCurrentComments(currentComments + 1);
        setReplyingTo(null);
        setReplyContent("");
        if (onCommentUpdate) onCommentUpdate(id, currentComments + 1);
      }
    } catch (err) {
      console.error("Error al responder:", err);
    }
  };

  const handleDeleteComment = async (commentId, isReply = false, parentId = null) => {
    if (!window.confirm("¿Eliminar este comentario?")) return;

    try {
      const res = await fetch(`http://localhost:8080/api/posts/${id}/comments/${commentId}?userId=${userId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        if (isReply && parentId) {
          // Eliminar respuesta
          setCommentsList(commentsList.map(comment => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: comment.replies.filter(r => r.id !== commentId)
              };
            }
            return comment;
          }));
          setCurrentComments(Math.max(0, currentComments - 1));
        } else {
          // Eliminar comentario principal y sus respuestas
          const comment = commentsList.find(c => c.id === commentId);
          const repliesCount = comment?.replies?.length || 0;
          setCommentsList(commentsList.filter(c => c.id !== commentId));
          setCurrentComments(Math.max(0, currentComments - 1 - repliesCount));
        }
        if (onCommentUpdate) onCommentUpdate(id, Math.max(0, currentComments - 1));
      }
    } catch (err) {
      console.error("Error al eliminar comentario:", err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const CommentItem = ({ comment, isReply = false, parentId = null }) => (
    <div className={`comment ${isReply ? "comment-reply" : ""}`}>
      <div className="comment-avatar">
        <img 
          src={comment.author?.avatar || "/images/fotoPerfilEjemplo.jpg"} 
          alt={comment.author?.username}
        />
      </div>
      <div className="comment-body">
        <div className="comment-header">
          <span className="comment-author">
            {comment.author?.displayName || comment.author?.username}
          </span>
          <span className="comment-date">{formatDate(comment.createdAt)}</span>
        </div>
        <p className="comment-content">{comment.content}</p>
        
        {/* Botones de acción */}
        <div className="comment-actions">
          {userId && !isReply && (
            <button 
              className="reply-btn"
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            >
              💬 Responder
            </button>
          )}
          {userId === comment.author?.id && (
            <button 
              className="delete-btn"
              onClick={() => handleDeleteComment(comment.id, isReply, parentId)}
            >
              🗑️ Eliminar
            </button>
          )}
        </div>

        {/* Formulario de respuesta */}
        {replyingTo === comment.id && (
          <div className="reply-form">
            <input
              type="text"
              placeholder={`Responder a ${comment.author?.displayName || comment.author?.username}...`}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              autoFocus
            />
            <div className="reply-form-buttons">
              <button onClick={() => { setReplyingTo(null); setReplyContent(""); }}>
                Cancelar
              </button>
              <button 
                onClick={() => handleSubmitReply(comment.id)}
                disabled={!replyContent.trim()}
                className="submit-reply"
              >
                Responder
              </button>
            </div>
          </div>
        )}

        {/* Respuestas anidadas */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="replies-list">
            {comment.replies.map(reply => (
              <CommentItem 
                key={reply.id} 
                comment={reply} 
                isReply={true}
                parentId={comment.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="post">
      <div className="post-header">
        <h2 className="post-title">{title}</h2>
        <div className="expand-icon">▼</div>
      </div>

      {image && (
        <div className="post-image">
          <img src={image} alt={title} />
        </div>
      )}

      <div className="post-content">{content}</div>

      <div className="post-actions">
        <div 
          className={`action-button ${isLiked ? "liked" : ""} ${isLoading ? "loading" : ""}`}
          onClick={handleLike}
        >
          <span className="action-icon">{isLiked ? "❤️" : "🤍"}</span>
          <span>{currentLikes}</span>
        </div>
        <div className="action-button" onClick={toggleComments}>
          <span className="action-icon">💬</span>
          <span>{currentComments}</span>
        </div>
      </div>

      {showComments && (
        <div className="comments-section">
          {userId && (
            <form onSubmit={handleSubmitComment} className="comment-form">
              <input
                type="text"
                placeholder="Escribe un comentario..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={submittingComment}
              />
              <button type="submit" disabled={submittingComment || !newComment.trim()}>
                {submittingComment ? "..." : "Enviar"}
              </button>
            </form>
          )}

          <div className="comments-list">
            {loadingComments ? (
              <p className="loading-text">Cargando comentarios...</p>
            ) : commentsList.length > 0 ? (
              commentsList.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))
            ) : (
              <p className="no-comments">No hay comentarios aún</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;