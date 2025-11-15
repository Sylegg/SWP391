package com.lemon.supershop.swp391fa25evdm.crm.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lemon.supershop.swp391fa25evdm.crm.model.entity.CustomerNote;

@Repository
public interface CustomerNoteRepository extends JpaRepository<CustomerNote, Integer> {
    
    // Find all notes for a customer
    @Query("SELECT cn FROM CustomerNote cn WHERE cn.user.id = :userId ORDER BY cn.createdAt DESC")
    List<CustomerNote> findByUserId(@Param("userId") int userId);
    
    // Find notes by customer and dealer
    @Query("SELECT cn FROM CustomerNote cn WHERE cn.user.id = :userId AND cn.dealer.id = :dealerId ORDER BY cn.createdAt DESC")
    List<CustomerNote> findByUserIdAndDealerId(@Param("userId") int userId, @Param("dealerId") int dealerId);
    
    // Find all notes created by a dealer
    @Query("SELECT cn FROM CustomerNote cn WHERE cn.dealer.id = :dealerId ORDER BY cn.createdAt DESC")
    List<CustomerNote> findByDealerId(@Param("dealerId") int dealerId);
}
