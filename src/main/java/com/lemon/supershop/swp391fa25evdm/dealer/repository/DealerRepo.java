package com.lemon.supershop.swp391fa25evdm.dealer.repository;


import java.util.List;
import java.util.Optional;

import com.lemon.supershop.swp391fa25evdm.dealer.model.entity.Dealer;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lemon.supershop.swp391fa25evdm.dealer.model.entity.Dealer;
@Repository
public interface DealerRepo extends JpaRepository<Dealer, Integer> {

    Optional<Dealer> findByNameContainingIgnoreCase(String name);
    List<Dealer> findByAddressContainingIgnoreCase(String address);
    Optional<Dealer> findByEmail(String email);
    boolean existsByEmail(String email);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.dealer = null WHERE u.dealer.id = :dealerId")
    public void clearDealerFromUsers(@Param("dealerId") Integer dealerId);


}
