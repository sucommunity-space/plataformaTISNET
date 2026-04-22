import os
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[3]
BACKEND_DIR = PROJECT_ROOT / "backend"
FRONTEND_DIR = PROJECT_ROOT / "frontend"
FRONTEND_ASSETS_DIR = FRONTEND_DIR / "src" / "assets"
BASE_DIR = PROJECT_ROOT


def load_env_file(env_path):
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        existing_value = os.environ.get(key)
        if not key or (existing_value is not None and existing_value != ""):
            continue

        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
            value = value[1:-1]
        os.environ[key] = value


def load_environment():
    load_env_file(PROJECT_ROOT / ".env")
    load_env_file(BACKEND_DIR / ".env")
