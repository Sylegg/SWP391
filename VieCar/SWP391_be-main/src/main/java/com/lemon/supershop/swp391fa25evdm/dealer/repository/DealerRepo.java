package com.lemon.supershop.swp391fa25evdm.dealer.repository;

import com.lemon.supershop.swp391fa25evdm.dealer.model.entity.Dealer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DealerRepo extends JpaRepository<Dealer, Integer> {

    Optional<Dealer> findByNameContainingIgnoreCase(String name);
    List<Dealer> findByAddressContainingIgnoreCase(String address);
}
