package com.foro.backend.controller;

import com.foro.backend.model.Comment;
import com.foro.backend.model.Post;
import com.foro.backend.repository.CommentRepository;
import com.foro.backend.repository.PostRepository;
import com.foro.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:5173")
public class CommentController {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public CommentController(CommentRepository commentRepository, PostRepository postRepository, UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    // GET - Obtener comentarios de un post (con respuestas anidadas)
    @GetMapping("/{postId}/comments")
    public ResponseEntity<?> getComments(@PathVariable Long postId) {
        var postOpt = postRepository.findById(postId);
        
        if (postOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // Obtener solo comentarios principales (sin padre)
        List<Comment> mainComments = commentRepository.findByPostIdAndParentIsNullOrderByCreatedAtDesc(postId);
        
        List<Map<String, Object>> response = new ArrayList<>();
        for (Comment comment : mainComments) {
            response.add(buildCommentWithReplies(comment));
        }

        return ResponseEntity.ok(response);
    }

    // POST - Crear comentario o respuesta
    @PostMapping("/{postId}/comments")
    public ResponseEntity<?> createComment(
            @PathVariable Long postId,
            @RequestBody Map<String, Object> body) {
        
        var postOpt = postRepository.findById(postId);
        if (postOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Long userId = ((Number) body.get("userId")).longValue();
        String content = (String) body.get("content");
        Long parentId = body.get("parentId") != null ? ((Number) body.get("parentId")).longValue() : null;

        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El comentario no puede estar vacío"));
        }

        var userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Usuario no encontrado"));
        }

        Post post = postOpt.get();
        Comment comment;

        // Si es una respuesta, buscar el comentario padre
        if (parentId != null) {
            var parentOpt = commentRepository.findById(parentId);
            if (parentOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Comentario padre no encontrado"));
            }
            comment = new Comment(content.trim(), post, userOpt.get(), parentOpt.get());
        } else {
            comment = new Comment(content.trim(), post, userOpt.get());
        }

        Comment savedComment = commentRepository.save(comment);

        // Actualizar contador de comentarios del post
        post.setComments(post.getComments() + 1);
        postRepository.save(post);

        return ResponseEntity.ok(buildCommentResponse(savedComment));
    }

    // DELETE - Eliminar comentario
    @DeleteMapping("/{postId}/comments/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @RequestParam Long userId) {
        
        var commentOpt = commentRepository.findById(commentId);
        
        if (commentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Comment comment = commentOpt.get();

        if (!comment.getUser().getId().equals(userId)) {
            return ResponseEntity.status(403).body(Map.of("error", "No puedes eliminar este comentario"));
        }

        // Contar respuestas para actualizar el contador correctamente
        List<Comment> replies = commentRepository.findByParentIdOrderByCreatedAtAsc(commentId);
        int totalToDelete = 1 + replies.size();

        // Eliminar respuestas primero
        commentRepository.deleteAll(replies);

        // Actualizar contador del post
        var postOpt = postRepository.findById(postId);
        if (postOpt.isPresent()) {
            Post post = postOpt.get();
            post.setComments(Math.max(0, post.getComments() - totalToDelete));
            postRepository.save(post);
        }

        commentRepository.delete(comment);

        return ResponseEntity.ok(Map.of("message", "Comentario eliminado"));
    }

    // Construir comentario con sus respuestas
    private Map<String, Object> buildCommentWithReplies(Comment comment) {
        Map<String, Object> response = buildCommentResponse(comment);
        
        // Obtener respuestas
        List<Comment> replies = commentRepository.findByParentIdOrderByCreatedAtAsc(comment.getId());
        List<Map<String, Object>> repliesList = new ArrayList<>();
        
        for (Comment reply : replies) {
            repliesList.add(buildCommentResponse(reply));
        }
        
        response.put("replies", repliesList);
        return response;
    }

    private Map<String, Object> buildCommentResponse(Comment comment) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", comment.getId());
        response.put("content", comment.getContent());
        response.put("createdAt", comment.getCreatedAt().toString());
        response.put("parentId", comment.getParent() != null ? comment.getParent().getId() : null);

        if (comment.getUser() != null) {
            Map<String, Object> author = new HashMap<>();
            author.put("id", comment.getUser().getId());
            author.put("username", comment.getUser().getUsername());
            author.put("displayName", comment.getUser().getDisplayName());
            author.put("avatar", comment.getUser().getAvatar());
            response.put("author", author);
        }

        return response;
    }
}