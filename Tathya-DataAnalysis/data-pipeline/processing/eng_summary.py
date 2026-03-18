from transformers import pipeline, BartTokenizer

summarizer = pipeline("summarization", model="facebook/bart-large-cnn", device=0)
tokenizer = BartTokenizer.from_pretrained("facebook/bart-large-cnn")

def truncate_text(text, max_tokens=1024):
    tokens = tokenizer.encode(text, truncation=True, max_length=max_tokens)
    return tokenizer.decode(tokens, skip_special_tokens=True)

def generate_summaries(texts, batch_size=32):
    summaries = []
    for i in range(0, len(texts), batch_size):
        batch_texts = texts[i:i+batch_size]
        try:
            batch_summaries = summarizer(batch_texts, max_length=250, min_length=150, do_sample=False)
            for summary in batch_summaries:
                s = summary['summary_text'].strip()
                if s and s[0].islower():
                    s = s[0].upper() + s[1:]
                summaries.append(s)
        except Exception as e:
            raise e
    return summaries
