package com.lemon.supershop.swp391fa25evdm.distribution.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.lemon.supershop.swp391fa25evdm.distribution.model.entity.Distribution;

@Repository
public interface DistributionRepo extends JpaRepository<Distribution, Integer> {

    List<Distribution> findByDealerId(int dealerId);
}
