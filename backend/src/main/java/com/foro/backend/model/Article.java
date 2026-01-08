package com.foro.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Article {

    @Id
    @GeneratedValue
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 500)
    private String summary; // Resumen corto para la preview

    @Column(columnDefinition = "TEXT")
    private String content; // Contenido completo (puede ser HTML)

    private String coverImage; // Imagen de portada

    private String category; // IA, Smartphones, Gaming, etc.

    private LocalDateTime createdAt;

    private boolean published = true;

    @ManyToOne
    @JoinColumn(name = "author_id")
    private User author;

    public Article() {
        this.createdAt = LocalDateTime.now();
    }

    public Article(String title, String summary, String content, String coverImage, String category, User author) {
        this.title = title;
        this.summary = summary;
        this.content = content;
        this.coverImage = coverImage;
        this.category = category;
        this.author = author;
        this.createdAt = LocalDateTime.now();
    }

    // Getters y Setters
    public Long getId() { return id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public String getCoverImage() { return coverImage; }
    public void setCoverImage(String coverImage) { this.coverImage = coverImage; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public boolean isPublished() { return published; }
    public void setPublished(boolean published) { this.published = published; }
    
    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }
}