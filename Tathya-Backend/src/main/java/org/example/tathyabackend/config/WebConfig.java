package org.example.tathyabackend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload.base-dir}")
    private String baseDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path absolutePath = Paths.get(System.getProperty("user.dir")).resolve(baseDir).toAbsolutePath();
        String resourceLocation = absolutePath.toUri().toString(); // file:/.../

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(resourceLocation);
    }
}
