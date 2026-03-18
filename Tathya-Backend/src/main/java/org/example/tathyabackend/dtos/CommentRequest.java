package org.example.tathyabackend.dtos;

import lombok.Data;

@Data
public class CommentRequest {
    String newsId;
    String content;
    long userId;
}
