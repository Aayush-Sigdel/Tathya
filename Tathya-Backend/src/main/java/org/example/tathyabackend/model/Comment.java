package org.example.tathyabackend.model;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "comments")
public class Comment{

    @Id
    private String id;

    @Indexed
    private String newsId;

    @Indexed
    private long userId;

    private String displayName;
    private String content;
    private LocalDateTime createdAt;

    public Comment(String newsId, Long userId, String displayName, String content, LocalDateTime createdAt) {
        this.newsId = newsId;
        this.userId = userId;
        this.displayName = displayName;
        this.content = content;
        this.createdAt = createdAt;
    }
}

