package org.example.tathyabackend.controller;

import com.sun.security.auth.UserPrincipal;
import lombok.AllArgsConstructor;
import org.example.tathyabackend.dtos.CommentRequest;
import org.example.tathyabackend.dtos.UserDto;
import org.example.tathyabackend.model.Comment;
import org.example.tathyabackend.model.News;
import org.example.tathyabackend.model.OrderBy;
import org.example.tathyabackend.repository.NewsRepository;
import org.example.tathyabackend.service.CommentService;
import org.example.tathyabackend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@AllArgsConstructor
@RestController
@RequestMapping("/comment")
public class CommentController {

    private final CommentService commentService;
    private final UserService userService;

    @PostMapping("/post")
    public ResponseEntity<Comment> postComment(@RequestBody CommentRequest request) {
        UserDto userInfo = userService.getBasicUserInfo(request.getUserId());
        Comment comment = commentService.postComment(
                userInfo,
                request.getNewsId(),
                request.getContent()
        );
        return new ResponseEntity<>(comment, HttpStatus.CREATED);
    }
    @DeleteMapping("/delete/{commentId}")
    public ResponseEntity<Void> postComment(@PathVariable String commentId){
        commentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/getAllByNews")
    public ResponseEntity<List<Comment>> getComments(@RequestParam String newsId, @RequestParam OrderBy orderBy){
        List<Comment> comments = commentService.getAllCommentsByNews(newsId, orderBy);
        return new ResponseEntity<>(comments, HttpStatus.OK);
    }

}
