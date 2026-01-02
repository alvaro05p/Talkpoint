package com.foro.backend.controller;

import com.foro.backend.model.User;
import com.foro.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String email = body.get("email");
        String password = body.get("password");

        // Validaciones
        if (username == null || email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Todos los campos son obligatorios"));
        }

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.badRequest().body(Map.of("error", "El nombre de usuario ya existe"));
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "El email ya está registrado"));
        }

        // Crear usuario (en producción deberías encriptar la contraseña)
        User user = new User(username, email, password);
        User savedUser = userRepository.save(user);

        // Devolver usuario sin contraseña
        Map<String, Object> response = new HashMap<>();
        response.put("id", savedUser.getId());
        response.put("username", savedUser.getUsername());
        response.put("email", savedUser.getEmail());
        response.put("avatar", savedUser.getAvatar());

        return ResponseEntity.ok(response);
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Usuario y contraseña son obligatorios"));
        }

        // Buscar usuario
        var userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Usuario no encontrado"));
        }

        User user = userOpt.get();

        // Verificar contraseña (en producción usarías BCrypt)
        if (!user.getPassword().equals(password)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Contraseña incorrecta"));
        }

        // Devolver usuario sin contraseña
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("avatar", user.getAvatar());

        return ResponseEntity.ok(response);
    }
}