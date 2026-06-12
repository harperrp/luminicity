-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Tempo de geração: 12/06/2026 às 05:34
-- Versão do servidor: 10.6.25-MariaDB-cll-lve
-- Versão do PHP: 8.4.20

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `radgov_city_light`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `banned_cpfs`
--

CREATE TABLE `banned_cpfs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `city_hall_id` bigint(20) UNSIGNED NOT NULL,
  `cpf` varchar(14) NOT NULL,
  `citizen_name` varchar(140) DEFAULT NULL,
  `reason` varchar(255) NOT NULL,
  `banned_by_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `city_halls`
--

CREATE TABLE `city_halls` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(180) NOT NULL,
  `city` varchar(120) NOT NULL,
  `state` char(2) NOT NULL,
  `cnpj` varchar(20) DEFAULT NULL,
  `status` enum('ATIVO','INATIVO') NOT NULL DEFAULT 'ATIVO',
  `plan_id` varchar(30) NOT NULL DEFAULT 'STARTER',
  `pole_limit` int(10) UNSIGNED NOT NULL DEFAULT 500,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Despejando dados para a tabela `city_halls`
--

INSERT INTO `city_halls` (`id`, `name`, `city`, `state`, `cnpj`, `status`, `plan_id`, `pole_limit`, `latitude`, `longitude`, `created_at`, `updated_at`) VALUES
(1, 'Prefeitura de Vargem Grande do Rio Pardo', 'Vargem Grande do Rio Pardo', 'MG', NULL, 'ATIVO', 'PRO', 2000, -15.3983000, -42.3097000, '2026-06-03 21:06:55', '2026-06-03 22:36:08');

-- --------------------------------------------------------

--
-- Estrutura para tabela `city_hall_modules`
--

CREATE TABLE `city_hall_modules` (
  `city_hall_id` bigint(20) UNSIGNED NOT NULL,
  `module_id` varchar(30) NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Despejando dados para a tabela `city_hall_modules`
--

INSERT INTO `city_hall_modules` (`city_hall_id`, `module_id`, `enabled`, `created_at`) VALUES
(1, 'ARBORIZACAO', 1, '2026-06-03 22:30:00'),
(1, 'ILUMINACAO', 1, '2026-06-03 22:30:00'),
(1, 'PAVIMENTACAO', 1, '2026-06-03 22:30:00'),
(1, 'SANEAMENTO', 1, '2026-06-03 22:30:00');

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `city_hall_usage`
-- (Veja abaixo para a visão atual)
--
CREATE TABLE `city_hall_usage` (
`id` bigint(20) unsigned
,`name` varchar(180)
,`city` varchar(120)
,`state` char(2)
,`plan_id` varchar(30)
,`plan_label` varchar(80)
,`pole_limit` int(10) unsigned
,`poles_count` bigint(21)
,`remaining_pole_slots` decimal(21,0)
);

-- --------------------------------------------------------

--
-- Estrutura para tabela `complaints`
--

CREATE TABLE `complaints` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `city_hall_id` bigint(20) UNSIGNED NOT NULL,
  `module_id` varchar(30) NOT NULL,
  `pole_id` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('PENDENTE','APROVADA','REJEITADA') NOT NULL DEFAULT 'PENDENTE',
  `occurrence_type` varchar(120) DEFAULT NULL,
  `description` text NOT NULL,
  `rejection_reason` varchar(160) DEFAULT NULL,
  `secretary_observations` text DEFAULT NULL,
  `citizen_cpf` varchar(14) NOT NULL,
  `citizen_name` varchar(140) NOT NULL,
  `citizen_phone` varchar(30) DEFAULT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `photo_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Despejando dados para a tabela `complaints`
--

INSERT INTO `complaints` (`id`, `city_hall_id`, `module_id`, `pole_id`, `status`, `occurrence_type`, `description`, `rejection_reason`, `secretary_observations`, `citizen_cpf`, `citizen_name`, `citizen_phone`, `latitude`, `longitude`, `photo_url`, `created_at`, `updated_at`) VALUES
(10, 1, 'ILUMINACAO', 313, 'APROVADA', 'Poste com problema', 'queimado', NULL, 'tecnico vai ao local ', '422.214.728-10', 'Rafael Harper', '16981569599', -15.4057688, -42.3078889, NULL, '2026-06-12 03:47:43', '2026-06-12 03:48:53');

-- --------------------------------------------------------

--
-- Estrutura para tabela `maintenance_orders`
--

CREATE TABLE `maintenance_orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `city_hall_id` bigint(20) UNSIGNED NOT NULL,
  `module_id` varchar(30) NOT NULL,
  `pole_id` bigint(20) UNSIGNED DEFAULT NULL,
  `complaint_id` bigint(20) UNSIGNED DEFAULT NULL,
  `assigned_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('ABERTA','EM_ANDAMENTO','RESOLVIDA') NOT NULL DEFAULT 'ABERTA',
  `priority` enum('baixa','media','alta') NOT NULL DEFAULT 'media',
  `address` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `description` text NOT NULL,
  `resolution` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `resolved_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Despejando dados para a tabela `maintenance_orders`
--

INSERT INTO `maintenance_orders` (`id`, `city_hall_id`, `module_id`, `pole_id`, `complaint_id`, `assigned_user_id`, `status`, `priority`, `address`, `latitude`, `longitude`, `description`, `resolution`, `created_at`, `updated_at`, `resolved_at`) VALUES
(8, 1, 'ILUMINACAO', 313, 10, NULL, 'ABERTA', 'media', NULL, -15.4057688, -42.3078889, 'queimado', NULL, '2026-06-12 03:48:53', '2026-06-12 03:48:53', NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `modules`
--

CREATE TABLE `modules` (
  `id` varchar(30) NOT NULL,
  `label` varchar(80) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Despejando dados para a tabela `modules`
--

INSERT INTO `modules` (`id`, `label`) VALUES
('ARBORIZACAO', 'Arborizacao'),
('ILUMINACAO', 'Iluminacao'),
('LIMPEZA', 'Limpeza'),
('PAVIMENTACAO', 'Pavimentacao'),
('SANEAMENTO', 'Saneamento'),
('SINALIZACAO', 'Sinalizacao');

-- --------------------------------------------------------

--
-- Estrutura para tabela `poles`
--

CREATE TABLE `poles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `city_hall_id` bigint(20) UNSIGNED NOT NULL,
  `pole_code` varchar(50) NOT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `status` enum('FUNCIONANDO','QUEIMADO') NOT NULL DEFAULT 'FUNCIONANDO',
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `neighborhood` varchar(120) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `observations` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Despejando dados para a tabela `poles`
--

INSERT INTO `poles` (`id`, `city_hall_id`, `pole_code`, `latitude`, `longitude`, `status`, `active`, `deleted_at`, `neighborhood`, `address`, `observations`, `created_at`, `updated_at`) VALUES
(9, 1, '1467097163', -15.3946270, -42.3015153, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(10, 1, '1467097269', -15.3950723, -42.3017422, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(11, 1, '1467097277', -15.4008243, -42.3087415, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(12, 1, '1467097331', -15.3956176, -42.3020145, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(13, 1, '1467097476', -15.3942737, -42.3021714, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(14, 1, '1467097483', -15.3943000, -42.3013612, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(15, 1, '1467097490', -15.4009293, -42.3072901, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(16, 1, '1467097501', -15.3992598, -42.3066692, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(17, 1, '1467097503', -15.3989330, -42.3065337, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(18, 1, '1467097505', -15.3987755, -42.3062099, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(19, 1, '1467097507', -15.4007090, -42.3090620, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(20, 1, '1467097518', -15.3995956, -42.3068046, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(21, 1, '1467097529', -15.3983838, -42.3051909, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(22, 1, '1467097533', -15.3973950, -42.3033509, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(23, 1, '1467097534', -15.3971394, -42.3031214, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(24, 1, '1467097535', -15.3968656, -42.3028922, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(25, 1, '1467097549', -15.3952813, -42.3018513, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(26, 1, '1467097557', -15.4009524, -42.3084537, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Mercúrio 80W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Mercúrio | Potência: 80W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(27, 1, '1467097598', -15.3959178, -42.3021969, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(28, 1, '1467097606', -15.4005929, -42.3093428, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(29, 1, '1467097617', -15.3999403, -42.3069212, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(30, 1, '1467097624', -15.3985234, -42.3055242, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(31, 1, '1467097633', -15.4004968, -42.3096233, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(32, 1, '1467097643', -15.4005847, -42.3071735, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(33, 1, '1467097644', -15.4002761, -42.3070564, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(34, 1, '1467097670', -15.3963665, -42.3034479, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(35, 1, '1467097689', -15.3953922, -42.3027995, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Mercúrio 80W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Mercúrio | Potência: 80W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(36, 1, '1467097736', -15.3949242, -42.3036806, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Mercúrio 80W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Mercúrio | Potência: 80W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(37, 1, '1467097738', -15.3947202, -42.3039905, 'FUNCIONANDO', 1, NULL, '', 'Led 150W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Led | Potência: 150W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(38, 1, '1467097752', -15.3942100, -42.3028799, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(39, 1, '1467097764', -15.3986449, -42.3058671, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(40, 1, '1467097775', -15.3963665, -42.3034479, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Curto', 'Luminária: Aberta | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(41, 1, '1467097786', -15.3952335, -42.3031180, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(42, 1, '1467097806', -15.3960113, -42.3032011, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Mercúrio 80W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Mercúrio | Potência: 80W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(43, 1, '1467097833', -15.3947202, -42.3039905, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Curto', 'Luminária: Aberta | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(44, 1, '1467097841', -15.3953473, -42.3035635, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(45, 1, '1467097877', -15.3956204, -42.3037368, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(46, 1, '1467097879', -15.3958841, -42.3038824, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(47, 1, '1467097880', -15.3958841, -42.3038824, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Curto', 'Luminária: Aberta | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(48, 1, '1467097881', -15.3951013, -42.3026449, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(49, 1, '1467097882', -15.3948193, -42.3024810, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(50, 1, '1467097890', -15.3982531, -42.3048388, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(51, 1, '1467097895', -15.3976256, -42.3037389, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(52, 1, '1467097899', -15.3966193, -42.3026905, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(53, 1, '1467097904', -15.3957018, -42.3030096, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Mercúrio 80W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Mercúrio | Potência: 80W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(54, 1, '1467097935', -15.3940008, -42.3020167, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(55, 1, '1467097945', -15.3939456, -42.3011889, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(56, 1, '1467097953', -15.4011742, -42.3073801, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(57, 1, '1467097976', -15.3980592, -42.3044874, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(58, 1, '1467097977', -15.3978563, -42.3041456, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(59, 1, '1467097985', -15.3963824, -42.3025167, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(60, 1, '1467097994', -15.3955695, -42.3025272, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(61, 1, '1467098016', -15.3950743, -42.3033994, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(62, 1, '1467098017', -15.3950743, -42.3033994, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Curto', 'Luminária: Aberta | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(63, 1, '1467098022', -15.3944745, -42.3038354, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(64, 1, '1467098023', -15.3945104, -42.3030715, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(65, 1, '1467098054', -15.3947832, -42.3032263, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(66, 1, '1467098095', -15.3937370, -42.3018618, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(67, 1, '1467098096', -15.3946864, -42.3019520, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(68, 1, '1467098097', -15.3945102, -42.3023081, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(69, 1, '1467098098', -15.3948361, -42.3016335, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(70, 1, '1467098105', -15.4011349, -42.3078647, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Mercúrio 80W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Mercúrio | Potência: 80W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(71, 1, '1467098106', -15.4011861, -42.3083575, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(72, 1, '1467098145', -15.3961272, -42.3023338, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(73, 1, '1467098154', -15.3953922, -42.3027995, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Curto', 'Luminária: Aberta | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(74, 1, '1467098267', -15.3942100, -42.3028799, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Curto', 'Luminária: Aberta | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(75, 1, '1467098355', -15.3949932, -42.3041546, 'FUNCIONANDO', 1, NULL, '', 'Led 150W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Led | Potência: 150W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(76, 1, '1467098371', -15.3943691, -42.3025985, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Mercúrio 80W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Mercúrio | Potência: 80W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(77, 1, '1467099436', -15.3940691, -42.3031796, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Mercúrio 80W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Mercúrio | Potência: 80W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(78, 1, '1467099737', -15.3936556, -42.3033432, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(79, 1, '1467099783', -15.3939193, -42.3034887, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(80, 1, '1467099790', -15.3931277, -42.3030148, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Mercúrio 80W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Mercúrio | Potência: 80W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(81, 1, '1467099866', -15.3939827, -42.3027618, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Mercúrio 80W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Mercúrio | Potência: 80W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(82, 1, '1467099873', -15.3933918, -42.3031883, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(83, 1, '1467099932', -15.3937281, -42.3026161, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(84, 1, '1467100004', -15.3934823, -42.3024610, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(85, 1, '1467100133', -15.3942015, -42.3036714, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Mercúrio 80W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Mercúrio | Potência: 80W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(86, 1, '1467100193', -15.4052960, -42.3106136, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(87, 1, '1467100232', -15.4055559, -42.3104427, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(88, 1, '1467100286', -15.4055559, -42.3104427, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(89, 1, '1467100293', -15.4050085, -42.3107384, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(90, 1, '1467100327', -15.4048968, -42.3104698, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(91, 1, '1467100334', -15.4052683, -42.3113123, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(92, 1, '1467100372', -15.3939193, -42.3034887, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Curto', 'Luminária: Aberta | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(93, 1, '1467100440', -15.4047484, -42.3101459, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(94, 1, '1467100547', -15.4041745, -42.3104884, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(95, 1, '1467100723', -15.4050085, -42.3107384, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(96, 1, '1467100793', -15.4051384, -42.3110254, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(97, 1, '1467108011', -15.4030897, -42.3111634, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(98, 1, '1467108018', -15.4010028, -42.3111251, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(99, 1, '1467108195', -15.4013704, -42.3101521, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(100, 1, '1467108244', -15.4023671, -42.3111540, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(101, 1, '1467108251', -15.3992552, -42.3130096, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(102, 1, '1467108258', -15.4326220, -42.3116399, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(103, 1, '1467108264', -15.4027792, -42.3146123, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(104, 1, '1467108268', -15.4027063, -42.3138125, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(105, 1, '1467108271', -15.3969229, -42.3061314, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(106, 1, '1467108274', -15.3975777, -42.3057505, 'FUNCIONANDO', 1, NULL, '', 'Led 150W - Braço Longo', 'Luminária: Fechada | Braço: Braço Longo | Tipo: Led | Potência: 150W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(107, 1, '1467108277', -15.3964495, -42.3050668, 'FUNCIONANDO', 1, NULL, '', 'Led 150W - Braço Longo', 'Luminária: Fechada | Braço: Braço Longo | Tipo: Led | Potência: 150W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(108, 1, '1467108280', -15.3955121, -42.3044923, 'FUNCIONANDO', 1, NULL, '', 'Led 150W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Led | Potência: 150W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(109, 1, '1467108285', -15.3989283, -42.3128555, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(110, 1, '1467108291', -15.3937160, -42.3038544, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(111, 1, '1467108292', -15.4305909, -42.3094964, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(112, 1, '1467108298', -15.4021343, -42.3150675, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(113, 1, '1467108303', -15.4027063, -42.3138125, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(114, 1, '1467108306', -15.3972327, -42.3063508, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(115, 1, '1467108309', -15.3972501, -42.3055499, 'FUNCIONANDO', 1, NULL, '', 'Led 150W - Braço Longo', 'Luminária: Fechada | Braço: Braço Longo | Tipo: Led | Potência: 150W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(116, 1, '1467108312', -15.3965182, -42.3055314, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(117, 1, '1467108315', -15.3955121, -42.3044923, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(118, 1, '1467108318', -15.3954854, -42.3052655, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(119, 1, '1467108337', -15.4029047, -42.3108027, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(120, 1, '1467108344', -15.4008815, -42.3115456, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(121, 1, '1467108351', -15.4018029, -42.3152952, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(122, 1, '1467108395', -15.3992552, -42.3130096, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(123, 1, '1467108401', -15.4325910, -42.3120594, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(124, 1, '1467108413', -15.4029047, -42.3108027, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(125, 1, '1467108420', -15.4049058, -42.3074810, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(126, 1, '1467108427', -15.4021231, -42.3133917, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(127, 1, '1467108433', -15.4030928, -42.3144034, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(128, 1, '1467108436', -15.4025126, -42.3134798, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(129, 1, '1467108439', -15.3969229, -42.3061314, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(130, 1, '1467108442', -15.3969953, -42.3053949, 'FUNCIONANDO', 1, NULL, '', 'Led 150W - Braço Longo', 'Luminária: Fechada | Braço: Braço Longo | Tipo: Led | Potência: 150W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(131, 1, '1467108445', -15.3961675, -42.3049029, 'FUNCIONANDO', 1, NULL, '', 'Led 150W - Braço Longo', 'Luminária: Fechada | Braço: Braço Longo | Tipo: Led | Potência: 150W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(132, 1, '1467108448', -15.3957071, -42.3041826, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(133, 1, '1467108460', -15.4018029, -42.3152952, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(134, 1, '1467108492', -15.4028626, -42.3140433, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(135, 1, '1467108495', -15.3962388, -42.3040826, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(136, 1, '1467108498', -15.3970821, -42.3058500, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(137, 1, '1467108501', -15.3966859, -42.3052034, 'FUNCIONANDO', 1, NULL, '', 'Led 150W - Braço Longo', 'Luminária: Fechada | Braço: Braço Longo | Tipo: Led | Potência: 150W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(138, 1, '1467108504', -15.3958398, -42.3047023, 'FUNCIONANDO', 1, NULL, '', 'Led 150W - Braço Longo', 'Luminária: Fechada | Braço: Braço Longo | Tipo: Led | Potência: 150W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(139, 1, '1467108507', -15.3953442, -42.3048017, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(140, 1, '1467108577', -15.3951669, -42.3050740, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(141, 1, '1467108659', -15.4024568, -42.3148399, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(142, 1, '1467108745', -15.3951669, -42.3050740, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(143, 1, '1467108746', -15.3948212, -42.3048643, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(144, 1, '1467108747', -15.3950079, -42.3053647, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(145, 1, '1467108850', -15.4026269, -42.3109832, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(146, 1, '1467108857', -15.4052019, -42.3073189, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(147, 1, '1467108864', -15.4018993, -42.3135529, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(148, 1, '1467108870', -15.4030928, -42.3144034, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(149, 1, '1467135310', -15.4039144, -42.3098959, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(150, 1, '1467135331', -15.4035151, -42.3097428, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(151, 1, '1467135362', -15.4024849, -42.3104449, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(152, 1, '1467135418', -15.4032733, -42.3099135, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(153, 1, '1467135424', -15.4030135, -42.3100936, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(154, 1, '1467135449', -15.4027537, -42.3102646, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(155, 1, '1467135482', -15.4022468, -42.3109229, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(156, 1, '1467135527', -15.4019384, -42.3108151, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(157, 1, '1467135536', -15.4014368, -42.3111661, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(158, 1, '1467135589', -15.4025062, -42.3114595, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(159, 1, '1467135597', -15.4052683, -42.3113123, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(160, 1, '1467135652', -15.4040443, -42.3101829, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(161, 1, '1467135685', -15.4023147, -42.3105589, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Mercúrio 125W - Braço Leve II', 'Luminária: Aberta | Braço: Braço Leve II | Tipo: Vapor de Mercúrio | Potência: 125W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(162, 1, '1467135700', -15.4016876, -42.3109859, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(163, 1, '1467135709', -15.4026542, -42.3117462, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(164, 1, '1467135714', -15.4012883, -42.3115776, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(165, 1, '1467135722', -15.4023671, -42.3111540, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(166, 1, '1467135731', -15.4019641, -42.3114385, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(167, 1, '1467135836', -15.4016952, -42.3116189, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(168, 1, '1467135935', -15.4014264, -42.3117992, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(169, 1, '1467136553', -15.4017854, -42.3123533, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(170, 1, '1467136769', -15.4024423, -42.3121494, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Curto', 'Luminária: Aberta | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(171, 1, '1467136944', -15.4021480, -42.3117156, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(172, 1, '1467136985', -15.4016104, -42.3120762, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(173, 1, '1467137062', -15.4045805, -42.3067310, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(174, 1, '1467137106', -15.4034751, -42.3065559, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(175, 1, '1467137178', -15.4041209, -42.3068167, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(176, 1, '1467137191', -15.4038687, -42.3068706, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(177, 1, '1467137265', -15.4031328, -42.3065170, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(178, 1, '1467137271', -15.4028091, -42.3066421, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(179, 1, '1467137309', -15.4025220, -42.3067947, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(180, 1, '1467137334', -15.4019142, -42.3125472, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(181, 1, '1467137335', -15.4020340, -42.3127411, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(182, 1, '1467137439', -15.4037366, -42.3064067, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(183, 1, '1467137475', -15.4038322, -42.3068431, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(184, 1, '1467137476', -15.4040067, -42.3063381, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(185, 1, '1467137494', -15.4020104, -42.3070621, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(186, 1, '1467137511', -15.4024015, -42.3072898, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(187, 1, '1467137549', -15.4018091, -42.3075953, 'FUNCIONANDO', 1, NULL, '', 'Led 117W - Braço Longo', 'Luminária: Fechada | Braço: Braço Longo | Tipo: Led | Potência: 117W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(188, 1, '1467137562', -15.4023181, -42.3071140, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(189, 1, '1467137593', -15.4019345, -42.3075099, 'FUNCIONANDO', 1, NULL, '', 'Led 117W - Braço Longo', 'Luminária: Fechada | Braço: Braço Longo | Tipo: Led | Potência: 117W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(190, 1, '1467137594', -15.4018423, -42.3073529, 'FUNCIONANDO', 1, NULL, '', 'Led 117W - Braço Longo', 'Luminária: Fechada | Braço: Braço Longo | Tipo: Led | Potência: 117W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(191, 1, '1467137603', -15.4026979, -42.3071463, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(192, 1, '1467137626', -15.4017680, -42.3071862, 'FUNCIONANDO', 1, NULL, '', 'Led 117W - Braço Longo', 'Luminária: Fechada | Braço: Braço Longo | Tipo: Led | Potência: 117W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(193, 1, '1467137642', -15.4021230, -42.3074144, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(194, 1, '1467137657', -15.4015256, -42.3073104, 'FUNCIONANDO', 1, NULL, '', 'Led 117W - Braço Longo', 'Luminária: Fechada | Braço: Braço Longo | Tipo: Led | Potência: 117W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(195, 1, '1467137681', -15.4029761, -42.3070031, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(196, 1, '1467137737', -15.4032725, -42.3068596, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(197, 1, '1467137758', -15.4022348, -42.3069474, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(198, 1, '1467137765', -15.4013750, -42.3075451, 'FUNCIONANDO', 1, NULL, '', 'Led 117W - Braço Longo', 'Luminária: Fechada | Braço: Braço Longo | Tipo: Led | Potência: 117W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(199, 1, '1467137779', -15.4023297, -42.3073279, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(200, 1, '1467137845', -15.4033179, -42.3076318, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(201, 1, '1467137847', -15.4035603, -42.3075076, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(202, 1, '1467137975', -15.4038027, -42.3073928, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(203, 1, '1467138012', -15.4029842, -42.3077903, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(205, 1, '1467138088', -15.4019079, -42.3082924, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(206, 1, '1467138089', -15.4016474, -42.3084167, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(207, 1, '1467138090', -15.4013870, -42.3085412, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(208, 1, '1467138117', -15.4028419, -42.3078521, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08');
INSERT INTO `poles` (`id`, `city_hall_id`, `pole_code`, `latitude`, `longitude`, `status`, `active`, `deleted_at`, `neighborhood`, `address`, `observations`, `created_at`, `updated_at`) VALUES
(209, 1, '1467138125', -15.4024688, -42.3076241, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(210, 1, '1467138198', -15.4023658, -42.3080723, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(211, 1, '1467138299', -15.4027292, -42.3082446, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(212, 1, '1467138301', -15.4030020, -42.3083993, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(213, 1, '1467138321', -15.4031995, -42.3082944, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(214, 1, '1467138344', -15.4040895, -42.3086926, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(215, 1, '1467138354', -15.4042102, -42.3089610, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(216, 1, '1467138385', -15.4035050, -42.3081601, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(217, 1, '1467138386', -15.4037923, -42.3080167, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(218, 1, '1467138387', -15.4036813, -42.3077626, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(219, 1, '1467138452', -15.4026083, -42.3079575, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(220, 1, '1467138519', -15.4030786, -42.3080073, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(221, 1, '1467138527', -15.4035989, -42.3092016, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(222, 1, '1467138530', -15.4034688, -42.3088960, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(223, 1, '1467138531', -15.4033571, -42.3086275, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(224, 1, '1467138542', -15.4039499, -42.3083499, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(225, 1, '1467138592', -15.4037751, -42.3088363, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(226, 1, '1467138617', -15.4037570, -42.3095814, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(227, 1, '1467138635', -15.4021234, -42.3081872, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(228, 1, '1467138702', -15.4045285, -42.3091432, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(229, 1, '1467138717', -15.4043498, -42.3085588, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(230, 1, '1467138748', -15.4044883, -42.3095533, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Mercúrio 80W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Mercúrio | Potência: 80W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(231, 1, '1467138802', -15.4043400, -42.3092480, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(232, 1, '1467138847', -15.4043400, -42.3092480, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(233, 1, '1467138862', -15.4040440, -42.3094101, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(234, 1, '1467139071', -15.4040616, -42.3078829, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(235, 1, '1467139072', -15.4046373, -42.3084341, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(236, 1, '1467139073', -15.4045999, -42.3083322, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(237, 1, '1467170894', -15.4044610, -42.3080453, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(238, 1, '1467170895', -15.4043401, -42.3077583, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(239, 1, '1467170930', -15.4043864, -42.3071059, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(240, 1, '1467170960', -15.4042105, -42.3074992, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(241, 1, '1467170967', -15.4052122, -42.3081661, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(242, 1, '1467171028', -15.4046647, -42.3069627, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(243, 1, '1467171086', -15.4040991, -42.3072493, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(244, 1, '1467171093', -15.4049058, -42.3074810, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(245, 1, '1467171131', -15.4046092, -42.3076059, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(246, 1, '1467171159', -15.4049519, -42.3082997, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(247, 1, '1467171420', -15.4009250, -42.3121595, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Mercúrio 80W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Mercúrio | Potência: 80W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(248, 1, '1467171421', -15.4007010, -42.3123114, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Mercúrio 125W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Mercúrio | Potência: 125W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(249, 1, '1467171441', -15.4011502, -42.3113560, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(250, 1, '1467171511', -15.4001102, -42.3127472, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(251, 1, '1467171512', -15.4001102, -42.3127472, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Curto', 'Luminária: Aberta | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(252, 1, '1467171560', -15.4005309, -42.3124345, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Mercúrio 125W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Mercúrio | Potência: 125W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(253, 1, '1467171608', -15.4011579, -42.3119983, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(254, 1, '1467171705', -15.4005309, -42.3124345, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Mercúrio 80W - Braço Curto', 'Luminária: Aberta | Braço: Braço Curto | Tipo: Vapor de Mercúrio | Potência: 80W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(255, 1, '1467171755', -15.4003661, -42.3100067, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(256, 1, '1467171756', -15.4002171, -42.3103810, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(257, 1, '1467171772', -15.3995264, -42.3122799, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(258, 1, '1467171833', -15.4002892, -42.3126145, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Mercúrio 80W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Mercúrio | Potência: 80W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(259, 1, '1467171894', -15.3998850, -42.3113070, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(260, 1, '1467171897', -15.3997625, -42.3116345, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(261, 1, '1467171966', -15.3999600, -42.3130285, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(262, 1, '1467171967', -15.3998369, -42.3133001, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(263, 1, '1467171968', -15.3998445, -42.3132832, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Curto', 'Luminária: Aberta | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(264, 1, '1467171969', -15.3997053, -42.3136276, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Mercúrio 80W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Mercúrio | Potência: 80W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(265, 1, '1467171995', -15.3999176, -42.3102639, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(266, 1, '1467172016', -15.3994128, -42.3125886, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(267, 1, '1467172057', -15.3999986, -42.3109890, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(268, 1, '1467172069', -15.3989489, -42.3138235, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(269, 1, '1467172070', -15.3990717, -42.3135147, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(270, 1, '1467172071', -15.3991855, -42.3132153, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(271, 1, '1467172080', -15.3997407, -42.3105827, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(272, 1, '1467172081', -15.3995903, -42.3108360, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(273, 1, '1467172093', -15.3992992, -42.3129066, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(274, 1, '1467172165', -15.4058515, -42.3102434, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(275, 1, '1467172212', -15.3996401, -42.3119619, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(276, 1, '1467172228', -15.4060936, -42.3100913, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(277, 1, '1467172375', -15.4064072, -42.3098824, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(278, 1, '1467172522', -15.4060936, -42.3100913, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(279, 1, '1467378033', -15.4018046, -42.3079679, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(280, 1, '1467378139', -15.3985041, -42.3128889, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(281, 1, '1467378228', -15.3986718, -42.3125609, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(282, 1, '1467629846', -15.4001032, -42.3106804, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(283, 1, '1467727053', -15.4016303, -42.3077466, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(284, 1, '1467802086', -15.4046092, -42.3098404, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Mercúrio 80W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Mercúrio | Potência: 80W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(285, 1, '1468012103', -15.4010772, -42.3083217, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(286, 1, '1468012187', -15.4010018, -42.3080526, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(287, 1, '1468080097', -15.4327444, -42.3105582, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(288, 1, '1468080221', -15.4336520, -42.3109190, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(289, 1, '1468196518', -15.3947156, -42.3058433, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(290, 1, '1468196519', -15.4315162, -42.3113190, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(291, 1, '1468196557', -15.3932302, -42.3040097, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(292, 1, '1468196558', -15.3957938, -42.3061180, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(293, 1, '1468196559', -15.3992407, -42.3147974, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(294, 1, '1468196586', -15.3929480, -42.3038365, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(295, 1, '1468196587', -15.3951841, -42.3057442, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(296, 1, '1468196588', -15.4011729, -42.3132457, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(297, 1, '1468196618', -15.3942554, -42.3066219, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(298, 1, '1468196619', -15.4321943, -42.3113754, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(299, 1, '1468196620', -15.4036658, -42.3139864, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(300, 1, '1468196689', -15.3944413, -42.3063122, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(301, 1, '1468196690', -15.4325844, -42.3122643, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(302, 1, '1468196727', -15.3934725, -42.3061199, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(303, 1, '1468196728', -15.3966410, -42.3059767, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(304, 1, '1468196729', -15.4030881, -42.3162563, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(305, 1, '1468196745', -15.3939412, -42.3052946, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(306, 1, '1468196746', -15.3958128, -42.3054567, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(307, 1, '1468196747', -15.4021150, -42.3142204, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(308, 1, '1468196799', -15.3939706, -42.3056786, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(309, 1, '1468196800', -15.3963769, -42.3057939, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(310, 1, '1468196801', -15.4025811, -42.3154155, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(311, 1, '1468272869', -15.4057688, -42.3078889, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(312, 1, '1468272935', -15.4056026, -42.3075931, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(313, 1, '1468273003', -15.4057688, -42.3078889, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-12 03:51:57'),
(314, 1, '1468382949', -15.4021265, -42.3106824, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(315, 1, '1468414776', -15.4039169, -42.3138342, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(316, 1, '1468414777', -15.4060594, -42.3110042, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(317, 1, '1468414779', -15.3943560, -42.3052334, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(318, 1, '1468414780', -15.3928365, -42.3028323, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(319, 1, '1468432079', -15.4028409, -42.3152353, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(320, 1, '1468432080', -15.4016844, -42.3137139, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(321, 1, '1468432082', -15.3955206, -42.3059446, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(322, 1, '1468432083', -15.3937262, -42.3062826, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(323, 1, '1468432144', -15.4038414, -42.3143193, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(324, 1, '1468432145', -15.4051305, -42.3126176, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(325, 1, '1468432146', -15.4059263, -42.3097117, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(326, 1, '1468432147', -15.3946109, -42.3053977, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(327, 1, '1468432148', -15.3935485, -42.3041918, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(328, 1, '1468432209', -15.4032028, -42.3130426, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(329, 1, '1468432210', -15.4038521, -42.3122150, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(330, 1, '1468432211', -15.3950425, -42.3067328, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(331, 1, '1468432302', -15.4027378, -42.3156742, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(332, 1, '1468432303', -15.4012725, -42.3140078, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(333, 1, '1468432304', -15.3952106, -42.3064420, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(334, 1, '1468432305', -15.3939870, -42.3064498, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(335, 1, '1468432388', -15.4015193, -42.3150009, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(336, 1, '1468432390', -15.3956623, -42.3057007, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(337, 1, '1468432414', -15.4031096, -42.3150550, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(338, 1, '1468432415', -15.4058070, -42.3125344, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(339, 1, '1468432416', -15.3948838, -42.3055618, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(340, 1, '1468432417', -15.3933810, -42.3045102, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(341, 1, '1468432434', -15.4017040, -42.3145888, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(342, 1, '1468432435', -15.4041209, -42.3120346, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(343, 1, '1468432436', -15.4036926, -42.3102246, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(344, 1, '1468432437', -15.3945609, -42.3068232, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(345, 1, '1468447378', -15.4335398, -42.3098588, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(346, 1, '1468447575', -15.4346160, -42.3099660, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(347, 1, '1468447614', -15.4321389, -42.3097838, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(348, 1, '1468447659', -15.4328078, -42.3098218, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(349, 1, '1468447740', -15.4321349, -42.3102029, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(350, 1, '1468447789', -15.4301872, -42.3089803, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Mercúrio 80W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Mercúrio | Potência: 80W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(351, 1, '1468447829', -15.4321236, -42.3107524, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(352, 1, '1468447868', -15.4342723, -42.3099333, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(353, 1, '1468447899', -15.4307216, -42.3091037, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(354, 1, '1468447944', -15.4293812, -42.3088044, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(355, 1, '1468447988', -15.4313039, -42.3092302, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Curto', 'Luminária: Aberta | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(356, 1, '1468448109', -15.4309481, -42.3091566, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(357, 1, '1468448195', -15.4297797, -42.3088923, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Mercúrio 80W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Mercúrio | Potência: 80W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(358, 1, '1468448624', -15.4336401, -42.3091871, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(359, 1, '1468448710', -15.4321849, -42.3091034, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(360, 1, '1468448731', -15.4325465, -42.3091360, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(361, 1, '1468448795', -15.4330890, -42.3091849, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(362, 1, '1468448812', -15.4317978, -42.3092109, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(363, 1, '1468449133', -15.4316445, -42.3092408, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(364, 1, '1468483658', -15.4342670, -42.3109856, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(365, 1, '1468483787', -15.4342670, -42.3109856, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Curto', 'Luminária: Aberta | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(366, 1, '1468483888', -15.4343151, -42.3104820, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(367, 1, '1468483894', -15.4333925, -42.3103729, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(368, 1, '1468483900', -15.4327201, -42.3107819, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Mercúrio 80W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Mercúrio | Potência: 80W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(369, 1, '1468483906', -15.4338926, -42.3113908, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(370, 1, '1468483932', -15.4339505, -42.3109524, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(371, 1, '1468483937', -15.4326956, -42.3110058, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Mercúrio 80W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Mercúrio | Potência: 80W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(372, 1, '1468483943', -15.4329701, -42.3112909, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(373, 1, '1468483965', -15.4342821, -42.3107433, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(374, 1, '1468483971', -15.4327594, -42.3103066, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Mercúrio 80W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Mercúrio | Potência: 80W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(375, 1, '1468484011', -15.4343151, -42.3104820, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Curto', 'Luminária: Aberta | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(376, 1, '1468484017', -15.4330669, -42.3103399, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Mercúrio 80W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Mercúrio | Potência: 80W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(377, 1, '1468484023', -15.4327201, -42.3107819, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Curto', 'Luminária: Aberta | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(378, 1, '1468484045', -15.4327594, -42.3103066, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Curto', 'Luminária: Aberta | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(379, 1, '1468484050', -15.4330458, -42.3108337, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(380, 1, '1468484138', -15.4339985, -42.3104396, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Mercúrio 80W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Mercúrio | Potência: 80W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(381, 1, '1468484144', -15.4336910, -42.3104157, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Mercúrio 80W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Mercúrio | Potência: 80W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(382, 1, '1468484150', -15.4326622, -42.3112297, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Curto', 'Luminária: Aberta | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(383, 1, '1468484156', -15.4335852, -42.3113668, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Mercúrio 80W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Mercúrio | Potência: 80W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(384, 1, '1468484257', -15.4333716, -42.3108853, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(385, 1, '1468484400', -15.4326622, -42.3112297, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Curto', 'Luminária: Aberta | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(386, 1, '1468484406', -15.4332776, -42.3113242, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(387, 1, '1468696160', -15.4346226, -42.3105153, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(388, 1, '1468696190', -15.4007092, -42.3137358, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(389, 1, '1468696193', -15.3996794, -42.3144752, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(390, 1, '1468696286', -15.4008238, -42.3142463, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(391, 1, '1468696293', -15.3999392, -42.3142950, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(392, 1, '1468696314', -15.4001275, -42.3134359, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(393, 1, '1468696369', -15.4342369, -42.3114794, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(394, 1, '1468696393', -15.4342248, -42.3119732, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(395, 1, '1468696396', -15.4345930, -42.3110558, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(396, 1, '1468696472', -15.4004945, -42.3139060, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(397, 1, '1468696497', -15.4055925, -42.3089991, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(398, 1, '1468696510', -15.4012723, -42.3147340, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(399, 1, '1468696518', -15.4002079, -42.3141052, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(400, 1, '1468696522', -15.4009641, -42.3131552, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(401, 1, '1468696523', -15.4006644, -42.3130195, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(402, 1, '1468696524', -15.4003919, -42.3128925, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(403, 1, '1468696525', -15.4013760, -42.3128520, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(404, 1, '1468696526', -15.4010943, -42.3127160, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(405, 1, '1468696527', -15.4008127, -42.3125799, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(406, 1, '1468696530', -15.3988660, -42.3121860, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08');
INSERT INTO `poles` (`id`, `city_hall_id`, `pole_code`, `latitude`, `longitude`, `status`, `active`, `deleted_at`, `neighborhood`, `address`, `observations`, `created_at`, `updated_at`) VALUES
(407, 1, '1468696532', -15.3990249, -42.3118860, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(408, 1, '1468696534', -15.3991838, -42.3115860, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(409, 1, '1468696535', -15.3994471, -42.3116944, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(410, 1, '1468696536', -15.3996924, -42.3118122, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(412, 1, '1468696538', -15.4054197, -42.3101338, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(413, 1, '1468696544', -15.4051030, -42.3088471, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(414, 1, '1468696557', -15.4010436, -42.3145042, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(415, 1, '1468696585', -15.4052773, -42.3098132, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(416, 1, '1468696611', -15.4342519, -42.3112279, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(417, 1, '1468696614', -15.4054994, -42.3080227, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(418, 1, '1468696642', -15.4027862, -42.3122100, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(419, 1, '1468696646', -15.4048520, -42.3119880, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(420, 1, '1468696662', -15.4016814, -42.3099092, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(421, 1, '1468696676', -15.4004182, -42.3135719, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(422, 1, '1468696697', -15.4052968, -42.3091891, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(423, 1, '1468696712', -15.4029156, -42.3124505, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(424, 1, '1468696714', -15.4054445, -42.3087030, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(425, 1, '1468696721', -15.4021814, -42.3129813, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(426, 1, '1468696735', -15.4045644, -42.3113679, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(427, 1, '1468696738', -15.4036193, -42.3116314, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(428, 1, '1468696743', -15.4020683, -42.3088583, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(429, 1, '1468696744', -15.4018437, -42.3089635, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(430, 1, '1468696745', -15.4016014, -42.3090877, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(431, 1, '1468696746', -15.4013590, -42.3092118, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(432, 1, '1468696747', -15.4015166, -42.3095449, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(433, 1, '1468696772', -15.4023471, -42.3132399, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(434, 1, '1468696773', -15.4023471, -42.3132399, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(435, 1, '1468696778', -15.4030545, -42.3127373, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(436, 1, '1468696782', -15.4049820, -42.3122842, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(437, 1, '1468696795', -15.4015458, -42.3104663, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(438, 1, '1468696802', -15.4051567, -42.3095540, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(439, 1, '1468696817', -15.4030545, -42.3127373, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(440, 1, '1468696821', -15.4027862, -42.3122100, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(441, 1, '1468696825', -15.4047128, -42.3116826, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(442, 1, '1468696832', -15.4044346, -42.3110903, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(443, 1, '1468696843', -15.4048875, -42.3089522, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(444, 1, '1468696864', -15.4047128, -42.3116826, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(445, 1, '1468696867', -15.4038790, -42.3114512, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(446, 1, '1468696877', -15.4018506, -42.3102762, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(447, 1, '1468696887', -15.4006502, -42.3140810, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(448, 1, '1468696910', -15.4050545, -42.3093225, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(449, 1, '1468696924', -15.4020340, -42.3127411, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 70W - Braço Curto', 'Luminária: Aberta | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 70W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(450, 1, '1468696936', -15.4023116, -42.3125514, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(451, 1, '1468696947', -15.4024364, -42.3086766, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(452, 1, '1468696969', -15.4019505, -42.3104845, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(453, 1, '1468697010', -15.4025802, -42.3123430, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(454, 1, '1468697014', -15.4044079, -42.3118633, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(455, 1, '1468697017', -15.4033414, -42.3118119, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(456, 1, '1468697021', -15.4044346, -42.3110903, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(457, 1, '1468697135', -15.4027053, -42.3129838, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(458, 1, '1468697147', -15.4030638, -42.3120110, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(459, 1, '1468697150', -15.4041658, -42.3112613, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Aberta | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(460, 1, '1468697161', -15.4012949, -42.3106278, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(461, 1, '1468772837', -15.4346940, -42.3096950, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(462, 1, '1468772838', -15.4036832, -42.3146752, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(463, 1, '1468772869', -15.4343232, -42.3096532, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(464, 1, '1468772953', -15.4350556, -42.3097276, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(465, 1, '1468772954', -15.4343199, -42.3101282, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(466, 1, '1468772955', -15.4032312, -42.3146437, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(467, 1, '1468773040', -15.4343232, -42.3096532, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(468, 1, '1468773041', -15.4033875, -42.3148744, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(469, 1, '1468856888', -15.3981612, -42.3184672, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(470, 1, '1468856889', -15.3986370, -42.3182344, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(471, 1, '1468856890', -15.3985962, -42.3176446, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(472, 1, '1468856891', -15.3987992, -42.3172410, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(473, 1, '1468856954', -15.3982463, -42.3183021, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(474, 1, '1468856956', -15.3988539, -42.3178161, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(475, 1, '1468856957', -15.3990279, -42.3173883, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(476, 1, '1468857004', -15.3981612, -42.3184672, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(477, 1, '1468857005', -15.3983779, -42.3180755, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(478, 1, '1468857006', -15.3985962, -42.3176446, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(479, 1, '1468857007', -15.3987992, -42.3172410, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(480, 1, '1468857053', -15.3984640, -42.3186571, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(481, 1, '1468878733', -15.3983779, -42.3180755, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Curto', 'Luminária: Policarbonato | Braço: Braço Curto | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(482, 1, '1468878735', -15.3986726, -42.3174662, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08'),
(483, 1, '1588257425', -15.4050544, -42.3078142, 'FUNCIONANDO', 1, NULL, '', 'Vapor de Sódio 100W - Braço Médio', 'Luminária: Fechada | Braço: Braço Médio | Tipo: Vapor de Sódio | Potência: 100W | Qtd: 1', '2026-06-03 22:36:08', '2026-06-03 22:36:08');

-- --------------------------------------------------------

--
-- Estrutura para tabela `pole_history`
--

CREATE TABLE `pole_history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `pole_id` bigint(20) UNSIGNED NOT NULL,
  `previous_status` enum('FUNCIONANDO','QUEIMADO') DEFAULT NULL,
  `new_status` enum('FUNCIONANDO','QUEIMADO') NOT NULL,
  `changed_by_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `observations` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `subscription_plans`
--

CREATE TABLE `subscription_plans` (
  `id` varchar(30) NOT NULL,
  `label` varchar(80) NOT NULL,
  `default_pole_limit` int(10) UNSIGNED NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Despejando dados para a tabela `subscription_plans`
--

INSERT INTO `subscription_plans` (`id`, `label`, `default_pole_limit`, `description`, `created_at`, `updated_at`) VALUES
('ENTERPRISE', 'Escala', 10000, 'Para cidades maiores e operacoes regionais.', '2026-06-03 21:06:45', '2026-06-03 21:06:45'),
('PRO', 'Pro', 2000, 'Para operacao municipal completa.', '2026-06-03 21:06:45', '2026-06-03 21:06:45'),
('STARTER', 'Essencial', 500, 'Para municipios pequenos iniciando o cadastro.', '2026-06-03 21:06:45', '2026-06-03 21:06:45');

-- --------------------------------------------------------

--
-- Estrutura para tabela `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `city_hall_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(140) NOT NULL,
  `email` varchar(180) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('ADMIN','CITY_HALL_ADMIN','SECRETARY','TECHNICAL','FIELD_LIGHTING','FIELD_TREE','FIELD_PAVING','FIELD_SANITATION','FIELD_CLEANING','FIELD_SIGNALING','CUSTOM','CITIZEN') NOT NULL,
  `cpf` varchar(14) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Despejando dados para a tabela `users`
--

INSERT INTO `users` (`id`, `city_hall_id`, `name`, `email`, `password_hash`, `role`, `cpf`, `active`, `created_at`, `updated_at`) VALUES
(1, NULL, 'Administrador Geral', 'admin@sistema.gov.br', '$2y$12$UTg0FQkbvK2171icaPeneu3n2C.ria36553R4VjhFRRgAo2zB4rKC', 'ADMIN', NULL, 1, '2026-06-03 21:06:55', '2026-06-03 21:39:52'),
(2, 1, 'Gestor Municipal', 'prefeitura@cidade.gov.br', '$2y$10$Lx8nOKlg/D.BKXeu8lS3d.VyZl.RvG429TDXov/Mu33Mh8aWxFjjG', 'CITY_HALL_ADMIN', NULL, 1, '2026-06-03 21:06:55', '2026-06-03 21:06:55'),
(3, 1, 'Maria Santos', 'secretario@cidade.gov.br', '$2y$10$Lx8nOKlg/D.BKXeu8lS3d.VyZl.RvG429TDXov/Mu33Mh8aWxFjjG', 'SECRETARY', NULL, 1, '2026-06-03 21:06:55', '2026-06-03 21:06:55'),
(4, 1, 'Carlos Oliveira', 'tecnico@cidade.gov.br', '$2y$10$Lx8nOKlg/D.BKXeu8lS3d.VyZl.RvG429TDXov/Mu33Mh8aWxFjjG', 'TECHNICAL', NULL, 1, '2026-06-03 21:06:55', '2026-06-03 21:06:55'),
(5, 1, 'Equipe Iluminacao', 'iluminacao@cidade.gov.br', '$2y$10$Lx8nOKlg/D.BKXeu8lS3d.VyZl.RvG429TDXov/Mu33Mh8aWxFjjG', 'FIELD_LIGHTING', NULL, 1, '2026-06-03 21:06:55', '2026-06-03 21:06:55');

-- --------------------------------------------------------

--
-- Estrutura para tabela `user_permissions`
--

CREATE TABLE `user_permissions` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `can_approve_complaints` tinyint(1) NOT NULL DEFAULT 0,
  `can_manage_maintenance` tinyint(1) NOT NULL DEFAULT 0,
  `can_manage_users` tinyint(1) NOT NULL DEFAULT 0,
  `can_manage_city_halls` tinyint(1) NOT NULL DEFAULT 0,
  `can_view_reports` tinyint(1) NOT NULL DEFAULT 0,
  `field_only` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Despejando dados para a tabela `user_permissions`
--

INSERT INTO `user_permissions` (`user_id`, `can_approve_complaints`, `can_manage_maintenance`, `can_manage_users`, `can_manage_city_halls`, `can_view_reports`, `field_only`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 1, 1, 0, '2026-06-03 21:06:55', '2026-06-03 21:06:55'),
(2, 1, 1, 1, 0, 1, 0, '2026-06-03 21:06:55', '2026-06-03 21:06:55'),
(3, 1, 0, 0, 0, 0, 0, '2026-06-03 21:06:55', '2026-06-03 21:06:55'),
(4, 0, 1, 0, 0, 0, 1, '2026-06-03 21:06:55', '2026-06-03 21:06:55'),
(5, 0, 1, 0, 0, 0, 1, '2026-06-03 21:06:55', '2026-06-03 21:06:55');

-- --------------------------------------------------------

--
-- Estrutura para tabela `user_permission_modules`
--

CREATE TABLE `user_permission_modules` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `module_id` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Despejando dados para a tabela `user_permission_modules`
--

INSERT INTO `user_permission_modules` (`user_id`, `module_id`) VALUES
(1, 'ARBORIZACAO'),
(1, 'ILUMINACAO'),
(1, 'LIMPEZA'),
(1, 'PAVIMENTACAO'),
(1, 'SANEAMENTO'),
(1, 'SINALIZACAO'),
(2, 'ARBORIZACAO'),
(2, 'ILUMINACAO'),
(2, 'LIMPEZA'),
(2, 'PAVIMENTACAO'),
(2, 'SANEAMENTO'),
(2, 'SINALIZACAO'),
(3, 'ARBORIZACAO'),
(3, 'ILUMINACAO'),
(3, 'LIMPEZA'),
(3, 'PAVIMENTACAO'),
(3, 'SANEAMENTO'),
(3, 'SINALIZACAO'),
(4, 'ARBORIZACAO'),
(4, 'ILUMINACAO'),
(4, 'LIMPEZA'),
(4, 'PAVIMENTACAO'),
(4, 'SANEAMENTO'),
(4, 'SINALIZACAO'),
(5, 'ILUMINACAO');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `banned_cpfs`
--
ALTER TABLE `banned_cpfs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_banned_cpfs_city_cpf` (`city_hall_id`,`cpf`),
  ADD KEY `fk_banned_cpfs_user` (`banned_by_user_id`);

--
-- Índices de tabela `city_halls`
--
ALTER TABLE `city_halls`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_city_halls_cnpj` (`cnpj`),
  ADD KEY `idx_city_halls_status` (`status`),
  ADD KEY `fk_city_halls_plan` (`plan_id`);

--
-- Índices de tabela `city_hall_modules`
--
ALTER TABLE `city_hall_modules`
  ADD PRIMARY KEY (`city_hall_id`,`module_id`),
  ADD KEY `fk_city_hall_modules_module` (`module_id`);

--
-- Índices de tabela `complaints`
--
ALTER TABLE `complaints`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_complaints_city_status` (`city_hall_id`,`status`),
  ADD KEY `idx_complaints_module_status` (`module_id`,`status`),
  ADD KEY `idx_complaints_cpf` (`citizen_cpf`),
  ADD KEY `fk_complaints_pole` (`pole_id`);

--
-- Índices de tabela `maintenance_orders`
--
ALTER TABLE `maintenance_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_maintenance_complaint` (`complaint_id`),
  ADD KEY `idx_maintenance_city_status` (`city_hall_id`,`status`),
  ADD KEY `idx_maintenance_assigned_user` (`assigned_user_id`,`status`),
  ADD KEY `fk_maintenance_module` (`module_id`),
  ADD KEY `fk_maintenance_pole` (`pole_id`);

--
-- Índices de tabela `modules`
--
ALTER TABLE `modules`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `poles`
--
ALTER TABLE `poles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_poles_city_code` (`city_hall_id`,`pole_code`),
  ADD KEY `idx_poles_city_status` (`city_hall_id`,`status`),
  ADD KEY `idx_poles_city_active_status` (`city_hall_id`,`active`,`status`);

--
-- Índices de tabela `pole_history`
--
ALTER TABLE `pole_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pole_history_pole` (`pole_id`,`created_at`),
  ADD KEY `fk_pole_history_user` (`changed_by_user_id`);

--
-- Índices de tabela `subscription_plans`
--
ALTER TABLE `subscription_plans`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_users_email` (`email`),
  ADD KEY `idx_users_city_hall` (`city_hall_id`),
  ADD KEY `idx_users_role` (`role`);

--
-- Índices de tabela `user_permissions`
--
ALTER TABLE `user_permissions`
  ADD PRIMARY KEY (`user_id`);

--
-- Índices de tabela `user_permission_modules`
--
ALTER TABLE `user_permission_modules`
  ADD PRIMARY KEY (`user_id`,`module_id`),
  ADD KEY `fk_user_permission_modules_module` (`module_id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `banned_cpfs`
--
ALTER TABLE `banned_cpfs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `city_halls`
--
ALTER TABLE `city_halls`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `complaints`
--
ALTER TABLE `complaints`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de tabela `maintenance_orders`
--
ALTER TABLE `maintenance_orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de tabela `poles`
--
ALTER TABLE `poles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=484;

--
-- AUTO_INCREMENT de tabela `pole_history`
--
ALTER TABLE `pole_history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

-- --------------------------------------------------------

--
-- Estrutura para view `city_hall_usage`
--
DROP TABLE IF EXISTS `city_hall_usage`;

CREATE ALGORITHM=UNDEFINED DEFINER=`radgovilumini`@`%` SQL SECURITY DEFINER VIEW `city_hall_usage`  AS SELECT `ch`.`id` AS `id`, `ch`.`name` AS `name`, `ch`.`city` AS `city`, `ch`.`state` AS `state`, `ch`.`plan_id` AS `plan_id`, `sp`.`label` AS `plan_label`, `ch`.`pole_limit` AS `pole_limit`, count(`p`.`id`) AS `poles_count`, greatest(`ch`.`pole_limit` - count(`p`.`id`),0) AS `remaining_pole_slots` FROM ((`city_halls` `ch` join `subscription_plans` `sp` on(`sp`.`id` = `ch`.`plan_id`)) left join `poles` `p` on(`p`.`city_hall_id` = `ch`.`id` and `p`.`active` = 1 and `p`.`deleted_at` is null)) GROUP BY `ch`.`id`, `ch`.`name`, `ch`.`city`, `ch`.`state`, `ch`.`plan_id`, `sp`.`label`, `ch`.`pole_limit` ;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `banned_cpfs`
--
ALTER TABLE `banned_cpfs`
  ADD CONSTRAINT `fk_banned_cpfs_city_hall` FOREIGN KEY (`city_hall_id`) REFERENCES `city_halls` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_banned_cpfs_user` FOREIGN KEY (`banned_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `city_halls`
--
ALTER TABLE `city_halls`
  ADD CONSTRAINT `fk_city_halls_plan` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`);

--
-- Restrições para tabelas `city_hall_modules`
--
ALTER TABLE `city_hall_modules`
  ADD CONSTRAINT `fk_city_hall_modules_city_hall` FOREIGN KEY (`city_hall_id`) REFERENCES `city_halls` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_city_hall_modules_module` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`);

--
-- Restrições para tabelas `complaints`
--
ALTER TABLE `complaints`
  ADD CONSTRAINT `fk_complaints_city_hall` FOREIGN KEY (`city_hall_id`) REFERENCES `city_halls` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_complaints_module` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`),
  ADD CONSTRAINT `fk_complaints_pole` FOREIGN KEY (`pole_id`) REFERENCES `poles` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `maintenance_orders`
--
ALTER TABLE `maintenance_orders`
  ADD CONSTRAINT `fk_maintenance_assigned_user` FOREIGN KEY (`assigned_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_maintenance_city_hall` FOREIGN KEY (`city_hall_id`) REFERENCES `city_halls` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_maintenance_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_maintenance_module` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`),
  ADD CONSTRAINT `fk_maintenance_pole` FOREIGN KEY (`pole_id`) REFERENCES `poles` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `poles`
--
ALTER TABLE `poles`
  ADD CONSTRAINT `fk_poles_city_hall` FOREIGN KEY (`city_hall_id`) REFERENCES `city_halls` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `pole_history`
--
ALTER TABLE `pole_history`
  ADD CONSTRAINT `fk_pole_history_pole` FOREIGN KEY (`pole_id`) REFERENCES `poles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_pole_history_user` FOREIGN KEY (`changed_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_city_hall` FOREIGN KEY (`city_hall_id`) REFERENCES `city_halls` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `user_permissions`
--
ALTER TABLE `user_permissions`
  ADD CONSTRAINT `fk_user_permissions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `user_permission_modules`
--
ALTER TABLE `user_permission_modules`
  ADD CONSTRAINT `fk_user_permission_modules_module` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`),
  ADD CONSTRAINT `fk_user_permission_modules_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
