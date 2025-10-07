package com.lemon.supershop.swp391fa25evdm.payment.service;

import com.lemon.supershop.swp391fa25evdm.dealer.model.entity.Dealer;
import com.lemon.supershop.swp391fa25evdm.dealer.repository.DealerRepo;
import com.lemon.supershop.swp391fa25evdm.payment.model.dto.request.InsPlanReq;
import com.lemon.supershop.swp391fa25evdm.payment.model.dto.response.InsPlanRes;
import com.lemon.supershop.swp391fa25evdm.payment.model.entity.InstallmentPlan;
import com.lemon.supershop.swp391fa25evdm.payment.repository.InsPlanRepo;
import com.lemon.supershop.swp391fa25evdm.product.model.entity.Product;
import com.lemon.supershop.swp391fa25evdm.product.repository.ProductRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class InsplanService {
    @Autowired
    private InsPlanRepo insPlanRepo;

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private DealerRepo dealerRepo;

    public List<InsPlanRes> getAllInstallmentPlans() {
        return insPlanRepo.findAll().stream().map(installmentPlan -> {
            return converttoRes(installmentPlan);
        }).collect(Collectors.toList());
    }

    public List<InsPlanRes> getInstallmentPlanByProductId(int id) {
        Optional<Product> product = productRepo.findById(id);
        if (product.isPresent()) {
            return insPlanRepo.findByProductId(id).stream().map(installmentPlan -> {
                InsPlanRes dto = new InsPlanRes(installmentPlan.getMonths(), installmentPlan.getInterestRate(), product.get().getName());
                dto.setMonthPrice((product.get().getDealerPrice()/installmentPlan.getMonths() * installmentPlan.getInterestRate())+ product.get().getDealerPrice()/installmentPlan.getMonths());
                return dto;
            }).collect(Collectors.toList());
        } else {
            return null;
        }
    }

    public InsPlanRes addInstallmentPlan(InsPlanReq dto) {
        InstallmentPlan installmentPlan = new InstallmentPlan();
        if (dto.getProductId() > 0){
            Product product = productRepo.findById(dto.getProductId()).get();
            if (product != null) {
                installmentPlan.setProduct(product);
            }
        }
        if (dto.getMonths() > 0){
            installmentPlan.setMonths(dto.getMonths());
        }
        if (dto.getInterestRate() > 0){
            installmentPlan.setInterestRate(dto.getInterestRate());
        }
        if (dto.getDealerId() > 0){
            Dealer dealer = dealerRepo.findById(dto.getDealerId()).get();
            if (dealer != null) {
                installmentPlan.setDealer(dealer);
            }
        }
        insPlanRepo.save(installmentPlan);
        return converttoRes(installmentPlan);
    }

    public InsPlanRes updateInstallmentPlan(int id, InsPlanReq dto) {
        Optional<InstallmentPlan> installmentPlan = insPlanRepo.findById(id);
        if (installmentPlan.isPresent()) {
            if (dto.getProductId() >= 0){
                Optional<Product> product = productRepo.findById(dto.getProductId());
                if (product.isPresent()) {
                    installmentPlan.get().setProduct(product.orElse(null));
                }
            }
            if (dto.getMonths() > 0){
                installmentPlan.get().setMonths(dto.getMonths());
            }
            if (dto.getInterestRate() > 0){
                installmentPlan.get().setInterestRate(dto.getInterestRate());
            }
            insPlanRepo.save(installmentPlan.get());
            return converttoRes(installmentPlan.orElse(null));
        }
        return null;
    }
    public void deleteInstallmentPlan(int id) {
        Optional<InstallmentPlan> installmentPlan = insPlanRepo.findById(id);
        if (installmentPlan.isPresent()) {
            insPlanRepo.delete(installmentPlan.get());
        }
    }

    public InsPlanRes converttoRes(InstallmentPlan installmentPlan){
        if (installmentPlan != null) {
            InsPlanRes dto = new InsPlanRes();
            if (installmentPlan.getMonths() > 0){
                dto.setMonths(installmentPlan.getMonths());
            }
            if (installmentPlan.getInterestRate() >= 0){
                dto.setInterestRate(installmentPlan.getInterestRate());
            }
            if (installmentPlan.getProduct() != null){
                dto.setProductName(installmentPlan.getProduct().getName());
                dto.setMonthPrice((installmentPlan.getProduct().getDealerPrice()/installmentPlan.getMonths() * installmentPlan.getInterestRate())+installmentPlan.getProduct().getDealerPrice()/installmentPlan.getMonths());
            }
            return dto;
        }
        return null;
    }
}
