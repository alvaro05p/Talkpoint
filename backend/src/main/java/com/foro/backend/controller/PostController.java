package com.foro.backend.controller;

import com.foro.backend.model.Post;
import com.foro.backend.repository.PostRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:5173")
public class PostController {

    private final PostRepository postRepository;
    
    // Carpeta para guardar imágenes dentro del proyecto
    private final String UPLOAD_DIR = "uploads/";

    public PostController(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    // GET - Obtener todos los posts
    @GetMapping
    public List<Post> getAllPosts() {
        return postRepository.findAllByOrderByIdDesc();
    }

    // POST - Crear nuevo post
    @PostMapping
    public ResponseEntity<Post> createPost(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        
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
                
                // URL completa para servir desde el backend
                imagePath = "http://localhost:8080/uploads/" + newFilename;
                
            } catch (IOException e) {
                return ResponseEntity.internalServerError().build();
            }
        }
        
        Post newPost = new Post(title, content, 0, 0, imagePath);
        Post savedPost = postRepository.save(newPost);
        
        return ResponseEntity.ok(savedPost);
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