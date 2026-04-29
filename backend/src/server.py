import json
import logging
import os
import re
import smtplib
from contextlib import contextmanager
from datetime import date, datetime, time, timedelta
from decimal import Decimal
from email.message import EmailMessage
from functools import wraps
from io import BytesIO

from flask import Flask, jsonify, request, send_file, send_from_directory, session
from fpdf import FPDF
from werkzeug.exceptions import BadRequest
from werkzeug.security import check_password_hash, generate_password_hash

from backend.src.config.database import (
    BOOTSTRAP_STATE,
    database_error_message as pg_database_error_message,
    db_cursor as pg_db_cursor,
    dict_cursor,
    ensure_database_bootstrapped as pg_ensure_database_bootstrapped,
    register_seed_callback,
    require_database as pg_require_database,
)
from backend.src.config.env import (
    BASE_DIR,
    BACKEND_DIR,
    FRONTEND_ASSETS_DIR,
    FRONTEND_DIR,
    PROJECT_ROOT,
    load_environment,
)


load_environment()

SITE_SETTINGS_ID = 1
DEFAULT_WHATSAPP = "+51999999999"
CALENDLY_PLACEHOLDER_URL = "https://calendly.com/your-calendly-link"
CALENDLY_LEGACY_PLACEHOLDERS = {
    CALENDLY_PLACEHOLDER_URL,
    "https://calendly.com/tu-cuenta",
}
OWNER_ADMIN_EMAIL_PLACEHOLDERS = {"tu-admin@dominio.com"}
OWNER_SALES_EMAIL_PLACEHOLDERS = {"ventas@dominio.com"}
OWNER_PASSWORD_PLACEHOLDERS = {
    "cambia-esta-clave-super-segura",
    "cambia-la-clave-de-ventas",
}
OWNER_WEBSITE_PLACEHOLDERS = {
    "https://tudominio.com",
    "https://tu-dominio.com",
}


def is_calendly_placeholder(value):
    return (value or "").strip() in CALENDLY_LEGACY_PLACEHOLDERS


def resolve_env_value(env_name, default_value, *, placeholders=None, lowercase=False):
    value = os.getenv(env_name, "").strip()
    normalized_placeholders = {
        item.lower().strip() if lowercase else item.strip() for item in (placeholders or set())
    }
    comparable_value = value.lower() if lowercase else value

    if not value or comparable_value in normalized_placeholders:
        return default_value

    return comparable_value if lowercase else value


DEFAULT_CALENDLY = resolve_env_value(
    "CALENDLY_PUBLIC_URL",
    CALENDLY_PLACEHOLDER_URL,
    placeholders=CALENDLY_LEGACY_PLACEHOLDERS,
)
DEFAULT_CLIENT_REVIEW_CALENDLY = (
    resolve_env_value(
        "CALENDLY_CLIENT_REVIEW_URL",
        DEFAULT_CALENDLY,
        placeholders=CALENDLY_LEGACY_PLACEHOLDERS,
    )
    or DEFAULT_CALENDLY
)
DEFAULT_CLIENT_CLOSE_CALENDLY = (
    resolve_env_value(
        "CALENDLY_CLIENT_CLOSE_URL",
        DEFAULT_CALENDLY,
        placeholders=CALENDLY_LEGACY_PLACEHOLDERS,
    )
    or DEFAULT_CALENDLY
)
CALENDLY_PERSONAL_ACCESS_TOKEN = os.getenv("CALENDLY_PERSONAL_ACCESS_TOKEN", "").strip()
DEFAULT_OWNER_ADMIN_EMAIL = "admin@tisnet.pe"
DEFAULT_OWNER_ADMIN_PASSWORD = "define-una-clave-admin-segura"
DEFAULT_OWNER_SALES_EMAIL = "ventas@tisnet.pe"
DEFAULT_OWNER_SALES_PASSWORD = "define-una-clave-ventas-segura"
DEFAULT_AUTO_CLIENT_PASSWORD = "define-una-clave-cliente-segura"
SERVICE_LABELS = {
    "web": "Página web",
    "ecommerce": "E-commerce",
    "crm": "CRM / ERP",
    "branding": "Branding",
    "automation": "Automatización",
    "diagnostic": "Diagnóstico",
    "consulting": "Consultoría",
}
LEAD_STATUS_ORDER = ["new", "contacted", "negotiating", "won"]
PROJECT_STATUS_ORDER = ["backlog", "in_progress", "review", "delivered"]
TASK_STATUS_ORDER = ["pending", "in_progress", "done"]
TASK_PRIORITY_ORDER = ["low", "medium", "high"]
PROCESS_STAGE_ORDER = ["kickoff", "diagnostic", "proposal", "execution", "delivery"]
PROCESS_STAGE_LABELS = {
    "kickoff": "Kickoff",
    "diagnostic": "Diagnostico",
    "proposal": "Propuesta tecnica comercial",
    "execution": "Ejecucion del proyecto",
    "delivery": "Entrega final",
}
PROCESS_STAGE_COPY = {
    "kickoff": "Primera reunion y arranque formal del proyecto.",
    "diagnostic": "Formulario, evaluacion y validacion del diagnostico.",
    "proposal": "Revision y aprobacion de la propuesta tecnica comercial.",
    "execution": "Avances, validaciones y retroalimentacion de entregables.",
    "delivery": "Cierre, entrega final y reunion de conformidad.",
}
TEAM_MEMBER_SEED = [
    {
        "full_name": "Cristian Arens",
        "role_title": "Lider de estrategia",
        "email": "cristian@tisnet.pe",
        "accent_color": "#0A66C2",
    },
    {
        "full_name": "Carla Olivieri",
        "role_title": "Lider de automatizacion",
        "email": "carla@tisnet.pe",
        "accent_color": "#00D4FF",
    },
    {
        "full_name": "Philip UX UI",
        "role_title": "Especialista UX/UI",
        "email": "philip@tisnet.pe",
        "accent_color": "#8B5CF6",
    },
    {
        "full_name": "Javier QA",
        "role_title": "Integracion y QA",
        "email": "javier@tisnet.pe",
        "accent_color": "#F59E0B",
    },
]
QUOTE_TERMS = [
    "Validez: 10 dias calendario desde la emision.",
    "Pago: 50% de anticipo y 50% contra entrega.",
    "Contenido: textos, imagenes y logos son provistos por el cliente.",
    "Hosting y dominio: se cotizan aparte si no fueron seleccionados.",
    "Revisiones: incluye 3 rondas de ajustes sobre el alcance aprobado.",
    "Garantia: 30 dias de soporte tecnico posterior a la entrega.",
]
DEMO_ACCOUNTS = {
    "client": {"email": "cliente.demo@tisnet.pe", "password": "ClienteDemo2026!"},
    "admin": {"email": "admin.demo@tisnet.pe", "password": "AdminDemo2026!"},
    "sales": {"email": "ventas.demo@tisnet.pe", "password": "VentasDemo2026!"},
}
ENABLE_DEMO_LOGIN = os.getenv("ENABLE_DEMO_LOGIN", "false").strip().lower() in {
    "1",
    "true",
    "yes",
    "on",
}
ENABLE_SAMPLE_DATA = os.getenv("ENABLE_SAMPLE_DATA", "false").strip().lower() in {
    "1",
    "true",
    "yes",
    "on",
}
OWNER_ADMIN_ACCOUNT = {
    "full_name": resolve_env_value("OWNER_ADMIN_NAME", "Administrador Principal TISNET")
    or "Administrador Principal TISNET",
    "email": resolve_env_value(
        "OWNER_ADMIN_EMAIL",
        DEFAULT_OWNER_ADMIN_EMAIL,
        placeholders=OWNER_ADMIN_EMAIL_PLACEHOLDERS,
        lowercase=True,
    )
    or DEFAULT_OWNER_ADMIN_EMAIL,
    "password": resolve_env_value(
        "OWNER_ADMIN_PASSWORD",
        DEFAULT_OWNER_ADMIN_PASSWORD,
        placeholders=OWNER_PASSWORD_PLACEHOLDERS,
    )
    or DEFAULT_OWNER_ADMIN_PASSWORD,
    "company": os.getenv("OWNER_ADMIN_COMPANY", "TISNET").strip() or "TISNET",
    "website": resolve_env_value(
        "OWNER_ADMIN_WEBSITE",
        "https://tisnet.pe",
        placeholders=OWNER_WEBSITE_PLACEHOLDERS,
    )
    or "https://tisnet.pe",
    "phone": os.getenv("OWNER_ADMIN_PHONE", DEFAULT_WHATSAPP).strip() or DEFAULT_WHATSAPP,
}
OWNER_SALES_ACCOUNT = {
    "full_name": resolve_env_value("OWNER_SALES_NAME", "Ejecutivo Comercial TISNET")
    or "Ejecutivo Comercial TISNET",
    "email": resolve_env_value(
        "OWNER_SALES_EMAIL",
        DEFAULT_OWNER_SALES_EMAIL,
        placeholders=OWNER_SALES_EMAIL_PLACEHOLDERS,
        lowercase=True,
    )
    or DEFAULT_OWNER_SALES_EMAIL,
    "password": resolve_env_value(
        "OWNER_SALES_PASSWORD",
        DEFAULT_OWNER_SALES_PASSWORD,
        placeholders=OWNER_PASSWORD_PLACEHOLDERS,
    )
    or DEFAULT_OWNER_SALES_PASSWORD,
    "company": os.getenv("OWNER_SALES_COMPANY", "TISNET").strip() or "TISNET",
    "website": resolve_env_value(
        "OWNER_SALES_WEBSITE",
        "https://tisnet.pe",
        placeholders=OWNER_WEBSITE_PLACEHOLDERS,
    )
    or "https://tisnet.pe",
    "phone": os.getenv("OWNER_SALES_PHONE", DEFAULT_WHATSAPP).strip() or DEFAULT_WHATSAPP,
}


app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False
app.secret_key = os.getenv("FLASK_SECRET_KEY", "tisnet-dev-secret-change-me")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("tisnet")


def now_utc():
    return datetime.utcnow()


def service_label(service_code):
    return SERVICE_LABELS.get(service_code, service_code.replace("_", " ").title())


def task_status_label(status):
    labels = {
        "pending": "Pendiente",
        "in_progress": "En proceso",
        "done": "Terminada",
    }
    return labels.get(status, status.replace("_", " ").title())


def meeting_status_label(status):
    labels = {
        "scheduled": "Programado",
        "confirmed": "Confirmado",
        "completed": "Completada",
        "cancelled": "Cancelada",
        "canceled": "Cancelada",
    }
    status = (status or "scheduled").strip().lower()
    return labels.get(status, status.replace("_", " ").title())


def safe_json_dumps(payload):
    return json.dumps(payload, ensure_ascii=False, default=str)


def normalize_value(value):
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, time):
        return value.strftime("%H:%M:%S")
    if isinstance(value, Decimal):
        return float(value)
    return value


def normalize_row(row):
    return {key: normalize_value(value) for key, value in row.items()}


def ensure_database_bootstrapped(force=False):
    return pg_ensure_database_bootstrapped(force=force)


def database_error_message():
    return pg_database_error_message()


def require_database():
    return pg_require_database()


@contextmanager
def db_cursor(dictionary=False):
    with pg_db_cursor(dictionary=dictionary) as context:
        yield context


def fetch_one(query, params=()):
    with db_cursor(dictionary=True) as (_, cursor):
        cursor.execute(query, params)
        row = cursor.fetchone()
        return normalize_row(row) if row else None


def fetch_all(query, params=()):
    with db_cursor(dictionary=True) as (_, cursor):
        cursor.execute(query, params)
        return [normalize_row(row) for row in cursor.fetchall()]


def execute_write(query, params=()):
    with db_cursor() as (connection, cursor):
        clean_query = query.strip().rstrip(";")
        expects_id = clean_query.upper().startswith("INSERT ")
        if expects_id and "RETURNING " not in clean_query.upper():
            clean_query = f"{clean_query} RETURNING id"

        cursor.execute(clean_query, params)
        inserted_id = None
        if expects_id:
            row = cursor.fetchone()
            inserted_id = row[0] if row else None
        connection.commit()
        return inserted_id


def execute_rowcount(query, params=()):
    with db_cursor() as (connection, cursor):
        cursor.execute(query, params)
        affected = cursor.rowcount
        connection.commit()
        return affected


def execute_many(query, param_list):
    with db_cursor() as (connection, cursor):
        cursor.executemany(query, param_list)
        connection.commit()


def count_table(connection, table_name):
    cursor = connection.cursor()
    cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
    total = cursor.fetchone()[0]
    cursor.close()
    return total


def fetch_value(connection, query, params=()):
    cursor = connection.cursor()
    cursor.execute(query, params)
    row = cursor.fetchone()
    cursor.close()
    return row[0] if row else None


def ensure_role(connection, code, name):
    role_id = fetch_value(connection, "SELECT id FROM roles WHERE code = %s", (code,))
    if role_id:
        return role_id
    cursor = connection.cursor()
    cursor.execute("INSERT INTO roles (code, name) VALUES (%s, %s) RETURNING id", (code, name))
    role_id = cursor.fetchone()[0]
    connection.commit()
    cursor.close()
    return role_id


def ensure_site_settings(connection):
    cursor = connection.cursor()
    cursor.execute(
        """
        INSERT INTO site_settings (
            id,
            agency_name,
            contact_email,
            notification_email,
            whatsapp_phone,
            public_calendly_url,
            client_review_calendly_url,
            client_close_calendly_url,
            hero_cta_label,
            footer_tagline
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (id) DO UPDATE
        SET
            agency_name = EXCLUDED.agency_name,
            contact_email = EXCLUDED.contact_email,
            notification_email = EXCLUDED.notification_email,
            whatsapp_phone = EXCLUDED.whatsapp_phone,
            public_calendly_url = COALESCE(NULLIF(site_settings.public_calendly_url, ''), EXCLUDED.public_calendly_url),
            client_review_calendly_url = COALESCE(NULLIF(site_settings.client_review_calendly_url, ''), EXCLUDED.client_review_calendly_url),
            client_close_calendly_url = COALESCE(NULLIF(site_settings.client_close_calendly_url, ''), EXCLUDED.client_close_calendly_url),
            hero_cta_label = EXCLUDED.hero_cta_label,
            footer_tagline = EXCLUDED.footer_tagline
        """,
        (
            SITE_SETTINGS_ID,
            "TISNET",
            "hola@tisnet.pe",
            "hola@tisnet.pe",
            DEFAULT_WHATSAPP,
            DEFAULT_CALENDLY,
            DEFAULT_CLIENT_REVIEW_CALENDLY,
            DEFAULT_CLIENT_CLOSE_CALENDLY,
            "Solicita tu reunion",
            "Agencia integral de tecnología y creatividad. Transformamos ideas en sistemas digitales escalables.",
        ),
    )
    connection.commit()
    cursor.close()

    settings_cursor = dict_cursor(connection)
    settings_cursor.execute(
        """
        SELECT public_calendly_url, client_review_calendly_url, client_close_calendly_url
        FROM site_settings
        WHERE id = %s
        """,
        (SITE_SETTINGS_ID,),
    )
    current = settings_cursor.fetchone() or {}
    settings_cursor.close()

    public_url = current.get("public_calendly_url") or ""
    review_url = current.get("client_review_calendly_url") or ""
    close_url = current.get("client_close_calendly_url") or ""

    if is_calendly_placeholder(public_url) or not public_url:
        public_url = DEFAULT_CALENDLY
    if is_calendly_placeholder(review_url) or not review_url:
        review_url = DEFAULT_CLIENT_REVIEW_CALENDLY
    if is_calendly_placeholder(close_url) or not close_url:
        close_url = DEFAULT_CLIENT_CLOSE_CALENDLY

    update_cursor = connection.cursor()
    update_cursor.execute(
        """
        UPDATE site_settings
        SET public_calendly_url = %s,
            client_review_calendly_url = %s,
            client_close_calendly_url = %s
        WHERE id = %s
        """,
        (public_url, review_url, close_url, SITE_SETTINGS_ID),
    )
    connection.commit()
    update_cursor.close()

    meetings_cursor = connection.cursor()
    meetings_cursor.execute(
        """
        UPDATE meetings
        SET calendly_url = %s
        WHERE calendly_url IS NULL OR calendly_url = '' OR calendly_url = %s OR calendly_url = %s
        """,
        (public_url, CALENDLY_PLACEHOLDER_URL, "https://calendly.com/tu-cuenta"),
    )
    connection.commit()
    meetings_cursor.close()


def ensure_user(connection, role_id, full_name, email, password, company="", website="", phone="", is_demo=False):
    user_id = fetch_value(connection, "SELECT id FROM users WHERE email = %s", (email,))
    password_hash = generate_password_hash(password)

    if user_id:
        cursor = connection.cursor()
        cursor.execute(
            """
            UPDATE users
            SET role_id = %s,
                full_name = %s,
                password_hash = %s,
                company = %s,
                website = %s,
                phone = %s,
                is_demo = %s
            WHERE id = %s
            """,
            (role_id, full_name, password_hash, company, website, phone, int(is_demo), user_id),
        )
        connection.commit()
        cursor.close()
        return user_id

    cursor = connection.cursor()
    cursor.execute(
        """
        INSERT INTO users (role_id, full_name, email, password_hash, company, website, phone, is_demo)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
        """,
        (role_id, full_name, email, password_hash, company, website, phone, int(is_demo)),
    )
    user_id = cursor.fetchone()[0]
    connection.commit()
    cursor.close()
    return user_id


def ensure_operator_account(connection, role_id, account, legacy_emails=None):
    email = (account.get("email") or "").strip().lower()
    legacy_emails = {
        candidate.strip().lower()
        for candidate in (legacy_emails or [])
        if candidate and candidate.strip()
    }
    candidate_emails = [email, *sorted(legacy_emails - {email})]

    user_id = None
    for candidate_email in candidate_emails:
        user_id = fetch_value(connection, "SELECT id FROM users WHERE email = %s", (candidate_email,))
        if user_id:
            break

    password_hash = generate_password_hash(account["password"])
    full_name = account["full_name"]
    company = account.get("company", "")
    website = account.get("website", "")
    phone = account.get("phone", "")

    if user_id:
        cursor = connection.cursor()
        cursor.execute(
            """
            UPDATE users
            SET role_id = %s,
                full_name = %s,
                email = %s,
                password_hash = %s,
                company = %s,
                website = %s,
                phone = %s,
                is_demo = 0
            WHERE id = %s
            """,
            (role_id, full_name, email, password_hash, company, website, phone, user_id),
        )
        connection.commit()
        cursor.close()
        return user_id

    return ensure_user(connection, role_id, full_name, email, account["password"], company, website, phone, False)


def ensure_team_member(connection, full_name, role_title, email="", accent_color="#0A66C2"):
    lookup_value = (email or "").strip().lower()
    member_id = None

    if lookup_value:
        member_id = fetch_value(connection, "SELECT id FROM team_members WHERE email = %s", (lookup_value,))
    if not member_id:
        member_id = fetch_value(connection, "SELECT id FROM team_members WHERE full_name = %s", (full_name,))

    cursor = connection.cursor()
    if member_id:
        cursor.execute(
            """
            UPDATE team_members
            SET full_name = %s,
                role_title = %s,
                email = %s,
                accent_color = %s,
                is_active = 1
            WHERE id = %s
            """,
            (full_name, role_title, lookup_value, accent_color, member_id),
        )
        connection.commit()
        cursor.close()
        return member_id

    cursor.execute(
        """
        INSERT INTO team_members (full_name, role_title, email, accent_color, is_active)
        VALUES (%s, %s, %s, %s, 1) RETURNING id
        """,
        (full_name, role_title, lookup_value, accent_color),
    )
    member_id = cursor.fetchone()[0]
    connection.commit()
    cursor.close()
    return member_id


def seed_portfolio(connection):
    if count_table(connection, "portfolio_items") > 0:
        return

    items = [
        (
            "tiendapro-retail",
            "E-commerce",
            "TiendaPro - Retail Digital",
            "Plataforma e-commerce preparada para catálogo, leads y seguimiento comercial.",
            "Caso de retail digital con catálogo administrable, automatizaciones de contacto y tablero comercial para dar seguimiento a pedidos y oportunidades.",
            "Checkout optimizado",
            "CRM integrado",
            "Automatización de seguimiento",
            "🛒",
            1,
        ),
        (
            "gestcorp-crm",
            "CRM / Odoo",
            "GestCorp - Sistema de Gestión",
            "Implementación CRM para organizar ventas, reuniones y pipeline comercial.",
            "Proyecto orientado a centralizar oportunidades, reuniones, presupuestos y avances en un solo panel conectado con la operación comercial.",
            "Pipeline visual",
            "Seguimiento de leads",
            "Reportes ejecutivos",
            "📊",
            2,
        ),
        (
            "leadbot-automatizacion",
            "Automatización",
            "LeadBot - Captación Automática",
            "Embudos automatizados para responder, clasificar y agendar reuniones.",
            "Automatización de captación con formularios, mensajes de seguimiento, alertas internas y agenda integrada para acelerar el cierre comercial.",
            "Respuestas automáticas",
            "Agenda conectada",
            "Etiquetado inteligente",
            "🤖",
            3,
        ),
        (
            "novamarca-branding",
            "Branding",
            "NovaMarca - Identidad Visual",
            "Sistema visual completo para una marca con crecimiento multicanal.",
            "Diseño de identidad, tono visual, piezas base y criterios de consistencia para expansión digital y comercial.",
            "Manual visual",
            "Piezas base",
            "Escalabilidad de marca",
            "🎯",
            4,
        ),
        (
            "consultgroup-web",
            "Web Corporativa",
            "ConsultGroup - Sitio Institucional",
            "Sitio corporativo para presentar servicios, casos y captar reuniones.",
            "Web institucional con enfoque comercial, secciones de confianza, CTA estratégicos y formularios para convertir visitas en conversaciones.",
            "Formulario optimizado",
            "Casos de éxito",
            "CTA de conversión",
            "💼",
            5,
        ),
        (
            "agileops-dashboard",
            "Plataforma SaaS",
            "AgileOps - Dashboard Interno",
            "Dashboard interno para operaciones, métricas y coordinación diaria.",
            "Panel centralizado para monitorear métricas, tareas, equipo y estado de clientes en tiempo real con enfoque operativo.",
            "Métricas vivas",
            "Panel interno",
            "Control operacional",
            "⚡",
            6,
        ),
    ]

    cursor = connection.cursor()
    cursor.executemany(
        """
        INSERT INTO portfolio_items (
            slug, category, title, short_description, long_description,
            highlight_1, highlight_2, highlight_3, icon, display_order
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
        items,
    )
    connection.commit()
    cursor.close()


def seed_showcase_clients(connection):
    if count_table(connection, "showcase_clients") > 0:
        return

    cursor = dict_cursor(connection)
    cursor.execute("SELECT id, slug FROM portfolio_items ORDER BY id")
    portfolio_map = {row["slug"]: row["id"] for row in cursor.fetchall()}
    cursor.close()
    clients = [
        ("RetailCo", "Retail", "https://retailco.example", portfolio_map.get("tiendapro-retail"), 1),
        ("NovaBrand", "Branding", "https://novabrand.example", portfolio_map.get("novamarca-branding"), 2),
        ("LogistPeru", "Logística", "https://logistperu.example", portfolio_map.get("agileops-dashboard"), 3),
        ("StartupHub", "Tecnología", "https://startuphub.example", portfolio_map.get("leadbot-automatizacion"), 4),
        ("DigitalPyme", "Servicios", "https://digitalpyme.example", portfolio_map.get("gestcorp-crm"), 5),
        ("ConsultGroup", "Consultoría", "https://consultgroup.example", portfolio_map.get("consultgroup-web"), 6),
        ("MercadoXtra", "Comercio", "https://mercadoxtra.example", portfolio_map.get("tiendapro-retail"), 7),
    ]
    insert_cursor = connection.cursor()
    insert_cursor.executemany(
        """
        INSERT INTO showcase_clients (name, industry, website_url, portfolio_item_id, display_order)
        VALUES (%s, %s, %s, %s, %s)
        """,
        clients,
    )
    connection.commit()
    insert_cursor.close()


def seed_leads(connection):
    if count_table(connection, "leads") > 0:
        return

    today = date.today()
    leads = [
        ("María Quispe", "maria@retailco.pe", "RetailCo", "https://retailco.pe", "ecommerce", "Necesitamos renovar el catálogo y automatizar seguimiento.", "website", "new", (today - timedelta(days=3)).isoformat()),
        ("Juan Pérez", "juan@alphax.pe", "Startup AlphaX", "https://alphax.pe", "automation", "Queremos captar leads y calificarlos automáticamente.", "website", "contacted", (today - timedelta(days=5)).isoformat()),
        ("Lucía Torres", "lucia@consultgroup.pe", "ConsultGroup", "https://consultgroup.pe", "web", "Necesitamos una nueva web institucional con agenda.", "website", "negotiating", (today - timedelta(days=8)).isoformat()),
        ("Carlos López", "carlos@tiendacorp.pe", "TiendaCorp S.A.C.", "https://tiendacorp.pe", "ecommerce", "Buscamos lanzar una tienda con CRM.", "website", "won", (today - timedelta(days=18)).isoformat()),
        ("Ana García", "ana@novabrand.pe", "NovaBrand Perú", "https://novabrand.pe", "branding", "Necesitamos branding y una web de soporte comercial.", "website", "won", (today - timedelta(days=28)).isoformat()),
        ("Marco Díaz", "marco@retailmax.pe", "RetailMax SAC", "https://retailmax.pe", "crm", "Queremos ordenar ventas y pipeline con CRM.", "website", "contacted", (today - timedelta(days=11)).isoformat()),
    ]
    cursor = connection.cursor()
    cursor.executemany(
        """
        INSERT INTO leads (
            full_name, email, company, website, service_type, message, source, status, created_at
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
        leads,
    )
    connection.commit()
    cursor.close()


def ensure_project(
    connection,
    slug,
    client_user_id,
    lead_id,
    title,
    service_type,
    status,
    admin_status,
    summary,
    budget,
    progress_percent,
    start_date,
    due_date,
):
    project_id = fetch_value(connection, "SELECT id FROM projects WHERE slug = %s", (slug,))
    if project_id:
        return project_id
    cursor = connection.cursor()
    cursor.execute(
        """
        INSERT INTO projects (
            slug, client_user_id, lead_id, title, service_type, status, admin_status, summary,
            budget, progress_percent, kickoff_meeting_confirmed, diagnostic_validated,
            proposal_validated, proposal_reviewed, execution_validated_count,
            final_meeting_requested, advance_payment_percent, start_date, due_date
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 0, 0, 0, 0, 0, 0, 0, %s, %s)
        RETURNING id
        """,
        (
            slug,
            client_user_id,
            lead_id,
            title,
            service_type,
            status,
            admin_status,
            summary,
            budget,
            progress_percent,
            start_date,
            due_date,
        ),
    )
    project_id = cursor.fetchone()[0]
    connection.commit()
    cursor.close()
    return project_id


def seed_projects(connection, client_role_id, admin_role_id):
    if count_table(connection, "projects") > 0:
        return

    demo_client_id = fetch_value(connection, "SELECT id FROM users WHERE email = %s", (DEMO_ACCOUNTS["client"]["email"],))
    carlos_id = fetch_value(connection, "SELECT id FROM users WHERE email = %s", ("carlos@tiendacorp.pe",))
    ana_id = fetch_value(connection, "SELECT id FROM users WHERE email = %s", ("ana@novabrand.pe",))
    marco_id = fetch_value(connection, "SELECT id FROM users WHERE email = %s", ("marco@retailmax.pe",))

    if not carlos_id:
        carlos_id = ensure_user(
            connection,
            client_role_id,
            "Carlos López",
            "carlos@tiendacorp.pe",
            "ClienteDemo2026!",
            "TiendaCorp S.A.C.",
            "https://tiendacorp.pe",
            "+51 999 888 111",
            False,
        )
    if not ana_id:
        ana_id = ensure_user(
            connection,
            client_role_id,
            "Ana García",
            "ana@novabrand.pe",
            "ClienteDemo2026!",
            "NovaBrand Perú",
            "https://novabrand.pe",
            "+51 999 777 222",
            False,
        )
    if not marco_id:
        marco_id = ensure_user(
            connection,
            client_role_id,
            "Marco Díaz",
            "marco@retailmax.pe",
            "ClienteDemo2026!",
            "RetailMax SAC",
            "https://retailmax.pe",
            "+51 999 666 333",
            False,
        )

    today = date.today()
    cursor = dict_cursor(connection)
    cursor.execute("SELECT id, email FROM leads")
    lead_map = {row["email"]: row["id"] for row in cursor.fetchall()}
    cursor.close()

    tiendacorp_project_id = ensure_project(
        connection,
        "tiendacorp-web",
        demo_client_id or carlos_id,
        lead_map.get("carlos@tiendacorp.pe"),
        "Plataforma Web - TiendaCorp",
        "ecommerce",
        "in_progress",
        "in_progress",
        "Implementación de e-commerce, CRM comercial y agenda integrada para el equipo de ventas.",
        3200.00,
        68,
        (today - timedelta(days=17)).isoformat(),
        (today + timedelta(days=7)).isoformat(),
    )
    novabrand_project_id = ensure_project(
        connection,
        "novabrand-identity",
        ana_id,
        lead_map.get("ana@novabrand.pe"),
        "Branding Integral - NovaBrand Perú",
        "branding",
        "completed",
        "delivered",
        "Sistema de identidad visual y activos digitales para nueva etapa comercial.",
        1800.00,
        100,
        (today - timedelta(days=44)).isoformat(),
        (today - timedelta(days=8)).isoformat(),
    )
    retailmax_project_id = ensure_project(
        connection,
        "retailmax-crm",
        marco_id,
        lead_map.get("marco@retailmax.pe"),
        "CRM Comercial - RetailMax",
        "crm",
        "in_progress",
        "review",
        "Configuración CRM, seguimiento de oportunidades y tablero de reportes para equipo comercial.",
        2500.00,
        82,
        (today - timedelta(days=30)).isoformat(),
        (today + timedelta(days=2)).isoformat(),
    )

    cursor = connection.cursor()
    milestone_rows = [
        (tiendacorp_project_id, "Diseño UI/UX aprobado", "done", 100, 1, (today - timedelta(days=12)).isoformat()),
        (tiendacorp_project_id, "Desarrollo frontend", "done", 100, 2, (today - timedelta(days=5)).isoformat()),
        (tiendacorp_project_id, "Integración backend + CRM", "in_progress", 75, 3, (today + timedelta(days=1)).isoformat()),
        (tiendacorp_project_id, "Pasarela de pagos", "in_progress", 30, 4, (today + timedelta(days=4)).isoformat()),
        (tiendacorp_project_id, "QA y lanzamiento", "pending", 0, 5, (today + timedelta(days=7)).isoformat()),
        (novabrand_project_id, "Descubrimiento", "done", 100, 1, (today - timedelta(days=41)).isoformat()),
        (novabrand_project_id, "Sistema visual", "done", 100, 2, (today - timedelta(days=28)).isoformat()),
        (novabrand_project_id, "Entrega final", "done", 100, 3, (today - timedelta(days=8)).isoformat()),
        (retailmax_project_id, "Arquitectura CRM", "done", 100, 1, (today - timedelta(days=25)).isoformat()),
        (retailmax_project_id, "Integraciones", "done", 100, 2, (today - timedelta(days=10)).isoformat()),
        (retailmax_project_id, "Ajustes QA", "in_progress", 60, 3, (today + timedelta(days=1)).isoformat()),
    ]
    cursor.executemany(
        """
        INSERT INTO project_milestones (project_id, title, status, progress_percent, sort_order, due_date)
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        milestone_rows,
    )

    message_rows = [
        (
            tiendacorp_project_id,
            "Equipo TISNET",
            "team",
            "La integración del CRM está al 75%. Necesitamos validar contigo los campos finales del formulario.",
            1,
            (datetime.combine(today, time(9, 15)) - timedelta(hours=2)).isoformat(sep=" "),
        ),
        (
            tiendacorp_project_id,
            "Equipo TISNET",
            "team",
            "Subimos el prototipo del checkout para aprobación. Cuando lo veas, agendamos revisión por Calendly.",
            1,
            (datetime.combine(today - timedelta(days=1), time(15, 45))).isoformat(sep=" "),
        ),
        (
            tiendacorp_project_id,
            "Equipo TISNET",
            "team",
            "Diseño UI/UX aprobado. Iniciamos la integración técnica del backend.",
            0,
            (datetime.combine(today - timedelta(days=17), time(10, 0))).isoformat(sep=" "),
        ),
    ]
    cursor.executemany(
        """
        INSERT INTO project_messages (
            project_id, author_name, author_role, body, is_unread_for_client, created_at
        )
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        message_rows,
    )

    history_rows = [
        (tiendacorp_project_id, "Aprobación diseño UI/UX", "Validación completa del diseño y componentes base.", (today - timedelta(days=17)).isoformat()),
        (tiendacorp_project_id, "Inicio de desarrollo frontend", "Se inició maquetación avanzada y estados visuales.", (today - timedelta(days=13)).isoformat()),
        (tiendacorp_project_id, "Reunión de seguimiento #1", "Se revisaron prioridades comerciales y contenido.", (today - timedelta(days=10)).isoformat()),
        (tiendacorp_project_id, "Entrega de prototipo checkout", "Se compartió demo navegable para revisión.", (today - timedelta(days=6)).isoformat()),
        (retailmax_project_id, "QA en progreso", "Se están afinando integraciones y validaciones comerciales.", (today - timedelta(days=2)).isoformat()),
    ]
    cursor.executemany(
        """
        INSERT INTO project_history (project_id, title, detail, created_at)
        VALUES (%s, %s, %s, %s)
        """,
        history_rows,
    )

    meeting_rows = [
        (
            demo_client_id or carlos_id,
            tiendacorp_project_id,
            lead_map.get("carlos@tiendacorp.pe"),
            "Revisión de avances",
            "calendly",
            DEFAULT_CALENDLY,
            "Carlos López",
            "carlos@tiendacorp.pe",
            (datetime.combine(today + timedelta(days=1), time(10, 0))).isoformat(sep=" "),
            "scheduled",
            safe_json_dumps({"seed": True, "source": "demo"}),
        ),
        (
            marco_id,
            retailmax_project_id,
            lead_map.get("marco@retailmax.pe"),
            "Validación final",
            "calendly",
            DEFAULT_CALENDLY,
            "Marco Díaz",
            "marco@retailmax.pe",
            (datetime.combine(today + timedelta(days=2), time(16, 30))).isoformat(sep=" "),
            "scheduled",
            safe_json_dumps({"seed": True, "source": "demo"}),
        ),
    ]
    cursor.executemany(
        """
        INSERT INTO meetings (
            user_id, project_id, lead_id, meeting_type, provider, calendly_url,
            invitee_name, invitee_email, scheduled_for, status, payload_json
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
        meeting_rows,
    )
    connection.commit()
    cursor.close()


def seed_team_members(connection):
    for member in TEAM_MEMBER_SEED:
        ensure_team_member(
            connection,
            member["full_name"],
            member["role_title"],
            member.get("email", ""),
            member.get("accent_color", "#0A66C2"),
        )


def seed_project_tasks(connection):
    if count_table(connection, "project_tasks") > 0:
        return

    cursor = dict_cursor(connection)
    cursor.execute("SELECT id, slug, title FROM projects")
    project_map = {row["slug"]: row for row in cursor.fetchall()}
    cursor.execute("SELECT id, email, full_name FROM team_members WHERE is_active = 1")
    team_map = {row["email"]: row for row in cursor.fetchall()}
    cursor.close()

    if not project_map or not team_map:
        return

    today = date.today()
    task_rows = [
        (
            project_map.get("tiendacorp-web", {}).get("id"),
            "Validar campos del CRM",
            "Revisar campos finales del formulario comercial y reglas de seguimiento.",
            "in_progress",
            team_map.get("carla@tisnet.pe", {}).get("id"),
            "high",
            (today + timedelta(days=1)).isoformat(),
        ),
        (
            project_map.get("tiendacorp-web", {}).get("id"),
            "Ajustar checkout mobile",
            "Optimizar espaciados y validaciones del checkout para conversion en celular.",
            "pending",
            team_map.get("philip@tisnet.pe", {}).get("id"),
            "medium",
            (today + timedelta(days=2)).isoformat(),
        ),
        (
            project_map.get("tiendacorp-web", {}).get("id"),
            "QA de pasarela de pagos",
            "Probar compra completa con escenarios de exito y rechazo.",
            "pending",
            team_map.get("javier@tisnet.pe", {}).get("id"),
            "high",
            (today + timedelta(days=3)).isoformat(),
        ),
        (
            project_map.get("retailmax-crm", {}).get("id"),
            "Documentar pipeline comercial",
            "Dejar lista la configuracion base del pipeline y criterios de oportunidad.",
            "done",
            team_map.get("cristian@tisnet.pe", {}).get("id"),
            "medium",
            (today - timedelta(days=2)).isoformat(),
        ),
        (
            project_map.get("retailmax-crm", {}).get("id"),
            "Capacitacion del tablero",
            "Preparar sesion breve para mostrar reportes y uso del CRM al equipo cliente.",
            "in_progress",
            team_map.get("carla@tisnet.pe", {}).get("id"),
            "medium",
            (today + timedelta(days=1)).isoformat(),
        ),
        (
            project_map.get("novabrand-identity", {}).get("id"),
            "Entrega de manual visual",
            "Compartir version final del manual y activos listos para implementacion.",
            "done",
            team_map.get("philip@tisnet.pe", {}).get("id"),
            "low",
            (today - timedelta(days=6)).isoformat(),
        ),
        (
            project_map.get("novabrand-identity", {}).get("id"),
            "Checklist de cierre",
            "Verificar links, assets exportados y paquete final para el cliente.",
            "done",
            team_map.get("javier@tisnet.pe", {}).get("id"),
            "low",
            (today - timedelta(days=5)).isoformat(),
        ),
    ]

    task_rows = [row for row in task_rows if row[0] and row[4]]
    if not task_rows:
        return

    cursor = connection.cursor()
    cursor.executemany(
        """
        INSERT INTO project_tasks (
            project_id, title, description, status, assignee_id, priority, due_date
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """,
        task_rows,
    )
    connection.commit()
    cursor.close()


def seed_defaults(connection):
    client_role_id = ensure_role(connection, "client", "Cliente")
    admin_role_id = ensure_role(connection, "admin", "Administrador")
    sales_role_id = ensure_role(connection, "sales", "Ventas")
    ensure_site_settings(connection)

    ensure_operator_account(
        connection,
        admin_role_id,
        OWNER_ADMIN_ACCOUNT,
        legacy_emails={DEFAULT_OWNER_ADMIN_EMAIL, *OWNER_ADMIN_EMAIL_PLACEHOLDERS},
    )
    ensure_operator_account(
        connection,
        sales_role_id,
        OWNER_SALES_ACCOUNT,
        legacy_emails={DEFAULT_OWNER_SALES_EMAIL, *OWNER_SALES_EMAIL_PLACEHOLDERS},
    )

    if ENABLE_DEMO_LOGIN:
        ensure_user(
            connection,
            client_role_id,
            "Cliente Demo",
            DEMO_ACCOUNTS["client"]["email"],
            DEMO_ACCOUNTS["client"]["password"],
            "TiendaCorp S.A.C.",
            "https://tiendacorp.pe",
            "+51 999 999 111",
            True,
        )
        ensure_user(
            connection,
            admin_role_id,
            "Administrador TISNET Demo",
            DEMO_ACCOUNTS["admin"]["email"],
            DEMO_ACCOUNTS["admin"]["password"],
            "TISNET",
            "https://tisnet.pe",
            "+51 999 999 999",
            True,
        )
        ensure_user(
            connection,
            sales_role_id,
            "Ventas TISNET Demo",
            DEMO_ACCOUNTS["sales"]["email"],
            DEMO_ACCOUNTS["sales"]["password"],
            "TISNET",
            "https://tisnet.pe",
            "+51 999 888 777",
            True,
        )

    seed_portfolio(connection)
    seed_showcase_clients(connection)
    seed_team_members(connection)

    if ENABLE_SAMPLE_DATA:
        seed_leads(connection)
        seed_projects(connection, client_role_id, admin_role_id)
        seed_project_tasks(connection)


register_seed_callback(seed_defaults)


def api_response(success=True, message="", **payload):
    response = {"success": success}
    if message:
        response["message"] = message
    response.update(payload)
    return jsonify(response)


def get_user_by_id(user_id):
    if not user_id:
        return None
    return fetch_one(
        """
        SELECT
            users.id,
            users.full_name,
            users.email,
            users.company,
            users.website,
            users.phone,
            users.is_demo,
            roles.code AS role,
            roles.name AS role_name
        FROM users
        JOIN roles ON users.role_id = roles.id
        WHERE users.id = %s
        """,
        (user_id,),
    )


def get_user_by_email(email):
    if not email:
        return None
    return fetch_one(
        """
        SELECT
            users.id,
            users.full_name,
            users.email,
            users.company,
            users.website,
            users.phone,
            users.is_demo,
            roles.code AS role,
            roles.name AS role_name
        FROM users
        JOIN roles ON users.role_id = roles.id
        WHERE users.email = %s
        """,
        (email.strip().lower(),),
    )


def current_user():
    return get_user_by_id(session.get("user_id"))


def set_session_user(user):
    session["user_id"] = user["id"]
    session["role"] = user["role"]
    session["full_name"] = user["full_name"]


def clear_session():
    session.clear()


def require_auth(required_role=None):
    def decorator(view):
        @wraps(view)
        def wrapped(*args, **kwargs):
            user = current_user()
            if not user:
                return api_response(False, "Debes iniciar sesión."), 401
            allowed_roles = None
            if required_role:
                if isinstance(required_role, (list, tuple, set)):
                    allowed_roles = {str(role) for role in required_role}
                else:
                    allowed_roles = {str(required_role)}
            if allowed_roles and user["role"] not in allowed_roles:
                return api_response(False, "No tienes permisos para esta acción."), 403
            return view(user, *args, **kwargs)

        return wrapped

    return decorator


def validate_email(value):
    if not value or "@" not in value:
        raise ValueError("Ingresa un correo válido.")


def normalize_client_phone(value):
    digits = re.sub(r"\D", "", value or "")
    if len(digits) == 11 and digits.startswith("51"):
        digits = digits[2:]
    if not digits:
        raise ValueError("Ingresa un telefono de 9 digitos.")
    if len(digits) != 9:
        raise ValueError("El telefono debe tener 9 digitos.")
    return digits


def sync_client_profile_from_data(user, data):
    if not user or user.get("role") != "client":
        return user

    full_name = (data.get("full_name") or data.get("name") or "").strip()
    company = (data.get("company") or "").strip()
    website = (data.get("website") or data.get("social_profile") or "").strip()
    phone = (data.get("phone") or "").strip()

    if not any([full_name, company, website, phone]):
        return user

    execute_write(
        """
        UPDATE users
        SET full_name = COALESCE(NULLIF(%s, ''), full_name),
            company = COALESCE(NULLIF(%s, ''), company),
            website = COALESCE(NULLIF(%s, ''), website),
            phone = COALESCE(NULLIF(%s, ''), phone)
        WHERE id = %s
        """,
        (full_name, company, website, phone, user["id"]),
    )
    updated_user = get_user_by_id(user["id"])
    set_session_user(updated_user)
    return updated_user


def latest_lead_for_email(email):
    return fetch_one(
        """
        SELECT id, full_name, email, company, website, phone, service_type, message, source, status, created_at
        FROM leads
        WHERE email = %s
        ORDER BY created_at DESC
        LIMIT 1
        """,
        (email,),
    )


def generate_quote_number():
    return f"PRES-{datetime.now().strftime('%Y%m%d-%H%M%S')}"


def parse_json_text(value, fallback=None):
    if value in (None, ""):
        return fallback if fallback is not None else {}
    try:
        return json.loads(value)
    except (TypeError, ValueError):
        return fallback if fallback is not None else {}


def hydrate_quote_row(row):
    if not row:
        return None
    payload = parse_json_text(row.get("payload_json"), {})
    row["payload"] = payload
    row["client"] = payload.get("client") or {}
    row["project"] = payload.get("project") or {}
    row["features"] = payload.get("features") or []
    row["delivery"] = payload.get("delivery") or {}
    row["breakdown"] = payload.get("breakdown") or []
    return row


def get_site_settings():
    row = fetch_one(
        """
        SELECT
            id,
            agency_name,
            contact_email,
            notification_email,
            whatsapp_phone,
            public_calendly_url,
            client_review_calendly_url,
            client_close_calendly_url,
            hero_cta_label,
            footer_tagline,
            updated_at
        FROM site_settings
        WHERE id = %s
        """,
        (SITE_SETTINGS_ID,),
    )
    if not row:
        raise RuntimeError("No se encontró la configuración general del sitio.")
    return row


def send_email(recipient, subject, html_body, template_name, payload):
    settings = get_site_settings()
    smtp_host = os.getenv("SMTP_HOST", "").strip()
    from_email = os.getenv("SMTP_FROM_EMAIL", settings["contact_email"]).strip()
    from_name = os.getenv("SMTP_FROM_NAME", settings["agency_name"]).strip() or settings["agency_name"]

    status = "skipped"
    error_message = None

    if smtp_host and from_email:
        message = EmailMessage()
        message["Subject"] = subject
        message["From"] = f"{from_name} <{from_email}>"
        message["To"] = recipient
        message.set_content("Este correo requiere vista HTML.")
        message.add_alternative(html_body, subtype="html")

        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_username = os.getenv("SMTP_USERNAME", "")
        smtp_password = os.getenv("SMTP_PASSWORD", "")
        smtp_use_tls = os.getenv("SMTP_USE_TLS", "true").lower() == "true"

        try:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as server:
                server.ehlo()
                if smtp_use_tls:
                    server.starttls()
                    server.ehlo()
                if smtp_username:
                    server.login(smtp_username, smtp_password)
                server.send_message(message)
            status = "sent"
        except Exception as exc:
            status = "error"
            error_message = str(exc)
            logger.exception("No se pudo enviar el correo.")

    execute_write(
        """
        INSERT INTO email_logs (recipient, subject, template_name, payload_json, status, error_message)
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        (recipient, subject, template_name, safe_json_dumps(payload), status, error_message),
    )
    return status


def notify_new_lead(lead):
    settings = get_site_settings()
    admin_html = f"""
        <h2>Nueva solicitud en TISNET</h2>
        <p><strong>Nombre:</strong> {lead['full_name']}</p>
        <p><strong>Email:</strong> {lead['email']}</p>
        <p><strong>Empresa:</strong> {lead.get('company') or 'Sin empresa'}</p>
        <p><strong>Telefono:</strong> {f"+51 {lead.get('phone')}" if lead.get('phone') else 'Sin telefono'}</p>
        <p><strong>Servicio:</strong> {service_label(lead['service_type'])}</p>
        <p><strong>Mensaje:</strong><br>{lead.get('message') or 'Sin mensaje'}</p>
    """
    client_html = f"""
        <h2>Recibimos tu solicitud</h2>
        <p>Hola {lead['full_name']},</p>
        <p>Gracias por escribirnos. Ya registramos tu solicitud para <strong>{service_label(lead['service_type'])}</strong>.</p>
        <p>En breve te responderemos y podrás continuar con la agenda en Calendly desde la web.</p>
        <p>Equipo {settings['agency_name']}</p>
    """

    send_email(
        settings["notification_email"],
        f"Nueva solicitud de {lead['full_name']}",
        admin_html,
        "new_lead_admin",
        lead,
    )
    send_email(
        lead["email"],
        "Recibimos tu solicitud en TISNET",
        client_html,
        "new_lead_client",
        lead,
    )


def create_lead(data, source="website", status="new", require_phone=False):
    full_name = (data.get("full_name") or data.get("nombre") or "").strip()
    email = (data.get("email") or "").strip().lower()
    company = (data.get("company") or data.get("empresa") or "").strip()
    website = (data.get("website") or data.get("pagina_web") or "").strip()
    phone_raw = (data.get("phone") or data.get("telefono") or "").strip()
    service_type = (data.get("service_type") or data.get("servicio") or "diagnostic").strip()
    message = (data.get("message") or data.get("mensaje") or "").strip()
    phone = ""

    if not full_name:
        raise ValueError("Ingresa tu nombre.")
    validate_email(email)
    if not service_type:
        raise ValueError("Selecciona un servicio.")
    if phone_raw:
        phone = normalize_client_phone(phone_raw)
    elif require_phone:
        raise ValueError("Ingresa un telefono de 9 digitos.")

    lead_id = execute_write(
        """
        INSERT INTO leads (full_name, email, company, website, phone, service_type, message, source, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (full_name, email, company, website, phone, service_type, message, source, status),
    )
    lead = fetch_one(
        """
        SELECT id, full_name, email, company, website, phone, service_type, message, source, status, created_at
        FROM leads
        WHERE id = %s
        """,
        (lead_id,),
    )
    notify_new_lead(lead)
    return lead


def create_onboarding_project_for_user(user_id, company_name):
    existing = fetch_one(
        "SELECT id, slug FROM projects WHERE client_user_id = %s ORDER BY created_at DESC LIMIT 1",
        (user_id,),
    )
    if existing:
        return existing["id"]

    slug = f"onboarding-{user_id}"
    today = date.today()
    project_id = execute_write(
        """
        INSERT INTO projects (
            slug, client_user_id, title, service_type, status, admin_status, summary,
            budget, progress_percent, start_date, due_date
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (
            slug,
            user_id,
            f"Proyecto de implementación - {company_name or 'Nuevo Cliente'}",
            "diagnostic",
            "in_progress",
            "backlog",
            "Fase inicial de descubrimiento, diagnóstico y definición de alcance técnico.",
            0,
            7,
            today.isoformat(),
            (today + timedelta(days=14)).isoformat(),
        ),
    )

    execute_many(
        """
        INSERT INTO project_milestones (project_id, title, status, progress_percent, sort_order, due_date)
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        [
            (project_id, "Kickoff inicial", "done", 100, 1, today.isoformat()),
            (project_id, "Diagnóstico del negocio", "in_progress", 30, 2, (today + timedelta(days=3)).isoformat()),
            (project_id, "Propuesta técnica", "pending", 0, 3, (today + timedelta(days=7)).isoformat()),
            (project_id, "Ejecución", "pending", 0, 4, (today + timedelta(days=12)).isoformat()),
            (project_id, "Entrega", "pending", 0, 5, (today + timedelta(days=14)).isoformat()),
        ],
    )
    execute_many(
        """
        INSERT INTO project_history (project_id, title, detail, created_at)
        VALUES (%s, %s, %s, %s)
        """,
        [
            (
                project_id,
                "Cuenta creada",
                "Se creó un proyecto base para iniciar diagnóstico, alcance y agenda.",
                today.isoformat(),
            )
        ],
    )
    execute_many(
        """
        INSERT INTO project_messages (project_id, author_name, author_role, body, is_unread_for_client)
        VALUES (%s, %s, %s, %s, %s)
        """,
        [
            (
                project_id,
                "Equipo TISNET",
                "team",
                "Bienvenido. Ya tenemos tu espacio listo para centralizar diagnóstico, agenda y avance del proyecto.",
                1,
            )
        ],
    )
    return project_id

def save_budget_quote(data, user=None, source="calculator"):
    payload = dict(data or {})
    client = payload.get("client") or {}
    project = payload.get("project") or {}
    delivery = payload.get("delivery") or {}

    full_name = (client.get("full_name") or "").strip()
    email = (client.get("email") or "").strip().lower()
    company = (client.get("company") or "").strip()
    project_label = (project.get("label") or "").strip()
    quote_number = (payload.get("quote_number") or "").strip() or generate_quote_number()

    if not full_name:
        raise ValueError("Ingresa el nombre del cliente para guardar la cotizacion.")
    validate_email(email)
    if not project_label:
        raise ValueError("Selecciona un tipo de proyecto antes de guardar la cotizacion.")

    payload["quote_number"] = quote_number

    linked_user = None
    if user and user.get("role") == "client" and user.get("email", "").strip().lower() == email:
        linked_user = user
    else:
        linked_user = get_user_by_email(email)

    latest_lead = latest_lead_for_email(email)
    quote_id = execute_write(
        """
        INSERT INTO budget_quotes (
            user_id,
            lead_id,
            quote_number,
            client_name,
            client_email,
            client_company,
            service_type,
            project_key,
            project_label,
            delivery_key,
            delivery_label,
            total_amount,
            source,
            payload_json
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (
            linked_user["id"] if linked_user else None,
            latest_lead["id"] if latest_lead else None,
            quote_number,
            full_name,
            email,
            company,
            (project.get("service") or "diagnostic").strip() or "diagnostic",
            (project.get("key") or "").strip(),
            project_label,
            (delivery.get("key") or "").strip(),
            (delivery.get("label") or "").strip(),
            float(payload.get("total") or 0),
            (source or "calculator").strip(),
            safe_json_dumps(payload),
        ),
    )

    if linked_user and source == "pdf_download":
        active_project = active_project_for_user(linked_user["id"])
        if active_project:
            add_project_history(
                active_project["id"],
                "Cotizacion generada",
                f"Se registro la cotizacion {quote_number} para {project_label} por {format_pen_pdf(payload.get('total') or 0)}.",
            )

    quote = fetch_one(
        """
        SELECT
            id,
            user_id,
            lead_id,
            quote_number,
            client_name,
            client_email,
            client_company,
            service_type,
            project_key,
            project_label,
            delivery_key,
            delivery_label,
            total_amount,
            source,
            payload_json,
            created_at,
            updated_at
        FROM budget_quotes
        WHERE id = %s
        """,
        (quote_id,),
    )
    return hydrate_quote_row(quote)


def latest_quote_for_lead(lead_id, email):
    quote = fetch_one(
        """
        SELECT
            id,
            user_id,
            lead_id,
            quote_number,
            client_name,
            client_email,
            client_company,
            service_type,
            project_key,
            project_label,
            delivery_key,
            delivery_label,
            total_amount,
            source,
            payload_json,
            created_at,
            updated_at
        FROM budget_quotes
        WHERE lead_id = %s OR client_email = %s
        ORDER BY
            CASE WHEN lead_id = %s THEN 0 ELSE 1 END,
            created_at DESC
        LIMIT 1
        """,
        (lead_id, email, lead_id),
    )
    return hydrate_quote_row(quote)


def ensure_client_user_from_lead(lead):
    existing_user = get_user_by_email(lead.get("email"))
    if existing_user:
        if existing_user.get("role") != "client":
            raise ValueError(
                "El correo del lead ya pertenece a una cuenta interna. Usa otro correo para este cliente."
            )
        execute_write(
            """
            UPDATE users
            SET
                full_name = CASE WHEN full_name IS NULL OR full_name = '' THEN %s ELSE full_name END,
                company = CASE WHEN company IS NULL OR company = '' THEN %s ELSE company END,
                website = CASE WHEN website IS NULL OR website = '' THEN %s ELSE website END,
                phone = CASE WHEN phone IS NULL OR phone = '' THEN %s ELSE phone END
            WHERE id = %s
            """,
            (
                (lead.get("full_name") or "Cliente TISNET").strip(),
                (lead.get("company") or "").strip(),
                (lead.get("website") or "").strip(),
                (lead.get("phone") or "").strip(),
                existing_user["id"],
            ),
        )
        return get_user_by_id(existing_user["id"]), False

    role_row = fetch_one("SELECT id FROM roles WHERE code = %s", ("client",))
    if not role_row:
        raise RuntimeError("El rol cliente no esta disponible.")

    user_id = execute_write(
        """
        INSERT INTO users (role_id, full_name, email, password_hash, company, website, phone, is_demo)
        VALUES (%s, %s, %s, %s, %s, %s, %s, 0)
        """,
        (
            role_row["id"],
            (lead.get("full_name") or "Cliente TISNET").strip(),
            (lead.get("email") or "").strip().lower(),
            generate_password_hash(DEFAULT_AUTO_CLIENT_PASSWORD),
            (lead.get("company") or "").strip(),
            (lead.get("website") or "").strip(),
            (lead.get("phone") or "").strip(),
        ),
    )
    return get_user_by_id(user_id), True


def create_project_milestones(project_id, start_date, due_date):
    total_days = max(7, (due_date - start_date).days)
    kickoff_due = start_date + timedelta(days=1)
    diagnostic_due = start_date + timedelta(days=max(2, total_days // 5))
    proposal_due = start_date + timedelta(days=max(4, (total_days * 2) // 5))
    execution_due = start_date + timedelta(days=max(6, (total_days * 4) // 5))

    execute_many(
        """
        INSERT INTO project_milestones (project_id, title, status, progress_percent, sort_order, due_date)
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        [
            (project_id, "Kickoff", "in_progress", 33, 1, kickoff_due.isoformat()),
            (project_id, "Diagnostico", "pending", 0, 2, diagnostic_due.isoformat()),
            (project_id, "Propuesta tecnica comercial", "pending", 0, 3, proposal_due.isoformat()),
            (project_id, "Ejecucion del proyecto", "pending", 0, 4, execution_due.isoformat()),
            (project_id, "Entrega final", "pending", 0, 5, due_date.isoformat()),
        ],
    )


def build_project_title_from_lead(lead, quote=None):
    organization = (lead.get("company") or "").strip() or lead.get("full_name") or "Nuevo Cliente"
    if quote and (quote.get("project_label") or "").strip():
        return f"{quote['project_label']} - {organization}"
    return f"{service_label(lead.get('service_type') or 'diagnostic')} - {organization}"


def create_project_from_lead(lead, actor_role="admin"):
    existing_project = fetch_one(
        """
        SELECT
            projects.id,
            projects.slug,
            projects.title,
            projects.service_type,
            projects.status,
            projects.admin_status,
            projects.summary,
            projects.budget,
            projects.progress_percent,
            projects.kickoff_meeting_confirmed,
            projects.diagnostic_validated,
            projects.proposal_validated,
            projects.proposal_reviewed,
            projects.execution_validated_count,
            projects.final_meeting_requested,
            projects.advance_payment_percent,
            projects.start_date,
            projects.due_date,
            users.full_name AS client_name,
            users.company AS client_company
        FROM projects
        JOIN users ON projects.client_user_id = users.id
        WHERE projects.lead_id = %s
        ORDER BY projects.created_at DESC
        LIMIT 1
        """,
        (lead["id"],),
    )
    if existing_project:
        existing_project["service_label"] = service_label(existing_project["service_type"])
        if lead.get("status") != "won":
            execute_write("UPDATE leads SET status = 'won' WHERE id = %s", (lead["id"],))
        return existing_project, False, False

    client_user, client_created = ensure_client_user_from_lead(lead)
    quote = latest_quote_for_lead(lead["id"], lead.get("email"))

    estimated_days = 21
    if quote:
        try:
            estimated_days = max(7, int((quote.get("delivery") or {}).get("days") or estimated_days))
        except (TypeError, ValueError):
            estimated_days = 21

    today = date.today()
    due_date = today + timedelta(days=estimated_days)
    budget = float(quote.get("total_amount") or 0) if quote else 0

    project_payload = (quote or {}).get("project") or {}
    client_payload = (quote or {}).get("client") or {}
    summary_parts = []
    if (project_payload.get("summary") or "").strip():
        summary_parts.append(project_payload["summary"].strip())
    if (client_payload.get("project_description") or "").strip():
        summary_parts.append(client_payload["project_description"].strip())
    if (lead.get("message") or "").strip():
        summary_parts.append(lead["message"].strip())
    summary = " ".join(dict.fromkeys(summary_parts)) or (
        f"Proyecto generado desde el lead comercial para {service_label(lead.get('service_type') or 'diagnostic')}."
    )

    project_id = execute_write(
        """
        INSERT INTO projects (
            slug,
            client_user_id,
            lead_id,
            title,
            service_type,
            status,
            admin_status,
            summary,
            budget,
            progress_percent,
            start_date,
            due_date
        )
        VALUES (%s, %s, %s, %s, %s, 'in_progress', 'backlog', %s, %s, 7, %s, %s)
        """,
        (
            f"lead-{lead['id']}-{int(now_utc().timestamp())}",
            client_user["id"],
            lead["id"],
            build_project_title_from_lead(lead, quote),
            (quote or {}).get("service_type") or lead.get("service_type") or "diagnostic",
            summary,
            budget,
            today.isoformat(),
            due_date.isoformat(),
        ),
    )
    create_project_milestones(project_id, today, due_date)

    execute_write("UPDATE leads SET status = 'won' WHERE id = %s", (lead["id"],))
    execute_write(
        """
        UPDATE diagnostics
        SET user_id = COALESCE(user_id, %s)
        WHERE lead_id = %s
        """,
        (client_user["id"], lead["id"]),
    )
    execute_write(
        """
        UPDATE budget_quotes
        SET user_id = COALESCE(user_id, %s),
            lead_id = COALESCE(lead_id, %s)
        WHERE client_email = %s
        """,
        (client_user["id"], lead["id"], lead.get("email")),
    )
    execute_write(
        """
        UPDATE meetings
        SET user_id = COALESCE(user_id, %s),
            project_id = COALESCE(project_id, %s),
            lead_id = COALESCE(lead_id, %s)
        WHERE lead_id = %s OR invitee_email = %s
        """,
        (client_user["id"], project_id, lead["id"], lead["id"], lead.get("email")),
    )

    actor_label = "ventas" if actor_role == "sales" else "administracion"
    add_project_history(
        project_id,
        "Proyecto creado desde lead",
        f"Conversion comercial realizada por el equipo de {actor_label}.",
    )
    if quote:
        add_project_history(
            project_id,
            "Cotizacion vinculada",
            f"Se asocio la cotizacion {quote.get('quote_number')} por {format_pen_pdf(quote.get('total_amount') or 0)}.",
        )

    project = fetch_one(
        """
        SELECT
            projects.id,
            projects.slug,
            projects.title,
            projects.service_type,
            projects.status,
            projects.admin_status,
            projects.summary,
            projects.budget,
            projects.progress_percent,
            projects.start_date,
            projects.due_date,
            users.full_name AS client_name,
            users.company AS client_company
        FROM projects
        JOIN users ON projects.client_user_id = users.id
        WHERE projects.id = %s
        """,
        (project_id,),
    )
    project["service_label"] = service_label(project["service_type"])
    return project, True, client_created


def active_project_for_user(user_id):
    project = fetch_one(
        """
        SELECT
            id,
            slug,
            title,
            service_type,
            status,
            admin_status,
            summary,
            budget,
            progress_percent,
            kickoff_meeting_confirmed,
            diagnostic_validated,
            proposal_validated,
            proposal_reviewed,
            execution_validated_count,
            final_meeting_requested,
            advance_payment_percent,
            start_date,
            due_date,
            created_at,
            updated_at
        FROM projects
        WHERE client_user_id = %s
        ORDER BY
            CASE status
                WHEN 'in_progress' THEN 0
                WHEN 'completed' THEN 1
                ELSE 2
            END,
            updated_at DESC
        LIMIT 1
        """,
        (user_id,),
    )
    if not project:
        return None
    project["service_label"] = service_label(project["service_type"])
    return project


def process_stage_label(stage_key):
    return PROCESS_STAGE_LABELS.get(stage_key, stage_key.replace("_", " ").title())


def truthy(value):
    if isinstance(value, bool):
        return value
    if value is None:
        return False
    if isinstance(value, (int, float)):
        return value != 0
    return str(value).strip().lower() in {"1", "true", "yes", "si", "on"}


def fetch_project_documents(project_id, visible_only=False):
    where_parts = ["project_documents.project_id = %s"]
    params = [project_id]
    if visible_only:
        where_parts.append("project_documents.is_visible_to_client = 1")
        where_parts.append("project_documents.status = 'published'")

    return fetch_all(
        f"""
        SELECT
            project_documents.id,
            project_documents.project_id,
            project_documents.stage_key,
            project_documents.document_type,
            project_documents.title,
            project_documents.note,
            project_documents.resource_url,
            project_documents.file_name,
            project_documents.status,
            project_documents.is_visible_to_client,
            project_documents.created_by_user_id,
            project_documents.created_at,
            project_documents.updated_at,
            users.full_name AS created_by_name
        FROM project_documents
        LEFT JOIN users ON project_documents.created_by_user_id = users.id
        WHERE {" AND ".join(where_parts)}
        ORDER BY project_documents.created_at DESC
        """,
        tuple(params),
    )


def fetch_feedback_requests(project_id=None, status=None, limit=50):
    where_parts = []
    params = []
    if project_id:
        where_parts.append("feedback_requests.project_id = %s")
        params.append(project_id)
    if status:
        where_parts.append("feedback_requests.status = %s")
        params.append(status)
    where_sql = f"WHERE {' AND '.join(where_parts)}" if where_parts else ""
    params.append(limit)

    return fetch_all(
        f"""
        SELECT
            feedback_requests.id,
            feedback_requests.project_id,
            feedback_requests.stage_key,
            feedback_requests.target_type,
            feedback_requests.target_id,
            feedback_requests.message,
            feedback_requests.status,
            feedback_requests.requested_by_user_id,
            feedback_requests.created_at,
            feedback_requests.updated_at,
            projects.title AS project_title,
            users.full_name AS client_name,
            users.email AS client_email,
            users.company AS client_company
        FROM feedback_requests
        JOIN projects ON feedback_requests.project_id = projects.id
        JOIN users ON projects.client_user_id = users.id
        {where_sql}
        ORDER BY
            CASE feedback_requests.status
                WHEN 'pending' THEN 0
                WHEN 'in_review' THEN 1
                WHEN 'resolved' THEN 2
                ELSE 3
            END,
            feedback_requests.created_at DESC
        LIMIT %s
        """,
        tuple(params),
    )


def document_matches(document, stage_key=None, document_types=None):
    if stage_key and document.get("stage_key") != stage_key:
        return False
    if document_types and document.get("document_type") not in document_types:
        return False
    return True


def latest_document(documents, stage_key=None, document_types=None):
    return next(
        (
            document
            for document in documents
            if document_matches(document, stage_key=stage_key, document_types=document_types)
        ),
        None,
    )


def meeting_matches(meetings, keywords):
    normalized_keywords = [keyword.lower() for keyword in keywords]
    for meeting in meetings or []:
        text = f"{meeting.get('meeting_type') or ''} {meeting.get('status') or ''}".lower()
        if any(keyword in text for keyword in normalized_keywords):
            return meeting
    return None


def stage_status_from_percent(percent):
    if percent >= 100:
        return "done"
    if percent > 0:
        return "in_progress"
    return "pending"


def build_process_stage(key, percent, message, actions=None, documents=None, feedbacks=None):
    return {
        "key": key,
        "title": process_stage_label(key),
        "copy": PROCESS_STAGE_COPY.get(key, ""),
        "percent": int(max(0, min(100, percent))),
        "status": stage_status_from_percent(percent),
        "message": message,
        "actions": actions or [],
        "documents": documents or [],
        "feedbacks": feedbacks or [],
    }


def build_process_flow(project, diagnostic, meetings, documents, feedbacks):
    visible_documents = [
        document
        for document in documents
        if truthy(document.get("is_visible_to_client")) and document.get("status") == "published"
    ]
    pending_feedbacks = [item for item in feedbacks if item.get("status") != "resolved"]

    kickoff_meeting = meeting_matches(meetings, ["kickoff", "inicial"])
    proposal_meeting = meeting_matches(meetings, ["propuesta"])
    close_meeting = meeting_matches(meetings, ["cierre", "entrega final"])
    evaluation_doc = latest_document(visible_documents, "diagnostic", {"evaluation", "diagnostic_evaluation", "note"})
    proposal_doc = latest_document(visible_documents, "proposal", {"proposal", "note", "link", "document"})
    execution_docs = [
        document
        for document in visible_documents
        if document.get("stage_key") == "execution"
    ]
    delivery_doc = latest_document(visible_documents, "delivery")

    kickoff_percent = 33
    if kickoff_meeting:
        kickoff_percent = 66
    if truthy(project.get("kickoff_meeting_confirmed")):
        kickoff_percent = 100

    diagnostic_percent = 0
    if diagnostic:
        diagnostic_percent = 33
    if evaluation_doc:
        diagnostic_percent = max(diagnostic_percent, 66)
    if truthy(project.get("diagnostic_validated")):
        diagnostic_percent = 100

    proposal_percent = 0
    if proposal_doc:
        proposal_percent = 33
    if truthy(project.get("proposal_reviewed")) or proposal_meeting:
        proposal_percent = max(proposal_percent, 66)
    if truthy(project.get("proposal_validated")):
        proposal_percent = 100

    try:
        execution_count = int(project.get("execution_validated_count") or 0)
    except (TypeError, ValueError):
        execution_count = 0
    execution_count = max(0, min(3, execution_count))
    execution_percent = {0: 0, 1: 33, 2: 66, 3: 100}[execution_count]

    delivery_percent = 0
    if execution_percent >= 100:
        delivery_percent = 33
    if truthy(project.get("final_meeting_requested")) or close_meeting:
        delivery_percent = max(delivery_percent, 66)
    if project.get("status") in {"completed", "delivered"} or delivery_doc:
        delivery_percent = 100

    stages = [
        build_process_stage(
            "kickoff",
            kickoff_percent,
            "Cuenta activa. Agenda y confirma tu reunion de kickoff para continuar con el diagnostico."
            if kickoff_percent < 100
            else "Kickoff completado. Continua con tu diagnostico.",
            actions=[
                {"type": "schedule", "context": "client-kickoff", "label": "Agendar kickoff", "style": "primary"}
                if kickoff_percent < 66
                else None,
                {"type": "confirm_kickoff", "label": "Ya tuve mi reunion", "style": "accent"}
                if kickoff_percent >= 66 and kickoff_percent < 100
                else None,
                {"type": "go_diagnostic", "label": "Continua con tu diagnostico", "style": "ghost"}
                if kickoff_percent >= 100
                else None,
            ],
            documents=[],
            feedbacks=[],
        ),
        build_process_stage(
            "diagnostic",
            diagnostic_percent,
            "Completa tu diagnostico para que TISNET pueda evaluarlo."
            if diagnostic_percent < 33
            else "Evaluacion publicada. Puedes validarla o enviar retroalimentacion."
            if diagnostic_percent >= 66 and diagnostic_percent < 100
            else "Tu diagnostico ha sido validado correctamente. Espera tu propuesta tecnica comercial. Te aparecera en tu historial cuando este disponible."
            if diagnostic_percent >= 100
            else "Diagnostico recibido. El equipo publicara la evaluacion del proyecto.",
            actions=[
                {"type": "go_diagnostic", "label": "Completar diagnostico", "style": "primary"}
                if diagnostic_percent < 33
                else None,
                {"type": "validate_diagnostic", "label": "Validar", "style": "accent"}
                if diagnostic_percent >= 66 and diagnostic_percent < 100
                else None,
                {"type": "feedback_diagnostic", "label": "Retroalimentar", "style": "ghost"}
                if diagnostic_percent >= 66 and diagnostic_percent < 100
                else None,
                {"type": "go_history", "label": "Ir a historial", "style": "ghost"}
                if diagnostic_percent >= 100
                else None,
            ],
            documents=[evaluation_doc] if evaluation_doc else [],
            feedbacks=[item for item in pending_feedbacks if item.get("stage_key") == "diagnostic"],
        ),
        build_process_stage(
            "proposal",
            proposal_percent,
            "Aun no hay propuesta tecnica comercial publicada."
            if proposal_percent < 33
            else "Revisa la propuesta tecnica comercial, agenda reunion si lo necesitas y validala para iniciar ejecucion.",
            actions=[
                {"type": "open_document", "label": "Ver propuesta tecnica comercial", "style": "primary", "url": proposal_doc.get("resource_url")}
                if proposal_doc and proposal_doc.get("resource_url")
                else None,
                {"type": "schedule", "context": "client-proposal", "label": "Agendar reunion para revisar propuesta", "style": "ghost"}
                if proposal_percent >= 33 and proposal_percent < 100
                else None,
                {"type": "mark_proposal_reviewed", "label": "Marcar como revisada", "style": "ghost"}
                if proposal_percent >= 33 and proposal_percent < 66
                else None,
                {"type": "validate_proposal", "label": "Validar propuesta", "style": "accent"}
                if proposal_percent >= 33 and proposal_percent < 100
                else None,
                {"type": "feedback_proposal", "label": "Retroalimentar", "style": "ghost"}
                if proposal_percent >= 33 and proposal_percent < 100
                else None,
            ],
            documents=[proposal_doc] if proposal_doc else [],
            feedbacks=[item for item in pending_feedbacks if item.get("stage_key") == "proposal"],
        ),
        build_process_stage(
            "execution",
            execution_percent,
            "El equipo publicara avances con notas, links o archivos para validacion."
            if not execution_docs
            else "Valida cada avance o deja retroalimentacion para que el equipo libere una nueva version.",
            actions=[
                {"type": "validate_advance", "label": "Validar avance", "style": "accent"}
                if execution_docs and execution_percent < 100
                else None,
                {"type": "feedback_advance", "label": "Retroalimentar avance", "style": "ghost"}
                if execution_docs and execution_percent < 100
                else None,
                {"type": "request_final_meeting", "label": "Agendar entrega final", "style": "primary"}
                if execution_percent >= 100
                else None,
            ],
            documents=execution_docs,
            feedbacks=[item for item in pending_feedbacks if item.get("stage_key") == "execution"],
        ),
        build_process_stage(
            "delivery",
            delivery_percent,
            "Cuando el avance final este validado, podras cerrar con reunion y entrega final."
            if delivery_percent < 100
            else "Entrega final publicada y lista para cierre.",
            actions=[
                {"type": "schedule", "context": "client-close", "label": "Agendar reunion de cierre", "style": "primary"}
                if delivery_percent >= 33 and delivery_percent < 100
                else None,
                {"type": "go_history", "label": "Ver entregables", "style": "ghost"}
                if delivery_percent >= 100
                else None,
            ],
            documents=[delivery_doc] if delivery_doc else [],
            feedbacks=[item for item in pending_feedbacks if item.get("stage_key") == "delivery"],
        ),
    ]

    for stage in stages:
        stage["actions"] = [action for action in stage["actions"] if action]

    overall = round(sum(stage["percent"] for stage in stages) / len(stages)) if stages else 0
    return {
        "overallProgress": overall,
        "currentStage": next((stage for stage in stages if stage["percent"] < 100), stages[-1] if stages else None),
        "stages": stages,
    }


def build_project_timeline(history, documents, feedbacks):
    items = []
    for entry in history or []:
        items.append(
            {
                "kind": "history",
                "title": entry.get("title") or "Actividad del proyecto",
                "detail": entry.get("detail") or "",
                "created_at": entry.get("created_at"),
            }
        )
    for document in documents or []:
        items.append(
            {
                "kind": "document",
                "title": document.get("title") or "Documento publicado",
                "detail": f"{process_stage_label(document.get('stage_key') or '')} - {document.get('note') or document.get('resource_url') or 'Visible para el cliente.'}",
                "created_at": document.get("created_at"),
                "url": document.get("resource_url"),
            }
        )
    for feedback in feedbacks or []:
        items.append(
            {
                "kind": "feedback",
                "title": f"Retroalimentacion enviada - {process_stage_label(feedback.get('stage_key') or '')}",
                "detail": feedback.get("message") or "",
                "created_at": feedback.get("created_at"),
                "status": feedback.get("status"),
            }
        )
    items.sort(key=lambda item: item.get("created_at") or "", reverse=True)
    return items


def sync_project_progress(project_id, progress_percent):
    execute_write(
        "UPDATE projects SET progress_percent = %s WHERE id = %s",
        (int(max(0, min(100, progress_percent))), project_id),
    )


def dashboard_payload_for_client(user):
    project = active_project_for_user(user["id"])
    if not project:
        create_onboarding_project_for_user(user["id"], user.get("company") or user["full_name"])
        project = active_project_for_user(user["id"])

    milestones = fetch_all(
        """
        SELECT id, title, status, progress_percent, sort_order, due_date
        FROM project_milestones
        WHERE project_id = %s
        ORDER BY sort_order ASC
        """,
        (project["id"],),
    )
    messages = fetch_all(
        """
        SELECT id, author_name, author_role, body, is_unread_for_client, created_at
        FROM project_messages
        WHERE project_id = %s
        ORDER BY created_at DESC
        """,
        (project["id"],),
    )
    history = fetch_all(
        """
        SELECT id, title, detail, created_at
        FROM project_history
        WHERE project_id = %s
        ORDER BY created_at DESC
        """,
        (project["id"],),
    )
    meetings = fetch_all(
        """
        SELECT id, meeting_type, provider, calendly_url, invitee_name, invitee_email, scheduled_for, status, created_at
        FROM meetings
        WHERE project_id = %s
        ORDER BY scheduled_for ASC, created_at DESC
        """,
        (project["id"],),
    )
    diagnostic = fetch_one(
        """
        SELECT id, business_summary, business_stage, primary_need, goal, created_at, updated_at
        FROM diagnostics
        WHERE user_id = %s
        ORDER BY updated_at DESC
        LIMIT 1
        """,
        (user["id"],),
    )
    documents = fetch_project_documents(project["id"], visible_only=True)
    feedback_requests = fetch_feedback_requests(project_id=project["id"], limit=30)
    process_flow = build_process_flow(project, diagnostic, meetings, documents, feedback_requests)
    previous_progress = int(project.get("progress_percent") or 0)
    project["progress_percent"] = process_flow["overallProgress"]
    if previous_progress != int(process_flow["overallProgress"]):
        sync_project_progress(project["id"], process_flow["overallProgress"])
    timeline = build_project_timeline(history, documents, feedback_requests)

    unread_messages = sum(1 for message in messages if message["is_unread_for_client"])
    completed_milestones = sum(1 for milestone in milestones if milestone["status"] == "done")
    next_meeting = next((meeting for meeting in meetings if meeting.get("status") == "scheduled"), None)

    return {
        "profile": user,
        "project": project,
        "milestones": milestones,
        "messages": messages,
        "history": history,
        "timeline": timeline,
        "meetings": meetings,
        "diagnostic": diagnostic,
        "documents": documents,
        "feedbackRequests": feedback_requests,
        "processFlow": process_flow,
        "metrics": {
            "progress": project["progress_percent"],
            "completedMilestones": completed_milestones,
            "totalMilestones": len(milestones),
            "daysRemaining": max(0, (datetime.fromisoformat(project["due_date"]).date() - date.today()).days)
            if project.get("due_date")
            else None,
            "unreadMessages": unread_messages,
            "nextMeeting": next_meeting,
        },
    }


def build_client_interaction_history(leads, quotes, meetings, project_history_rows, diagnostic):
    items = []

    for lead in leads or []:
        items.append(
            {
                "kind": "lead",
                "title": "Formulario enviado",
                "detail": f"{service_label(lead.get('service_type') or 'diagnostic')} - {(lead.get('message') or 'Sin mensaje registrado.')}",
                "created_at": lead.get("created_at"),
            }
        )

    for quote in quotes or []:
        items.append(
            {
                "kind": "quote",
                "title": "Cotizacion generada",
                "detail": f"{quote.get('project_label') or 'Proyecto'} - Total {format_pen_pdf(quote.get('total_amount') or 0)}",
                "created_at": quote.get("created_at"),
            }
        )

    for meeting in meetings or []:
        items.append(
            {
                "kind": "meeting",
                "title": "Reunion agendada",
                "detail": f"{meeting.get('meeting_type') or 'Reunion'} - {meeting_status_label(meeting.get('status'))}",
                "created_at": meeting.get("created_at"),
            }
        )

    for entry in project_history_rows or []:
        project_name = entry.get("project_title") or "Proyecto"
        detail = entry.get("detail") or ""
        items.append(
            {
                "kind": "project",
                "title": entry.get("title") or "Actividad del proyecto",
                "detail": f"{project_name} - {detail}" if detail else project_name,
                "created_at": entry.get("created_at"),
            }
        )

    if diagnostic:
        items.append(
            {
                "kind": "diagnostic",
                "title": "Diagnostico actualizado",
                "detail": diagnostic.get("goal") or diagnostic.get("primary_need") or diagnostic.get("business_summary") or "Informacion estrategica actualizada.",
                "created_at": diagnostic.get("updated_at") or diagnostic.get("created_at"),
            }
        )

    items.sort(key=lambda item: item.get("created_at") or "", reverse=True)
    return items[:12]


def admin_client_detail_payload(client_id):
    client = fetch_one(
        """
        SELECT
            users.id,
            users.full_name,
            users.email,
            users.company,
            users.website,
            users.phone,
            users.created_at,
            users.updated_at,
            COUNT(projects.id) AS project_count,
            COALESCE(SUM(projects.budget), 0) AS total_budget,
            MAX(projects.updated_at) AS last_update
        FROM users
        JOIN roles ON users.role_id = roles.id AND roles.code = 'client'
        LEFT JOIN projects ON projects.client_user_id = users.id
        WHERE users.id = %s
        GROUP BY users.id, users.full_name, users.email, users.company, users.website, users.phone, users.created_at, users.updated_at
        """,
        (client_id,),
    )
    if not client:
        return None

    projects = fetch_all(
        """
        SELECT
            id,
            slug,
            title,
            service_type,
            status,
            admin_status,
            summary,
            budget,
            progress_percent,
            start_date,
            due_date,
            created_at,
            updated_at
        FROM projects
        WHERE client_user_id = %s
        ORDER BY
            CASE status
                WHEN 'in_progress' THEN 0
                WHEN 'completed' THEN 1
                ELSE 2
            END,
            updated_at DESC
        """,
        (client_id,),
    )
    for project in projects:
        project["service_label"] = service_label(project["service_type"])

    active_project = projects[0] if projects else None
    active_milestones = []
    if active_project:
        active_milestones = fetch_all(
            """
            SELECT id, title, status, progress_percent, sort_order, due_date
            FROM project_milestones
            WHERE project_id = %s
            ORDER BY sort_order ASC
            """,
            (active_project["id"],),
        )

    leads = fetch_all(
        """
        SELECT id, full_name, email, company, website, phone, service_type, message, source, status, created_at, updated_at
        FROM leads
        WHERE email = %s
        ORDER BY created_at DESC
        LIMIT 8
        """,
        (client["email"],),
    )
    latest_lead = leads[0] if leads else None

    diagnostic = fetch_one(
        """
        SELECT id, business_summary, business_stage, primary_need, goal, created_at, updated_at
        FROM diagnostics
        WHERE user_id = %s
        ORDER BY updated_at DESC
        LIMIT 1
        """,
        (client_id,),
    )
    if not diagnostic and latest_lead:
        diagnostic = fetch_one(
            """
            SELECT id, business_summary, business_stage, primary_need, goal, created_at, updated_at
            FROM diagnostics
            WHERE lead_id = %s
            ORDER BY updated_at DESC
            LIMIT 1
            """,
            (latest_lead["id"],),
        )

    quotes = fetch_all(
        """
        SELECT
            id,
            user_id,
            lead_id,
            quote_number,
            client_name,
            client_email,
            client_company,
            service_type,
            project_key,
            project_label,
            delivery_key,
            delivery_label,
            total_amount,
            source,
            payload_json,
            created_at,
            updated_at
        FROM budget_quotes
        WHERE user_id = %s OR client_email = %s
        ORDER BY created_at DESC
        LIMIT 8
        """,
        (client_id, client["email"]),
    )
    quotes = [hydrate_quote_row(row) for row in quotes]
    latest_quote = quotes[0] if quotes else None

    meetings = fetch_all(
        """
        SELECT
            meetings.id,
            meetings.meeting_type,
            meetings.provider,
            meetings.calendly_url,
            meetings.invitee_name,
            meetings.invitee_email,
            meetings.scheduled_for,
            meetings.status,
            meetings.created_at,
            projects.title AS project_title
        FROM meetings
        LEFT JOIN projects ON meetings.project_id = projects.id
        WHERE meetings.user_id = %s OR meetings.invitee_email = %s
        ORDER BY COALESCE(meetings.scheduled_for, meetings.created_at) DESC
        LIMIT 8
        """,
        (client_id, client["email"]),
    )

    project_history_rows = fetch_all(
        """
        SELECT
            project_history.id,
            project_history.title,
            project_history.detail,
            project_history.created_at,
            projects.title AS project_title
        FROM project_history
        JOIN projects ON project_history.project_id = projects.id
        WHERE projects.client_user_id = %s
        ORDER BY project_history.created_at DESC
        LIMIT 10
        """,
        (client_id,),
    )
    project_documents = fetch_project_documents(active_project["id"], visible_only=False) if active_project else []
    feedback_requests = fetch_feedback_requests(project_id=active_project["id"], limit=30) if active_project else []
    process_flow = (
        build_process_flow(active_project, diagnostic, meetings, project_documents, feedback_requests)
        if active_project
        else {"overallProgress": 0, "currentStage": None, "stages": []}
    )

    interaction_history = build_client_interaction_history(
        leads,
        quotes,
        meetings,
        project_history_rows,
        diagnostic,
    )

    last_interaction = next(
        (
            item.get("created_at")
            for item in interaction_history
            if item.get("created_at")
        ),
        client.get("last_update"),
    )

    return {
        "client": client,
        "metrics": {
            "projectCount": len(projects),
            "meetingCount": len(meetings),
            "quoteCount": len(quotes),
            "leadCount": len(leads),
            "lastInteraction": last_interaction,
        },
        "latestLead": latest_lead,
        "leads": leads,
        "diagnostic": diagnostic,
        "latestQuote": latest_quote,
        "quotes": quotes,
        "activeProject": active_project,
        "projects": projects,
        "activeMilestones": active_milestones,
        "projectDocuments": project_documents,
        "feedbackRequests": feedback_requests,
        "processFlow": process_flow,
        "meetings": meetings,
        "interactionHistory": interaction_history,
    }


def fetch_team_members_payload():
    return fetch_all(
        """
        SELECT id, full_name, role_title, email, accent_color, is_active, created_at, updated_at
        FROM team_members
        WHERE is_active = 1
        ORDER BY full_name ASC
        """
    )


def fetch_task_by_id(task_id):
    return fetch_one(
        """
        SELECT
            project_tasks.id,
            project_tasks.project_id,
            project_tasks.title,
            project_tasks.description,
            project_tasks.status,
            project_tasks.priority,
            project_tasks.due_date,
            project_tasks.created_at,
            project_tasks.updated_at,
            projects.title AS project_title,
            projects.service_type AS project_service_type,
            projects.admin_status AS project_admin_status,
            users.company AS client_company,
            team_members.id AS assignee_id,
            team_members.full_name AS assignee_name,
            team_members.role_title AS assignee_role,
            team_members.accent_color AS assignee_color
        FROM project_tasks
        JOIN projects ON project_tasks.project_id = projects.id
        LEFT JOIN users ON projects.client_user_id = users.id
        LEFT JOIN team_members ON project_tasks.assignee_id = team_members.id
        WHERE project_tasks.id = %s
        """,
        (task_id,),
    )


def fetch_admin_tasks():
    return fetch_all(
        """
        SELECT
            project_tasks.id,
            project_tasks.project_id,
            project_tasks.title,
            project_tasks.description,
            project_tasks.status,
            project_tasks.priority,
            project_tasks.due_date,
            project_tasks.created_at,
            project_tasks.updated_at,
            projects.title AS project_title,
            projects.service_type AS project_service_type,
            projects.admin_status AS project_admin_status,
            users.company AS client_company,
            team_members.id AS assignee_id,
            team_members.full_name AS assignee_name,
            team_members.role_title AS assignee_role,
            team_members.accent_color AS assignee_color
        FROM project_tasks
        JOIN projects ON project_tasks.project_id = projects.id
        LEFT JOIN users ON projects.client_user_id = users.id
        LEFT JOIN team_members ON project_tasks.assignee_id = team_members.id
        ORDER BY
            CASE project_tasks.status
                WHEN 'in_progress' THEN 0
                WHEN 'pending' THEN 1
                WHEN 'done' THEN 2
                ELSE 3
            END,
            project_tasks.due_date IS NULL,
            project_tasks.due_date ASC,
            project_tasks.updated_at DESC
        """
    )


def performance_metrics_payload():
    summary = fetch_one(
        """
        SELECT
            COUNT(*) AS total_tasks,
            COALESCE(SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END), 0) AS completed_tasks,
            COALESCE(SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END), 0) AS active_tasks,
            COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) AS pending_tasks,
            COALESCE(SUM(CASE WHEN due_date < CURRENT_DATE AND status <> 'done' THEN 1 ELSE 0 END), 0) AS overdue_tasks
        FROM project_tasks
        """
    ) or {}

    team_rows = fetch_all(
        """
        SELECT
            team_members.id,
            team_members.full_name,
            team_members.role_title,
            team_members.email,
            team_members.accent_color,
            COUNT(project_tasks.id) AS total_tasks,
            COALESCE(SUM(CASE WHEN project_tasks.status = 'done' THEN 1 ELSE 0 END), 0) AS completed_tasks,
            COALESCE(SUM(CASE WHEN project_tasks.status = 'in_progress' THEN 1 ELSE 0 END), 0) AS active_tasks,
            COALESCE(SUM(CASE WHEN project_tasks.status = 'pending' THEN 1 ELSE 0 END), 0) AS pending_tasks,
            MAX(project_tasks.updated_at) AS last_activity
        FROM team_members
        LEFT JOIN project_tasks ON project_tasks.assignee_id = team_members.id
        WHERE team_members.is_active = 1
        GROUP BY
            team_members.id,
            team_members.full_name,
            team_members.role_title,
            team_members.email,
            team_members.accent_color
        ORDER BY completed_tasks DESC, active_tasks DESC, total_tasks DESC, team_members.full_name ASC
        """
    )

    for row in team_rows:
        total = int(row.get("total_tasks") or 0)
        completed = int(row.get("completed_tasks") or 0)
        row["completion_rate"] = round((completed / total) * 100) if total else 0

    active_users = sum(1 for row in team_rows if int(row.get("total_tasks") or 0) > 0)
    top_member = next((row for row in team_rows if int(row.get("total_tasks") or 0) > 0), None)
    total_tasks = int(summary.get("total_tasks") or 0)
    completed_tasks = int(summary.get("completed_tasks") or 0)

    return {
        "summary": {
            "totalTasks": total_tasks,
            "completedTasks": completed_tasks,
            "activeTasks": int(summary.get("active_tasks") or 0),
            "pendingTasks": int(summary.get("pending_tasks") or 0),
            "overdueTasks": int(summary.get("overdue_tasks") or 0),
            "activeUsers": active_users,
            "completionRate": round((completed_tasks / total_tasks) * 100) if total_tasks else 0,
        },
        "team": team_rows,
        "topMember": top_member,
    }


def shift_month(anchor, delta):
    total_months = (anchor.year * 12 + (anchor.month - 1)) + delta
    year = total_months // 12
    month = (total_months % 12) + 1
    return date(year, month, 1)


def monthly_trends():
    end_month = date.today().replace(day=1)
    months = [shift_month(end_month, delta) for delta in range(-5, 1)]

    lead_rows = fetch_all(
        """
        SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS period, COUNT(*) AS total
        FROM leads
        WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY DATE_TRUNC('month', created_at)
        """,
    )
    revenue_rows = fetch_all(
        """
        SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS period, COALESCE(SUM(budget), 0) AS total
        FROM projects
        WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY DATE_TRUNC('month', created_at)
        """,
    )
    lead_map = {row["period"]: int(row["total"]) for row in lead_rows}
    revenue_map = {row["period"]: float(row["total"]) for row in revenue_rows}

    points = []
    for month in months:
        period = month.strftime("%Y-%m")
        points.append(
            {
                "label": month.strftime("%b"),
                "period": period,
                "leads": lead_map.get(period, 0),
                "revenue": revenue_map.get(period, 0),
            }
        )
    return points


def admin_overview_payload():
    metrics_row = fetch_one(
        """
        SELECT
            (SELECT COUNT(*) FROM leads WHERE status = 'new') AS new_leads,
            (SELECT COUNT(DISTINCT client_user_id) FROM projects WHERE status = 'in_progress') AS active_clients,
            (SELECT COUNT(*) FROM projects WHERE status = 'in_progress') AS active_projects,
            (SELECT COALESCE(SUM(budget), 0) FROM projects WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)) AS month_revenue,
            (SELECT COALESCE(AVG(budget), 0) FROM projects WHERE budget > 0) AS avg_ticket,
            (SELECT COUNT(*) FROM leads) AS total_leads,
            (SELECT COUNT(*) FROM leads WHERE status = 'won') AS won_leads,
            (SELECT COUNT(*) FROM projects WHERE status = 'completed') AS completed_projects
        """,
    )
    total_leads = metrics_row["total_leads"] or 0
    won_leads = metrics_row["won_leads"] or 0
    completed_projects = metrics_row["completed_projects"] or 0
    team_members = fetch_team_members_payload()
    tasks = fetch_admin_tasks()
    task_metrics = performance_metrics_payload()

    conversion_rate = round((won_leads / total_leads) * 100, 1) if total_leads else 0
    nps_reference = min(96, 72 + completed_projects * 5) if completed_projects else 0

    recent_leads = fetch_all(
        """
        SELECT id, full_name, email, company, phone, service_type, status, created_at
        FROM leads
        ORDER BY created_at DESC
        LIMIT 5
        """
    )
    leads = fetch_all(
        """
          SELECT
              leads.id,
              leads.full_name,
              leads.email,
              leads.company,
              leads.website,
              leads.phone,
              leads.service_type,
              leads.message,
              leads.source,
            leads.status,
            leads.created_at,
            leads.updated_at,
            (
                SELECT projects.id
                FROM projects
                WHERE projects.lead_id = leads.id
                ORDER BY projects.created_at DESC
                LIMIT 1
            ) AS project_id,
            (
                SELECT projects.title
                FROM projects
                WHERE projects.lead_id = leads.id
                ORDER BY projects.created_at DESC
                LIMIT 1
            ) AS project_title,
            (
                SELECT budget_quotes.total_amount
                FROM budget_quotes
                WHERE budget_quotes.lead_id = leads.id OR budget_quotes.client_email = leads.email
                ORDER BY
                    CASE WHEN budget_quotes.lead_id = leads.id THEN 0 ELSE 1 END,
                    budget_quotes.created_at DESC
                LIMIT 1
            ) AS quote_total,
            (
                SELECT budget_quotes.project_label
                FROM budget_quotes
                WHERE budget_quotes.lead_id = leads.id OR budget_quotes.client_email = leads.email
                ORDER BY
                    CASE WHEN budget_quotes.lead_id = leads.id THEN 0 ELSE 1 END,
                    budget_quotes.created_at DESC
                LIMIT 1
            ) AS quote_label
        FROM leads
        ORDER BY leads.created_at DESC
        """
    )
    projects = fetch_all(
        """
        SELECT
            projects.id,
            projects.slug,
            projects.title,
            projects.service_type,
            projects.status,
            projects.admin_status,
            projects.summary,
            projects.budget,
            projects.progress_percent,
            projects.start_date,
            projects.due_date,
            users.full_name AS client_name,
            users.company AS client_company
        FROM projects
        JOIN users ON projects.client_user_id = users.id
        ORDER BY projects.updated_at DESC
        """
    )
    clients = fetch_all(
        """
        SELECT
            users.id,
            users.full_name,
            users.email,
            users.company,
            users.website,
            users.created_at,
            COUNT(projects.id) AS project_count,
            COALESCE(SUM(projects.budget), 0) AS total_budget,
            MAX(projects.updated_at) AS last_update
        FROM users
        JOIN roles ON users.role_id = roles.id AND roles.code = 'client'
        LEFT JOIN projects ON projects.client_user_id = users.id
        GROUP BY users.id, users.full_name, users.email, users.company, users.website, users.created_at
        ORDER BY COALESCE(MAX(projects.updated_at), users.created_at) DESC, users.created_at DESC
        """
    )
    meetings = fetch_all(
        """
        SELECT
            meetings.id,
            meetings.meeting_type,
            meetings.provider,
            meetings.calendly_url,
            meetings.invitee_name,
            meetings.invitee_email,
            meetings.scheduled_for,
            meetings.status,
            projects.title AS project_title,
            users.full_name AS client_name
        FROM meetings
        LEFT JOIN projects ON meetings.project_id = projects.id
        LEFT JOIN users ON meetings.user_id = users.id
        ORDER BY meetings.scheduled_for ASC, meetings.created_at DESC
        LIMIT 20
        """
    )
    project_documents = fetch_all(
        """
        SELECT
            project_documents.id,
            project_documents.project_id,
            project_documents.stage_key,
            project_documents.document_type,
            project_documents.title,
            project_documents.note,
            project_documents.resource_url,
            project_documents.file_name,
            project_documents.status,
            project_documents.is_visible_to_client,
            project_documents.created_at,
            projects.title AS project_title,
            users.company AS client_company,
            users.full_name AS client_name
        FROM project_documents
        JOIN projects ON project_documents.project_id = projects.id
        JOIN users ON projects.client_user_id = users.id
        ORDER BY project_documents.created_at DESC
        LIMIT 30
        """
    )
    feedback_requests = fetch_feedback_requests(limit=50)

    return {
        "metrics": {
            "newLeads": metrics_row["new_leads"] or 0,
            "activeClients": metrics_row["active_clients"] or 0,
            "activeProjects": metrics_row["active_projects"] or 0,
            "monthRevenue": float(metrics_row["month_revenue"] or 0),
            "conversionRate": conversion_rate,
            "avgTicket": float(metrics_row["avg_ticket"] or 0),
            "npsReference": nps_reference,
        },
        "trends": monthly_trends(),
        "recentLeads": recent_leads,
        "leads": leads,
        "projects": projects,
        "teamMembers": team_members,
        "tasks": tasks,
        "taskMetrics": task_metrics,
        "clients": clients,
        "meetings": meetings,
        "projectDocuments": project_documents,
        "feedbackRequests": feedback_requests,
        "settings": get_site_settings(),
        "serviceOptions": [{"value": key, "label": value} for key, value in SERVICE_LABELS.items()],
    }


def reset_operational_data():
    """Remove test/business data while keeping owner accounts and public content."""
    deleted = {}
    with db_cursor() as (connection, cursor):
        cleanup_steps = [
            ("meetings", "DELETE FROM meetings"),
            ("email_logs", "DELETE FROM email_logs"),
            ("budget_quotes", "DELETE FROM budget_quotes"),
            ("diagnostics", "DELETE FROM diagnostics"),
            ("leads", "DELETE FROM leads"),
            ("projects", "DELETE FROM projects"),
        ]
        for key, query in cleanup_steps:
            cursor.execute(query)
            deleted[key] = cursor.rowcount

        cursor.execute(
            """
            DELETE FROM users
            USING roles
            WHERE users.role_id = roles.id
              AND roles.code = 'client'
            """
        )
        deleted["client_users"] = cursor.rowcount
        connection.commit()
    return deleted


def delete_client_account(client_id):
    deleted = {}
    with db_cursor() as (connection, cursor):
        cursor.execute(
            """
            SELECT users.id, users.email
            FROM users
            JOIN roles ON users.role_id = roles.id
            WHERE users.id = %s AND roles.code = 'client'
            """,
            (client_id,),
        )
        client = cursor.fetchone()
        if not client:
            return None

        client_email = client[1]
        cleanup_steps = [
            ("meetings", "DELETE FROM meetings WHERE user_id = %s OR LOWER(invitee_email) = LOWER(%s)"),
            ("budget_quotes", "DELETE FROM budget_quotes WHERE user_id = %s OR LOWER(client_email) = LOWER(%s)"),
            ("diagnostics", "DELETE FROM diagnostics WHERE user_id = %s"),
            ("leads", "DELETE FROM leads WHERE LOWER(email) = LOWER(%s)"),
        ]

        cursor.execute("DELETE FROM projects WHERE client_user_id = %s", (client_id,))
        deleted["projects"] = cursor.rowcount

        cursor.execute(cleanup_steps[0][1], (client_id, client_email))
        deleted[cleanup_steps[0][0]] = cursor.rowcount
        cursor.execute(cleanup_steps[1][1], (client_id, client_email))
        deleted[cleanup_steps[1][0]] = cursor.rowcount
        cursor.execute(cleanup_steps[2][1], (client_id,))
        deleted[cleanup_steps[2][0]] = cursor.rowcount
        cursor.execute(cleanup_steps[3][1], (client_email,))
        deleted[cleanup_steps[3][0]] = cursor.rowcount

        cursor.execute("DELETE FROM users WHERE id = %s", (client_id,))
        deleted["client_users"] = cursor.rowcount
        connection.commit()
    return deleted


def parse_calendly_payload(payload):
    payload = payload or {}
    if not isinstance(payload, dict):
        return {}

    event_data = payload.get("event") or payload.get("scheduled_event") or {}
    invitee_data = payload.get("invitee") or payload.get("invitee_data") or {}
    scheduled_for = (
        event_data.get("start_time")
        or event_data.get("start")
        or payload.get("start_time")
        or payload.get("scheduled_for")
    )

    return {
        "external_event_uri": event_data.get("uri") or payload.get("event_uri"),
        "external_invitee_uri": invitee_data.get("uri") or payload.get("invitee_uri"),
        "invitee_name": invitee_data.get("name") or payload.get("name"),
        "invitee_email": invitee_data.get("email") or payload.get("email"),
        "join_url": event_data.get("location", {}).get("join_url") if isinstance(event_data.get("location"), dict) else None,
        "scheduled_for": scheduled_for,
    }


def add_project_history(project_id, title, detail):
    execute_write(
        """
        INSERT INTO project_history (project_id, title, detail)
        VALUES (%s, %s, %s)
        """,
        (project_id, title, detail),
    )


def safe_pdf_text(value):
    text = str(value or "")
    replacements = {
        "—": "-",
        "–": "-",
        "•": "-",
        "“": '"',
        "”": '"',
        "’": "'",
        "´": "'",
        "\u00a0": " ",
    }
    for source, target in replacements.items():
        text = text.replace(source, target)
    return text.encode("latin-1", "replace").decode("latin-1")


def format_pen_pdf(value):
    amount = float(value or 0)
    formatted = f"{amount:,.0f}"
    formatted = formatted.replace(",", "_").replace(".", ",").replace("_", ".")
    return f"S/ {formatted}"


class QuotePdf(FPDF):
    def header(self):
        self.set_fill_color(9, 14, 24)
        self.rect(0, 0, 210, 28, "F")
        self.set_xy(15, 10)
        self.set_font("Arial", "B", 22)
        self.set_text_color(0, 212, 255)
        self.cell(80, 8, safe_pdf_text("TISNET"), border=0, ln=0)
        self.set_font("Arial", "", 9)
        self.set_text_color(219, 228, 245)
        self.cell(100, 8, safe_pdf_text(getattr(self, "quote_number", "")), border=0, ln=0, align="R")
        self.ln(18)

    def footer(self):
        self.set_y(-12)
        self.set_font("Arial", "", 8)
        self.set_text_color(136, 148, 171)
        self.cell(0, 6, safe_pdf_text(f"Cotizacion TISNET · Pagina {self.page_no()}"), border=0, ln=0, align="C")


def pdf_section_title(pdf, title):
    pdf.ln(4)
    pdf.set_font("Arial", "B", 13)
    pdf.set_text_color(15, 22, 36)
    pdf.cell(0, 8, safe_pdf_text(title), border=0, ln=1)
    pdf.set_draw_color(224, 230, 242)
    pdf.line(15, pdf.get_y(), 195, pdf.get_y())
    pdf.ln(4)


def pdf_info_row(pdf, left_label, left_value, right_label=None, right_value=None):
    pdf.set_font("Arial", "B", 9)
    pdf.set_text_color(81, 95, 121)
    pdf.cell(28, 6, safe_pdf_text(left_label), border=0, ln=0)
    pdf.set_font("Arial", "", 10)
    pdf.set_text_color(22, 28, 40)
    pdf.cell(62, 6, safe_pdf_text(left_value), border=0, ln=0)

    if right_label is not None:
        pdf.set_font("Arial", "B", 9)
        pdf.set_text_color(81, 95, 121)
        pdf.cell(28, 6, safe_pdf_text(right_label), border=0, ln=0)
        pdf.set_font("Arial", "", 10)
        pdf.set_text_color(22, 28, 40)
        pdf.cell(62, 6, safe_pdf_text(right_value), border=0, ln=0)

    pdf.ln(7)


def build_quote_pdf(payload, settings):
    client = payload.get("client") or {}
    project = payload.get("project") or {}
    features = payload.get("features") or []
    delivery = payload.get("delivery") or {}
    breakdown = payload.get("breakdown") or []

    full_name = (client.get("full_name") or "").strip()
    email = (client.get("email") or "").strip().lower()
    company = (client.get("company") or "").strip() or "Sin empresa"
    project_description = (client.get("project_description") or "").strip() or "Sin descripcion adicional."
    project_label = (project.get("label") or "").strip()

    if not full_name:
        raise ValueError("Ingresa el nombre del cliente para generar la cotizacion.")
    validate_email(email)
    if not project_label:
        raise ValueError("Selecciona un tipo de proyecto antes de descargar la cotizacion.")

    quote_number = (payload.get("quote_number") or "").strip() or generate_quote_number()
    issued_at_label = payload.get("issued_at_label") or date.today().isoformat()
    total = float(payload.get("total") or 0)

    pdf = QuotePdf(unit="mm", format="A4")
    pdf.quote_number = quote_number
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.set_margins(15, 15, 15)
    pdf.set_title(safe_pdf_text(f"Cotizacion {quote_number} - {project_label}"))
    pdf.set_author(safe_pdf_text(settings.get("agency_name") or "TISNET"))
    pdf.add_page()

    hero_y = max(pdf.get_y() + 2, 34)
    pdf.set_fill_color(17, 25, 40)
    pdf.set_draw_color(92, 120, 233)
    pdf.rect(15, hero_y, 180, 30, "DF")
    pdf.set_xy(20, hero_y + 5)
    pdf.set_font("Arial", "B", 11)
    pdf.set_text_color(157, 176, 255)
    pdf.cell(120, 6, safe_pdf_text("PRESUPUESTO WEB PERSONALIZADO"), border=0, ln=1)
    pdf.set_x(20)
    pdf.set_font("Arial", "B", 18)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(120, 9, safe_pdf_text(project_label), border=0, ln=0)
    pdf.set_font("Arial", "B", 20)
    pdf.cell(55, 9, safe_pdf_text(format_pen_pdf(total)), border=0, ln=1, align="R")
    pdf.set_x(20)
    pdf.set_font("Arial", "", 10)
    pdf.set_text_color(223, 230, 245)
    pdf.multi_cell(
        155,
        5.5,
        safe_pdf_text(
            f"Cotizacion preparada para {full_name}. Documento emitido el {issued_at_label} por {settings.get('agency_name') or 'TISNET'}."
        ),
    )

    pdf.set_y(hero_y + 36)
    pdf_section_title(pdf, "Informacion del cliente")
    pdf_info_row(pdf, "Nombre", full_name, "Email", email)
    pdf_info_row(pdf, "Empresa", company, "Contacto", settings.get("contact_email") or "hola@tisnet.pe")
    pdf.set_font("Arial", "B", 9)
    pdf.set_text_color(81, 95, 121)
    pdf.cell(0, 6, safe_pdf_text("Descripcion del proyecto"), border=0, ln=1)
    pdf.set_font("Arial", "", 10)
    pdf.set_text_color(22, 28, 40)
    pdf.multi_cell(0, 6, safe_pdf_text(project_description))

    pdf_section_title(pdf, "Detalles del proyecto")
    pdf.set_font("Arial", "B", 15)
    pdf.set_text_color(18, 24, 37)
    pdf.cell(0, 8, safe_pdf_text(project_label), border=0, ln=1)
    pdf.set_font("Arial", "", 10)
    pdf.set_text_color(89, 100, 120)
    pdf.multi_cell(0, 6, safe_pdf_text(project.get("summary") or "Proyecto personalizado desarrollado para el cliente."))
    pdf.ln(2)
    pdf.set_font("Arial", "B", 9)
    pdf.set_text_color(81, 95, 121)
    pdf.cell(0, 6, safe_pdf_text("Modulos incluidos en el precio base"), border=0, ln=1)
    pdf.set_font("Arial", "", 10)
    pdf.set_text_color(22, 28, 40)
    for module in project.get("modules") or []:
        pdf.set_font("Arial", "B", 10)
        pdf.cell(0, 6, safe_pdf_text(f"- {module.get('title') or 'Modulo'}"), border=0, ln=1)
        pdf.set_x(21)
        pdf.set_font("Arial", "", 9)
        pdf.set_text_color(89, 100, 120)
        pdf.multi_cell(168, 5.3, safe_pdf_text(module.get("summary") or "Detalle incluido en el alcance base."))
        pdf.set_x(21)
        pdf.set_text_color(22, 28, 40)
        for bullet in module.get("bullets") or []:
            pdf.cell(0, 5, safe_pdf_text(f"  · {bullet}"), border=0, ln=1)
            pdf.set_x(21)
        pdf.ln(1)

    pdf_section_title(pdf, "Caracteristicas adicionales")
    if features:
        for feature in features:
            pdf.set_font("Arial", "B", 11)
            pdf.set_text_color(18, 24, 37)
            pdf.cell(120, 6, safe_pdf_text(feature.get("label") or "Caracteristica"), border=0, ln=0)
            pdf.cell(56, 6, safe_pdf_text(f"+{format_pen_pdf(feature.get('price') or 0)}"), border=0, ln=1, align="R")
            pdf.set_font("Arial", "", 9)
            pdf.set_text_color(89, 100, 120)
            pdf.multi_cell(0, 5.3, safe_pdf_text(feature.get("summary") or "Mejora adicional para el proyecto."))
            pdf.set_text_color(22, 28, 40)
            for bullet in feature.get("bullets") or []:
                pdf.cell(0, 5, safe_pdf_text(f"  · {bullet}"), border=0, ln=1)
            pdf.ln(2)
    else:
        pdf.set_font("Arial", "", 10)
        pdf.set_text_color(89, 100, 120)
        pdf.multi_cell(0, 6, safe_pdf_text("No se seleccionaron extras en esta cotizacion."))

    pdf_section_title(pdf, "Informacion de entrega")
    pdf_info_row(pdf, "Modalidad", delivery.get("label") or "Normal", "Tiempo estimado", f"{delivery.get('days') or 0} dias habiles")
    pdf_info_row(
        pdf,
        "Fecha estimada",
        delivery.get("estimated_date_label") or "Por definir",
        "Agencia",
        settings.get("agency_name") or "TISNET",
    )

    pdf_section_title(pdf, "Resumen financiero")
    pdf.set_fill_color(245, 247, 251)
    pdf.set_draw_color(226, 232, 241)
    pdf.rect(15, pdf.get_y(), 180, 8, "DF")
    pdf.set_font("Arial", "B", 9)
    pdf.set_text_color(81, 95, 121)
    pdf.set_x(18)
    pdf.cell(120, 8, safe_pdf_text("Concepto"), border=0, ln=0)
    pdf.cell(54, 8, safe_pdf_text("Monto"), border=0, ln=1, align="R")
    pdf.set_font("Arial", "", 10)
    pdf.set_text_color(22, 28, 40)
    for row in breakdown:
        pdf.set_x(18)
        pdf.cell(120, 7, safe_pdf_text(row.get("label") or "Concepto"), border=0, ln=0)
        value = float(row.get("value") or 0)
        sign = "+" if row.get("kind") == "delivery" and value > 0 else ""
        sign = "-" if row.get("kind") == "delivery" and value < 0 else sign
        amount = format_pen_pdf(abs(value)) if row.get("kind") == "delivery" and value < 0 else format_pen_pdf(value)
        pdf.cell(54, 7, safe_pdf_text(f"{sign}{amount}"), border=0, ln=1, align="R")
    pdf.ln(2)
    pdf.set_fill_color(17, 25, 40)
    pdf.set_text_color(255, 255, 255)
    pdf.rect(15, pdf.get_y(), 180, 14, "F")
    pdf.set_xy(19, pdf.get_y() + 3)
    pdf.set_font("Arial", "B", 11)
    pdf.cell(120, 8, safe_pdf_text("TOTAL DE LA INVERSION"), border=0, ln=0)
    pdf.set_font("Arial", "B", 18)
    pdf.cell(56, 8, safe_pdf_text(format_pen_pdf(total)), border=0, ln=1, align="R")

    pdf_section_title(pdf, "Terminos y siguientes pasos")
    pdf.set_font("Arial", "", 10)
    pdf.set_text_color(22, 28, 40)
    for term in QUOTE_TERMS:
        pdf.set_x(15)
        pdf.multi_cell(180, 6, safe_pdf_text(f"- {term}"))
    pdf.ln(3)
    pdf.set_text_color(89, 100, 120)
    pdf.set_x(15)
    pdf.multi_cell(
        180,
        6,
        safe_pdf_text(
            f"Gracias por confiar en {settings.get('agency_name') or 'TISNET'}. Si deseas continuar, responde a {settings.get('contact_email') or 'hola@tisnet.pe'} o escribe al WhatsApp {settings.get('whatsapp_phone') or DEFAULT_WHATSAPP}."
        ),
    )

    pdf_output = pdf.output(dest="S")
    pdf_bytes = bytes(pdf_output) if isinstance(pdf_output, (bytes, bytearray)) else pdf_output.encode("latin-1")
    filename = f"cotizacion-tisnet-{datetime.now().strftime('%Y%m%d-%H%M%S')}.pdf"
    return pdf_bytes, filename


@app.route("/")
@app.route("/inicio/", strict_slashes=False)
@app.route("/servicios/", strict_slashes=False)
@app.route("/portafolio/", strict_slashes=False)
@app.route("/contacto/", strict_slashes=False)
@app.route("/nosotros/", strict_slashes=False)
@app.route("/calculadora-presupuesto-web/", strict_slashes=False)
@app.route("/login/", strict_slashes=False)
@app.route("/registro/", strict_slashes=False)
@app.route("/dashboard/", strict_slashes=False)
@app.route("/dashboard/mi-proyecto/", strict_slashes=False)
@app.route("/dashboard/agenda-reunion/", strict_slashes=False)
@app.route("/dashboard/diagnostico/", strict_slashes=False)
@app.route("/dashboard/historial/", strict_slashes=False)
@app.route("/dashboard/configuracion/", strict_slashes=False)
@app.route("/dashboard/crm/", strict_slashes=False)
@app.route("/dashboard/proyectos/", strict_slashes=False)
@app.route("/dashboard/clientes/", strict_slashes=False)
@app.route("/dashboard/calendario/", strict_slashes=False)
@app.route("/dashboard/reportes/", strict_slashes=False)
@app.route("/diagnostico/", strict_slashes=False)
@app.route("/mi-proyecto/", strict_slashes=False)
@app.route("/agenda-reunion/", strict_slashes=False)
@app.route("/historial/", strict_slashes=False)
@app.route("/configuracion/", strict_slashes=False)
@app.route("/crm/", strict_slashes=False)
@app.route("/proyectos/", strict_slashes=False)
@app.route("/clientes/", strict_slashes=False)
@app.route("/calendario/", strict_slashes=False)
@app.route("/reportes/", strict_slashes=False)
def index():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/src/assets/<path:filename>")
def frontend_asset(filename):
    return send_from_directory(FRONTEND_ASSETS_DIR, filename)


@app.route("/css/<path:filename>")
def css_file(filename):
    return send_from_directory(FRONTEND_ASSETS_DIR / "css", filename)


@app.route("/js/<path:filename>")
def js_file(filename):
    return send_from_directory(FRONTEND_ASSETS_DIR / "js", filename)


@app.route("/img/<path:filename>")
def image_file(filename):
    return send_from_directory(FRONTEND_ASSETS_DIR / "img", filename)


@app.route("/favicon.ico")
def favicon():
    return send_from_directory(FRONTEND_ASSETS_DIR / "img", "favicon.ico")


@app.route("/api/system/health")
def system_health():
    ready = ensure_database_bootstrapped()
    return api_response(
        ready,
        "" if ready else database_error_message(),
        ready=ready,
        bootstrap=BOOTSTRAP_STATE,
    )


@app.route("/api/public/content")
def public_content():
    require_database()
    portfolio = fetch_all(
        """
        SELECT
            id,
            slug,
            category,
            title,
            short_description,
            long_description,
            highlight_1,
            highlight_2,
            highlight_3,
            icon,
            display_order
        FROM portfolio_items
        ORDER BY display_order ASC
        """
    )
    clients = fetch_all(
        """
        SELECT
            showcase_clients.id,
            showcase_clients.name,
            showcase_clients.industry,
            showcase_clients.website_url,
            showcase_clients.display_order,
            portfolio_items.slug AS portfolio_slug
        FROM showcase_clients
        LEFT JOIN portfolio_items ON showcase_clients.portfolio_item_id = portfolio_items.id
        ORDER BY showcase_clients.display_order ASC
        """
    )
    return api_response(True, settings=get_site_settings(), portfolio=portfolio, clients=clients)


@app.route("/api/public/quote-pdf", methods=["POST"])
def public_quote_pdf():
    require_database()
    data = request.get_json(force=True) or {}
    settings = get_site_settings()

    try:
        data["quote_number"] = (data.get("quote_number") or "").strip() or generate_quote_number()
        pdf_bytes, filename = build_quote_pdf(data, settings)
        save_budget_quote(data, user=current_user(), source="pdf_download")
    except ValueError as exc:
        return api_response(False, str(exc)), 400

    return send_file(
        BytesIO(pdf_bytes),
        mimetype="application/pdf",
        as_attachment=True,
        download_name=filename,
    )


@app.route("/api/public/contact", methods=["POST"])
def public_contact():
    require_database()
    data = request.get_json(force=True) or {}
    source = (data.get("source") or "newsletter").strip() or "newsletter"
    user = sync_client_profile_from_data(current_user(), data)
    lead = create_lead(data, source=source, status="new", require_phone=source != "footer_newsletter")
    settings = get_site_settings()
    return api_response(
        True,
        "Solicitud registrada correctamente.",
        lead=lead,
        user=user,
        calendlyUrl=settings["public_calendly_url"],
    )


@app.route("/api/public/quotes", methods=["POST"])
def public_save_quote():
    require_database()
    data = request.get_json(force=True) or {}
    source = (data.get("source") or "calculator").strip() or "calculator"
    user = current_user()
    if user and user.get("role") == "client":
        user = sync_client_profile_from_data(user, data.get("client") or {})
    quote = save_budget_quote(data, user=user, source=source)
    return api_response(True, "Cotizacion guardada correctamente.", quote=quote, user=user)


@app.route("/api/auth/register", methods=["POST"])
def register():
    require_database()
    data = request.get_json(force=True) or {}

    full_name = (data.get("full_name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()
    company = (data.get("company") or "").strip()
    website = (data.get("website") or "").strip()

    if not full_name:
        return api_response(False, "Ingresa tu nombre completo."), 400
    validate_email(email)
    try:
        phone = normalize_client_phone(data.get("phone"))
    except ValueError as exc:
        return api_response(False, str(exc)), 400
    if len(password) < 8:
        return api_response(False, "La contraseña debe tener al menos 8 caracteres."), 400

    existing = fetch_one("SELECT id FROM users WHERE email = %s", (email,))
    if existing:
        return api_response(False, "Ese correo ya está registrado."), 409

    with db_cursor() as (connection, cursor):
        cursor.execute("SELECT id FROM roles WHERE code = 'client'")
        client_role_id = cursor.fetchone()[0]
        cursor.execute(
            """
            INSERT INTO users (role_id, full_name, email, password_hash, company, website, phone, is_demo)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 0) RETURNING id
            """,
            (client_role_id, full_name, email, generate_password_hash(password), company, website, phone),
        )
        user_id = cursor.fetchone()[0]
        connection.commit()

    create_onboarding_project_for_user(user_id, company or full_name)
    user = get_user_by_id(user_id)
    set_session_user(user)

    send_email(
        email,
        "Bienvenido a TISNET",
        f"<h2>Bienvenido, {full_name}</h2><p>Tu cuenta ya está activa. Desde tu panel podrás completar diagnóstico, revisar el avance del proyecto y agendar reuniones.</p>",
        "welcome_register",
        user,
    )
    return api_response(True, "Cuenta creada correctamente.", user=user)


@app.route("/api/auth/login", methods=["POST"])
def login():
    require_database()
    data = request.get_json(force=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()

    validate_email(email)
    if not password:
        return api_response(False, "Ingresa tu contraseña."), 400

    user = fetch_one(
        """
        SELECT users.id, users.full_name, users.email, users.password_hash, roles.code AS role
        FROM users
        JOIN roles ON users.role_id = roles.id
        WHERE users.email = %s
        """,
        (email,),
    )
    if not user or not check_password_hash(user["password_hash"], password):
        return api_response(False, "Correo o contraseña incorrectos."), 401

    authenticated_user = get_user_by_id(user["id"])
    set_session_user(authenticated_user)
    return api_response(True, "Sesión iniciada.", user=authenticated_user)


@app.route("/api/auth/demo", methods=["POST"])
def demo_login():
    require_database()
    if not ENABLE_DEMO_LOGIN:
        return api_response(False, "El acceso demo estÃ¡ desactivado."), 404

    data = request.get_json(force=True) or {}
    role = (data.get("role") or "client").strip().lower()
    if role not in DEMO_ACCOUNTS:
        return api_response(False, "Rol demo no soportado."), 400

    credentials = DEMO_ACCOUNTS[role]
    user = fetch_one(
        """
        SELECT users.id
        FROM users
        JOIN roles ON users.role_id = roles.id
        WHERE users.email = %s AND roles.code = %s
        """,
        (credentials["email"], role),
    )
    if not user:
        return api_response(False, "No se encontró la cuenta demo."), 404

    authenticated_user = get_user_by_id(user["id"])
    set_session_user(authenticated_user)
    return api_response(True, f"Acceso demo como {role}.", user=authenticated_user)


@app.route("/api/auth/session")
def auth_session():
    require_database()
    user = current_user()
    return api_response(True, authenticated=bool(user), user=user)


@app.route("/api/auth/logout", methods=["POST"])
def logout():
    clear_session()
    return api_response(True, "Sesión cerrada correctamente.")


@app.route("/api/client/dashboard")
@require_auth("client")
def client_dashboard(user):
    require_database()
    return api_response(True, **dashboard_payload_for_client(user))


@app.route("/api/client/profile", methods=["PUT"])
@require_auth("client")
def update_client_profile(user):
    require_database()
    data = request.get_json(force=True) or {}

    full_name = (data.get("full_name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    company = (data.get("company") or "").strip()
    website = (data.get("website") or data.get("social_profile") or "").strip()
    phone = normalize_client_phone(data.get("phone"))

    if not full_name:
        return api_response(False, "Ingresa tu nombre completo."), 400
    validate_email(email)

    email_in_use = fetch_one(
        "SELECT id FROM users WHERE email = %s AND id <> %s",
        (email, user["id"]),
    )
    if email_in_use:
        return api_response(False, "Ese correo ya está siendo usado por otra cuenta."), 409

    execute_write(
        """
        UPDATE users
        SET full_name = %s, email = %s, company = %s, website = %s, phone = %s
        WHERE id = %s
        """,
        (full_name, email, company, website, phone, user["id"]),
    )
    updated_user = get_user_by_id(user["id"])
    set_session_user(updated_user)
    return api_response(True, "Perfil actualizado.", profile=updated_user)


@app.route("/api/client/diagnostic", methods=["POST"])
@require_auth("client")
def save_client_diagnostic(user):
    require_database()
    data = request.get_json(force=True) or {}

    business_summary = (data.get("business_summary") or "").strip()
    business_stage = (data.get("business_stage") or "").strip()
    primary_need = (data.get("primary_need") or "").strip()
    goal = (data.get("goal") or "").strip()

    if not business_summary:
        return api_response(False, "Cuéntanos a qué se dedica tu negocio."), 400
    if not business_stage:
        return api_response(False, "Selecciona la etapa actual del negocio."), 400

    latest_lead = latest_lead_for_email(user["email"])
    existing = fetch_one(
        "SELECT id FROM diagnostics WHERE user_id = %s ORDER BY updated_at DESC LIMIT 1",
        (user["id"],),
    )

    if existing:
        execute_write(
            """
            UPDATE diagnostics
            SET business_summary = %s, business_stage = %s, primary_need = %s, goal = %s, lead_id = %s
            WHERE id = %s
            """,
            (
                business_summary,
                business_stage,
                primary_need,
                goal,
                latest_lead["id"] if latest_lead else None,
                existing["id"],
            ),
        )
        diagnostic_id = existing["id"]
    else:
        diagnostic_id = execute_write(
            """
            INSERT INTO diagnostics (user_id, lead_id, business_summary, business_stage, primary_need, goal)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                user["id"],
                latest_lead["id"] if latest_lead else None,
                business_summary,
                business_stage,
                primary_need,
                goal,
            ),
        )

    project = active_project_for_user(user["id"])
    if project:
        add_project_history(
            project["id"],
            "Diagnóstico actualizado",
            "El cliente completó o actualizó la información del diagnóstico del proyecto.",
        )

    diagnostic = fetch_one(
        """
        SELECT id, business_summary, business_stage, primary_need, goal, created_at, updated_at
        FROM diagnostics
        WHERE id = %s
        """,
        (diagnostic_id,),
    )
    return api_response(True, "Diagnóstico guardado.", diagnostic=diagnostic)


@app.route("/api/client/process/action", methods=["POST"])
@require_auth("client")
def client_process_action(user):
    require_database()
    data = request.get_json(force=True) or {}
    action = (data.get("action") or "").strip()
    project = active_project_for_user(user["id"])
    if not project:
        create_onboarding_project_for_user(user["id"], user.get("company") or user["full_name"])
        project = active_project_for_user(user["id"])

    if not action:
        return api_response(False, "Selecciona una accion valida."), 400

    if action == "confirm_kickoff":
        if truthy(data.get("confirmed")):
            execute_write(
                "UPDATE projects SET kickoff_meeting_confirmed = 1 WHERE id = %s",
                (project["id"],),
            )
            add_project_history(project["id"], "Kickoff confirmado", "El cliente confirmo que ya realizo la reunion de kickoff.")
            message = "Kickoff confirmado. Continua con tu diagnostico."
        else:
            message = "Mantendremos el kickoff en 66% hasta que se complete la reunion."

    elif action == "validate_diagnostic":
        diagnostic = fetch_one(
            "SELECT id FROM diagnostics WHERE user_id = %s ORDER BY updated_at DESC LIMIT 1",
            (user["id"],),
        )
        if not diagnostic:
            return api_response(False, "Completa el diagnostico antes de validarlo."), 400
        execute_write(
            "UPDATE projects SET diagnostic_validated = 1 WHERE id = %s",
            (project["id"],),
        )
        add_project_history(
            project["id"],
            "Diagnostico validado",
            "Tu diagnostico ha sido validado correctamente. Espera tu propuesta tecnica comercial.",
        )
        message = "Diagnostico validado correctamente."

    elif action == "feedback_diagnostic":
        feedback_message = (data.get("message") or "").strip()
        if not feedback_message:
            return api_response(False, "Escribe la retroalimentacion para el equipo."), 400
        feedback_id = execute_write(
            """
            INSERT INTO feedback_requests (project_id, stage_key, target_type, message, requested_by_user_id)
            VALUES (%s, 'diagnostic', 'evaluation', %s, %s)
            """,
            (project["id"], feedback_message, user["id"]),
        )
        add_project_history(project["id"], "Retroalimentacion de diagnostico", feedback_message)
        message = f"Retroalimentacion enviada al equipo comercial. Ticket #{feedback_id}."

    elif action == "mark_proposal_reviewed":
        execute_write(
            "UPDATE projects SET proposal_reviewed = 1 WHERE id = %s",
            (project["id"],),
        )
        add_project_history(project["id"], "Propuesta revisada", "El cliente marco la propuesta tecnica comercial como revisada.")
        message = "Propuesta marcada como revisada."

    elif action == "validate_proposal":
        try:
            advance_percent = int(data.get("advance_payment_percent") or 20)
        except (TypeError, ValueError):
            advance_percent = 20
        if advance_percent not in {10, 20, 30}:
            advance_percent = 20
        execute_write(
            """
            UPDATE projects
            SET proposal_validated = 1,
                proposal_reviewed = 1,
                advance_payment_percent = %s,
                admin_status = 'in_progress'
            WHERE id = %s
            """,
            (advance_percent, project["id"]),
        )
        add_project_history(
            project["id"],
            "Propuesta validada",
            f"El cliente valido la propuesta tecnica comercial. Anticipo requerido: {advance_percent}%.",
        )
        message = f"Propuesta validada. Se solicitara anticipo de {advance_percent}%."

    elif action == "feedback_proposal":
        feedback_message = (data.get("message") or "").strip()
        if not feedback_message:
            return api_response(False, "Escribe la retroalimentacion de la propuesta."), 400
        feedback_id = execute_write(
            """
            INSERT INTO feedback_requests (project_id, stage_key, target_type, message, requested_by_user_id)
            VALUES (%s, 'proposal', 'proposal', %s, %s)
            """,
            (project["id"], feedback_message, user["id"]),
        )
        add_project_history(project["id"], "Retroalimentacion de propuesta", feedback_message)
        message = f"Retroalimentacion enviada. Ticket #{feedback_id}."

    elif action == "validate_advance":
        current_count = int(project.get("execution_validated_count") or 0)
        next_count = min(3, current_count + 1)
        execute_write(
            "UPDATE projects SET execution_validated_count = %s, admin_status = %s WHERE id = %s",
            (next_count, "review" if next_count >= 3 else "in_progress", project["id"]),
        )
        add_project_history(
            project["id"],
            "Avance validado",
            f"El cliente valido el avance #{next_count}.",
        )
        message = "Avance validado correctamente."

    elif action == "feedback_advance":
        feedback_message = (data.get("message") or "").strip()
        if not feedback_message:
            return api_response(False, "Escribe la retroalimentacion del avance."), 400
        feedback_id = execute_write(
            """
            INSERT INTO feedback_requests (project_id, stage_key, target_type, message, requested_by_user_id)
            VALUES (%s, 'execution', 'advance', %s, %s)
            """,
            (project["id"], feedback_message, user["id"]),
        )
        add_project_history(project["id"], "Retroalimentacion de avance", feedback_message)
        message = f"Retroalimentacion enviada. Ticket #{feedback_id}."

    elif action == "request_final_meeting":
        execute_write(
            "UPDATE projects SET final_meeting_requested = 1 WHERE id = %s",
            (project["id"],),
        )
        add_project_history(project["id"], "Reunion de entrega final solicitada", "El cliente solicito coordinar la reunion de entrega final.")
        message = "Solicitud de entrega final registrada."

    else:
        return api_response(False, "Accion de proceso no soportada."), 400

    updated_user = get_user_by_id(user["id"])
    payload = dashboard_payload_for_client(updated_user)
    return api_response(True, message, **payload)


@app.route("/api/meetings/capture", methods=["POST"])
def capture_meeting():
    require_database()
    data = request.get_json(force=True) or {}
    payload = data.get("payload") or {}
    meeting_type = (data.get("meeting_type") or "Reunión").strip()
    context = (data.get("context") or "website").strip()
    calendly_url = (data.get("calendly_url") or "").strip()
    lead_id = data.get("lead_id")
    user = current_user()
    project = active_project_for_user(user["id"]) if user and user["role"] == "client" else None
    parsed = parse_calendly_payload(payload)

    meeting_id = execute_write(
        """
        INSERT INTO meetings (
            user_id, project_id, lead_id, meeting_type, provider, calendly_url,
            external_event_uri, external_invitee_uri, invitee_name, invitee_email,
            join_url, scheduled_for, status, payload_json
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (
            user["id"] if user else None,
            project["id"] if project else None,
            lead_id,
            meeting_type,
            "calendly",
            calendly_url,
            parsed.get("external_event_uri"),
            parsed.get("external_invitee_uri"),
            parsed.get("invitee_name"),
            parsed.get("invitee_email"),
            parsed.get("join_url"),
            parsed.get("scheduled_for"),
            "scheduled",
            safe_json_dumps({"context": context, "payload": payload}),
        ),
    )

    if lead_id:
        execute_write("UPDATE leads SET status = 'contacted' WHERE id = %s", (lead_id,))
    if project:
        add_project_history(
            project["id"],
            "Reunión agendada",
            f"Se registró una nueva reunión desde Calendly: {meeting_type}.",
        )

    meeting = fetch_one(
        """
        SELECT id, meeting_type, calendly_url, invitee_name, invitee_email, scheduled_for, status, created_at
        FROM meetings
        WHERE id = %s
        """,
        (meeting_id,),
    )
    return api_response(True, "Reunión registrada.", meeting=meeting)


@app.route("/api/admin/overview")
@require_auth(("admin", "sales"))
def admin_overview(user):
    require_database()
    return api_response(True, **admin_overview_payload(), user=user)


@app.route("/api/admin/system/reset-operational-data", methods=["POST"])
@require_auth("admin")
def admin_reset_operational_data(user):
    require_database()
    deleted = reset_operational_data()
    return api_response(
        True,
        "Datos de prueba eliminados. Se conservaron las cuentas de administrador y ventas.",
        deleted=deleted,
    )


@app.route("/api/admin/clients/<int:client_id>")
@require_auth(("admin", "sales"))
def admin_client_detail(user, client_id):
    require_database()
    detail = admin_client_detail_payload(client_id)
    if not detail:
        return api_response(False, "No encontramos el cliente solicitado."), 404
    return api_response(True, client=detail)


@app.route("/api/admin/clients/<int:client_id>", methods=["DELETE"])
@require_auth("admin")
def admin_delete_client(user, client_id):
    require_database()
    deleted = delete_client_account(client_id)
    if deleted is None:
        return api_response(False, "No encontramos un cliente con ese ID."), 404
    return api_response(True, "Cliente y datos asociados eliminados.", deleted=deleted)


@app.route("/api/admin/leads", methods=["POST"])
@require_auth(("admin", "sales"))
def admin_create_lead(user):
    require_database()
    lead = create_lead(request.get_json(force=True) or {}, source="admin", status="new")
    return api_response(True, "Lead creado correctamente.", lead=lead)


@app.route("/api/admin/leads/<int:lead_id>", methods=["PATCH"])
@require_auth(("admin", "sales"))
def admin_update_lead(user, lead_id):
    require_database()
    data = request.get_json(force=True) or {}
    status = (data.get("status") or "").strip()
    if status not in LEAD_STATUS_ORDER:
        return api_response(False, "Estado de lead no válido."), 400

    execute_write("UPDATE leads SET status = %s WHERE id = %s", (status, lead_id))
    lead = fetch_one(
        """
        SELECT id, full_name, email, company, phone, service_type, status, created_at, updated_at
        FROM leads
        WHERE id = %s
        """,
        (lead_id,),
    )
    return api_response(True, "Lead actualizado.", lead=lead)


@app.route("/api/admin/leads/<int:lead_id>", methods=["DELETE"])
@require_auth("admin")
def admin_delete_lead(user, lead_id):
    require_database()
    lead = fetch_one("SELECT id FROM leads WHERE id = %s", (lead_id,))
    if not lead:
        return api_response(False, "No encontramos el lead solicitado."), 404

    execute_rowcount("DELETE FROM meetings WHERE lead_id = %s", (lead_id,))
    execute_rowcount("DELETE FROM budget_quotes WHERE lead_id = %s", (lead_id,))
    execute_rowcount("DELETE FROM diagnostics WHERE lead_id = %s", (lead_id,))
    deleted = execute_rowcount("DELETE FROM leads WHERE id = %s", (lead_id,))
    return api_response(True, "Lead eliminado.", deleted=deleted)


@app.route("/api/admin/leads/<int:lead_id>/convert", methods=["POST"])
@require_auth(("admin", "sales"))
def admin_convert_lead(user, lead_id):
    require_database()
    lead = fetch_one(
        """
        SELECT id, full_name, email, company, website, phone, service_type, message, source, status, created_at, updated_at
        FROM leads
        WHERE id = %s
        """,
        (lead_id,),
    )
    if not lead:
        return api_response(False, "No encontramos el lead solicitado."), 404

    project, created, client_created = create_project_from_lead(lead, user["role"])
    message = (
        "Lead convertido en proyecto y cliente vinculado correctamente."
        if created
        else "Este lead ya tenia un proyecto vinculado. Te mostramos el registro actual."
    )
    return api_response(
        True,
        message,
        project=project,
        created=created,
        clientCreated=client_created,
    )


@app.route("/api/admin/projects", methods=["POST"])
@require_auth("admin")
def admin_create_project(user):
    require_database()
    data = request.get_json(force=True) or {}

    client_user_id = data.get("client_user_id")
    title = (data.get("title") or "").strip()
    service_type = (data.get("service_type") or "consulting").strip()
    budget = float(data.get("budget") or 0)
    summary = (data.get("summary") or "").strip()

    if not client_user_id:
        return api_response(False, "Selecciona un cliente."), 400
    if not title:
        return api_response(False, "Ingresa un nombre para el proyecto."), 400

    slug = f"project-{client_user_id}-{int(now_utc().timestamp())}"
    today = date.today()
    project_id = execute_write(
        """
        INSERT INTO projects (
            slug, client_user_id, title, service_type, status, admin_status, summary,
            budget, progress_percent, start_date, due_date
        )
        VALUES (%s, %s, %s, %s, 'in_progress', 'backlog', %s, %s, 7, %s, %s)
        """,
        (
            slug,
            client_user_id,
            title,
            service_type,
            summary,
            budget,
            today.isoformat(),
            (today + timedelta(days=21)).isoformat(),
        ),
    )
    execute_many(
        """
        INSERT INTO project_milestones (project_id, title, status, progress_percent, sort_order, due_date)
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        [
            (project_id, "Discovery", "in_progress", 15, 1, today.isoformat()),
            (project_id, "Ejecución", "pending", 0, 2, (today + timedelta(days=14)).isoformat()),
            (project_id, "Entrega", "pending", 0, 3, (today + timedelta(days=21)).isoformat()),
        ],
    )

    project = fetch_one(
        """
        SELECT id, slug, title, service_type, status, admin_status, budget, progress_percent, start_date, due_date
        FROM projects
        WHERE id = %s
        """,
        (project_id,),
    )
    return api_response(True, "Proyecto creado.", project=project)


@app.route("/api/admin/projects/<int:project_id>", methods=["PATCH"])
@require_auth("admin")
def admin_update_project(user, project_id):
    require_database()
    data = request.get_json(force=True) or {}
    admin_status = (data.get("admin_status") or "").strip()
    if admin_status not in PROJECT_STATUS_ORDER:
        return api_response(False, "Estado de proyecto no válido."), 400

    execute_write("UPDATE projects SET admin_status = %s WHERE id = %s", (admin_status, project_id))
    project = fetch_one(
        """
        SELECT id, slug, title, service_type, status, admin_status, budget, progress_percent, updated_at
        FROM projects
        WHERE id = %s
        """,
        (project_id,),
    )
    return api_response(True, "Proyecto actualizado.", project=project)


@app.route("/api/admin/projects/<int:project_id>", methods=["DELETE"])
@require_auth("admin")
def admin_delete_project(user, project_id):
    require_database()
    project = fetch_one("SELECT id, title FROM projects WHERE id = %s", (project_id,))
    if not project:
        return api_response(False, "No encontramos el proyecto solicitado."), 404

    execute_rowcount("DELETE FROM meetings WHERE project_id = %s", (project_id,))
    deleted = execute_rowcount("DELETE FROM projects WHERE id = %s", (project_id,))
    return api_response(True, "Proyecto eliminado.", deleted=deleted)


@app.route("/api/admin/project-documents", methods=["POST"])
@require_auth(("admin", "sales"))
def admin_create_project_document(user):
    require_database()
    data = request.get_json(force=True) or {}
    try:
        project_id = int(data.get("project_id") or 0)
    except (TypeError, ValueError):
        project_id = 0

    stage_key = (data.get("stage_key") or "").strip()
    document_type = (data.get("document_type") or "note").strip() or "note"
    title = (data.get("title") or "").strip()
    note = (data.get("note") or "").strip()
    resource_url = (data.get("resource_url") or "").strip()
    file_name = (data.get("file_name") or "").strip()
    is_visible = 1 if data.get("is_visible_to_client", True) not in (False, "false", "0", 0) else 0

    if not project_id:
        return api_response(False, "Selecciona un proyecto."), 400
    if stage_key not in PROCESS_STAGE_ORDER:
        return api_response(False, "Selecciona una etapa valida."), 400
    if not title:
        return api_response(False, "Ingresa un titulo para el documento o nota."), 400
    if not note and not resource_url and not file_name:
        return api_response(False, "Agrega una nota, enlace o nombre de archivo."), 400

    project = fetch_one("SELECT id, title FROM projects WHERE id = %s", (project_id,))
    if not project:
        return api_response(False, "No encontramos el proyecto seleccionado."), 404

    document_id = execute_write(
        """
        INSERT INTO project_documents (
            project_id,
            stage_key,
            document_type,
            title,
            note,
            resource_url,
            file_name,
            status,
            is_visible_to_client,
            created_by_user_id
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, 'published', %s, %s)
        """,
        (project_id, stage_key, document_type, title, note, resource_url, file_name, is_visible, user["id"]),
    )
    add_project_history(
        project_id,
        f"Documento publicado: {title}",
        f"{process_stage_label(stage_key)} - {note or resource_url or file_name}",
    )

    document = fetch_one(
        """
        SELECT id, project_id, stage_key, document_type, title, note, resource_url, file_name,
               status, is_visible_to_client, created_at, updated_at
        FROM project_documents
        WHERE id = %s
        """,
        (document_id,),
    )
    return api_response(True, "Documento publicado correctamente.", document=document)


@app.route("/api/admin/feedback-requests/<int:feedback_id>", methods=["PATCH"])
@require_auth(("admin", "sales"))
def admin_update_feedback_request(user, feedback_id):
    require_database()
    data = request.get_json(force=True) or {}
    status = (data.get("status") or "").strip()
    if status not in {"pending", "in_review", "resolved"}:
        return api_response(False, "Estado de retroalimentacion no valido."), 400

    feedback = fetch_one(
        """
        SELECT id, project_id, stage_key, message, status
        FROM feedback_requests
        WHERE id = %s
        """,
        (feedback_id,),
    )
    if not feedback:
        return api_response(False, "No encontramos la solicitud de retroalimentacion."), 404

    execute_write(
        "UPDATE feedback_requests SET status = %s WHERE id = %s",
        (status, feedback_id),
    )
    add_project_history(
        feedback["project_id"],
        "Retroalimentacion actualizada",
        f"{process_stage_label(feedback['stage_key'])} paso a estado {status}.",
    )
    return api_response(True, "Retroalimentacion actualizada.", feedbackId=feedback_id, status=status)


@app.route("/api/admin/tasks", methods=["POST"])
@require_auth("admin")
def admin_create_task(user):
    require_database()
    data = request.get_json(force=True) or {}

    try:
        project_id = int(data.get("project_id") or 0)
    except (TypeError, ValueError):
        project_id = 0

    title = (data.get("title") or "").strip()
    description = (data.get("description") or "").strip()
    status = (data.get("status") or "pending").strip()
    priority = (data.get("priority") or "medium").strip()
    due_date = (data.get("due_date") or "").strip() or None
    assignee_raw = data.get("assignee_id")

    if not project_id:
        return api_response(False, "Selecciona un proyecto para la tarea."), 400
    if not title:
        return api_response(False, "Ingresa un nombre para la tarea."), 400
    if status not in TASK_STATUS_ORDER:
        return api_response(False, "Estado de tarea no valido."), 400
    if priority not in TASK_PRIORITY_ORDER:
        priority = "medium"

    project = fetch_one("SELECT id, title FROM projects WHERE id = %s", (project_id,))
    if not project:
        return api_response(False, "No encontramos el proyecto seleccionado."), 404

    assignee_id = None
    assignee_name = "Sin responsable"
    if assignee_raw not in ("", None):
        try:
            assignee_id = int(assignee_raw)
        except (TypeError, ValueError):
            return api_response(False, "Responsable no valido."), 400

        assignee = fetch_one(
            "SELECT id, full_name FROM team_members WHERE id = %s AND is_active = 1",
            (assignee_id,),
        )
        if not assignee:
            return api_response(False, "No encontramos al responsable seleccionado."), 404
        assignee_name = assignee["full_name"]

    task_id = execute_write(
        """
        INSERT INTO project_tasks (
            project_id, title, description, status, assignee_id, priority, due_date
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """,
        (project_id, title, description, status, assignee_id, priority, due_date),
    )

    add_project_history(
        project_id,
        f"Tarea creada: {title}",
        f"Responsable: {assignee_name}. Estado inicial: {task_status_label(status)}.",
    )

    task = fetch_task_by_id(task_id)
    return api_response(True, "Tarea creada correctamente.", task=task)


@app.route("/api/admin/tasks/<int:task_id>", methods=["PATCH"])
@require_auth("admin")
def admin_update_task(user, task_id):
    require_database()
    data = request.get_json(force=True) or {}

    existing = fetch_task_by_id(task_id)
    if not existing:
        return api_response(False, "No encontramos la tarea solicitada."), 404

    updates = []
    params = []
    history_notes = []

    if "status" in data:
        status = (data.get("status") or "").strip()
        if status not in TASK_STATUS_ORDER:
            return api_response(False, "Estado de tarea no valido."), 400
        if status != existing["status"]:
            updates.append("status = %s")
            params.append(status)
            history_notes.append(f"Estado: {task_status_label(status)}.")

    if "assignee_id" in data:
        assignee_raw = data.get("assignee_id")
        assignee_id = None
        assignee_name = "Sin responsable"

        if assignee_raw not in ("", None):
            try:
                assignee_id = int(assignee_raw)
            except (TypeError, ValueError):
                return api_response(False, "Responsable no valido."), 400

            assignee = fetch_one(
                "SELECT id, full_name FROM team_members WHERE id = %s AND is_active = 1",
                (assignee_id,),
            )
            if not assignee:
                return api_response(False, "No encontramos al responsable seleccionado."), 404
            assignee_name = assignee["full_name"]

        if assignee_id != existing.get("assignee_id"):
            updates.append("assignee_id = %s")
            params.append(assignee_id)
            history_notes.append(f"Responsable: {assignee_name}.")

    if not updates:
        return api_response(True, "Sin cambios en la tarea.", task=existing)

    params.append(task_id)
    execute_write(f"UPDATE project_tasks SET {', '.join(updates)} WHERE id = %s", tuple(params))

    add_project_history(
        existing["project_id"],
        f"Tarea actualizada: {existing['title']}",
        " ".join(history_notes),
    )

    task = fetch_task_by_id(task_id)
    return api_response(True, "Tarea actualizada.", task=task)


@app.route("/api/admin/tasks/<int:task_id>", methods=["DELETE"])
@require_auth("admin")
def admin_delete_task(user, task_id):
    require_database()
    task = fetch_task_by_id(task_id)
    if not task:
        return api_response(False, "No encontramos la tarea solicitada."), 404

    deleted = execute_rowcount("DELETE FROM project_tasks WHERE id = %s", (task_id,))
    add_project_history(
        task["project_id"],
        f"Tarea eliminada: {task['title']}",
        "El administrador retiro esta tarea del tablero.",
    )
    return api_response(True, "Tarea eliminada.", deleted=deleted)


@app.route("/api/admin/settings", methods=["PUT"])
@require_auth("admin")
def admin_update_settings(user):
    require_database()
    data = request.get_json(force=True) or {}

    agency_name = (data.get("agency_name") or "").strip()
    contact_email = (data.get("contact_email") or "").strip()
    notification_email = (data.get("notification_email") or "").strip()
    whatsapp_phone = (data.get("whatsapp_phone") or "").strip()
    public_calendly_url = (data.get("public_calendly_url") or "").strip()
    client_review_calendly_url = (data.get("client_review_calendly_url") or "").strip()
    client_close_calendly_url = (data.get("client_close_calendly_url") or "").strip()
    hero_cta_label = (data.get("hero_cta_label") or "").strip()
    footer_tagline = (data.get("footer_tagline") or "").strip()

    if not agency_name:
        return api_response(False, "Ingresa el nombre de la agencia."), 400
    validate_email(contact_email)
    validate_email(notification_email)

    execute_write(
        """
        UPDATE site_settings
        SET agency_name = %s,
            contact_email = %s,
            notification_email = %s,
            whatsapp_phone = %s,
            public_calendly_url = %s,
            client_review_calendly_url = %s,
            client_close_calendly_url = %s,
            hero_cta_label = %s,
            footer_tagline = %s
        WHERE id = %s
        """,
        (
            agency_name,
            contact_email,
            notification_email,
            whatsapp_phone,
            public_calendly_url,
            client_review_calendly_url,
            client_close_calendly_url,
            hero_cta_label,
            footer_tagline,
            SITE_SETTINGS_ID,
        ),
    )
    return api_response(True, "Configuración actualizada.", settings=get_site_settings())


@app.errorhandler(RuntimeError)
def handle_runtime_error(exc):
    logger.error("Error de runtime: %s", exc)
    return api_response(False, str(exc)), 503


@app.errorhandler(ValueError)
def handle_value_error(exc):
    return api_response(False, str(exc)), 400


@app.errorhandler(BadRequest)
def handle_bad_request(exc):
    return api_response(False, f"Solicitud inválida: {exc.description}"), 400


@app.errorhandler(404)
def not_found(_):
    return api_response(False, "Ruta no encontrada."), 404


@app.errorhandler(Exception)
def handle_exception(exc):
    logger.exception("Error no controlado.")
    return api_response(False, f"Ocurrió un error inesperado: {exc}"), 500

if __name__ == "__main__":
    debug_enabled = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.run(
        host=os.getenv("FLASK_HOST", "127.0.0.1"),
        port=int(os.getenv("FLASK_PORT", "5000")),
        debug=debug_enabled,
        use_reloader=False,
    )
