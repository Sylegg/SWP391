package com.lemon.supershop.swp391fa25evdm.role.controller;

import com.lemon.supershop.swp391fa25evdm.role.model.dto.RoleDto;
import com.lemon.supershop.swp391fa25evdm.role.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/role")
public class RoleController {

    @Autowired
    private RoleService roleService;

    @GetMapping
    public ResponseEntity<List<RoleDto>> getAllRoles() {
        List<RoleDto> roles = roleService.getAllRoles();
        return ResponseEntity.ok(roles);
    }

    @PostMapping
    public ResponseEntity<RoleDto> addRole(@RequestBody RoleDto dto) {
        RoleDto newRole = roleService.addRole(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(newRole);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoleDto> updateRole(@PathVariable int id, @RequestBody RoleDto dto) {
        RoleDto updated = roleService.updateRole(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeRole(@PathVariable int id) {
        roleService.removeRole(id);
        return ResponseEntity.noContent().build();
    }

}
