package org.example.tathyabackend.repository;

import org.example.tathyabackend.model.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CommentRepository extends MongoRepository<Comment, String> {

    List<Comment> findByNewsIdOrderByCreatedAtDesc(String newsId);

    List<Comment> findByNewsIdOrderByCreatedAtAsc(String newsId);
}
