from collections.abc import Generator
from functools import lru_cache

from sqlmodel import Session

from src.db.database import create_db_engine


@lru_cache
def get_engine():
    return create_db_engine()


def get_db_session() -> Generator[Session, None, None]:
    with Session(get_engine()) as session:
        yield session
