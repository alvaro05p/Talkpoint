// src/components/Post.jsx
import React, { useState } from "react";

const API_URL = "https://talkpoint-api.onrender.com/api/posts";

const Post = ({
  id,
  title,
  content,
  image,
  likes,
  comments,
  likedByUser,
  userId,
  onLikeUpdate,
  onCommentUpdate
}) => {
  const [currentLikes, setCurrentLikes] = useState(likes);
  const [currentComments, setCurrentComments] = useState(comments);
  const [isLiked, setIsLiked] = useState(likedByUser);
  const [isLoading, setIsLoading] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

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
      const res = await fetch(
        `${API_URL}/${id}/like?userId=${userId}`,
        { method: "POST" }
      );

      if (res.ok) {
        const updatedPost = await res.json();
        setCurrentLikes(updatedPost.likes);
        setIsLiked(updatedPost.likedByUser);
        onLikeUpdate?.(id, updatedPost.likes, updatedPost.likedByUser);
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
        const res = await fetch(`${API_URL}/${id}/comments`);
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
    setShowComments(prev => !prev);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!userId || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`${API_URL}/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          content: newComment.trim()
        })
      });

      if (res.ok) {
        const comment = await res.json();
        comment.replies = [];
        setCommentsList(prev => [comment, ...prev]);
        setCurrentComments(prev => prev + 1);
        setNewComment("");
        onCommentUpdate?.(id, currentComments + 1);
      }
    } catch (err) {
      console.error("Error al comentar:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSubmitReply = async (parentId) => {
    if (!userId || !replyContent.trim()) return;

    try {
      const res = await fetch(`${API_URL}/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          content: replyContent.trim(),
          parentId
        })
      });

      if (res.ok) {
        const reply = await res.json();
        setCommentsList(prev =>
          prev.map(comment =>
            comment.id === parentId
              ? { ...comment, replies: [...(comment.replies || []), reply] }
              : comment
          )
        );
        setCurrentComments(prev => prev + 1);
        setReplyingTo(null);
        setReplyContent("");
        onCommentUpdate?.(id, currentComments + 1);
      }
    } catch (err) {
      console.error("Error al responder:", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("¿Eliminar este comentario?")) return;

    try {
      const res = await fetch(
        `${API_URL}/${id}/comments/${commentId}?userId=${userId}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        setCommentsList(prev => prev.filter(c => c.id !== commentId));
        setCurrentComments(prev => Math.max(0, prev - 1));
        onCommentUpdate?.(id, Math.max(0, currentComments - 1));
      }
    } catch (err) {
      console.error("Error al eliminar comentario:", err);
    }
  };

  return (
    <div className="post">
      {/* resto del JSX igual */}
    </div>
  );
};

export default Post;
