# calculate bias for each news article(0: unlikely or 1: likely, binary classification), which would be later converted
# to 0-1 normalized bias scale (by also including community votes and records of that news portal) 

import torch
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
from pymongo import MongoClient
import pandas as pd

MONGO_URL = ""

MODEL_PATH = "./final_biased_model"

tokenizer = DistilBertTokenizerFast.from_pretrained(MODEL_PATH)
model = DistilBertForSequenceClassification.from_pretrained(MODEL_PATH)
model.eval()

id2label = {0: "Likely to be Unbiased", 1: "Likely to be Bias"}

client = MongoClient(MONGO_URL)
db = client["tathya"]
collection = db["news"]

def predict_bias(text: str):
    encoded = tokenizer(
        text,
        truncation=True,
        padding="max_length",
        max_length=512,
        return_tensors="pt"
    )

    with torch.no_grad():
        logits = model(**encoded).logits
        pred_id = torch.argmax(logits, dim=1).item()
        return id2label[pred_id], pred_id

cursor = collection.find({})

for doc in cursor:
    description = doc.get("description", "")

    if not description:
        print(f"Skipping doc {doc['_id']} (no description)")
        continue

    bias_label, bias_id = predict_bias(description)

    print(f"Doc ID: {doc['_id']}")
    print(f"Description: {description[:80]}...")
    print(f"Predicted Biased: {bias_label}\n")
    print(bias_id)

    collection.update_one(
        {"_id": doc["_id"]},
        {"$set": {"bias": bias_id}}
    )

print("Finished updating all documents.")
