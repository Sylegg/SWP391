package com.lemon.supershop.swp391fa25evdm.payment.service;

import com.lemon.supershop.swp391fa25evdm.payment.model.dto.response.InsPaymentRes;
import com.lemon.supershop.swp391fa25evdm.payment.model.entity.InstallmentPayment;
import com.lemon.supershop.swp391fa25evdm.payment.model.entity.InstallmentPlan;
import com.lemon.supershop.swp391fa25evdm.payment.repository.InsPaymentRepo;
import com.lemon.supershop.swp391fa25evdm.payment.repository.InsPlanRepo;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class InsPaymentService {

    @Autowired
    private InsPaymentRepo insPaymentRepo;

    @Autowired
    private InsPlanRepo insPlanRepo;

    public List<InsPaymentRes> getInstallmentPaymentByInsPlanId(int id) {
        Optional<InstallmentPlan> installmentPlan = insPlanRepo.findById(id);
        if (installmentPlan.isPresent()) {
            return insPaymentRepo.findByInstallmentPlan_Id(installmentPlan.get().getId()).stream().map(installmentPayment -> {
                return convertInstallpaymenttoInsPaymentRes(installmentPayment);
            }).collect(Collectors.toList());
        } else {
            return null;
        }
    }

    public List<InsPaymentRes> createInstallmentPaymentbyPlanId(int id) {
        InstallmentPlan installmentPlan = insPlanRepo.findById(id).orElseThrow(() -> new RuntimeException("Installment plan not found"));;
        if (installmentPlan != null) {
            double expectedAmount = (installmentPlan.getProduct().getDealerPrice()/installmentPlan.getMonths() * installmentPlan.getInterestRate()) + (installmentPlan.getProduct().getDealerPrice()/installmentPlan.getMonths());
            List<InsPaymentRes> insPaymentResList = new ArrayList<>();
            for (int i = 1; i <= installmentPlan.getMonths(); i++){
                LocalDateTime dueDate  = LocalDateTime.now().plusMonths(i);
                InstallmentPayment  payment = new InstallmentPayment(i, expectedAmount, dueDate);

                payment.setInstallmentPlan(installmentPlan);
                installmentPlan.getInspayments().add(payment);
                insPaymentRepo.save(payment);

                InsPaymentRes insPaymentRes = convertInstallpaymenttoInsPaymentRes(payment);
                insPaymentResList.add(insPaymentRes);
            }
            return insPaymentResList;
        }
        return null;
    }

    public void deleteInstallmentPayment(int id) {
        Optional<InstallmentPayment> payment = insPaymentRepo.findById(id);
        if (payment.isPresent()) {
            insPaymentRepo.delete(payment.get());
        }
    }
    @Transactional
    public void deleteAllInstallmentPayment(int id) {
        Optional<InstallmentPlan> paymentPlan = insPlanRepo.findById(id);
        if (paymentPlan.isPresent()) {
//            List<InstallmentPayment> payments = paymentPlan.get().getInspayments();
//            for (InstallmentPayment payment : payments) {
//                Optional<InstallmentPayment> installmentPayment = insPaymentRepo.findById(payment.getId());
//                if (installmentPayment.isPresent()) {
//                    insPaymentRepo.delete(installmentPayment.get());
//                }
//            }
//            paymentPlan.get().setInspayments(null);
            insPaymentRepo.deleteByPlanId(id);
        }
    }

    public InsPaymentRes convertInstallpaymenttoInsPaymentRes(InstallmentPayment installmentPayment) {
        InsPaymentRes insPaymentRes = new InsPaymentRes();
        if (installmentPayment != null) {
            if (installmentPayment.getInstallmentNumber() > 0){
                insPaymentRes.setInstallmentNumber(installmentPayment.getInstallmentNumber());
            }
            if (installmentPayment.getDueDate() != null){
                insPaymentRes.setDueDate(installmentPayment.getDueDate());
            }
            if (installmentPayment.getExpectedAmount() >=0){
                insPaymentRes.setExpectedAmount(installmentPayment.getExpectedAmount());
            }
            insPaymentRes.setPaid(installmentPayment.isPaid());
        }
        return insPaymentRes;
    }
}
