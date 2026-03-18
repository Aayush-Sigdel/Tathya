import { CheerioCrawler, PlaywrightCrawler, ProxyConfiguration, Dataset } from 'crawlee';
import fs from 'fs';
import { start } from 'repl';

const proxy = ""

const post_links = [];
const timeoutInMs = 5000;

const domain = "https://kathmandupost.com"

const crawler = new PlaywrightCrawler({
  proxyConfiguration: new ProxyConfiguration({ proxyUrls: [proxy] }),
  minConcurrency: 1,
  maxConcurrency: 4,
  maxRequestRetries: 5,
  requestHandlerTimeoutSecs: 10000,
  launchContext: {
    launchOptions: {
      headless: false,
    }
  }
});

const crawler2 = new CheerioCrawler({
  proxyConfiguration: new ProxyConfiguration({ proxyUrls: [proxy] }),
  minConcurrency: 1,
  maxConcurrency: 10,
  maxRequestRetries: 5,
});

let totalClicks = 0;

crawler.router.addHandler("LISTING",async ({crawler, browserController, parseWithCheerio, request, page, body, enqueueLinks, log}) => {
    await page.waitForSelector('span[class="btn btn-default load-more-btn"]', {
        timeout: timeoutInMs,
    });
    while (true) {
        try {
            await page.waitForTimeout(500);
            const button = await page.waitForSelector('span[class="btn btn-default load-more-btn"]', { timeout: 15000 });
            await button.click();
            totalClicks++;

            if(totalClicks >= 20) break;
        } catch (err) {
            break;
        }
    }
    const $ = await parseWithCheerio();
    const url = [];
    $('div.block--morenews article.article-image > a').each((_, post) => {
        let link = $(post).attr('href');
        post_links.push({url: domain + link, category: request.userData.category})
    });
  },
);

crawler2.router.addHandler("POST",async ({ crawler, request, enqueueLinks, $, log, proxyInfo, body }) => {
   const category = request.userData.category;
   const title = $('div.col-sm-8 h1').text().trim();

   const description = $('section.story-section p')
     .map((_, el) => $(el).text().trim())
     .get()
     .join('\n');
   const lead = $('section.story-section p').first().text().trim();
   const date = $('div.updated-time').first().text().trim();
   const dateString = date.replace('Published at : ', '').trim();
   const dateObj = new Date(dateString);
   const postedAt = `${dateObj.getFullYear()}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getDate()).padStart(2, '0')}`;
   const imageUrl = $('div.col-sm-8 img.img-responsive').first().attr('data-src');
   log.info(`Scraped: ${title}`);
 
   const data = {
     url: request.url,
     title,
     lead,
     description,
     postedAt,
     category,
     imageUrl,
     language: "English",
     newsPortal: "The Kathmandu Post"
   };
 
   await crawler.pushData(data);
 
   return data;
});

const startUrls = [
  {url: "https://kathmandupost.com/politics", category: "Politics"},
  {url: "https://kathmandupost.com/money", category: "Money"},
];

const urls = [];

for(let startUrl of startUrls){
  urls.push({
    url: startUrl.url,
    label: 'LISTING',
    userData: {
      category: startUrl.category
    }
  });
}

await crawler.run(urls);

const urls2 = []

for(let postLink of post_links){
  urls2.push({
    url: postLink.url,
    label: 'POST',
    userData: {
      category: postLink.category
    }
  });
}

await crawler2.run(urls2);


const dataset = await Dataset.open();
const { items } = await dataset.getData();

fs.writeFileSync('out/kathmandu_post.json', JSON.stringify(items, null, 2));
console.log(`Saved ${items.length} posts to out/kathmandu_post.json`);