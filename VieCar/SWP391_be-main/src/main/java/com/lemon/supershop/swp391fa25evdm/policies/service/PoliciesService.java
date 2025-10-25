package com.lemon.supershop.swp391fa25evdm.policies.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lemon.supershop.swp391fa25evdm.category.repository.CategoryRepository;
import com.lemon.supershop.swp391fa25evdm.dealer.repository.DealerRepo;
import com.lemon.supershop.swp391fa25evdm.policies.model.dto.PoliciesReq;
import com.lemon.supershop.swp391fa25evdm.policies.model.dto.PoliciesRes;
import com.lemon.supershop.swp391fa25evdm.policies.model.entity.Policy;
import com.lemon.supershop.swp391fa25evdm.policies.repository.PoliciesRepo;

@Service
public class PoliciesService {

    @Autowired
    private PoliciesRepo policiesRepo;
    @Autowired
    private CategoryRepository categoryRepo;
    @Autowired
    private DealerRepo dealerRepo;

    public List<PoliciesRes> getAllPolicies() {
        List<Policy> policies = policiesRepo.findAll();
        return policies.stream().map(this::convertToRes).toList();
    }

    public List<PoliciesRes> getPoliciesByCategoryId(int categoryId) {
        List<Policy> policies = policiesRepo.findByCategoryId(categoryId);
        return policies.stream().map(this::convertToRes).toList();
    }

    public List<PoliciesRes> getPoliciesByDealerId(int dealerId) {
        List<Policy> policies = policiesRepo.findByDealerId(dealerId);
        return policies.stream().map(this::convertToRes).toList();
    }

    public PoliciesRes getPolicyById(int id) {
        Optional<Policy> policy = policiesRepo.findById(id);
        if (policy.isPresent()) {
            return convertToRes(policy.orElse(null));
        }
        return null;
    }

    public PoliciesRes createPolicy(PoliciesReq dto) {
        Policy policy = new Policy();
        Policy policy1 = convertToEntity(policy, dto);
        policiesRepo.save(policy1);
        return convertToRes(policy1);
    }

    public PoliciesRes updatePolicy(int id, PoliciesReq dto) {
        Optional<Policy> policy = policiesRepo.findById(id);
        if (policy.isPresent()) {
            Policy policy1 = convertToEntity(policy.orElse(null), dto);
            policiesRepo.save(policy1);
            return convertToRes(policy1);
        }
        return null;
    }

    public boolean deletePolicy(int id) {
        Optional<Policy> policy = policiesRepo.findById(id);
        if (policy.isPresent()) {
            policiesRepo.delete(policy.get());
            return true;
        }
        return false;
    }

    private Policy convertToEntity(Policy policy, PoliciesReq dto) {
        if (policy != null || dto != null) {
            if (dto.getName() != null){
                policy.setName(dto.getName());
            }
            if (dto.getType() != null){
                policy.setType(dto.getType());
            }
            if (dto.getDescription() != null){
                policy.setDescription(dto.getDescription());
            }
            if (dto.getStartDate() != null){
                policy.setStartDate(dto.getStartDate());
            }
            if (dto.getEndDate() != null){
                policy.setEndDate(dto.getEndDate());
            }
            if (dto.getCategoryId() != 0) {
                categoryRepo.findById(dto.getCategoryId()).ifPresent(policy::setCategory);
            }
            if (dto.getDealerId() != 0) {
                dealerRepo.findById(dto.getDealerId()).ifPresent(policy::setDealer);
            }
            return policy;
        }
        return null;
    }

    private PoliciesRes convertToRes(Policy policy) {
        PoliciesRes res = new PoliciesRes();
        res.setId(policy.getId());
        if (policy.getName() != null) {
            res.setName(policy.getName());
        }
        if (policy.getType() != null) {
            res.setType(policy.getType());
        }
        if (policy.getDescription() != null) {
            res.setDescription(policy.getDescription());
        }
        if (policy.getStartDate() != null) {
            res.setStartDate(policy.getStartDate());
        }
        if (policy.getEndDate() != null) {
            res.setEndDate(policy.getEndDate());
        }
        if (policy.getCategory() != null) {
            res.setCategoryId(policy.getCategory().getId());
        }

        if (policy.getDealer() != null) {
            res.setDealerId(policy.getDealer().getId());
        }
        return res;
    }
}
