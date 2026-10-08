import os
from collections.abc import Generator

from sqlalchemy.engine import Engine
from sqlmodel import Session, create_engine


def get_database_url() -> str:
    url = os.getenv("DATABASE_URL")

    if not url:
        raise RuntimeError("DATABASE_URL environment variable is required")

    return url


def create_db_engine(database_url: str | None = None) -> Engine:
    url = database_url or get_database_url()

    return create_engine(
        url,
        pool_pre_ping=True,
    )


def get_session(
    engine: Engine,
) -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
