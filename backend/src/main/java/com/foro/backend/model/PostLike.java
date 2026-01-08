package com.foro.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "post_likes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"userId", "postId"})
})
public class PostLike {

    @Id
    @GeneratedValue
    private Long id;

    private Long userId;
    private Long postId;

    public PostLike() {}

    public PostLike(Long userId, Long postId) {
        this.userId = userId;
        this.postId = postId;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getPostId() { return postId; }
    public void setPostId(Long postId) { this.postId = postId; }
}