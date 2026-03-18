package org.example.tathyabackend.dtos;

import org.example.tathyabackend.model.News;

import java.time.LocalDate;
import java.util.List;

public class NewsGroupDto {


    private String groupId;

    private List<News> news;

    private List<String> sources;

    private LocalDate recentPostedDate;

    private int viewCount;

    public NewsGroupDto(){

    }

    public NewsGroupDto(String groupId, List<News> news, List<String> sources, LocalDate recentPostedDate, int viewCount){
        this.groupId = groupId;
        this.news = news;
        this.sources = sources;
        this.recentPostedDate = recentPostedDate;
        this.viewCount = viewCount;
    }

    public int getViewCount() {
        return viewCount;
    }

    public LocalDate getRecentPostedDate() {
        return recentPostedDate;
    }

    public void setRecentPostedDate(LocalDate recentPostedDate) {
        this.recentPostedDate = recentPostedDate;
    }

    public String getGroupId() {
        return groupId;
    }

    public void setGroupId(String groupId) {
        this.groupId = groupId;
    }

    public List<News> getNews() {
        return news;
    }

    public void setNews(List<News> news) {
        this.news = news;
    }

    public List<String> getSources() {
        return sources;
    }

    public void setSources(List<String> sources) {
        this.sources = sources;
    }
}
