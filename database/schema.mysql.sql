-- RAD GOV / IluminaCity
-- MySQL 8+ initial schema for hosted production database.
-- This schema replaces the current React mock data with persistent records.

CREATE DATABASE IF NOT EXISTS radgov_city_light
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE radgov_city_light;

CREATE TABLE subscription_plans (
  id VARCHAR(30) PRIMARY KEY,
  label VARCHAR(80) NOT NULL,
  default_pole_limit INT UNSIGNED NOT NULL,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO subscription_plans (id, label, default_pole_limit, description)
VALUES
  ('STARTER', 'Essencial', 500, 'Para municipios pequenos iniciando o cadastro.'),
  ('PRO', 'Pro', 2000, 'Para operacao municipal completa.'),
  ('ENTERPRISE', 'Escala', 10000, 'Para cidades maiores e operacoes regionais.')
ON DUPLICATE KEY UPDATE
  label = VALUES(label),
  default_pole_limit = VALUES(default_pole_limit),
  description = VALUES(description);

CREATE TABLE city_halls (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(180) NOT NULL,
  city VARCHAR(120) NOT NULL,
  state CHAR(2) NOT NULL,
  cnpj VARCHAR(20) NULL,
  status ENUM('ATIVO', 'INATIVO') NOT NULL DEFAULT 'ATIVO',
  plan_id VARCHAR(30) NOT NULL DEFAULT 'STARTER',
  pole_limit INT UNSIGNED NOT NULL DEFAULT 500,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_city_halls_cnpj (cnpj),
  KEY idx_city_halls_status (status),
  CONSTRAINT fk_city_halls_plan
    FOREIGN KEY (plan_id) REFERENCES subscription_plans (id)
);

CREATE TABLE modules (
  id VARCHAR(30) PRIMARY KEY,
  label VARCHAR(80) NOT NULL
);

INSERT INTO modules (id, label)
VALUES
  ('ILUMINACAO', 'Iluminacao'),
  ('ARBORIZACAO', 'Arborizacao'),
  ('PAVIMENTACAO', 'Pavimentacao'),
  ('SANEAMENTO', 'Saneamento'),
  ('LIMPEZA', 'Limpeza'),
  ('SINALIZACAO', 'Sinalizacao')
ON DUPLICATE KEY UPDATE label = VALUES(label);

CREATE TABLE city_hall_modules (
  city_hall_id BIGINT UNSIGNED NOT NULL,
  module_id VARCHAR(30) NOT NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (city_hall_id, module_id),
  CONSTRAINT fk_city_hall_modules_city_hall
    FOREIGN KEY (city_hall_id) REFERENCES city_halls (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_city_hall_modules_module
    FOREIGN KEY (module_id) REFERENCES modules (id)
);

CREATE TABLE users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  city_hall_id BIGINT UNSIGNED NULL,
  name VARCHAR(140) NOT NULL,
  email VARCHAR(180) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM(
    'ADMIN',
    'CITY_HALL_ADMIN',
    'SECRETARY',
    'TECHNICAL',
    'FIELD_LIGHTING',
    'FIELD_TREE',
    'FIELD_PAVING',
    'FIELD_SANITATION',
    'FIELD_CLEANING',
    'FIELD_SIGNALING',
    'CUSTOM',
    'CITIZEN'
  ) NOT NULL,
  cpf VARCHAR(14) NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_city_hall (city_hall_id),
  KEY idx_users_role (role),
  CONSTRAINT fk_users_city_hall
    FOREIGN KEY (city_hall_id) REFERENCES city_halls (id)
    ON DELETE SET NULL
);

CREATE TABLE user_permissions (
  user_id BIGINT UNSIGNED PRIMARY KEY,
  can_approve_complaints TINYINT(1) NOT NULL DEFAULT 0,
  can_manage_maintenance TINYINT(1) NOT NULL DEFAULT 0,
  can_manage_users TINYINT(1) NOT NULL DEFAULT 0,
  can_manage_city_halls TINYINT(1) NOT NULL DEFAULT 0,
  can_view_reports TINYINT(1) NOT NULL DEFAULT 0,
  field_only TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_permissions_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
);

CREATE TABLE user_permission_modules (
  user_id BIGINT UNSIGNED NOT NULL,
  module_id VARCHAR(30) NOT NULL,
  PRIMARY KEY (user_id, module_id),
  CONSTRAINT fk_user_permission_modules_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_user_permission_modules_module
    FOREIGN KEY (module_id) REFERENCES modules (id)
);

CREATE TABLE poles (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  city_hall_id BIGINT UNSIGNED NOT NULL,
  pole_code VARCHAR(50) NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  status ENUM('FUNCIONANDO', 'QUEIMADO') NOT NULL DEFAULT 'FUNCIONANDO',
  neighborhood VARCHAR(120) NULL,
  address VARCHAR(255) NULL,
  observations TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_poles_city_code (city_hall_id, pole_code),
  KEY idx_poles_city_status (city_hall_id, status),
  CONSTRAINT fk_poles_city_hall
    FOREIGN KEY (city_hall_id) REFERENCES city_halls (id)
    ON DELETE CASCADE
);

CREATE TABLE pole_history (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  pole_id BIGINT UNSIGNED NOT NULL,
  previous_status ENUM('FUNCIONANDO', 'QUEIMADO') NULL,
  new_status ENUM('FUNCIONANDO', 'QUEIMADO') NOT NULL,
  changed_by_user_id BIGINT UNSIGNED NULL,
  observations TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_pole_history_pole (pole_id, created_at),
  CONSTRAINT fk_pole_history_pole
    FOREIGN KEY (pole_id) REFERENCES poles (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_pole_history_user
    FOREIGN KEY (changed_by_user_id) REFERENCES users (id)
    ON DELETE SET NULL
);

CREATE TABLE complaints (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  city_hall_id BIGINT UNSIGNED NOT NULL,
  module_id VARCHAR(30) NOT NULL,
  pole_id BIGINT UNSIGNED NULL,
  status ENUM('PENDENTE', 'APROVADA', 'REJEITADA') NOT NULL DEFAULT 'PENDENTE',
  occurrence_type VARCHAR(120) NULL,
  description TEXT NOT NULL,
  rejection_reason VARCHAR(160) NULL,
  secretary_observations TEXT NULL,
  citizen_cpf VARCHAR(14) NOT NULL,
  citizen_name VARCHAR(140) NOT NULL,
  citizen_phone VARCHAR(30) NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  photo_url VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_complaints_city_status (city_hall_id, status),
  KEY idx_complaints_module_status (module_id, status),
  KEY idx_complaints_cpf (citizen_cpf),
  CONSTRAINT fk_complaints_city_hall
    FOREIGN KEY (city_hall_id) REFERENCES city_halls (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_complaints_module
    FOREIGN KEY (module_id) REFERENCES modules (id),
  CONSTRAINT fk_complaints_pole
    FOREIGN KEY (pole_id) REFERENCES poles (id)
    ON DELETE SET NULL
);

CREATE TABLE banned_cpfs (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  city_hall_id BIGINT UNSIGNED NOT NULL,
  cpf VARCHAR(14) NOT NULL,
  citizen_name VARCHAR(140) NULL,
  reason VARCHAR(255) NOT NULL,
  banned_by_user_id BIGINT UNSIGNED NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_banned_cpfs_city_cpf (city_hall_id, cpf),
  CONSTRAINT fk_banned_cpfs_city_hall
    FOREIGN KEY (city_hall_id) REFERENCES city_halls (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_banned_cpfs_user
    FOREIGN KEY (banned_by_user_id) REFERENCES users (id)
    ON DELETE SET NULL
);

CREATE TABLE maintenance_orders (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  city_hall_id BIGINT UNSIGNED NOT NULL,
  module_id VARCHAR(30) NOT NULL,
  pole_id BIGINT UNSIGNED NULL,
  complaint_id BIGINT UNSIGNED NULL,
  assigned_user_id BIGINT UNSIGNED NULL,
  status ENUM('ABERTA', 'EM_ANDAMENTO', 'RESOLVIDA') NOT NULL DEFAULT 'ABERTA',
  priority ENUM('baixa', 'media', 'alta') NOT NULL DEFAULT 'media',
  address VARCHAR(255) NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  description TEXT NOT NULL,
  resolution TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  KEY idx_maintenance_city_status (city_hall_id, status),
  KEY idx_maintenance_assigned_user (assigned_user_id, status),
  CONSTRAINT fk_maintenance_city_hall
    FOREIGN KEY (city_hall_id) REFERENCES city_halls (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_maintenance_module
    FOREIGN KEY (module_id) REFERENCES modules (id),
  CONSTRAINT fk_maintenance_pole
    FOREIGN KEY (pole_id) REFERENCES poles (id)
    ON DELETE SET NULL,
  CONSTRAINT fk_maintenance_complaint
    FOREIGN KEY (complaint_id) REFERENCES complaints (id)
    ON DELETE SET NULL,
  CONSTRAINT fk_maintenance_assigned_user
    FOREIGN KEY (assigned_user_id) REFERENCES users (id)
    ON DELETE SET NULL
);

CREATE VIEW city_hall_usage AS
SELECT
  ch.id,
  ch.name,
  ch.city,
  ch.state,
  ch.plan_id,
  sp.label AS plan_label,
  ch.pole_limit,
  COUNT(p.id) AS poles_count,
  GREATEST(ch.pole_limit - COUNT(p.id), 0) AS remaining_pole_slots
FROM city_halls ch
JOIN subscription_plans sp ON sp.id = ch.plan_id
LEFT JOIN poles p ON p.city_hall_id = ch.id
GROUP BY ch.id, ch.name, ch.city, ch.state, ch.plan_id, sp.label, ch.pole_limit;
