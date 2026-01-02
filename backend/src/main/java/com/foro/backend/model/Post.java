package com.foro.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

@Entity
public class Post {

    @Id
    @GeneratedValue
    private Long id;

    private String title;
    private String content;
    private int likes;
    private int comments;
    private String img;

    public Post() {}

    public Post(String title, String content, int likes, int comments, String img) {
        this.title = title;
        this.content = content;
        this.likes = likes;
        this.comments = comments;
        this.img=img;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public int getLikes() { return likes; }
    public void setLikes(int likes) { this.likes = likes; }
    public int getComments() { return comments; }
    public void setComments(int comments) { this.comments = comments; }
    public String getImg() { return img; }
    public void setImg(String img) { this.img = img; }
}
