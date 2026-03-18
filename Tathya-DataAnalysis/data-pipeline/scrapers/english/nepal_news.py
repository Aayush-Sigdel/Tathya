import scrapy
from scrapy.crawler import CrawlerProcess
from datetime import datetime

class NepalNews(scrapy.Spider):

    name = "Nepal News"

    def start_requests(self):
        self.proxy = ""
        self.language = "English"
        start_urls = {
            "Politics": "https://english.nepalnews.com/s/politics/",
            "Business": "https://english.nepalnews.com/s/business/"
        }
        for category, url in start_urls.items():
            yield scrapy.Request(
                url=url, 
                callback=self.parse_listing, 
                meta={
                    'proxy': self.proxy,
                    'category': category
                }
            )

    def parse_listing(self, response):
        news_links = response.css('div.card.h-100 a::attr(href)').getall()
        page = response.meta.get("page", 1)
        category = response.meta.get("category")

        for news_link in news_links:
            yield scrapy.Request(
                url = news_link,
                callback = self.parse_news,
                meta={
                    'proxy': self.proxy,
                    'category': category
                }
            )

        next_page = response.css('i.page-link a::attr(href)').get()
        if next_page and page < 15:
            yield scrapy.Request(
                url = next_page,
                callback = self.parse_listing,
                meta={
                    'proxy': self.proxy,
                    'page': page + 1,
                    'category': category
                }
            )

    def parse_news(self, response):
        category = response.meta.get("category")
        image = response.css('div[class="single-image mt-3"] img::attr(src)').get()
        title = response.css('h2.title.home-main-title::text').get()
        lead = response.css('div.the-content p::text').get()
        description_parts = response.css('div.the-content p::text').getall()
        description = ' '.join([p.strip() for p in description_parts if p.strip()])
        date_str = response.css('div.time-meta span::text').get()
        date_obj = datetime.strptime(date_str, "%B %d, %Y")
        formatted_date = date_obj.strftime("%Y/%m/%d")

        yield {
            'url': response.url,
            'title': title.strip() if title else None,
            'category': category,
            'lead': lead.strip() if lead else None,
            'description': description,
            'imageUrl': image,
            "postedAt": formatted_date,
            "language": self.language,
            "newsPortal": self.name
        }
    
if __name__ == "__main__":
    process = CrawlerProcess(settings={
        "LOG_LEVEL": "INFO",
        "RETRY_ENABLED": True,
        "RETRY_TIMES": 20,
        "RETRY_HTTP_CODES": [404, 429, 500, 502, 503, 504],
        "CONCURRENT_REQUESTS": 15,
        "FEEDS": {
            "out/nepal_news.json": {
                "format": "json",
                "encoding": "utf8",
                "indent": 4, 
            },
        },
    })
    process.crawl(NepalNews)
    process.start()
