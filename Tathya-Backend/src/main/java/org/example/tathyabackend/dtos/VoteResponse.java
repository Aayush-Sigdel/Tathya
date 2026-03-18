package org.example.tathyabackend.dtos;

import lombok.Data;

@Data
public class    VoteResponse {
    public String status;
    public int value;

    public VoteResponse(String status, int value) {
        this.status = status;
        this.value = value;
    }
}
