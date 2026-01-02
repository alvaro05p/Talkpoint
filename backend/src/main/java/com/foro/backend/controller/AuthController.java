package com.foro.backend.controller;

import com.foro.backend.model.User;
import com.foro.backend.repository.UserRepository;
import com.foro.backend.repository.PostRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final String UPLOAD_DIR = "uploads/";

    public AuthController(UserRepository userRepository, PostRepository postRepository) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
    }

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String email = body.get("email");
        String password = body.get("password");

        if (username == null || email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Todos los campos son obligatorios"));
        }

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.badRequest().body(Map.of("error", "El nombre de usuario ya existe"));
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "El email ya está registrado"));
        }

        User user = new User(username, email, password);
        User savedUser = userRepository.save(user);

        return ResponseEntity.ok(buildUserResponse(savedUser, 0));
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Usuario y contraseña son obligatorios"));
        }

        var userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Usuario no encontrado"));
        }

        User user = userOpt.get();

        if (!user.getPassword().equals(password)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Contraseña incorrecta"));
        }

        int postCount = postRepository.countByUserId(user.getId());

        return ResponseEntity.ok(buildUserResponse(user, postCount));
    }

    // GET /api/auth/user/{id}
    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        var userOpt = userRepository.findById(id);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        int postCount = postRepository.countByUserId(user.getId());

        return ResponseEntity.ok(buildUserResponse(user, postCount));
    }

    // PUT /api/auth/user/{id} - Actualizar perfil
    @PutMapping("/user/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, String> body) {
        var userOpt = userRepository.findById(id);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();

        if (body.containsKey("displayName")) user.setDisplayName(body.get("displayName"));
        if (body.containsKey("bio")) user.setBio(body.get("bio"));
        if (body.containsKey("location")) user.setLocation(body.get("location"));
        if (body.containsKey("occupation")) user.setOccupation(body.get("occupation"));
        if (body.containsKey("avatar")) user.setAvatar(body.get("avatar"));

        User savedUser = userRepository.save(user);
        int postCount = postRepository.countByUserId(user.getId());

        return ResponseEntity.ok(buildUserResponse(savedUser, postCount));
    }

    // POST /api/auth/user/{id}/avatar - Subir foto de perfil
    @PostMapping("/user/{id}/avatar")
    public ResponseEntity<?> uploadAvatar(@PathVariable Long id, @RequestParam("avatar") MultipartFile avatar) {
        var userOpt = userRepository.findById(id);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();

        if (avatar == null || avatar.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No se ha enviado ninguna imagen"));
        }

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = avatar.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String newFilename = "avatar_" + id + "_" + UUID.randomUUID().toString() + extension;

            Path filePath = uploadPath.resolve(newFilename);
            Files.copy(avatar.getInputStream(), filePath);

            String avatarUrl = "http://localhost:8080/uploads/" + newFilename;
            user.setAvatar(avatarUrl);
            User savedUser = userRepository.save(user);

            int postCount = postRepository.countByUserId(user.getId());

            return ResponseEntity.ok(buildUserResponse(savedUser, postCount));

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Error al guardar la imagen"));
        }
    }

    private Map<String, Object> buildUserResponse(User user, int postCount) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("displayName", user.getDisplayName());
        response.put("avatar", user.getAvatar());
        response.put("bio", user.getBio());
        response.put("location", user.getLocation());
        response.put("occupation", user.getOccupation());
        response.put("followers", user.getFollowers());
        response.put("following", user.getFollowing());
        response.put("postCount", postCount);
        return response;
    }
}