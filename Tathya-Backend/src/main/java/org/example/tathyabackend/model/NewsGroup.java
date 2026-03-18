package org.example.tathyabackend.model;

import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.tathyabackend.service.NewsGroupService;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "news_group")
public class NewsGroup {

    @Id
    private String id;

    private List<String> articles;

    private List<String> sources;

    private LocalDate recentPostedDate;

    private Integer viewCount = 0;

    private String category ;

}
