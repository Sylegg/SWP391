package com.lemon.supershop.swp391fa25evdm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableFeignClients(basePackages = "com.lemon.supershop.swp391fa25evdm.refra.MOMO.client")
@EnableScheduling
public class Swp391Fa25EvdmApplication {

	public static void main(String[] args) {
		SpringApplication.run(Swp391Fa25EvdmApplication.class, args);
	}

}
