from uuid import UUID

from fastapi import HTTPException

from models.comment_thread import CommentThread
from repositories import share_token_repository


def validate_token(token: str) -> None:
    expected_token = share_token_repository.get_token()

    if token != expected_token:
        raise HTTPException(404, "Page Not Found")


def get_share_token() -> str:
    return share_token_repository.get_token()
