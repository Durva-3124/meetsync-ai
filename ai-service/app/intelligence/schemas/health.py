"""Schemas for service health responses."""

from pydantic import BaseModel


class HealthResponse(BaseModel):
    """Standard health-check response."""

    status: str
