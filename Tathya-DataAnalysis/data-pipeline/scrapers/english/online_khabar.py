import scrapy
from scrapy.crawler import CrawlerProcess
from datetime import datetime


class OnlineKhabar(scrapy.Spider):

    name = "Online Khabar"

    def start_requests(self):
        self.proxy = ""
        self.language = "English"
        start_urls = {
            "Politics": "https://english.onlinekhabar.com/category/political",
            "Economy": "https://english.onlinekhabar.com/category/economy",
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
        news_links = response.css('div.listical-news-big div.ok-post-contents a::attr(href)').getall()
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

        next_page = response.css('a[class="next page-numbers"]::attr(href)').get()
        if next_page and page < 8:
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
        image = response.css('figure[class="wp-block-image size-full"] img::attr(src)').get()
        title = response.css('div.ok-post-header h1::text').get()
        date_str = response.css('span.ok-post-date::text').get()

        paragraphs = [p.strip() for p in response.css('div.post-content-wrap p::text').getall() if p.strip()]
        lead = ' '.join(paragraphs[:2]) if paragraphs else None
        description = ' '.join(paragraphs)

        date_obj = datetime.strptime(date_str, "%A, %B %d, %Y")
        formatted_date = date_obj.strftime("%Y/%m/%d")
        yield {
            'url': response.url,
            'title': title.strip() if title else None,
            'category': category,
            'imageUrl': image,
            'lead': lead.strip() if lead else None,
            'description': description,
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
            "out/online_khabar.json": {
                "format": "json",
                "encoding": "utf8",
                "indent": 4, 
            },
        },
    })
    process.crawl(OnlineKhabar)
    process.start()
