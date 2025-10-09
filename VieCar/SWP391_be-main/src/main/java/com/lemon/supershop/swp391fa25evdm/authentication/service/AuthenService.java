package com.lemon.supershop.swp391fa25evdm.authentication.service;

import com.lemon.supershop.swp391fa25evdm.authentication.model.dto.*;
import com.lemon.supershop.swp391fa25evdm.refra.JwtUtil;
import com.lemon.supershop.swp391fa25evdm.role.model.entity.Role;
import com.lemon.supershop.swp391fa25evdm.role.repository.RoleRepo;
import com.lemon.supershop.swp391fa25evdm.user.model.entity.User;
import com.lemon.supershop.swp391fa25evdm.user.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
        Optional<User> user = Optional.empty();
        if (dto.getIdentifier() != null){
            if (EMAIL_PATTERN.matcher(dto.getIdentifier()).matches()){
                user = userRepo.findByEmail(dto.getIdentifier());
            } else {
                user = userRepo.findByUsername(dto.getIdentifier());
            }
        }

        if (!user.isPresent()) {
            throw new RuntimeException("User not found");
        }
        if (!user.get().getPassword().equals(dto.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtUtil.generateToken(user.get().getUsername());
        String refreshToken = jwtUtil.generateRefreshToken(user.get().getUsername());

        LoginRes response = new LoginRes(token, refreshToken, user.get().getUsername(), user.get().getRole().getName());

        return response;
    }

    public void register(RegisterReq dto) {
        User user = new User();
        String requestedRole = dto.getRoleName() != null ? dto.getRoleName() : "Customer";
        Optional<Role> role = roleRepo.findByNameContainingIgnoreCase("Customer");

        user.setRole(role.orElse(null));

        if (dto.getPhone() != null && PHONE_PATTERN.matcher(dto.getPhone()).matches()){
            user.setPhone(dto.getPhone());
        }
        if (dto.getEmail() != null && EMAIL_PATTERN.matcher(dto.getEmail()).matches()){
            if ( role.isPresent() && userRepo.existsByEmail(dto.getEmail())){
                throw new RuntimeException("EMAIL_DUPLICATE");
            } else {
                user.setEmail(dto.getEmail());
            }
        }
        if (role.isPresent()) {
            role.get().addUser(user);
        }
        if (dto.getPassword().equals(dto.getConfirmPassword())){
            user.setPassword(dto.getPassword());
        }
        user.setUsername(dto.getUsername());
        user.setAddress(dto.getAddress());
        userRepo.save(user);
    }

    public void registerAmin(RegisterReq dto) {
        User user = new User();
        Optional<Role> role = roleRepo.findByNameContainingIgnoreCase("Admin");

        user.setRole(role.get());

        if (dto.getPhone() != null && PHONE_PATTERN.matcher(dto.getPhone()).matches()){
            user.setPhone(dto.getPhone());
        }

        if (dto.getPassword().equals(dto.getConfirmPassword())){
            user.setPassword(dto.getPassword());
        }
        user.setUsername(dto.getPhone());
        role.get().addUser(user);
        userRepo.save(user);
    }

    public void changePassword(int id, ChangePassReq dto){
        Optional<User> user = userRepo.findById(id);
        if (user.isPresent()) {
            if (dto.getOldPass().equals(user.get().getPassword())){
                if (!dto.getNewPass().equals(user.get().getPassword())){
                    if (dto.getNewPass().equals(dto.getConfirmPass())){
                        user.get().setPassword(dto.getNewPass());
                    }
                }
            }
        }
        userRepo.save(user.get());
    }
}
