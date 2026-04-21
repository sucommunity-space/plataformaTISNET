CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    company VARCHAR(180) DEFAULT '',
    website VARCHAR(255) DEFAULT '',
    phone VARCHAR(50) DEFAULT '',
    is_demo TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS site_settings (
    id INT PRIMARY KEY,
    agency_name VARCHAR(120) NOT NULL,
    contact_email VARCHAR(180) NOT NULL,
    notification_email VARCHAR(180) NOT NULL,
    whatsapp_phone VARCHAR(50) DEFAULT '',
    public_calendly_url VARCHAR(255) DEFAULT '',
    client_review_calendly_url VARCHAR(255) DEFAULT '',
    client_close_calendly_url VARCHAR(255) DEFAULT '',
    hero_cta_label VARCHAR(120) DEFAULT '',
    footer_tagline TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portfolio_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(150) NOT NULL UNIQUE,
    category VARCHAR(120) NOT NULL,
    title VARCHAR(180) NOT NULL,
    short_description TEXT NOT NULL,
    long_description TEXT NOT NULL,
    highlight_1 VARCHAR(120) DEFAULT '',
    highlight_2 VARCHAR(120) DEFAULT '',
    highlight_3 VARCHAR(120) DEFAULT '',
    icon VARCHAR(20) DEFAULT '',
    display_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS showcase_clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    industry VARCHAR(120) DEFAULT '',
    website_url VARCHAR(255) DEFAULT '',
    portfolio_item_id INT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_showcase_portfolio FOREIGN KEY (portfolio_item_id) REFERENCES portfolio_items(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(180) NOT NULL,
    company VARCHAR(180) DEFAULT '',
    website VARCHAR(255) DEFAULT '',
    service_type VARCHAR(80) NOT NULL,
    message TEXT,
    source VARCHAR(80) NOT NULL DEFAULT 'website',
    status VARCHAR(40) NOT NULL DEFAULT 'new',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_leads_email (email),
    INDEX idx_leads_status (status)
);

CREATE TABLE IF NOT EXISTS diagnostics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    lead_id INT NULL,
    business_summary TEXT NOT NULL,
    business_stage VARCHAR(80) NOT NULL,
    primary_need TEXT,
    goal TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_diagnostics_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_diagnostics_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS budget_quotes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    lead_id INT NULL,
    quote_number VARCHAR(80) NOT NULL,
    client_name VARCHAR(150) NOT NULL,
    client_email VARCHAR(180) NOT NULL,
    client_company VARCHAR(180) DEFAULT '',
    service_type VARCHAR(80) NOT NULL,
    project_key VARCHAR(80) DEFAULT '',
    project_label VARCHAR(180) NOT NULL,
    delivery_key VARCHAR(80) DEFAULT '',
    delivery_label VARCHAR(120) DEFAULT '',
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    source VARCHAR(80) NOT NULL DEFAULT 'calculator',
    payload_json LONGTEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_budget_quotes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_budget_quotes_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
    INDEX idx_budget_quotes_email (client_email),
    INDEX idx_budget_quotes_user (user_id),
    INDEX idx_budget_quotes_created (created_at)
);

CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(150) NOT NULL UNIQUE,
    client_user_id INT NOT NULL,
    lead_id INT NULL,
    title VARCHAR(180) NOT NULL,
    service_type VARCHAR(80) NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'in_progress',
    admin_status VARCHAR(40) NOT NULL DEFAULT 'backlog',
    summary TEXT,
    budget DECIMAL(12,2) NOT NULL DEFAULT 0,
    progress_percent INT NOT NULL DEFAULT 0,
    start_date DATE NULL,
    due_date DATE NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_projects_user FOREIGN KEY (client_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_projects_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
    INDEX idx_projects_status (status),
    INDEX idx_projects_admin_status (admin_status)
);

CREATE TABLE IF NOT EXISTS project_milestones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    title VARCHAR(180) NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'pending',
    progress_percent INT NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0,
    due_date DATE NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_milestones_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS team_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    role_title VARCHAR(120) NOT NULL,
    email VARCHAR(180) DEFAULT '',
    accent_color VARCHAR(40) DEFAULT '#0A66C2',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_team_members_active (is_active),
    INDEX idx_team_members_email (email)
);

CREATE TABLE IF NOT EXISTS project_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    title VARCHAR(180) NOT NULL,
    description TEXT,
    status VARCHAR(40) NOT NULL DEFAULT 'pending',
    assignee_id INT NULL,
    priority VARCHAR(40) NOT NULL DEFAULT 'medium',
    due_date DATE NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_project_tasks_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_project_tasks_assignee FOREIGN KEY (assignee_id) REFERENCES team_members(id) ON DELETE SET NULL,
    INDEX idx_project_tasks_status (status),
    INDEX idx_project_tasks_project (project_id),
    INDEX idx_project_tasks_assignee (assignee_id)
);

CREATE TABLE IF NOT EXISTS project_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    author_name VARCHAR(150) NOT NULL,
    author_role VARCHAR(50) NOT NULL,
    body TEXT NOT NULL,
    is_unread_for_client TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_messages_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    title VARCHAR(180) NOT NULL,
    detail TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS meetings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    project_id INT NULL,
    lead_id INT NULL,
    meeting_type VARCHAR(120) NOT NULL,
    provider VARCHAR(50) NOT NULL DEFAULT 'calendly',
    calendly_url VARCHAR(255) DEFAULT '',
    external_event_uri VARCHAR(255) DEFAULT '',
    external_invitee_uri VARCHAR(255) DEFAULT '',
    invitee_name VARCHAR(150) DEFAULT '',
    invitee_email VARCHAR(180) DEFAULT '',
    join_url VARCHAR(255) DEFAULT '',
    scheduled_for DATETIME NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'scheduled',
    payload_json LONGTEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_meetings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_meetings_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    CONSTRAINT fk_meetings_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS email_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipient VARCHAR(180) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    template_name VARCHAR(120) NOT NULL,
    payload_json LONGTEXT,
    status VARCHAR(40) NOT NULL,
    error_message TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
