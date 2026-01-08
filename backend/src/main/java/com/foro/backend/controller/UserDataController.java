package com.foro.backend.controller;

import com.foro.backend.model.Comment;
import com.foro.backend.model.Post;
import com.foro.backend.model.PostLike;
import com.foro.backend.repository.CommentRepository;
import com.foro.backend.repository.PostRepository;
import com.foro.backend.repository.PostLikeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserDataController {

    private final PostLikeRepository postLikeRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;

    public UserDataController(PostLikeRepository postLikeRepository, PostRepository postRepository, CommentRepository commentRepository) {
        this.postLikeRepository = postLikeRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
    }

    // GET - Obtener posts que le gustaron a un usuario
    @GetMapping("/{userId}/liked-posts")
    public ResponseEntity<?> getLikedPosts(@PathVariable Long userId) {
        List<PostLike> likes = postLikeRepository.findByUserId(userId);
        List<Map<String, Object>> likedPosts = new ArrayList<>();

        for (PostLike like : likes) {
            var postOpt = postRepository.findById(like.getPostId());
            if (postOpt.isPresent()) {
                Post post = postOpt.get();
                Map<String, Object> postData = new HashMap<>();
                postData.put("id", post.getId());
                postData.put("title", post.getTitle());
                postData.put("content", post.getContent());
                postData.put("img", post.getImg());
                postData.put("likes", post.getLikes());
                postData.put("comments", post.getComments());

                if (post.getUser() != null) {
                    Map<String, Object> author = new HashMap<>();
                    author.put("id", post.getUser().getId());
                    author.put("username", post.getUser().getUsername());
                    author.put("displayName", post.getUser().getDisplayName());
                    postData.put("author", author);
                }

                likedPosts.add(postData);
            }
        }

        return ResponseEntity.ok(likedPosts);
    }

    // GET - Obtener comentarios de un usuario
    @GetMapping("/{userId}/comments")
    public ResponseEntity<?> getUserComments(@PathVariable Long userId) {
        List<Comment> comments = commentRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<Map<String, Object>> response = new ArrayList<>();

        for (Comment comment : comments) {
            Map<String, Object> commentData = new HashMap<>();
            commentData.put("id", comment.getId());
            commentData.put("content", comment.getContent());
            commentData.put("createdAt", comment.getCreatedAt().toString());

            if (comment.getPost() != null) {
                commentData.put("postId", comment.getPost().getId());
                commentData.put("postTitle", comment.getPost().getTitle());
            }

            response.add(commentData);
        }

        return ResponseEntity.ok(response);
    }
}