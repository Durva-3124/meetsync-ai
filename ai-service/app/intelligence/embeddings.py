"""Embeddings utilities for intelligence pipelines."""

from __future__ import annotations

from typing import Iterable, List, Tuple

import numpy as np

_DEFAULT_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
_MODEL_CACHE: dict[str, object] = {}
SentenceTransformer = None


def get_embedding_model(model_name: str = _DEFAULT_MODEL, device: str = "cpu") -> object:
    global SentenceTransformer
    if SentenceTransformer is None:
        from sentence_transformers import SentenceTransformer as _SentenceTransformer

        SentenceTransformer = _SentenceTransformer

    cache_key = f"{model_name}@{device}"
    if cache_key not in _MODEL_CACHE:
        _MODEL_CACHE[cache_key] = SentenceTransformer(model_name, device=device)
    return _MODEL_CACHE[cache_key]


def embed(texts: Iterable[str], model_name: str = _DEFAULT_MODEL, device: str = "cpu", batch_size: int = 32) -> list[list[float]]:
    """Return normalized embedding vectors for the provided texts."""
    texts_list = list(texts)
    if not texts_list:
        return []

    model = get_embedding_model(model_name=model_name, device=device)
    embeddings = model.encode(
        texts_list,
        batch_size=batch_size,
        show_progress_bar=False,
        convert_to_numpy=True,
        normalize_embeddings=True,
    )
    return [vector.tolist() for vector in embeddings]


def rank_by_similarity(query: str, candidates: Iterable[str], model_name: str = _DEFAULT_MODEL, device: str = "cpu", batch_size: int = 32) -> List[Tuple[str, float]]:
    """Rank candidate texts by cosine similarity to the query.

    Returns a list of (candidate, similarity) sorted descending by similarity.
    """
    candidates_list = list(candidates)
    if not candidates_list:
        return []

    # Embed query + candidates together so model batching is efficient and
    # vectors are comparable in the same space.
    texts = [query] + candidates_list
    embs = embed(texts, model_name=model_name, device=device, batch_size=batch_size)

    q = np.asarray(embs[0], dtype=float)
    cembs = np.asarray(embs[1:], dtype=float)

    # If embeddings are normalized (embed() requests normalization), cosine
    # similarity is just the dot product. Compute robustly anyway.
    q_norm = np.linalg.norm(q)
    c_norms = np.linalg.norm(cembs, axis=1)
    # Avoid division by zero
    denom = c_norms * (q_norm or 1.0)
    sims = np.dot(cembs, q) / np.where(denom == 0, 1.0, denom)

    results: List[Tuple[str, float]] = []
    for candidate, sim in zip(candidates_list, sims.tolist()):
        results.append((candidate, float(sim)))

    results.sort(key=lambda x: x[1], reverse=True)
    return results
