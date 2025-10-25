package com.lemon.supershop.swp391fa25evdm.distribution.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.lemon.supershop.swp391fa25evdm.distribution.model.entity.Distribution;

@Repository
public interface DistributionRepo extends JpaRepository<Distribution, Integer> {

    // ❌ Xóa query không dùng
    // List<Distribution> findByCategoryId(int categoryId);

    List<Distribution> findByDealerId(int dealerId);

    // ❌ Xóa query không dùng Contract
    // List<Distribution> findByContractId(int contractId);
}
