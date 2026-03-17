package com.auribot.auribotapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AuribotApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(AuribotApiApplication.class, args);
	}

}
