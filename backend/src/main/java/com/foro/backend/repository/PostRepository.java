package com.foro.backend.repository;

import com.foro.backend.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    List<Post> findAllByOrderByIdDesc();
    
    // Posts de un usuario específico
    List<Post> findByUserIdOrderByIdDesc(Long userId);
    
    // Contar posts de un usuario
    int countByUserId(Long userId);
}