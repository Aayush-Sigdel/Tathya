package org.example.tathyabackend.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.example.tathyabackend.util.StringToLocalDateConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;

import java.util.List;

@Configuration
public class MongoConfig extends AbstractMongoClientConfiguration {

    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;

    @Override
    public MongoClient mongoClient() {
        return MongoClients.create(mongoUri);
    }

    @Override
    public MongoCustomConversions customConversions() {
        return new MongoCustomConversions(List.of(new StringToLocalDateConverter()));
    }

    @Override
    protected String getDatabaseName() {
        return "tathya";
    }
}
