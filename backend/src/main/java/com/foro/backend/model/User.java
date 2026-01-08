package com.foro.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    // Campos de perfil
    private String displayName;  // Nombre visible (ej: "Juan Pérez")
    private String avatar;
    private String bio;          // Biografía
    private String location;     // Ubicación
    private String occupation;   // Ocupación/trabajo

    // Estadísticas
    private int followers = 0;
    private int following = 0;

    // Rol del usuario (USER, ADMIN)
    private String role = "USER";

    public User() {}

    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.displayName = username; // Por defecto, el displayName es el username
    }

    // Getters y Setters
    public Long getId() { return id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public String getOccupation() { return occupation; }
    public void setOccupation(String occupation) { this.occupation = occupation; }
    
    public int getFollowers() { return followers; }
    public void setFollowers(int followers) { this.followers = followers; }
    
    public int getFollowing() { return following; }
    public void setFollowing(int following) { this.following = following; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}