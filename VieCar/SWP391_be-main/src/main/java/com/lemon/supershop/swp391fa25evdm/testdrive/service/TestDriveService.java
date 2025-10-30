package com.lemon.supershop.swp391fa25evdm.testdrive.service;

import java.util.List;
import java.util.Optional;

import com.lemon.supershop.swp391fa25evdm.dealer.model.dto.DealerRes;
import com.lemon.supershop.swp391fa25evdm.dealer.model.entity.Dealer;
import com.lemon.supershop.swp391fa25evdm.dealer.service.DealerService;
import com.lemon.supershop.swp391fa25evdm.product.model.entity.Product;
import com.lemon.supershop.swp391fa25evdm.product.model.enums.ProductStatus;
import com.lemon.supershop.swp391fa25evdm.product.repository.ProductRepo;
import com.lemon.supershop.swp391fa25evdm.user.model.dto.UserRes;
import com.lemon.supershop.swp391fa25evdm.user.model.entity.User;
import com.lemon.supershop.swp391fa25evdm.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lemon.supershop.swp391fa25evdm.dealer.repository.DealerRepo;
import com.lemon.supershop.swp391fa25evdm.testdrive.model.dto.TestDriveReq;
import com.lemon.supershop.swp391fa25evdm.testdrive.model.dto.TestDriveRes;
import com.lemon.supershop.swp391fa25evdm.testdrive.model.entity.TestDrive;
import com.lemon.supershop.swp391fa25evdm.testdrive.repository.TestDriveRepository;
import com.lemon.supershop.swp391fa25evdm.user.repository.UserRepo;

@Service
public class TestDriveService {

    @Autowired
    private TestDriveRepository testDriveRepository;
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private DealerRepo dealerRepo;
    @Autowired
    private ProductRepo productRepo;
    @Autowired
    private DealerService dealerService;
    @Autowired
    private UserService userService;

    public List<TestDriveRes> getAllTestDrive() {
        List<TestDrive> testDrives = testDriveRepository.findAll();
        return testDrives.stream().map(this::convertToRes).toList();
    }

    public TestDriveRes getTestDriveById(int id) {
        TestDrive testDrive = testDriveRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("TestDrive not found with id: " + id));
        return convertToRes(testDrive);
    }

    public List<TestDriveRes> getTestDriveByUserId(int userId) {
        List<TestDrive> testDrives = testDriveRepository.findByUserId(userId);
        return testDrives.stream().map(this::convertToRes).toList();
    }

    public List<TestDriveRes> getTestDriveByDealerId(int dealerId) {
        List<TestDrive> testDrives = testDriveRepository.findByDealerId(dealerId);
        return testDrives.stream().map(this::convertToRes).toList();
    }

    public TestDriveRes createTestDrive(TestDriveReq req) {
        TestDrive testDrive = new TestDrive();
        TestDrive testDrive1 = convertToEntity(testDrive, req);
        testDriveRepository.save(testDrive1);
        return convertToRes(testDrive1);
    }

    public TestDriveRes updateTestDrive(int id, TestDriveReq req) {
        Optional<TestDrive> testDrive = testDriveRepository.findById(id);
        if (testDrive.isPresent()) {
            TestDrive testDrive1 = convertToEntity(testDrive.orElse(null), req);
            testDriveRepository.save(testDrive1);
            return convertToRes(testDrive1);
        }
        return null;
    }

    public boolean deleteTestDrive(int id) {
        if (testDriveRepository.findById(id).isPresent()) {
            testDriveRepository.deleteById(id);
            return true;
        }
        return false;
    }

    //method refference: object::method 
    //tham chiếu đến một phương thức của object và sử dụng nó như một biểu thức lambda.
    //không cần thêm logic
    private TestDrive convertToEntity(TestDrive testDrive, TestDriveReq req) {
        if (testDrive != null || req != null) {
            if (req.getScheduleDate() != null) {
                testDrive.setScheduleDate(req.getScheduleDate());
            }
            if (req.getStatus() != null) {
                testDrive.setStatus(req.getStatus());
            }
            if (req.getNotes() != null) {
                testDrive.setNotes(req.getNotes());
            }
            if (req.getUserId() > 0){
                Optional<User> user = userRepo.findById(req.getUserId());
                if (user.isPresent()) {
                    testDrive.setUser(user.orElse(null));
                    user.get().getTestDrives().add(testDrive);
                }
            }
            if (req.getDealerId() > 0){
                Optional<Dealer> dealer = dealerRepo.findById(req.getDealerId());
                if (dealer.isPresent()) {
                    testDrive.setDealer(dealer.get());
                    dealer.get().getTestDrives().add(testDrive);
                }
            }
            if (req.getProductId() > 0){
                Optional<Product> product = productRepo.findById(req.getProductId());
                if (product.isPresent()) {
                    if (product.get().getStatus().equals(ProductStatus.TEST_DRIVE)){
                        testDrive.setProduct(product.get());
                    }
                }
            }
            return testDrive;
        }
        return null;
    }

    //lambda expression: (parameters) -> expression
    //cần thêm logic VD: user.getId()
    private TestDriveRes convertToRes(TestDrive testDrive) {
        TestDriveRes res = new TestDriveRes();
        if (testDrive != null) {
            res.setId(testDrive.getId());
            if (testDrive.getScheduleDate() != null) {
                res.setScheduleDate(testDrive.getScheduleDate());
            }
            if (testDrive.getStatus() != null) {
                res.setStatus(testDrive.getStatus());
            }
            if (testDrive.getNotes() != null) {
                res.setNotes(testDrive.getNotes());
            }
            if (testDrive.getUser() != null) {
                Optional<User> user = userRepo.findById(testDrive.getUser().getId());
                if (user.isPresent()){
                    UserRes userRes = userService.converttoRes(user.get());
                    res.setUser(userRes);
                }
            }
            if (testDrive.getDealer() != null) {
                Optional<Dealer> dealer = dealerRepo.findById(testDrive.getDealer().getId());
                if (dealer.isPresent()){
                    DealerRes dealerRes = dealerService.converttoRes(dealer.get());
                    res.setDealer(dealerRes);
                    res.setLocation(dealerRes.getAddress());
                }
            }
            if (testDrive.getProduct() != null) {
                Optional<Product> product = productRepo.findById(testDrive.getProduct().getId());
                if (product.isPresent()){
                    res.setProductName(product.get().getName());
                }
            }
            return res;
        }
        return null;
    }

}
