package org.example.tathyabackend.repository;

import org.example.tathyabackend.model.News;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.Collection;
import java.util.List;

public interface NewsRepository extends MongoRepository<News, String> {

    @Query("{ '_id': { $nin: ?0 } }")
    List<News> findByIdNotInPaged(Collection<String> ids, Pageable pageable);

}