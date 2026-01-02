// src/components/Post.jsx
import React from "react";

const Post = ({ title, content, image, likes, comments }) => {
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
        <div className="action-button">
          <div className="action-icon like-icon"></div>
          <span>{likes}</span>
        </div>
        <div className="action-button">
          <div className="action-icon comment-icon"></div>
          <span>{comments}</span>
        </div>
      </div>
    </div>
  );
};

export default Post;
