package org.example.tathyabackend.service;

import org.example.tathyabackend.dtos.NewsGroupDto;
import org.example.tathyabackend.model.News;
import org.example.tathyabackend.model.NewsGroup;
import org.example.tathyabackend.repository.NewsGroupRepository;
import org.example.tathyabackend.repository.NewsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class NewsGroupService {

    private final NewsGroupRepository newsGroupRepository;


    private Set<String> groupedArticles;

    private final NewsRepository newsRepository;

    public NewsGroupService(NewsGroupRepository newsGroupRepository, NewsRepository newsRepository){
        this.newsGroupRepository = newsGroupRepository;
        this.newsRepository = newsRepository;
        this.groupedArticles = new HashSet<>();
        cache();
    }

    private void cache() {
        List<NewsGroup> allGroups = newsGroupRepository.findAll();
        for (NewsGroup group : allGroups) {
            List<String> articles = group.getArticles();
            if (articles != null) {
                this.groupedArticles.addAll(articles);
            }
        }
    }

    public NewsGroupDto getNewsGroupById(String id){
        Optional<NewsGroup> newsGroup = newsGroupRepository.findById(id);
        if(newsGroup.isEmpty()){
            throw new RuntimeException("No news group found with given id");
        }
        NewsGroup n = newsGroup.get();
        n.setViewCount(n.getViewCount() + 1);
        newsGroupRepository.save(n);
        List<News> news = newsRepository.findAllById(n.getArticles());
        return new NewsGroupDto(n.getId(), news, n.getSources(), n.getRecentPostedDate(), n.getViewCount());
    }

    public List<NewsGroupDto> getLatestNewsGroups(int count) {
        List<NewsGroup> newsGroups = newsGroupRepository.findTopByOrderByRecentPostedDateDesc(count);
        List<NewsGroupDto> newsGroupDtos = new ArrayList<>(newsGroups.size());

        for(int i=0; i<newsGroups.size(); i++){
            NewsGroup ng =   newsGroups.get(i);
            ng.setViewCount(ng.getViewCount() + 1);
            newsGroupRepository.save(ng);
            List<News> news = newsRepository.findAllById(ng.getArticles());
            newsGroupDtos.add(i, new NewsGroupDto(ng.getId(), news, ng.getSources(), ng.getRecentPostedDate(), ng.getViewCount()));
        }
        return newsGroupDtos;
    }

    public List<NewsGroupDto> getNewsGroupByCategory(String category, int count) {
        List<NewsGroup> newsGroups = newsGroupRepository.findAllByCategoryOrderByRecentPostedDateDesc(category, PageRequest.of(0, count));
        List<NewsGroupDto> newsGroupDtos = new ArrayList<>(newsGroups.size());

        for (int i = 0; i < newsGroups.size(); i++) {
            NewsGroup ng = newsGroups.get(i);
            ng.setViewCount(ng.getViewCount() + 1);
            newsGroupRepository.save(ng);
            List<News> news = newsRepository.findAllById(ng.getArticles());
            newsGroupDtos.add(i, new NewsGroupDto(
                    ng.getId(),
                    news,
                    ng.getSources(),
                    ng.getRecentPostedDate(),
                    ng.getViewCount()
            ));
        }
        return newsGroupDtos;
    }

    public List<NewsGroupDto> getRelevantNewsGroups(int count) {
        List<NewsGroup> newsGroups = newsGroupRepository.findAllByOrderByViewCountDesc(PageRequest.of(0, count));
        List<NewsGroupDto> newsGroupDtos = new ArrayList<>(newsGroups.size());

        for (int i = 0; i < newsGroups.size(); i++) {
            NewsGroup ng = newsGroups.get(i);
            ng.setViewCount(ng.getViewCount() + 1);
            newsGroupRepository.save(ng);
            List<News> news = newsRepository.findAllById(ng.getArticles());
            newsGroupDtos.add(i, new NewsGroupDto(
                    ng.getId(),
                    news,
                    ng.getSources(),
                    ng.getRecentPostedDate(),
                    ng.getViewCount()
            ));
        }
        return newsGroupDtos;
    }

    public List<News> getBlindSpotNews(int count) {
        if (groupedArticles.isEmpty()) {
            return newsRepository.findAll(PageRequest.of(0, count, Sort.by("postedAt").descending())).getContent();
        }
        return newsRepository.findByIdNotInPaged(
                groupedArticles,
                PageRequest.of(0, count, Sort.by("postedAt").descending())
        );
    }
}
