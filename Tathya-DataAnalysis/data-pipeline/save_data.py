from processing.eng_processor import EnglishNewsProcessor
import json
from processing.eng_summary import generate_summaries, truncate_text
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId
from transformers import pipeline

MONGO_URL = ""

def save_data():
    client = MongoClient(MONGO_URL)
    db = client["tathya"]
    collection = db["news"]

    data_paths = [
        # json file paths here
    ]

    all_docs = []
    count = 0
    texts_to_summarize = []

    for path in data_paths:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, dict):
                data = [data]

            for doc in data:
                description = doc.get("description", "").strip()
                if description:
                    all_docs.append(doc)
                    texts_to_summarize.append(truncate_text(description))

    summaries = generate_summaries(texts_to_summarize, batch_size=32)

    for doc, summary in zip(all_docs, summaries):
        doc["summary"] = summary
        print(doc)
        print(count)
        count += 1
    if all_docs:
        collection.insert_many(all_docs)
        print(f"✅ Inserted {len(all_docs)} documents into MongoDB.")
    else:
        print("⚠️ No documents found to insert.")

def delete_online_khabar_docs():
    client = MongoClient("")
    db = client["tathya"]
    collection = db["news"]

    result = collection.delete_many({"newsPortal": "Online Khabar"})
    print(f"Deleted {result.deleted_count} documents from MongoDB with newsPortal='Online Khabar'.")

def remove_sentiment_from_metrics():
    client = MongoClient(MONGO_URL)
    db = client["tathya"]
    collection = db["news"]

    cursor = collection.find({"metrics.sentiment": {"$exists": True}})
    count = 0

    for doc in cursor:
        metrics = doc.get("metrics", {})
        if "sentiment" in metrics:
            del metrics["sentiment"]

            collection.update_one(
                {"_id": doc["_id"]},
                {"$set": {"metrics": metrics}}
            )
            count += 1
            print(f"Removed sentiment from document {doc['_id']}")

    print(f"Removed sentiment from {count} documents.")


def group_data():
    client = MongoClient(MONGO_URL)
    db = client["tathya"]
    news_collection = db["news"]
    group_collection = db["news_group"]

    all_docs = list(news_collection.find({}))
    print(f"Retrieved {len(all_docs)} news documents from DB.")

    doc_lookup = {str(doc["_id"]): doc for doc in all_docs}

    site_to_docs = {}
    for doc in all_docs:
        site = doc.get("newsPortal", "Unknown")
        doc_id = str(doc["_id"])
        title = doc.get("title", "")
        lead = doc.get("summary", "")
        posted_at = doc.get("postedAt", "")
        text = f"[Posted Date: {posted_at}] [Title: {title}] [Summary: {lead}]"

        if site not in site_to_docs:
            site_to_docs[site] = {}
        site_to_docs[site][doc_id] = text

    input_data = [{"website": site, "news": news} for site, news in site_to_docs.items()]

    processor = EnglishNewsProcessor()
    clusters, scores, embeddings = processor.process(input_data, similarity_threshold=0.80)

    print(f"Found {len(clusters)} clusters before filtering.")

    inserted_count = 0

    for cluster_id, articles in clusters.items():
        if len(articles) <= 1:
            continue

        seen_sites = set()
        filtered_articles = []

        for article in articles:
            article_id = str(article["news_id"])
            site = article["website"]

            if site in seen_sites:
                continue

            seen_sites.add(site)
            filtered_articles.append(article_id)

        if len(filtered_articles) <= 1:
            continue

        posted_dates = []
        for a in filtered_articles:
            posted_at = doc_lookup[a].get("postedAt", "")
            if posted_at:
                try:
                    posted_dates.append(datetime.strptime(posted_at, "%Y/%m/%d"))
                except ValueError:
                    pass

        if posted_dates:
            recentPostedDate = max(posted_dates).strftime("%Y/%m/%d")
        else:
            recentPostedDate = ""

        group_doc = {
            "articles": [ObjectId(a) for a in filtered_articles if ObjectId.is_valid(a)],
            "sources": [doc_lookup[a]["newsPortal"] for a in filtered_articles],
            "recentPostedDate": recentPostedDate
        }

        group_collection.insert_one(group_doc)
        inserted_count += 1
    print(f"Inserted {inserted_count} filtered groups into 'news_group' collection.")

# group_data()
# save_data()