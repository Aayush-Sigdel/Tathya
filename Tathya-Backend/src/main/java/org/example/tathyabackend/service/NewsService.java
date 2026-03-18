package org.example.tathyabackend.service;

import org.example.tathyabackend.model.News;
import org.example.tathyabackend.repository.NewsRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class NewsService {

    private final NewsRepository newsRepository;

    public NewsService(NewsRepository newsRepository){
        this.newsRepository = newsRepository;
    }

    public News getNewsById(String id){
        Optional<News> news = newsRepository.findById(id);
        if(news.isEmpty()){
            throw new RuntimeException("No news found for given id");
        }
        return news.get();
    }
}
