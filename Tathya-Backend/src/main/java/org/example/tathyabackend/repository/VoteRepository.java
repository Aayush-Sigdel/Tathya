package org.example.tathyabackend.repository;

import org.example.tathyabackend.model.Vote;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface VoteRepository extends MongoRepository<Vote, String> {
    Optional<Vote> findByUserIdAndNewsIdAndMetric(String userId, String newsId, String metric);

}
