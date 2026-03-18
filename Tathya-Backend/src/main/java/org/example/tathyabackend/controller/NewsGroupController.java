    package org.example.tathyabackend.controller;

    import org.example.tathyabackend.dtos.NewsGroupDto;
    import org.example.tathyabackend.model.News;
    import org.example.tathyabackend.service.NewsGroupService;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.http.HttpStatus;
    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.GetMapping;
    import org.springframework.web.bind.annotation.RequestMapping;
    import org.springframework.web.bind.annotation.RequestParam;
    import org.springframework.web.bind.annotation.RestController;

    import java.util.List;

    @RestController
    @RequestMapping("/newsGroup")
    public class NewsGroupController {

        @Autowired
        private NewsGroupService newsGroupService;

        @GetMapping("/get")
        public ResponseEntity<?> getNewsGroup(@RequestParam(name = "id") String id){
            NewsGroupDto news = newsGroupService.getNewsGroupById(id);
            return new ResponseEntity<>(news, HttpStatus.OK);
        }

        @GetMapping("/getAllLatest")
        public ResponseEntity<?> getNewsGroupByLatest(@RequestParam(name = "count") int count){
            List<NewsGroupDto> news = newsGroupService.getLatestNewsGroups(count);
            return new ResponseEntity<>(news, HttpStatus.OK);
        }

        @GetMapping("/getAllRelevant")
        public ResponseEntity<?> getNewsGroupByRelevant(@RequestParam(name = "count") int count){
            List<NewsGroupDto> news = newsGroupService.getRelevantNewsGroups(count);
            return new ResponseEntity<>(news, HttpStatus.OK);
        }

            @GetMapping("/getAllBlindSpots")
            public ResponseEntity<?> getNewsGroupByBlindSpots(@RequestParam(name = "count") int count){
                List<News> news = newsGroupService.getBlindSpotNews(count);
                return new ResponseEntity<>(news, HttpStatus.OK);
            }

        @GetMapping("/getNewsGroupByCategory")
        public ResponseEntity<?> getNewsGroupByCategory(@RequestParam(name = "category") String category, @RequestParam(name = "count") int count){
            List<NewsGroupDto> news = newsGroupService.getNewsGroupByCategory(category, count);
            return new ResponseEntity<>(news, HttpStatus.OK);
        }


    }
