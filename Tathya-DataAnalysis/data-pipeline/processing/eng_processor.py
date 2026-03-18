# used to group same news from multiple sites
from sentence_transformers import SentenceTransformer, util
from sklearn.cluster import AgglomerativeClustering
import torch

class EnglishNewsProcessor:

    def __init__(self, device=None):
        self.model = SentenceTransformer("all-mpnet-base-v2")
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)

    def process(self, input_data, similarity_threshold=0.85):
        all_texts = []
        all_meta = []

        for site in input_data:
            website = site["website"]
            news_dict = site["news"]
            for news_id, text in news_dict.items():
                all_texts.append(text)
                all_meta.append({"website": website, "news_id": news_id})

        embeddings = self.model.encode(all_texts, convert_to_tensor=True)

        cosine_scores = util.cos_sim(embeddings, embeddings)

        distance_matrix = 1 - cosine_scores.cpu().numpy()

        clustering_model = AgglomerativeClustering(
            n_clusters=None,
            metric='precomputed',
            linkage='complete',
            distance_threshold=1 - similarity_threshold
        )
        labels = clustering_model.fit_predict(distance_matrix)

        clusters = {}
        for idx, label in enumerate(labels):
            clusters.setdefault(label, []).append(all_meta[idx])
        
        filtered_clusters = {}
        for cluster_id, articles in clusters.items():
            seen_sites = set()
            filtered = []
            for article in articles:
                if article["website"] not in seen_sites:
                    filtered.append(article)
                    seen_sites.add(article["website"])
            if filtered:
                filtered_clusters[cluster_id] = filtered

        return filtered_clusters, cosine_scores, embeddings
