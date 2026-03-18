package org.example.tathyabackend.dtos;

import lombok.Data;

@Data
public class VoteRequest {
    public String userId;
    public String newsId;
    public String metric;
    public int value;
}
