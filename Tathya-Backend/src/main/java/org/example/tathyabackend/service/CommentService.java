package org.example.tathyabackend.service;

import lombok.AllArgsConstructor;
import org.example.tathyabackend.dtos.UserDto;
import org.example.tathyabackend.model.Comment;
import org.example.tathyabackend.model.OrderBy;
import org.example.tathyabackend.repository.CommentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@Service
public  class CommentService{
    private final CommentRepository commentRepository;


    public Comment postComment(UserDto userInfo, String newsId, String content) {
        LocalDateTime currentDateTime = LocalDateTime.now();
        Comment comment = new Comment(newsId , userInfo.getId(), userInfo.getName(), content, currentDateTime);
        return commentRepository.save(comment);
    }

    public void deleteComment(String commentId) {
        commentRepository.deleteById(commentId);
    }

    public List<Comment> getAllCommentsByNews(String newsId, OrderBy orderBy) {
        if(orderBy == OrderBy.NEWEST){
            return commentRepository.findByNewsIdOrderByCreatedAtDesc(newsId);
        }
        if(orderBy == OrderBy.OLDEST){
            return commentRepository.findByNewsIdOrderByCreatedAtAsc(newsId);
        }
        return List.of();
    }

}
