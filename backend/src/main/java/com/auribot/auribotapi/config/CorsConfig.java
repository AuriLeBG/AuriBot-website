package com.auribot.auribotapi.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

	@Value("${auribot.cors.allowed-origins:*}")
	private String allowedOrigins;

	@Override
	public void addCorsMappings(CorsRegistry registry) {
		String[] origins = allowedOrigins.split(",");
		registry.addMapping("/**")
				.allowedOrigins(origins)
				.allowedMethods("GET", "POST", "OPTIONS")
				.allowedHeaders("*");
	}
}
