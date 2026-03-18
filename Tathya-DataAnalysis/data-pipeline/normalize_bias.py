# the model will assign a bias of 0 or 1 to a document, but it may not always be fully reliable or acurate
# so we calculate a normalized bias (0-1) 
# by combining the model bias with other signals such as user upvotes/downvotes for bias metrics 
# and the normalized bias (0-1) of past news from the same news portal

from pymongo import MongoClient
from datetime import datetime

W_MODEL = 0.6  
W_VOTE = 0.2 
W_PAST = 0.2 

NEUTRAL = 0.5

MONGO_URL = ""

client = MongoClient(MONGO_URL)
db = client["tathya"]
collection = db["news"]



def parse_date(date_str):
    try:
        return datetime.strptime(date_str, "%Y/%m/%d")
    except:
        return datetime.min

def compute_crowd_score(upvote, downvote):
    total = upvote + downvote
    if total == 0:
        return NEUTRAL
    return upvote / total



cursor = collection.find({}, batch_size=1500) \
                   .sort("postedAt", 1)

portal_bias_map = {}

try:
    for doc in cursor:
        portal = doc.get("newsPortal", "unknown")
        ai_bias = doc.get("bias", 0)
        
        metrics = doc.get("metrics", {}).get("politicalBiasness", {})
        upvote = metrics.get("upvote", 0)
        downvote = metrics.get("downvote", 0)

        crowd_score = compute_crowd_score(upvote, downvote)

        past_bias = portal_bias_map.get(portal, NEUTRAL)

        normalized_bias = (
            W_MODEL * ai_bias +
            W_VOTE * crowd_score +
            W_PAST * past_bias
        )

        normalized_bias = max(0, min(1, normalized_bias))

        portal_bias_map[portal] = normalized_bias

        collection.update_one(
            {"_id": doc["_id"]},
            {"$set": {"normalizedBias": normalized_bias}}
        )

finally:
    cursor.close()
    client.close()