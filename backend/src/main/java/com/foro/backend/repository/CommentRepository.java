package com.foro.backend.repository;

import com.foro.backend.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    // Obtener comentarios principales (sin padre) de un post
    List<Comment> findByPostIdAndParentIsNullOrderByCreatedAtDesc(Long postId);
    
    // Obtener respuestas de un comentario
    List<Comment> findByParentIdOrderByCreatedAtAsc(Long parentId);
    
    // Contar comentarios de un post (incluye respuestas)
    int countByPostId(Long postId);
    
    // Obtener comentarios de un usuario
    List<Comment> findByUserIdOrderByCreatedAtDesc(Long userId);
}