package com.lemon.supershop.swp391fa25evdm.role.repository;

import com.lemon.supershop.swp391fa25evdm.role.model.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RoleRepo extends JpaRepository<Role, Integer> {
    public Role findByNameContainingIgnoreCase(String name);
    @Modifying
    @Query("UPDATE User u SET u.role = null WHERE u.role.id = :roleId")
    public void clearRoleFromUsers(@Param("roleId") Integer roleId);

}
