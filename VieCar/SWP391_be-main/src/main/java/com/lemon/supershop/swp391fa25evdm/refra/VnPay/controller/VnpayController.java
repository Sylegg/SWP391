package com.lemon.supershop.swp391fa25evdm.refra.VnPay.controller;

import com.lemon.supershop.swp391fa25evdm.configuration.VnpayConfig;
import com.lemon.supershop.swp391fa25evdm.refra.VnPay.model.dto.VnpayRes;
import com.lemon.supershop.swp391fa25evdm.refra.VnPay.service.VnpayService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("api/vnpay")
public class VnpayController {

    @Autowired
    private VnpayService vnpayService;

    @GetMapping("/create")
    public ResponseEntity<VnpayRes> create() throws UnsupportedEncodingException {
        VnpayRes vnpayRes = vnpayService.create();
        return ResponseEntity.ok(vnpayRes);
    }


}
