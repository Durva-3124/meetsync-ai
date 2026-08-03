import os

from app.intelligence.embeddings import rank_by_similarity


def test_rank_by_similarity_similar_and_dissimilar():
    query = "A quick brown fox jumps over the lazy dog."
    candidates = [
        "A fast brown fox leaps over a lazy dog.",  # similar
        "The stock market crashed yesterday.",
    ]

    ranked = rank_by_similarity(query, candidates)
    # the most similar candidate should be the first one we expect
    assert ranked[0][0] == candidates[0]
    assert ranked[0][1] > ranked[1][1]


def test_rank_by_similarity_known_pairs():
    # known-similar vs known-dissimilar for a short phrase
    query = "I love playing football"
    similar = "Soccer is my favorite sport"
    dissimilar = "This recipe needs two eggs and a cup of sugar"

    ranked = rank_by_similarity(query, [similar, dissimilar])
    assert ranked[0][0] == similar
    assert ranked[0][1] > ranked[1][1]
