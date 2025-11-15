package com.lemon.supershop.swp391fa25evdm.role.repository;

import com.lemon.supershop.swp391fa25evdm.role.model.entity.Role;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface RoleRepo extends JpaRepository<Role, Integer> {
    Optional<Role> findByNameContainingIgnoreCase(String name);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.role = null WHERE u.role.id = :roleId")
    public void clearRoleFromUsers(@Param("roleId") Integer roleId);

}
