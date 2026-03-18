package org.example.tathyabackend.repository;

import org.example.tathyabackend.model.News;
import org.example.tathyabackend.model.NewsGroup;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.Collection;
import java.util.List;

public interface NewsGroupRepository extends MongoRepository<NewsGroup, String> {
    @Query("{}")
    List<NewsGroup> findTopByOrderByRecentPostedDateDesc(org.springframework.data.domain.Pageable pageable);

    default List<NewsGroup> findTopByOrderByRecentPostedDateDesc(int count) {
        return this.findTopByOrderByRecentPostedDateDesc(org.springframework.data.domain.PageRequest.of(0, count, org.springframework.data.domain.Sort.by("recentPostedDate").descending()));
    }

    // Otherwise, use Pageable
    List<NewsGroup> findAllByOrderByViewCountDesc(Pageable pageable);

    @Query("{ 'articles': { $size: ?0 } }")
    List<NewsGroup> findAllByArticlesSize(int articleCount, Pageable pageable);

    List<NewsGroup> findAllByCategoryOrderByRecentPostedDateDesc(String category, PageRequest of);
}