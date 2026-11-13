package com.crud.demo;

import com.crud.demo.model.SparePart;
import com.crud.demo.repository.SparePartRepository;
import java.math.BigDecimal;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

	@Bean
	CommandLineRunner initDatabase(SparePartRepository repository) {
		return args -> {
			repository.save(new SparePart("Casco YYY", "DID", "ACCESORIOS",
					5, 5, 50,
					new BigDecimal("60000"), new BigDecimal("45000"), null));
			System.out.println("Repuesto guardado");
			repository.findAll().forEach((SparePart a)->{System.out.println("Name "+ a.getName());});
		};
	}
}
