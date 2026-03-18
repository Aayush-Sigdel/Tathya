package org.example.tathyabackend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Id;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "votes")
@CompoundIndex(name = "user_news_metric_idx", def = "{'userId': 1, 'newsId': 1, 'metric': 1}", unique = true)
public class Vote {
    @Id
    private String id;
    private String userId;
    private String newsId;
    private String metric;
    private int value;
}
