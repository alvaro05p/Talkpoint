package com.foro.backend.repository;

import com.foro.backend.model.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    
    // Verificar si un usuario ya dio like a un post
    boolean existsByUserIdAndPostId(Long userId, Long postId);
    
    // Buscar like específico para eliminarlo
    Optional<PostLike> findByUserIdAndPostId(Long userId, Long postId);
    
    // Obtener todos los posts que un usuario ha likeado
    List<PostLike> findByUserId(Long userId);
    
    // Contar likes de un post
    int countByPostId(Long postId);
}