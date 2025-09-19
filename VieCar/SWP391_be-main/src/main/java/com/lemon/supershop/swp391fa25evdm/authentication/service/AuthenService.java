package com.lemon.supershop.swp391fa25evdm.authentication.service;
import com.lemon.supershop.swp391fa25evdm.authentication.model.dto.LoginReq;
import com.lemon.supershop.swp391fa25evdm.authentication.model.dto.LoginRes;
import com.lemon.supershop.swp391fa25evdm.authentication.model.dto.RegisterReq;
import com.lemon.supershop.swp391fa25evdm.refra.JwtUtil;
import com.lemon.supershop.swp391fa25evdm.role.model.entity.Role;
import com.lemon.supershop.swp391fa25evdm.role.repository.RoleRepo;
import com.lemon.supershop.swp391fa25evdm.user.model.entity.User;
import com.lemon.supershop.swp391fa25evdm.user.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Objects;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class AuthenService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private RoleRepo roleRepo;

    @Autowired
    private JwtUtil jwtUtil;

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$", Pattern.CASE_INSENSITIVE);

    // Hợp lệ cho VN: 10-digit bắt đầu 03|05|07|08|09 OR old 11-digit 01(2|6|8|9)
    private static final Pattern PHONE_PATTERN =
            Pattern.compile("^(?:(?:03|05|07|08|09)\\d{8}|01(?:2|6|8|9)\\d{8})$");


    public LoginRes login(LoginReq dto) {
        // Basic validation
        if (dto == null || dto.getIdentifier() == null || dto.getPassword() == null ||
                dto.getIdentifier().trim().isEmpty() || dto.getPassword().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Identifier and password are required");
        }

        String identifier = dto.getIdentifier().trim();

        Optional<User> user = Optional.empty();
        // Try to resolve identifier as email, phone, then username
        if (EMAIL_PATTERN.matcher(identifier).matches()) {
            user = userRepo.findByEmail(identifier);
        } else if (PHONE_PATTERN.matcher(identifier).matches()) {
            user = userRepo.findByPhone(identifier);
        } else {
            user = userRepo.findByUsername(identifier);
        }

        if (user.isEmpty()) {
            // Avoid user enumeration: generic invalid credentials
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        // Optional: block blacklisted accounts
        if (user.get().getIsBlack() != null && "TRUE".equalsIgnoreCase(user.get().getIsBlack())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is blocked");
        }

        if (!Objects.equals(user.get().getPassword(), dto.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.get().getUsername());
        String refreshToken = jwtUtil.generateRefreshToken(user.get().getUsername());

        return new LoginRes(token, refreshToken, user.get().getUsername(), user.get().getRole().getName());
    }

    public void register(RegisterReq dto) {
        // Validate email format
        if (dto.getEmail() == null || !EMAIL_PATTERN.matcher(dto.getEmail()).matches()) {
            throw new RuntimeException("Invalid email format");
        }
        
        // Check if user already exists
        if (userRepo.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        if (dto.getUsername() != null && userRepo.existsByUsername(dto.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        // Validate password confirmation
        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        User user = new User();
        Role role = roleRepo.findByNameContainingIgnoreCase("Customer");

        user.setRole(role);
        user.setEmail(dto.getEmail());
        user.setUsername(dto.getUsername());
        user.setPassword(dto.getPassword());
        user.setAddress(dto.getAddress());
        user.setIsBlack("FALSE"); // Set default value as string

        if (dto.getPhone() != null && PHONE_PATTERN.matcher(dto.getPhone()).matches()) {
            user.setPhone(dto.getPhone());
        }

        userRepo.save(user);
    }

    public void registerAmin(RegisterReq dto) {
        User user = new User();
        Role role = roleRepo.findByNameContainingIgnoreCase("Admin");

        user.setRole(role);

        if (dto.getPhone() != null && PHONE_PATTERN.matcher(dto.getPhone()).matches()){
            user.setPhone(dto.getPhone());
        }

        if (dto.getPassword().equals(dto.getConfirmPassword())){
            user.setPassword(dto.getPassword());
        }
        user.setUsername(dto.getPhone());
        role.addUser(user);
        userRepo.save(user);
    }
}
