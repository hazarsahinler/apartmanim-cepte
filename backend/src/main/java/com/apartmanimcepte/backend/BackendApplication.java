package com.apartmanimcepte.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;

@SpringBootApplication(exclude = { HibernateJpaAutoConfiguration.class })
@EntityScan(basePackages = {
		"com.apartmanimcepte.backend.identity.entity",
		"com.apartmanimcepte.backend.structure.entity",
		"com.apartmanimcepte.backend.finance.entity"
})
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

}