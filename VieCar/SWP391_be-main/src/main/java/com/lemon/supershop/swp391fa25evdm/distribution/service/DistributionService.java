package com.lemon.supershop.swp391fa25evdm.distribution.service;

import java.util.List;
import java.util.Optional;

import com.lemon.supershop.swp391fa25evdm.product.repository.ProductRepo;
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
            Distribution distribution1 = convertToEntity(distribution.orElse(null), req);
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
            productRepo.findById(req.getProductId()).ifPresent(distribution::setProduct);
            categoryRepository.findById(req.getCategoryId()).ifPresent(distribution::setCategory);
            dealerRepo.findById(req.getDealerId()).ifPresent(distribution::setDealer);
            contractRepo.findById(req.getContractId()).ifPresent(distribution::setContract);
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
        res.setId(distribution.getId());
        return res;

    }
}
