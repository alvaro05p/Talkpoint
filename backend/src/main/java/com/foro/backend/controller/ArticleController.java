package com.foro.backend.controller;

import com.foro.backend.model.Article;
import com.foro.backend.repository.ArticleRepository;
import com.foro.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/articles")
@CrossOrigin(origins = "http://localhost:5173")
public class ArticleController {

    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;
    private final String UPLOAD_DIR = "uploads/";

    public ArticleController(ArticleRepository articleRepository, UserRepository userRepository) {
        this.articleRepository = articleRepository;
        this.userRepository = userRepository;
    }

    // GET - Obtener todos los artículos publicados
    @GetMapping
    public List<Map<String, Object>> getAllArticles() {
        return articleRepository.findByPublishedTrueOrderByCreatedAtDesc()
            .stream()
            .map(this::buildArticlePreview)
            .collect(Collectors.toList());
    }

    // GET - Obtener artículos por categoría
    @GetMapping("/category/{category}")
    public List<Map<String, Object>> getArticlesByCategory(@PathVariable String category) {
        return articleRepository.findByCategoryAndPublishedTrueOrderByCreatedAtDesc(category)
            .stream()
            .map(this::buildArticlePreview)
            .collect(Collectors.toList());
    }

    // GET - Obtener un artículo completo
    @GetMapping("/{id}")
    public ResponseEntity<?> getArticle(@PathVariable Long id) {
        var articleOpt = articleRepository.findById(id);
        
        if (articleOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(buildArticleFull(articleOpt.get()));
    }

    // POST - Crear artículo (solo admins)
    @PostMapping
    public ResponseEntity<?> createArticle(
            @RequestParam("title") String title,
            @RequestParam("summary") String summary,
            @RequestParam("content") String content,
            @RequestParam("category") String category,
            @RequestParam("userId") Long userId,
            @RequestParam(value = "coverImage", required = false) MultipartFile coverImage) {

        // Verificar que el usuario es admin
        var userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Usuario no encontrado"));
        }

        if (!"ADMIN".equals(userOpt.get().getRole())) {
            return ResponseEntity.status(403).body(Map.of("error", "Solo los administradores pueden crear artículos"));
        }

        String imagePath = null;
        if (coverImage != null && !coverImage.isEmpty()) {
            try {
                Path uploadPath = Paths.get(UPLOAD_DIR);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                String originalFilename = coverImage.getOriginalFilename();
                String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                String newFilename = "article_" + UUID.randomUUID().toString() + extension;

                Path filePath = uploadPath.resolve(newFilename);
                Files.copy(coverImage.getInputStream(), filePath);

                imagePath = "http://localhost:8080/uploads/" + newFilename;
            } catch (IOException e) {
                return ResponseEntity.internalServerError().body(Map.of("error", "Error al subir imagen"));
            }
        }

        Article article = new Article(title, summary, content, imagePath, category, userOpt.get());
        Article saved = articleRepository.save(article);

        return ResponseEntity.ok(buildArticleFull(saved));
    }

    // DELETE - Eliminar artículo (solo admins)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteArticle(@PathVariable Long id, @RequestParam Long userId) {
        var userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty() || !"ADMIN".equals(userOpt.get().getRole())) {
            return ResponseEntity.status(403).body(Map.of("error", "No autorizado"));
        }

        articleRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Artículo eliminado"));
    }

    // GET - Categorías disponibles
    @GetMapping("/categories")
    public List<String> getCategories() {
        return Arrays.asList(
            "Inteligencia Artificial",
            "Smartphones",
            "Gaming",
            "Software",
            "Hardware",
            "Redes Sociales",
            "Ciberseguridad",
            "Startups"
        );
    }

    // Preview para listados
    private Map<String, Object> buildArticlePreview(Article article) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", article.getId());
        map.put("title", article.getTitle());
        map.put("summary", article.getSummary());
        map.put("coverImage", article.getCoverImage());
        map.put("category", article.getCategory());
        map.put("createdAt", article.getCreatedAt().toString());
        
        if (article.getAuthor() != null) {
            map.put("authorName", article.getAuthor().getDisplayName() != null 
                ? article.getAuthor().getDisplayName() 
                : article.getAuthor().getUsername());
        }
        return map;
    }

    // Artículo completo
    private Map<String, Object> buildArticleFull(Article article) {
        Map<String, Object> map = buildArticlePreview(article);
        map.put("content", article.getContent());
        return map;
    }
}