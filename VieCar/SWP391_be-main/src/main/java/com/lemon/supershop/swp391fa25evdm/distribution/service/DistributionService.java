package com.lemon.supershop.swp391fa25evdm.distribution.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import com.lemon.supershop.swp391fa25evdm.category.model.entity.Category;
import com.lemon.supershop.swp391fa25evdm.contract.model.entity.Contract;
import com.lemon.supershop.swp391fa25evdm.dealer.model.entity.Dealer;
import com.lemon.supershop.swp391fa25evdm.product.model.dto.ProductReq;
import com.lemon.supershop.swp391fa25evdm.product.model.dto.ProductRes;
import com.lemon.supershop.swp391fa25evdm.product.model.entity.Product;
import com.lemon.supershop.swp391fa25evdm.product.repository.ProductRepo;
import com.lemon.supershop.swp391fa25evdm.product.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lemon.supershop.swp391fa25evdm.category.repository.CategoryRepository;
import com.lemon.supershop.swp391fa25evdm.contract.repository.ContractRepo;
import com.lemon.supershop.swp391fa25evdm.dealer.repository.DealerRepo;
import com.lemon.supershop.swp391fa25evdm.distribution.model.dto.DistributionReq;
import com.lemon.supershop.swp391fa25evdm.distribution.model.dto.DistributionRes;
import com.lemon.supershop.swp391fa25evdm.distribution.model.entity.Distribution;
import com.lemon.supershop.swp391fa25evdm.distribution.repository.DistributionRepo;

@Service
public class DistributionService {

    @Autowired
    private DistributionRepo distributionRepo;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private DealerRepo dealerRepo;
    @Autowired
    private ContractRepo contractRepo;
    @Autowired
    private ProductRepo productRepo;
    @Autowired
    private ProductService productService;


    public List<DistributionRes> getAllDistributions() {
        List<Distribution> distributions = distributionRepo.findAll();
        return distributions.stream().map(this::convertToRes).toList();
    }

    public List<DistributionRes> getDistributionsByCategoryId(int categoryId) {
        List<Distribution> distributions = distributionRepo.findByCategoryId(categoryId);
        return distributions.stream().map(this::convertToRes).toList();
    }

    public List<DistributionRes> getDistributionsByDealerId(int dealerId) {
        List<Distribution> distributions = distributionRepo.findByDealerId(dealerId);
        return distributions.stream().map(this::convertToRes).toList();
    }

    public List<DistributionRes> getDistributionsByContractId(int contractId) {
        List<Distribution> distributions = distributionRepo.findByContractId(contractId);
        return distributions.stream().map(this::convertToRes).toList();
    }

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
            if (req.getCategoryId() > 0){
                Optional<Category> category = categoryRepository.findById(req.getCategoryId());
                if (category.isPresent()){
                    distribution.setCategory(category.get());
                }
            }
            if (req.getDealerId() > 0){
                Optional<Dealer> dealer = dealerRepo.findById(req.getDealerId());
                if (dealer.isPresent()){
                    distribution.setDealer(dealer.get());
                }
            }
            if (req.getContractId() > 0){
                Optional<Contract> contract = contractRepo.findById(req.getContractId());
                if (contract.isPresent()){
                    distribution.setContract(contract.get());
                }
            }
            return distribution;
        }
        return null;
    }

    private DistributionRes convertToRes(Distribution distribution) {
        DistributionRes res = new DistributionRes();

        if (distribution.getCategory() != null) {
            res.setCategoryId(distribution.getCategory().getId());
        }
        if (distribution.getDealer() != null) {
            res.setDealerId(distribution.getDealer().getId());
        }
        if (distribution.getContract() != null) {
            res.setContractId(distribution.getContract().getId());
        }
        if (!distribution.getProducts().isEmpty()){
            List<ProductRes> validProducts = new ArrayList<>();
            for (Product product : distribution.getProducts()) {
                Optional<Product> productOpt = productRepo.findById(product.getId());
                if (productOpt.isPresent()) {
                    ProductRes productRes = productService.convertToRes(productOpt.get());
                    validProducts.add(productRes);
                }
            }
            if (!validProducts.isEmpty()){
                res.setProducts(validProducts);
            }
        }
        res.setId(distribution.getId());
        return res;

    }
}
