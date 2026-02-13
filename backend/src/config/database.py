from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from src.config.settings import settings
import os

Base = declarative_base()


def _build_engine():
    """Create database engine with SQLite fallback if MySQL is unavailable."""
    db_url = settings.database_url

    # Try MySQL first
    if "mysql" in db_url:
        try:
            mysql_url = db_url if "mysqlconnector" in db_url else db_url.replace("mysql://", "mysql+mysqlconnector://")
            engine = create_engine(
                mysql_url,
                pool_pre_ping=True,
                pool_recycle=300,
                pool_size=settings.database_pool_size,
                max_overflow=settings.database_max_overflow,
                echo=(settings.environment == "development"),
            )
            # Quick connectivity check
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("[OK] Connected to MySQL database")
            return engine
        except Exception as e:
            print(f"[WARN] MySQL unavailable ({e}), falling back to SQLite")

    # SQLite fallback
    db_dir = os.path.dirname(os.path.abspath(__file__))
    sqlite_path = os.path.normpath(os.path.join(db_dir, "..", "..", "jarvis.db"))
    sqlite_url = f"sqlite:///{sqlite_path}"

    engine = create_engine(
        sqlite_url,
        connect_args={"check_same_thread": False},
        echo=(settings.environment == "development"),
    )
    print(f"[OK] Using SQLite database: {sqlite_path}")
    return engine


engine = _build_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Create all tables. Safe to call multiple times."""
    from src.models import database_models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    print("[OK] Database tables created / verified")


def get_db():
    """Dependency: yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()