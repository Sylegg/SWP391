package com.lemon.supershop.swp391fa25evdm.distribution.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

// ❌ Xóa Category imports - không dùng
// import com.lemon.supershop.swp391fa25evdm.category.model.dto.CategoryRes;
// import com.lemon.supershop.swp391fa25evdm.category.model.entity.Category;
import com.lemon.supershop.swp391fa25evdm.dealer.model.dto.DealerRes;
import com.lemon.supershop.swp391fa25evdm.dealer.model.entity.Dealer;
import com.lemon.supershop.swp391fa25evdm.distribution.model.dto.*;
import com.lemon.supershop.swp391fa25evdm.product.model.dto.ProductRes;
import com.lemon.supershop.swp391fa25evdm.product.model.entity.Product;
import com.lemon.supershop.swp391fa25evdm.product.repository.ProductRepo;
import com.lemon.supershop.swp391fa25evdm.product.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

// ❌ Xóa CategoryRepository import - không dùng
// import com.lemon.supershop.swp391fa25evdm.category.repository.CategoryRepository;
import com.lemon.supershop.swp391fa25evdm.dealer.repository.DealerRepo;
import com.lemon.supershop.swp391fa25evdm.distribution.model.entity.Distribution;
import com.lemon.supershop.swp391fa25evdm.distribution.repository.DistributionRepo;

@Service
public class DistributionService {

    @Autowired
    private DistributionRepo distributionRepo;
    // ❌ Xóa CategoryRepository - không dùng
    // @Autowired
    // private CategoryRepository categoryRepository;
    @Autowired
    private DealerRepo dealerRepo;
    // ❌ Xóa: @Autowired private ContractRepo contractRepo;
    @Autowired
    private ProductRepo productRepo;
    @Autowired
    private ProductService productService;

    // ===== WORKFLOW METHODS =====

    // Step 1: EVM Staff gửi lời mời
    public DistributionRes sendInvitation(DistributionInvitationReq req) {
        Distribution distribution = new Distribution();
        
        // Set dealer
        Optional<Dealer> dealer = dealerRepo.findById(req.getDealerId());
        if (!dealer.isPresent()) {
            throw new RuntimeException("Dealer not found with id: " + req.getDealerId());
        }
        distribution.setDealer(dealer.get());
        
        // Category is optional - will be set later when dealer submits order
        // distribution.setCategory(category.get());
        
        // Set invitation details
        distribution.setInvitationMessage(req.getInvitationMessage());
        distribution.setDeadline(req.getDeadline());
        distribution.setStatus("INVITED");
        distribution.setInvitedAt(LocalDateTime.now());
        
        distributionRepo.save(distribution);
        return convertToRes(distribution);
    }

    // Step 2: Dealer Manager phản hồi lời mời
    public DistributionRes respondToInvitation(int id, DistributionResponseReq req) {
        Optional<Distribution> opt = distributionRepo.findById(id);
        if (!opt.isPresent()) {
            throw new RuntimeException("Distribution not found with id: " + id);
        }
        
        Distribution distribution = opt.get();
        
        // Validate status
        if (!"INVITED".equals(distribution.getStatus())) {
            throw new RuntimeException("Invalid status. Expected INVITED, got: " + distribution.getStatus());
        }
        
        // Update status based on response
        distribution.setStatus(req.getResponse()); // "ACCEPTED" or "DECLINED"
        distribution.setDealerNotes(req.getDealerNotes());
        // ❌ Xóa: distribution.setRespondedAt(LocalDateTime.now());
        
        distributionRepo.save(distribution);
        return convertToRes(distribution);
    }

    // Step 3: Dealer Manager tạo đơn hàng (nếu đã ACCEPTED)
    public DistributionRes submitOrder(int id, DistributionOrderReq req) {
        Optional<Distribution> opt = distributionRepo.findById(id);
        if (!opt.isPresent()) {
            throw new RuntimeException("Distribution not found with id: " + id);
        }
        
        Distribution distribution = opt.get();
        
        // Validate status
        if (!"ACCEPTED".equals(distribution.getStatus())) {
            throw new RuntimeException("Invalid status. Expected ACCEPTED, got: " + distribution.getStatus());
        }
        
        // Set products
        if (req.getProductIds() != null && !req.getProductIds().isEmpty()) {
            List<Product> products = new ArrayList<>();
            for (Integer productId : req.getProductIds()) {
                Optional<Product> product = productRepo.findById(productId);
                if (product.isPresent()) {
                    products.add(product.get());
                }
            }
            distribution.setProducts(products);
        }
        
        // Set order details
        distribution.setRequestedQuantity(req.getRequestedQuantity());
        distribution.setRequestedDeliveryDate(req.getRequestedDeliveryDate());
        if (req.getDealerNotes() != null) {
            distribution.setDealerNotes(req.getDealerNotes());
        }
        distribution.setStatus("PENDING");
        // ❌ Xóa: distribution.setSubmittedAt(LocalDateTime.now());
        
        distributionRepo.save(distribution);
        return convertToRes(distribution);
    }

    // Step 4: EVM Staff duyệt đơn
    public DistributionRes approveOrder(int id, DistributionApprovalReq req) {
        Optional<Distribution> opt = distributionRepo.findById(id);
        if (!opt.isPresent()) {
            throw new RuntimeException("Distribution not found with id: " + id);
        }
        
        Distribution distribution = opt.get();
        
        // Validate status
        if (!"PENDING".equals(distribution.getStatus())) {
            throw new RuntimeException("Invalid status. Expected PENDING, got: " + distribution.getStatus());
        }
        
        // Update based on decision
        distribution.setStatus(req.getDecision()); // "CONFIRMED" or "CANCELED"
        // ❌ Xóa: distribution.setApprovedQuantity(req.getApprovedQuantity());
        distribution.setEvmNotes(req.getEvmNotes());
        // ❌ Xóa: distribution.setApprovedAt(LocalDateTime.now());
        
        distributionRepo.save(distribution);
        return convertToRes(distribution);
    }

    // Step 5: EVM Staff lên kế hoạch giao hàng
    public DistributionRes planDelivery(int id, DistributionPlanningReq req) {
        Optional<Distribution> opt = distributionRepo.findById(id);
        if (!opt.isPresent()) {
            throw new RuntimeException("Distribution not found with id: " + id);
        }
        
        Distribution distribution = opt.get();
        
        // Validate status
        if (!"CONFIRMED".equals(distribution.getStatus())) {
            throw new RuntimeException("Invalid status. Expected CONFIRMED, got: " + distribution.getStatus());
        }
        
        // Set planning details
        distribution.setEstimatedDeliveryDate(req.getEstimatedDeliveryDate());
        // ❌ Xóa: distribution.setActualQuantity(req.getActualQuantity());
        if (req.getEvmNotes() != null) {
            distribution.setEvmNotes(req.getEvmNotes());
        }
        distribution.setStatus("PLANNED");
        // ❌ Xóa: distribution.setPlannedAt(LocalDateTime.now());
        
        distributionRepo.save(distribution);
        return convertToRes(distribution);
    }

    // Step 6: Dealer Manager xác nhận nhận hàng
    public DistributionRes confirmReceived(int id, DistributionCompletionReq req) {
        Optional<Distribution> opt = distributionRepo.findById(id);
        if (!opt.isPresent()) {
            throw new RuntimeException("Distribution not found with id: " + id);
        }
        
        Distribution distribution = opt.get();
        
        // Validate status
        if (!"PLANNED".equals(distribution.getStatus())) {
            throw new RuntimeException("Invalid status. Expected PLANNED, got: " + distribution.getStatus());
        }
        
        // Set completion details
        distribution.setReceivedQuantity(req.getReceivedQuantity());
        distribution.setActualDeliveryDate(req.getActualDeliveryDate());
        distribution.setFeedback(req.getFeedback());
        distribution.setStatus("COMPLETED");
        // ❌ Xóa: distribution.setCompletedAt(LocalDateTime.now());
        
        distributionRepo.save(distribution);
        return convertToRes(distribution);
    }

    // ===== EXISTING METHODS (updated) =====


    public List<DistributionRes> getAllDistributions() {
        List<Distribution> distributions = distributionRepo.findAll();
        return distributions.stream().map(this::convertToRes).toList();
    }

    // ❌ Xóa method không dùng
    // public List<DistributionRes> getDistributionsByCategoryId(int categoryId) {
    //     List<Distribution> distributions = distributionRepo.findByCategoryId(categoryId);
    //     return distributions.stream().map(this::convertToRes).toList();
    // }

    public List<DistributionRes> getDistributionsByDealerId(int dealerId) {
        List<Distribution> distributions = distributionRepo.findByDealerId(dealerId);
        return distributions.stream().map(this::convertToRes).toList();
    }

    // ❌ Xóa method không dùng Contract
    // public List<DistributionRes> getDistributionsByContractId(int contractId) {
    //     List<Distribution> distributions = distributionRepo.findByContractId(contractId);
    //     return distributions.stream().map(this::convertToRes).toList();
    // }

    public DistributionRes createDistribution(DistributionReq req) {
        Distribution distribution = new Distribution();
        Distribution distribution1 = convertToEntity(distribution, req);
        distributionRepo.save(distribution1);
        return convertToRes(distribution1);
    }

    public DistributionRes updateDistribution(int id, DistributionReq req) {
        Optional<Distribution> distribution = distributionRepo.findById(id);
        if (distribution.isPresent()) {
            Distribution distribution1 = convertToEntity(distribution.get(), req);
            distributionRepo.save(distribution1);
            return convertToRes(distribution1);
        }
        return null;
    }

    public boolean deleteDistribution(int id) {
        if (distributionRepo.existsById(id)) {
            distributionRepo.deleteById(id);
            return true;
        }
        return false;
    }

    private Distribution convertToEntity(Distribution distribution ,DistributionReq req) {
        if (distribution != null){
            if (!req.getProductId().isEmpty()){
                List<Product> validProducts = new ArrayList<>();
                for (Integer Req : req.getProductId()) {
                    Optional<Product> productOpt = productRepo.findById(Req);
                    if (productOpt.isPresent()) {
                        validProducts.add(productOpt.get());
                    }
                }
                if (!validProducts.isEmpty()){
                    distribution.setProducts(validProducts);
                }
            }
            // ❌ Xóa Category handling - không dùng
            // if (req.getCategoryId() > 0){
            //     Optional<Category> category = categoryRepository.findById(req.getCategoryId());
            //     if (category.isPresent()){
            //         distribution.setCategory(category.get());
            //     }
            // }
            if (req.getDealerId() > 0){
                Optional<Dealer> dealer = dealerRepo.findById(req.getDealerId());
                if (dealer.isPresent()){
                    distribution.setDealer(dealer.get());
                }
            }
            // ❌ Xóa Contract handling
            // if (req.getContractId() > 0){
            //     Optional<Contract> contract = contractRepo.findById(req.getContractId());
            //     if (contract.isPresent()){
            //         distribution.setContract(contract.get());
            //     }
            // }
            return distribution;
        }
        return null;
    }

    private DistributionRes convertToRes(Distribution distribution) {
        DistributionRes res = new DistributionRes();
        res.setId(distribution.getId());
        res.setStatus(distribution.getStatus());
        
        // ❌ Xóa Category conversion - không dùng
        // if (distribution.getCategory() != null) {
        //     CategoryRes categoryRes = new CategoryRes();
        //     categoryRes.setId(distribution.getCategory().getId());
        //     categoryRes.setName(distribution.getCategory().getName());
        //     res.setCategory(categoryRes);
        // }
        
        // Convert Dealer
        if (distribution.getDealer() != null) {
            DealerRes dealerRes = new DealerRes();
            dealerRes.setId(distribution.getDealer().getId());
            dealerRes.setName(distribution.getDealer().getName());
            res.setDealer(dealerRes);
        }
        
        // Convert Products
        if (distribution.getProducts() != null && !distribution.getProducts().isEmpty()) {
            List<ProductRes> productResList = new ArrayList<>();
            for (Product product : distribution.getProducts()) {
                ProductRes productRes = productService.convertToRes(product);
                productResList.add(productRes);
            }
            res.setProducts(productResList);
        }
        
        // Set messages/notes
        res.setInvitationMessage(distribution.getInvitationMessage());
        res.setDealerNotes(distribution.getDealerNotes());
        res.setEvmNotes(distribution.getEvmNotes());
        res.setFeedback(distribution.getFeedback());
        
        // Set timeline - CHỈ 2 FIELD ĐANG DÙNG
        res.setCreatedAt(distribution.getCreatedAt());
        res.setInvitedAt(distribution.getInvitedAt());
        // ❌ Xóa 5 timeline fields không dùng
        // res.setRespondedAt(distribution.getRespondedAt());
        // res.setSubmittedAt(distribution.getSubmittedAt());
        // res.setApprovedAt(distribution.getApprovedAt());
        // res.setPlannedAt(distribution.getPlannedAt());
        // res.setCompletedAt(distribution.getCompletedAt());
        
        // Set dates
        res.setDeadline(distribution.getDeadline());
        res.setRequestedDeliveryDate(distribution.getRequestedDeliveryDate());
        res.setEstimatedDeliveryDate(distribution.getEstimatedDeliveryDate());
        res.setActualDeliveryDate(distribution.getActualDeliveryDate());
        
        // Set quantities - CHỈ 2 FIELD ĐANG DÙNG
        res.setRequestedQuantity(distribution.getRequestedQuantity());
        res.setReceivedQuantity(distribution.getReceivedQuantity());
        // ❌ Xóa 2 quantity fields không dùng
        // res.setApprovedQuantity(distribution.getApprovedQuantity());
        // res.setActualQuantity(distribution.getActualQuantity());
        
        return res;
    }
}
