package com.foro.backend.repository;

import com.foro.backend.model.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {
    
    // Artículos publicados ordenados por fecha
    List<Article> findByPublishedTrueOrderByCreatedAtDesc();
    
    // Artículos por categoría
    List<Article> findByCategoryAndPublishedTrueOrderByCreatedAtDesc(String category);
    
    // Buscar por título
    List<Article> findByTitleContainingIgnoreCaseAndPublishedTrue(String title);
}