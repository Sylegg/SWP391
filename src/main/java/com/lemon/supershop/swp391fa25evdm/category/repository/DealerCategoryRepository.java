package com.lemon.supershop.swp391fa25evdm.category.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lemon.supershop.swp391fa25evdm.category.model.entity.DealerCategory;

import java.util.List;

@Repository
public interface DealerCategoryRepository extends JpaRepository<DealerCategory,Integer> {

    // Find dealer categories by dealer ID
    @Query("SELECT dc FROM DealerCategory dc WHERE dc.dealer.id = :dealerId")
    List<DealerCategory> findByDealerId(@Param("dealerId") int dealerId);

    // Find dealer categories by category ID
    @Query("SELECT dc FROM DealerCategory dc WHERE dc.category.id = :categoryId")
    List<DealerCategory> findByCategoryId(@Param("categoryId") int categoryId);

}
