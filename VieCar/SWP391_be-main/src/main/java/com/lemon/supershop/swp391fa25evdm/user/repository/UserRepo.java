package com.lemon.supershop.swp391fa25evdm.user.repository;

import com.lemon.supershop.swp391fa25evdm.user.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepo extends JpaRepository<User, Long> {
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    Optional<User> findByEmail(String email);
    List<User> findByUsernameContainingIgnoreCase(String username);
    Optional<User> findById(int id);
    Optional<User> findByIsBlackTrue();
    Optional<User> findByIsBlackFalse();
}
