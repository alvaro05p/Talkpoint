package com.foro.backend.controller;

import com.foro.backend.model.Post;
import com.foro.backend.model.User;
import com.foro.backend.repository.PostRepository;
import com.foro.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:5173")
public class PostController {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    
    private final String UPLOAD_DIR = "uploads/";

    public PostController(PostRepository postRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    // GET - Obtener todos los posts
    @GetMapping
    public List<Map<String, Object>> getAllPosts() {
        return postRepository.findAllByOrderByIdDesc().stream()
            .map(this::buildPostResponse)
            .collect(Collectors.toList());
    }

    // GET - Obtener posts de un usuario
    @GetMapping("/user/{userId}")
    public List<Map<String, Object>> getPostsByUser(@PathVariable Long userId) {
        return postRepository.findByUserIdOrderByIdDesc(userId).stream()
            .map(this::buildPostResponse)
            .collect(Collectors.toList());
    }

    // POST - Crear nuevo post
    @PostMapping
    public ResponseEntity<?> createPost(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "userId", required = false) Long userId) {
        
        String imagePath = null;
        
        if (image != null && !image.isEmpty()) {
            try {
                Path uploadPath = Paths.get(UPLOAD_DIR);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                
                String originalFilename = image.getOriginalFilename();
                String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                String newFilename = UUID.randomUUID().toString() + extension;
                
                Path filePath = uploadPath.resolve(newFilename);
                Files.copy(image.getInputStream(), filePath);
                
                imagePath = "http://localhost:8080/uploads/" + newFilename;
                
            } catch (IOException e) {
                return ResponseEntity.internalServerError().build();
            }
        }
        
        Post newPost = new Post(title, content, 0, 0, imagePath);
        
        if (userId != null) {
            var userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                newPost.setUser(userOpt.get());
            }
        }
        
        Post savedPost = postRepository.save(newPost);
        
        return ResponseEntity.ok(buildPostResponse(savedPost));
    }

    // Construir respuesta de post con info del autor
    private Map<String, Object> buildPostResponse(Post post) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", post.getId());
        response.put("title", post.getTitle());
        response.put("content", post.getContent());
        response.put("likes", post.getLikes());
        response.put("comments", post.getComments());
        response.put("img", post.getImg());
        
        // Incluir info del autor si existe
        if (post.getUser() != null) {
            Map<String, Object> author = new HashMap<>();
            author.put("id", post.getUser().getId());
            author.put("username", post.getUser().getUsername());
            author.put("displayName", post.getUser().getDisplayName());
            author.put("avatar", post.getUser().getAvatar());
            response.put("author", author);
        }
        
        return response;
    }

    @PostConstruct
    public void init() {
        if (postRepository.count() == 0) {
            postRepository.save(new Post("Post 1", "Contenido de prueba 1", 10, 5, null));
            postRepository.save(new Post("Post 2", "Contenido de prueba 2", 7, 2, null));
            postRepository.save(new Post("Post 3", "Contenido de prueba 3", 15, 9, null));
        }
    }
}