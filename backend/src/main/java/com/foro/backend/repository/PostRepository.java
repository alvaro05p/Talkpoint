package com.foro.backend.repository;

import com.foro.backend.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    // Obtener posts ordenados por id descendente (más recientes primero)
    List<Post> findAllByOrderByIdDesc();
}