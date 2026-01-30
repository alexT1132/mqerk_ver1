-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 12-01-2026 a las 19:41:54
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `mqerkacademy`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `actividades`
--

CREATE TABLE `actividades` (
  `id` int(11) NOT NULL,
  `titulo` varchar(180) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `tipo` enum('actividad','quiz') NOT NULL DEFAULT 'actividad',
  `id_area` int(11) DEFAULT NULL,
  `materia` varchar(120) DEFAULT NULL,
  `puntos_max` int(11) NOT NULL DEFAULT 100,
  `peso_calificacion` decimal(5,2) NOT NULL DEFAULT 0.00,
  `fecha_limite` datetime DEFAULT NULL,
  `grupos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`grupos`)),
  `recursos_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`recursos_json`)),
  `imagen_portada` varchar(255) DEFAULT NULL,
  `visible_desde` datetime DEFAULT NULL,
  `visible_hasta` datetime DEFAULT NULL,
  `max_intentos` int(11) DEFAULT NULL,
  `time_limit_min` int(11) DEFAULT NULL,
  `passing_score` int(11) DEFAULT NULL,
  `shuffle_questions` tinyint(1) NOT NULL DEFAULT 0,
  `requiere_revision` tinyint(1) NOT NULL DEFAULT 1,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `publicado` tinyint(1) NOT NULL DEFAULT 1,
  `creado_por` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `actividades`
--

INSERT INTO `actividades` (`id`, `titulo`, `descripcion`, `tipo`, `id_area`, `materia`, `puntos_max`, `peso_calificacion`, `fecha_limite`, `grupos`, `recursos_json`, `imagen_portada`, `visible_desde`, `visible_hasta`, `max_intentos`, `time_limit_min`, `passing_score`, `shuffle_questions`, `requiere_revision`, `activo`, `publicado`, `creado_por`, `created_at`, `updated_at`) VALUES
(2, 'probando a ver si tod funciona bien', NULL, 'actividad', 1, NULL, 100, 0.00, '2025-11-24 00:00:00', '[\"V1\"]', '[{\"archivo\":\"/public/1763747830901-kit-de-rotulas-delanteras-super-infer-pa-27p50o.pdf\",\"nombre\":\"Kit De Rotulas Delanteras Super Infer Para Np300 2015.pdf\",\"mime\":\"application/pdf\",\"tamano\":268769}]', NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 1, NULL, '2025-11-21 17:57:10', '2025-11-21 18:34:20'),
(3, 'probando', NULL, 'actividad', 1, NULL, 100, 0.00, '2025-11-22 00:00:00', '[\"V1\"]', '[{\"archivo\":\"/public/1763751206027-kit-de-rotulas-delanteras-super-infer-pa-se6rg6.pdf\",\"nombre\":\"Kit De Rotulas Delanteras Super Infer Para Np300 2015.pdf\",\"mime\":\"application/pdf\",\"tamano\":268769}]', NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 1, NULL, '2025-11-21 18:53:26', '2025-11-21 19:05:12'),
(4, 'sdzsdzsd', NULL, 'actividad', 1, NULL, 100, 0.00, '2025-11-21 00:00:00', '[\"V1\"]', '[{\"archivo\":\"/public/1763752370683-kit-de-rotulas-delanteras-super-infer-pa-l3p44t.pdf\",\"nombre\":\"Kit De Rotulas Delanteras Super Infer Para Np300 2015.pdf\",\"mime\":\"application/pdf\",\"tamano\":268769}]', NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 1, NULL, '2025-11-21 19:12:50', '2025-11-21 19:21:45'),
(5, 'adasdasdasd', NULL, 'actividad', 1, NULL, 100, 0.00, '2025-11-21 00:00:00', '[\"V1\"]', '[{\"archivo\":\"/public/1763753232079-kit-de-rotulas-delanteras-super-infer-pa-yst9aa.pdf\",\"nombre\":\"Kit De Rotulas Delanteras Super Infer Para Np300 2015.pdf\",\"mime\":\"application/pdf\",\"tamano\":268769}]', NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 1, NULL, '2025-11-21 19:27:12', '2025-11-21 19:35:33'),
(6, 'cvxxc', NULL, 'actividad', 1, NULL, 100, 0.00, '2025-11-21 00:00:00', '[\"V1\"]', '[{\"archivo\":\"/public/1763753786360-kit-de-rotulas-delanteras-super-infer-pa-ltswpv.pdf\",\"nombre\":\"Kit De Rotulas Delanteras Super Infer Para Np300 2015.pdf\",\"mime\":\"application/pdf\",\"tamano\":268769}]', NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 1, NULL, '2025-11-21 19:36:26', '2025-11-21 19:41:40'),
(7, 'xasdasdsasad', NULL, 'actividad', 1, NULL, 100, 0.00, '2025-11-21 00:00:00', '[\"V1\"]', '[{\"archivo\":\"/public/1763756732300-kit-de-rotulas-delanteras-super-infer-pa-se99iz.pdf\",\"nombre\":\"Kit De Rotulas Delanteras Super Infer Para Np300 2015.pdf\",\"mime\":\"application/pdf\",\"tamano\":268769}]', NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 1, 1, NULL, '2025-11-21 20:25:32', '2025-11-21 20:25:32'),
(8, 'sljdlksjzadklasjd', NULL, 'actividad', 2, NULL, 100, 0.00, '2025-11-28 00:00:00', '[\"V1\"]', '[{\"archivo\":\"/public/1764190917363-comprobante-pago-mq-20250811-0001-3-ap883e.pdf\",\"nombre\":\"comprobante-pago-MQ-20250811-0001 (3).pdf\",\"mime\":\"application/pdf\",\"tamano\":575380}]', NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 1, NULL, '2025-11-26 21:01:57', '2025-12-16 16:04:27');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `actividades_entregas`
--

CREATE TABLE `actividades_entregas` (
  `id` int(11) NOT NULL,
  `id_actividad` int(11) NOT NULL,
  `id_estudiante` int(11) NOT NULL,
  `archivo` varchar(255) NOT NULL,
  `original_nombre` varchar(255) DEFAULT NULL,
  `mime_type` varchar(120) DEFAULT NULL,
  `tamano` int(11) DEFAULT NULL,
  `calificacion` int(11) DEFAULT NULL,
  `comentarios` text DEFAULT NULL,
  `estado` enum('entregada','revisada') NOT NULL DEFAULT 'entregada',
  `version` int(11) NOT NULL DEFAULT 1,
  `replaced_by` int(11) DEFAULT NULL,
  `entregada_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `revisada_at` datetime DEFAULT NULL,
  `comentarios_updated_at` datetime DEFAULT NULL,
  `permite_editar_despues_calificada` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `actividades_entregas`
--

INSERT INTO `actividades_entregas` (`id`, `id_actividad`, `id_estudiante`, `archivo`, `original_nombre`, `mime_type`, `tamano`, `calificacion`, `comentarios`, `estado`, `version`, `replaced_by`, `entregada_at`, `created_at`, `updated_at`, `revisada_at`, `comentarios_updated_at`, `permite_editar_despues_calificada`) VALUES
(1, 7, 67, '/public/1763758059592-kit-de-rotulas-delanteras-super-infer-pa-h3zfcq.pdf', 'Kit De Rotulas Delanteras Super Infer Para Np300 2015.pdf', 'application/pdf', 268769, 100, NULL, 'revisada', 1, NULL, '2025-11-21 20:47:39', '2025-11-21 20:47:39', '2025-11-21 21:34:47', '2025-11-21 15:34:47', '2025-11-21 14:49:07', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `actividades_entregas_archivos`
--

CREATE TABLE `actividades_entregas_archivos` (
  `id` int(11) NOT NULL,
  `entrega_id` int(11) NOT NULL,
  `archivo` varchar(255) NOT NULL,
  `original_nombre` varchar(255) DEFAULT NULL,
  `mime_type` varchar(120) DEFAULT NULL,
  `tamano` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `actividades_entregas_archivos`
--

INSERT INTO `actividades_entregas_archivos` (`id`, `entrega_id`, `archivo`, `original_nombre`, `mime_type`, `tamano`, `created_at`) VALUES
(1, 1, '/public/1763758059592-kit-de-rotulas-delanteras-super-infer-pa-h3zfcq.pdf', 'Kit De Rotulas Delanteras Super Infer Para Np300 2015.pdf', 'application/pdf', 268769, '2025-11-21 20:47:39');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `actividades_fecha_extensiones`
--

CREATE TABLE `actividades_fecha_extensiones` (
  `id` int(11) NOT NULL,
  `id_actividad` int(11) NOT NULL,
  `tipo` enum('grupo','estudiante') NOT NULL,
  `grupo` varchar(50) DEFAULT NULL,
  `id_estudiante` int(11) DEFAULT NULL,
  `nueva_fecha_limite` datetime NOT NULL,
  `creado_por` int(11) DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `actividades_fecha_extensiones`
--

INSERT INTO `actividades_fecha_extensiones` (`id`, `id_actividad`, `tipo`, `grupo`, `id_estudiante`, `nueva_fecha_limite`, `creado_por`, `notas`, `created_at`, `updated_at`) VALUES
(1, 7, 'estudiante', NULL, 67, '2025-11-22 15:15:00', 21, NULL, '2025-11-21 21:15:44', '2025-11-21 21:15:44');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `admin_asesoria_confirmaciones`
--

CREATE TABLE `admin_asesoria_confirmaciones` (
  `id` bigint(20) NOT NULL,
  `ingreso_id` int(11) NOT NULL,
  `asesor_user_id` int(11) NOT NULL,
  `asesor_nombre` varchar(255) NOT NULL,
  `estudiante_id` int(11) DEFAULT NULL,
  `alumno_nombre` varchar(255) DEFAULT NULL,
  `curso` varchar(255) NOT NULL,
  `fecha` date NOT NULL,
  `hora` time DEFAULT NULL,
  `estado` enum('pendiente','confirmada','rechazada') DEFAULT 'pendiente',
  `observaciones` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `admin_asesoria_confirmaciones`
--

INSERT INTO `admin_asesoria_confirmaciones` (`id`, `ingreso_id`, `asesor_user_id`, `asesor_nombre`, `estudiante_id`, `alumno_nombre`, `curso`, `fecha`, `hora`, `estado`, `observaciones`, `created_at`, `updated_at`) VALUES
(1, 31, 21, 'Jair Iván Martínez Palacios', NULL, 'alumno de prueba', 'asesoria de prueba', '2025-12-11', '12:35:00', 'confirmada', '---', '2025-12-10 18:06:45', '2025-12-10 18:24:21');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `admin_config`
--

CREATE TABLE `admin_config` (
  `id` int(11) NOT NULL DEFAULT 1,
  `sesion_maxima` int(11) DEFAULT 480,
  `intentos_login` int(11) DEFAULT 3,
  `cambio_password_obligatorio` int(11) DEFAULT 90,
  `autenticacion_dos_factor` tinyint(1) DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `nombre_institucion` varchar(255) DEFAULT NULL,
  `email_administrativo` varchar(255) DEFAULT NULL,
  `telefono_contacto` varchar(50) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `sitio_web` varchar(255) DEFAULT NULL,
  `horario_atencion` varchar(100) DEFAULT NULL,
  `gmail_email` varchar(255) DEFAULT NULL,
  `gmail_refresh_token` text DEFAULT NULL,
  `gmail_access_token` text DEFAULT NULL,
  `gmail_expiry` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `admin_config`
--

INSERT INTO `admin_config` (`id`, `sesion_maxima`, `intentos_login`, `cambio_password_obligatorio`, `autenticacion_dos_factor`, `updated_at`, `nombre_institucion`, `email_administrativo`, `telefono_contacto`, `direccion`, `sitio_web`, `horario_atencion`, `gmail_email`, `gmail_refresh_token`, `gmail_access_token`, `gmail_expiry`) VALUES
(1, 480, 6, 90, 0, '2025-09-01 17:11:43', 'MQerKAcademy', 'admin@mqerk.com', '+52 999 123 4567', 'Calle Principal #123, Mérida, Yucatán', 'https://mqerk.com', '8:00 AM - 6:00 PM', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `admin_emails`
--

CREATE TABLE `admin_emails` (
  `id` int(11) NOT NULL,
  `sender` varchar(255) DEFAULT NULL,
  `recipient` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `folder` varchar(20) NOT NULL DEFAULT 'sent',
  `etiqueta` varchar(50) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `admin_emails`
--

INSERT INTO `admin_emails` (`id`, `sender`, `recipient`, `subject`, `body`, `folder`, `etiqueta`, `is_read`, `created_at`, `deleted_at`) VALUES
(1, 'admin@mqerk.com', 'isc20350265@gmail.com', 'urgente', 'necesito su precencia', 'sent', 'general', 1, '2025-08-12 04:59:36', NULL),
(2, 'admin@mqerk.com', 'isc20350265@gmail.com', 'sdsa', 'sadsa', 'sent', 'general', 1, '2025-08-12 05:22:33', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `admin_profiles`
--

CREATE TABLE `admin_profiles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `admin_profiles`
--

INSERT INTO `admin_profiles` (`id`, `user_id`, `nombre`, `email`, `telefono`, `foto`, `created_at`, `updated_at`) VALUES
(3, 6, 'Jessica Fernandez', 'Jessica@gmail.com', '2811975587', '/public/1763763683833-f8ac42f0-lucj5j.jpg', '2025-08-11 04:00:37', '2025-11-21 22:21:23');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `admin_resources`
--

CREATE TABLE `admin_resources` (
  `id` int(11) NOT NULL,
  `admin_user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_size` bigint(20) NOT NULL,
  `file_type` varchar(100) NOT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ai_quota_config`
--

CREATE TABLE `ai_quota_config` (
  `id` int(11) NOT NULL,
  `limite_diario_global` int(11) DEFAULT 1000 COMMENT 'Máximo de llamadas diarias para toda la aplicación',
  `limite_mensual_global` int(11) DEFAULT 10000 COMMENT 'Máximo de llamadas mensuales para toda la aplicación',
  `limite_diario_estudiante` int(11) DEFAULT 30 COMMENT 'Límite diario para estudiantes',
  `limite_mensual_estudiante` int(11) DEFAULT 300 COMMENT 'Límite mensual para estudiantes',
  `limite_diario_asesor` int(11) DEFAULT 100 COMMENT 'Límite diario para asesores',
  `limite_mensual_asesor` int(11) DEFAULT 1000 COMMENT 'Límite mensual para asesores',
  `limite_diario_admin` int(11) DEFAULT 500 COMMENT 'Límite diario para administradores',
  `limite_mensual_admin` int(11) DEFAULT 5000 COMMENT 'Límite mensual para administradores',
  `cooldown_segundos` int(11) DEFAULT 45 COMMENT 'Tiempo de espera entre generaciones (segundos)',
  `cache_ttl_horas` int(11) DEFAULT 6 COMMENT 'Tiempo de vida del caché (horas)',
  `cache_habilitado` tinyint(1) DEFAULT 1,
  `notificar_admin_porcentaje` int(11) DEFAULT 80 COMMENT 'Porcentaje de uso global para notificar al admin',
  `notificar_usuario_porcentaje` int(11) DEFAULT 80 COMMENT 'Porcentaje de uso personal para notificar al usuario',
  `email_admin` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `ultima_actualizacion` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `actualizado_por` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Configuración de límites y cuotas para el uso de IA';

--
-- Volcado de datos para la tabla `ai_quota_config`
--

INSERT INTO `ai_quota_config` (`id`, `limite_diario_global`, `limite_mensual_global`, `limite_diario_estudiante`, `limite_mensual_estudiante`, `limite_diario_asesor`, `limite_mensual_asesor`, `limite_diario_admin`, `limite_mensual_admin`, `cooldown_segundos`, `cache_ttl_horas`, `cache_habilitado`, `notificar_admin_porcentaje`, `notificar_usuario_porcentaje`, `email_admin`, `activo`, `ultima_actualizacion`, `actualizado_por`) VALUES
(1, 1000, 10000, 30, 300, 100, 1000, 500, 5000, 45, 6, 1, 80, 80, NULL, 1, '2025-12-10 15:49:07', NULL),
(2, 1000, 10000, 30, 300, 100, 1000, 500, 5000, 45, 6, 1, 80, 80, NULL, 1, '2025-12-10 15:56:02', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ai_usage_log`
--

CREATE TABLE `ai_usage_log` (
  `id` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `tipo_operacion` enum('formula','quiz_analysis','simulador','general') NOT NULL,
  `modelo_usado` varchar(50) DEFAULT 'gemini-2.5-flash',
  `tokens_estimados` int(11) DEFAULT 0,
  `exito` tinyint(1) DEFAULT 1,
  `error_mensaje` text DEFAULT NULL,
  `duracion_ms` int(11) DEFAULT NULL,
  `timestamp` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro detallado de cada llamada a la API de Gemini';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ai_usage_stats`
--

CREATE TABLE `ai_usage_stats` (
  `id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `tipo_operacion` enum('formula','quiz_analysis','simulador','general') DEFAULT NULL,
  `total_llamadas` int(11) DEFAULT 0,
  `llamadas_exitosas` int(11) DEFAULT 0,
  `llamadas_fallidas` int(11) DEFAULT 0,
  `tokens_totales` int(11) DEFAULT 0,
  `duracion_promedio_ms` int(11) DEFAULT 0,
  `ultima_actualizacion` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Estadísticas agregadas por día para optimizar consultas';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `areas`
--

CREATE TABLE `areas` (
  `id` int(11) NOT NULL,
  `nombre` varchar(160) NOT NULL,
  `tipo` enum('general','especifico') NOT NULL DEFAULT 'general',
  `descripcion` varchar(255) DEFAULT NULL,
  `icon_key` varchar(40) DEFAULT NULL,
  `color_gradient` varchar(80) DEFAULT NULL,
  `bg_color` varchar(120) DEFAULT NULL,
  `border_color` varchar(60) DEFAULT NULL,
  `orden` int(11) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `areas`
--

INSERT INTO `areas` (`id`, `nombre`, `tipo`, `descripcion`, `icon_key`, `color_gradient`, `bg_color`, `border_color`, `orden`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'Español y redacción indirecta', 'general', 'Competencias comunicativas y lingüísticas', 'FileText', 'from-amber-500 to-orange-600', 'bg-gradient-to-br from-amber-50 to-orange-50', 'border-amber-200', 1, 1, '2025-08-18 22:53:56', '2025-08-18 22:53:56'),
(2, 'Matemáticas y pensamiento analítico', 'general', 'Razonamiento lógico y matemático', 'BarChart3', 'from-blue-500 to-indigo-600', 'bg-gradient-to-br from-blue-50 to-indigo-50', 'border-blue-200', 2, 1, '2025-08-18 22:53:56', '2025-08-18 22:53:56'),
(3, 'Habilidades transversales', 'general', 'Competencias interpersonales y sociales', 'Users', 'from-emerald-500 to-green-600', 'bg-gradient-to-br from-emerald-50 to-green-50', 'border-emerald-200', 3, 1, '2025-08-18 22:53:56', '2025-08-18 22:53:56'),
(4, 'Lengua extranjera', 'general', 'Comunicación en idioma extranjero', 'BookOpen', 'from-purple-500 to-violet-600', 'bg-gradient-to-br from-purple-50 to-violet-50', 'border-purple-200', 4, 1, '2025-08-18 22:53:56', '2025-08-18 22:53:56'),
(5, 'Módulos específicos', 'general', 'Conocimientos especializados', 'Award', 'from-rose-500 to-pink-600', 'bg-gradient-to-br from-rose-50 to-pink-50', 'border-rose-200', 5, 1, '2025-08-18 22:53:56', '2025-08-18 22:53:56'),
(101, 'Ciencias Exactas', 'especifico', 'Matemáticas, Física, Química y afines', 'BarChart3', 'from-blue-500 to-cyan-600', 'bg-gradient-to-br from-blue-50 to-cyan-50', 'border-blue-200', 101, 1, '2025-08-18 22:53:56', '2025-08-18 22:53:56'),
(102, 'Ciencias Sociales', 'especifico', 'Sociología, Psicología y más', 'Users', 'from-purple-500 to-indigo-600', 'bg-gradient-to-br from-purple-50 to-indigo-50', 'border-purple-200', 102, 1, '2025-08-18 22:53:56', '2025-08-18 22:53:56'),
(103, 'Humanidades y Artes', 'especifico', 'Literatura, Historia, Filosofía', 'BookOpen', 'from-rose-500 to-pink-600', 'bg-gradient-to-br from-rose-50 to-pink-50', 'border-rose-200', 103, 1, '2025-08-18 22:53:56', '2025-08-18 22:53:56'),
(104, 'Ciencias Naturales y de la Salud', 'especifico', 'Biología, Medicina, Enfermería', 'Heart', 'from-emerald-500 to-green-600', 'bg-gradient-to-br from-emerald-50 to-green-50', 'border-emerald-200', 104, 1, '2025-08-18 22:53:56', '2025-08-18 22:53:56'),
(105, 'Ingeniería y Tecnología', 'especifico', 'Ingenierías, Sistemas, Tecnología', 'Cog', 'from-orange-500 to-amber-600', 'bg-gradient-to-br from-orange-50 to-amber-50', 'border-orange-200', 105, 1, '2025-08-18 22:53:56', '2025-08-18 22:53:56'),
(106, 'Ciencias Económico-Administrativas', 'especifico', 'Administración, Economía, Negocios', 'TrendingUp', 'from-teal-500 to-cyan-600', 'bg-gradient-to-br from-teal-50 to-cyan-50', 'border-teal-200', 106, 1, '2025-08-18 22:53:56', '2025-08-18 22:53:56'),
(107, 'Educación y Deportes', 'especifico', 'Pedagogía y deportes', 'GraduationCap', 'from-violet-500 to-purple-600', 'bg-gradient-to-br from-violet-50 to-purple-50', 'border-violet-200', 107, 1, '2025-08-18 22:53:56', '2025-08-18 22:53:56'),
(108, 'Agropecuarias', 'especifico', 'Agronomía, Veterinaria, Zootecnia', 'Leaf', 'from-lime-500 to-green-600', 'bg-gradient-to-br from-lime-50 to-green-50', 'border-lime-200', 108, 1, '2025-08-18 22:53:56', '2025-08-18 22:53:56'),
(109, 'Turismo', 'especifico', 'Gestión turística y hotelería', 'Globe', 'from-blue-400 to-sky-600', 'bg-gradient-to-br from-blue-50 to-sky-50', 'border-blue-200', 109, 1, '2025-08-18 22:53:56', '2025-08-18 22:53:56'),
(110, 'Núcleo UNAM / IPN', 'especifico', 'Materias esenciales ingreso', 'GraduationCap', 'from-yellow-500 to-amber-600', 'bg-gradient-to-br from-yellow-50 to-amber-50', 'border-yellow-200', 110, 1, '2025-08-18 22:53:56', '2025-08-18 22:53:56'),
(111, 'Militar, Naval y Náutica Mercante', 'especifico', 'Preparación fuerzas e instituciones navales', 'Anchor', 'from-slate-500 to-gray-600', 'bg-gradient-to-br from-slate-50 to-gray-50', 'border-slate-200', 111, 1, '2025-08-18 22:53:56', '2025-08-18 22:53:56'),
(112, 'Módulo Transversal: Análisis Psicométrico', 'especifico', 'Exámenes psicométricos y aptitud', 'Brain', 'from-purple-400 to-indigo-500', 'bg-gradient-to-br from-purple-50 to-indigo-50', 'border-purple-200', 112, 1, '2025-08-18 22:53:56', '2025-08-18 22:53:56');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asesor_notifications`
--

CREATE TABLE `asesor_notifications` (
  `id` bigint(20) NOT NULL,
  `asesor_user_id` int(11) NOT NULL,
  `type` enum('payment','activity_submission','feedback_submission','simulation_completed','system','other') DEFAULT 'other',
  `title` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `action_url` varchar(255) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asesor_perfiles`
--

CREATE TABLE `asesor_perfiles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `preregistro_id` bigint(20) UNSIGNED NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `grupo_asesor` varchar(10) DEFAULT NULL,
  `grupos_asesor` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`grupos_asesor`)),
  `direccion` varchar(255) NOT NULL,
  `municipio` varchar(120) NOT NULL,
  `nacimiento` date NOT NULL,
  `nacionalidad` varchar(120) NOT NULL,
  `genero` varchar(40) NOT NULL,
  `rfc` varchar(30) NOT NULL,
  `nivel_estudios` varchar(60) NOT NULL,
  `institucion` varchar(255) NOT NULL,
  `titulo_academico` tinyint(1) NOT NULL DEFAULT 0,
  `anio_graduacion` smallint(6) NOT NULL,
  `titulo_archivo` varchar(255) DEFAULT NULL,
  `certificaciones_archivo` varchar(255) DEFAULT NULL,
  `experiencia_rango` varchar(40) NOT NULL,
  `areas_especializacion` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`areas_especializacion`)),
  `empresa` varchar(255) NOT NULL,
  `ultimo_puesto` varchar(255) NOT NULL,
  `funciones` text NOT NULL,
  `plataformas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`plataformas`)),
  `doc_identificacion` varchar(255) DEFAULT NULL,
  `doc_comprobante_domicilio` varchar(255) DEFAULT NULL,
  `doc_titulo_cedula` varchar(255) DEFAULT NULL,
  `doc_certificaciones` varchar(255) DEFAULT NULL,
  `doc_carta_recomendacion` varchar(255) DEFAULT NULL,
  `doc_curriculum` varchar(255) DEFAULT NULL,
  `doc_fotografia` varchar(255) DEFAULT NULL,
  `fuente_conociste` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`fuente_conociste`)),
  `motivaciones` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`motivaciones`)),
  `dispuesto_capacitacion` tinyint(1) NOT NULL DEFAULT 1,
  `consentimiento_datos` tinyint(1) NOT NULL DEFAULT 1,
  `firma_texto` varchar(255) DEFAULT NULL,
  `curp` varchar(18) DEFAULT NULL,
  `entidad_curp` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `asesor_perfiles`
--

INSERT INTO `asesor_perfiles` (`id`, `preregistro_id`, `usuario_id`, `grupo_asesor`, `grupos_asesor`, `direccion`, `municipio`, `nacimiento`, `nacionalidad`, `genero`, `rfc`, `nivel_estudios`, `institucion`, `titulo_academico`, `anio_graduacion`, `titulo_archivo`, `certificaciones_archivo`, `experiencia_rango`, `areas_especializacion`, `empresa`, `ultimo_puesto`, `funciones`, `plataformas`, `doc_identificacion`, `doc_comprobante_domicilio`, `doc_titulo_cedula`, `doc_certificaciones`, `doc_carta_recomendacion`, `doc_curriculum`, `doc_fotografia`, `fuente_conociste`, `motivaciones`, `dispuesto_capacitacion`, `consentimiento_datos`, `firma_texto`, `curp`, `entidad_curp`, `created_at`, `updated_at`) VALUES
(2, 4, 21, 'V1', '[\"V1\",\"M1\"]', '', '', '1899-11-30', '', '', '', '', '', 0, 0, NULL, NULL, '', NULL, '', '', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/asesores/1763674115811-foto.jpeg', NULL, NULL, 1, 1, NULL, NULL, NULL, '2025-10-06 17:29:14', '2025-12-10 01:42:47');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asesor_preregistros`
--

CREATE TABLE `asesor_preregistros` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nombres` varchar(120) NOT NULL,
  `apellidos` varchar(160) NOT NULL,
  `correo` varchar(160) NOT NULL,
  `telefono` varchar(40) NOT NULL,
  `area` varchar(120) NOT NULL,
  `estudios` varchar(120) NOT NULL,
  `status` enum('pending','testing','completed','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `asesor_preregistros`
--

INSERT INTO `asesor_preregistros` (`id`, `nombres`, `apellidos`, `correo`, `telefono`, `area`, `estudios`, `status`, `created_at`, `updated_at`) VALUES
(4, 'Jair Iván', 'Martínez Palacios', 'contacto.jairivan@gmail.com', '2871619023', 'Ingeniería', 'Licenciatura', 'completed', '2025-09-25 18:51:02', '2025-10-06 17:29:56');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asesor_reminders`
--

CREATE TABLE `asesor_reminders` (
  `id` int(11) NOT NULL,
  `asesor_user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `date` date NOT NULL,
  `time` time DEFAULT NULL,
  `category` varchar(50) NOT NULL DEFAULT 'recordatorio',
  `priority` varchar(50) NOT NULL DEFAULT 'blue',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `completed` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `asesor_reminders`
--

INSERT INTO `asesor_reminders` (`id`, `asesor_user_id`, `title`, `description`, `date`, `time`, `category`, `priority`, `created_at`, `updated_at`, `completed`) VALUES
(6, 21, 'dasdd', 'dsadsad', '2025-12-15', '01:53:00', 'recordatorio', 'orange', '2025-12-15 10:53:39', '2025-12-15 11:05:37', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asesor_resources`
--

CREATE TABLE `asesor_resources` (
  `id` int(11) NOT NULL,
  `asesor_user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `resource_type` enum('file','link') NOT NULL DEFAULT 'file',
  `file_path` varchar(500) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `link_url` varchar(1000) DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `asesor_resources`
--

INSERT INTO `asesor_resources` (`id`, `asesor_user_id`, `title`, `description`, `resource_type`, `file_path`, `file_name`, `file_size`, `file_type`, `link_url`, `tags`, `created_at`, `updated_at`) VALUES
(2, 21, 'Login general', NULL, 'file', 'D:/Escritorio/MQERK/mqerk_ver1-Miguel-el-Angel/server/uploads/recursos-educativos/1763497016874-48jt8f-Login_general.pdf', 'Login general.pdf', 2169422, 'application/pdf', NULL, '[]', '2025-11-18 14:16:56', '2025-11-18 14:16:56'),
(3, 21, 'Kit De Rotulas Delanteras Super Infer Para Np300 2015', NULL, 'file', 'D:/Escritorio/MQERK/mqerk_ver1-Miguel-el-Angel/server/uploads/recursos-educativos/1763765299860-gxfe4h-Kit_De_Rotulas_Delanteras_Super_Infer_Para_Np300_2015.pdf', 'Kit De Rotulas Delanteras Super Infer Para Np300 2015.pdf', 268769, 'application/pdf', NULL, '[]', '2025-11-21 16:48:19', '2025-11-21 16:48:19'),
(4, 21, 'Nirvana', 'escuchar Nirvana', 'link', NULL, NULL, NULL, NULL, 'https://www.youtube.com/watch?v=hTWKbfoikeg&list=RD1V_xRb0x9aw&index=14', '[]', '2025-12-16 15:00:19', '2025-12-18 15:28:46');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asesor_tests`
--

CREATE TABLE `asesor_tests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `preregistro_id` bigint(20) UNSIGNED NOT NULL,
  `bigfive_total` int(11) NOT NULL DEFAULT 0,
  `dass21_total` int(11) NOT NULL DEFAULT 0,
  `zavic_total` int(11) NOT NULL DEFAULT 0,
  `baron_total` int(11) NOT NULL DEFAULT 0,
  `wais_total` int(11) NOT NULL DEFAULT 0,
  `academica_total` int(11) NOT NULL DEFAULT 0,
  `matematica_total` int(11) DEFAULT NULL,
  `dass21_subescalas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dass21_subescalas`)),
  `bigfive_dimensiones` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`bigfive_dimensiones`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `asesor_tests`
--

INSERT INTO `asesor_tests` (`id`, `preregistro_id`, `bigfive_total`, `dass21_total`, `zavic_total`, `baron_total`, `wais_total`, `academica_total`, `matematica_total`, `dass21_subescalas`, `bigfive_dimensiones`, `created_at`, `updated_at`) VALUES
(2, 4, 44, 46, 88, 78, 160, 190, NULL, NULL, NULL, '2025-09-25 19:30:43', '2025-09-25 19:30:43');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asesor_tests_history`
--

CREATE TABLE `asesor_tests_history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `preregistro_id` bigint(20) UNSIGNED NOT NULL,
  `scenario_type` varchar(30) DEFAULT NULL,
  `version` int(11) NOT NULL DEFAULT 1,
  `bigfive_total` int(11) NOT NULL DEFAULT 0,
  `dass21_total` int(11) NOT NULL DEFAULT 0,
  `zavic_total` int(11) NOT NULL DEFAULT 0,
  `baron_total` int(11) NOT NULL DEFAULT 0,
  `wais_total` int(11) NOT NULL DEFAULT 0,
  `academica_total` int(11) NOT NULL DEFAULT 0,
  `matematica_total` int(11) DEFAULT NULL,
  `dass21_subescalas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dass21_subescalas`)),
  `bigfive_dimensiones` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`bigfive_dimensiones`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `matematica_respuestas` longtext DEFAULT NULL,
  `bigfive_respuestas` longtext DEFAULT NULL,
  `dass21_respuestas` longtext DEFAULT NULL,
  `zavic_respuestas` longtext DEFAULT NULL,
  `baron_respuestas` longtext DEFAULT NULL,
  `wais_respuestas` longtext DEFAULT NULL,
  `academica_respuestas` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `asesor_tests_history`
--

INSERT INTO `asesor_tests_history` (`id`, `preregistro_id`, `scenario_type`, `version`, `bigfive_total`, `dass21_total`, `zavic_total`, `baron_total`, `wais_total`, `academica_total`, `matematica_total`, `dass21_subescalas`, `bigfive_dimensiones`, `created_at`, `matematica_respuestas`, `bigfive_respuestas`, `dass21_respuestas`, `zavic_respuestas`, `baron_respuestas`, `wais_respuestas`, `academica_respuestas`) VALUES
(3, 4, 'manual', 1, 44, 46, 88, 78, 160, 190, NULL, '{\"depresion\":30,\"ansiedad\":32,\"estres\":30,\"dep_cat\":\"Extremely Severe\",\"anx_cat\":\"Extremely Severe\",\"str_cat\":\"Severe\"}', '{\"averages\":{\"E\":2.8,\"A\":2.8,\"C\":2.5,\"N\":2.5,\"O\":2.5},\"adjusted_totals\":{\"E\":14,\"A\":14,\"C\":10,\"N\":10,\"O\":10},\"categories\":{\"E\":\"Medio\",\"A\":\"Medio\",\"C\":\"Medio\",\"N\":\"Medio\",\"O\":\"Medio\"},\"meta\":[{\"idx\":1,\"dimension\":\"E\",\"reverse\":false,\"comentario\":\"Extraversión: energía social\"},{\"idx\":2,\"dimension\":\"A\",\"reverse\":true,\"comentario\":\"Amabilidad (invertido: rudeza / crítica)\"},{\"idx\":3,\"dimension\":\"C\",\"reverse\":false,\"comentario\":\"Responsabilidad: organización\"},{\"idx\":4,\"dimension\":\"N\",\"reverse\":false,\"comentario\":\"Neuroticismo: ansiedad / tensión\"},{\"idx\":5,\"dimension\":\"O\",\"reverse\":false,\"comentario\":\"Apertura: curiosidad intelectual\"},{\"idx\":6,\"dimension\":\"E\",\"reverse\":true,\"comentario\":\"Extraversión (invertido: reserva)\"},{\"idx\":7,\"dimension\":\"A\",\"reverse\":false,\"comentario\":\"Amabilidad: cooperación / empatía\"},{\"idx\":8,\"dimension\":\"C\",\"reverse\":true,\"comentario\":\"Responsabilidad (invertido: desorden)\"},{\"idx\":9,\"dimension\":\"N\",\"reverse\":true,\"comentario\":\"Neuroticismo (invertido: calma)\"},{\"idx\":10,\"dimension\":\"O\",\"reverse\":false,\"comentario\":\"Apertura: imaginación\"},{\"idx\":11,\"dimension\":\"E\",\"reverse\":false,\"comentario\":\"Extraversión: assertividad\"},{\"idx\":12,\"dimension\":\"A\",\"reverse\":false,\"comentario\":\"Amabilidad: confianza\"},{\"idx\":13,\"dimension\":\"C\",\"reverse\":false,\"comentario\":\"Responsabilidad: autodisciplina\"},{\"idx\":14,\"dimension\":\"N\",\"reverse\":false,\"comentario\":\"Neuroticismo: vulnerabilidad emocional\"},{\"idx\":15,\"dimension\":\"O\",\"reverse\":true,\"comentario\":\"Apertura (invertido: preferencia rutina)\"},{\"idx\":16,\"dimension\":\"E\",\"reverse\":false,\"comentario\":\"Extraversión: entusiasmo\"},{\"idx\":17,\"dimension\":\"A\",\"reverse\":true,\"comentario\":\"Amabilidad (invertido: competitividad dura)\"},{\"idx\":18,\"dimension\":\"C\",\"reverse\":false,\"comentario\":\"Responsabilidad: diligencia\"},{\"idx\":19,\"dimension\":\"N\",\"reverse\":false,\"comentario\":\"Neuroticismo: preocupación\"},{\"idx\":20,\"dimension\":\"O\",\"reverse\":false,\"comentario\":\"Apertura: apreciación estética\"},{\"idx\":21,\"dimension\":\"E\",\"reverse\":true,\"comentario\":\"Extraversión (invertido: retiro social)\"},{\"idx\":22,\"dimension\":\"A\",\"reverse\":false,\"comentario\":\"Amabilidad: altruismo\"}]}', '2025-09-25 19:30:43', NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asesor_test_forms`
--

CREATE TABLE `asesor_test_forms` (
  `id` int(11) NOT NULL,
  `preregistro_id` int(11) NOT NULL,
  `test_type` varchar(32) NOT NULL,
  `question_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`question_ids`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `asesor_test_forms`
--

INSERT INTO `asesor_test_forms` (`id`, `preregistro_id`, `test_type`, `question_ids`, `created_at`) VALUES
(1, 2, 'wais', '[5,1,6,4,2,3]', '2025-09-24 22:31:46'),
(2, 2, 'wais', '[6,5,4,3,2,1]', '2025-09-24 22:31:46'),
(3, 2, 'wais', '[1,2,3,6,5,4]', '2025-09-24 22:46:01'),
(4, 2, 'wais', '[4,3,5,1,2,6]', '2025-09-24 22:46:01'),
(5, 2, 'wais', '[1,2,3,4,5,6]', '2025-09-24 23:09:27'),
(6, 2, 'wais', '[1,2,3,4,5,6]', '2025-09-24 23:09:27'),
(7, 3, 'wais', '[5,3,2,4,6,1]', '2025-09-25 15:59:56'),
(8, 3, 'wais', '[3,5,2,6,1,4]', '2025-09-25 15:59:56');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asistencias`
--

CREATE TABLE `asistencias` (
  `id` int(11) NOT NULL,
  `id_estudiante` int(11) NOT NULL,
  `id_asesor` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `tipo` enum('clase','tarea','simulacion') NOT NULL DEFAULT 'clase',
  `asistio` tinyint(1) NOT NULL DEFAULT 1,
  `observaciones` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `asistencias`
--

INSERT INTO `asistencias` (`id`, `id_estudiante`, `id_asesor`, `fecha`, `tipo`, `asistio`, `observaciones`, `created_at`, `updated_at`) VALUES
(20, 67, 21, '2025-12-15', 'clase', 1, NULL, '2025-12-15 17:06:30', '2025-12-15 17:06:30'),
(21, 69, 21, '2025-12-15', 'clase', 0, NULL, '2025-12-15 17:06:30', '2025-12-15 17:06:30'),
(22, 73, 21, '2025-12-15', 'clase', 0, NULL, '2025-12-15 17:06:30', '2025-12-15 17:06:30');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `calendar_events`
--

CREATE TABLE `calendar_events` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `tipo` varchar(50) NOT NULL DEFAULT 'personal',
  `prioridad` varchar(20) NOT NULL DEFAULT 'media',
  `recordar_minutos` int(11) NOT NULL DEFAULT 15,
  `completado` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `calendar_events`
--

INSERT INTO `calendar_events` (`id`, `user_id`, `titulo`, `descripcion`, `fecha`, `hora`, `tipo`, `prioridad`, `recordar_minutos`, `completado`, `created_at`, `updated_at`) VALUES
(2, 6, 'sxsx', 'sdsd', '2025-01-30', '16:00:00', 'academico', 'alta', 15, 0, '2025-08-21 18:24:55', '2025-08-21 18:24:55'),
(75, 6, 'Gasto fijo: RENTA LOCAL', 'Proveedor: - | Frecuencia: Mensual | Método: Efectivo | Importe: $4,500.00 | Estatus: Pendiente', '2025-09-23', '15:21:00', 'finanzas', 'media', 10, 0, '2025-09-23 21:21:17', '2025-09-23 21:21:17'),
(76, 6, 'Gasto fijo: LUZ', 'Proveedor: - | Frecuencia: Mensual | Método: Efectivo | Importe: $1,500.00 | Estatus: Pendiente', '2025-09-23', '17:21:00', 'finanzas', 'media', 10, 0, '2025-09-23 21:21:36', '2025-09-23 21:21:36'),
(77, 6, 'Gasto fijo: INTERNET', 'Proveedor: - | Frecuencia: Mensual | Método: Efectivo | Importe: $750.00 | Estatus: Pendiente', '2025-09-23', '20:22:00', 'finanzas', 'media', 10, 0, '2025-09-23 21:23:36', '2025-09-23 21:23:36'),
(78, 6, 'Gasto fijo: CANVA', 'Proveedor: - | Frecuencia: Mensual | Método: Efectivo | Importe: $750.00 | Estatus: Pendiente', '2025-09-23', '18:23:00', 'finanzas', 'media', 10, 0, '2025-09-23 21:23:59', '2025-09-23 21:23:59'),
(79, 6, 'Gasto fijo: MANT CODE', 'Proveedor: - | Frecuencia: Mensual | Método: Efectivo | Importe: $500.00 | Estatus: Pendiente', '2025-09-23', '16:27:00', 'finanzas', 'media', 10, 0, '2025-09-23 21:27:56', '2025-09-23 21:27:56'),
(80, 6, 'Gasto fijo: SUELDO', 'Proveedor: - | Frecuencia: Mensual | Método: Efectivo | Importe: $10,000.00 | Estatus: Pendiente', '2025-09-23', '15:28:00', 'finanzas', 'media', 10, 0, '2025-09-23 21:28:15', '2025-09-23 21:28:15'),
(81, 6, 'Gasto fijo: INSUMOS', 'Proveedor: - | Frecuencia: Mensual | Método: Efectivo | Importe: $500.00 | Estatus: Pendiente', '2025-09-23', '17:28:00', 'finanzas', 'media', 10, 0, '2025-09-23 21:28:32', '2025-09-23 21:28:32'),
(82, 6, 'Gasto variable: PIZARRON', 'Unidades: 1 | Método: Efectivo | Importe: $2,800.00 | Estatus: Pendiente | Entidad: -', '2025-09-23', '10:00:00', 'finanzas', 'media', 10, 0, '2025-09-23 21:32:33', '2025-09-23 21:32:33'),
(83, 6, 'Gasto variable: sillas hexagonales de paleta', 'Unidades: 25 | Método: Efectivo | Importe: $27,500.00 | Estatus: Pendiente | Entidad: -', '2025-09-23', '10:00:00', 'finanzas', 'media', 10, 0, '2025-09-23 21:33:18', '2025-09-23 21:33:18'),
(84, 6, 'Gasto variable: sillas', 'Unidades: 1 | Método: Efectivo | Importe: $250.00 | Estatus: Pendiente | Entidad: - | Nota: compra de sillas', '2025-09-25', '10:00:00', 'finanzas', 'media', 10, 0, '2025-09-25 21:03:16', '2025-09-25 21:03:16'),
(86, 6, 'Gasto variable: MATERIAL DE CONSTRUCCIÓN', 'Unidades: 10 | Método: Efectivo | Importe: $20,000.00 | Estatus: Pagado | Entidad: CEMEX', '2025-09-26', '10:00:00', 'finanzas', 'media', 10, 0, '2025-09-26 18:33:03', '2025-09-26 18:33:03'),
(87, 6, 'Gasto variable: MESAS', 'Unidades: 1 | Método: Efectivo | Importe: $2,000.00 | Estatus: Pagado | Entidad: TONY', '2025-09-26', '10:00:00', 'finanzas', 'media', 10, 0, '2025-09-26 18:47:33', '2025-09-26 18:47:33'),
(88, 6, 'Gasto fijo: RENTA', 'Proveedor: CIRO | Frecuencia: Mensual | Método: Efectivo | Importe: $2,000.00 | Estatus: Pagado', '2025-09-26', '15:31:00', 'finanzas', 'media', 10, 0, '2025-09-26 20:31:21', '2025-09-26 20:31:21'),
(89, 6, 'Gasto variable: sillas', 'Unidades: 2 | Método: Efectivo | Importe: $500.00 | Estatus: Pagado | Entidad: TONY', '2025-09-26', '10:00:00', 'finanzas', 'media', 10, 0, '2025-09-26 20:36:01', '2025-09-26 20:36:01'),
(90, 6, 'Gasto variable: material', 'Unidades: 1 | Método: Efectivo | Importe: $800.00 | Estatus: Pagado | Entidad: comex', '2025-09-26', '10:00:00', 'finanzas', 'media', 10, 0, '2025-09-26 20:38:38', '2025-09-26 20:38:38'),
(91, 6, 'Gasto variable: puerta', 'Unidades: 1 | Método: Efectivo | Importe: $950.00 | Estatus: Pagado | Entidad: carpintero | Nota: reparacion de puerta', '2025-09-26', '10:00:00', 'finanzas', 'media', 10, 0, '2025-09-26 20:41:13', '2025-09-26 20:41:13'),
(92, 6, 'Inicio asesoria de prueba - alumno de prueba', 'Asesor: Jair Iván Martínez Palacios | Método: Efectivo | Importe: $450.00 | Estatus: Pagado', '2025-12-11', '12:35:00', 'trabajo', 'media', 30, 0, '2025-12-10 17:36:19', '2025-12-10 17:36:19');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `sender_role` enum('estudiante','admin','asesor','sistema') NOT NULL,
  `message` text DEFAULT NULL,
  `type` enum('text','image','file') DEFAULT 'text',
  `category` enum('general','support','academic') DEFAULT 'general',
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `chat_messages`
--

INSERT INTO `chat_messages` (`id`, `student_id`, `sender_role`, `message`, `type`, `category`, `is_read`, `created_at`) VALUES
(1, 67, 'admin', '/uploads/chat/1766602768763-94087292-reporte2miguelangel.pdf', 'file', 'support', 1, '2025-12-24 18:59:28'),
(2, 67, 'admin', '/uploads/chat/1766602808624-151098164-Capturadepantalla2025-12-19132408.png', 'image', 'support', 1, '2025-12-24 19:00:08'),
(3, 67, 'estudiante', 'gracias', 'text', 'support', 1, '2025-12-24 19:00:39'),
(4, 67, 'admin', 'por cierto', 'text', 'support', 1, '2025-12-24 19:02:24'),
(5, 67, 'admin', 'quiero que', 'text', 'support', 1, '2025-12-24 19:02:50'),
(6, 67, 'admin', 'probando', 'text', 'support', 1, '2025-12-24 19:05:09'),
(7, 67, 'admin', '...', 'text', 'support', 1, '2025-12-24 19:07:04'),
(8, 67, 'admin', 'hola', 'text', 'support', 1, '2025-12-24 19:10:10'),
(9, 67, 'estudiante', 'dime', 'text', 'support', 1, '2025-12-24 19:11:34'),
(10, 67, 'estudiante', 'hola', 'text', 'support', 1, '2025-12-24 19:12:08'),
(11, 67, 'estudiante', 'hola', 'text', 'support', 1, '2025-12-24 19:14:37'),
(12, 67, 'admin', 'hola', 'text', 'support', 1, '2025-12-24 19:25:48'),
(13, 67, 'asesor', 'hola', 'text', 'general', 1, '2025-12-24 19:51:27'),
(14, 67, 'estudiante', 'digame', 'text', 'academic', 1, '2025-12-24 19:51:38'),
(15, 67, 'estudiante', '/uploads/chat/1766608009269-565996311-reporte2miguelangel.pdf', 'file', 'academic', 1, '2025-12-24 20:26:49'),
(16, 67, 'estudiante', 'es esto', 'text', 'academic', 1, '2025-12-24 20:26:49'),
(17, 67, 'asesor', '/uploads/chat/1766608020117-637610246-Capturadepantalla2025-12-19134718.png', 'image', 'general', 1, '2025-12-24 20:27:00'),
(18, 67, 'asesor', '/uploads/chat/1766608157096-792383668-Capturadepantalla2025-12-19134718.png', 'image', 'general', 1, '2025-12-24 20:29:17'),
(19, 67, 'asesor', 'mira yo te decia alho ais', 'text', 'general', 1, '2025-12-24 20:29:17');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comprobantes`
--

CREATE TABLE `comprobantes` (
  `id` int(11) NOT NULL,
  `id_estudiante` int(11) NOT NULL,
  `comprobante` text NOT NULL,
  `importe` decimal(10,2) DEFAULT NULL,
  `metodo` varchar(50) DEFAULT NULL,
  `motivo_rechazo` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `comprobantes`
--

INSERT INTO `comprobantes` (`id`, `id_estudiante`, `comprobante`, `importe`, `metodo`, `motivo_rechazo`, `created_at`, `updated_at`) VALUES
(9, 67, '/comprobantes/1754873043799-comprobante-pago-MQ-20250729-0001.pdf', 1500.00, 'transferencia', NULL, '2025-11-25 10:00:00', '2025-11-25 12:00:00'),
(11, 69, '/comprobantes/1754941053364-518323640_2494738954216624_926389333829993898_n.jpg', 1200.00, 'efectivo', NULL, '2025-08-11 13:50:53', '2025-08-11 15:46:48'),
(12, 70, '/comprobantes/1754943978532-comprobante-pago-MQ-20250729-0001.pdf', 0.00, 'transferencia', 'no se transfirio', '2025-08-11 14:26:18', '2025-08-11 15:47:34'),
(13, 71, '/comprobantes/1755028526990-ENTRENAMIENTO PARA EL EXAMEN UNIVERSIDAD 2025.png', 10500.00, 'efectivo', NULL, '2025-08-12 13:55:27', '2025-08-12 13:57:55'),
(14, 72, '/comprobantes/1755029908064-Gemini_Generated_Image_14ox9014ox9014ox.png', 5500.00, 'transferencia', NULL, '2025-08-12 14:18:28', '2025-08-12 14:20:08'),
(15, 73, '/comprobantes/1755800393550-ChatGPT Image 10 ago 2025, 18_11_50.png', 10500.00, 'efectivo', NULL, '2025-08-21 12:19:53', '2025-08-21 12:21:16'),
(16, 74, '/comprobantes/1765328228550-Documento A4 Hoja de Papel con Flor Delicado Rosado 3.pdf', 1500.00, 'Transferencia', NULL, '2025-12-09 18:57:08', '2025-12-09 19:35:12'),
(23, 76, '/comprobantes/1766642026679-Captura de pantalla 2025-12-19 133319.png', 1500.00, 'efectivo', NULL, '2025-12-24 23:53:46', '2025-12-24 23:55:46');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contratos`
--

CREATE TABLE `contratos` (
  `id` int(11) NOT NULL,
  `id_estudiante` int(11) NOT NULL,
  `folio` int(11) NOT NULL,
  `folio_formateado` varchar(32) DEFAULT NULL,
  `archivo` varchar(255) NOT NULL,
  `original_nombre` varchar(255) DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `tamano` int(11) DEFAULT NULL,
  `firmado` tinyint(1) DEFAULT 0,
  `version` int(11) DEFAULT 1,
  `notas` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `documentos_asesor`
--

CREATE TABLE `documentos_asesor` (
  `id` int(11) NOT NULL,
  `id_asesor` int(11) DEFAULT NULL,
  `tipo_seccion` enum('documento','contrato','lineamiento') NOT NULL DEFAULT 'documento',
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `archivo_path` varchar(500) DEFAULT NULL,
  `estado` enum('pending','done','rechazado') NOT NULL DEFAULT 'pending',
  `observaciones` text DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `documentos_asesor`
--

INSERT INTO `documentos_asesor` (`id`, `id_asesor`, `tipo_seccion`, `nombre`, `descripcion`, `archivo_path`, `estado`, `observaciones`, `fecha_vencimiento`, `created_at`, `updated_at`) VALUES
(1, 4, 'documento', 'INE ambos lados', NULL, NULL, 'pending', NULL, NULL, '2025-11-18 02:06:56', '2025-11-18 02:06:56'),
(2, 4, 'documento', 'INE ambos lados', NULL, NULL, 'pending', NULL, NULL, '2025-11-18 02:06:56', '2025-11-18 02:06:56'),
(3, 4, 'documento', 'Comprobante de domicilio', NULL, NULL, 'pending', NULL, NULL, '2025-11-18 02:06:56', '2025-11-18 02:06:56'),
(4, 4, 'documento', 'Comprobante de domicilio', NULL, NULL, 'pending', NULL, NULL, '2025-11-18 02:06:56', '2025-11-18 02:06:56'),
(5, 4, 'documento', 'CIF SAT', NULL, NULL, 'pending', NULL, NULL, '2025-11-18 02:06:56', '2025-11-18 02:06:56'),
(6, 4, 'documento', 'CIF SAT', NULL, NULL, 'pending', NULL, NULL, '2025-11-18 02:06:56', '2025-11-18 02:06:56'),
(7, 4, 'documento', 'Título académico', NULL, NULL, 'pending', NULL, NULL, '2025-11-18 02:06:56', '2025-11-18 02:06:56'),
(8, 4, 'documento', 'Título académico', NULL, NULL, 'pending', NULL, NULL, '2025-11-18 02:06:56', '2025-11-18 02:06:56'),
(9, 4, 'documento', 'Cédula Profesional', NULL, NULL, 'pending', NULL, NULL, '2025-11-18 02:06:56', '2025-11-18 02:06:56'),
(10, 4, 'documento', 'Cédula Profesional', NULL, NULL, 'pending', NULL, NULL, '2025-11-18 02:06:56', '2025-11-18 02:06:56'),
(11, 4, 'documento', 'Certificaciones', NULL, NULL, 'pending', NULL, NULL, '2025-11-18 02:06:56', '2025-11-18 02:06:56'),
(12, 4, 'documento', 'Certificaciones', NULL, NULL, 'pending', NULL, NULL, '2025-11-18 02:06:56', '2025-11-18 02:06:56'),
(13, 4, 'documento', 'CV actualizado', NULL, NULL, 'pending', NULL, NULL, '2025-11-18 02:06:56', '2025-11-18 02:06:56'),
(14, 4, 'documento', 'CV actualizado', NULL, NULL, 'pending', NULL, NULL, '2025-11-18 02:06:56', '2025-11-18 02:06:56'),
(15, 4, 'documento', 'Fotografía profesional', NULL, NULL, 'pending', NULL, NULL, '2025-11-18 02:06:56', '2025-11-18 02:06:56'),
(16, 4, 'documento', 'Fotografía profesional', NULL, NULL, 'pending', NULL, NULL, '2025-11-18 02:06:56', '2025-11-18 02:06:56'),
(17, 4, 'documento', 'Carta de recomendación', NULL, '/uploads/documentos/doc-4-1763431646674-781950171.pdf', 'pending', NULL, NULL, '2025-11-18 02:06:56', '2025-11-18 02:07:26'),
(18, 4, 'documento', 'Carta de recomendación', NULL, '/uploads/documentos/doc-4-1763432058632-412766889.pdf', 'pending', NULL, NULL, '2025-11-18 02:06:56', '2025-11-18 02:14:18'),
(19, 4, 'contrato', 'Contrato de prestación de servicios', NULL, NULL, 'pending', NULL, NULL, '2025-11-18 02:06:56', '2025-11-18 02:06:56'),
(20, 4, 'contrato', 'Contrato de prestación de servicios', NULL, NULL, 'pending', NULL, NULL, '2025-11-18 02:06:56', '2025-11-18 02:06:56');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `eeau`
--

CREATE TABLE `eeau` (
  `id` int(11) NOT NULL,
  `codigo` varchar(20) NOT NULL DEFAULT 'EEAU',
  `titulo` varchar(180) NOT NULL DEFAULT 'Programa EEAU',
  `asesor` varchar(180) NOT NULL DEFAULT 'Kelvin Valentin Ramirez',
  `duracion_meses` int(11) NOT NULL DEFAULT 8,
  `imagen_portada` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `eeau`
--

INSERT INTO `eeau` (`id`, `codigo`, `titulo`, `asesor`, `duracion_meses`, `imagen_portada`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'EEAU', 'Curso EEAU', 'Kelvin Valentin Ramirez', 8, '/public/eeau_portada.png', 1, '2025-08-21 02:56:38', '2025-08-21 03:09:16');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estudiantes`
--

CREATE TABLE `estudiantes` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido_paterno` varchar(100) NOT NULL,
  `apellido_materno` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `foto` text DEFAULT NULL,
  `grupo` varchar(100) NOT NULL,
  `comunidad1` varchar(100) DEFAULT NULL,
  `comunidad2` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `nombre_tutor` varchar(100) DEFAULT NULL,
  `tel_tutor` varchar(20) DEFAULT NULL,
  `academico1` varchar(100) DEFAULT NULL,
  `academico2` varchar(100) DEFAULT NULL,
  `semestre` varchar(20) DEFAULT NULL,
  `alergia` varchar(100) DEFAULT NULL,
  `alergia2` varchar(100) DEFAULT NULL,
  `discapacidad1` varchar(100) DEFAULT NULL,
  `discapacidad2` varchar(100) DEFAULT NULL,
  `orientacion` text DEFAULT NULL,
  `universidades1` varchar(150) DEFAULT NULL,
  `universidades2` varchar(255) DEFAULT NULL,
  `postulacion` varchar(100) DEFAULT NULL,
  `modalidad` varchar(50) DEFAULT NULL,
  `comentario1` text DEFAULT NULL,
  `comentario2` text DEFAULT NULL,
  `curso` varchar(200) NOT NULL,
  `turno` varchar(50) NOT NULL DEFAULT 'VESPERTINO',
  `plan` varchar(100) NOT NULL,
  `estatus` enum('Activo','Suspendido') NOT NULL DEFAULT 'Activo',
  `academia` varchar(100) NOT NULL DEFAULT 'MQerKAcademy',
  `anio` int(11) NOT NULL,
  `folio` int(11) NOT NULL,
  `verificacion` int(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `asesor` varchar(100) NOT NULL DEFAULT 'Kélvil Valentín Gómez Ramírez',
  `folio_formateado` varchar(25) GENERATED ALWAYS AS (concat('M',left(`curso`,4),lpad((`anio` + 1) MOD 100,2,'0'),'-',lpad(`folio`,4,'0'))) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estudiantes`
--

INSERT INTO `estudiantes` (`id`, `nombre`, `apellido_paterno`, `apellido_materno`, `apellidos`, `email`, `foto`, `grupo`, `comunidad1`, `comunidad2`, `telefono`, `fecha_nacimiento`, `nombre_tutor`, `tel_tutor`, `academico1`, `academico2`, `semestre`, `alergia`, `alergia2`, `discapacidad1`, `discapacidad2`, `orientacion`, `universidades1`, `universidades2`, `postulacion`, `modalidad`, `comentario1`, `comentario2`, `curso`, `turno`, `plan`, `estatus`, `academia`, `anio`, `folio`, `verificacion`, `created_at`, `asesor`) VALUES
(67, 'Miguel', 'Angel', 'Cruz vargas', 'Angel Cruz vargas', 'isc20350265@gmail.com', '/public/1763671884564-chicha-ifucdr.jpeg', 'V1', 'SAN JUAN BAUTISTA TUXTEPEC', '', '2811975587', '2000-11-01', 'Rosa Isela zamora', '2818707500', 'MQerKAcademy', 'CBTis', 'Concluido', 'Si', 'Antibioticos', 'Si', 'Autismo', 'No', 'NAVAL,TECNM', '', 'ISC', 'ISC', 'ok', 'bien', 'EEAU', 'VESPERTINO', 'Start', 'Activo', 'CBTis', 25, 1, 2, '2025-10-24 06:00:00', 'Carlos Pérez'),
(69, 'Jessica', 'Fernandez', '', 'Fernandez', 'ige19350409@gmail.com', '/public/1754940987329-518323640_2494738954216624_926389333829993898_n.jpg', 'V1', 'SAN JUAN BAUTISTA TUXTEPEC', '', '2878819370', NULL, 'kelvin', '2874581265', 'CBTis', '', 'Concluido', 'No', '', 'No', '', 'No', 'TECNM', '', 'ige', 'ige', '...', '...', 'EEAU', 'VESPERTINO', 'Start', 'Activo', 'MQerKAcademy', 25, 3, 2, '2025-08-11 19:36:27', 'Carlos Pérez'),
(70, 'Emir', 'cruz', 'zamora', 'cruz zamora', 'isc20350265@gmail.com', '/public/1754943896459-WhatsApp Image 2025-08-10 at 2.33.38 PM.jpeg', 'V2', 'LOMA BONITA', '', '281975587', NULL, 'Miguel Angel', '281975587', 'CBTis', '', '6° semestre', 'No', '', 'No', '', 'No', 'TECNM,NAVAL', '', 'ISC', 'ISC', 'xxx', 'xxx', 'EEAU', 'VESPERTINO', 'Mensual', 'Activo', 'MQerKAcademy', 25, 4, 3, '2025-08-11 20:24:56', 'Kélvil Valentín Gómez Ramírez'),
(71, 'Gerardo ', 'Arcilla', '', 'Arcilla', 'gera@gmail.com', '/public/1755028421157-ChatGPT Image 10 ago 2025, 18_11_50.png', 'V1', 'SAN JOSÉ CHILTEPEC', '', '2871811232', NULL, 'Alejandro Lopez', '2871809089', 'CBTis', '', '5° semestre', 'Si', 'Antibioticos', 'Si', 'TDH', 'No', 'IPN,UAQ', '', 'Logistica', 'Logistica', 'educar', 'excelente', 'EEAU', 'VESPERTINO', 'Premium', 'Activo', 'MQerKAcademy', 25, 5, 2, '2025-08-12 19:53:41', 'Carlos Pérez'),
(72, 'Andres', 'Saul', 'Canelo', 'Saul Canelo', 'andy@gmail.com', '/public/1755029883708-file_000000007acc61f6a8019e5a25720850.png', 'V1', 'AYOTZINTEPEC', '', '2871811231', NULL, 'Aron Vazquez', '2878752825', 'COLEGIO AMÉRICA', 'cbtis', '6° semestre', 'si', 'Antibioticos', 'Si', 'Autismo', 'No', 'ANAHUAC', '', 'Medicina', 'Presencial', 'x', 'x', 'EEAU', 'VESPERTINO', 'Start', 'Activo', 'COLEGIO AMÉRICA', 25, 6, 2, '2025-08-12 20:18:03', 'Carlos Pérez'),
(73, 'Juan ', 'Perez', 'Del Rio ', 'Perez Del Rio ', 'juanperez8@gmail.com', '/public/1755800362156-5-7u6pqt.png', 'V1', '', 'Valle de bravo', '2871811233', NULL, 'Jessica Hernandez', '2871811234', '', 'CEBETIS', '5° semestre', 'Si', 'ANTIBIOTICOS', 'Si', 'Autismo', 'Si', '', '', '', 'Presencial', 'SSS', 'SSS', 'EEAU', 'VESPERTINO', 'Premium', 'Activo', 'MQerKAcademy', 25, 7, 2, '2025-08-21 18:19:22', 'Carlos Pérez'),
(74, 'Eduerdado', 'de Jesus ', 'zamora', 'de Jesus  zamora', 'alex@siventux.com', '/public/1765326405959-grooming-axwx8b.jpg', 'M1', 'LOMA BONITA', '', '2132133123', NULL, 'miguel', '2132133123', 'CBTis', '', '5° semestre', 'No', '', 'No', '', 'Si', '', '', '', 'Presencial', 'nada', 'nada', 'EEAU', 'VESPERTINO', 'Mensual', 'Activo', 'MQerKAcademy', 25, 8, 2, '2025-12-10 00:26:45', 'Kélvil Valentín Gómez Ramírez'),
(76, 'Haniel', 'Flores', 'Cruz', 'Flores Cruz', 'haniel.freefire@gmail.com', '/public/1766626627826-captura-de-pantalla-2025-12-22-134936-dvso7q.png', 'V2', 'LOMA BONITA', '', '1234567890', NULL, 'Petra vargas roxairo', '1234567890', 'CBTis', '', '5° semestre', 'No', '', 'No', '', 'Si', '', '', '', 'Presencial', 'no se', 'que me enseñen', 'EEAU', 'VESPERTINO', 'Mensual', 'Activo', 'MQerKAcademy', 25, 9, 2, '2025-12-25 01:37:07', 'Kélvil Valentín Gómez Ramírez');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estudiantes_config`
--

CREATE TABLE `estudiantes_config` (
  `id` int(11) NOT NULL,
  `id_estudiante` int(11) NOT NULL,
  `nivel_experiencia` varchar(32) DEFAULT 'intermedio',
  `intereses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `theme_preference` varchar(16) DEFAULT 'system',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estudiantes_config`
--

INSERT INTO `estudiantes_config` (`id`, `id_estudiante`, `nivel_experiencia`, `intereses`, `theme_preference`, `created_at`, `updated_at`) VALUES
(1, 67, 'intermedio', '[\"programacion\",\"tecnologico\",\"psicoeducativo\"]', 'system', '2025-08-11 00:46:28', '2025-08-13 22:34:33');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `feedback_submissions`
--

CREATE TABLE `feedback_submissions` (
  `id` int(11) NOT NULL,
  `id_task` int(11) NOT NULL,
  `id_estudiante` int(11) NOT NULL,
  `archivo` varchar(255) NOT NULL,
  `original_nombre` varchar(255) DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `tamano` int(11) DEFAULT NULL,
  `puntos` int(11) NOT NULL DEFAULT 10,
  `version` int(11) NOT NULL DEFAULT 1,
  `replaced_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `feedback_submissions`
--

INSERT INTO `feedback_submissions` (`id`, `id_task`, `id_estudiante`, `archivo`, `original_nombre`, `mime_type`, `tamano`, `puntos`, `version`, `replaced_by`, `created_at`, `updated_at`) VALUES
(2, 1, 67, '/public/1755363177061-manual-sql1-compressed-se7yo5.pdf', 'Manual-SQL1_compressed.pdf', 'application/pdf', 159959, 10, 1, NULL, '2025-08-16 16:52:57', '2025-08-16 16:52:57'),
(3, 2, 67, '/public/1755363492303-manual-sql1-bkwnq9.pdf', 'Manual-SQL1.pdf', 'application/pdf', 1083603, 10, 1, NULL, '2025-08-16 16:58:12', '2025-08-16 16:58:12'),
(4, 3, 67, '/public/1755363675520-manual-sql1-compressed-qt1bum.pdf', 'Manual-SQL1_compressed.pdf', 'application/pdf', 159959, 10, 1, NULL, '2025-08-16 17:01:15', '2025-08-16 17:01:15'),
(5, 3, 67, '/public/1755377326678-manual-sql1-compressed-fvrjoq.pdf', 'Manual-SQL1_compressed.pdf', 'application/pdf', 159959, 10, 1, NULL, '2025-08-16 20:48:46', '2025-08-16 20:48:46'),
(6, 1, 67, '/public/1755534297808-contrato-mqeeau-2025-0731-8819-mar-a-gon-tlleaz.pdf', 'Contrato_MQEEAU-2025-0731-8819_MARÃA_GONZÃLEZ_LÃPEZ.pdf', 'application/pdf', 604636, 10, 1, NULL, '2025-08-18 16:24:57', '2025-08-18 16:24:57'),
(7, 4, 67, '/public/1755807951939-manual-sql1-compressed-1-f8pspm.pdf', 'Manual-SQL1_compressed (1).pdf', 'application/pdf', 159959, 10, 1, NULL, '2025-08-21 20:25:51', '2025-08-21 20:25:51'),
(8, 5, 67, '/public/1755809962614-1755663991234-manual-sql1-compressed-xqr-p7ib0v.pdf', '1755663991234-manual-sql1-compressed-xqr4i9.pdf', 'application/pdf', 159959, 10, 1, NULL, '2025-08-21 20:59:22', '2025-08-21 20:59:22');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `feedback_submission_notes`
--

CREATE TABLE `feedback_submission_notes` (
  `id` int(11) NOT NULL,
  `id_submission` int(11) NOT NULL,
  `id_asesor` int(11) DEFAULT NULL,
  `nota` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `feedback_submission_notes`
--

INSERT INTO `feedback_submission_notes` (`id`, `id_submission`, `id_asesor`, `nota`, `created_at`, `updated_at`) VALUES
(1, 5, NULL, 'muy bien pero el ejercicio 3 esta mal, revisala', '2025-09-01 21:56:06', '2025-10-06 19:36:14');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `feedback_tasks`
--

CREATE TABLE `feedback_tasks` (
  `id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `archivos_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`archivos_json`)),
  `imagen_portada` varchar(255) DEFAULT NULL,
  `puntos` int(11) NOT NULL DEFAULT 10,
  `due_date` datetime NOT NULL,
  `grupos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`grupos`)),
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `feedback_tasks`
--

INSERT INTO `feedback_tasks` (`id`, `nombre`, `descripcion`, `archivos_json`, `imagen_portada`, `puntos`, `due_date`, `grupos`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'Operaciones Fundamentales', NULL, NULL, NULL, 10, '2025-08-19 16:37:50', NULL, 1, '2025-08-16 16:37:50', '2025-08-16 16:37:50'),
(2, 'Expresiones Algebraicas', NULL, NULL, NULL, 10, '2025-08-22 16:37:50', NULL, 1, '2025-08-16 16:37:50', '2025-08-16 16:37:50'),
(3, 'Geometría Básica', NULL, NULL, NULL, 10, '2025-08-25 16:37:50', NULL, 1, '2025-08-16 16:37:50', '2025-08-16 16:37:50'),
(4, 'probando', NULL, NULL, NULL, 10, '2025-08-21 20:25:51', '[67]', 1, '2025-08-21 20:24:16', '2025-08-21 20:25:51'),
(5, 'dsa', NULL, NULL, NULL, 10, '2025-08-21 20:59:22', '[67]', 1, '2025-08-21 20:47:30', '2025-08-21 20:59:22'),
(6, 'adasdasd', NULL, NULL, NULL, 10, '2025-09-01 17:34:51', '[67]', 1, '2025-09-01 17:34:51', '2025-09-01 17:34:51'),
(7, 'prueba', NULL, NULL, NULL, 10, '2025-12-24 16:53:53', '[67]', 1, '2025-12-24 16:53:54', '2025-12-24 16:53:54');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `formulas`
--

CREATE TABLE `formulas` (
  `id` int(11) NOT NULL,
  `categoria` varchar(100) NOT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `latex` text NOT NULL,
  `descripcion` text DEFAULT NULL,
  `tiene_placeholders` tinyint(1) NOT NULL DEFAULT 0,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `orden` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `formulas`
--

INSERT INTO `formulas` (`id`, `categoria`, `nombre`, `latex`, `descripcion`, `tiene_placeholders`, `activo`, `orden`, `created_at`, `updated_at`) VALUES
(1, 'Básico', NULL, 'x^2', NULL, 0, 1, 0, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(2, 'Básico', NULL, 'x_i', NULL, 0, 1, 1, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(3, 'Básico', NULL, '\\sqrt{x}', NULL, 0, 1, 2, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(4, 'Básico', NULL, '\\sqrt[n]{x}', NULL, 0, 1, 3, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(5, 'Básico', NULL, '\\frac{a}{b}', NULL, 0, 1, 4, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(6, 'Básico', NULL, '\\cdot', NULL, 0, 1, 5, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(7, 'Básico', NULL, '\\times', NULL, 0, 1, 6, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(8, 'Básico', NULL, '\\div', NULL, 0, 1, 7, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(9, 'Básico', NULL, '\\pm', NULL, 0, 1, 8, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(10, 'Básico', NULL, '\\mp', NULL, 0, 1, 9, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(11, 'Básico', NULL, '\\dots', NULL, 0, 1, 10, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(12, 'Básico', NULL, '\\ldots', NULL, 0, 1, 11, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(13, 'Básico', NULL, '\\cdots', NULL, 0, 1, 12, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(14, 'Básico', NULL, '\\overline{AB}', NULL, 0, 1, 13, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(15, 'Básico', NULL, '\\hat{\\theta}', NULL, 0, 1, 14, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(16, 'Básico', NULL, '\\vec{v}', NULL, 0, 1, 15, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(17, 'Básico', NULL, '^{\\circ}', NULL, 0, 1, 16, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(18, 'Griego', NULL, '\\alpha', NULL, 0, 1, 0, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(19, 'Griego', NULL, '\\beta', NULL, 0, 1, 1, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(20, 'Griego', NULL, '\\gamma', NULL, 0, 1, 2, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(21, 'Griego', NULL, '\\delta', NULL, 0, 1, 3, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(22, 'Griego', NULL, '\\epsilon', NULL, 0, 1, 4, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(23, 'Griego', NULL, '\\zeta', NULL, 0, 1, 5, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(24, 'Griego', NULL, '\\eta', NULL, 0, 1, 6, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(25, 'Griego', NULL, '\\theta', NULL, 0, 1, 7, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(26, 'Griego', NULL, '\\iota', NULL, 0, 1, 8, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(27, 'Griego', NULL, '\\kappa', NULL, 0, 1, 9, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(28, 'Griego', NULL, '\\lambda', NULL, 0, 1, 10, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(29, 'Griego', NULL, '\\mu', NULL, 0, 1, 11, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(30, 'Griego', NULL, '\\nu', NULL, 0, 1, 12, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(31, 'Griego', NULL, '\\xi', NULL, 0, 1, 13, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(32, 'Griego', NULL, '\\pi', NULL, 0, 1, 14, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(33, 'Griego', NULL, '\\rho', NULL, 0, 1, 15, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(34, 'Griego', NULL, '\\sigma', NULL, 0, 1, 16, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(35, 'Griego', NULL, '\\tau', NULL, 0, 1, 17, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(36, 'Griego', NULL, '\\upsilon', NULL, 0, 1, 18, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(37, 'Griego', NULL, '\\phi', NULL, 0, 1, 19, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(38, 'Griego', NULL, '\\chi', NULL, 0, 1, 20, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(39, 'Griego', NULL, '\\psi', NULL, 0, 1, 21, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(40, 'Griego', NULL, '\\omega', NULL, 0, 1, 22, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(41, 'Griego', NULL, '\\Gamma', NULL, 0, 1, 23, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(42, 'Griego', NULL, '\\Delta', NULL, 0, 1, 24, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(43, 'Griego', NULL, '\\Theta', NULL, 0, 1, 25, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(44, 'Griego', NULL, '\\Lambda', NULL, 0, 1, 26, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(45, 'Griego', NULL, '\\Xi', NULL, 0, 1, 27, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(46, 'Griego', NULL, '\\Pi', NULL, 0, 1, 28, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(47, 'Griego', NULL, '\\Sigma', NULL, 0, 1, 29, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(48, 'Griego', NULL, '\\Upsilon', NULL, 0, 1, 30, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(49, 'Griego', NULL, '\\Phi', NULL, 0, 1, 31, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(50, 'Griego', NULL, '\\Psi', NULL, 0, 1, 32, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(51, 'Griego', NULL, '\\Omega', NULL, 0, 1, 33, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(52, 'ABΓ (Conj.)', NULL, '\\mathbb{N}', NULL, 0, 1, 0, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(53, 'ABΓ (Conj.)', NULL, '\\mathbb{Z}', NULL, 0, 1, 1, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(54, 'ABΓ (Conj.)', NULL, '\\mathbb{Q}', NULL, 0, 1, 2, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(55, 'ABΓ (Conj.)', NULL, '\\mathbb{R}', NULL, 0, 1, 3, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(56, 'ABΓ (Conj.)', NULL, '\\mathbb{C}', NULL, 0, 1, 4, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(57, 'ABΓ (Conj.)', NULL, '\\mathcal{A}', NULL, 0, 1, 5, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(58, 'ABΓ (Conj.)', NULL, '\\mathcal{B}', NULL, 0, 1, 6, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(59, 'ABΓ (Conj.)', NULL, '\\mathcal{L}', NULL, 0, 1, 7, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(60, 'ABΓ (Conj.)', NULL, '\\mathcal{F}', NULL, 0, 1, 8, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(61, 'ABΓ (Conj.)', NULL, '\\subset', NULL, 0, 1, 9, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(62, 'ABΓ (Conj.)', NULL, '\\subseteq', NULL, 0, 1, 10, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(63, 'ABΓ (Conj.)', NULL, '\\supset', NULL, 0, 1, 11, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(64, 'ABΓ (Conj.)', NULL, '\\supseteq', NULL, 0, 1, 12, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(65, 'ABΓ (Conj.)', NULL, '\\in', NULL, 0, 1, 13, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(66, 'ABΓ (Conj.)', NULL, '\\notin', NULL, 0, 1, 14, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(67, 'ABΓ (Conj.)', NULL, '\\cup', NULL, 0, 1, 15, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(68, 'ABΓ (Conj.)', NULL, '\\cap', NULL, 0, 1, 16, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(69, 'ABΓ (Conj.)', NULL, '\\setminus', NULL, 0, 1, 17, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(70, 'ABΓ (Conj.)', NULL, '\\varnothing', NULL, 0, 1, 18, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(71, 'Trig', NULL, '\\sin', NULL, 0, 1, 0, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(72, 'Trig', NULL, '\\cos', NULL, 0, 1, 1, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(73, 'Trig', NULL, '\\tan', NULL, 0, 1, 2, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(74, 'Trig', NULL, '\\cot', NULL, 0, 1, 3, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(75, 'Trig', NULL, '\\sec', NULL, 0, 1, 4, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(76, 'Trig', NULL, '\\csc', NULL, 0, 1, 5, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(77, 'Trig', NULL, '\\arcsin', NULL, 0, 1, 6, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(78, 'Trig', NULL, '\\arccos', NULL, 0, 1, 7, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(79, 'Trig', NULL, '\\arctan', NULL, 0, 1, 8, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(80, 'Trig', NULL, '\\sin^{-1}', NULL, 0, 1, 9, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(81, 'Trig', NULL, '\\cos^{-1}', NULL, 0, 1, 10, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(82, 'Trig', NULL, '\\tan^{-1}', NULL, 0, 1, 11, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(83, 'Rel/Op', NULL, '\\le', NULL, 0, 1, 0, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(84, 'Rel/Op', NULL, '\\ge', NULL, 0, 1, 1, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(85, 'Rel/Op', NULL, '<', NULL, 0, 1, 2, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(86, 'Rel/Op', NULL, '>', NULL, 0, 1, 3, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(87, 'Rel/Op', NULL, '\\neq', NULL, 0, 1, 4, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(88, 'Rel/Op', NULL, '\\approx', NULL, 0, 1, 5, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(89, 'Rel/Op', NULL, '\\equiv', NULL, 0, 1, 6, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(90, 'Rel/Op', NULL, '\\propto', NULL, 0, 1, 7, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(91, 'Rel/Op', NULL, '\\to', NULL, 0, 1, 8, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(92, 'Rel/Op', NULL, '\\Rightarrow', NULL, 0, 1, 9, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(93, 'Rel/Op', NULL, '\\Leftarrow', NULL, 0, 1, 10, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(94, 'Rel/Op', NULL, '\\Leftrightarrow', NULL, 0, 1, 11, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(95, 'Rel/Op', NULL, '\\parallel', NULL, 0, 1, 12, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(96, 'Rel/Op', NULL, '\\perp', NULL, 0, 1, 13, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(97, 'Rel/Op', NULL, '\\angle', NULL, 0, 1, 14, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(98, 'Rel/Op', NULL, '\\measuredangle', NULL, 0, 1, 15, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(99, 'Álgebra', NULL, '\\log', NULL, 0, 1, 0, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(100, 'Álgebra', NULL, '\\ln', NULL, 0, 1, 1, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(101, 'Álgebra', NULL, 'e^{x}', NULL, 0, 1, 2, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(102, 'Álgebra', NULL, 'a^{b}', NULL, 0, 1, 3, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(103, 'Álgebra', NULL, 'x^{\\square}', NULL, 1, 1, 4, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(104, 'Álgebra', NULL, '_{\\square}', NULL, 1, 1, 5, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(105, 'Álgebra', NULL, '(x+1)^2', NULL, 0, 1, 6, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(106, 'Álgebra', NULL, '(a-b)^2', NULL, 0, 1, 7, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(107, 'Álgebra', NULL, '(a+b)^3', NULL, 0, 1, 8, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(108, 'Álgebra', NULL, '(a-b)^3', NULL, 0, 1, 9, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(109, 'Álgebra', NULL, '\\sqrt{\\square}', NULL, 1, 1, 10, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(110, 'Álgebra', NULL, '\\sqrt[n]{\\square}', NULL, 1, 1, 11, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(111, 'Álgebra', NULL, '\\binom{n}{k}', NULL, 0, 1, 12, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(112, 'Álgebra', NULL, '\\choose', NULL, 0, 1, 13, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(113, 'Álgebra', NULL, '\\gcd', NULL, 0, 1, 14, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(114, 'Álgebra', NULL, '\\operatorname{lcm}', NULL, 0, 1, 15, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(115, 'Álgebra', NULL, 'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}', NULL, 0, 1, 16, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(116, 'Álgebra', NULL, 'ax^2 + bx + c = 0', NULL, 0, 1, 17, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(117, 'Álgebra', NULL, '(a+b)(a-b) = a^2 - b^2', NULL, 0, 1, 18, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(118, 'Álgebra', NULL, 'a^2 + 2ab + b^2 = (a+b)^2', NULL, 0, 1, 19, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(119, 'Álgebra', NULL, 'a^2 - 2ab + b^2 = (a-b)^2', NULL, 0, 1, 20, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(120, 'Álgebra', NULL, 'a^3 + b^3 = (a+b)(a^2-ab+b^2)', NULL, 0, 1, 21, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(121, 'Álgebra', NULL, 'a^3 - b^3 = (a-b)(a^2+ab+b^2)', NULL, 0, 1, 22, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(122, 'Álgebra', NULL, '\\frac{a}{b} = \\frac{c}{d} \\Rightarrow ad = bc', NULL, 0, 1, 23, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(123, 'Cálculo', NULL, '\\sum_{i=1}^{n} a_i', NULL, 0, 1, 0, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(124, 'Cálculo', NULL, '\\prod_{k=1}^{n} b_k', NULL, 0, 1, 1, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(125, 'Cálculo', NULL, '\\int f(x)\\,dx', NULL, 0, 1, 2, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(126, 'Cálculo', NULL, '\\int_{a}^{b} f(x)\\,dx', NULL, 0, 1, 3, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(127, 'Cálculo', NULL, '\\int \\square\\,dx', NULL, 1, 1, 4, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(128, 'Cálculo', NULL, '\\int_{\\square}^{\\square} \\square\\,dx', NULL, 1, 1, 5, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(129, 'Cálculo', NULL, '\\int x^{\\square}\\,dx', NULL, 1, 1, 6, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(130, 'Cálculo', NULL, '\\int e^{\\square}\\,dx', NULL, 1, 1, 7, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(131, 'Cálculo', NULL, '\\int \\sin(\\square)\\,dx', NULL, 1, 1, 8, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(132, 'Cálculo', NULL, '\\int \\cos(\\square)\\,dx', NULL, 1, 1, 9, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(133, 'Cálculo', NULL, '\\int \\frac{1}{\\square}\\,dx', NULL, 1, 1, 10, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(134, 'Cálculo', NULL, '\\int \\ln(\\square)\\,dx', NULL, 1, 1, 11, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(135, 'Cálculo', NULL, '\\iint\\, dA', NULL, 0, 1, 12, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(136, 'Cálculo', NULL, '\\iiint\\, dV', NULL, 0, 1, 13, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(137, 'Cálculo', NULL, '\\oint\\,', NULL, 0, 1, 14, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(138, 'Cálculo', NULL, '\\lim_{x\\to 0}', NULL, 0, 1, 15, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(139, 'Cálculo', NULL, '\\lim_{n\\to\\infty}', NULL, 0, 1, 16, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(140, 'Cálculo', NULL, '\\lim_{x\\to \\square}', NULL, 1, 1, 17, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(141, 'Cálculo', NULL, '\\lim_{x\\to \\square} \\frac{\\square}{\\square}', NULL, 1, 1, 18, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(142, 'Cálculo', NULL, '\\frac{d}{dx}', NULL, 0, 1, 19, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(143, 'Cálculo', NULL, '\\frac{d^2}{dx^2}', NULL, 0, 1, 20, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(144, 'Cálculo', NULL, '\\frac{d}{dx}(\\square)', NULL, 1, 1, 21, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(145, 'Cálculo', NULL, '\\frac{d^2}{dx^2}(\\square)', NULL, 1, 1, 22, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(146, 'Cálculo', NULL, '\\frac{\\partial}{\\partial x}', NULL, 0, 1, 23, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(147, 'Cálculo', NULL, '\\frac{\\partial^2}{\\partial x^2}', NULL, 0, 1, 24, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(148, 'Cálculo', NULL, '\\frac{\\partial}{\\partial x}(\\square)', NULL, 1, 1, 25, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(149, 'Cálculo', NULL, '\\frac{\\partial}{\\partial y}(\\square)', NULL, 1, 1, 26, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(150, 'Cálculo', NULL, '\\frac{d}{dx}(x^n) = nx^{n-1}', NULL, 0, 1, 27, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(151, 'Cálculo', NULL, '\\frac{d}{dx}(e^x) = e^x', NULL, 0, 1, 28, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(152, 'Cálculo', NULL, '\\frac{d}{dx}(\\ln x) = \\frac{1}{x}', NULL, 0, 1, 29, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(153, 'Cálculo', NULL, '\\frac{d}{dx}(\\sin x) = \\cos x', NULL, 0, 1, 30, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(154, 'Cálculo', NULL, '\\frac{d}{dx}(\\cos x) = -\\sin x', NULL, 0, 1, 31, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(155, 'Cálculo', NULL, '\\frac{d}{dx}(\\tan x) = \\sec^2 x', NULL, 0, 1, 32, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(156, 'Cálculo', NULL, '\\frac{d}{dx}(\\cot x) = -\\csc^2 x', NULL, 0, 1, 33, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(157, 'Cálculo', NULL, '\\frac{d}{dx}(\\sec x) = \\sec x \\tan x', NULL, 0, 1, 34, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(158, 'Cálculo', NULL, '\\frac{d}{dx}(\\csc x) = -\\csc x \\cot x', NULL, 0, 1, 35, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(159, 'Cálculo', NULL, '\\frac{d}{dx}(\\arcsin x) = \\frac{1}{\\sqrt{1-x^2}}', NULL, 0, 1, 36, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(160, 'Cálculo', NULL, '\\frac{d}{dx}(\\arccos x) = -\\frac{1}{\\sqrt{1-x^2}}', NULL, 0, 1, 37, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(161, 'Cálculo', NULL, '\\frac{d}{dx}(\\arctan x) = \\frac{1}{1+x^2}', NULL, 0, 1, 38, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(162, 'Cálculo', NULL, '\\frac{d}{dx}(f \\cdot g) = f\'g + fg\'', NULL, 0, 1, 39, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(163, 'Cálculo', NULL, '\\frac{d}{dx}\\left(\\frac{f}{g}\\right) = \\frac{f\'g - fg\'}{g^2}', NULL, 0, 1, 40, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(164, 'Cálculo', NULL, '\\frac{d}{dx}(f(g(x))) = f\'(g(x)) \\cdot g\'(x)', NULL, 0, 1, 41, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(165, 'Cálculo', NULL, '\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C', NULL, 0, 1, 42, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(166, 'Cálculo', NULL, '\\int e^x\\,dx = e^x + C', NULL, 0, 1, 43, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(167, 'Cálculo', NULL, '\\int \\frac{1}{x}\\,dx = \\ln|x| + C', NULL, 0, 1, 44, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(168, 'Cálculo', NULL, '\\int \\sin x\\,dx = -\\cos x + C', NULL, 0, 1, 45, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(169, 'Cálculo', NULL, '\\int \\cos x\\,dx = \\sin x + C', NULL, 0, 1, 46, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(170, 'Cálculo', NULL, '\\int \\sec^2 x\\,dx = \\tan x + C', NULL, 0, 1, 47, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(171, 'Cálculo', NULL, '\\int \\csc^2 x\\,dx = -\\cot x + C', NULL, 0, 1, 48, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(172, 'Cálculo', NULL, '\\int \\sec x \\tan x\\,dx = \\sec x + C', NULL, 0, 1, 49, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(173, 'Cálculo', NULL, '\\int \\csc x \\cot x\\,dx = -\\csc x + C', NULL, 0, 1, 50, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(174, 'Cálculo', NULL, '\\int \\frac{1}{\\sqrt{1-x^2}}\\,dx = \\arcsin x + C', NULL, 0, 1, 51, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(175, 'Cálculo', NULL, '\\int \\frac{1}{1+x^2}\\,dx = \\arctan x + C', NULL, 0, 1, 52, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(176, 'Cálculo', NULL, '\\int \\frac{1}{x^2+a^2}\\,dx = \\frac{1}{a}\\arctan\\frac{x}{a} + C', NULL, 0, 1, 53, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(177, 'Cálculo', NULL, '\\int \\frac{1}{\\sqrt{x^2-a^2}}\\,dx = \\ln|x+\\sqrt{x^2-a^2}| + C', NULL, 0, 1, 54, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(178, 'Cálculo', NULL, '\\int u\\,dv = uv - \\int v\\,du', NULL, 0, 1, 55, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(179, 'Cálculo', NULL, '\\int_{a}^{b} f(x)\\,dx = F(b) - F(a)', NULL, 0, 1, 56, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(180, 'Cálculo', NULL, '\\lim_{x\\to a} \\frac{f(x)-f(a)}{x-a} = f\'(a)', NULL, 0, 1, 57, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(181, 'Cálculo', NULL, '\\lim_{h\\to 0} \\frac{f(x+h)-f(x)}{h} = f\'(x)', NULL, 0, 1, 58, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(182, 'Cálculo', NULL, '\\frac{d}{dx}\\left(\\int_{a}^{x} f(t)\\,dt\\right) = f(x)', NULL, 0, 1, 59, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(183, 'Cálculo', NULL, '\\int_{a}^{b} f(x)g\'(x)\\,dx = f(x)g(x)\\big|_a^b - \\int_{a}^{b} f\'(x)g(x)\\,dx', NULL, 0, 1, 60, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(184, 'Cálculo', NULL, '\\int f(g(x))g\'(x)\\,dx = \\int f(u)\\,du', NULL, 0, 1, 61, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(185, 'Cálculo', NULL, '\\frac{\\partial f}{\\partial x} = \\lim_{h\\to 0} \\frac{f(x+h,y)-f(x,y)}{h}', NULL, 0, 1, 62, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(186, 'Cálculo', NULL, '\\frac{\\partial^2 f}{\\partial x \\partial y} = \\frac{\\partial^2 f}{\\partial y \\partial x}', NULL, 0, 1, 63, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(187, 'Cálculo', NULL, '\\nabla f = \\left(\\frac{\\partial f}{\\partial x}, \\frac{\\partial f}{\\partial y}, \\frac{\\partial f}{\\partial z}\\right)', NULL, 0, 1, 64, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(188, 'Cálculo', NULL, '\\int_C \\vec{F} \\cdot d\\vec{r} = \\int_a^b \\vec{F}(\\vec{r}(t)) \\cdot \\vec{r}\'(t)\\,dt', NULL, 0, 1, 65, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(189, 'Cálculo', NULL, '\\iint_D f(x,y)\\,dA = \\int_a^b \\int_{g_1(x)}^{g_2(x)} f(x,y)\\,dy\\,dx', NULL, 0, 1, 66, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(190, 'Cálculo', NULL, '\\iiint_E f(x,y,z)\\,dV = \\int_a^b \\int_{g_1(x)}^{g_2(x)} \\int_{h_1(x,y)}^{h_2(x,y)} f(x,y,z)\\,dz\\,dy\\,dx', NULL, 0, 1, 67, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(191, 'Parént./Matriz', NULL, '\\left(\\square\\right)', NULL, 1, 1, 0, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(192, 'Parént./Matriz', NULL, '\\left[\\square\\right]', NULL, 1, 1, 1, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(193, 'Parént./Matriz', NULL, '\\left\\{\\square\\right\\}', NULL, 1, 1, 2, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(194, 'Parént./Matriz', NULL, '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', NULL, 0, 1, 3, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(195, 'Parént./Matriz', NULL, '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}', NULL, 0, 1, 4, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(196, 'Parént./Matriz', NULL, '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}', NULL, 0, 1, 5, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(197, 'Parént./Matriz', NULL, '\\begin{matrix} a & b & c \\\\ d & e & f \\end{matrix}', NULL, 0, 1, 6, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(198, 'Vect/Flechas', NULL, '\\vec{v}', NULL, 0, 1, 0, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(199, 'Vect/Flechas', NULL, '\\overrightarrow{AB}', NULL, 0, 1, 1, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(200, 'Vect/Flechas', NULL, '\\overleftarrow{CD}', NULL, 0, 1, 2, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(201, 'Vect/Flechas', NULL, '\\nabla', NULL, 0, 1, 3, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(202, 'Vect/Flechas', NULL, '\\nabla\\cdot\\vec{F}', NULL, 0, 1, 4, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(203, 'Vect/Flechas', NULL, '\\nabla\\times\\vec{F}', NULL, 0, 1, 5, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(204, 'Prob/Combi', NULL, 'P(A)', NULL, 0, 1, 0, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(205, 'Prob/Combi', NULL, 'P(A\\mid B)', NULL, 0, 1, 1, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(206, 'Prob/Combi', NULL, '\\Pr\\,(\\square)', NULL, 1, 1, 2, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(207, 'Prob/Combi', NULL, '\\mathbb{E}[X]', NULL, 0, 1, 3, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(208, 'Prob/Combi', NULL, '\\operatorname{Var}(X)', NULL, 0, 1, 4, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(209, 'Prob/Combi', NULL, '\\binom{n}{k}', NULL, 0, 1, 5, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(210, 'Prob/Combi', NULL, '\\frac{n!}{k!\\,(n-k)!}', NULL, 0, 1, 6, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(211, 'Prob/Combi', NULL, 'n!', NULL, 0, 1, 7, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(212, 'Prob/Combi', NULL, '(n-1)!', NULL, 0, 1, 8, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(213, 'Química/H₂O', NULL, 'H_2O', NULL, 0, 1, 0, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(214, 'Química/H₂O', NULL, 'CO_2', NULL, 0, 1, 1, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(215, 'Química/H₂O', NULL, 'Na^+', NULL, 0, 1, 2, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(216, 'Química/H₂O', NULL, 'Cl^-', NULL, 0, 1, 3, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(217, 'Química/H₂O', NULL, 'x^{2+}', NULL, 0, 1, 4, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(218, 'Química/H₂O', NULL, 'x^{3-}', NULL, 0, 1, 5, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(219, 'Química/H₂O', NULL, 'H_2SO_4', NULL, 0, 1, 6, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(220, 'Química/H₂O', NULL, 'HNO_3', NULL, 0, 1, 7, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(221, 'Química/H₂O', NULL, 'HCl', NULL, 0, 1, 8, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(222, 'Química/H₂O', NULL, 'NaOH', NULL, 0, 1, 9, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(223, 'Química/H₂O', NULL, 'CaCO_3', NULL, 0, 1, 10, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(224, 'Química/H₂O', NULL, 'CH_4', NULL, 0, 1, 11, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(225, 'Química/H₂O', NULL, 'C_2H_5OH', NULL, 0, 1, 12, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(226, 'Química/H₂O', NULL, 'NH_3', NULL, 0, 1, 13, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(227, 'Química/H₂O', NULL, 'H_2O_2', NULL, 0, 1, 14, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(228, 'Química/H₂O', NULL, 'NaCl', NULL, 0, 1, 15, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(229, 'Química/H₂O', NULL, 'KCl', NULL, 0, 1, 16, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(230, 'Química/H₂O', NULL, 'MgCl_2', NULL, 0, 1, 17, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(231, 'Química/H₂O', NULL, 'AlCl_3', NULL, 0, 1, 18, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(232, 'Química/H₂O', NULL, 'pH = -\\log[H^+]', NULL, 0, 1, 19, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(233, 'Química/H₂O', NULL, 'pOH = -\\log[OH^-]', NULL, 0, 1, 20, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(234, 'Química/H₂O', NULL, 'pH + pOH = 14', NULL, 0, 1, 21, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(235, 'Química/H₂O', NULL, 'K_w = [H^+][OH^-] = 1.0 \\times 10^{-14}', NULL, 0, 1, 22, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(236, 'Química/H₂O', NULL, 'K_a = \\frac{[H^+][A^-]}{[HA]}', NULL, 0, 1, 23, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(237, 'Química/H₂O', NULL, 'K_b = \\frac{[OH^-][BH^+]}{[B]}', NULL, 0, 1, 24, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(238, 'Química/H₂O', NULL, 'K_a \\cdot K_b = K_w', NULL, 0, 1, 25, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(239, 'Química/H₂O', NULL, '\\Delta G = \\Delta H - T\\Delta S', NULL, 0, 1, 26, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(240, 'Química/H₂O', NULL, '\\Delta G = -RT\\ln K', NULL, 0, 1, 27, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(241, 'Química/H₂O', NULL, 'PV = nRT', NULL, 0, 1, 28, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(242, 'Química/H₂O', NULL, '\\frac{P_1V_1}{T_1} = \\frac{P_2V_2}{T_2}', NULL, 0, 1, 29, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(243, 'Química/H₂O', NULL, 'C = \\frac{n}{V}', NULL, 0, 1, 30, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(244, 'Química/H₂O', NULL, 'M_1V_1 = M_2V_2', NULL, 0, 1, 31, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(245, 'Química/H₂O', NULL, '\\Delta H = \\sum H_{products} - \\sum H_{reactants}', NULL, 0, 1, 32, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(246, 'Química/H₂O', NULL, 'q = mc\\Delta T', NULL, 0, 1, 33, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(247, 'Química/H₂O', NULL, '\\Delta S = \\frac{q_{rev}}{T}', NULL, 0, 1, 34, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(248, 'Química/H₂O', NULL, 'E = E^0 - \\frac{RT}{nF}\\ln Q', NULL, 0, 1, 35, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(249, 'Química/H₂O', NULL, 'E^0 = E^0_{cathode} - E^0_{anode}', NULL, 0, 1, 36, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(250, 'Química/H₂O', NULL, '\\Delta G^0 = -nFE^0', NULL, 0, 1, 37, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(251, 'Plantillas', NULL, '\\frac{\\square}{\\square}', NULL, 1, 1, 0, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(252, 'Plantillas', NULL, '\\sqrt{\\square}', NULL, 1, 1, 1, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(253, 'Plantillas', NULL, '\\sqrt[n]{\\square}', NULL, 1, 1, 2, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(254, 'Plantillas', NULL, '\\left(\\square\\right)', NULL, 1, 1, 3, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(255, 'Plantillas', NULL, '\\left[\\square\\right]', NULL, 1, 1, 4, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(256, 'Plantillas', NULL, '\\left\\{\\square\\right\\}', NULL, 1, 1, 5, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(257, 'Plantillas', NULL, 'a^{\\square}', NULL, 1, 1, 6, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(258, 'Plantillas', NULL, '\\_{\\square}', NULL, 1, 1, 7, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(259, 'Plantillas', NULL, '\\lim_{x\\to \\square}', NULL, 1, 1, 8, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(260, 'Plantillas', NULL, '\\sum_{i=\\square}^{\\square} \\square', NULL, 1, 1, 9, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(261, 'Plantillas', NULL, '\\int_{\\square}^{\\square} \\square\\,dx', NULL, 1, 1, 10, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(262, 'Plantillas', NULL, 'x = \\frac{-\\square \\pm \\sqrt{\\square^2-4\\square\\square}}{2\\square}', NULL, 1, 1, 11, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(263, 'Plantillas', NULL, 'ax^2 + \\square x + \\square = 0', NULL, 1, 1, 12, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(264, 'Plantillas', NULL, 'y = \\square x + \\square', NULL, 1, 1, 13, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(265, 'Plantillas', NULL, 'y - \\square = \\square(x - \\square)', NULL, 1, 1, 14, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(266, 'Plantillas', NULL, 'd = \\sqrt{(\\square-\\square)^2 + (\\square-\\square)^2}', NULL, 1, 1, 15, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(267, 'Plantillas', NULL, 'm = \\frac{\\square - \\square}{\\square - \\square}', NULL, 1, 1, 16, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(268, 'Plantillas', NULL, 'A = \\pi \\square^2', NULL, 1, 1, 17, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(269, 'Plantillas', NULL, 'V = \\frac{4}{3}\\pi \\square^3', NULL, 1, 1, 18, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(270, 'Plantillas', NULL, 'V = \\pi \\square^2 \\square', NULL, 1, 1, 19, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(271, 'Plantillas', NULL, 'V = \\frac{1}{3}\\pi \\square^2 \\square', NULL, 1, 1, 20, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(272, 'Plantillas', NULL, 'V = \\square \\cdot \\square \\cdot \\square', NULL, 1, 1, 21, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(273, 'Plantillas', NULL, 'a^2 + b^2 = c^2', NULL, 0, 1, 22, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(274, 'Plantillas', NULL, 'F = \\square \\cdot \\square', NULL, 1, 1, 23, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(275, 'Plantillas', NULL, 'E = \\frac{1}{2}\\square \\cdot \\square^2', NULL, 1, 1, 24, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(276, 'Plantillas', NULL, 'E = \\square \\cdot \\square \\cdot \\square', NULL, 1, 1, 25, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(277, 'Plantillas', NULL, 'v = \\square + \\square \\cdot \\square', NULL, 1, 1, 26, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(278, 'Plantillas', NULL, 'x = \\square + \\square \\cdot \\square + \\frac{1}{2}\\square \\cdot \\square^2', NULL, 1, 1, 27, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(279, 'Fórmulas', NULL, 'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}', NULL, 0, 1, 0, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(280, 'Fórmulas', NULL, 'ax^2 + bx + c = 0', NULL, 0, 1, 1, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(281, 'Fórmulas', NULL, 'y = mx + b', NULL, 0, 1, 2, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(282, 'Fórmulas', NULL, 'y - y_1 = m(x - x_1)', NULL, 0, 1, 3, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(283, 'Fórmulas', NULL, 'd = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}', NULL, 0, 1, 4, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(284, 'Fórmulas', NULL, 'm = \\frac{y_2 - y_1}{x_2 - x_1}', NULL, 0, 1, 5, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(285, 'Fórmulas', NULL, 'A = \\pi r^2', NULL, 0, 1, 6, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(286, 'Fórmulas', NULL, 'C = 2\\pi r', NULL, 0, 1, 7, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(287, 'Fórmulas', NULL, 'V = \\frac{4}{3}\\pi r^3', NULL, 0, 1, 8, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(288, 'Fórmulas', NULL, 'A = 4\\pi r^2', NULL, 0, 1, 9, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(289, 'Fórmulas', NULL, 'V = \\pi r^2 h', NULL, 0, 1, 10, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(290, 'Fórmulas', NULL, 'A = 2\\pi r^2 + 2\\pi r h', NULL, 0, 1, 11, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(291, 'Fórmulas', NULL, 'V = \\frac{1}{3}\\pi r^2 h', NULL, 0, 1, 12, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(292, 'Fórmulas', NULL, 'A = \\pi r (r + \\sqrt{h^2 + r^2})', NULL, 0, 1, 13, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(293, 'Fórmulas', NULL, 'V = lwh', NULL, 0, 1, 14, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(294, 'Fórmulas', NULL, 'A = 2(lw + lh + wh)', NULL, 0, 1, 15, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(295, 'Fórmulas', NULL, 'V = \\frac{1}{3}Bh', NULL, 0, 1, 16, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(296, 'Fórmulas', NULL, 'a^2 + b^2 = c^2', NULL, 0, 1, 17, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(297, 'Fórmulas', NULL, '\\sin^2\\theta + \\cos^2\\theta = 1', NULL, 0, 1, 18, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(298, 'Fórmulas', NULL, '\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}', NULL, 0, 1, 19, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(299, 'Fórmulas', NULL, '\\sin(\\alpha \\pm \\beta) = \\sin\\alpha\\cos\\beta \\pm \\cos\\alpha\\sin\\beta', NULL, 0, 1, 20, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(300, 'Fórmulas', NULL, '\\cos(\\alpha \\pm \\beta) = \\cos\\alpha\\cos\\beta \\mp \\sin\\alpha\\sin\\beta', NULL, 0, 1, 21, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(301, 'Fórmulas', NULL, '\\sin(2\\theta) = 2\\sin\\theta\\cos\\theta', NULL, 0, 1, 22, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(302, 'Fórmulas', NULL, '\\cos(2\\theta) = \\cos^2\\theta - \\sin^2\\theta', NULL, 0, 1, 23, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(303, 'Fórmulas', NULL, '\\sin^2\\theta = \\frac{1-\\cos(2\\theta)}{2}', NULL, 0, 1, 24, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(304, 'Fórmulas', NULL, '\\cos^2\\theta = \\frac{1+\\cos(2\\theta)}{2}', NULL, 0, 1, 25, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(305, 'Física', NULL, 'F = ma', NULL, 0, 1, 0, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(306, 'Física', NULL, 'E = mc^2', NULL, 0, 1, 1, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(307, 'Física', NULL, 'E = \\frac{1}{2}mv^2', NULL, 0, 1, 2, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(308, 'Física', NULL, 'E = mgh', NULL, 0, 1, 3, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(309, 'Física', NULL, 'v = v_0 + at', NULL, 0, 1, 4, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(310, 'Física', NULL, 'x = x_0 + v_0t + \\frac{1}{2}at^2', NULL, 0, 1, 5, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(311, 'Física', NULL, 'v^2 = v_0^2 + 2a(x-x_0)', NULL, 0, 1, 6, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(312, 'Física', NULL, 'F = G\\frac{m_1 m_2}{r^2}', NULL, 0, 1, 7, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(313, 'Física', NULL, 'F = k\\frac{q_1 q_2}{r^2}', NULL, 0, 1, 8, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(314, 'Física', NULL, 'E = \\frac{F}{q}', NULL, 0, 1, 9, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(315, 'Física', NULL, 'V = \\frac{W}{q}', NULL, 0, 1, 10, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(316, 'Física', NULL, 'P = IV', NULL, 0, 1, 11, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(317, 'Física', NULL, 'R = \\frac{V}{I}', NULL, 0, 1, 12, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(318, 'Física', NULL, 'P = \\frac{V^2}{R}', NULL, 0, 1, 13, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(319, 'Física', NULL, 'P = I^2 R', NULL, 0, 1, 14, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(320, 'Física', NULL, '\\lambda = \\frac{v}{f}', NULL, 0, 1, 15, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(321, 'Física', NULL, 'E = hf', NULL, 0, 1, 16, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(322, 'Física', NULL, 'p = mv', NULL, 0, 1, 17, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(323, 'Física', NULL, '\\Delta p = F\\Delta t', NULL, 0, 1, 18, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(324, 'Física', NULL, 'W = Fd', NULL, 0, 1, 19, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(325, 'Física', NULL, 'P = \\frac{W}{t}', NULL, 0, 1, 20, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(326, 'Física', NULL, '\\tau = rF\\sin\\theta', NULL, 0, 1, 21, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(327, 'Física', NULL, 'L = I\\omega', NULL, 0, 1, 22, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(328, 'Física', NULL, 'K = \\frac{1}{2}I\\omega^2', NULL, 0, 1, 23, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(329, 'Física', NULL, 'T = 2\\pi\\sqrt{\\frac{L}{g}}', NULL, 0, 1, 24, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(330, 'Física', NULL, 'T = 2\\pi\\sqrt{\\frac{m}{k}}', NULL, 0, 1, 25, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(331, 'Física', NULL, 'f = \\frac{1}{T}', NULL, 0, 1, 26, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(332, 'Física', NULL, '\\omega = 2\\pi f', NULL, 0, 1, 27, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(333, 'Física', NULL, 'PV = nRT', NULL, 0, 1, 28, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(334, 'Física', NULL, 'Q = mc\\Delta T', NULL, 0, 1, 29, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(335, 'Física', NULL, '\\Delta S = \\frac{Q}{T}', NULL, 0, 1, 30, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(336, 'Física', NULL, '\\eta = \\frac{W_{out}}{Q_{in}}', NULL, 0, 1, 31, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(337, 'Física', NULL, '\\Delta U = Q - W', NULL, 0, 1, 32, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(338, 'Geometría', NULL, 'A = \\frac{1}{2}bh', NULL, 0, 1, 0, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(339, 'Geometría', NULL, 'A = \\frac{1}{2}ab\\sin C', NULL, 0, 1, 1, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(340, 'Geometría', NULL, 'A = \\sqrt{s(s-a)(s-b)(s-c)}', NULL, 0, 1, 2, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(341, 'Geometría', NULL, 's = \\frac{a+b+c}{2}', NULL, 0, 1, 3, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(342, 'Geometría', NULL, 'A = \\frac{1}{2}(a+b)h', NULL, 0, 1, 4, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(343, 'Geometría', NULL, 'A = \\frac{n}{2} \\cdot r^2 \\sin\\left(\\frac{360°}{n}\\right)', NULL, 0, 1, 5, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(344, 'Geometría', NULL, 'V = \\frac{1}{3}Ah', NULL, 0, 1, 6, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(345, 'Geometría', NULL, 'V = \\frac{4}{3}\\pi r^3', NULL, 0, 1, 7, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(346, 'Geometría', NULL, 'A = 4\\pi r^2', NULL, 0, 1, 8, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(347, 'Geometría', NULL, 'V = \\pi r^2 h', NULL, 0, 1, 9, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(348, 'Geometría', NULL, 'A_{lateral} = 2\\pi r h', NULL, 0, 1, 10, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(349, 'Geometría', NULL, 'A_{total} = 2\\pi r(r+h)', NULL, 0, 1, 11, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(350, 'Geometría', NULL, 'V = \\frac{1}{3}\\pi r^2 h', NULL, 0, 1, 12, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(351, 'Geometría', NULL, 'A_{lateral} = \\pi r l', NULL, 0, 1, 13, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(352, 'Geometría', NULL, 'A_{total} = \\pi r(r+l)', NULL, 0, 1, 14, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(353, 'Geometría', NULL, 'l = \\sqrt{r^2 + h^2}', NULL, 0, 1, 15, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(354, 'Geometría', NULL, 'V = lwh', NULL, 0, 1, 16, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(355, 'Geometría', NULL, 'A = 2(lw + lh + wh)', NULL, 0, 1, 17, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(356, 'Geometría', NULL, 'V = a^3', NULL, 0, 1, 18, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(357, 'Geometría', NULL, 'A = 6a^2', NULL, 0, 1, 19, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(358, 'Geometría', NULL, 'd = a\\sqrt{3}', NULL, 0, 1, 20, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(359, 'Geometría', NULL, 'V = \\frac{1}{3}a^2 h', NULL, 0, 1, 21, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(360, 'Geometría', NULL, 'A_{lateral} = 2al', NULL, 0, 1, 22, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(361, 'Geometría', NULL, 'A_{total} = a^2 + 2al', NULL, 0, 1, 23, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(362, 'Geometría', NULL, 'l = \\sqrt{a^2 + h^2}', NULL, 0, 1, 24, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(363, 'Geometría', NULL, '\\theta = \\frac{s}{r}', NULL, 0, 1, 25, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(364, 'Geometría', NULL, 'A = \\frac{1}{2}r^2\\theta', NULL, 0, 1, 26, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(365, 'Geometría', NULL, 'A = \\frac{1}{2}r^2(\\theta - \\sin\\theta)', NULL, 0, 1, 27, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(366, 'IPN 2020', NULL, 'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}', NULL, 0, 1, 0, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(367, 'IPN 2020', NULL, 'ax^2 + bx + c = 0', NULL, 0, 1, 1, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(368, 'IPN 2020', NULL, '(a+b)^2 = a^2 + 2ab + b^2', NULL, 0, 1, 2, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(369, 'IPN 2020', NULL, '(a-b)^2 = a^2 - 2ab + b^2', NULL, 0, 1, 3, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(370, 'IPN 2020', NULL, '(a+b)(a-b) = a^2 - b^2', NULL, 0, 1, 4, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(371, 'IPN 2020', NULL, '(a+b)^3 = a^3 + 3a^2b + 3ab^2 + b^3', NULL, 0, 1, 5, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(372, 'IPN 2020', NULL, '(a-b)^3 = a^3 - 3a^2b + 3ab^2 - b^3', NULL, 0, 1, 6, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(373, 'IPN 2020', NULL, 'a^3 + b^3 = (a+b)(a^2-ab+b^2)', NULL, 0, 1, 7, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(374, 'IPN 2020', NULL, 'a^3 - b^3 = (a-b)(a^2+ab+b^2)', NULL, 0, 1, 8, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(375, 'IPN 2020', NULL, '\\log_a(xy) = \\log_a x + \\log_a y', NULL, 0, 1, 9, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(376, 'IPN 2020', NULL, '\\log_a\\left(\\frac{x}{y}\\right) = \\log_a x - \\log_a y', NULL, 0, 1, 10, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(377, 'IPN 2020', NULL, '\\log_a(x^n) = n\\log_a x', NULL, 0, 1, 11, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(378, 'IPN 2020', NULL, '\\log_a a = 1', NULL, 0, 1, 12, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(379, 'IPN 2020', NULL, '\\log_a 1 = 0', NULL, 0, 1, 13, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(380, 'IPN 2020', NULL, 'a^m \\cdot a^n = a^{m+n}', NULL, 0, 1, 14, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(381, 'IPN 2020', NULL, '\\frac{a^m}{a^n} = a^{m-n}', NULL, 0, 1, 15, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(382, 'IPN 2020', NULL, '(a^m)^n = a^{mn}', NULL, 0, 1, 16, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(383, 'IPN 2020', NULL, 'a^{-n} = \\frac{1}{a^n}', NULL, 0, 1, 17, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(384, 'IPN 2020', NULL, 'a^{1/n} = \\sqrt[n]{a}', NULL, 0, 1, 18, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(385, 'IPN 2020', NULL, '\\sqrt{a} \\cdot \\sqrt{b} = \\sqrt{ab}', NULL, 0, 1, 19, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(386, 'IPN 2020', NULL, '\\frac{\\sqrt{a}}{\\sqrt{b}} = \\sqrt{\\frac{a}{b}}', NULL, 0, 1, 20, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(387, 'IPN 2020', NULL, 'a^2 + b^2 = c^2', NULL, 0, 1, 21, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(388, 'IPN 2020', NULL, 'd = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}', NULL, 0, 1, 22, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(389, 'IPN 2020', NULL, 'm = \\frac{y_2 - y_1}{x_2 - x_1}', NULL, 0, 1, 23, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(390, 'IPN 2020', NULL, 'y = mx + b', NULL, 0, 1, 24, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(391, 'IPN 2020', NULL, 'y - y_1 = m(x - x_1)', NULL, 0, 1, 25, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(392, 'IPN 2020', NULL, 'A = \\pi r^2', NULL, 0, 1, 26, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(393, 'IPN 2020', NULL, 'C = 2\\pi r = \\pi d', NULL, 0, 1, 27, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(394, 'IPN 2020', NULL, 'A = \\frac{1}{2}bh', NULL, 0, 1, 28, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(395, 'IPN 2020', NULL, 'P = 2(l + w)', NULL, 0, 1, 29, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(396, 'IPN 2020', NULL, 'A = lw', NULL, 0, 1, 30, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(397, 'IPN 2020', NULL, 'A = s^2', NULL, 0, 1, 31, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(398, 'IPN 2020', NULL, 'P = 4s', NULL, 0, 1, 32, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(399, 'IPN 2020', NULL, 'V = lwh', NULL, 0, 1, 33, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(400, 'IPN 2020', NULL, 'A = 2(lw + lh + wh)', NULL, 0, 1, 34, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(401, 'IPN 2020', NULL, 'V = s^3', NULL, 0, 1, 35, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(402, 'IPN 2020', NULL, 'A = 6s^2', NULL, 0, 1, 36, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(403, 'IPN 2020', NULL, 'V = \\pi r^2 h', NULL, 0, 1, 37, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(404, 'IPN 2020', NULL, 'A = 2\\pi r(r + h)', NULL, 0, 1, 38, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(405, 'IPN 2020', NULL, 'V = \\frac{4}{3}\\pi r^3', NULL, 0, 1, 39, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(406, 'IPN 2020', NULL, 'A = 4\\pi r^2', NULL, 0, 1, 40, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(407, 'IPN 2020', NULL, 'V = \\frac{1}{3}\\pi r^2 h', NULL, 0, 1, 41, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(408, 'IPN 2020', NULL, 'A_{lateral} = \\pi r l', NULL, 0, 1, 42, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(409, 'IPN 2020', NULL, 'A_{total} = \\pi r(r + l)', NULL, 0, 1, 43, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(410, 'IPN 2020', NULL, '\\sin^2\\theta + \\cos^2\\theta = 1', NULL, 0, 1, 44, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(411, 'IPN 2020', NULL, '\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}', NULL, 0, 1, 45, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(412, 'IPN 2020', NULL, '\\cot\\theta = \\frac{\\cos\\theta}{\\sin\\theta}', NULL, 0, 1, 46, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(413, 'IPN 2020', NULL, '\\sec\\theta = \\frac{1}{\\cos\\theta}', NULL, 0, 1, 47, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(414, 'IPN 2020', NULL, '\\csc\\theta = \\frac{1}{\\sin\\theta}', NULL, 0, 1, 48, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(415, 'IPN 2020', NULL, '\\sin(\\alpha \\pm \\beta) = \\sin\\alpha\\cos\\beta \\pm \\cos\\alpha\\sin\\beta', NULL, 0, 1, 49, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(416, 'IPN 2020', NULL, '\\cos(\\alpha \\pm \\beta) = \\cos\\alpha\\cos\\beta \\mp \\sin\\alpha\\sin\\beta', NULL, 0, 1, 50, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(417, 'IPN 2020', NULL, '\\tan(\\alpha \\pm \\beta) = \\frac{\\tan\\alpha \\pm \\tan\\beta}{1 \\mp \\tan\\alpha\\tan\\beta}', NULL, 0, 1, 51, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(418, 'IPN 2020', NULL, '\\sin(2\\theta) = 2\\sin\\theta\\cos\\theta', NULL, 0, 1, 52, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(419, 'IPN 2020', NULL, '\\cos(2\\theta) = \\cos^2\\theta - \\sin^2\\theta', NULL, 0, 1, 53, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(420, 'IPN 2020', NULL, '\\cos(2\\theta) = 2\\cos^2\\theta - 1', NULL, 0, 1, 54, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(421, 'IPN 2020', NULL, '\\cos(2\\theta) = 1 - 2\\sin^2\\theta', NULL, 0, 1, 55, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(422, 'IPN 2020', NULL, '\\tan(2\\theta) = \\frac{2\\tan\\theta}{1 - \\tan^2\\theta}', NULL, 0, 1, 56, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(423, 'IPN 2020', NULL, '\\sin^2\\theta = \\frac{1-\\cos(2\\theta)}{2}', NULL, 0, 1, 57, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(424, 'IPN 2020', NULL, '\\cos^2\\theta = \\frac{1+\\cos(2\\theta)}{2}', NULL, 0, 1, 58, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(425, 'IPN 2020', NULL, '\\sin\\left(\\frac{\\theta}{2}\\right) = \\pm\\sqrt{\\frac{1-\\cos\\theta}{2}}', NULL, 0, 1, 59, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(426, 'IPN 2020', NULL, '\\cos\\left(\\frac{\\theta}{2}\\right) = \\pm\\sqrt{\\frac{1+\\cos\\theta}{2}}', NULL, 0, 1, 60, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(427, 'IPN 2020', NULL, 'a^2 = b^2 + c^2 - 2bc\\cos A', NULL, 0, 1, 61, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(428, 'IPN 2020', NULL, '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R', NULL, 0, 1, 62, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(429, 'IPN 2020', NULL, 'F = ma', NULL, 0, 1, 63, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(430, 'IPN 2020', NULL, 'W = Fd', NULL, 0, 1, 64, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(431, 'IPN 2020', NULL, 'P = \\frac{W}{t}', NULL, 0, 1, 65, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(432, 'IPN 2020', NULL, 'E_c = \\frac{1}{2}mv^2', NULL, 0, 1, 66, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(433, 'IPN 2020', NULL, 'E_p = mgh', NULL, 0, 1, 67, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(434, 'IPN 2020', NULL, 'E_m = E_c + E_p', NULL, 0, 1, 68, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(435, 'IPN 2020', NULL, 'v = v_0 + at', NULL, 0, 1, 69, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(436, 'IPN 2020', NULL, 'x = x_0 + v_0t + \\frac{1}{2}at^2', NULL, 0, 1, 70, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(437, 'IPN 2020', NULL, 'v^2 = v_0^2 + 2a(x-x_0)', NULL, 0, 1, 71, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(438, 'IPN 2020', NULL, 'x = \\frac{v_0 + v}{2}t', NULL, 0, 1, 72, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(439, 'IPN 2020', NULL, 'p = mv', NULL, 0, 1, 73, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(440, 'IPN 2020', NULL, '\\Delta p = F\\Delta t', NULL, 0, 1, 74, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(441, 'IPN 2020', NULL, 'F_c = \\frac{mv^2}{r}', NULL, 0, 1, 75, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(442, 'IPN 2020', NULL, 'F_g = G\\frac{m_1 m_2}{r^2}', NULL, 0, 1, 76, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(443, 'IPN 2020', NULL, '\\tau = rF\\sin\\theta', NULL, 0, 1, 77, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(444, 'IPN 2020', NULL, 'L = I\\omega', NULL, 0, 1, 78, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(445, 'IPN 2020', NULL, 'K = \\frac{1}{2}I\\omega^2', NULL, 0, 1, 79, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(446, 'IPN 2020', NULL, 'PV = nRT', NULL, 0, 1, 80, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(447, 'IPN 2020', NULL, '\\frac{P_1V_1}{T_1} = \\frac{P_2V_2}{T_2}', NULL, 0, 1, 81, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(448, 'IPN 2020', NULL, 'Q = mc\\Delta T', NULL, 0, 1, 82, '2025-11-13 22:46:50', '2025-11-13 22:46:50');
INSERT INTO `formulas` (`id`, `categoria`, `nombre`, `latex`, `descripcion`, `tiene_placeholders`, `activo`, `orden`, `created_at`, `updated_at`) VALUES
(449, 'IPN 2020', NULL, 'Q = mL', NULL, 0, 1, 83, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(450, 'IPN 2020', NULL, '\\Delta U = Q - W', NULL, 0, 1, 84, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(451, 'IPN 2020', NULL, '\\eta = \\frac{W_{out}}{Q_{in}}', NULL, 0, 1, 85, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(452, 'IPN 2020', NULL, '\\Delta S = \\frac{Q}{T}', NULL, 0, 1, 86, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(453, 'IPN 2020', NULL, 'F = k\\frac{q_1 q_2}{r^2}', NULL, 0, 1, 87, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(454, 'IPN 2020', NULL, 'E = \\frac{F}{q}', NULL, 0, 1, 88, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(455, 'IPN 2020', NULL, 'E = k\\frac{q}{r^2}', NULL, 0, 1, 89, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(456, 'IPN 2020', NULL, 'V = \\frac{W}{q}', NULL, 0, 1, 90, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(457, 'IPN 2020', NULL, 'V = k\\frac{q}{r}', NULL, 0, 1, 91, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(458, 'IPN 2020', NULL, 'C = \\frac{Q}{V}', NULL, 0, 1, 92, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(459, 'IPN 2020', NULL, 'C = \\frac{\\varepsilon_0 A}{d}', NULL, 0, 1, 93, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(460, 'IPN 2020', NULL, 'U = \\frac{1}{2}CV^2', NULL, 0, 1, 94, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(461, 'IPN 2020', NULL, 'I = \\frac{Q}{t}', NULL, 0, 1, 95, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(462, 'IPN 2020', NULL, 'V = IR', NULL, 0, 1, 96, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(463, 'IPN 2020', NULL, 'P = IV', NULL, 0, 1, 97, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(464, 'IPN 2020', NULL, 'P = I^2R', NULL, 0, 1, 98, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(465, 'IPN 2020', NULL, 'P = \\frac{V^2}{R}', NULL, 0, 1, 99, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(466, 'IPN 2020', NULL, 'R = \\rho\\frac{L}{A}', NULL, 0, 1, 100, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(467, 'IPN 2020', NULL, 'R_{eq} = R_1 + R_2 + \\cdots + R_n', NULL, 0, 1, 101, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(468, 'IPN 2020', NULL, '\\frac{1}{R_{eq}} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\cdots + \\frac{1}{R_n}', NULL, 0, 1, 102, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(469, 'IPN 2020', NULL, 'F = qvB\\sin\\theta', NULL, 0, 1, 103, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(470, 'IPN 2020', NULL, 'F = ILB\\sin\\theta', NULL, 0, 1, 104, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(471, 'IPN 2020', NULL, 'B = \\frac{\\mu_0 I}{2\\pi r}', NULL, 0, 1, 105, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(472, 'IPN 2020', NULL, '\\Phi = BA\\cos\\theta', NULL, 0, 1, 106, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(473, 'IPN 2020', NULL, '\\varepsilon = -N\\frac{\\Delta\\Phi}{\\Delta t}', NULL, 0, 1, 107, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(474, 'IPN 2020', NULL, 'v = \\lambda f', NULL, 0, 1, 108, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(475, 'IPN 2020', NULL, 'f = \\frac{1}{T}', NULL, 0, 1, 109, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(476, 'IPN 2020', NULL, '\\omega = 2\\pi f', NULL, 0, 1, 110, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(477, 'IPN 2020', NULL, 'v = \\frac{d}{t}', NULL, 0, 1, 111, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(478, 'IPN 2020', NULL, 'E = hf', NULL, 0, 1, 112, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(479, 'IPN 2020', NULL, '\\lambda = \\frac{h}{p}', NULL, 0, 1, 113, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(480, 'IPN 2020', NULL, 'T = 2\\pi\\sqrt{\\frac{L}{g}}', NULL, 0, 1, 114, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(481, 'IPN 2020', NULL, 'T = 2\\pi\\sqrt{\\frac{m}{k}}', NULL, 0, 1, 115, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(482, 'IPN 2020', NULL, 'f = \\frac{1}{2\\pi}\\sqrt{\\frac{k}{m}}', NULL, 0, 1, 116, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(483, 'IPN 2020', NULL, 'n = \\frac{m}{M}', NULL, 0, 1, 117, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(484, 'IPN 2020', NULL, 'M = \\frac{m}{n}', NULL, 0, 1, 118, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(485, 'IPN 2020', NULL, 'C = \\frac{n}{V}', NULL, 0, 1, 119, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(486, 'IPN 2020', NULL, 'M_1V_1 = M_2V_2', NULL, 0, 1, 120, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(487, 'IPN 2020', NULL, '\\% = \\frac{m_{soluto}}{m_{solución}} \\times 100', NULL, 0, 1, 121, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(488, 'IPN 2020', NULL, 'ppm = \\frac{m_{soluto}}{m_{solución}} \\times 10^6', NULL, 0, 1, 122, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(489, 'IPN 2020', NULL, 'X_i = \\frac{n_i}{n_{total}}', NULL, 0, 1, 123, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(490, 'IPN 2020', NULL, 'P_i = X_i P_{total}', NULL, 0, 1, 124, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(491, 'IPN 2020', NULL, 'pH = -\\log[H^+]', NULL, 0, 1, 125, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(492, 'IPN 2020', NULL, 'pOH = -\\log[OH^-]', NULL, 0, 1, 126, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(493, 'IPN 2020', NULL, 'pH + pOH = 14', NULL, 0, 1, 127, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(494, 'IPN 2020', NULL, 'K_w = [H^+][OH^-] = 1.0 \\times 10^{-14}', NULL, 0, 1, 128, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(495, 'IPN 2020', NULL, 'K_a = \\frac{[H^+][A^-]}{[HA]}', NULL, 0, 1, 129, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(496, 'IPN 2020', NULL, 'K_b = \\frac{[OH^-][BH^+]}{[B]}', NULL, 0, 1, 130, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(497, 'IPN 2020', NULL, 'K_a \\cdot K_b = K_w', NULL, 0, 1, 131, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(498, 'IPN 2020', NULL, 'pH = pK_a + \\log\\left(\\frac{[A^-]}{[HA]}\\right)', NULL, 0, 1, 132, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(499, 'IPN 2020', NULL, 'K_c = \\frac{[C]^c[D]^d}{[A]^a[B]^b}', NULL, 0, 1, 133, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(500, 'IPN 2020', NULL, 'K_p = K_c(RT)^{\\Delta n}', NULL, 0, 1, 134, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(501, 'IPN 2020', NULL, '\\Delta H = \\sum H_{products} - \\sum H_{reactants}', NULL, 0, 1, 135, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(502, 'IPN 2020', NULL, '\\Delta G = \\Delta H - T\\Delta S', NULL, 0, 1, 136, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(503, 'IPN 2020', NULL, '\\Delta G = -RT\\ln K', NULL, 0, 1, 137, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(504, 'IPN 2020', NULL, '\\Delta G^0 = -nFE^0', NULL, 0, 1, 138, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(505, 'IPN 2020', NULL, 'q = mc\\Delta T', NULL, 0, 1, 139, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(506, 'IPN 2020', NULL, '\\Delta S = \\frac{q_{rev}}{T}', NULL, 0, 1, 140, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(507, 'IPN 2020', NULL, 'E^0 = E^0_{cathode} - E^0_{anode}', NULL, 0, 1, 141, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(508, 'IPN 2020', NULL, 'E = E^0 - \\frac{RT}{nF}\\ln Q', NULL, 0, 1, 142, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(509, 'IPN 2020', NULL, 'E = E^0 - \\frac{0.0592}{n}\\log Q', NULL, 0, 1, 143, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(510, 'IPN 2020', NULL, '\\Delta G = -nFE', NULL, 0, 1, 144, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(511, 'IPN 2020', NULL, 'Q = It', NULL, 0, 1, 145, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(512, 'IPN 2020', NULL, 'm = \\frac{MQ}{nF}', NULL, 0, 1, 146, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(513, 'IPN 2020', NULL, '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}', NULL, 0, 1, 147, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(514, 'IPN 2020', NULL, '\\sum_{i=1}^{n} i^2 = \\frac{n(n+1)(2n+1)}{6}', NULL, 0, 1, 148, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(515, 'IPN 2020', NULL, '\\sum_{i=1}^{n} i^3 = \\left[\\frac{n(n+1)}{2}\\right]^2', NULL, 0, 1, 149, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(516, 'IPN 2020', NULL, 'a_n = a_1 + (n-1)d', NULL, 0, 1, 150, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(517, 'IPN 2020', NULL, 'S_n = \\frac{n}{2}(a_1 + a_n)', NULL, 0, 1, 151, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(518, 'IPN 2020', NULL, 'a_n = a_1 r^{n-1}', NULL, 0, 1, 152, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(519, 'IPN 2020', NULL, 'S_n = a_1\\frac{1-r^n}{1-r}', NULL, 0, 1, 153, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(520, 'IPN 2020', NULL, 'S_\\infty = \\frac{a_1}{1-r}', NULL, 0, 1, 154, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(521, 'IPN 2020', NULL, '\\binom{n}{r} = \\frac{n!}{r!(n-r)!}', NULL, 0, 1, 155, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(522, 'IPN 2020', NULL, 'P(n,r) = \\frac{n!}{(n-r)!}', NULL, 0, 1, 156, '2025-11-13 22:46:50', '2025-11-13 22:46:50'),
(523, 'IPN 2020', NULL, 'n! = n \\cdot (n-1) \\cdot (n-2) \\cdots 2 \\cdot 1', NULL, 0, 1, 157, '2025-11-13 22:46:50', '2025-11-13 22:46:50');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `gastos_fijos`
--

CREATE TABLE `gastos_fijos` (
  `id` int(11) NOT NULL,
  `plantilla_id` int(11) DEFAULT NULL,
  `fecha` date NOT NULL,
  `hora` time DEFAULT NULL,
  `categoria` varchar(120) NOT NULL,
  `descripcion` varchar(500) DEFAULT NULL,
  `proveedor` varchar(180) DEFAULT NULL,
  `frecuencia` enum('Diario','Semanal','Quincenal','Mensual','Bimestral','Semestral','Anual') NOT NULL DEFAULT 'Mensual',
  `metodo` enum('Efectivo','Transferencia','Tarjeta') NOT NULL DEFAULT 'Efectivo',
  `importe` decimal(10,2) NOT NULL DEFAULT 0.00,
  `estatus` enum('Pagado','Pendiente','Vencido') NOT NULL DEFAULT 'Pendiente',
  `calendar_event_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `gastos_fijos`
--

INSERT INTO `gastos_fijos` (`id`, `plantilla_id`, `fecha`, `hora`, `categoria`, `descripcion`, `proveedor`, `frecuencia`, `metodo`, `importe`, `estatus`, `calendar_event_id`, `created_at`, `updated_at`) VALUES
(52, NULL, '2025-09-26', '00:00:00', 'RENTA', '', 'CIRO', 'Mensual', 'Efectivo', 2000.00, 'Pagado', 88, '2025-09-26 20:31:21', '2025-09-26 20:31:21');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `gastos_fijos_plantillas`
--

CREATE TABLE `gastos_fijos_plantillas` (
  `id` int(11) NOT NULL,
  `categoria` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `proveedor` varchar(255) DEFAULT NULL,
  `frecuencia` enum('Diario','Semanal','Quincenal','Mensual','Bimestral','Semestral','Anual') NOT NULL DEFAULT 'Mensual',
  `importe_default` decimal(10,2) DEFAULT 0.00,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `metodo` enum('Efectivo','Transferencia','Tarjeta') NOT NULL DEFAULT 'Efectivo',
  `monto_sugerido` decimal(12,2) NOT NULL DEFAULT 0.00,
  `last_used_at` datetime DEFAULT NULL,
  `dia_pago` tinyint(4) DEFAULT NULL,
  `hora_preferida` time DEFAULT NULL,
  `recordar_minutos` int(11) NOT NULL DEFAULT 30,
  `auto_evento` tinyint(1) NOT NULL DEFAULT 1,
  `auto_instanciar` tinyint(1) NOT NULL DEFAULT 1,
  `cadencia_anchor` date DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `gastos_fijos_plantillas`
--

INSERT INTO `gastos_fijos_plantillas` (`id`, `categoria`, `descripcion`, `proveedor`, `frecuencia`, `importe_default`, `activo`, `created_at`, `updated_at`, `metodo`, `monto_sugerido`, `last_used_at`, `dia_pago`, `hora_preferida`, `recordar_minutos`, `auto_evento`, `auto_instanciar`, `cadencia_anchor`, `fecha_inicio`) VALUES
(6, 'Renta local', NULL, 'Propietario', 'Mensual', 0.00, 1, '2025-09-09 22:49:30', '2025-09-12 18:26:25', 'Transferencia', 4500.00, '2025-09-12 11:46:23', 1, '09:00:00', 60, 1, 0, '2025-09-01', NULL),
(7, 'Luz', NULL, 'CFE', 'Bimestral', 0.00, 1, '2025-09-09 22:49:30', '2025-09-12 18:26:23', 'Transferencia', 1500.00, '2025-09-09 17:10:56', 10, '09:00:00', 60, 1, 0, '2025-10-01', NULL),
(8, 'Internet', NULL, 'ISP', 'Mensual', 0.00, 1, '2025-09-09 22:49:30', '2025-09-12 18:26:24', 'Transferencia', 750.00, '2025-09-09 17:10:54', 10, '09:00:00', 60, 1, 0, '2025-09-01', NULL),
(9, 'Canva', '', 'Canva', 'Mensual', 0.00, 1, '2025-09-09 22:49:30', '2025-09-15 18:40:43', 'Tarjeta', 750.00, '2025-09-12 12:22:54', NULL, '00:50:00', 60, 1, 1, '2025-09-01', '2025-08-12'),
(10, 'Mant code', NULL, 'DevOps', 'Mensual', 0.00, 1, '2025-09-09 22:49:30', '2025-09-12 18:26:25', 'Transferencia', 500.00, '2025-09-09 17:11:20', 10, '09:00:00', 60, 1, 0, '2025-09-01', NULL),
(11, 'Sueldo', '', 'Nómina', 'Mensual', 0.00, 1, '2025-09-09 22:49:30', '2025-09-26 18:30:42', 'Transferencia', 10000.00, '2025-09-09 17:11:52', 15, '10:00:00', 60, 1, 1, '2025-09-01', '2025-08-27'),
(12, 'Insumos', NULL, 'Varios', 'Mensual', 0.00, 1, '2025-09-09 22:49:30', '2025-09-12 18:26:21', 'Efectivo', 500.00, '2025-09-09 17:10:51', 10, '09:00:00', 60, 1, 0, '2025-09-01', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `gastos_variables`
--

CREATE TABLE `gastos_variables` (
  `id` int(11) NOT NULL,
  `unidades` int(11) NOT NULL DEFAULT 1,
  `producto` varchar(200) NOT NULL,
  `descripcion` varchar(500) DEFAULT NULL,
  `entidad` varchar(180) DEFAULT NULL,
  `valor_unitario` decimal(10,2) NOT NULL DEFAULT 0.00,
  `metodo` enum('Efectivo','Transferencia','Tarjeta') NOT NULL DEFAULT 'Efectivo',
  `importe` decimal(10,2) NOT NULL DEFAULT 0.00,
  `estatus` enum('Pagado','Pendiente','Vencido') NOT NULL DEFAULT 'Pendiente',
  `calendar_event_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `gastos_variables`
--

INSERT INTO `gastos_variables` (`id`, `unidades`, `producto`, `descripcion`, `entidad`, `valor_unitario`, `metodo`, `importe`, `estatus`, `calendar_event_id`, `created_at`, `updated_at`) VALUES
(7, 2, 'sillas', '', 'TONY', 250.00, 'Efectivo', 500.00, 'Pagado', 89, '2025-09-26 20:36:01', '2025-09-26 20:36:01'),
(8, 1, 'material', '', 'comex', 800.00, 'Efectivo', 800.00, 'Pagado', 90, '2025-09-26 20:38:38', '2025-09-26 20:38:38'),
(9, 1, 'puerta', 'reparacion de puerta', 'carpintero', 950.00, 'Efectivo', 950.00, 'Pagado', 91, '2025-09-26 20:41:13', '2025-09-26 20:41:13');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ingresos`
--

CREATE TABLE `ingresos` (
  `id` int(11) NOT NULL,
  `estudiante_id` int(11) DEFAULT NULL,
  `alumno_nombre` varchar(200) DEFAULT NULL,
  `asesor_preregistro_id` bigint(20) UNSIGNED DEFAULT NULL,
  `asesor_nombre` varchar(180) DEFAULT NULL,
  `curso` varchar(200) NOT NULL,
  `fecha` date NOT NULL,
  `hora` time DEFAULT NULL,
  `metodo` enum('Efectivo','Transferencia','Tarjeta') NOT NULL DEFAULT 'Efectivo',
  `importe` decimal(10,2) NOT NULL DEFAULT 0.00,
  `estatus` enum('Pagado','Pendiente','Vencido') NOT NULL DEFAULT 'Pagado',
  `comprobante_id` int(11) DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `descripcion` varchar(500) DEFAULT NULL,
  `calendar_event_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ingresos`
--

INSERT INTO `ingresos` (`id`, `estudiante_id`, `alumno_nombre`, `asesor_preregistro_id`, `asesor_nombre`, `curso`, `fecha`, `hora`, `metodo`, `importe`, `estatus`, `comprobante_id`, `notas`, `descripcion`, `calendar_event_id`, `created_at`, `updated_at`) VALUES
(25, 67, 'Miguel Angel Cruz vargas', NULL, 'Carlos Pérez', 'EEAU', '2025-08-11', NULL, 'Efectivo', 1500.00, 'Pagado', 9, NULL, NULL, NULL, '2025-10-10 23:16:38', '2025-10-10 23:18:55'),
(26, 69, 'Jessica Fernandez', NULL, 'Carlos Pérez', 'EEAU', '2025-08-11', NULL, 'Efectivo', 1200.00, 'Pagado', 11, NULL, NULL, NULL, '2025-10-10 23:16:38', '2025-10-10 23:18:55'),
(27, 70, 'Emir cruz zamora', NULL, 'Kélvil Valentín Gómez Ramírez', 'EEAU', '2025-08-11', NULL, 'Transferencia', 0.00, 'Pendiente', 12, NULL, NULL, NULL, '2025-10-10 23:16:38', '2025-10-10 23:18:55'),
(28, 71, 'Gerardo  Arcilla', NULL, 'Carlos Pérez', 'EEAU', '2025-08-12', NULL, 'Efectivo', 10500.00, 'Pagado', 13, NULL, NULL, NULL, '2025-10-10 23:16:38', '2025-10-10 23:18:55'),
(29, 72, 'Andres Saul Canelo', NULL, 'Carlos Pérez', 'EEAU', '2025-08-12', NULL, 'Transferencia', 5500.00, 'Pagado', 14, NULL, NULL, NULL, '2025-10-10 23:16:38', '2025-10-10 23:18:55'),
(30, 73, 'Juan  Perez Del Rio ', NULL, 'Carlos Pérez', 'EEAU', '2025-08-21', NULL, 'Efectivo', 10500.00, 'Pagado', 15, '{\"asistencia\":{\"estado\":\"Impartida\",\"nota\":\"\",\"fecha\":\"2025-12-10 11:16:58\"}}', NULL, NULL, '2025-10-10 23:16:38', '2025-12-10 17:16:59'),
(31, NULL, 'alumno de prueba', 4, 'Jair Iván Martínez Palacios', 'asesoria de prueba', '2025-12-11', '12:35:00', 'Efectivo', 450.00, 'Pagado', NULL, '{\"asistencia\":{\"estado\":\"realizada\",\"fecha_confirmacion\":\"2025-12-10T18:24:21.836Z\",\"confirmado_por\":6,\"observaciones\":null}}', NULL, 92, '2025-12-10 17:36:19', '2025-12-10 18:24:21');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pagos_asesores`
--

CREATE TABLE `pagos_asesores` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `asesor_preregistro_id` bigint(20) UNSIGNED DEFAULT NULL,
  `asesor_nombre` varchar(255) DEFAULT NULL,
  `tipo_servicio` enum('curso','asesoria','otro') NOT NULL,
  `servicio_detalle` varchar(255) DEFAULT NULL,
  `id_pago_ref` bigint(20) DEFAULT NULL,
  `monto_base` decimal(10,2) NOT NULL DEFAULT 0.00,
  `horas_trabajadas` decimal(6,2) DEFAULT NULL,
  `honorarios_comision` decimal(10,2) NOT NULL DEFAULT 0.00,
  `ingreso_final` decimal(10,2) NOT NULL DEFAULT 0.00,
  `fecha_pago` date NOT NULL,
  `metodo_pago` varchar(100) DEFAULT NULL,
  `nota` text DEFAULT NULL,
  `status` enum('Pendiente','Pagado','Cancelado') NOT NULL DEFAULT 'Pagado',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `pagos_asesores`
--

INSERT INTO `pagos_asesores` (`id`, `asesor_preregistro_id`, `asesor_nombre`, `tipo_servicio`, `servicio_detalle`, `id_pago_ref`, `monto_base`, `horas_trabajadas`, `honorarios_comision`, `ingreso_final`, `fecha_pago`, `metodo_pago`, `nota`, `status`, `created_at`, `updated_at`) VALUES
(8, 4, 'Jair Iván Martínez Palacios', 'curso', '', NULL, 0.00, 6.00, 280.00, 1680.00, '2025-09-26', 'Efectivo', '', 'Pagado', '2025-09-26 20:37:04', '2025-09-26 20:37:04');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `presupuestos_mensuales`
--

CREATE TABLE `presupuestos_mensuales` (
  `id` int(11) NOT NULL,
  `mes` char(7) NOT NULL,
  `monto` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `presupuestos_mensuales`
--

INSERT INTO `presupuestos_mensuales` (`id`, `mes`, `monto`, `created_at`, `updated_at`) VALUES
(21, '2025-09', 6000.00, '2025-09-26 19:41:12', '2025-09-26 22:23:42');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `quizzes`
--

CREATE TABLE `quizzes` (
  `id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `id_area` int(11) DEFAULT NULL,
  `materia` varchar(255) DEFAULT NULL,
  `puntos_max` int(11) NOT NULL DEFAULT 100,
  `peso_calificacion` decimal(5,2) NOT NULL DEFAULT 0.00,
  `fecha_limite` datetime DEFAULT NULL,
  `grupos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`grupos`)),
  `max_intentos` int(11) DEFAULT NULL,
  `requiere_revision` tinyint(1) NOT NULL DEFAULT 0,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `publicado` tinyint(1) NOT NULL DEFAULT 0,
  `creado_por` int(11) DEFAULT NULL,
  `time_limit_min` int(11) DEFAULT NULL,
  `passing_score` int(11) DEFAULT NULL,
  `shuffle_questions` tinyint(1) NOT NULL DEFAULT 0,
  `visible_desde` datetime DEFAULT NULL,
  `visible_hasta` datetime DEFAULT NULL,
  `imagen_portada` varchar(255) DEFAULT NULL,
  `recursos_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`recursos_json`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `quizzes`
--

INSERT INTO `quizzes` (`id`, `titulo`, `descripcion`, `id_area`, `materia`, `puntos_max`, `peso_calificacion`, `fecha_limite`, `grupos`, `max_intentos`, `requiere_revision`, `activo`, `publicado`, `creado_por`, `time_limit_min`, `passing_score`, `shuffle_questions`, `visible_desde`, `visible_hasta`, `imagen_portada`, `recursos_json`, `created_at`, `updated_at`) VALUES
(4, 'Español y redacción indirecta (IA · 5 preguntas)', 'Lee cada pregunta y selecciona la respuesta correcta. Este quiz cubre contenido general del área.', 1, 'Español y redacción indirecta', 100, 0.00, NULL, '[\"V1\"]', NULL, 0, 1, 1, 21, 60, NULL, 1, NULL, NULL, NULL, NULL, '2025-12-16 17:02:26', '2025-12-17 20:44:03'),
(5, 'Matemáticas y pensamiento analítico (IA · 5 preguntas)', 'Lee cada pregunta y selecciona la respuesta correcta. Este quiz cubre contenido general del área.', 2, 'Matemáticas y pensamiento analítico', 100, 0.00, NULL, '[\"V1\"]', NULL, 0, 1, 1, 21, 60, NULL, 1, NULL, NULL, NULL, NULL, '2025-12-16 17:13:25', '2025-12-17 19:51:50'),
(6, 'Habilidades transversales (IA · 5 preguntas)', 'Lee cada pregunta y selecciona la respuesta correcta. Este quiz cubre contenido general del área.', 3, 'Habilidades transversales', 100, 0.00, NULL, '[\"V1\"]', NULL, 0, 1, 0, 21, 60, NULL, 1, NULL, NULL, NULL, NULL, '2025-12-16 19:09:46', NULL),
(8, 'Lengua extranjera (IA · 5 p)', 'Quiz generado con IA sobre: Lengua extranjera. Nivel: intermedio.', 4, 'Lengua extranjera', 100, 0.00, NULL, '[\"V1\"]', NULL, 0, 1, 0, 21, 60, NULL, 1, NULL, NULL, NULL, NULL, '2025-12-17 19:13:25', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `quizzes_intentos`
--

CREATE TABLE `quizzes_intentos` (
  `id` int(11) NOT NULL,
  `id_quiz` int(11) NOT NULL,
  `id_estudiante` int(11) NOT NULL,
  `puntaje` int(11) NOT NULL,
  `intent_number` int(11) NOT NULL,
  `tiempo_segundos` int(11) DEFAULT NULL,
  `total_preguntas` int(11) DEFAULT NULL,
  `correctas` int(11) DEFAULT NULL,
  `detalle_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`detalle_json`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `quizzes_intentos`
--

INSERT INTO `quizzes_intentos` (`id`, `id_quiz`, `id_estudiante`, `puntaje`, `intent_number`, `tiempo_segundos`, `total_preguntas`, `correctas`, `detalle_json`, `created_at`) VALUES
(9, 4, 67, 80, 1, 103, 5, 4, NULL, '2025-12-17 20:47:46'),
(10, 4, 67, 60, 2, 257, 5, 3, NULL, '2025-12-17 20:52:29'),
(11, 5, 67, 25, 1, 457, 5, 1, NULL, '2025-12-18 18:35:54'),
(12, 5, 67, 50, 2, 169, 5, 2, NULL, '2025-12-18 18:40:41'),
(13, 5, 67, 50, 3, 71, 5, 2, NULL, '2025-12-18 18:43:48'),
(14, 5, 67, 25, 4, 116, 5, 1, NULL, '2025-12-18 18:50:07'),
(15, 5, 67, 50, 5, 79, 5, 2, NULL, '2025-12-18 19:02:59'),
(16, 5, 67, 25, 6, 82, 5, 1, NULL, '2025-12-18 19:12:47'),
(17, 5, 67, 0, 7, 445, 5, NULL, NULL, '2025-12-18 20:24:53'),
(18, 5, 67, 0, 8, 972, 5, NULL, NULL, '2025-12-18 20:44:51'),
(19, 4, 67, 25, 3, 47, 5, 1, NULL, '2025-12-23 19:25:51'),
(20, 4, 67, 75, 4, 30, 5, 3, NULL, '2025-12-23 19:34:13');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `quizzes_materias`
--

CREATE TABLE `quizzes_materias` (
  `id` int(11) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `slug` varchar(120) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `quizzes_preguntas`
--

CREATE TABLE `quizzes_preguntas` (
  `id` int(11) NOT NULL,
  `id_quiz` int(11) NOT NULL,
  `orden` int(11) NOT NULL DEFAULT 1,
  `enunciado` text NOT NULL,
  `tipo` enum('opcion_multiple','multi_respuesta','verdadero_falso','respuesta_corta') DEFAULT 'opcion_multiple',
  `puntos` int(11) NOT NULL DEFAULT 1,
  `activa` tinyint(1) NOT NULL DEFAULT 1,
  `metadata_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata_json`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `quizzes_preguntas`
--

INSERT INTO `quizzes_preguntas` (`id`, `id_quiz`, `orden`, `enunciado`, `tipo`, `puntos`, `activa`, `metadata_json`, `created_at`, `updated_at`) VALUES
(21, 4, 1, '¿Cuál de las siguientes palabras está escrita correctamente?', 'opcion_multiple', 1, 1, NULL, '2025-12-16 17:02:26', NULL),
(22, 4, 2, 'Elige el sinónimo más adecuado para la palabra \'rápido\'.', 'opcion_multiple', 1, 1, NULL, '2025-12-16 17:02:26', NULL),
(23, 4, 3, 'En la oración \'El perro corre rápido por el parque\', ¿qué tipo de palabra es \'perro\'?', 'opcion_multiple', 1, 1, NULL, '2025-12-16 17:02:26', NULL),
(24, 4, 4, 'Lee el siguiente texto: \'María compró manzanas rojas en el mercado. Después, fue a su casa y preparó un pastel con ellas.\' ¿Es cierto que María compró peras?', 'verdadero_falso', 1, 1, NULL, '2025-12-16 17:02:26', NULL),
(25, 4, 5, '¿Cuál es la función principal de un sustantivo en una oración?', 'respuesta_corta', 1, 1, NULL, '2025-12-16 17:02:26', NULL),
(31, 6, 1, 'Un estudiante universitario tiene tres exámenes finales programados para el mismo día: Matemáticas a las 8:00 AM, Física a las 11:00 AM y Química a las 2:00 PM. Además, debe entregar un proyecto de equipo de Historia a las 5:00 PM. Se da cuenta de que no ha estudiado lo suficiente para Física y Química, y el proyecto de Historia requiere una revisión final importante. ¿Cuál de las siguientes estrategias demuestra una aplicación efectiva de habilidades de resolución de problemas y gestión del tiempo?', 'opcion_multiple', 1, 1, NULL, '2025-12-16 19:09:46', NULL),
(32, 6, 2, 'Durante un proyecto de equipo, uno de los miembros, Ana, no ha entregado su parte a tiempo y no responde a los mensajes. El plazo final se acerca. ¿Cuál es la acción más efectiva para aplicar habilidades de comunicación y trabajo en equipo en esta situación?', 'opcion_multiple', 1, 1, NULL, '2025-12-16 19:09:46', NULL),
(33, 6, 3, 'Sofía está a cargo de organizar un evento universitario y tiene una lista de 15 tareas por hacer en las próximas dos semanas. Se siente abrumada y no sabe por dónde empezar. Para aplicar una gestión del tiempo efectiva y proactiva, ¿qué debería hacer primero?', 'opcion_multiple', 1, 1, NULL, '2025-12-16 19:09:46', NULL),
(34, 6, 4, 'Un equipo de desarrollo de software ha estado trabajando durante meses en un proyecto con un cronograma y especificaciones detalladas. A dos semanas de la fecha de entrega, el cliente solicita un cambio fundamental en una de las funcionalidades clave debido a una nueva tendencia del mercado. Afirmar que la mejor estrategia para el equipo es apegarse estrictamente al plan original para evitar retrasos y costos adicionales, sin considerar la nueva solicitud del cliente, demuestra una adecuada aplicación de la habilidad de adaptabilidad.', 'verdadero_falso', 1, 1, NULL, '2025-12-16 19:09:46', NULL),
(35, 6, 5, 'En una reunión de equipo para un proyecto grupal, la discusión se desvía constantemente del tema principal y nadie toma el control para reencauzarla. ¿Qué acción específica podría tomar un miembro del equipo para demostrar iniciativa y ayudar a la productividad del grupo?', 'respuesta_corta', 1, 1, NULL, '2025-12-16 19:09:46', NULL),
(41, 8, 1, 'Read the following email and answer the question:Subject: Project Update Meeting ReminderHi Team,Just a quick reminder that our project update meeting is scheduled for tomorrow, October 26th, at 10:00 AM in Conference Room B. Please come prepared to discuss your progress on tasks 3.1 and 3.2. We also need to finalize the client presentation agenda.Best regards,SarahWhat is the primary purpose of Sarah\'s email?', 'opcion_multiple', 1, 1, NULL, '2025-12-17 19:13:25', NULL),
(42, 8, 2, 'Choose the correct phrase to complete the sentence:If I ______ more time, I ______ that advanced English course last semester.', 'opcion_multiple', 1, 1, NULL, '2025-12-17 19:13:25', NULL),
(43, 8, 3, 'Select the most appropriate phrasal verb to complete the sentence:The new manager decided to ______ with the old policies and introduce a completely new approach.', 'opcion_multiple', 1, 1, NULL, '2025-12-17 19:13:25', NULL),
(44, 8, 4, 'The sentence \'She is good at playing the piano\' correctly uses the preposition \'at\' to express skill.', 'verdadero_falso', 1, 1, NULL, '2025-12-17 19:13:25', NULL),
(45, 8, 5, 'Rewrite the following sentence in the passive voice: \'The students will complete the assignment by Friday.\'', 'respuesta_corta', 1, 1, NULL, '2025-12-17 19:13:25', NULL),
(46, 5, 1, 'Un terreno rectangular tiene un área de 120 m². Si el largo del terreno excede al ancho en 7 metros, ¿cuáles son las dimensiones del terreno?', 'opcion_multiple', 1, 1, NULL, '2025-12-17 19:51:50', NULL),
(47, 5, 2, 'Una escalera de 10 metros de longitud está apoyada contra una pared vertical. Si la base de la escalera se encuentra a 6 metros de la pared en el suelo, ¿a qué altura sobre el suelo alcanza la escalera la pared? (Fórmula del Teorema de Pitágoras: a² + b² = c²)', 'opcion_multiple', 1, 1, NULL, '2025-12-17 19:51:50', NULL),
(48, 5, 3, 'Un artículo tiene un precio original de $800. Primero se le aplica un descuento del 15% y luego se le añade un impuesto del 10% sobre el precio ya descontado. ¿Cuál es el precio final del artículo?', 'opcion_multiple', 1, 1, NULL, '2025-12-17 19:51:50', NULL),
(49, 5, 4, 'La gráfica de una función cuadrática de la forma y = ax² + bx + c siempre es una parábola que abre hacia arriba si el coeficiente \'a\' es positivo (a > 0).', 'verdadero_falso', 1, 1, NULL, '2025-12-17 19:51:50', NULL),
(50, 5, 5, 'Desarrolla la expresión algebraica (2x + 3)² utilizando la fórmula del binomio al cuadrado (a + b)² = a² + 2ab + b².', 'respuesta_corta', 1, 1, NULL, '2025-12-17 19:51:50', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `quizzes_preguntas_materias`
--

CREATE TABLE `quizzes_preguntas_materias` (
  `id` int(11) NOT NULL,
  `id_pregunta` int(11) NOT NULL,
  `id_materia` int(11) NOT NULL,
  `peso` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `quizzes_preguntas_opciones`
--

CREATE TABLE `quizzes_preguntas_opciones` (
  `id` int(11) NOT NULL,
  `id_pregunta` int(11) NOT NULL,
  `texto` text NOT NULL,
  `es_correcta` tinyint(1) NOT NULL DEFAULT 0,
  `orden` int(11) DEFAULT NULL,
  `retroalimentacion` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `quizzes_preguntas_opciones`
--

INSERT INTO `quizzes_preguntas_opciones` (`id`, `id_pregunta`, `texto`, `es_correcta`, `orden`, `retroalimentacion`, `created_at`) VALUES
(61, 21, 'Desición', 0, 1, NULL, '2025-12-16 17:02:26'),
(62, 21, 'Exámen', 0, 2, NULL, '2025-12-16 17:02:26'),
(63, 21, 'Lápiz', 1, 3, NULL, '2025-12-16 17:02:26'),
(64, 21, 'Sínceramente', 0, 4, NULL, '2025-12-16 17:02:26'),
(65, 22, 'Lento', 0, 1, NULL, '2025-12-16 17:02:26'),
(66, 22, 'Veloz', 1, 2, NULL, '2025-12-16 17:02:26'),
(67, 22, 'Pesado', 0, 3, NULL, '2025-12-16 17:02:26'),
(68, 22, 'Tranquilo', 0, 4, NULL, '2025-12-16 17:02:26'),
(69, 23, 'Verbo', 0, 1, NULL, '2025-12-16 17:02:26'),
(70, 23, 'Adjetivo', 0, 2, NULL, '2025-12-16 17:02:26'),
(71, 23, 'Sustantivo', 1, 3, NULL, '2025-12-16 17:02:26'),
(72, 23, 'Adverbio', 0, 4, NULL, '2025-12-16 17:02:26'),
(73, 24, 'Verdadero', 0, 1, NULL, '2025-12-16 17:02:26'),
(74, 24, 'Falso', 1, 2, NULL, '2025-12-16 17:02:26'),
(75, 25, 'Nombrar personas, animales, cosas o ideas.', 1, 1, NULL, '2025-12-16 17:02:26'),
(91, 31, 'Estudiar intensivamente Física y Química la noche anterior, ignorando el proyecto de Historia.', 0, 1, NULL, '2025-12-16 19:09:46'),
(92, 31, 'Pedir una prórroga para el examen de Física y enfocarse en Matemáticas y Química, y luego en el proyecto, sin consultar al profesor previamente.', 0, 2, NULL, '2025-12-16 19:09:46'),
(93, 31, 'Priorizar las tareas según su impacto en la calificación final y la fecha límite, asignar bloques de tiempo específicos para estudiar cada materia y revisar el proyecto, y comunicar a su equipo de Historia su disponibilidad para la revisión final, buscando optimizar el tiempo restante.', 1, 3, NULL, '2025-12-16 19:09:46'),
(94, 31, 'Priorizar los exámenes según su dificultad percibida y el peso en la calificación, delegar la revisión del proyecto de Historia a un compañero y estudiar lo restante.', 0, 4, NULL, '2025-12-16 19:09:46'),
(95, 32, 'Asumir que Ana no está interesada y terminar su parte del trabajo sin consultarla, para evitar retrasos.', 0, 1, NULL, '2025-12-16 19:09:46'),
(96, 32, 'Enviar un mensaje al profesor explicando la situación y pidiendo una extensión sin informar a Ana o al resto del equipo.', 0, 2, NULL, '2025-12-16 19:09:46'),
(97, 32, 'Contactar a Ana por múltiples canales (mensaje, llamada, correo) con un tono de preocupación, ofreciendo ayuda y preguntando si hay algún problema que impida su avance, y luego evaluar con el equipo los pasos a seguir.', 1, 3, NULL, '2025-12-16 19:09:46'),
(98, 32, 'Confrontar a Ana públicamente en la siguiente reunión del equipo para exigir una explicación y que entregue su parte.', 0, 4, NULL, '2025-12-16 19:09:46'),
(99, 33, 'Empezar por las tareas más fáciles para sentir que avanza rápidamente y reducir la sensación de agobio.', 0, 1, NULL, '2025-12-16 19:09:46'),
(100, 33, 'Esperar a que su supervisor le indique qué tareas son las más urgentes para no cometer errores.', 0, 2, NULL, '2025-12-16 19:09:46'),
(101, 33, 'Crear una lista priorizada de tareas utilizando un método como la Matriz de Eisenhower (Urgente/Importante), estimar el tiempo para cada una y agendarlas en su calendario.', 1, 3, NULL, '2025-12-16 19:09:46'),
(102, 33, 'Pedir ayuda a sus compañeros para que hagan algunas de sus tareas sin una planificación previa de la distribución.', 0, 4, NULL, '2025-12-16 19:09:46'),
(103, 34, 'Verdadero', 0, 1, NULL, '2025-12-16 19:09:46'),
(104, 34, 'Falso', 1, 2, NULL, '2025-12-16 19:09:46'),
(105, 35, 'Intervenir para recordar el objetivo de la reunión y proponer un plan para retomar el enfoque.', 1, 1, NULL, '2025-12-16 19:09:46'),
(121, 41, 'To announce a new project.', 0, 1, NULL, '2025-12-17 19:13:25'),
(122, 41, 'To remind the team about an upcoming meeting.', 1, 2, NULL, '2025-12-17 19:13:25'),
(123, 41, 'To ask for task completion reports.', 0, 3, NULL, '2025-12-17 19:13:25'),
(124, 41, 'To reschedule a client presentation.', 0, 4, NULL, '2025-12-17 19:13:25'),
(125, 42, 'had / would have taken', 0, 1, NULL, '2025-12-17 19:13:25'),
(126, 42, 'have / will take', 0, 2, NULL, '2025-12-17 19:13:25'),
(127, 42, 'had had / would have taken', 1, 3, NULL, '2025-12-17 19:13:25'),
(128, 42, 'would have / had taken', 0, 4, NULL, '2025-12-17 19:13:25'),
(129, 43, 'do away', 1, 1, NULL, '2025-12-17 19:13:25'),
(130, 43, 'put up', 0, 2, NULL, '2025-12-17 19:13:25'),
(131, 43, 'get over', 0, 3, NULL, '2025-12-17 19:13:25'),
(132, 43, 'take off', 0, 4, NULL, '2025-12-17 19:13:25'),
(133, 44, 'Verdadero', 1, 1, NULL, '2025-12-17 19:13:25'),
(134, 44, 'Falso', 0, 2, NULL, '2025-12-17 19:13:25'),
(135, 45, 'The assignment will be completed by the students by Friday.', 1, 1, NULL, '2025-12-17 19:13:25'),
(136, 46, '8 m de ancho y 15 m de largo', 1, 1, NULL, '2025-12-17 19:51:50'),
(137, 46, '10 m de ancho y 12 m de largo', 0, 2, NULL, '2025-12-17 19:51:50'),
(138, 46, '6 m de ancho y 20 m de largo', 0, 3, NULL, '2025-12-17 19:51:50'),
(139, 46, '9 m de ancho y 13 m de largo', 0, 4, NULL, '2025-12-17 19:51:50'),
(140, 47, '7 metros', 0, 1, NULL, '2025-12-17 19:51:50'),
(141, 47, '8 metros', 1, 2, NULL, '2025-12-17 19:51:50'),
(142, 47, '9 metros', 0, 3, NULL, '2025-12-17 19:51:50'),
(143, 47, '10 metros', 0, 4, NULL, '2025-12-17 19:51:50'),
(144, 48, '$680', 0, 1, NULL, '2025-12-17 19:51:50'),
(145, 48, '$720', 0, 2, NULL, '2025-12-17 19:51:50'),
(146, 48, '$748', 1, 3, NULL, '2025-12-17 19:51:50'),
(147, 48, '$760', 0, 4, NULL, '2025-12-17 19:51:50'),
(148, 49, 'Verdadero', 1, 1, NULL, '2025-12-17 19:51:50'),
(149, 49, 'Falso', 0, 2, NULL, '2025-12-17 19:51:50'),
(150, 50, '4x² + 12x + 9', 1, 1, NULL, '2025-12-17 19:51:50');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `quizzes_sesiones`
--

CREATE TABLE `quizzes_sesiones` (
  `id` char(36) NOT NULL,
  `id_quiz` int(11) NOT NULL,
  `id_estudiante` int(11) NOT NULL,
  `intento_num` int(11) NOT NULL,
  `estado` enum('en_progreso','finalizado','cancelado') DEFAULT 'en_progreso',
  `started_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `finished_at` timestamp NULL DEFAULT NULL,
  `tiempo_limite_seg` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `metadata_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata_json`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `quizzes_sesiones`
--

INSERT INTO `quizzes_sesiones` (`id`, `id_quiz`, `id_estudiante`, `intento_num`, `estado`, `started_at`, `finished_at`, `tiempo_limite_seg`, `created_at`, `metadata_json`) VALUES
('187a5100-2caf-4887-b55f-634a4258fd7f', 5, 67, 8, 'finalizado', '2025-12-18 20:28:38', '2025-12-18 20:44:51', 3600, '2025-12-18 14:28:38', NULL),
('19ef7e97-1908-4f5e-83c0-919e5a0eac6d', 4, 67, 3, 'finalizado', '2025-12-23 19:25:04', '2025-12-23 19:25:51', 3600, '2025-12-23 13:25:04', NULL),
('266acd2b-8604-416e-9ead-24ad22b3fafe', 5, 67, 2, 'finalizado', '2025-12-18 18:37:52', '2025-12-18 18:40:41', 3600, '2025-12-18 12:37:52', NULL),
('3015eaee-9b45-4528-9832-5f0a543d8f09', 5, 67, 4, 'finalizado', '2025-12-18 18:48:11', '2025-12-18 18:50:07', 3600, '2025-12-18 12:48:11', NULL),
('4252a3d4-d1df-4c74-84b2-af37d85d84a3', 5, 67, 6, 'finalizado', '2025-12-18 19:11:25', '2025-12-18 19:12:47', 3600, '2025-12-18 13:11:25', NULL),
('5beaa9df-e230-4ae7-a286-48e83983fed5', 4, 67, 2, 'finalizado', '2025-12-17 20:48:12', '2025-12-17 20:52:29', 3600, '2025-12-17 14:48:12', NULL),
('66c7aeb6-88e9-4ce1-84f8-9bd586de536f', 5, 67, 5, 'finalizado', '2025-12-18 19:01:39', '2025-12-18 19:02:59', 3600, '2025-12-18 13:01:39', NULL),
('7e72ce80-e0b8-459a-8a9f-34ec18bce54f', 4, 67, 3, 'en_progreso', '2025-12-23 19:23:33', NULL, 3600, '2025-12-23 13:23:33', NULL),
('85032148-36f1-4360-804e-0043bde60463', 5, 67, 1, 'finalizado', '2025-12-18 18:28:17', '2025-12-18 18:35:54', 3600, '2025-12-18 12:28:17', NULL),
('cd2f86f0-d3ba-4174-bb04-aee4d31b5e41', 4, 67, 1, 'finalizado', '2025-12-17 20:46:03', '2025-12-17 20:47:46', 3600, '2025-12-17 14:46:03', NULL),
('d77dc666-83cd-4539-a850-5db4e5cdffba', 5, 67, 3, 'finalizado', '2025-12-18 18:42:38', '2025-12-18 18:43:48', 3600, '2025-12-18 12:42:38', NULL),
('e64260ae-7246-4195-98af-aa425b2c1515', 5, 67, 7, 'finalizado', '2025-12-18 20:17:28', '2025-12-18 20:24:53', 3600, '2025-12-18 14:17:28', NULL),
('ff240335-e103-4e42-8a29-758accf6d384', 4, 67, 4, 'finalizado', '2025-12-23 19:33:44', '2025-12-23 19:34:13', 3600, '2025-12-23 13:33:44', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `quizzes_sesiones_respuestas`
--

CREATE TABLE `quizzes_sesiones_respuestas` (
  `id` int(11) NOT NULL,
  `id_sesion` char(36) NOT NULL,
  `id_pregunta` int(11) NOT NULL,
  `id_opcion` int(11) DEFAULT NULL,
  `valor_texto` text DEFAULT NULL,
  `correcta` tinyint(1) DEFAULT NULL,
  `tiempo_ms` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `calificacion_status` enum('pending','graded','manual_review') DEFAULT 'graded' COMMENT 'Estado de calificación de la respuesta',
  `calificacion_metodo` varchar(50) DEFAULT NULL COMMENT 'Método usado: exacta, palabras_clave, ia, revisar',
  `calificacion_confianza` int(11) DEFAULT NULL COMMENT 'Nivel de confianza 0-100',
  `calificada_at` timestamp NULL DEFAULT NULL COMMENT 'Fecha de calificación',
  `revisada_por` int(11) DEFAULT NULL COMMENT 'ID del usuario asesor que revisó manualmente',
  `notas_revision` text DEFAULT NULL COMMENT 'Notas del asesor sobre la revisión',
  `revisada_at` timestamp NULL DEFAULT NULL COMMENT 'Fecha de revisión manual'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Respuestas de estudiantes a quizzes con soporte para calificación automática';

--
-- Volcado de datos para la tabla `quizzes_sesiones_respuestas`
--

INSERT INTO `quizzes_sesiones_respuestas` (`id`, `id_sesion`, `id_pregunta`, `id_opcion`, `valor_texto`, `correcta`, `tiempo_ms`, `created_at`, `calificacion_status`, `calificacion_metodo`, `calificacion_confianza`, `calificada_at`, `revisada_por`, `notas_revision`, `revisada_at`) VALUES
(26, 'cd2f86f0-d3ba-4174-bb04-aee4d31b5e41', 21, 63, NULL, 1, 31394, '2025-12-17 20:47:46', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(27, 'cd2f86f0-d3ba-4174-bb04-aee4d31b5e41', 22, 66, NULL, 1, 20486, '2025-12-17 20:47:46', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(28, 'cd2f86f0-d3ba-4174-bb04-aee4d31b5e41', 23, 71, NULL, 1, 18484, '2025-12-17 20:47:46', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(29, 'cd2f86f0-d3ba-4174-bb04-aee4d31b5e41', 24, 74, NULL, 1, 6391, '2025-12-17 20:47:46', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(30, 'cd2f86f0-d3ba-4174-bb04-aee4d31b5e41', 25, NULL, 'no se', 0, 2899, '2025-12-17 20:47:46', 'graded', 'manual', 100, '2025-12-17 21:53:46', NULL, NULL, '2025-12-17 21:53:46'),
(31, '5beaa9df-e230-4ae7-a286-48e83983fed5', 21, 63, NULL, 1, 1995, '2025-12-17 20:52:29', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(32, '5beaa9df-e230-4ae7-a286-48e83983fed5', 22, 66, NULL, 1, 4927, '2025-12-17 20:52:29', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(33, '5beaa9df-e230-4ae7-a286-48e83983fed5', 23, 70, NULL, 0, 2371, '2025-12-17 20:52:29', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(34, '5beaa9df-e230-4ae7-a286-48e83983fed5', 24, 74, NULL, 1, 10312, '2025-12-17 20:52:29', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(35, '5beaa9df-e230-4ae7-a286-48e83983fed5', 25, NULL, 'indicar quien hace la accion', 0, 9517, '2025-12-17 20:52:29', 'graded', 'manual', 100, '2025-12-18 17:05:42', NULL, NULL, '2025-12-18 17:05:42'),
(36, '85032148-36f1-4360-804e-0043bde60463', 46, 137, NULL, 0, 22216, '2025-12-18 18:35:54', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(37, '85032148-36f1-4360-804e-0043bde60463', 47, 140, NULL, 0, 13782, '2025-12-18 18:35:54', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(38, '85032148-36f1-4360-804e-0043bde60463', 48, 147, NULL, 0, 9398, '2025-12-18 18:35:54', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(39, '85032148-36f1-4360-804e-0043bde60463', 49, 148, NULL, 1, 15273, '2025-12-18 18:35:54', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(40, '85032148-36f1-4360-804e-0043bde60463', 50, NULL, '2x2+6x+9', 0, 362996, '2025-12-18 18:35:54', 'graded', 'palabras_clave', 100, '2025-12-18 18:35:56', NULL, NULL, NULL),
(41, '266acd2b-8604-416e-9ead-24ad22b3fafe', 46, 136, NULL, 1, 1855, '2025-12-18 18:40:41', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(42, '266acd2b-8604-416e-9ead-24ad22b3fafe', 47, 140, NULL, 0, 1376, '2025-12-18 18:40:41', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(43, '266acd2b-8604-416e-9ead-24ad22b3fafe', 48, 147, NULL, 0, 1208, '2025-12-18 18:40:41', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(44, '266acd2b-8604-416e-9ead-24ad22b3fafe', 49, 148, NULL, 1, 26747, '2025-12-18 18:40:41', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(45, '266acd2b-8604-416e-9ead-24ad22b3fafe', 50, NULL, '2x razi', 0, 128719, '2025-12-18 18:40:41', 'graded', 'palabras_clave', 100, '2025-12-18 18:40:43', NULL, NULL, NULL),
(46, 'd77dc666-83cd-4539-a850-5db4e5cdffba', 46, 138, NULL, 0, 4330, '2025-12-18 18:43:48', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(47, 'd77dc666-83cd-4539-a850-5db4e5cdffba', 47, 141, NULL, 1, 2075, '2025-12-18 18:43:48', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(48, 'd77dc666-83cd-4539-a850-5db4e5cdffba', 48, 147, NULL, 0, 1304, '2025-12-18 18:43:48', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(49, 'd77dc666-83cd-4539-a850-5db4e5cdffba', 49, 148, NULL, 1, 53893, '2025-12-18 18:43:48', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(50, 'd77dc666-83cd-4539-a850-5db4e5cdffba', 50, NULL, 'no se ', 0, 5565, '2025-12-18 18:43:48', 'graded', 'palabras_clave', 100, '2025-12-18 18:43:50', NULL, NULL, NULL),
(51, '3015eaee-9b45-4528-9832-5f0a543d8f09', 46, 139, NULL, 0, 1175, '2025-12-18 18:50:07', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(52, '3015eaee-9b45-4528-9832-5f0a543d8f09', 47, 143, NULL, 0, 1311, '2025-12-18 18:50:07', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(53, '3015eaee-9b45-4528-9832-5f0a543d8f09', 48, 147, NULL, 0, 1261, '2025-12-18 18:50:07', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(54, '3015eaee-9b45-4528-9832-5f0a543d8f09', 49, 148, NULL, 1, 56395, '2025-12-18 18:50:07', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(55, '3015eaee-9b45-4528-9832-5f0a543d8f09', 50, NULL, '4²+6x+9', 0, 52191, '2025-12-18 18:50:07', 'graded', 'palabras_clave', 100, '2025-12-18 18:50:09', NULL, NULL, NULL),
(56, '66c7aeb6-88e9-4ce1-84f8-9bd586de536f', 46, 136, NULL, 1, 2438, '2025-12-18 19:02:58', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(57, '66c7aeb6-88e9-4ce1-84f8-9bd586de536f', 47, 140, NULL, 0, 1840, '2025-12-18 19:02:58', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(58, '66c7aeb6-88e9-4ce1-84f8-9bd586de536f', 48, 147, NULL, 0, 1445, '2025-12-18 19:02:58', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(59, '66c7aeb6-88e9-4ce1-84f8-9bd586de536f', 49, 148, NULL, 1, 6336, '2025-12-18 19:02:58', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(60, '66c7aeb6-88e9-4ce1-84f8-9bd586de536f', 50, NULL, '4x²+12x+9', 0, 62795, '2025-12-18 19:02:58', 'graded', 'palabras_clave', 100, '2025-12-18 19:03:01', NULL, NULL, NULL),
(61, '4252a3d4-d1df-4c74-84b2-af37d85d84a3', 46, 139, NULL, 0, 1375, '2025-12-18 19:12:47', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(62, '4252a3d4-d1df-4c74-84b2-af37d85d84a3', 47, 140, NULL, 0, 1488, '2025-12-18 19:12:47', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(63, '4252a3d4-d1df-4c74-84b2-af37d85d84a3', 48, 147, NULL, 0, 1954, '2025-12-18 19:12:47', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(64, '4252a3d4-d1df-4c74-84b2-af37d85d84a3', 49, 148, NULL, 1, 26517, '2025-12-18 19:12:47', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(65, '4252a3d4-d1df-4c74-84b2-af37d85d84a3', 50, NULL, 'no se', 0, 3833, '2025-12-18 19:12:47', 'graded', 'palabras_clave', 100, '2025-12-18 19:12:49', NULL, NULL, NULL),
(66, 'e64260ae-7246-4195-98af-aa425b2c1515', 50, NULL, 'x = (-b ± √(b² - 4ac)) \nx = -----------------\n         2a', 0, 420588, '2025-12-18 20:24:53', 'graded', 'palabras_clave', 100, '2025-12-18 20:24:55', NULL, NULL, NULL),
(67, '187a5100-2caf-4887-b55f-634a4258fd7f', 46, 137, NULL, 0, 3015, '2025-12-18 20:44:51', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(68, '187a5100-2caf-4887-b55f-634a4258fd7f', 47, 140, NULL, 0, 901, '2025-12-18 20:44:51', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(69, '187a5100-2caf-4887-b55f-634a4258fd7f', 48, 147, NULL, 0, 2140, '2025-12-18 20:44:51', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(70, '187a5100-2caf-4887-b55f-634a4258fd7f', 49, 149, NULL, 0, 1154, '2025-12-18 20:44:51', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(71, '187a5100-2caf-4887-b55f-634a4258fd7f', 50, NULL, '     √a\n     ─── = √(a/b)\n     √b', 0, 950538, '2025-12-18 20:44:51', 'graded', 'palabras_clave', 100, '2025-12-18 20:44:53', NULL, NULL, NULL),
(72, '19ef7e97-1908-4f5e-83c0-919e5a0eac6d', 21, 62, NULL, 0, 1750, '2025-12-23 19:25:51', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(73, '19ef7e97-1908-4f5e-83c0-919e5a0eac6d', 22, 68, NULL, 0, 4451, '2025-12-23 19:25:51', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(74, '19ef7e97-1908-4f5e-83c0-919e5a0eac6d', 23, 71, NULL, 1, 1215, '2025-12-23 19:25:51', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(75, '19ef7e97-1908-4f5e-83c0-919e5a0eac6d', 24, 73, NULL, 0, 6329, '2025-12-23 19:25:51', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(76, '19ef7e97-1908-4f5e-83c0-919e5a0eac6d', 25, NULL, 'puro mqerkacademy', 0, 7241, '2025-12-23 19:25:51', 'graded', 'palabras_clave', 100, '2025-12-23 19:25:53', NULL, NULL, NULL),
(77, 'ff240335-e103-4e42-8a29-758accf6d384', 21, 63, NULL, 1, 6330, '2025-12-23 19:34:13', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(78, 'ff240335-e103-4e42-8a29-758accf6d384', 22, 66, NULL, 1, 1652, '2025-12-23 19:34:13', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(79, 'ff240335-e103-4e42-8a29-758accf6d384', 23, 72, NULL, 0, 3916, '2025-12-23 19:34:13', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(80, 'ff240335-e103-4e42-8a29-758accf6d384', 24, 74, NULL, 1, 3174, '2025-12-23 19:34:13', 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(81, 'ff240335-e103-4e42-8a29-758accf6d384', 25, NULL, 'mqerkacademy\n', 0, 10927, '2025-12-23 19:34:13', 'graded', 'palabras_clave', 100, '2025-12-23 19:34:15', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `simulaciones`
--

CREATE TABLE `simulaciones` (
  `id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `id_area` int(11) DEFAULT NULL,
  `fecha_limite` datetime DEFAULT NULL,
  `time_limit_min` int(11) DEFAULT NULL,
  `publico` tinyint(1) NOT NULL DEFAULT 0,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_por` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `grupos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`grupos`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `simulaciones`
--

INSERT INTO `simulaciones` (`id`, `titulo`, `descripcion`, `id_area`, `fecha_limite`, `time_limit_min`, `publico`, `activo`, `creado_por`, `created_at`, `updated_at`, `grupos`) VALUES
(11, 'NKLJKJKJKLJLKJ', 'NKKJKJKKJLKJKLJKL', 103, '2025-11-22 00:00:00', 60, 0, 1, 21, '2025-11-22 00:51:22', '2025-11-22 00:51:22', '[\"V1\"]'),
(27, 'cdsadasdsa', 'sadsadsadsadasd', 101, '2025-12-10 00:00:00', 120, 1, 1, 21, '2025-12-10 22:41:02', '2025-12-10 23:17:57', '[\"V1\",\"M1\"]'),
(36, 'algebra (IA · 5 preguntas)', 'Simulación de práctica sobre algebra. Cubre contenido general y contiene 5 preguntas generadas con inteligencia artificial para ayudarte a prepararte para tu examen de ingreso universitario.', NULL, NULL, NULL, 1, 1, 21, '2025-12-16 16:57:42', '2025-12-17 21:54:47', NULL),
(38, 'cdsadasdsa', 'sadsadsadsadasd', 101, '2025-12-26 00:00:00', 120, 1, 1, 21, '2025-12-25 22:13:18', '2025-12-25 22:13:18', '[\"V1\"]');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `simulaciones_intentos`
--

CREATE TABLE `simulaciones_intentos` (
  `id` int(11) NOT NULL,
  `id_simulacion` int(11) NOT NULL,
  `id_estudiante` int(11) NOT NULL,
  `puntaje` decimal(5,2) NOT NULL DEFAULT 0.00,
  `intent_number` int(11) NOT NULL DEFAULT 1,
  `tiempo_segundos` int(11) DEFAULT NULL,
  `total_preguntas` int(11) DEFAULT NULL,
  `correctas` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `simulaciones_intentos`
--

INSERT INTO `simulaciones_intentos` (`id`, `id_simulacion`, `id_estudiante`, `puntaje`, `intent_number`, `tiempo_segundos`, `total_preguntas`, `correctas`, `created_at`) VALUES
(7, 27, 67, 40.00, 1, 51, 5, 2, '2025-12-10 23:27:33'),
(8, 27, 67, 0.00, 2, 11, 5, 0, '2025-12-11 05:33:10'),
(9, 27, 67, 40.00, 3, 110, 5, 2, '2025-12-11 05:35:40'),
(10, 36, 67, 60.00, 1, 1181, 5, 3, '2025-12-17 22:14:41'),
(11, 36, 67, 40.00, 2, 29, 5, 2, '2025-12-17 22:15:32'),
(12, 36, 67, 80.00, 3, 234, 5, 4, '2025-12-17 22:23:21'),
(13, 36, 67, 60.00, 4, 114, 5, 3, '2025-12-17 22:25:26'),
(14, 36, 67, 75.00, 5, 124, 5, 3, '2025-12-18 19:22:45'),
(15, 36, 67, 50.00, 6, 112, 5, 2, '2025-12-18 19:33:23'),
(16, 36, 67, 100.00, 7, 128, 5, 4, '2025-12-18 19:54:20'),
(17, 36, 67, 0.00, 8, 24, 5, 0, '2025-12-23 19:26:41'),
(18, 36, 67, 75.00, 9, 18, 5, 3, '2025-12-23 19:34:54');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `simulaciones_preguntas`
--

CREATE TABLE `simulaciones_preguntas` (
  `id` int(11) NOT NULL,
  `id_simulacion` int(11) NOT NULL,
  `orden` int(11) DEFAULT NULL,
  `enunciado` text NOT NULL,
  `tipo` enum('opcion_multiple','multi_respuesta','verdadero_falso','respuesta_corta') NOT NULL DEFAULT 'opcion_multiple',
  `puntos` int(11) NOT NULL DEFAULT 1,
  `activa` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `simulaciones_preguntas`
--

INSERT INTO `simulaciones_preguntas` (`id`, `id_simulacion`, `orden`, `enunciado`, `tipo`, `puntos`, `activa`) VALUES
(148, 27, 1, 'Un automóvil se desplaza a una velocidad constante de 72 km/h. ¿Qué distancia recorrerá en un lapso de 15 minutos?', 'opcion_multiple', 1, 1),
(149, 27, 2, 'Al balancear la siguiente ecuación química por el método de tanteo, ¿cuál es el coeficiente estequiométrico que corresponde al oxígeno (O₂) en los reactivos?\nC₃H₈ + O₂ → CO₂ + H₂O', 'opcion_multiple', 1, 1),
(150, 27, 3, 'Si se tiene la ecuación 3x - 5 = 10, ¿cuál es el valor de x²?', 'opcion_multiple', 1, 1),
(151, 27, 4, 'El principio de conservación de la energía establece que la energía total de un sistema aislado permanece constante, transformándose de una forma a otra sin crearse ni destruirse.', 'verdadero_falso', 1, 1),
(152, 27, 5, '¿Cuál es el nombre del segmento de recta que une dos puntos de una circunferencia sin pasar necesariamente por el centro?', 'respuesta_corta', 1, 1),
(188, 36, 1, 'El perímetro de un terreno rectangular es de 120 metros. Si el largo del terreno mide el doble que su ancho, ¿cuáles son las dimensiones del terreno? (Fórmula del perímetro de un rectángulo: P = 2 * (largo + ancho))', 'opcion_multiple', 1, 1),
(189, 36, 2, 'Un diseñador de jardines planea construir un área rectangular para flores. Si el largo del jardín debe ser 3 metros más que su ancho, y el área total deseada es de 54 metros cuadrados, ¿cuáles son las dimensiones del jardín? (Fórmula del área de un rectángulo: A = ancho * largo)', 'opcion_multiple', 1, 1),
(190, 36, 3, 'El costo de producción (C) de \'x\' unidades de un artículo está dado por la expresión C(x) = 2x² - 5x + 100. Si se producen 15 unidades, ¿cuál es el costo total de producción?', 'opcion_multiple', 1, 1),
(191, 36, 4, 'La expresión (a - b)² es equivalente a a² - b².', 'verdadero_falso', 1, 1),
(192, 36, 5, 'La fórmula para calcular el volumen de un cilindro es V = πr²h, donde V es el volumen, r es el radio de la base y h es la altura. Despeja la altura (h) de esta fórmula.', 'respuesta_corta', 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `simulaciones_preguntas_opciones`
--

CREATE TABLE `simulaciones_preguntas_opciones` (
  `id` int(11) NOT NULL,
  `id_pregunta` int(11) NOT NULL,
  `texto` text NOT NULL,
  `es_correcta` tinyint(1) NOT NULL DEFAULT 0,
  `orden` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `simulaciones_preguntas_opciones`
--

INSERT INTO `simulaciones_preguntas_opciones` (`id`, `id_pregunta`, `texto`, `es_correcta`, `orden`) VALUES
(437, 148, '10.8 km', 0, 1),
(438, 148, '18 km', 1, 2),
(439, 148, '7.2 km', 0, 3),
(440, 148, '15 km', 0, 4),
(441, 149, '3', 0, 1),
(442, 149, '5', 1, 2),
(443, 149, '7', 0, 3),
(444, 149, '10', 0, 4),
(445, 150, '5', 0, 1),
(446, 150, '9', 0, 2),
(447, 150, '25', 1, 3),
(448, 150, '81', 0, 4),
(449, 151, 'Verdadero', 1, 1),
(450, 151, 'Falso', 0, 2),
(451, 152, 'Cuerda', 1, 1),
(557, 188, 'Ancho = 20 m, Largo = 40 m', 1, 1),
(558, 188, 'Ancho = 30 m, Largo = 60 m', 0, 2),
(559, 188, 'Ancho = 15 m, Largo = 30 m', 0, 3),
(560, 188, 'Ancho = 25 m, Largo = 50 m', 0, 4),
(561, 189, 'Ancho = 5 m, Largo = 8 m', 0, 1),
(562, 189, 'Ancho = 6 m, Largo = 9 m', 1, 2),
(563, 189, 'Ancho = 7 m, Largo = 10 m', 0, 3),
(564, 189, 'Ancho = 8 m, Largo = 11 m', 0, 4),
(565, 190, '$425', 0, 1),
(566, 190, '$450', 0, 2),
(567, 190, '$475', 1, 3),
(568, 190, '$500', 0, 4),
(569, 191, 'Verdadero', 0, 1),
(570, 191, 'Falso', 1, 2),
(571, 192, 'h = V / (πr²)', 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `simulaciones_respuestas`
--

CREATE TABLE `simulaciones_respuestas` (
  `id` int(11) NOT NULL,
  `id_sesion` int(11) NOT NULL,
  `id_pregunta` int(11) NOT NULL,
  `id_opcion` int(11) DEFAULT NULL,
  `texto_libre` text DEFAULT NULL,
  `tiempo_ms` int(11) DEFAULT NULL,
  `calificacion_status` enum('pending','graded','manual_review') DEFAULT 'graded' COMMENT 'Estado de calificación de la respuesta',
  `calificacion_metodo` varchar(50) DEFAULT NULL COMMENT 'Método usado: exacta, palabras_clave, ia, revisar',
  `calificacion_confianza` int(11) DEFAULT NULL COMMENT 'Nivel de confianza 0-100',
  `calificada_at` timestamp NULL DEFAULT NULL COMMENT 'Fecha de calificación',
  `revisada_por` int(11) DEFAULT NULL COMMENT 'ID del usuario asesor que revisó manualmente',
  `notas_revision` text DEFAULT NULL COMMENT 'Notas del asesor sobre la revisión',
  `revisada_at` timestamp NULL DEFAULT NULL COMMENT 'Fecha de revisión manual'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Respuestas de estudiantes a simulaciones con soporte para calificación automática';

--
-- Volcado de datos para la tabla `simulaciones_respuestas`
--

INSERT INTO `simulaciones_respuestas` (`id`, `id_sesion`, `id_pregunta`, `id_opcion`, `texto_libre`, `tiempo_ms`, `calificacion_status`, `calificacion_metodo`, `calificacion_confianza`, `calificada_at`, `revisada_por`, `notas_revision`, `revisada_at`) VALUES
(58, 7, 148, 438, NULL, 20915, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(59, 7, 149, 443, NULL, 1645, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(60, 7, 150, 448, NULL, 1193, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(61, 7, 151, 449, NULL, 2579, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(62, 7, 152, 451, NULL, 1432, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(63, 7, 148, 438, NULL, 20915, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(64, 7, 149, 443, NULL, 1645, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(65, 7, 150, 448, NULL, 1193, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(66, 7, 151, 449, NULL, 2579, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(67, 7, 152, 451, NULL, 1432, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(68, 7, 148, 438, NULL, 20915, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(69, 7, 149, 443, NULL, 1645, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(70, 7, 150, 448, NULL, 1193, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(71, 7, 151, 449, NULL, 2579, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(72, 7, 152, 451, NULL, 1432, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(73, 8, 148, 437, NULL, 3764, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(74, 8, 149, 441, NULL, 1563, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(75, 8, 150, 446, NULL, 1086, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(76, 8, 151, 450, NULL, 1656, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(77, 8, 152, 451, NULL, 1353, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(78, 8, 148, 437, NULL, 3764, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(79, 8, 149, 441, NULL, 1563, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(80, 8, 150, 446, NULL, 1086, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(81, 8, 151, 450, NULL, 1656, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(82, 8, 152, 451, NULL, 1353, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(83, 9, 148, 438, NULL, 2670, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(84, 9, 149, 441, NULL, 43686, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(85, 9, 148, 438, NULL, 2670, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(86, 9, 149, 441, NULL, 43686, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(87, 9, 150, 446, NULL, 58651, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(88, 9, 151, 449, NULL, 2673, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(89, 9, 152, 451, NULL, 1260, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(90, 9, 148, 438, NULL, 2670, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(91, 9, 149, 441, NULL, 43686, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(92, 9, 150, 446, NULL, 58651, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(93, 9, 151, 449, NULL, 2673, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(94, 9, 152, 451, NULL, 1260, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(95, 10, 188, 557, NULL, 168340, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(96, 10, 188, 557, NULL, 348340, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(97, 10, 189, 562, NULL, 180000, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(98, 10, 190, 565, NULL, 70332, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(99, 10, 191, 570, NULL, 19046, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(100, 10, 192, 571, NULL, 2896, 'pending', NULL, NULL, NULL, NULL, NULL, NULL),
(101, 10, 188, 557, NULL, 348340, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(102, 10, 189, 562, NULL, 180000, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(103, 10, 190, 565, NULL, 70332, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(104, 10, 191, 570, NULL, 19046, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(105, 10, 192, 571, NULL, 2896, 'pending', NULL, NULL, NULL, NULL, NULL, NULL),
(106, 10, 188, 557, NULL, 348340, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(107, 10, 189, 562, NULL, 180000, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(108, 10, 190, 565, NULL, 70332, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(109, 10, 191, 570, NULL, 19046, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(110, 10, 192, 571, NULL, 2896, 'graded', 'manual', 0, '2025-12-17 22:44:28', NULL, NULL, '2025-12-17 22:44:28'),
(111, 11, 188, 558, NULL, 1195, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(112, 11, 189, 562, NULL, 985, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(113, 11, 188, 558, NULL, 1195, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(114, 11, 189, 562, NULL, 985, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(115, 11, 190, 565, NULL, 22921, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(116, 11, 191, 570, NULL, 1885, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(117, 11, 192, 571, NULL, 1096, 'pending', NULL, NULL, NULL, NULL, NULL, NULL),
(118, 11, 188, 558, NULL, 1195, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(119, 11, 189, 562, NULL, 985, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(120, 11, 190, 565, NULL, 22921, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(121, 11, 191, 570, NULL, 1885, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(122, 11, 192, 571, NULL, 1096, 'pending', NULL, NULL, NULL, NULL, NULL, NULL),
(123, 12, 188, 557, NULL, 3080, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(124, 12, 189, 562, NULL, 1044, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(125, 12, 190, 567, NULL, 3584, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(126, 12, 191, 570, NULL, 1376, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(127, 12, 188, 557, NULL, 3080, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(128, 12, 189, 562, NULL, 1044, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(129, 12, 190, 567, NULL, 3584, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(130, 12, 191, 570, NULL, 1376, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(131, 12, 192, 571, NULL, 180000, 'pending', NULL, NULL, NULL, NULL, NULL, NULL),
(132, 12, 188, 557, NULL, 3080, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(133, 12, 189, 562, NULL, 1044, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(134, 12, 190, 567, NULL, 3584, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(135, 12, 191, 570, NULL, 1376, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(136, 12, 192, 571, NULL, 180000, 'pending', NULL, NULL, NULL, NULL, NULL, NULL),
(137, 13, 188, 557, NULL, 6438, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(138, 13, 189, 562, NULL, 1478, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(139, 13, 190, 566, NULL, 1684, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(140, 13, 190, 566, NULL, 50900, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(141, 13, 188, 557, NULL, 6438, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(142, 13, 189, 562, NULL, 1478, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(143, 13, 190, 566, NULL, 50900, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(144, 13, 192, NULL, 'no lo se ', 52754, 'pending', NULL, NULL, NULL, NULL, NULL, NULL),
(145, 13, 188, 557, NULL, 6438, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(146, 13, 189, 562, NULL, 1478, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(147, 13, 190, 566, NULL, 50900, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(148, 13, 192, NULL, 'no lo se ', 52754, 'pending', NULL, NULL, NULL, NULL, NULL, NULL),
(149, 14, 188, 557, NULL, 68124, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(150, 14, 189, 562, NULL, 1638, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(151, 14, 190, 567, NULL, 5938, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(152, 14, 191, 569, NULL, 1756, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(153, 14, 188, 557, NULL, 68124, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(154, 14, 189, 562, NULL, 1638, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(155, 14, 190, 567, NULL, 5938, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(156, 14, 191, 569, NULL, 1756, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(157, 14, 192, NULL, 'no se', 43776, 'graded', 'palabras_clave', 0, '2025-12-18 19:22:47', NULL, NULL, NULL),
(158, 14, 188, 557, NULL, 68124, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(159, 14, 189, 562, NULL, 1638, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(160, 14, 190, 567, NULL, 5938, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(161, 14, 191, 569, NULL, 1756, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(162, 14, 192, NULL, 'no se', 43776, 'graded', 'palabras_clave', 0, '2025-12-18 19:22:47', NULL, NULL, NULL),
(163, 16, 188, 557, NULL, 4008, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(164, 16, 189, 562, NULL, 1641, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(165, 16, 190, 565, NULL, 2104, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(166, 16, 191, 569, NULL, 2016, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(167, 16, 192, NULL, 'ab + ac = a(b + c)', 27159, 'graded', 'palabras_clave', 0, '2025-12-18 19:32:21', NULL, NULL, NULL),
(168, 16, 192, NULL, 'ab + ac = a(b + c) esta es la respuets a', 78953, 'graded', 'palabras_clave', 0, '2025-12-18 19:33:13', NULL, NULL, NULL),
(169, 16, 188, 557, NULL, 4008, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(170, 16, 189, 562, NULL, 1641, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(171, 16, 190, 565, NULL, 2104, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(172, 16, 191, 569, NULL, 2016, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(173, 16, 192, NULL, 'ab + ac = a(b + c) esta es la respuets a', 98580, 'graded', 'palabras_clave', 0, '2025-12-18 19:33:25', NULL, NULL, NULL),
(174, 16, 188, 557, NULL, 4008, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(175, 16, 189, 562, NULL, 1641, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(176, 16, 190, 565, NULL, 2104, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(177, 16, 191, 569, NULL, 2016, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(178, 16, 192, NULL, 'ab + ac = a(b + c) esta es la respuets a', 98580, 'graded', 'palabras_clave', 0, '2025-12-18 19:33:25', NULL, NULL, NULL),
(179, 17, 188, 557, NULL, 2171, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(180, 17, 189, 562, NULL, 1373, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(181, 17, 190, 567, NULL, 1596, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(182, 17, 191, 570, NULL, 2469, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(183, 17, 188, 557, NULL, 2171, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(184, 17, 189, 562, NULL, 1373, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(185, 17, 190, 567, NULL, 1596, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(186, 17, 191, 570, NULL, 2469, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(187, 17, 192, NULL, 'x = (-b ± √(b² - 4ac)) / (2a)', 110955, 'graded', 'palabras_clave', 0, '2025-12-18 19:54:22', NULL, NULL, NULL),
(188, 17, 188, 557, NULL, 2171, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(189, 17, 189, 562, NULL, 1373, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(190, 17, 190, 567, NULL, 1596, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(191, 17, 191, 570, NULL, 2469, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(192, 17, 192, NULL, 'x = (-b ± √(b² - 4ac)) / (2a)', 110955, 'graded', 'palabras_clave', 0, '2025-12-18 19:54:22', NULL, NULL, NULL),
(193, 18, 188, 558, NULL, 6164, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(194, 18, 189, 564, NULL, 3166, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(195, 18, 190, 565, NULL, 3049, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(196, 18, 191, 569, NULL, 1002, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(197, 18, 192, NULL, 'mqerkacademy', 7805, 'graded', 'palabras_clave', 0, '2025-12-23 19:26:43', NULL, NULL, NULL),
(198, 18, 188, 558, NULL, 6164, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(199, 18, 189, 564, NULL, 3166, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(200, 18, 190, 565, NULL, 3049, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(201, 18, 191, 569, NULL, 1002, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(202, 18, 192, NULL, 'mqerkacademy', 7805, 'graded', 'palabras_clave', 0, '2025-12-23 19:26:43', NULL, NULL, NULL),
(203, 19, 188, 557, NULL, 2761, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(204, 19, 189, 564, NULL, 3649, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(205, 19, 190, 567, NULL, 1535, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(206, 19, 191, 570, NULL, 3082, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(207, 19, 192, NULL, 'mqerkacademy', 5379, 'graded', 'palabras_clave', 0, '2025-12-23 19:34:56', NULL, NULL, NULL),
(208, 19, 188, 557, NULL, 2761, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(209, 19, 189, 564, NULL, 3649, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(210, 19, 190, 567, NULL, 1535, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(211, 19, 191, 570, NULL, 3082, 'graded', NULL, NULL, NULL, NULL, NULL, NULL),
(212, 19, 192, NULL, 'mqerkacademy', 5379, 'graded', 'palabras_clave', 0, '2025-12-23 19:34:56', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `simulaciones_sesiones`
--

CREATE TABLE `simulaciones_sesiones` (
  `id` int(11) NOT NULL,
  `id_simulacion` int(11) NOT NULL,
  `id_estudiante` int(11) NOT NULL,
  `started_at` timestamp NULL DEFAULT current_timestamp(),
  `finished_at` timestamp NULL DEFAULT NULL,
  `elapsed_ms` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `simulaciones_sesiones`
--

INSERT INTO `simulaciones_sesiones` (`id`, `id_simulacion`, `id_estudiante`, `started_at`, `finished_at`, `elapsed_ms`) VALUES
(7, 27, 67, '2025-12-10 23:26:41', '2025-12-10 23:27:33', 51424),
(8, 27, 67, '2025-12-11 05:32:59', '2025-12-11 05:33:10', 11241),
(9, 27, 67, '2025-12-11 05:33:50', '2025-12-11 05:35:40', 110020),
(10, 36, 67, '2025-12-17 21:55:00', '2025-12-17 22:14:41', 1180602),
(11, 36, 67, '2025-12-17 22:15:02', '2025-12-17 22:15:32', 29402),
(12, 36, 67, '2025-12-17 22:19:27', '2025-12-17 22:23:21', 233947),
(13, 36, 67, '2025-12-17 22:23:32', '2025-12-17 22:25:26', 114051),
(14, 36, 67, '2025-12-18 19:20:41', '2025-12-18 19:22:45', 124126),
(15, 36, 67, '2025-12-18 19:29:42', NULL, NULL),
(16, 36, 67, '2025-12-18 19:31:31', '2025-12-18 19:33:23', 111559),
(17, 36, 67, '2025-12-18 19:52:12', '2025-12-18 19:54:20', 128211),
(18, 36, 67, '2025-12-23 19:26:17', '2025-12-23 19:26:41', 23612),
(19, 36, 67, '2025-12-23 19:34:36', '2025-12-23 19:34:54', 18036);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `soft_deletes`
--

CREATE TABLE `soft_deletes` (
  `id` int(11) NOT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `id_estudiante` int(11) DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `deleted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `soft_deletes`
--

INSERT INTO `soft_deletes` (`id`, `id_usuario`, `id_estudiante`, `reason`, `deleted_at`) VALUES
(1, NULL, 72, 'Eliminado por admin', '2025-08-21 18:29:43'),
(2, NULL, 72, 'Eliminado por admin', '2025-08-21 18:30:11'),
(3, NULL, 71, 'Eliminado por admin', '2025-09-01 17:24:44');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `student_area_permissions`
--

CREATE TABLE `student_area_permissions` (
  `id` int(11) NOT NULL,
  `id_estudiante` int(11) NOT NULL,
  `area_id` int(11) NOT NULL,
  `area_type` varchar(16) NOT NULL DEFAULT 'actividad',
  `granted_by` int(11) DEFAULT NULL,
  `granted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `student_area_permissions`
--

INSERT INTO `student_area_permissions` (`id`, `id_estudiante`, `area_id`, `area_type`, `granted_by`, `granted_at`) VALUES
(1, 67, 101, 'actividad', 21, '2025-10-13 16:53:37'),
(2, 67, 102, 'actividad', 21, '2025-10-13 16:58:17'),
(3, 67, 101, 'simulacion', 21, '2025-11-04 21:28:56');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `student_area_requests`
--

CREATE TABLE `student_area_requests` (
  `id` int(11) NOT NULL,
  `id_estudiante` int(11) NOT NULL,
  `area_id` int(11) NOT NULL,
  `area_type` varchar(16) NOT NULL DEFAULT 'actividad',
  `status` enum('pending','approved','denied','revoked') NOT NULL DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `decided_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `decided_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `student_area_requests`
--

INSERT INTO `student_area_requests` (`id`, `id_estudiante`, `area_id`, `area_type`, `status`, `notes`, `decided_by`, `created_at`, `decided_at`) VALUES
(1, 67, 101, 'actividad', 'approved', NULL, 21, '2025-10-13 16:11:46', '2025-10-13 16:53:37'),
(2, 67, 102, 'actividad', 'approved', NULL, 21, '2025-10-13 16:53:12', '2025-10-13 16:58:17'),
(3, 67, 102, 'simulacion', 'denied', '', 21, '2025-10-13 16:59:55', '2025-11-20 21:33:45'),
(4, 67, 107, 'simulacion', 'pending', NULL, NULL, '2025-10-13 17:00:01', NULL),
(5, 67, 101, 'simulacion', 'approved', NULL, 21, '2025-10-13 17:00:05', '2025-11-04 21:28:56'),
(6, 67, 104, 'actividad', 'pending', NULL, NULL, '2025-10-13 17:02:55', NULL),
(7, 67, 103, 'actividad', 'pending', NULL, NULL, '2025-10-13 17:03:17', NULL),
(8, 67, 105, 'actividad', 'pending', NULL, NULL, '2025-10-22 03:24:36', NULL),
(9, 67, 104, 'simulacion', 'pending', NULL, NULL, '2025-10-22 03:32:26', NULL),
(10, 67, 103, 'simulacion', 'pending', NULL, NULL, '2025-10-22 03:34:19', NULL),
(11, 67, 105, 'simulacion', 'denied', '', 21, '2025-11-03 21:12:57', '2025-11-20 21:33:39'),
(12, 67, 106, 'simulacion', 'pending', NULL, NULL, '2025-11-20 21:33:12', NULL),
(13, 67, 106, 'actividad', 'pending', NULL, NULL, '2025-11-26 20:47:18', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `student_notifications`
--

CREATE TABLE `student_notifications` (
  `id` bigint(20) NOT NULL,
  `student_id` bigint(20) NOT NULL,
  `type` enum('assignment','grade','payment','class_reminder','new_content','message','progress','system','other') DEFAULT 'other',
  `title` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `action_url` varchar(255) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `student_notifications`
--

INSERT INTO `student_notifications` (`id`, `student_id`, `type`, `title`, `message`, `action_url`, `metadata`, `is_read`, `created_at`) VALUES
(1, 67, 'grade', 'Calificación publicada', 'Tu entrega fue calificada con 10', '/alumno/actividades', '{\"entrega_id\":2,\"actividad_id\":2,\"calificacion\":10}', 1, '2025-08-20 16:32:33'),
(2, 67, 'grade', 'Calificación publicada', 'Tu entrega fue calificada con 8', '/alumno/actividades', '{\"entrega_id\":2,\"actividad_id\":2,\"calificacion\":8}', 1, '2025-08-20 21:10:01'),
(7, 67, 'grade', 'Calificación publicada', 'Tu entrega fue calificada con 10', '/alumno/actividades', '{\"entrega_id\":4,\"actividad_id\":3,\"calificacion\":10}', 1, '2025-08-21 04:20:35'),
(8, 67, 'assignment', 'Nueva actividad asignada', 'Se te asignó: PRODUCTOS NOTABLES', '/alumno/actividades', '{\"actividad_id\":4}', 1, '2025-08-21 19:03:39'),
(9, 69, 'assignment', 'Nueva actividad asignada', 'Se te asignó: PRODUCTOS NOTABLES', '/alumno/actividades', '{\"actividad_id\":4}', 0, '2025-08-21 19:03:39'),
(10, 71, 'assignment', 'Nueva actividad asignada', 'Se te asignó: PRODUCTOS NOTABLES', '/alumno/actividades', '{\"actividad_id\":4}', 0, '2025-08-21 19:03:39'),
(11, 72, 'assignment', 'Nueva actividad asignada', 'Se te asignó: PRODUCTOS NOTABLES', '/alumno/actividades', '{\"actividad_id\":4}', 0, '2025-08-21 19:03:39'),
(12, 73, 'assignment', 'Nueva actividad asignada', 'Se te asignó: PRODUCTOS NOTABLES', '/alumno/actividades', '{\"actividad_id\":4}', 1, '2025-08-21 19:03:39'),
(13, 73, 'grade', 'Calificación publicada', 'Tu entrega fue calificada con 8', '/alumno/actividades', '{\"entrega_id\":5,\"actividad_id\":4,\"calificacion\":8}', 1, '2025-08-21 19:07:32'),
(19, 67, 'grade', 'Calificación publicada', 'Tu entrega fue calificada con 9', '/alumno/actividades', '{\"entrega_id\":6,\"actividad_id\":5,\"calificacion\":9}', 1, '2025-10-06 22:59:01'),
(20, 67, 'grade', 'Calificación publicada', 'Tu entrega fue calificada con 9', '/alumno/actividades', '{\"entrega_id\":6,\"actividad_id\":5,\"calificacion\":9}', 1, '2025-10-06 22:59:01'),
(21, 67, 'grade', 'Calificación publicada', 'Tu entrega fue calificada con 9', '/alumno/actividades', '{\"entrega_id\":6,\"actividad_id\":5,\"calificacion\":9}', 1, '2025-10-06 22:59:02'),
(22, 67, 'grade', 'Calificación publicada', 'Tu entrega fue calificada con 9', '/alumno/actividades', '{\"entrega_id\":6,\"actividad_id\":5,\"calificacion\":9}', 1, '2025-10-06 22:59:09'),
(23, 67, 'grade', 'Calificación publicada', 'Tu entrega fue calificada con 9', '/alumno/actividades', '{\"entrega_id\":6,\"actividad_id\":5,\"calificacion\":9}', 1, '2025-10-06 22:59:09'),
(24, 67, 'grade', 'Calificación publicada', 'Tu entrega fue calificada con 9', '/alumno/actividades', '{\"entrega_id\":6,\"actividad_id\":5,\"calificacion\":9}', 1, '2025-10-06 23:01:34'),
(25, 67, 'grade', 'Calificación publicada', 'Tu entrega fue calificada con 9', '/alumno/actividades', '{\"entrega_id\":6,\"actividad_id\":5,\"calificacion\":9}', 1, '2025-10-06 23:02:13'),
(26, 67, 'grade', 'Calificación publicada', 'Tu entrega fue calificada con 9', '/alumno/actividades', '{\"entrega_id\":6,\"actividad_id\":5,\"calificacion\":9}', 1, '2025-10-06 23:02:14'),
(27, 67, 'grade', 'Calificación publicada', 'Tu entrega fue calificada con 9', '/alumno/actividades', '{\"entrega_id\":6,\"actividad_id\":5,\"calificacion\":9}', 1, '2025-10-06 23:02:21'),
(28, 67, 'grade', 'Calificación publicada', 'Tu entrega fue calificada con 9', '/alumno/actividades', '{\"entrega_id\":6,\"actividad_id\":5,\"calificacion\":9}', 1, '2025-10-06 23:02:24'),
(29, 67, 'assignment', 'Nueva actividad asignada', 'Se te asignó: POTENCIAS Y RAÍCES', '/alumno/actividades', '{\"actividad_id\":9}', 1, '2025-10-07 18:49:00'),
(30, 69, 'assignment', 'Nueva actividad asignada', 'Se te asignó: POTENCIAS Y RAÍCES', '/alumno/actividades', '{\"actividad_id\":9}', 0, '2025-10-07 18:49:00'),
(31, 71, 'assignment', 'Nueva actividad asignada', 'Se te asignó: POTENCIAS Y RAÍCES', '/alumno/actividades', '{\"actividad_id\":9}', 0, '2025-10-07 18:49:00'),
(32, 72, 'assignment', 'Nueva actividad asignada', 'Se te asignó: POTENCIAS Y RAÍCES', '/alumno/actividades', '{\"actividad_id\":9}', 0, '2025-10-07 18:49:00'),
(33, 73, 'assignment', 'Nueva actividad asignada', 'Se te asignó: POTENCIAS Y RAÍCES', '/alumno/actividades', '{\"actividad_id\":9}', 0, '2025-10-07 18:49:00'),
(34, 67, 'grade', 'Calificación publicada', 'Tu entrega fue calificada con 10', '/alumno/actividades', '{\"entrega_id\":7,\"actividad_id\":9,\"calificacion\":10}', 1, '2025-10-07 18:51:37'),
(35, 67, 'assignment', 'Nueva actividad asignada', 'Se te asignó: RAICES Y ECUACIONES', '/alumno/actividades', '{\"actividad_id\":10}', 1, '2025-10-07 18:53:36'),
(36, 69, 'assignment', 'Nueva actividad asignada', 'Se te asignó: RAICES Y ECUACIONES', '/alumno/actividades', '{\"actividad_id\":10}', 0, '2025-10-07 18:53:36'),
(37, 71, 'assignment', 'Nueva actividad asignada', 'Se te asignó: RAICES Y ECUACIONES', '/alumno/actividades', '{\"actividad_id\":10}', 0, '2025-10-07 18:53:36'),
(38, 72, 'assignment', 'Nueva actividad asignada', 'Se te asignó: RAICES Y ECUACIONES', '/alumno/actividades', '{\"actividad_id\":10}', 0, '2025-10-07 18:53:36'),
(39, 73, 'assignment', 'Nueva actividad asignada', 'Se te asignó: RAICES Y ECUACIONES', '/alumno/actividades', '{\"actividad_id\":10}', 0, '2025-10-07 18:53:36'),
(40, 67, 'grade', 'Calificación publicada', 'Tu entrega fue calificada con 8', '/alumno/actividades', '{\"entrega_id\":8,\"actividad_id\":10,\"calificacion\":8}', 1, '2025-10-07 18:54:59'),
(41, 67, 'grade', 'Calificación publicada', 'Tu entrega fue calificada con 8', '/alumno/actividades', '{\"entrega_id\":8,\"actividad_id\":10,\"calificacion\":8}', 1, '2025-10-07 18:55:01'),
(47, 67, '', 'Acceso aprobado', 'Tu acceso al módulo Ciencias Exactas (Actividad) fue aprobado', NULL, '{\"area_id\":101,\"area_type\":\"actividad\",\"area_name\":\"Ciencias Exactas\",\"area_type_label\":\"Actividad\",\"request_id\":1,\"status\":\"approved\"}', 1, '2025-10-13 16:53:37'),
(48, 67, '', 'Acceso aprobado', 'Tu acceso al módulo Ciencias Sociales (Actividad) fue aprobado', NULL, '{\"area_id\":102,\"area_type\":\"actividad\",\"area_name\":\"Ciencias Sociales\",\"area_type_label\":\"Actividad\",\"request_id\":2,\"status\":\"approved\"}', 1, '2025-10-13 16:58:17'),
(49, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: asdsadasdsda', '/alumno/simulaciones', '{\"simulacion_id\":1,\"kind\":\"simulacion\"}', 1, '2025-10-13 19:01:51'),
(50, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: asdsadasdsda', '/alumno/simulaciones', '{\"simulacion_id\":1,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:01:51'),
(51, 71, 'assignment', 'Nueva simulación asignada', 'Se te asignó: asdsadasdsda', '/alumno/simulaciones', '{\"simulacion_id\":1,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:01:51'),
(52, 72, 'assignment', 'Nueva simulación asignada', 'Se te asignó: asdsadasdsda', '/alumno/simulaciones', '{\"simulacion_id\":1,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:01:51'),
(53, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: asdsadasdsda', '/alumno/simulaciones', '{\"simulacion_id\":1,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:01:51'),
(54, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: adsdasdas', '/alumno/simulaciones', '{\"simulacion_id\":2,\"kind\":\"simulacion\"}', 1, '2025-10-13 19:17:40'),
(55, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: adsdasdas', '/alumno/simulaciones', '{\"simulacion_id\":2,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:17:40'),
(56, 71, 'assignment', 'Nueva simulación asignada', 'Se te asignó: adsdasdas', '/alumno/simulaciones', '{\"simulacion_id\":2,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:17:40'),
(57, 72, 'assignment', 'Nueva simulación asignada', 'Se te asignó: adsdasdas', '/alumno/simulaciones', '{\"simulacion_id\":2,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:17:40'),
(58, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: adsdasdas', '/alumno/simulaciones', '{\"simulacion_id\":2,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:17:40'),
(59, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: adsdasdas', '/alumno/simulaciones', '{\"simulacion_id\":3,\"kind\":\"simulacion\"}', 1, '2025-10-13 19:26:18'),
(60, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: adsdasdas', '/alumno/simulaciones', '{\"simulacion_id\":3,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:26:18'),
(61, 71, 'assignment', 'Nueva simulación asignada', 'Se te asignó: adsdasdas', '/alumno/simulaciones', '{\"simulacion_id\":3,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:26:18'),
(62, 72, 'assignment', 'Nueva simulación asignada', 'Se te asignó: adsdasdas', '/alumno/simulaciones', '{\"simulacion_id\":3,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:26:18'),
(63, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: adsdasdas', '/alumno/simulaciones', '{\"simulacion_id\":3,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:26:18'),
(64, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: dasdsadsa', '/alumno/simulaciones', '{\"simulacion_id\":4,\"kind\":\"simulacion\"}', 1, '2025-10-13 19:31:01'),
(65, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: dasdsadsa', '/alumno/simulaciones', '{\"simulacion_id\":4,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:31:01'),
(66, 71, 'assignment', 'Nueva simulación asignada', 'Se te asignó: dasdsadsa', '/alumno/simulaciones', '{\"simulacion_id\":4,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:31:01'),
(67, 72, 'assignment', 'Nueva simulación asignada', 'Se te asignó: dasdsadsa', '/alumno/simulaciones', '{\"simulacion_id\":4,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:31:01'),
(68, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: dasdsadsa', '/alumno/simulaciones', '{\"simulacion_id\":4,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:31:01'),
(69, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: dwawd', '/alumno/simulaciones', '{\"simulacion_id\":5,\"kind\":\"simulacion\"}', 1, '2025-10-13 19:32:28'),
(70, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: dwawd', '/alumno/simulaciones', '{\"simulacion_id\":5,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:32:28'),
(71, 71, 'assignment', 'Nueva simulación asignada', 'Se te asignó: dwawd', '/alumno/simulaciones', '{\"simulacion_id\":5,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:32:28'),
(72, 72, 'assignment', 'Nueva simulación asignada', 'Se te asignó: dwawd', '/alumno/simulaciones', '{\"simulacion_id\":5,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:32:28'),
(73, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: dwawd', '/alumno/simulaciones', '{\"simulacion_id\":5,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:32:28'),
(74, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: dwqdwqdwqw', '/alumno/simulaciones', '{\"simulacion_id\":6,\"kind\":\"simulacion\"}', 1, '2025-10-13 19:33:22'),
(75, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: dwqdwqdwqw', '/alumno/simulaciones', '{\"simulacion_id\":6,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:33:22'),
(76, 71, 'assignment', 'Nueva simulación asignada', 'Se te asignó: dwqdwqdwqw', '/alumno/simulaciones', '{\"simulacion_id\":6,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:33:22'),
(77, 72, 'assignment', 'Nueva simulación asignada', 'Se te asignó: dwqdwqdwqw', '/alumno/simulaciones', '{\"simulacion_id\":6,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:33:22'),
(78, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: dwqdwqdwqw', '/alumno/simulaciones', '{\"simulacion_id\":6,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:33:22'),
(79, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: asdasd', '/alumno/simulaciones', '{\"simulacion_id\":7,\"kind\":\"simulacion\"}', 1, '2025-10-13 19:35:53'),
(80, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: asdasd', '/alumno/simulaciones', '{\"simulacion_id\":7,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:35:53'),
(81, 71, 'assignment', 'Nueva simulación asignada', 'Se te asignó: asdasd', '/alumno/simulaciones', '{\"simulacion_id\":7,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:35:53'),
(82, 72, 'assignment', 'Nueva simulación asignada', 'Se te asignó: asdasd', '/alumno/simulaciones', '{\"simulacion_id\":7,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:35:53'),
(83, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: asdasd', '/alumno/simulaciones', '{\"simulacion_id\":7,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:35:53'),
(84, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: asdasd', '/alumno/simulaciones', '{\"simulacion_id\":8,\"kind\":\"simulacion\"}', 1, '2025-10-13 19:51:28'),
(85, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: asdasd', '/alumno/simulaciones', '{\"simulacion_id\":8,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:51:28'),
(86, 71, 'assignment', 'Nueva simulación asignada', 'Se te asignó: asdasd', '/alumno/simulaciones', '{\"simulacion_id\":8,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:51:28'),
(87, 72, 'assignment', 'Nueva simulación asignada', 'Se te asignó: asdasd', '/alumno/simulaciones', '{\"simulacion_id\":8,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:51:28'),
(88, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: asdasd', '/alumno/simulaciones', '{\"simulacion_id\":8,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:51:28'),
(89, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: dawdsd', '/alumno/simulaciones', '{\"simulacion_id\":9,\"kind\":\"simulacion\"}', 1, '2025-10-13 19:52:44'),
(90, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: dawdsd', '/alumno/simulaciones', '{\"simulacion_id\":9,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:52:44'),
(91, 71, 'assignment', 'Nueva simulación asignada', 'Se te asignó: dawdsd', '/alumno/simulaciones', '{\"simulacion_id\":9,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:52:44'),
(92, 72, 'assignment', 'Nueva simulación asignada', 'Se te asignó: dawdsd', '/alumno/simulaciones', '{\"simulacion_id\":9,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:52:44'),
(93, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: dawdsd', '/alumno/simulaciones', '{\"simulacion_id\":9,\"kind\":\"simulacion\"}', 0, '2025-10-13 19:52:44'),
(94, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: da<d<ad', '/alumno/simulaciones', '{\"simulacion_id\":10,\"kind\":\"simulacion\"}', 1, '2025-10-13 20:38:11'),
(95, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: da<d<ad', '/alumno/simulaciones', '{\"simulacion_id\":10,\"kind\":\"simulacion\"}', 0, '2025-10-13 20:38:11'),
(96, 71, 'assignment', 'Nueva simulación asignada', 'Se te asignó: da<d<ad', '/alumno/simulaciones', '{\"simulacion_id\":10,\"kind\":\"simulacion\"}', 0, '2025-10-13 20:38:11'),
(97, 72, 'assignment', 'Nueva simulación asignada', 'Se te asignó: da<d<ad', '/alumno/simulaciones', '{\"simulacion_id\":10,\"kind\":\"simulacion\"}', 0, '2025-10-13 20:38:11'),
(98, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: da<d<ad', '/alumno/simulaciones', '{\"simulacion_id\":10,\"kind\":\"simulacion\"}', 0, '2025-10-13 20:38:11'),
(99, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: rwerwerwe', '/alumno/simulaciones', '{\"simulacion_id\":11,\"kind\":\"simulacion\"}', 1, '2025-10-13 21:02:19'),
(100, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: rwerwerwe', '/alumno/simulaciones', '{\"simulacion_id\":11,\"kind\":\"simulacion\"}', 0, '2025-10-13 21:02:19'),
(101, 71, 'assignment', 'Nueva simulación asignada', 'Se te asignó: rwerwerwe', '/alumno/simulaciones', '{\"simulacion_id\":11,\"kind\":\"simulacion\"}', 0, '2025-10-13 21:02:19'),
(102, 72, 'assignment', 'Nueva simulación asignada', 'Se te asignó: rwerwerwe', '/alumno/simulaciones', '{\"simulacion_id\":11,\"kind\":\"simulacion\"}', 0, '2025-10-13 21:02:19'),
(103, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: rwerwerwe', '/alumno/simulaciones', '{\"simulacion_id\":11,\"kind\":\"simulacion\"}', 0, '2025-10-13 21:02:19'),
(104, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: dasdasdsa', '/alumno/simulaciones', '{\"simulacion_id\":1,\"kind\":\"simulacion\"}', 1, '2025-10-13 21:16:28'),
(105, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: dasdasdsa', '/alumno/simulaciones', '{\"simulacion_id\":1,\"kind\":\"simulacion\"}', 0, '2025-10-13 21:16:28'),
(106, 71, 'assignment', 'Nueva simulación asignada', 'Se te asignó: dasdasdsa', '/alumno/simulaciones', '{\"simulacion_id\":1,\"kind\":\"simulacion\"}', 0, '2025-10-13 21:16:28'),
(107, 72, 'assignment', 'Nueva simulación asignada', 'Se te asignó: dasdasdsa', '/alumno/simulaciones', '{\"simulacion_id\":1,\"kind\":\"simulacion\"}', 0, '2025-10-13 21:16:28'),
(108, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: dasdasdsa', '/alumno/simulaciones', '{\"simulacion_id\":1,\"kind\":\"simulacion\"}', 0, '2025-10-13 21:16:28'),
(109, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: DASDSADSADSAD', '/alumno/simulaciones', '{\"simulacion_id\":2,\"kind\":\"simulacion\"}', 1, '2025-10-13 21:21:48'),
(110, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: DASDSADSADSAD', '/alumno/simulaciones', '{\"simulacion_id\":2,\"kind\":\"simulacion\"}', 0, '2025-10-13 21:21:48'),
(111, 71, 'assignment', 'Nueva simulación asignada', 'Se te asignó: DASDSADSADSAD', '/alumno/simulaciones', '{\"simulacion_id\":2,\"kind\":\"simulacion\"}', 0, '2025-10-13 21:21:48'),
(112, 72, 'assignment', 'Nueva simulación asignada', 'Se te asignó: DASDSADSADSAD', '/alumno/simulaciones', '{\"simulacion_id\":2,\"kind\":\"simulacion\"}', 0, '2025-10-13 21:21:48'),
(113, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: DASDSADSADSAD', '/alumno/simulaciones', '{\"simulacion_id\":2,\"kind\":\"simulacion\"}', 0, '2025-10-13 21:21:48'),
(114, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: sdfsdfsd', '/alumno/simulaciones', '{\"simulacion_id\":3,\"kind\":\"simulacion\"}', 1, '2025-10-13 21:45:43'),
(115, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: sdfsdfsd', '/alumno/simulaciones', '{\"simulacion_id\":3,\"kind\":\"simulacion\"}', 0, '2025-10-13 21:45:43'),
(116, 71, 'assignment', 'Nueva simulación asignada', 'Se te asignó: sdfsdfsd', '/alumno/simulaciones', '{\"simulacion_id\":3,\"kind\":\"simulacion\"}', 0, '2025-10-13 21:45:43'),
(117, 72, 'assignment', 'Nueva simulación asignada', 'Se te asignó: sdfsdfsd', '/alumno/simulaciones', '{\"simulacion_id\":3,\"kind\":\"simulacion\"}', 0, '2025-10-13 21:45:43'),
(118, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: sdfsdfsd', '/alumno/simulaciones', '{\"simulacion_id\":3,\"kind\":\"simulacion\"}', 0, '2025-10-13 21:45:43'),
(119, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: sadd', '/alumno/simulaciones', '{\"simulacion_id\":4,\"kind\":\"simulacion\"}', 1, '2025-10-13 21:46:39'),
(120, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: sadd', '/alumno/simulaciones', '{\"simulacion_id\":4,\"kind\":\"simulacion\"}', 0, '2025-10-13 21:46:39'),
(121, 71, 'assignment', 'Nueva simulación asignada', 'Se te asignó: sadd', '/alumno/simulaciones', '{\"simulacion_id\":4,\"kind\":\"simulacion\"}', 0, '2025-10-13 21:46:39'),
(122, 72, 'assignment', 'Nueva simulación asignada', 'Se te asignó: sadd', '/alumno/simulaciones', '{\"simulacion_id\":4,\"kind\":\"simulacion\"}', 0, '2025-10-13 21:46:39'),
(123, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: sadd', '/alumno/simulaciones', '{\"simulacion_id\":4,\"kind\":\"simulacion\"}', 0, '2025-10-13 21:46:39'),
(124, 67, '', 'Acceso aprobado', 'Tu acceso al módulo Ciencias Exactas (Simulación) fue aprobado', NULL, '{\"area_id\":101,\"area_type\":\"simulacion\",\"area_name\":\"Ciencias Exactas\",\"area_type_label\":\"Simulación\",\"request_id\":5,\"status\":\"approved\"}', 1, '2025-11-04 21:28:56'),
(125, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas', '/alumno/simulaciones', '{\"simulacion_id\":15,\"kind\":\"simulacion\"}', 1, '2025-11-05 18:00:25'),
(126, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas', '/alumno/simulaciones', '{\"simulacion_id\":15,\"kind\":\"simulacion\"}', 0, '2025-11-05 18:00:25'),
(127, 71, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas', '/alumno/simulaciones', '{\"simulacion_id\":15,\"kind\":\"simulacion\"}', 0, '2025-11-05 18:00:25'),
(128, 72, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas', '/alumno/simulaciones', '{\"simulacion_id\":15,\"kind\":\"simulacion\"}', 0, '2025-11-05 18:00:25'),
(129, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas', '/alumno/simulaciones', '{\"simulacion_id\":15,\"kind\":\"simulacion\"}', 0, '2025-11-05 18:00:25'),
(130, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":18,\"kind\":\"simulacion\"}', 1, '2025-11-14 04:56:09'),
(131, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":18,\"kind\":\"simulacion\"}', 0, '2025-11-14 04:56:09'),
(132, 71, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":18,\"kind\":\"simulacion\"}', 0, '2025-11-14 04:56:09'),
(133, 72, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":18,\"kind\":\"simulacion\"}', 0, '2025-11-14 04:56:09'),
(134, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":18,\"kind\":\"simulacion\"}', 0, '2025-11-14 04:56:09'),
(135, 67, 'assignment', 'Nuevo quiz publicado', 'Se publicó un nuevo quiz: Matemáticas y pensamiento analítico (IA · 5 preguntas)', '/alumno/actividades?type=quiz&quizId=5', '{\"actividad_id\":5,\"kind\":\"quiz\"}', 1, '2025-11-19 19:55:34'),
(136, 69, 'assignment', 'Nuevo quiz publicado', 'Se publicó un nuevo quiz: Matemáticas y pensamiento analítico (IA · 5 preguntas)', '/alumno/actividades?type=quiz&quizId=5', '{\"actividad_id\":5,\"kind\":\"quiz\"}', 0, '2025-11-19 19:55:34'),
(137, 71, 'assignment', 'Nuevo quiz publicado', 'Se publicó un nuevo quiz: Matemáticas y pensamiento analítico (IA · 5 preguntas)', '/alumno/actividades?type=quiz&quizId=5', '{\"actividad_id\":5,\"kind\":\"quiz\"}', 0, '2025-11-19 19:55:34'),
(138, 72, 'assignment', 'Nuevo quiz publicado', 'Se publicó un nuevo quiz: Matemáticas y pensamiento analítico (IA · 5 preguntas)', '/alumno/actividades?type=quiz&quizId=5', '{\"actividad_id\":5,\"kind\":\"quiz\"}', 0, '2025-11-19 19:55:34'),
(139, 73, 'assignment', 'Nuevo quiz publicado', 'Se publicó un nuevo quiz: Matemáticas y pensamiento analítico (IA · 5 preguntas)', '/alumno/actividades?type=quiz&quizId=5', '{\"actividad_id\":5,\"kind\":\"quiz\"}', 0, '2025-11-19 19:55:34'),
(140, 67, 'assignment', 'Nuevo quiz publicado', 'Se publicó un nuevo quiz: Matemáticas y pensamiento analítico (IA · 5 preguntas)', '/alumno/actividades?type=quiz&quizId=6', '{\"actividad_id\":6,\"kind\":\"quiz\"}', 1, '2025-11-19 20:19:31'),
(141, 69, 'assignment', 'Nuevo quiz publicado', 'Se publicó un nuevo quiz: Matemáticas y pensamiento analítico (IA · 5 preguntas)', '/alumno/actividades?type=quiz&quizId=6', '{\"actividad_id\":6,\"kind\":\"quiz\"}', 0, '2025-11-19 20:19:31'),
(142, 71, 'assignment', 'Nuevo quiz publicado', 'Se publicó un nuevo quiz: Matemáticas y pensamiento analítico (IA · 5 preguntas)', '/alumno/actividades?type=quiz&quizId=6', '{\"actividad_id\":6,\"kind\":\"quiz\"}', 0, '2025-11-19 20:19:31'),
(143, 72, 'assignment', 'Nuevo quiz publicado', 'Se publicó un nuevo quiz: Matemáticas y pensamiento analítico (IA · 5 preguntas)', '/alumno/actividades?type=quiz&quizId=6', '{\"actividad_id\":6,\"kind\":\"quiz\"}', 0, '2025-11-19 20:19:31'),
(144, 73, 'assignment', 'Nuevo quiz publicado', 'Se publicó un nuevo quiz: Matemáticas y pensamiento analítico (IA · 5 preguntas)', '/alumno/actividades?type=quiz&quizId=6', '{\"actividad_id\":6,\"kind\":\"quiz\"}', 0, '2025-11-19 20:19:31'),
(145, 67, 'assignment', 'Nuevo quiz publicado', 'Se publicó un nuevo quiz: Matemáticas y pensamiento analítico (IA · 5 preguntas)', '/alumno/actividades?type=quiz&quizId=1', '{\"actividad_id\":1,\"kind\":\"quiz\"}', 1, '2025-11-19 20:27:52'),
(146, 69, 'assignment', 'Nuevo quiz publicado', 'Se publicó un nuevo quiz: Matemáticas y pensamiento analítico (IA · 5 preguntas)', '/alumno/actividades?type=quiz&quizId=1', '{\"actividad_id\":1,\"kind\":\"quiz\"}', 0, '2025-11-19 20:27:52'),
(147, 71, 'assignment', 'Nuevo quiz publicado', 'Se publicó un nuevo quiz: Matemáticas y pensamiento analítico (IA · 5 preguntas)', '/alumno/actividades?type=quiz&quizId=1', '{\"actividad_id\":1,\"kind\":\"quiz\"}', 0, '2025-11-19 20:27:52'),
(148, 72, 'assignment', 'Nuevo quiz publicado', 'Se publicó un nuevo quiz: Matemáticas y pensamiento analítico (IA · 5 preguntas)', '/alumno/actividades?type=quiz&quizId=1', '{\"actividad_id\":1,\"kind\":\"quiz\"}', 0, '2025-11-19 20:27:52'),
(149, 73, 'assignment', 'Nuevo quiz publicado', 'Se publicó un nuevo quiz: Matemáticas y pensamiento analítico (IA · 5 preguntas)', '/alumno/actividades?type=quiz&quizId=1', '{\"actividad_id\":1,\"kind\":\"quiz\"}', 0, '2025-11-19 20:27:52'),
(155, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":1,\"kind\":\"simulacion\"}', 1, '2025-11-20 17:16:02'),
(156, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":1,\"kind\":\"simulacion\"}', 0, '2025-11-20 17:16:02'),
(157, 71, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":1,\"kind\":\"simulacion\"}', 0, '2025-11-20 17:16:02'),
(158, 72, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":1,\"kind\":\"simulacion\"}', 0, '2025-11-20 17:16:02'),
(159, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":1,\"kind\":\"simulacion\"}', 0, '2025-11-20 17:16:02'),
(160, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":2,\"kind\":\"simulacion\"}', 1, '2025-11-20 19:53:30'),
(161, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":2,\"kind\":\"simulacion\"}', 0, '2025-11-20 19:53:30'),
(162, 71, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":2,\"kind\":\"simulacion\"}', 0, '2025-11-20 19:53:30'),
(163, 72, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":2,\"kind\":\"simulacion\"}', 0, '2025-11-20 19:53:30'),
(164, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":2,\"kind\":\"simulacion\"}', 0, '2025-11-20 19:53:30'),
(165, 67, '', 'Solicitud rechazada', 'Tu solicitud para el módulo Ingeniería y Tecnología (Simulación) fue rechazada', NULL, '{\"area_id\":105,\"area_type\":\"simulacion\",\"area_name\":\"Ingeniería y Tecnología\",\"area_type_label\":\"Simulación\",\"request_id\":11,\"status\":\"denied\",\"notes\":null}', 1, '2025-11-20 21:33:39'),
(166, 67, '', 'Solicitud rechazada', 'Tu solicitud para el módulo Ciencias Sociales (Simulación) fue rechazada', NULL, '{\"area_id\":102,\"area_type\":\"simulacion\",\"area_name\":\"Ciencias Sociales\",\"area_type_label\":\"Simulación\",\"request_id\":3,\"status\":\"denied\",\"notes\":null}', 1, '2025-11-20 21:33:45'),
(167, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":3,\"kind\":\"simulacion\"}', 1, '2025-11-20 21:38:26'),
(168, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":3,\"kind\":\"simulacion\"}', 0, '2025-11-20 21:38:26'),
(169, 71, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":3,\"kind\":\"simulacion\"}', 0, '2025-11-20 21:38:26'),
(170, 72, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":3,\"kind\":\"simulacion\"}', 0, '2025-11-20 21:38:26'),
(171, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":3,\"kind\":\"simulacion\"}', 0, '2025-11-20 21:38:26'),
(172, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":4,\"kind\":\"simulacion\"}', 1, '2025-11-20 22:12:44'),
(173, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":4,\"kind\":\"simulacion\"}', 0, '2025-11-20 22:12:44'),
(174, 70, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":4,\"kind\":\"simulacion\"}', 0, '2025-11-20 22:12:44'),
(175, 71, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":4,\"kind\":\"simulacion\"}', 0, '2025-11-20 22:12:44'),
(176, 72, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":4,\"kind\":\"simulacion\"}', 0, '2025-11-20 22:12:44'),
(177, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":4,\"kind\":\"simulacion\"}', 0, '2025-11-20 22:12:44'),
(178, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: asdsadas', '/alumno/simulaciones', '{\"simulacion_id\":5,\"kind\":\"simulacion\"}', 1, '2025-11-20 22:27:27'),
(179, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: asdsadas', '/alumno/simulaciones', '{\"simulacion_id\":5,\"kind\":\"simulacion\"}', 0, '2025-11-20 22:27:27'),
(180, 71, 'assignment', 'Nueva simulación asignada', 'Se te asignó: asdsadas', '/alumno/simulaciones', '{\"simulacion_id\":5,\"kind\":\"simulacion\"}', 0, '2025-11-20 22:27:27'),
(181, 72, 'assignment', 'Nueva simulación asignada', 'Se te asignó: asdsadas', '/alumno/simulaciones', '{\"simulacion_id\":5,\"kind\":\"simulacion\"}', 0, '2025-11-20 22:27:27'),
(182, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: asdsadas', '/alumno/simulaciones', '{\"simulacion_id\":5,\"kind\":\"simulacion\"}', 0, '2025-11-20 22:27:27'),
(183, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":6,\"kind\":\"simulacion\"}', 1, '2025-11-20 22:30:11'),
(184, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":6,\"kind\":\"simulacion\"}', 0, '2025-11-20 22:30:11'),
(185, 70, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":6,\"kind\":\"simulacion\"}', 0, '2025-11-20 22:30:11'),
(186, 71, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":6,\"kind\":\"simulacion\"}', 0, '2025-11-20 22:30:11'),
(187, 72, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":6,\"kind\":\"simulacion\"}', 0, '2025-11-20 22:30:11'),
(188, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":6,\"kind\":\"simulacion\"}', 0, '2025-11-20 22:30:11'),
(189, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":7,\"kind\":\"simulacion\"}', 1, '2025-11-20 22:51:14'),
(190, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":7,\"kind\":\"simulacion\"}', 0, '2025-11-20 22:51:14'),
(191, 71, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":7,\"kind\":\"simulacion\"}', 0, '2025-11-20 22:51:14'),
(192, 72, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":7,\"kind\":\"simulacion\"}', 0, '2025-11-20 22:51:14'),
(193, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":7,\"kind\":\"simulacion\"}', 0, '2025-11-20 22:51:14'),
(194, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":8,\"kind\":\"simulacion\"}', 1, '2025-11-21 16:49:58'),
(195, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":8,\"kind\":\"simulacion\"}', 0, '2025-11-21 16:49:58'),
(196, 71, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":8,\"kind\":\"simulacion\"}', 0, '2025-11-21 16:49:58'),
(197, 72, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":8,\"kind\":\"simulacion\"}', 0, '2025-11-21 16:49:58'),
(198, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":8,\"kind\":\"simulacion\"}', 0, '2025-11-21 16:49:58'),
(199, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":9,\"kind\":\"simulacion\"}', 1, '2025-11-21 17:38:21'),
(200, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":9,\"kind\":\"simulacion\"}', 0, '2025-11-21 17:38:21'),
(201, 71, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":9,\"kind\":\"simulacion\"}', 0, '2025-11-21 17:38:21'),
(202, 72, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":9,\"kind\":\"simulacion\"}', 0, '2025-11-21 17:38:21'),
(203, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":9,\"kind\":\"simulacion\"}', 0, '2025-11-21 17:38:21'),
(204, 67, 'assignment', 'Nueva actividad asignada', 'Se te asignó: probando a ver si tod funciona bien', '/alumno/actividades', '{\"actividad_id\":2}', 1, '2025-11-21 17:57:10'),
(205, 69, 'assignment', 'Nueva actividad asignada', 'Se te asignó: probando a ver si tod funciona bien', '/alumno/actividades', '{\"actividad_id\":2}', 0, '2025-11-21 17:57:10'),
(206, 71, 'assignment', 'Nueva actividad asignada', 'Se te asignó: probando a ver si tod funciona bien', '/alumno/actividades', '{\"actividad_id\":2}', 0, '2025-11-21 17:57:10'),
(207, 72, 'assignment', 'Nueva actividad asignada', 'Se te asignó: probando a ver si tod funciona bien', '/alumno/actividades', '{\"actividad_id\":2}', 0, '2025-11-21 17:57:10'),
(208, 73, 'assignment', 'Nueva actividad asignada', 'Se te asignó: probando a ver si tod funciona bien', '/alumno/actividades', '{\"actividad_id\":2}', 0, '2025-11-21 17:57:10'),
(209, 67, 'assignment', 'Nueva actividad asignada', 'Se te asignó: probando', '/alumno/actividades', '{\"actividad_id\":3}', 1, '2025-11-21 18:53:26'),
(210, 69, 'assignment', 'Nueva actividad asignada', 'Se te asignó: probando', '/alumno/actividades', '{\"actividad_id\":3}', 0, '2025-11-21 18:53:26'),
(211, 71, 'assignment', 'Nueva actividad asignada', 'Se te asignó: probando', '/alumno/actividades', '{\"actividad_id\":3}', 0, '2025-11-21 18:53:26'),
(212, 72, 'assignment', 'Nueva actividad asignada', 'Se te asignó: probando', '/alumno/actividades', '{\"actividad_id\":3}', 0, '2025-11-21 18:53:26'),
(213, 73, 'assignment', 'Nueva actividad asignada', 'Se te asignó: probando', '/alumno/actividades', '{\"actividad_id\":3}', 0, '2025-11-21 18:53:26'),
(214, 67, 'assignment', 'Nueva actividad asignada', 'Se te asignó: adasdasdasd', '/alumno/actividades', '{\"actividad_id\":5}', 1, '2025-11-21 19:27:12'),
(215, 69, 'assignment', 'Nueva actividad asignada', 'Se te asignó: adasdasdasd', '/alumno/actividades', '{\"actividad_id\":5}', 0, '2025-11-21 19:27:12'),
(216, 71, 'assignment', 'Nueva actividad asignada', 'Se te asignó: adasdasdasd', '/alumno/actividades', '{\"actividad_id\":5}', 0, '2025-11-21 19:27:12'),
(217, 72, 'assignment', 'Nueva actividad asignada', 'Se te asignó: adasdasdasd', '/alumno/actividades', '{\"actividad_id\":5}', 0, '2025-11-21 19:27:12'),
(218, 73, 'assignment', 'Nueva actividad asignada', 'Se te asignó: adasdasdasd', '/alumno/actividades', '{\"actividad_id\":5}', 0, '2025-11-21 19:27:12'),
(219, 67, 'assignment', 'Nueva actividad asignada', 'Se te asignó: cvxxc', '/alumno/actividades', '{\"actividad_id\":6}', 1, '2025-11-21 19:36:26'),
(220, 69, 'assignment', 'Nueva actividad asignada', 'Se te asignó: cvxxc', '/alumno/actividades', '{\"actividad_id\":6}', 0, '2025-11-21 19:36:26'),
(221, 73, 'assignment', 'Nueva actividad asignada', 'Se te asignó: cvxxc', '/alumno/actividades', '{\"actividad_id\":6}', 0, '2025-11-21 19:36:26'),
(222, 67, 'assignment', 'Nueva actividad asignada', 'Se te asignó: xasdasdsasad', '/alumno/actividades', '{\"actividad_id\":7}', 1, '2025-11-21 20:25:32'),
(223, 69, 'assignment', 'Nueva actividad asignada', 'Se te asignó: xasdasdsasad', '/alumno/actividades', '{\"actividad_id\":7}', 0, '2025-11-21 20:25:32'),
(224, 73, 'assignment', 'Nueva actividad asignada', 'Se te asignó: xasdasdsasad', '/alumno/actividades', '{\"actividad_id\":7}', 0, '2025-11-21 20:25:32'),
(225, 67, 'grade', 'Calificación publicada', 'Tu entrega fue calificada con 9', '/alumno/actividades', '{\"entrega_id\":1,\"actividad_id\":7,\"calificacion\":9}', 1, '2025-11-21 20:49:07'),
(226, 67, 'grade', 'Calificación publicada', 'Tu entrega fue calificada con 9', '/alumno/actividades', '{\"entrega_id\":1,\"actividad_id\":7,\"calificacion\":9}', 1, '2025-11-21 21:06:30'),
(227, 67, 'grade', 'Calificación publicada', 'Tu entrega fue calificada con 9', '/alumno/actividades', '{\"entrega_id\":1,\"actividad_id\":7,\"calificacion\":9}', 1, '2025-11-21 21:19:52'),
(228, 67, 'grade', 'Calificación publicada', 'Tu entrega fue calificada con 100', '/alumno/actividades', '{\"entrega_id\":1,\"actividad_id\":7,\"calificacion\":100}', 1, '2025-11-21 21:34:47'),
(229, 67, 'assignment', 'Nuevo quiz publicado', 'Se publicó un nuevo quiz: Matemáticas y pensamiento analítico (IA · 5 preguntas)', '/alumno/actividades?type=quiz&quizId=3', '{\"actividad_id\":3,\"kind\":\"quiz\"}', 1, '2025-11-24 15:50:42'),
(230, 69, 'assignment', 'Nuevo quiz publicado', 'Se publicó un nuevo quiz: Matemáticas y pensamiento analítico (IA · 5 preguntas)', '/alumno/actividades?type=quiz&quizId=3', '{\"actividad_id\":3,\"kind\":\"quiz\"}', 0, '2025-11-24 15:50:42'),
(231, 71, 'assignment', 'Nuevo quiz publicado', 'Se publicó un nuevo quiz: Matemáticas y pensamiento analítico (IA · 5 preguntas)', '/alumno/actividades?type=quiz&quizId=3', '{\"actividad_id\":3,\"kind\":\"quiz\"}', 0, '2025-11-24 15:50:42'),
(232, 72, 'assignment', 'Nuevo quiz publicado', 'Se publicó un nuevo quiz: Matemáticas y pensamiento analítico (IA · 5 preguntas)', '/alumno/actividades?type=quiz&quizId=3', '{\"actividad_id\":3,\"kind\":\"quiz\"}', 0, '2025-11-24 15:50:42'),
(233, 73, 'assignment', 'Nuevo quiz publicado', 'Se publicó un nuevo quiz: Matemáticas y pensamiento analítico (IA · 5 preguntas)', '/alumno/actividades?type=quiz&quizId=3', '{\"actividad_id\":3,\"kind\":\"quiz\"}', 0, '2025-11-24 15:50:42'),
(234, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":12,\"kind\":\"simulacion\"}', 1, '2025-11-24 20:54:51'),
(235, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":12,\"kind\":\"simulacion\"}', 0, '2025-11-24 20:54:51'),
(236, 71, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":12,\"kind\":\"simulacion\"}', 0, '2025-11-24 20:54:51'),
(237, 72, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":12,\"kind\":\"simulacion\"}', 0, '2025-11-24 20:54:51'),
(238, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":12,\"kind\":\"simulacion\"}', 0, '2025-11-24 20:54:51'),
(239, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: este no es general', '/alumno/simulaciones', '{\"simulacion_id\":14,\"kind\":\"simulacion\"}', 1, '2025-11-24 21:09:22'),
(240, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: este no es general', '/alumno/simulaciones', '{\"simulacion_id\":14,\"kind\":\"simulacion\"}', 0, '2025-11-24 21:09:22'),
(241, 71, 'assignment', 'Nueva simulación asignada', 'Se te asignó: este no es general', '/alumno/simulaciones', '{\"simulacion_id\":14,\"kind\":\"simulacion\"}', 0, '2025-11-24 21:09:22'),
(242, 72, 'assignment', 'Nueva simulación asignada', 'Se te asignó: este no es general', '/alumno/simulaciones', '{\"simulacion_id\":14,\"kind\":\"simulacion\"}', 0, '2025-11-24 21:09:22'),
(243, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: este no es general', '/alumno/simulaciones', '{\"simulacion_id\":14,\"kind\":\"simulacion\"}', 0, '2025-11-24 21:09:22'),
(244, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":15,\"kind\":\"simulacion\"}', 1, '2025-11-24 21:29:25'),
(245, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":15,\"kind\":\"simulacion\"}', 0, '2025-11-24 21:29:25'),
(246, 71, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":15,\"kind\":\"simulacion\"}', 0, '2025-11-24 21:29:25'),
(247, 72, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":15,\"kind\":\"simulacion\"}', 0, '2025-11-24 21:29:25'),
(248, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":15,\"kind\":\"simulacion\"}', 0, '2025-11-24 21:29:25'),
(249, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":16,\"kind\":\"simulacion\"}', 1, '2025-11-24 21:37:21'),
(250, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":16,\"kind\":\"simulacion\"}', 0, '2025-11-24 21:37:21'),
(251, 71, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":16,\"kind\":\"simulacion\"}', 0, '2025-11-24 21:37:21'),
(252, 72, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":16,\"kind\":\"simulacion\"}', 0, '2025-11-24 21:37:21'),
(253, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":16,\"kind\":\"simulacion\"}', 0, '2025-11-24 21:37:21'),
(254, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":17,\"kind\":\"simulacion\"}', 1, '2025-11-24 21:43:30'),
(255, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":17,\"kind\":\"simulacion\"}', 0, '2025-11-24 21:43:30'),
(256, 71, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":17,\"kind\":\"simulacion\"}', 0, '2025-11-24 21:43:30'),
(257, 72, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":17,\"kind\":\"simulacion\"}', 0, '2025-11-24 21:43:30'),
(258, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":17,\"kind\":\"simulacion\"}', 0, '2025-11-24 21:43:30'),
(259, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":18,\"kind\":\"simulacion\"}', 1, '2025-11-24 21:45:56'),
(260, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":18,\"kind\":\"simulacion\"}', 0, '2025-11-24 21:45:56'),
(261, 71, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":18,\"kind\":\"simulacion\"}', 0, '2025-11-24 21:45:56'),
(262, 72, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":18,\"kind\":\"simulacion\"}', 0, '2025-11-24 21:45:56'),
(263, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":18,\"kind\":\"simulacion\"}', 0, '2025-11-24 21:45:56'),
(264, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 3 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":19,\"kind\":\"simulacion\"}', 1, '2025-11-24 22:03:48'),
(265, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 3 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":19,\"kind\":\"simulacion\"}', 0, '2025-11-24 22:03:48'),
(266, 71, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 3 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":19,\"kind\":\"simulacion\"}', 0, '2025-11-24 22:03:48'),
(267, 72, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 3 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":19,\"kind\":\"simulacion\"}', 0, '2025-11-24 22:03:48'),
(268, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: Ciencias Exactas (IA · 3 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":19,\"kind\":\"simulacion\"}', 0, '2025-11-24 22:03:48'),
(269, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":23,\"kind\":\"simulacion\"}', 1, '2025-11-25 15:44:03'),
(270, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":23,\"kind\":\"simulacion\"}', 0, '2025-11-25 15:44:03'),
(271, 71, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":23,\"kind\":\"simulacion\"}', 0, '2025-11-25 15:44:03'),
(272, 72, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":23,\"kind\":\"simulacion\"}', 0, '2025-11-25 15:44:03'),
(273, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":23,\"kind\":\"simulacion\"}', 0, '2025-11-25 15:44:03'),
(274, 67, 'assignment', 'Nueva actividad asignada', 'Se te asignó: sljdlksjzadklasjd', '/alumno/actividades', '{\"actividad_id\":8}', 1, '2025-11-26 21:01:57'),
(275, 69, 'assignment', 'Nueva actividad asignada', 'Se te asignó: sljdlksjzadklasjd', '/alumno/actividades', '{\"actividad_id\":8}', 0, '2025-11-26 21:01:57'),
(276, 73, 'assignment', 'Nueva actividad asignada', 'Se te asignó: sljdlksjzadklasjd', '/alumno/actividades', '{\"actividad_id\":8}', 0, '2025-11-26 21:01:57'),
(277, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":30,\"kind\":\"simulacion\"}', 1, '2025-12-15 22:23:55'),
(278, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":30,\"kind\":\"simulacion\"}', 0, '2025-12-15 22:23:55'),
(279, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":30,\"kind\":\"simulacion\"}', 0, '2025-12-15 22:23:55'),
(280, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":31,\"kind\":\"simulacion\"}', 1, '2025-12-15 22:32:19');
INSERT INTO `student_notifications` (`id`, `student_id`, `type`, `title`, `message`, `action_url`, `metadata`, `is_read`, `created_at`) VALUES
(281, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":31,\"kind\":\"simulacion\"}', 0, '2025-12-15 22:32:19'),
(282, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":31,\"kind\":\"simulacion\"}', 0, '2025-12-15 22:32:19'),
(283, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":32,\"kind\":\"simulacion\"}', 1, '2025-12-15 22:34:42'),
(284, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":32,\"kind\":\"simulacion\"}', 0, '2025-12-15 22:34:42'),
(285, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":32,\"kind\":\"simulacion\"}', 0, '2025-12-15 22:34:42'),
(286, 67, 'assignment', 'Nuevo quiz publicado', 'Se publicó un nuevo quiz: Matemáticas y pensamiento analítico (IA · 5 preguntas)', '/alumno/actividades?type=quiz&quizId=5', '{\"actividad_id\":5,\"kind\":\"quiz\"}', 1, '2025-12-17 19:51:50'),
(287, 69, 'assignment', 'Nuevo quiz publicado', 'Se publicó un nuevo quiz: Matemáticas y pensamiento analítico (IA · 5 preguntas)', '/alumno/actividades?type=quiz&quizId=5', '{\"actividad_id\":5,\"kind\":\"quiz\"}', 0, '2025-12-17 19:51:50'),
(288, 73, 'assignment', 'Nuevo quiz publicado', 'Se publicó un nuevo quiz: Matemáticas y pensamiento analítico (IA · 5 preguntas)', '/alumno/actividades?type=quiz&quizId=5', '{\"actividad_id\":5,\"kind\":\"quiz\"}', 0, '2025-12-17 19:51:50'),
(289, 67, 'assignment', 'Nuevo quiz publicado', 'Se publicó un nuevo quiz: Español y redacción indirecta (IA · 5 preguntas)', '/alumno/actividades?type=quiz&quizId=4', '{\"actividad_id\":4,\"kind\":\"quiz\"}', 1, '2025-12-17 20:44:03'),
(290, 69, 'assignment', 'Nuevo quiz publicado', 'Se publicó un nuevo quiz: Español y redacción indirecta (IA · 5 preguntas)', '/alumno/actividades?type=quiz&quizId=4', '{\"actividad_id\":4,\"kind\":\"quiz\"}', 0, '2025-12-17 20:44:03'),
(291, 73, 'assignment', 'Nuevo quiz publicado', 'Se publicó un nuevo quiz: Español y redacción indirecta (IA · 5 preguntas)', '/alumno/actividades?type=quiz&quizId=4', '{\"actividad_id\":4,\"kind\":\"quiz\"}', 0, '2025-12-17 20:44:03'),
(292, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":36,\"kind\":\"simulacion\"}', 1, '2025-12-17 21:54:47'),
(293, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":36,\"kind\":\"simulacion\"}', 0, '2025-12-17 21:54:47'),
(294, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: algebra (IA · 5 preguntas)', '/alumno/simulaciones', '{\"simulacion_id\":36,\"kind\":\"simulacion\"}', 0, '2025-12-17 21:54:47'),
(295, 67, 'assignment', 'Nueva simulación asignada', 'Se te asignó: cdsadasdsa', '/alumno/simulaciones', '{\"simulacion_id\":38,\"kind\":\"simulacion\"}', 1, '2025-12-25 22:13:18'),
(296, 69, 'assignment', 'Nueva simulación asignada', 'Se te asignó: cdsadasdsa', '/alumno/simulaciones', '{\"simulacion_id\":38,\"kind\":\"simulacion\"}', 0, '2025-12-25 22:13:18'),
(297, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: cdsadasdsa', '/alumno/simulaciones', '{\"simulacion_id\":38,\"kind\":\"simulacion\"}', 0, '2025-12-25 22:13:18');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `student_reminders`
--

CREATE TABLE `student_reminders` (
  `id` bigint(20) NOT NULL,
  `student_id` bigint(20) NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `date` date NOT NULL,
  `priority` enum('red','orange','yellow','green','blue','purple') DEFAULT 'blue',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `asesor_user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `student_resources`
--

CREATE TABLE `student_resources` (
  `id` int(11) NOT NULL,
  `estudiante_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_size` bigint(20) NOT NULL,
  `file_type` varchar(100) NOT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `test_options`
--

CREATE TABLE `test_options` (
  `id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `text` varchar(500) NOT NULL,
  `is_correct` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `test_options`
--

INSERT INTO `test_options` (`id`, `question_id`, `text`, `is_correct`, `created_at`) VALUES
(1, 1, '24', 0, '2025-09-24 17:57:19'),
(2, 1, '30', 0, '2025-09-24 17:57:19'),
(3, 1, '32', 1, '2025-09-24 17:57:19'),
(4, 1, '36', 0, '2025-09-24 17:57:19'),
(5, 2, 'felino', 1, '2025-09-24 17:57:19'),
(6, 2, 'ómnivoro', 0, '2025-09-24 17:57:19'),
(7, 2, 'doméstico', 0, '2025-09-24 17:57:19'),
(8, 2, 'mamífero', 0, '2025-09-24 17:57:19'),
(9, 3, 'S', 0, '2025-09-24 17:57:19'),
(10, 3, 'U', 1, '2025-09-24 17:57:19'),
(11, 3, 'V', 0, '2025-09-24 17:57:19'),
(12, 3, 'T', 0, '2025-09-24 17:57:19'),
(13, 4, 'Sí, siempre', 0, '2025-09-24 17:57:19'),
(14, 4, 'No, es imposible', 1, '2025-09-24 17:57:19'),
(15, 4, 'Solo a veces', 0, '2025-09-24 17:57:19'),
(16, 4, 'Depende del tamaño de C', 0, '2025-09-24 17:57:19'),
(17, 5, 'Triángulo', 0, '2025-09-24 17:57:19'),
(18, 5, 'Cuadrado', 0, '2025-09-24 17:57:19'),
(19, 5, 'Círculo', 0, '2025-09-24 17:57:19'),
(20, 5, 'Esfera', 1, '2025-09-24 17:57:19'),
(21, 6, 'Miércoles', 1, '2025-09-24 17:57:19'),
(22, 6, 'Jueves', 0, '2025-09-24 17:57:19'),
(23, 6, 'Viernes', 0, '2025-09-24 17:57:19'),
(24, 6, 'Domingo', 0, '2025-09-24 17:57:19'),
(25, 7, '64', 1, '2025-09-24 17:57:20'),
(26, 7, '72', 0, '2025-09-24 17:57:20'),
(27, 7, '80', 0, '2025-09-24 17:57:20'),
(28, 7, '96', 0, '2025-09-24 17:57:20'),
(29, 8, 'x = 5', 1, '2025-09-24 17:57:20'),
(30, 8, 'x = 15', 0, '2025-09-24 17:57:20'),
(31, 8, 'x = 4', 0, '2025-09-24 17:57:20'),
(32, 8, 'x = 10', 0, '2025-09-24 17:57:20'),
(33, 9, '6/8', 1, '2025-09-24 17:57:20'),
(34, 9, '9/16', 0, '2025-09-24 17:57:20'),
(35, 9, '12/20', 0, '2025-09-24 17:57:20'),
(36, 9, '15/24', 0, '2025-09-24 17:57:20'),
(37, 10, '84 cm²', 1, '2025-09-24 17:57:20'),
(38, 10, '38 cm²', 0, '2025-09-24 17:57:20'),
(39, 10, '96 cm²', 0, '2025-09-24 17:57:20'),
(40, 10, '60 cm²', 0, '2025-09-24 17:57:20'),
(41, 11, '8', 1, '2025-09-24 17:57:20'),
(42, 11, '12', 0, '2025-09-24 17:57:20'),
(43, 11, '10', 0, '2025-09-24 17:57:20'),
(44, 11, '6', 0, '2025-09-24 17:57:20'),
(45, 12, '15', 1, '2025-09-24 17:57:20'),
(46, 12, '12', 0, '2025-09-24 17:57:20'),
(47, 12, '18', 0, '2025-09-24 17:57:20'),
(48, 12, '20', 0, '2025-09-24 17:57:20');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `test_questions`
--

CREATE TABLE `test_questions` (
  `id` int(11) NOT NULL,
  `test_type` varchar(32) NOT NULL,
  `prompt` text NOT NULL,
  `points` int(11) NOT NULL DEFAULT 10,
  `difficulty` varchar(16) DEFAULT NULL,
  `dimension` varchar(32) DEFAULT NULL,
  `tags` longtext DEFAULT NULL,
  `source` varchar(16) NOT NULL DEFAULT 'human',
  `status` varchar(16) NOT NULL DEFAULT 'draft',
  `seed_prompt` longtext DEFAULT NULL,
  `provenance_model` varchar(64) DEFAULT NULL,
  `hash` varchar(64) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `test_questions`
--

INSERT INTO `test_questions` (`id`, `test_type`, `prompt`, `points`, `difficulty`, `dimension`, `tags`, `source`, `status`, `seed_prompt`, `provenance_model`, `hash`, `active`, `created_at`) VALUES
(1, 'wais', '¿Cuál es el siguiente número de la secuencia? 2, 4, 8, 16, ?', 10, NULL, NULL, NULL, 'human', 'draft', NULL, NULL, NULL, 1, '2025-09-24 17:57:19'),
(2, 'wais', 'Perro es a canino como gato es a _____', 10, NULL, NULL, NULL, 'human', 'draft', NULL, NULL, NULL, 1, '2025-09-24 17:57:19'),
(3, 'wais', 'Complete la serie: A, C, F, J, O, __', 10, NULL, NULL, NULL, 'human', 'draft', NULL, NULL, NULL, 1, '2025-09-24 17:57:19'),
(4, 'wais', 'Si todos los A son B y ningún B es C, entonces ¿algún A puede ser C?', 10, NULL, NULL, NULL, 'human', 'draft', NULL, NULL, NULL, 1, '2025-09-24 17:57:19'),
(5, 'wais', '¿Cuál no pertenece al grupo? Triángulo, Cuadrado, Círculo, Esfera', 10, NULL, NULL, NULL, 'human', 'draft', NULL, NULL, NULL, 1, '2025-09-24 17:57:19'),
(6, 'wais', 'Si hoy es lunes, ¿qué día será dentro de 100 días?', 10, NULL, NULL, NULL, 'human', 'draft', NULL, NULL, NULL, 1, '2025-09-24 17:57:19'),
(7, 'matematica', '¿Cuál es el 25% de 320?', 10, NULL, NULL, NULL, 'human', 'draft', NULL, NULL, NULL, 1, '2025-09-24 17:57:20'),
(8, 'matematica', 'Resuelva para x: 3x + 5 = 20', 10, NULL, NULL, NULL, 'human', 'draft', NULL, NULL, NULL, 1, '2025-09-24 17:57:20'),
(9, 'matematica', '¿Cuál fracción es equivalente a 3/4?', 10, NULL, NULL, NULL, 'human', 'draft', NULL, NULL, NULL, 1, '2025-09-24 17:57:20'),
(10, 'matematica', 'Calcule el área de un rectángulo de 7 cm por 12 cm.', 10, NULL, NULL, NULL, 'human', 'draft', NULL, NULL, NULL, 1, '2025-09-24 17:57:20'),
(11, 'matematica', 'Evalúe: 6 + 2 × 3 - 4', 10, NULL, NULL, NULL, 'human', 'draft', NULL, NULL, NULL, 1, '2025-09-24 17:57:20'),
(12, 'matematica', 'Una receta usa 3 tazas de harina por 2 tazas de agua. ¿Cuánta harina se necesita para 10 tazas de agua?', 10, NULL, NULL, NULL, 'human', 'draft', NULL, NULL, NULL, 1, '2025-09-24 17:57:20');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `usuario` varchar(100) NOT NULL,
  `contraseña` varchar(255) NOT NULL,
  `must_change` tinyint(1) NOT NULL DEFAULT 1,
  `last_login_at` datetime DEFAULT NULL,
  `password_changed_at` datetime DEFAULT NULL,
  `failed_attempts` int(11) NOT NULL DEFAULT 0,
  `locked_until` datetime DEFAULT NULL,
  `role` varchar(100) NOT NULL,
  `id_estudiante` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `usuario`, `contraseña`, `must_change`, `last_login_at`, `password_changed_at`, `failed_attempts`, `locked_until`, `role`, `id_estudiante`, `created_at`) VALUES
(3, 'miguel', '$2b$10$JkGqmotlDUI4Kuutn3ywoesTpA3izIF6QjlJUygfyizNoO9xJpJye', 1, '2025-12-25 16:20:52', NULL, 0, NULL, 'estudiante', 67, '2025-08-11 00:41:45'),
(6, 'jesica_admin', '$2b$10$C9FZlnOw4.vJfjxh5E/H8OZu0S7g7ZF.dRiCopqNfz/8Hta1ta9VW', 1, '2025-12-25 16:09:36', NULL, 0, NULL, 'admin', NULL, '2025-08-11 04:00:37'),
(8, 'jessica.mqerk', '$2b$10$/.53BvJ4Vuh6E910koGzqOOHU7m5kvsR2x8q8gE.4iN7tEem93Une', 1, NULL, NULL, 0, NULL, 'estudiante', 69, '2025-08-11 19:36:41'),
(10, 'kelvincienytec', '$2b$10$A.Y8E73jINN6a0AWHDEId.lxAy6F4HBSz83NZhEvchCwAgGXfa7Oa', 1, '2025-10-06 11:03:12', NULL, 0, NULL, 'asesor', NULL, '2025-08-11 22:48:41'),
(20, 'juan8', '$2b$10$WY5sxiP7FVP5q6MxJHcsFeKo5P8Aah.9HvfqfWYkQF.ULEeBPewdC', 1, NULL, NULL, 0, NULL, 'estudiante', 73, '2025-08-21 18:19:30'),
(21, 'jair.asesor', '$2b$10$UjpfEXATomGY6ftdqu2niuLgNQ7sGLkd8Or/5EeQwsJW5d.ybdDp6', 0, '2025-12-25 16:11:23', '2025-10-13 12:59:25', 0, NULL, 'asesor', NULL, '2025-10-06 17:29:14'),
(22, 'Eduardo_1', '$2b$10$KkhPtNqVnR4qJmSFWi1mL.YyregJKx7/f1C0Pt2iIhZMZSDxeX12e', 1, '2025-12-09 18:36:21', NULL, 0, NULL, 'estudiante', 74, '2025-12-10 00:36:12'),
(24, 'haniel1', '$2b$10$VWtioJTqDMtc4DeBAz4O/uOesqFZLHyzWtSLq9Z.q/IQog1.94MLe', 1, '2025-12-25 11:15:19', NULL, 0, NULL, 'estudiante', 76, '2025-12-25 01:37:17');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_gasto_mensual`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_gasto_mensual` (
`mes` varchar(7)
,`total_gasto` decimal(33,2)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_quiz_resumen_materias`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_quiz_resumen_materias` (
`id_quiz` int(11)
,`id_estudiante` int(11)
,`id_materia` int(11)
,`materia` varchar(120)
,`preguntas_vistas` bigint(21)
,`correctas` decimal(22,0)
,`ratio_correctas` decimal(26,4)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_ai_uso_diario_usuario`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_ai_uso_diario_usuario` (
`id_usuario` int(11)
,`fecha` date
,`tipo_operacion` enum('formula','quiz_analysis','simulador','general')
,`total_llamadas` bigint(21)
,`exitosas` decimal(22,0)
,`fallidas` decimal(22,0)
,`tokens_totales` decimal(32,0)
,`duracion_promedio_ms` decimal(14,4)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_ai_uso_global_diario`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_ai_uso_global_diario` (
`fecha` date
,`total_llamadas` bigint(21)
,`exitosas` decimal(22,0)
,`fallidas` decimal(22,0)
,`tokens_totales` decimal(32,0)
,`usuarios_activos` bigint(21)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_gasto_mensual`
--
DROP TABLE IF EXISTS `vw_gasto_mensual`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_gasto_mensual`  AS SELECT `ym`.`mes` AS `mes`, coalesce(`gf`.`total_gasto`,0) + coalesce(`gv`.`total_gasto`,0) AS `total_gasto` FROM (((select date_format(curdate() - interval `s`.`seq` month,'%Y-%m') AS `mes` from (select 0 AS `seq` union all select 1 AS `1` union all select 2 AS `2` union all select 3 AS `3` union all select 4 AS `4` union all select 5 AS `5` union all select 6 AS `6` union all select 7 AS `7` union all select 8 AS `8` union all select 9 AS `9` union all select 10 AS `10` union all select 11 AS `11`) `s`) `ym` left join (select date_format(`gastos_fijos`.`fecha`,'%Y-%m') AS `mes`,sum(`gastos_fijos`.`importe`) AS `total_gasto` from `gastos_fijos` where `gastos_fijos`.`estatus` = 'Pagado' group by date_format(`gastos_fijos`.`fecha`,'%Y-%m')) `gf` on(`gf`.`mes` = `ym`.`mes`)) left join (select date_format(`gastos_variables`.`created_at`,'%Y-%m') AS `mes`,sum(`gastos_variables`.`importe`) AS `total_gasto` from `gastos_variables` where `gastos_variables`.`estatus` = 'Pagado' group by date_format(`gastos_variables`.`created_at`,'%Y-%m')) `gv` on(`gv`.`mes` = `ym`.`mes`)) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_quiz_resumen_materias`
--
DROP TABLE IF EXISTS `vw_quiz_resumen_materias`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_quiz_resumen_materias`  AS SELECT `s`.`id_quiz` AS `id_quiz`, `s`.`id_estudiante` AS `id_estudiante`, `m`.`id` AS `id_materia`, `m`.`nombre` AS `materia`, count(distinct `sr`.`id_pregunta`) AS `preguntas_vistas`, sum(case when `sr`.`correcta` = 1 then 1 else 0 end) AS `correctas`, sum(case when `sr`.`correcta` = 1 then 1 else 0 end) / nullif(count(distinct `sr`.`id_pregunta`),0) AS `ratio_correctas` FROM (((`quizzes_sesiones_respuestas` `sr` join `quizzes_sesiones` `s` on(`s`.`id` = `sr`.`id_sesion` and `s`.`estado` = 'finalizado')) join `quizzes_preguntas_materias` `pm` on(`pm`.`id_pregunta` = `sr`.`id_pregunta`)) join `quizzes_materias` `m` on(`m`.`id` = `pm`.`id_materia`)) GROUP BY `s`.`id_quiz`, `s`.`id_estudiante`, `m`.`id`, `m`.`nombre` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `v_ai_uso_diario_usuario`
--
DROP TABLE IF EXISTS `v_ai_uso_diario_usuario`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_ai_uso_diario_usuario`  AS SELECT `ai_usage_log`.`id_usuario` AS `id_usuario`, cast(`ai_usage_log`.`timestamp` as date) AS `fecha`, `ai_usage_log`.`tipo_operacion` AS `tipo_operacion`, count(0) AS `total_llamadas`, sum(case when `ai_usage_log`.`exito` = 1 then 1 else 0 end) AS `exitosas`, sum(case when `ai_usage_log`.`exito` = 0 then 1 else 0 end) AS `fallidas`, sum(`ai_usage_log`.`tokens_estimados`) AS `tokens_totales`, avg(`ai_usage_log`.`duracion_ms`) AS `duracion_promedio_ms` FROM `ai_usage_log` GROUP BY `ai_usage_log`.`id_usuario`, cast(`ai_usage_log`.`timestamp` as date), `ai_usage_log`.`tipo_operacion` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `v_ai_uso_global_diario`
--
DROP TABLE IF EXISTS `v_ai_uso_global_diario`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_ai_uso_global_diario`  AS SELECT cast(`ai_usage_log`.`timestamp` as date) AS `fecha`, count(0) AS `total_llamadas`, sum(case when `ai_usage_log`.`exito` = 1 then 1 else 0 end) AS `exitosas`, sum(case when `ai_usage_log`.`exito` = 0 then 1 else 0 end) AS `fallidas`, sum(`ai_usage_log`.`tokens_estimados`) AS `tokens_totales`, count(distinct `ai_usage_log`.`id_usuario`) AS `usuarios_activos` FROM `ai_usage_log` GROUP BY cast(`ai_usage_log`.`timestamp` as date) ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `actividades`
--
ALTER TABLE `actividades`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_actividades_tipo` (`tipo`),
  ADD KEY `idx_actividades_fecha_limite` (`fecha_limite`),
  ADD KEY `idx_actividades_activo` (`activo`),
  ADD KEY `idx_actividades_area` (`id_area`),
  ADD KEY `idx_actividades_activo_publicado` (`activo`,`publicado`),
  ADD KEY `idx_actividades_publicado` (`publicado`);

--
-- Indices de la tabla `actividades_entregas`
--
ALTER TABLE `actividades_entregas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_entregas_actividad_estudiante` (`id_actividad`,`id_estudiante`),
  ADD KEY `idx_entregas_estudiante` (`id_estudiante`),
  ADD KEY `idx_entregas_estado` (`estado`),
  ADD KEY `fk_entregas_replaced` (`replaced_by`),
  ADD KEY `idx_entregas_estudiante_estado` (`id_estudiante`,`estado`),
  ADD KEY `idx_entregas_revisada_at` (`revisada_at`),
  ADD KEY `idx_entregas_comentarios_updated_at` (`comentarios_updated_at`),
  ADD KEY `idx_entregas_estudiante_created` (`id_estudiante`,`created_at`),
  ADD KEY `idx_entregas_actividad_estado` (`id_actividad`,`estado`),
  ADD KEY `idx_entregas_actividad` (`id_actividad`);

--
-- Indices de la tabla `actividades_entregas_archivos`
--
ALTER TABLE `actividades_entregas_archivos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_entrega_archivos_entrega` (`entrega_id`),
  ADD KEY `idx_entregas_archivos_entrega` (`entrega_id`);

--
-- Indices de la tabla `actividades_fecha_extensiones`
--
ALTER TABLE `actividades_fecha_extensiones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_extension_actividad` (`id_actividad`),
  ADD KEY `idx_extension_grupo` (`grupo`),
  ADD KEY `idx_extension_estudiante` (`id_estudiante`),
  ADD KEY `idx_extension_tipo` (`tipo`),
  ADD KEY `idx_extensiones_actividad` (`id_actividad`),
  ADD KEY `idx_extensiones_estudiante` (`id_estudiante`);

--
-- Indices de la tabla `admin_asesoria_confirmaciones`
--
ALTER TABLE `admin_asesoria_confirmaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_ingreso` (`ingreso_id`),
  ADD KEY `idx_asesor` (`asesor_user_id`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indices de la tabla `admin_config`
--
ALTER TABLE `admin_config`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `admin_emails`
--
ALTER TABLE `admin_emails`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `admin_profiles`
--
ALTER TABLE `admin_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_admin_email` (`email`),
  ADD KEY `idx_admin_user_id` (`user_id`),
  ADD KEY `idx_admin_profiles_user` (`user_id`);

--
-- Indices de la tabla `admin_resources`
--
ALTER TABLE `admin_resources`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_admin_created` (`admin_user_id`,`created_at`),
  ADD KEY `idx_admin_type` (`admin_user_id`,`file_type`);
ALTER TABLE `admin_resources` ADD FULLTEXT KEY `idx_search` (`title`,`description`);

--
-- Indices de la tabla `ai_quota_config`
--
ALTER TABLE `ai_quota_config`
  ADD PRIMARY KEY (`id`),
  ADD KEY `actualizado_por` (`actualizado_por`);

--
-- Indices de la tabla `ai_usage_log`
--
ALTER TABLE `ai_usage_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario_fecha` (`id_usuario`,`timestamp`),
  ADD KEY `idx_tipo_fecha` (`tipo_operacion`,`timestamp`),
  ADD KEY `idx_fecha` (`timestamp`),
  ADD KEY `idx_ai_log_usuario` (`id_usuario`),
  ADD KEY `idx_ai_log_timestamp` (`timestamp`);

--
-- Indices de la tabla `ai_usage_stats`
--
ALTER TABLE `ai_usage_stats`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_fecha_usuario_tipo` (`fecha`,`id_usuario`,`tipo_operacion`),
  ADD KEY `idx_fecha` (`fecha`),
  ADD KEY `idx_usuario` (`id_usuario`);

--
-- Indices de la tabla `areas`
--
ALTER TABLE `areas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_areas_tipo` (`tipo`),
  ADD KEY `idx_areas_activo` (`activo`);

--
-- Indices de la tabla `asesor_notifications`
--
ALTER TABLE `asesor_notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_asesor_unread` (`asesor_user_id`,`is_read`),
  ADD KEY `idx_asesor_created` (`asesor_user_id`,`created_at`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_asesor_notif_user` (`asesor_user_id`),
  ADD KEY `idx_asesor_notif_read` (`is_read`);

--
-- Indices de la tabla `asesor_perfiles`
--
ALTER TABLE `asesor_perfiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_asesor_perfiles_preregistro` (`preregistro_id`),
  ADD KEY `idx_ap_preregistro` (`preregistro_id`),
  ADD KEY `idx_ap_usuario` (`usuario_id`),
  ADD KEY `idx_asesor_perfiles_curp` (`curp`),
  ADD KEY `idx_asesor_perfiles_grupo` (`grupo_asesor`),
  ADD KEY `idx_asesor_perfiles_usuario` (`usuario_id`),
  ADD KEY `idx_asesor_perfiles_preregistro` (`preregistro_id`);

--
-- Indices de la tabla `asesor_preregistros`
--
ALTER TABLE `asesor_preregistros`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_asesor_prereg_correo` (`correo`),
  ADD KEY `idx_asesor_prereg_status` (`status`);

--
-- Indices de la tabla `asesor_reminders`
--
ALTER TABLE `asesor_reminders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_asesor_date` (`asesor_user_id`,`date`);

--
-- Indices de la tabla `asesor_resources`
--
ALTER TABLE `asesor_resources`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_asesor_created` (`asesor_user_id`,`created_at`),
  ADD KEY `idx_asesor_type` (`asesor_user_id`,`file_type`);
ALTER TABLE `asesor_resources` ADD FULLTEXT KEY `idx_search` (`title`,`description`);

--
-- Indices de la tabla `asesor_tests`
--
ALTER TABLE `asesor_tests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_asesor_tests_preregistro` (`preregistro_id`);

--
-- Indices de la tabla `asesor_tests_history`
--
ALTER TABLE `asesor_tests_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_asesor_tests_hist_prereg` (`preregistro_id`);

--
-- Indices de la tabla `asesor_test_forms`
--
ALTER TABLE `asesor_test_forms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_preregistro_type` (`preregistro_id`,`test_type`);

--
-- Indices de la tabla `asistencias`
--
ALTER TABLE `asistencias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_estudiante_fecha_tipo` (`id_estudiante`,`fecha`,`tipo`),
  ADD KEY `idx_estudiante` (`id_estudiante`),
  ADD KEY `idx_asesor` (`id_asesor`),
  ADD KEY `idx_fecha` (`fecha`),
  ADD KEY `idx_estudiante_fecha` (`id_estudiante`,`fecha`),
  ADD KEY `idx_asistencias_estudiante_fecha` (`id_estudiante`,`fecha`),
  ADD KEY `idx_asistencias_asesor_fecha` (`id_asesor`,`fecha`),
  ADD KEY `idx_asistencias_tipo` (`tipo`),
  ADD KEY `idx_asistencias_fecha` (`fecha`),
  ADD KEY `idx_asistencias_estudiante` (`id_estudiante`),
  ADD KEY `idx_asistencias_asesor` (`id_asesor`);

--
-- Indices de la tabla `calendar_events`
--
ALTER TABLE `calendar_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_calendar_events_user_fecha` (`user_id`,`fecha`),
  ADD KEY `idx_calendar_user_fecha` (`user_id`,`fecha`),
  ADD KEY `idx_calendar_completado` (`completado`),
  ADD KEY `idx_calendar_tipo` (`tipo`),
  ADD KEY `idx_calendar_fecha` (`fecha`),
  ADD KEY `idx_calendar_user` (`user_id`);

--
-- Indices de la tabla `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `idx_created` (`created_at`),
  ADD KEY `idx_chat_category` (`category`),
  ADD KEY `idx_chat_category_student` (`category`,`student_id`),
  ADD KEY `idx_chat_student_created` (`student_id`,`created_at`),
  ADD KEY `idx_chat_unread` (`is_read`,`sender_role`),
  ADD KEY `idx_chat_student_category` (`student_id`,`category`,`created_at`);

--
-- Indices de la tabla `comprobantes`
--
ALTER TABLE `comprobantes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_estudiante` (`id_estudiante`),
  ADD KEY `idx_comprobantes_estudiante` (`id_estudiante`);

--
-- Indices de la tabla `contratos`
--
ALTER TABLE `contratos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_contratos_folio` (`folio`),
  ADD KEY `fk_contratos_estudiante` (`id_estudiante`),
  ADD KEY `idx_contratos_estudiante` (`id_estudiante`);

--
-- Indices de la tabla `documentos_asesor`
--
ALTER TABLE `documentos_asesor`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_asesor` (`id_asesor`),
  ADD KEY `idx_tipo_seccion` (`tipo_seccion`),
  ADD KEY `idx_estado` (`estado`);

--
-- Indices de la tabla `eeau`
--
ALTER TABLE `eeau`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `idx_eeau_activo` (`activo`);

--
-- Indices de la tabla `estudiantes`
--
ALTER TABLE `estudiantes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_estudiantes_folio_formateado` (`folio_formateado`),
  ADD KEY `idx_estudiantes_estatus` (`estatus`),
  ADD KEY `idx_estudiantes_grupo` (`grupo`),
  ADD KEY `idx_estudiantes_asesor` (`asesor`),
  ADD KEY `idx_estudiantes_curso` (`curso`);

--
-- Indices de la tabla `estudiantes_config`
--
ALTER TABLE `estudiantes_config`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_estudiante` (`id_estudiante`);

--
-- Indices de la tabla `feedback_submissions`
--
ALTER TABLE `feedback_submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_feedback_submissions_task_student` (`id_task`,`id_estudiante`),
  ADD KEY `idx_feedback_submissions_student` (`id_estudiante`),
  ADD KEY `fk_feedback_submissions_replaced` (`replaced_by`),
  ADD KEY `idx_feedback_estudiante` (`id_estudiante`),
  ADD KEY `idx_feedback_task` (`id_task`);

--
-- Indices de la tabla `feedback_submission_notes`
--
ALTER TABLE `feedback_submission_notes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_submission` (`id_submission`);

--
-- Indices de la tabla `feedback_tasks`
--
ALTER TABLE `feedback_tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_feedback_tasks_due_date` (`due_date`),
  ADD KEY `idx_feedback_tasks_activo` (`activo`);

--
-- Indices de la tabla `formulas`
--
ALTER TABLE `formulas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_categoria` (`categoria`),
  ADD KEY `idx_activo` (`activo`),
  ADD KEY `idx_orden` (`orden`);

--
-- Indices de la tabla `gastos_fijos`
--
ALTER TABLE `gastos_fijos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_gastos_fijos_fecha` (`fecha`),
  ADD KEY `idx_gastos_fijos_metodo` (`metodo`),
  ADD KEY `idx_gastos_fijos_estatus` (`estatus`),
  ADD KEY `idx_gastos_fijos_frecuencia` (`frecuencia`),
  ADD KEY `idx_gastos_fijos_calendar_event_id` (`calendar_event_id`);

--
-- Indices de la tabla `gastos_fijos_plantillas`
--
ALTER TABLE `gastos_fijos_plantillas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoria` (`categoria`),
  ADD KEY `activo` (`activo`);

--
-- Indices de la tabla `gastos_variables`
--
ALTER TABLE `gastos_variables`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_gastos_variables_metodo` (`metodo`),
  ADD KEY `idx_gastos_variables_estatus` (`estatus`);

--
-- Indices de la tabla `ingresos`
--
ALTER TABLE `ingresos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ingresos_fecha` (`fecha`),
  ADD KEY `idx_ingresos_estudiante` (`estudiante_id`),
  ADD KEY `idx_ingresos_metodo` (`metodo`),
  ADD KEY `idx_ingresos_estatus` (`estatus`),
  ADD KEY `fk_ingresos_asesor` (`asesor_preregistro_id`),
  ADD KEY `fk_ingresos_comprobante` (`comprobante_id`),
  ADD KEY `idx_ingresos_calendar_event_id` (`calendar_event_id`);

--
-- Indices de la tabla `pagos_asesores`
--
ALTER TABLE `pagos_asesores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_asesor` (`asesor_preregistro_id`),
  ADD KEY `idx_fecha` (`fecha_pago`);

--
-- Indices de la tabla `presupuestos_mensuales`
--
ALTER TABLE `presupuestos_mensuales`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_presupuesto_mes` (`mes`);

--
-- Indices de la tabla `quizzes`
--
ALTER TABLE `quizzes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_quizzes_area` (`id_area`),
  ADD KEY `idx_quizzes_creado_por` (`creado_por`),
  ADD KEY `idx_quizzes_activo` (`activo`),
  ADD KEY `idx_quizzes_publicado` (`publicado`);

--
-- Indices de la tabla `quizzes_intentos`
--
ALTER TABLE `quizzes_intentos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_quiz_estudiante_intento` (`id_quiz`,`id_estudiante`,`intent_number`),
  ADD KEY `idx_quiz_estudiante` (`id_quiz`,`id_estudiante`),
  ADD KEY `idx_estudiante` (`id_estudiante`),
  ADD KEY `idx_qi_quiz_est` (`id_quiz`,`id_estudiante`);

--
-- Indices de la tabla `quizzes_materias`
--
ALTER TABLE `quizzes_materias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indices de la tabla `quizzes_preguntas`
--
ALTER TABLE `quizzes_preguntas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_quiz_orden` (`id_quiz`,`orden`),
  ADD KEY `idx_quiz_preguntas_quiz` (`id_quiz`);

--
-- Indices de la tabla `quizzes_preguntas_materias`
--
ALTER TABLE `quizzes_preguntas_materias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_pregunta_materia` (`id_pregunta`,`id_materia`),
  ADD KEY `idx_qpm_pregunta` (`id_pregunta`),
  ADD KEY `idx_qpm_materia` (`id_materia`);

--
-- Indices de la tabla `quizzes_preguntas_opciones`
--
ALTER TABLE `quizzes_preguntas_opciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pregunta` (`id_pregunta`);

--
-- Indices de la tabla `quizzes_sesiones`
--
ALTER TABLE `quizzes_sesiones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sesion_quiz_estudiante` (`id_quiz`,`id_estudiante`),
  ADD KEY `fk_sesion_est` (`id_estudiante`),
  ADD KEY `idx_qs_quiz_est` (`id_quiz`,`id_estudiante`),
  ADD KEY `idx_quiz_sesiones_estudiante_created` (`id_estudiante`,`created_at`),
  ADD KEY `idx_quiz_sesiones_quiz` (`id_quiz`),
  ADD KEY `idx_quiz_sesiones_estado` (`estado`),
  ADD KEY `idx_quiz_sesiones_estudiante` (`id_estudiante`);

--
-- Indices de la tabla `quizzes_sesiones_respuestas`
--
ALTER TABLE `quizzes_sesiones_respuestas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_resp_sesion` (`id_sesion`),
  ADD KEY `idx_resp_pregunta` (`id_pregunta`),
  ADD KEY `fk_resp_opcion` (`id_opcion`),
  ADD KEY `idx_qsr_sesion` (`id_sesion`),
  ADD KEY `idx_quiz_resp_calificacion_status` (`calificacion_status`),
  ADD KEY `idx_quiz_resp_revisada_por` (`revisada_por`),
  ADD KEY `idx_quiz_respuestas_sesion` (`id_sesion`),
  ADD KEY `idx_quiz_respuestas_pregunta` (`id_pregunta`);

--
-- Indices de la tabla `simulaciones`
--
ALTER TABLE `simulaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_simulaciones_area` (`id_area`),
  ADD KEY `idx_simulaciones_activo` (`activo`);

--
-- Indices de la tabla `simulaciones_intentos`
--
ALTER TABLE `simulaciones_intentos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_sim_int_sim` (`id_simulacion`),
  ADD KEY `idx_sim_intentos_estudiante_created` (`id_estudiante`,`created_at`),
  ADD KEY `idx_sim_intentos_simulacion` (`id_simulacion`),
  ADD KEY `idx_sim_intentos_estudiante` (`id_estudiante`);

--
-- Indices de la tabla `simulaciones_preguntas`
--
ALTER TABLE `simulaciones_preguntas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_sim_preg_sim` (`id_simulacion`),
  ADD KEY `idx_sim_preguntas_simulacion` (`id_simulacion`);

--
-- Indices de la tabla `simulaciones_preguntas_opciones`
--
ALTER TABLE `simulaciones_preguntas_opciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_sim_opc_preg` (`id_pregunta`);

--
-- Indices de la tabla `simulaciones_respuestas`
--
ALTER TABLE `simulaciones_respuestas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_sim_resp_ses` (`id_sesion`),
  ADD KEY `fk_sim_resp_preg` (`id_pregunta`),
  ADD KEY `fk_sim_resp_opc` (`id_opcion`),
  ADD KEY `idx_sim_resp_calificacion_status` (`calificacion_status`),
  ADD KEY `idx_sim_resp_revisada_por` (`revisada_por`),
  ADD KEY `idx_sim_respuestas_pregunta` (`id_pregunta`);

--
-- Indices de la tabla `simulaciones_sesiones`
--
ALTER TABLE `simulaciones_sesiones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_sim_ses_sim` (`id_simulacion`);

--
-- Indices de la tabla `soft_deletes`
--
ALTER TABLE `soft_deletes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario` (`id_usuario`),
  ADD KEY `idx_estudiante` (`id_estudiante`);

--
-- Indices de la tabla `student_area_permissions`
--
ALTER TABLE `student_area_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_perm` (`id_estudiante`,`area_id`,`area_type`),
  ADD KEY `idx_sap_student` (`id_estudiante`),
  ADD KEY `idx_sap_area` (`area_id`,`area_type`),
  ADD KEY `fk_sap_granted_by` (`granted_by`);

--
-- Indices de la tabla `student_area_requests`
--
ALTER TABLE `student_area_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sar_student` (`id_estudiante`),
  ADD KEY `idx_sar_status` (`status`),
  ADD KEY `idx_sar_area` (`area_id`,`area_type`),
  ADD KEY `idx_sar_created` (`created_at`),
  ADD KEY `fk_sar_decider` (`decided_by`);

--
-- Indices de la tabla `student_notifications`
--
ALTER TABLE `student_notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student_unread` (`student_id`,`is_read`),
  ADD KEY `idx_student_created` (`student_id`,`created_at`);

--
-- Indices de la tabla `student_reminders`
--
ALTER TABLE `student_reminders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student_date` (`student_id`,`date`),
  ADD KEY `idx_student_created` (`student_id`,`created_at`),
  ADD KEY `idx_asesor_user` (`asesor_user_id`);

--
-- Indices de la tabla `student_resources`
--
ALTER TABLE `student_resources`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_estudiante_created` (`estudiante_id`,`created_at`),
  ADD KEY `idx_estudiante_type` (`estudiante_id`,`file_type`);
ALTER TABLE `student_resources` ADD FULLTEXT KEY `idx_search` (`title`,`description`);

--
-- Indices de la tabla `test_options`
--
ALTER TABLE `test_options`
  ADD PRIMARY KEY (`id`),
  ADD KEY `question_id` (`question_id`);

--
-- Indices de la tabla `test_questions`
--
ALTER TABLE `test_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_test_type_status` (`test_type`,`status`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuario` (`usuario`),
  ADD UNIQUE KEY `uniq_usuarios_usuario` (`usuario`),
  ADD KEY `id_estudiante` (`id_estudiante`),
  ADD KEY `idx_usuarios_id_estudiante` (`id_estudiante`),
  ADD KEY `idx_usuarios_role` (`role`),
  ADD KEY `idx_usuarios_usuario` (`usuario`),
  ADD KEY `idx_usuarios_estudiante` (`id_estudiante`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `actividades`
--
ALTER TABLE `actividades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `actividades_entregas`
--
ALTER TABLE `actividades_entregas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `actividades_entregas_archivos`
--
ALTER TABLE `actividades_entregas_archivos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `actividades_fecha_extensiones`
--
ALTER TABLE `actividades_fecha_extensiones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `admin_asesoria_confirmaciones`
--
ALTER TABLE `admin_asesoria_confirmaciones`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `admin_emails`
--
ALTER TABLE `admin_emails`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `admin_profiles`
--
ALTER TABLE `admin_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `admin_resources`
--
ALTER TABLE `admin_resources`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ai_quota_config`
--
ALTER TABLE `ai_quota_config`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `ai_usage_log`
--
ALTER TABLE `ai_usage_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ai_usage_stats`
--
ALTER TABLE `ai_usage_stats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `asesor_notifications`
--
ALTER TABLE `asesor_notifications`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `asesor_perfiles`
--
ALTER TABLE `asesor_perfiles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `asesor_preregistros`
--
ALTER TABLE `asesor_preregistros`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `asesor_reminders`
--
ALTER TABLE `asesor_reminders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `asesor_resources`
--
ALTER TABLE `asesor_resources`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `asesor_tests`
--
ALTER TABLE `asesor_tests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `asesor_tests_history`
--
ALTER TABLE `asesor_tests_history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `asesor_test_forms`
--
ALTER TABLE `asesor_test_forms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `asistencias`
--
ALTER TABLE `asistencias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `calendar_events`
--
ALTER TABLE `calendar_events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=93;

--
-- AUTO_INCREMENT de la tabla `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `comprobantes`
--
ALTER TABLE `comprobantes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de la tabla `contratos`
--
ALTER TABLE `contratos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `documentos_asesor`
--
ALTER TABLE `documentos_asesor`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `eeau`
--
ALTER TABLE `eeau`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `estudiantes`
--
ALTER TABLE `estudiantes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=77;

--
-- AUTO_INCREMENT de la tabla `estudiantes_config`
--
ALTER TABLE `estudiantes_config`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `feedback_submissions`
--
ALTER TABLE `feedback_submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `feedback_submission_notes`
--
ALTER TABLE `feedback_submission_notes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `feedback_tasks`
--
ALTER TABLE `feedback_tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `formulas`
--
ALTER TABLE `formulas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=524;

--
-- AUTO_INCREMENT de la tabla `gastos_fijos`
--
ALTER TABLE `gastos_fijos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT de la tabla `gastos_fijos_plantillas`
--
ALTER TABLE `gastos_fijos_plantillas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `gastos_variables`
--
ALTER TABLE `gastos_variables`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `ingresos`
--
ALTER TABLE `ingresos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT de la tabla `pagos_asesores`
--
ALTER TABLE `pagos_asesores`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `presupuestos_mensuales`
--
ALTER TABLE `presupuestos_mensuales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de la tabla `quizzes`
--
ALTER TABLE `quizzes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `quizzes_intentos`
--
ALTER TABLE `quizzes_intentos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `quizzes_materias`
--
ALTER TABLE `quizzes_materias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `quizzes_preguntas`
--
ALTER TABLE `quizzes_preguntas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT de la tabla `quizzes_preguntas_materias`
--
ALTER TABLE `quizzes_preguntas_materias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `quizzes_preguntas_opciones`
--
ALTER TABLE `quizzes_preguntas_opciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=151;

--
-- AUTO_INCREMENT de la tabla `quizzes_sesiones_respuestas`
--
ALTER TABLE `quizzes_sesiones_respuestas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- AUTO_INCREMENT de la tabla `simulaciones`
--
ALTER TABLE `simulaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT de la tabla `simulaciones_intentos`
--
ALTER TABLE `simulaciones_intentos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `simulaciones_preguntas`
--
ALTER TABLE `simulaciones_preguntas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=193;

--
-- AUTO_INCREMENT de la tabla `simulaciones_preguntas_opciones`
--
ALTER TABLE `simulaciones_preguntas_opciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=572;

--
-- AUTO_INCREMENT de la tabla `simulaciones_respuestas`
--
ALTER TABLE `simulaciones_respuestas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=213;

--
-- AUTO_INCREMENT de la tabla `simulaciones_sesiones`
--
ALTER TABLE `simulaciones_sesiones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `soft_deletes`
--
ALTER TABLE `soft_deletes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `student_area_permissions`
--
ALTER TABLE `student_area_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `student_area_requests`
--
ALTER TABLE `student_area_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `student_notifications`
--
ALTER TABLE `student_notifications`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=298;

--
-- AUTO_INCREMENT de la tabla `student_reminders`
--
ALTER TABLE `student_reminders`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `student_resources`
--
ALTER TABLE `student_resources`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `test_options`
--
ALTER TABLE `test_options`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT de la tabla `test_questions`
--
ALTER TABLE `test_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `actividades`
--
ALTER TABLE `actividades`
  ADD CONSTRAINT `fk_actividades_area` FOREIGN KEY (`id_area`) REFERENCES `areas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `actividades_entregas`
--
ALTER TABLE `actividades_entregas`
  ADD CONSTRAINT `fk_entregas_actividad` FOREIGN KEY (`id_actividad`) REFERENCES `actividades` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_entregas_estudiante` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_entregas_replaced` FOREIGN KEY (`replaced_by`) REFERENCES `actividades_entregas` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `actividades_entregas_archivos`
--
ALTER TABLE `actividades_entregas_archivos`
  ADD CONSTRAINT `fk_entrega_archivo_entrega` FOREIGN KEY (`entrega_id`) REFERENCES `actividades_entregas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `actividades_fecha_extensiones`
--
ALTER TABLE `actividades_fecha_extensiones`
  ADD CONSTRAINT `fk_extension_actividad` FOREIGN KEY (`id_actividad`) REFERENCES `actividades` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_extension_estudiante` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `admin_asesoria_confirmaciones`
--
ALTER TABLE `admin_asesoria_confirmaciones`
  ADD CONSTRAINT `admin_asesoria_confirmaciones_ibfk_1` FOREIGN KEY (`ingreso_id`) REFERENCES `ingresos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `admin_profiles`
--
ALTER TABLE `admin_profiles`
  ADD CONSTRAINT `fk_admin_user` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `admin_resources`
--
ALTER TABLE `admin_resources`
  ADD CONSTRAINT `admin_resources_ibfk_1` FOREIGN KEY (`admin_user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `ai_quota_config`
--
ALTER TABLE `ai_quota_config`
  ADD CONSTRAINT `ai_quota_config_ibfk_1` FOREIGN KEY (`actualizado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `ai_usage_log`
--
ALTER TABLE `ai_usage_log`
  ADD CONSTRAINT `ai_usage_log_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `ai_usage_stats`
--
ALTER TABLE `ai_usage_stats`
  ADD CONSTRAINT `ai_usage_stats_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `asesor_notifications`
--
ALTER TABLE `asesor_notifications`
  ADD CONSTRAINT `asesor_notifications_ibfk_1` FOREIGN KEY (`asesor_user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `asesor_perfiles`
--
ALTER TABLE `asesor_perfiles`
  ADD CONSTRAINT `fk_ap_preregistro` FOREIGN KEY (`preregistro_id`) REFERENCES `asesor_preregistros` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ap_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `asesor_reminders`
--
ALTER TABLE `asesor_reminders`
  ADD CONSTRAINT `asesor_reminders_ibfk_1` FOREIGN KEY (`asesor_user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `asesor_resources`
--
ALTER TABLE `asesor_resources`
  ADD CONSTRAINT `asesor_resources_ibfk_1` FOREIGN KEY (`asesor_user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `asesor_tests`
--
ALTER TABLE `asesor_tests`
  ADD CONSTRAINT `fk_asesor_tests_prereg` FOREIGN KEY (`preregistro_id`) REFERENCES `asesor_preregistros` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `asesor_tests_history`
--
ALTER TABLE `asesor_tests_history`
  ADD CONSTRAINT `fk_asesor_tests_hist_prereg` FOREIGN KEY (`preregistro_id`) REFERENCES `asesor_preregistros` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `calendar_events`
--
ALTER TABLE `calendar_events`
  ADD CONSTRAINT `fk_calendar_events_user` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `comprobantes`
--
ALTER TABLE `comprobantes`
  ADD CONSTRAINT `comprobantes_ibfk_1` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id`);

--
-- Filtros para la tabla `contratos`
--
ALTER TABLE `contratos`
  ADD CONSTRAINT `fk_contratos_estudiante` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `feedback_submissions`
--
ALTER TABLE `feedback_submissions`
  ADD CONSTRAINT `fk_feedback_submissions_estudiante` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_feedback_submissions_replaced` FOREIGN KEY (`replaced_by`) REFERENCES `feedback_submissions` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_feedback_submissions_task` FOREIGN KEY (`id_task`) REFERENCES `feedback_tasks` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `feedback_submission_notes`
--
ALTER TABLE `feedback_submission_notes`
  ADD CONSTRAINT `fk_notes_submission` FOREIGN KEY (`id_submission`) REFERENCES `feedback_submissions` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `ingresos`
--
ALTER TABLE `ingresos`
  ADD CONSTRAINT `fk_ingresos_asesor` FOREIGN KEY (`asesor_preregistro_id`) REFERENCES `asesor_preregistros` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_ingresos_comprobante` FOREIGN KEY (`comprobante_id`) REFERENCES `comprobantes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_ingresos_estudiante` FOREIGN KEY (`estudiante_id`) REFERENCES `estudiantes` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `pagos_asesores`
--
ALTER TABLE `pagos_asesores`
  ADD CONSTRAINT `fk_pagos_asesor_registro` FOREIGN KEY (`asesor_preregistro_id`) REFERENCES `asesor_preregistros` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `quizzes`
--
ALTER TABLE `quizzes`
  ADD CONSTRAINT `fk_quizzes_area` FOREIGN KEY (`id_area`) REFERENCES `areas` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_quizzes_creado_por` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `quizzes_intentos`
--
ALTER TABLE `quizzes_intentos`
  ADD CONSTRAINT `fk_qi_quiz` FOREIGN KEY (`id_quiz`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_quiz_intento_estudiante` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `quizzes_preguntas`
--
ALTER TABLE `quizzes_preguntas`
  ADD CONSTRAINT `fk_qp_quiz` FOREIGN KEY (`id_quiz`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `quizzes_preguntas_opciones`
--
ALTER TABLE `quizzes_preguntas_opciones`
  ADD CONSTRAINT `fk_opcion_pregunta` FOREIGN KEY (`id_pregunta`) REFERENCES `quizzes_preguntas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `quizzes_sesiones`
--
ALTER TABLE `quizzes_sesiones`
  ADD CONSTRAINT `fk_qs_quiz` FOREIGN KEY (`id_quiz`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_sesion_est` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `quizzes_sesiones_respuestas`
--
ALTER TABLE `quizzes_sesiones_respuestas`
  ADD CONSTRAINT `fk_resp_opcion` FOREIGN KEY (`id_opcion`) REFERENCES `quizzes_preguntas_opciones` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_resp_pregunta` FOREIGN KEY (`id_pregunta`) REFERENCES `quizzes_preguntas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_resp_sesion` FOREIGN KEY (`id_sesion`) REFERENCES `quizzes_sesiones` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `simulaciones_intentos`
--
ALTER TABLE `simulaciones_intentos`
  ADD CONSTRAINT `fk_sim_int_sim` FOREIGN KEY (`id_simulacion`) REFERENCES `simulaciones` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `simulaciones_preguntas`
--
ALTER TABLE `simulaciones_preguntas`
  ADD CONSTRAINT `fk_sim_preg_sim` FOREIGN KEY (`id_simulacion`) REFERENCES `simulaciones` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `simulaciones_preguntas_opciones`
--
ALTER TABLE `simulaciones_preguntas_opciones`
  ADD CONSTRAINT `fk_sim_opc_preg` FOREIGN KEY (`id_pregunta`) REFERENCES `simulaciones_preguntas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `simulaciones_respuestas`
--
ALTER TABLE `simulaciones_respuestas`
  ADD CONSTRAINT `fk_sim_resp_opc` FOREIGN KEY (`id_opcion`) REFERENCES `simulaciones_preguntas_opciones` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_sim_resp_preg` FOREIGN KEY (`id_pregunta`) REFERENCES `simulaciones_preguntas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_sim_resp_ses` FOREIGN KEY (`id_sesion`) REFERENCES `simulaciones_sesiones` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `simulaciones_sesiones`
--
ALTER TABLE `simulaciones_sesiones`
  ADD CONSTRAINT `fk_sim_ses_sim` FOREIGN KEY (`id_simulacion`) REFERENCES `simulaciones` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `student_area_permissions`
--
ALTER TABLE `student_area_permissions`
  ADD CONSTRAINT `fk_sap_granted_by` FOREIGN KEY (`granted_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_sap_student` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `student_area_requests`
--
ALTER TABLE `student_area_requests`
  ADD CONSTRAINT `fk_sar_decider` FOREIGN KEY (`decided_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_sar_student` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `student_reminders`
--
ALTER TABLE `student_reminders`
  ADD CONSTRAINT `student_reminders_ibfk_1` FOREIGN KEY (`asesor_user_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `student_resources`
--
ALTER TABLE `student_resources`
  ADD CONSTRAINT `student_resources_ibfk_1` FOREIGN KEY (`estudiante_id`) REFERENCES `estudiantes` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `test_options`
--
ALTER TABLE `test_options`
  ADD CONSTRAINT `test_options_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `test_questions` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_usuarios_estudiante` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
