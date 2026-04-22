import logging
import os
import threading
from contextlib import contextmanager
from urllib.parse import parse_qsl, unquote, urlencode, urlparse

import psycopg
from psycopg import errors, sql
from psycopg.rows import dict_row

from backend.src.config.env import BACKEND_DIR


SCHEMA_PATH = BACKEND_DIR / "schema.sql"
BOOTSTRAP_STATE = {"attempted": False, "ready": False, "error": None}
BOOTSTRAP_LOCK = threading.RLock()
BOOTSTRAP_ADVISORY_LOCK_ID = 91827451
SEED_CALLBACK = None

logger = logging.getLogger("tisnet.database")


def register_seed_callback(callback):
    global SEED_CALLBACK
    SEED_CALLBACK = callback


def database_name():
    explicit_name = os.getenv("POSTGRES_DATABASE", "").strip() or os.getenv("PGDATABASE", "").strip()
    if explicit_name:
        return explicit_name

    database_url = os.getenv("DATABASE_URL", "").strip()
    if database_url:
        parsed = urlparse(database_url)
        if parsed.path and parsed.path != "/":
            return unquote(parsed.path.lstrip("/"))

    return "tisnet_db"


def admin_database_name():
    return os.getenv("POSTGRES_ADMIN_DATABASE", "postgres").strip() or "postgres"


def connection_string(include_database=True):
    database_url = os.getenv("DATABASE_URL", "").strip()
    if not database_url:
        return ""
    if include_database:
        return database_url

    parsed = urlparse(database_url)
    query_pairs = [
        (key, value)
        for key, value in parse_qsl(parsed.query, keep_blank_values=True)
        if key.lower() != "dbname"
    ]
    return parsed._replace(path=f"/{admin_database_name()}", query=urlencode(query_pairs)).geturl()


def postgres_config(include_database=True):
    connect_timeout = int(os.getenv("POSTGRES_CONNECT_TIMEOUT", "5"))
    conninfo = connection_string(include_database=include_database)
    if conninfo:
        return {"conninfo": conninfo, "connect_timeout": connect_timeout}

    config = {
        "host": os.getenv("POSTGRES_HOST", os.getenv("PGHOST", "127.0.0.1")),
        "port": int(os.getenv("POSTGRES_PORT", os.getenv("PGPORT", "5432"))),
        "user": os.getenv("POSTGRES_USER", os.getenv("PGUSER", "postgres")),
        "password": os.getenv("POSTGRES_PASSWORD", os.getenv("PGPASSWORD", "")),
        "dbname": database_name() if include_database else admin_database_name(),
        "connect_timeout": connect_timeout,
    }

    sslmode = os.getenv("POSTGRES_SSLMODE", os.getenv("PGSSLMODE", "")).strip()
    if sslmode:
        config["sslmode"] = sslmode

    return config


def connect_database(include_database=True, autocommit=False):
    connection = psycopg.connect(**postgres_config(include_database=include_database))
    connection.autocommit = autocommit
    return connection


def dict_cursor(connection):
    return connection.cursor(row_factory=dict_row)


def apply_schema(connection):
    with connection.cursor() as cursor:
        cursor.execute(SCHEMA_PATH.read_text(encoding="utf-8"))
    connection.commit()


def ensure_database_exists():
    admin_connection = connect_database(include_database=False, autocommit=True)
    try:
        with admin_connection.cursor() as cursor:
            cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (database_name(),))
            exists = cursor.fetchone()
            if exists:
                return
            cursor.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(database_name())))
    finally:
        if admin_connection and not admin_connection.closed:
            admin_connection.close()


def ensure_database_bootstrapped(force=False):
    if BOOTSTRAP_STATE["ready"] and not force:
        return True

    with BOOTSTRAP_LOCK:
        if BOOTSTRAP_STATE["ready"] and not force:
            return True

        BOOTSTRAP_STATE["attempted"] = True
        BOOTSTRAP_STATE["ready"] = False
        BOOTSTRAP_STATE["error"] = None

        database_connection = None
        advisory_lock_acquired = False

        try:
            try:
                database_connection = connect_database()
            except Exception as connect_error:
                if isinstance(connect_error, errors.InvalidCatalogName):
                    logger.warning(
                        "La base de datos objetivo no existe todavia. Intentando crearla: %s",
                        connect_error,
                    )
                    ensure_database_exists()
                    database_connection = connect_database()
                else:
                    raise

            with database_connection.cursor() as cursor:
                cursor.execute("SELECT pg_advisory_lock(%s)", (BOOTSTRAP_ADVISORY_LOCK_ID,))
            advisory_lock_acquired = True

            apply_schema(database_connection)
            if SEED_CALLBACK is not None:
                SEED_CALLBACK(database_connection)
            BOOTSTRAP_STATE["ready"] = True
            logger.info("Base de datos PostgreSQL inicializada correctamente.")
            return True
        except Exception as exc:
            BOOTSTRAP_STATE["error"] = str(exc)
            logger.error("No se pudo inicializar la base de datos PostgreSQL: %s", exc)
            return False
        finally:
            if (
                advisory_lock_acquired
                and database_connection is not None
                and not database_connection.closed
            ):
                try:
                    with database_connection.cursor() as cursor:
                        cursor.execute("SELECT pg_advisory_unlock(%s)", (BOOTSTRAP_ADVISORY_LOCK_ID,))
                except Exception:
                    logger.warning("No se pudo liberar el advisory lock de bootstrap.", exc_info=True)
            if database_connection is not None and not database_connection.closed:
                database_connection.close()


def database_error_message():
    if BOOTSTRAP_STATE["error"]:
        return BOOTSTRAP_STATE["error"]
    return "La base de datos no esta lista todavia."


def require_database():
    if ensure_database_bootstrapped():
        return
    raise RuntimeError(database_error_message())


@contextmanager
def db_cursor(dictionary=False):
    require_database()
    connection = connect_database()
    cursor = dict_cursor(connection) if dictionary else connection.cursor()
    try:
        yield connection, cursor
    finally:
        cursor.close()
        connection.close()
