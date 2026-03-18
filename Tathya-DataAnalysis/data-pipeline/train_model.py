import pandas as pd
from datasets import Dataset, load_dataset
from transformers import (
    DistilBertTokenizerFast,
    DistilBertForSequenceClassification,
    Trainer,
    TrainingArguments
)
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
import torch

ds = load_dataset(
    "vector-institute/newsmediabias-plus",
    token=""
)

train_split = ds["train"]

df = pd.DataFrame(train_split)
df = df[["article_text", "nlp_label"]]

label_map = {"Likely to be Bias": 1, "Likely to be Unbiased": 0}
df["label"] = df["nlp_label"].map(label_map)

train_df, test_df = train_test_split(df, test_size=0.15, stratify=df["label"], random_state=42)

train_ds = Dataset.from_pandas(train_df)
test_ds = Dataset.from_pandas(test_df)

tokenizer = DistilBertTokenizerFast.from_pretrained("distilbert-base-uncased")

def tokenize(batch):
    return tokenizer(
        batch["article_text"],
        truncation=True,
        padding="max_length",
        max_length=512
    )

train_ds = train_ds.map(tokenize, batched=True)
test_ds = test_ds.map(tokenize, batched=True)

train_ds.set_format(type="torch", columns=["input_ids", "attention_mask", "label"])
test_ds.set_format(type="torch", columns=["input_ids", "attention_mask", "label"])

model = DistilBertForSequenceClassification.from_pretrained(
    "distilbert-base-uncased",
    num_labels=2
)

def compute_metrics(pred):
    labels = pred.label_ids
    preds = pred.predictions.argmax(-1)
    acc = accuracy_score(labels, preds)
    precision, recall, f1, _ = precision_recall_fscore_support(labels, preds, average='binary')
    return {
        'accuracy': acc,
        'precision': precision,
        'recall': recall,
        'f1': f1
    }

training_args = TrainingArguments(
    output_dir="./biased_classifier",
    eval_strategy="epoch",
    save_strategy="epoch",
    per_device_train_batch_size=32,
    per_device_eval_batch_size=32,
    gradient_accumulation_steps=2,
    learning_rate=2e-5,
    weight_decay=0.01,
    num_train_epochs=5,
    logging_steps=100,
    fp16=True,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_ds,
    eval_dataset=test_ds,
    compute_metrics=compute_metrics
)

trainer.train()

trainer.save_model("./final_biased_model")
tokenizer.save_pretrained("./final_biased_model")

print("Training complete!")
