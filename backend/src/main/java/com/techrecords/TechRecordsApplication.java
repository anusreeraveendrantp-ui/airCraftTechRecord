package com.techrecords;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import com.techrecords.config.JwtProperties;

@SpringBootApplication
@EnableJpaAuditing
@EnableConfigurationProperties(JwtProperties.class)
public class TechRecordsApplication {

    public static void main(String[] args) {
        SpringApplication.run(TechRecordsApplication.class, args);
    }
}
