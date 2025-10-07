package com.lemon.supershop.swp391fa25evdm.category.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.lemon.supershop.swp391fa25evdm.category.model.entity.DealerCategory;

@Repository
public interface DealerCategoryRepository extends JpaRepository<DealerCategory,Integer> {

}
