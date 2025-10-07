package com.lemon.supershop.swp391fa25evdm.refra.MOMO.client;

import com.lemon.supershop.swp391fa25evdm.refra.MOMO.dto.CreateMomoReq;
import com.lemon.supershop.swp391fa25evdm.refra.MOMO.dto.CreateMomoRes;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "momo", url = "${momo.end-point}")
public interface MomoApi {

    @PostMapping("/create")
    CreateMomoRes create(@RequestBody CreateMomoReq req);
}
