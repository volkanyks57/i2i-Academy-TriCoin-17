package com.tricoin.core.auth;

import com.tricoin.core.auth.dto.ChangePasswordRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
        @RequestAttribute("username") String username,
        @Valid @RequestBody ChangePasswordRequest request
    ) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalStateException("User not found"));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "WRONG_PASSWORD", "message", "Current password is incorrect"));
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }

    @PostMapping(value = "/avatar", consumes = "multipart/form-data")
    public ResponseEntity<?> uploadAvatar(
        @RequestAttribute("username") String username,
        @RequestParam("file") MultipartFile file
    ) {
        if (file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "EMPTY_FILE", "message", "No file was uploaded"));
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "INVALID_FILE_TYPE", "message", "Only image files are allowed"));
        }

        try {
            Path uploadDir = Paths.get("uploads/avatars");
            Files.createDirectories(uploadDir);

            String originalName = file.getOriginalFilename();
            String extension = originalName != null && originalName.contains(".")
                ? originalName.substring(originalName.lastIndexOf('.'))
                : "";
            String filename = UUID.randomUUID() + extension;

            Path destination = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), destination);

            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("User not found"));

            String publicUrl = "/uploads/avatars/" + filename;
            user.setProfilePictureUrl(publicUrl);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("profilePictureUrl", publicUrl));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "UPLOAD_FAILED", "message", "Could not save the uploaded file"));
        }
    }
}