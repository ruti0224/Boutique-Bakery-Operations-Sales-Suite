package com.example.cakesmenagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class CakesMenagementApplication {

	public static void main(String[] args) {
		SpringApplication.run(CakesMenagementApplication.class, args);
	}

}
