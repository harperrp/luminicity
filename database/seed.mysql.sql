-- RAD GOV / IluminaCity
-- Dados iniciais para ambiente de hospedagem MySQL.
-- Importe depois de database/schema.mysql.sql.
--
-- Senha temporaria de todos os usuarios abaixo: Admin@123456
-- Troque imediatamente apos o primeiro acesso.

SET NAMES utf8mb4;
USE radgov_city_light;

INSERT INTO city_halls
  (id, name, city, state, cnpj, status, plan_id, pole_limit, latitude, longitude)
VALUES
  (1, 'Prefeitura de Vargem Grande do Rio Pardo', 'Vargem Grande do Rio Pardo', 'MG', '12.345.678/0001-01', 'ATIVO', 'PRO', 2000, -15.3983000, -42.3097000),
  (2, 'Prefeitura de Campinas', 'Campinas', 'SP', '23.456.789/0001-02', 'ATIVO', 'PRO', 2000, -22.9099000, -47.0626000),
  (3, 'Prefeitura de Santos', 'Santos', 'SP', '34.567.890/0001-03', 'ATIVO', 'STARTER', 500, -23.9608000, -46.3336000),
  (4, 'Prefeitura de Sorocaba', 'Sorocaba', 'SP', '45.678.901/0001-04', 'INATIVO', 'STARTER', 500, -23.5015000, -47.4526000)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  city = VALUES(city),
  state = VALUES(state),
  cnpj = VALUES(cnpj),
  status = VALUES(status),
  plan_id = VALUES(plan_id),
  pole_limit = VALUES(pole_limit),
  latitude = VALUES(latitude),
  longitude = VALUES(longitude);

INSERT INTO city_hall_modules (city_hall_id, module_id, enabled)
VALUES
  (1, 'ILUMINACAO', 1),
  (1, 'ARBORIZACAO', 1),
  (1, 'PAVIMENTACAO', 1),
  (1, 'SANEAMENTO', 1),
  (1, 'LIMPEZA', 1),
  (1, 'SINALIZACAO', 1),
  (2, 'ILUMINACAO', 1),
  (2, 'ARBORIZACAO', 1),
  (2, 'PAVIMENTACAO', 1),
  (3, 'ILUMINACAO', 1),
  (3, 'SANEAMENTO', 1),
  (4, 'ILUMINACAO', 1)
ON DUPLICATE KEY UPDATE enabled = VALUES(enabled);

INSERT INTO users
  (id, city_hall_id, name, email, password_hash, role, active)
VALUES
  (1, NULL, 'Administrador Geral', 'admin@sistema.gov.br', '$2y$10$Lx8nOKlg/D.BKXeu8lS3d.VyZl.RvG429TDXov/Mu33Mh8aWxFjjG', 'ADMIN', 1),
  (2, 1, 'Gestor Municipal', 'prefeitura@cidade.gov.br', '$2y$10$Lx8nOKlg/D.BKXeu8lS3d.VyZl.RvG429TDXov/Mu33Mh8aWxFjjG', 'CITY_HALL_ADMIN', 1),
  (3, 1, 'Maria Santos', 'secretario@cidade.gov.br', '$2y$10$Lx8nOKlg/D.BKXeu8lS3d.VyZl.RvG429TDXov/Mu33Mh8aWxFjjG', 'SECRETARY', 1),
  (4, 1, 'Carlos Oliveira', 'tecnico@cidade.gov.br', '$2y$10$Lx8nOKlg/D.BKXeu8lS3d.VyZl.RvG429TDXov/Mu33Mh8aWxFjjG', 'TECHNICAL', 1),
  (5, 1, 'Equipe Iluminacao', 'iluminacao@cidade.gov.br', '$2y$10$Lx8nOKlg/D.BKXeu8lS3d.VyZl.RvG429TDXov/Mu33Mh8aWxFjjG', 'FIELD_LIGHTING', 1)
ON DUPLICATE KEY UPDATE
  city_hall_id = VALUES(city_hall_id),
  name = VALUES(name),
  password_hash = VALUES(password_hash),
  role = VALUES(role),
  active = VALUES(active);

INSERT INTO user_permissions
  (user_id, can_approve_complaints, can_manage_maintenance, can_manage_users, can_manage_city_halls, can_view_reports, field_only)
VALUES
  (1, 1, 1, 1, 1, 1, 0),
  (2, 1, 1, 1, 0, 1, 0),
  (3, 1, 0, 0, 0, 0, 0),
  (4, 0, 1, 0, 0, 0, 1),
  (5, 0, 1, 0, 0, 0, 1)
ON DUPLICATE KEY UPDATE
  can_approve_complaints = VALUES(can_approve_complaints),
  can_manage_maintenance = VALUES(can_manage_maintenance),
  can_manage_users = VALUES(can_manage_users),
  can_manage_city_halls = VALUES(can_manage_city_halls),
  can_view_reports = VALUES(can_view_reports),
  field_only = VALUES(field_only);

INSERT INTO user_permission_modules (user_id, module_id)
VALUES
  (1, 'ILUMINACAO'), (1, 'ARBORIZACAO'), (1, 'PAVIMENTACAO'), (1, 'SANEAMENTO'), (1, 'LIMPEZA'), (1, 'SINALIZACAO'),
  (2, 'ILUMINACAO'), (2, 'ARBORIZACAO'), (2, 'PAVIMENTACAO'), (2, 'SANEAMENTO'), (2, 'LIMPEZA'), (2, 'SINALIZACAO'),
  (3, 'ILUMINACAO'), (3, 'ARBORIZACAO'), (3, 'PAVIMENTACAO'), (3, 'SANEAMENTO'), (3, 'LIMPEZA'), (3, 'SINALIZACAO'),
  (4, 'ILUMINACAO'), (4, 'ARBORIZACAO'), (4, 'PAVIMENTACAO'), (4, 'SANEAMENTO'), (4, 'LIMPEZA'), (4, 'SINALIZACAO'),
  (5, 'ILUMINACAO')
ON DUPLICATE KEY UPDATE module_id = VALUES(module_id);

INSERT INTO poles
  (city_hall_id, pole_code, latitude, longitude, status, neighborhood, address, observations)
VALUES
  (1, 'P-001', -15.3989000, -42.3091000, 'QUEIMADO', 'Centro', 'Av. Principal, 200', NULL),
  (1, 'P-002', -15.3994000, -42.3102000, 'FUNCIONANDO', 'Centro', 'Rua Principal, 210', NULL),
  (1, 'P-003', -15.3976000, -42.3088000, 'FUNCIONANDO', 'Nova Esperanca', 'Rua das Palmeiras, 55', NULL),
  (1, 'P-004', -15.4002000, -42.3113000, 'QUEIMADO', 'Vila Nova', 'Rua Nova, 75', NULL),
  (1, 'P-005', -15.3968000, -42.3079000, 'FUNCIONANDO', 'Jardim das Acacias', 'Rua das Flores, 12', NULL),
  (1, 'P-006', -15.4011000, -42.3121000, 'FUNCIONANDO', 'Vila Nova', 'Rua do Campo, 89', NULL),
  (1, 'P-007', -15.4020000, -42.3098000, 'QUEIMADO', 'Bela Vista', 'Rua Bela Vista, 300', NULL),
  (1, 'P-008', -15.3972000, -42.3110000, 'FUNCIONANDO', 'Alto da Serra', 'Travessa da Serra, 40', NULL)
ON DUPLICATE KEY UPDATE
  latitude = VALUES(latitude),
  longitude = VALUES(longitude),
  status = VALUES(status),
  neighborhood = VALUES(neighborhood),
  address = VALUES(address),
  observations = VALUES(observations);

INSERT INTO complaints
  (id, city_hall_id, module_id, pole_id, status, occurrence_type, description, citizen_cpf, citizen_name, citizen_phone, latitude, longitude)
VALUES
  (1, 1, 'ILUMINACAO', (SELECT id FROM poles WHERE city_hall_id = 1 AND pole_code = 'P-001'), 'PENDENTE', 'Poste com problema', 'Poste apagado ha mais de uma semana na Rua das Flores', '123.456.789-00', 'Jose da Silva', '(11) 98765-4321', -15.3989000, -42.3091000),
  (2, 1, 'ILUMINACAO', (SELECT id FROM poles WHERE city_hall_id = 1 AND pole_code = 'P-004'), 'APROVADA', 'Lampada piscando', 'Lampada piscando intermitentemente', '987.654.321-00', 'Maria Santos', NULL, -15.4002000, -42.3113000),
  (3, 1, 'ARBORIZACAO', NULL, 'PENDENTE', 'Galho em risco', 'Arvore com galho prestes a cair sobre a fiacao eletrica', '456.789.123-00', 'Carlos Oliveira', NULL, -15.3985000, -42.3095000)
ON DUPLICATE KEY UPDATE
  status = VALUES(status),
  occurrence_type = VALUES(occurrence_type),
  description = VALUES(description),
  citizen_cpf = VALUES(citizen_cpf),
  citizen_name = VALUES(citizen_name),
  citizen_phone = VALUES(citizen_phone),
  latitude = VALUES(latitude),
  longitude = VALUES(longitude);
