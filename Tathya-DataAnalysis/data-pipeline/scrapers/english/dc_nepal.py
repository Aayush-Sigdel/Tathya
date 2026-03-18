import scrapy
from scrapy.crawler import CrawlerProcess
from datetime import datetime


class DcNepal(scrapy.Spider):

    name = "DC Nepal"

    def start_requests(self):
        self.proxy = ""
        self.language = "English"
        start_urls = {
            "Business": "https://english.dcnepal.com/category/business/",
            "Politics": "https://english.dcnepal.com/category/political/",
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
        news_links = response.css('h3.text__s.box__shadow a::attr(href)').getall()
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

        title = response.css('h1.entry-title.text__l ::text').get()
        date_str = response.css('div.post__time::text').get()
        image = response.css('div.post-thumbnail img::attr(src)').get()
        paragraphs = [p.strip() for p in response.css('div.single__content p::text').getall() if p.strip()]
        lead = ' '.join(paragraphs[:1]) if paragraphs else None
        description = ' '.join(paragraphs)

        date_str = date_str.split(":")[1].strip()

        date_obj = datetime.strptime(date_str, "%a, %d %b, %Y")
        formatted_date = date_obj.strftime("%Y/%m/%d")
        yield {
            'url': response.url,
            'title': title.strip() if title else None,
            'category': category,
            'lead': lead.strip() if lead else None,
            'description': description,
            "postedAt": formatted_date,
            "imageUrl": image,
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
            "out/dc_nepal.json": {
                "format": "json",
                "encoding": "utf8",
                "indent": 4, 
            },
        },
    })
    process.crawl(DcNepal)
    process.start()
