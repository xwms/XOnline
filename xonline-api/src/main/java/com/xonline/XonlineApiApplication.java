package com.xonline;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
/**
 * @author Cloud.dislite.top
 * @date 2022
 */
@SpringBootApplication(scanBasePackages = "com.xonline")
public class XonlineApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(XonlineApiApplication.class, args);
    }

}
