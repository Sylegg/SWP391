package com.lemon.supershop.swp391fa25evdm.policies.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.lemon.supershop.swp391fa25evdm.policies.model.entity.Policy;

@Repository
public interface PoliciesRepo extends JpaRepository<Policy, Integer> {
    List<Policy> findAll();
    List<Policy> findByCategoryId(int categoryId);
    List<Policy> findByDealerId(int dealerId);
}
