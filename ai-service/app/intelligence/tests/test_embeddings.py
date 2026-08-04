import numpy as np
import pytest

from app.intelligence import embeddings


class DummySentenceTransformer:
    def __init__(self, model_name: str, device: str = "cpu"):
        self.model_name = model_name
        self.device = device

    def encode(
        self,
        texts,
        batch_size: int,
        show_progress_bar: bool,
        convert_to_numpy: bool,
        normalize_embeddings: bool,
    ):
        assert convert_to_numpy is True
        assert show_progress_bar is False

        mapping = {
            "query": np.array([1.0, 0.0, 0.0], dtype=float),
            "similar": np.array([0.8, 0.2, 0.0], dtype=float),
            "dissimilar": np.array([0.0, 1.0, 0.0], dtype=float),
        }

        output = []
        for text in texts:
            vector = mapping.get(text, np.array([float(len(text)), 0.0, 0.0], dtype=float))
            if normalize_embeddings:
                norm = np.linalg.norm(vector) or 1.0
                vector = vector / norm
            output.append(vector)

        return np.vstack(output)


@pytest.fixture(autouse=True)
def clear_model_cache():
    embeddings._MODEL_CACHE.clear()
    yield
    embeddings._MODEL_CACHE.clear()


def test_embed_returns_empty_list_for_no_texts(monkeypatch):
    monkeypatch.setattr(embeddings, "SentenceTransformer", DummySentenceTransformer)
    assert embeddings.embed([]) == []


def test_embed_returns_normalized_vectors_and_uses_cached_model(monkeypatch):
    monkeypatch.setattr(embeddings, "SentenceTransformer", DummySentenceTransformer)

    first_model = embeddings.get_embedding_model("dummy", device="cpu")
    second_model = embeddings.get_embedding_model("dummy", device="cpu")
    assert first_model is second_model

    vectors = embeddings.embed(["query", "similar"], model_name="dummy", device="cpu", batch_size=2)
    assert len(vectors) == 2
    assert all(len(vec) == 3 for vec in vectors)
    assert pytest.approx(np.linalg.norm(vectors[0]), rel=1e-6) == 1.0
    assert pytest.approx(np.linalg.norm(vectors[1]), rel=1e-6) == 1.0


def test_rank_by_similarity_sorts_candidates_by_cosine_similarity(monkeypatch):
    def fake_embed(texts, model_name, device, batch_size):
        return [
            np.array([1.0, 0.0, 0.0], dtype=float),
            np.array([0.8, 0.2, 0.0], dtype=float),
            np.array([0.0, 1.0, 0.0], dtype=float),
        ]

    monkeypatch.setattr(embeddings, "embed", fake_embed)

    results = embeddings.rank_by_similarity("query", ["similar", "dissimilar"], model_name="dummy", device="cpu")
    assert results[0][0] == "similar"
    assert results[1][0] == "dissimilar"
    assert results[0][1] > results[1][1]


def test_rank_by_similarity_returns_empty_for_no_candidates():
    assert embeddings.rank_by_similarity("query", []) == []
