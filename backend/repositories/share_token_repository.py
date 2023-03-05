from uuid import uuid4

# In general there should be a token per chart but since chart is hardcoded it's ok to hardcode a single token too
share_token: str = str(uuid4())


def get_token() -> str:
    return share_token
