package com.lemon.supershop.swp391fa25evdm.testdrive.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.lemon.supershop.swp391fa25evdm.testdrive.model.entity.TestDrive;

@Repository
public interface TestDriveRepository extends JpaRepository<TestDrive, Integer> {

    // JPA sẽ tự động implement các methods này
    List<TestDrive> findByUserId(int userId);
    List<TestDrive> findByDealerId(int dealerId);
}
