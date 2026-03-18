package org.example.tathyabackend.controller;

import lombok.AllArgsConstructor;
import org.example.tathyabackend.dtos.VoteCountResponse;
import org.example.tathyabackend.dtos.VoteRequest;
import org.example.tathyabackend.dtos.VoteResponse;
import org.example.tathyabackend.service.VoteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@AllArgsConstructor
@RestController
@RequestMapping("/votes")
public class VoteController {
    private final VoteService voteService;

    @PostMapping("/vote")
    public ResponseEntity<VoteResponse> vote(@RequestBody VoteRequest req) {

        String status = voteService.vote(req.userId, req.newsId, req.metric, req.value);
        return ResponseEntity.ok(new VoteResponse(status, req.value));
    }

    @GetMapping("/check")
    public ResponseEntity<?> check(@RequestParam String userId,
                                   @RequestParam String newsId,
                                   @RequestParam String metric) {
        Integer val = voteService.getUserVoteValue(userId, newsId, metric);
        if (val == null) {
            return ResponseEntity.ok().body(
                    new Object() {
                        public final boolean voted = false;
                        public final Integer value = null;
                    }
            );
        } else {
            return ResponseEntity.ok().body(
                    new Object() {
                        public final boolean voted = true;
                        public final Integer value = val;
                    }
            );
        }
    }
    @GetMapping("/get-vote-count")
    public ResponseEntity<VoteCountResponse> getVoteCount(@RequestParam String newsId,
                                                          @RequestParam String metric) {
        return ResponseEntity.ok(voteService.getVoteCount(newsId, metric));
    }
}
