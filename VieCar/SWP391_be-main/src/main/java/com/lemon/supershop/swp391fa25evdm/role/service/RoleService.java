package com.lemon.supershop.swp391fa25evdm.role.service;

import com.lemon.supershop.swp391fa25evdm.role.model.dto.RoleDto;
import com.lemon.supershop.swp391fa25evdm.role.model.entity.Role;
import com.lemon.supershop.swp391fa25evdm.role.repository.RoleRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
@Service
public class RoleService {

    @Autowired
    private RoleRepo roleRepo;

    public List<RoleDto> getAllRoles() {
        return roleRepo.findAll().stream().map(role -> {
            RoleDto dto = new RoleDto();
            dto.setName(role.getName());
            dto.setDescription(role.getDescription());
            return dto;
        }).collect(Collectors.toList());
    }

    public RoleDto addRole(RoleDto dto) {
        Optional<Role> role = roleRepo.findByNameContainingIgnoreCase(dto.getName());
        if (role.isEmpty()) {
            role = Optional.of(new Role(dto.getName(), dto.getDescription()));
        }
        roleRepo.save(role.get());
        return new RoleDto(role.get().getName(), role.get().getDescription());
    }

    public RoleDto updateRole(int id, RoleDto dto) {
        Optional<Role> role = roleRepo.findById(id);
        if (role.isPresent()) {
            if (!dto.getName().isEmpty()){
                role.get().setName(dto.getName());
            }
            if (!dto.getDescription().isEmpty()){
                role.get().setDescription(dto.getDescription());
            }
            roleRepo.save(role.get());
        }
        return new RoleDto(role.get().getName(), role.get().getDescription());
    }
    @Transactional
    public boolean removeRole(int id) {
        Optional<Role> role = roleRepo.findById(id);
        if (role.isPresent()) {
            roleRepo.clearRoleFromUsers(id);
            roleRepo.delete(role.get());
            return true;
        }
        return false;
    }
}
