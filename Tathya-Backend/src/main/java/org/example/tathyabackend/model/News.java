package org.example.tathyabackend.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import org.springframework.data.annotation.Id;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Setter
@Getter
@Document(collection = "news")
public class News {

    @Id
    private String id;

    private String url;

    private String title;

    private String category;

    private String lead;

    private String description;

    private LocalDate postedAt;

    private String imageUrl;

    private String language;

    private String newsPortal;

    private Metrics metrics;

    private String summary;

    private Integer bias;

    private Double normalizedBias;


    public News() {
    }

}