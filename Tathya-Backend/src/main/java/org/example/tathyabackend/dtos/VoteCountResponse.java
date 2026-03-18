package org.example.tathyabackend.dtos;

import lombok.Data;

@Data
public class VoteCountResponse {
    private int upvotes;
    private int downvotes;

    public VoteCountResponse(int upvotes, int downvotes) {
        this.upvotes = upvotes;
        this.downvotes = downvotes;
    }

}