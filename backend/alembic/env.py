from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import os
import sys

print(">>> RUNNING CORRECT ENV.PY <<<")
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'app')))

from app.core.models import Receipt, Item
from sqlmodel import SQLModel

target_metadata = SQLModel.metadata
print("Tables in target_metadata:", target_metadata.tables.keys())

config = context.config

if config.get_main_option("sqlalchemy.url").startswith("env:"):
    key = config.get_main_option("sqlalchemy.url").split("env:")[1]
    db_url = os.getenv(key)
    if not db_url:
        raise ValueError(f"Environment variable {key} is not set.")
    config.set_main_option("sqlalchemy.url", db_url)

def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    # Offline migrations are rarely needed for MVP/dev.
    pass
else:
    run_migrations_online()
