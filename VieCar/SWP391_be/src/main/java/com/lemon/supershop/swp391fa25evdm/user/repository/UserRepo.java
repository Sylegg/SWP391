package com.lemon.supershop.swp391fa25evdm.user.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.lemon.supershop.swp391fa25evdm.user.model.entity.User;
import com.lemon.supershop.swp391fa25evdm.user.model.enums.UserStatus;
@Repository
public interface UserRepo extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByUsername(String username);
    List<User> findByUsernameContainingIgnoreCase(String username);
    Optional<User> findById(int id);
    List<User> findByIsBlackTrue();
    List<User> findByIsBlackFalse();
    List<User> findByStatus(UserStatus status);
    List<User> findUsersByDealer_Id(int dealerId);
    List<User> findByRole_Name(String roleName);
    List<User> findByRole_NameAndDealerIsNull(String roleName);
    List<User> findByRole_NameAndDealer_Id(String roleName, int dealerId);

}
