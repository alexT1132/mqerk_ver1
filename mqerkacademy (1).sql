-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 15-10-2025 a las 20:07:41
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

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
) ;

--
-- Volcado de datos para la tabla `actividades`
--

INSERT INTO `actividades` (`id`, `titulo`, `descripcion`, `tipo`, `id_area`, `materia`, `puntos_max`, `peso_calificacion`, `fecha_limite`, `grupos`, `recursos_json`, `imagen_portada`, `visible_desde`, `visible_hasta`, `max_intentos`, `time_limit_min`, `passing_score`, `shuffle_questions`, `requiere_revision`, `activo`, `publicado`, `creado_por`, `created_at`, `updated_at`) VALUES
(2, 'probando', 'probando', 'actividad', 1, NULL, 100, 0.00, '2025-08-19 23:59:00', '[\"V1\"]', '[{\"archivo\":\"/public/1755659683193-fundamentos-de-sql-3edi-oppel-o6t27e.pdf\",\"nombre\":\"fundamentos_de_sql_3edi_oppel.pdf\",\"mime\":\"application/pdf\",\"tamano\":2735617}]', NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 1, NULL, '2025-08-20 03:14:43', '2025-10-06 23:09:25'),
(3, 'prueba 2', 'dwdwd', 'actividad', 2, NULL, 100, 0.00, '2025-08-20 23:59:00', '[\"V1\"]', '[{\"archivo\":\"/public/1755746551923-manual-sql1-xse5n7.pdf\",\"nombre\":\"Manual-SQL1.pdf\",\"mime\":\"application/pdf\",\"tamano\":1083603}]', NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 1, NULL, '2025-08-21 03:22:31', '2025-10-06 23:07:12'),
(4, 'PRODUCTOS NOTABLES', 'ANALIZA Y RESUELVE LOS EJERCICIOS DE MANERA ORDENADA', 'actividad', 2, NULL, 100, 0.00, '2025-08-22 23:59:00', '[\"V1\"]', '[{\"archivo\":\"/public/1755803019726-reglamento-uwilb0.pdf\",\"nombre\":\"REGLAMENTO.pdf\",\"mime\":\"application/pdf\",\"tamano\":182775}]', NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 1, NULL, '2025-08-21 19:03:39', '2025-10-06 23:07:14'),
(5, 'prueba nuevo panel', NULL, 'actividad', 2, NULL, 100, 0.00, '2025-10-07 00:00:00', '[\"v1\"]', '[{\"archivo\":\"/public/1759791100543-sdai-api-i3s34f.pdf\",\"nombre\":\"SdAI_API.pdf\",\"mime\":\"application/pdf\",\"tamano\":379342}]', NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 1, 1, NULL, '2025-10-06 22:51:40', '2025-10-06 22:51:40'),
(9, 'POTENCIAS Y RAÍCES', NULL, 'actividad', 1, NULL, 100, 0.00, '2025-10-08 06:00:00', '[\"v1\"]', '[{\"archivo\":\"/public/1759862940088-infografia-ciencias-sociales-6p4yrw.pdf\",\"nombre\":\"Infografia_Ciencias Sociales.pdf\",\"mime\":\"application/pdf\",\"tamano\":157368}]', NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 0, 1, NULL, '2025-10-07 18:49:00', '2025-10-07 21:09:06'),
(10, 'RAICES Y ECUACIONES', NULL, 'actividad', 2, NULL, 100, 0.00, '2025-10-10 00:00:00', '[\"v1\"]', '[{\"archivo\":\"/public/1759863216013-plan-de-desarrollo-estrat-gico-nsa-n-cle-n40zsq.pdf\",\"nombre\":\"Plan de Desarrollo EstratÃ©gico- NSA (NÃºcleo de Sol....pdf\",\"mime\":\"application/pdf\",\"tamano\":151099}]', NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 1, 1, NULL, '2025-10-07 18:53:36', '2025-10-07 18:53:36'),
(13, 'MATE 1', NULL, 'quiz', NULL, 'Matemáticas y pensamiento analítico', 100, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 60, NULL, 0, 0, 1, 1, NULL, '2025-10-07 21:49:47', '2025-10-09 19:19:11'),
(14, 'PRUEBA 2', 'PROBANDO EL SEGUNDO QUIZ', 'quiz', 2, 'Matemáticas y pensamiento analítico', 100, 0.00, '2025-10-13 00:00:00', NULL, NULL, NULL, NULL, NULL, NULL, 70, NULL, 1, 0, 1, 1, NULL, '2025-10-08 17:55:08', '2025-10-08 17:55:08'),
(15, 'prueba 3', 'probando por tercera vez', 'quiz', 2, 'Matemáticas y pensamiento analítico', 100, 0.00, '2025-10-09 00:00:00', NULL, NULL, NULL, NULL, NULL, NULL, 70, NULL, 1, 0, 1, 1, NULL, '2025-10-08 18:39:33', '2025-10-08 18:39:33'),
(16, 'prueba 4', 'prueba 4 de los quizes', 'quiz', 2, 'Matemáticas y pensamiento analítico', 100, 0.00, '2025-10-09 00:00:00', NULL, NULL, NULL, NULL, NULL, NULL, 180, NULL, 1, 0, 1, 1, NULL, '2025-10-08 18:59:01', '2025-10-08 18:59:01'),
(17, 'prueba 6', 'prueba 6 intento', 'quiz', 2, 'Matemáticas y pensamiento analítico', 100, 0.00, '2025-10-08 00:00:00', NULL, NULL, NULL, NULL, NULL, NULL, 60, NULL, 1, 0, 1, 1, NULL, '2025-10-08 19:09:06', '2025-10-08 19:09:06'),
(18, 'Diagnóstico de Redacción y Ortografía', NULL, 'quiz', NULL, 'Español y redacción indirecta', 100, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 10, 60, NULL, 0, 0, 1, 1, 21, '2025-10-09 20:28:05', '2025-10-10 19:14:55'),
(19, 'llñsakdñlska', 'klm<lñsdmksl<md', 'quiz', 3, 'Habilidades transversales', 100, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 60, NULL, 1, 0, 1, 1, 21, '2025-10-09 21:04:39', '2025-10-09 21:04:39'),
(20, 'prueba 7', 'probando porque la tabla no se muestra en todas las materias', 'quiz', 2, 'Matemáticas y pensamiento analítico', 100, 0.00, '2025-10-09 00:00:00', NULL, NULL, NULL, NULL, NULL, NULL, 60, NULL, 1, 0, 1, 1, 21, '2025-10-09 21:06:44', '2025-10-09 21:06:44'),
(21, 'Diagnóstico de Redacción y Ortografía ', 'Este quiz está diseñado para evaluar tus habilidades en áreas fundamentales de la redacción y gramática del español. A través de una serie de preguntas, pondremos a prueba tus conocimientos sobre:\n\nAcentuación y ortografía.\n\nUso correcto de signos de puntuación.\n\nConcordancia verbal y nominal.\n\nElección de conectores lógicos.\n\nConversión de estilo directo a indirecto.', 'quiz', 1, 'Español y redacción indirecta', 100, 0.00, '2025-10-13 00:00:00', NULL, NULL, NULL, NULL, NULL, 10, 60, NULL, 1, 0, 1, 1, 21, '2025-10-10 19:55:46', '2025-10-10 19:55:46'),
(22, 'Desafío de Redacción Avanzada ', 'Este breve cuestionario está diseñado para poner a prueba tu dominio de temas complejos de la gramática y redacción en español.\n\nLas preguntas se centran en el uso preciso del modo subjuntivo, la correcta construcción de oraciones (evitando errores como el queísmo/dequeísmo) y la transformación a estilo indirecto.\n\nEstos son temas avanzados que requieren atención al detalle. Lee cada opción cuidadosamente antes de seleccionar tu respuesta.', 'quiz', 1, 'Español y redacción indirecta', 100, 0.00, '2025-10-14 00:00:00', NULL, NULL, NULL, NULL, NULL, NULL, 120, NULL, 1, 0, 1, 1, 21, '2025-10-10 21:30:36', '2025-10-10 21:30:36'),
(23, 'prueba 1', NULL, 'actividad', 1, NULL, 100, 0.00, '2025-10-16 00:00:00', '[\"v1\"]', '[{\"archivo\":\"/public/1760136848630-cuadernillo-1ra-unidad-sociales-1-ysoo32.pdf\",\"nombre\":\"CUADERNILLO 1RA UNIDAD_SOCIALES (1).pdf\",\"mime\":\"application/pdf\",\"tamano\":2095926}]', NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 1, 1, NULL, '2025-10-10 22:54:08', '2025-10-10 22:54:08');

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
  `comentarios_updated_at` datetime DEFAULT NULL
) ;

--
-- Volcado de datos para la tabla `actividades_entregas`
--

INSERT INTO `actividades_entregas` (`id`, `id_actividad`, `id_estudiante`, `archivo`, `original_nombre`, `mime_type`, `tamano`, `calificacion`, `comentarios`, `estado`, `version`, `replaced_by`, `entregada_at`, `created_at`, `updated_at`, `revisada_at`, `comentarios_updated_at`) VALUES
(2, 2, 67, '/public/1755663991234-manual-sql1-compressed-xqr4i9.pdf', 'Manual-SQL1_compressed.pdf', 'application/pdf', 159959, 8, NULL, 'revisada', 1, 3, '2025-08-20 04:26:31', '2025-08-20 04:26:31', '2025-09-19 20:42:37', '2025-09-19 14:42:37', NULL),
(3, 2, 67, '/public/1755664370234-comprobante-pago-mq-20250729-0001-xn3rl6.pdf', 'comprobante-pago-MQ-20250729-0001.pdf', 'application/pdf', 8708, NULL, NULL, 'entregada', 2, NULL, '2025-08-20 04:32:50', '2025-08-20 04:32:50', '2025-08-20 04:32:50', NULL, NULL),
(4, 3, 67, '/public/1755748227979-manual-sql1-compressed-rbyjro.pdf', 'Manual-SQL1_compressed.pdf', 'application/pdf', 159959, 10, NULL, 'revisada', 1, NULL, '2025-08-21 03:50:28', '2025-08-21 03:50:28', '2025-09-19 20:42:37', '2025-09-19 14:42:37', NULL),
(5, 4, 73, '/public/1755803132983-i-ndice-del-modelo-educativo-disruptivo--q621tt.pdf', 'IÌNDICE DEL MODELO EDUCATIVO DISRUPTIVO Y SOSTENIBLE 1) (1).pdf', 'application/pdf', 1096240, 8, NULL, 'revisada', 1, NULL, '2025-08-21 19:05:33', '2025-08-21 19:05:33', '2025-09-19 20:42:37', '2025-09-19 14:42:37', NULL),
(6, 5, 67, '/public/1759791172391-sdai-api-8dllqm.pdf', 'SdAI_API.pdf', 'application/pdf', 379342, 9, 'el ejercicio 3 esta mal, revisalo nuevamente te doy hasta las 12 paar que lo subas corregido', 'revisada', 1, NULL, '2025-10-06 22:52:52', '2025-10-06 22:52:52', '2025-10-06 23:02:24', '2025-10-06 17:02:24', '2025-10-06 17:02:24'),
(7, 9, 67, '/public/1759863016610-cuadernillo-1ra-unidad-sociales-gb9dq2.pdf', 'CUADERNILLO 1RA UNIDAD_SOCIALES.pdf', 'application/pdf', 2095926, 10, 'EXCELENTE', 'revisada', 1, NULL, '2025-10-07 18:50:16', '2025-10-07 18:50:16', '2025-10-07 18:51:37', '2025-10-07 12:51:37', '2025-10-07 12:51:37'),
(8, 10, 67, '/public/1759863255395-sdai-api-njaum8.pdf', 'SdAI_API.pdf', 'application/pdf', 379342, 8, NULL, 'revisada', 1, NULL, '2025-10-07 18:54:15', '2025-10-07 18:54:15', '2025-10-07 18:55:01', '2025-10-07 12:55:01', NULL);

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
(1, 4, '/public/1755748719028-manual-sql1-compressed-7h3wnp.pdf', 'Manual-SQL1_compressed.pdf', 'application/pdf', 159959, '2025-08-21 03:58:39'),
(2, 4, '/public/1755748719032-contrato-mqeeau-2025-0731-8819-mar-a-gon-cmpmo8.pdf', 'Contrato_MQEEAU-2025-0731-8819_MARÃA_GONZÃLEZ_LÃPEZ.pdf', 'application/pdf', 604636, '2025-08-21 03:58:39'),
(3, 4, '/public/1755748719039-comprobante-pago-mq-20250729-0001-3pr278.pdf', 'comprobante-pago-MQ-20250729-0001.pdf', 'application/pdf', 8708, '2025-08-21 03:58:39'),
(4, 5, '/public/1755803132983-i-ndice-del-modelo-educativo-disruptivo--q621tt.pdf', 'IÌNDICE DEL MODELO EDUCATIVO DISRUPTIVO Y SOSTENIBLE 1) (1).pdf', 'application/pdf', 1096240, '2025-08-21 19:05:33'),
(5, 6, '/public/1759791172391-sdai-api-8dllqm.pdf', 'SdAI_API.pdf', 'application/pdf', 379342, '2025-10-06 22:52:52'),
(6, 7, '/public/1759863016610-cuadernillo-1ra-unidad-sociales-gb9dq2.pdf', 'CUADERNILLO 1RA UNIDAD_SOCIALES.pdf', 'application/pdf', 2095926, '2025-10-07 18:50:16'),
(7, 8, '/public/1759863255395-sdai-api-njaum8.pdf', 'SdAI_API.pdf', 'application/pdf', 379342, '2025-10-07 18:54:15');

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
(3, 6, 'Jessica Fernandez', 'Jessica@gmail.com', '2811975587', '/public/1754888388855-WhatsApp Image 2025-08-10 at 10.59.32 PM.jpeg', '2025-08-11 04:00:37', '2025-08-11 17:39:40');

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
(2, 4, 21, 'V1', '[\"V1\"]', '', '', '0000-00-00', '', '', '', '', '', 0, 0, NULL, NULL, '', NULL, '', '', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, NULL, NULL, NULL, '2025-10-06 17:29:14', '2025-10-06 17:29:58');

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
(91, 6, 'Gasto variable: puerta', 'Unidades: 1 | Método: Efectivo | Importe: $950.00 | Estatus: Pagado | Entidad: carpintero | Nota: reparacion de puerta', '2025-09-26', '10:00:00', 'finanzas', 'media', 10, 0, '2025-09-26 20:41:13', '2025-09-26 20:41:13');

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
(9, 67, '/comprobantes/1754873043799-comprobante-pago-MQ-20250729-0001.pdf', 1500.00, 'efectivo', NULL, '2025-08-11 12:00:09', '2025-08-11 15:46:48'),
(11, 69, '/comprobantes/1754941053364-518323640_2494738954216624_926389333829993898_n.jpg', 1200.00, 'efectivo', NULL, '2025-08-11 13:50:53', '2025-08-11 15:46:48'),
(12, 70, '/comprobantes/1754943978532-comprobante-pago-MQ-20250729-0001.pdf', 0.00, 'transferencia', 'no se transfirio', '2025-08-11 14:26:18', '2025-08-11 15:47:34'),
(13, 71, '/comprobantes/1755028526990-ENTRENAMIENTO PARA EL EXAMEN UNIVERSIDAD 2025.png', 10500.00, 'efectivo', NULL, '2025-08-12 13:55:27', '2025-08-12 13:57:55'),
(14, 72, '/comprobantes/1755029908064-Gemini_Generated_Image_14ox9014ox9014ox.png', 5500.00, 'transferencia', NULL, '2025-08-12 14:18:28', '2025-08-12 14:20:08'),
(15, 73, '/comprobantes/1755800393550-ChatGPT Image 10 ago 2025, 18_11_50.png', 10500.00, 'efectivo', NULL, '2025-08-21 12:19:53', '2025-08-21 12:21:16');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comprobantes_backup_20250811`
--
-- Error leyendo la estructura de la tabla mqerkacademy.comprobantes_backup_20250811: #1932 - Table 'mqerkacademy.comprobantes_backup_20250811' doesn't exist in engine
-- Error leyendo datos de la tabla mqerkacademy.comprobantes_backup_20250811: #1064 - Algo está equivocado en su sintax cerca 'FROM `mqerkacademy`.`comprobantes_backup_20250811`' en la linea 1

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

INSERT INTO `estudiantes` (`id`, `nombre`, `apellidos`, `email`, `foto`, `grupo`, `comunidad1`, `comunidad2`, `telefono`, `fecha_nacimiento`, `nombre_tutor`, `tel_tutor`, `academico1`, `academico2`, `semestre`, `alergia`, `alergia2`, `discapacidad1`, `discapacidad2`, `orientacion`, `universidades1`, `universidades2`, `postulacion`, `modalidad`, `comentario1`, `comentario2`, `curso`, `turno`, `plan`, `estatus`, `academia`, `anio`, `folio`, `verificacion`, `created_at`, `asesor`) VALUES
(67, 'Miguel', 'Angel Cruz vargas', 'isc20350265@gmail.com', '/public/1755139227661-abelito-83uin1.jfif', 'V1', 'SAN JUAN BAUTISTA TUXTEPEC', '', '2811975587', '2000-11-01', 'Rosa Isela', '2811975587', 'CBTis', 'CBTis', 'Concluido', 'Si', 'Antibioticos', 'Si', 'Autismo', 'No', 'NAVAL,TECNM', '', 'ISC', 'ISC', 'ok', 'bien', 'EEAU', 'VESPERTINO', 'Start', 'Activo', 'CBTis', 25, 1, 2, '2025-08-11 00:41:37', 'Carlos Pérez'),
(69, 'Jessica', 'Fernandez', 'ige19350409@gmail.com', '/public/1754940987329-518323640_2494738954216624_926389333829993898_n.jpg', 'V1', 'SAN JUAN BAUTISTA TUXTEPEC', '', '2878819370', NULL, 'kelvin', '2874581265', 'CBTis', '', 'Concluido', 'No', '', 'No', '', 'No', 'TECNM', '', 'ige', 'ige', '...', '...', 'EEAU', 'VESPERTINO', 'Start', 'Activo', 'MQerKAcademy', 25, 3, 2, '2025-08-11 19:36:27', 'Carlos Pérez'),
(70, 'Emir', 'cruz zamora', 'isc20350265@gmail.com', '/public/1754943896459-WhatsApp Image 2025-08-10 at 2.33.38 PM.jpeg', 'V2', 'LOMA BONITA', '', '281975587', NULL, 'Miguel Angel', '281975587', 'CBTis', '', '6° semestre', 'No', '', 'No', '', 'No', 'TECNM,NAVAL', '', 'ISC', 'ISC', 'xxx', 'xxx', 'EEAU', 'VESPERTINO', 'Mensual', 'Activo', 'MQerKAcademy', 25, 4, 3, '2025-08-11 20:24:56', 'Kélvil Valentín Gómez Ramírez'),
(71, 'Gerardo ', 'Arcilla', 'gera@gmail.com', '/public/1755028421157-ChatGPT Image 10 ago 2025, 18_11_50.png', 'V1', 'SAN JOSÉ CHILTEPEC', '', '2871811232', NULL, 'Alejandro Lopez', '2871809089', 'CBTis', '', '5° semestre', 'Si', 'Antibioticos', 'Si', 'TDH', 'No', 'IPN,UAQ', '', 'Logistica', 'Logistica', 'educar', 'excelente', 'EEAU', 'VESPERTINO', 'Premium', 'Activo', 'MQerKAcademy', 25, 5, 2, '2025-08-12 19:53:41', 'Carlos Pérez'),
(72, 'Andres', 'Saul Canelo', 'andy@gmail.com', '/public/1755029883708-file_000000007acc61f6a8019e5a25720850.png', 'V1', 'AYOTZINTEPEC', '', '2871811231', NULL, 'Aron Vazquez', '2878752825', 'COLEGIO AMÉRICA', 'cbtis', '6° semestre', 'si', 'Antibioticos', 'Si', 'Autismo', 'No', 'ANAHUAC', '', 'Medicina', 'Presencial', 'x', 'x', 'EEAU', 'VESPERTINO', 'Start', 'Activo', 'COLEGIO AMÉRICA', 25, 6, 2, '2025-08-12 20:18:03', 'Carlos Pérez'),
(73, 'Juan ', 'Perez Del Rio ', 'juanperez8@gmail.com', '/public/1755800362156-5-7u6pqt.png', 'V1', '', 'Valle de bravo', '2871811233', NULL, 'Jessica Hernandez', '2871811234', '', 'CEBETIS', '5° semestre', 'Si', 'ANTIBIOTICOS', 'Si', 'Autismo', 'Si', '', '', '', 'Presencial', 'SSS', 'SSS', 'EEAU', 'VESPERTINO', 'Premium', 'Activo', 'MQerKAcademy', 25, 7, 2, '2025-08-21 18:19:22', 'Carlos Pérez');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estudiantes_config`
--

CREATE TABLE `estudiantes_config` (
  `id` int(11) NOT NULL,
  `id_estudiante` int(11) NOT NULL,
  `nivel_experiencia` varchar(32) DEFAULT 'intermedio',
  `intereses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT json_array() CHECK (json_valid(`intereses`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estudiantes_config`
--

INSERT INTO `estudiantes_config` (`id`, `id_estudiante`, `nivel_experiencia`, `intereses`, `created_at`, `updated_at`) VALUES
(1, 67, 'intermedio', '[\"programacion\",\"tecnologico\",\"psicoeducativo\"]', '2025-08-11 00:46:28', '2025-08-13 22:34:33');

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
(6, 'adasdasd', NULL, NULL, NULL, 10, '2025-09-01 17:34:51', '[67]', 1, '2025-09-01 17:34:51', '2025-09-01 17:34:51');

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
(30, 73, 'Juan  Perez Del Rio ', NULL, 'Carlos Pérez', 'EEAU', '2025-08-21', NULL, 'Efectivo', 10500.00, 'Pagado', 15, NULL, NULL, NULL, '2025-10-10 23:16:38', '2025-10-10 23:18:55');

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
) ;

--
-- Volcado de datos para la tabla `quizzes_intentos`
--

INSERT INTO `quizzes_intentos` (`id`, `id_quiz`, `id_estudiante`, `puntaje`, `intent_number`, `tiempo_segundos`, `total_preguntas`, `correctas`, `detalle_json`, `created_at`) VALUES
(1, 13, 67, 100, 1, NULL, 1, 1, NULL, '2025-10-07 22:27:17'),
(2, 14, 67, 0, 1, NULL, 1, NULL, NULL, '2025-10-08 18:15:05'),
(3, 14, 67, 0, 2, NULL, 1, NULL, NULL, '2025-10-08 18:21:12'),
(4, 14, 67, 0, 3, NULL, 1, NULL, NULL, '2025-10-08 18:29:46'),
(5, 15, 67, 0, 1, NULL, 1, NULL, NULL, '2025-10-08 18:43:57'),
(6, 15, 67, 0, 2, NULL, 1, NULL, NULL, '2025-10-08 18:48:37'),
(7, 15, 67, 0, 3, NULL, 1, NULL, NULL, '2025-10-08 18:54:54'),
(8, 16, 67, 0, 1, NULL, 1, NULL, NULL, '2025-10-08 19:04:52'),
(9, 16, 67, 0, 2, NULL, 1, NULL, NULL, '2025-10-08 19:12:01'),
(10, 16, 67, 0, 3, NULL, 1, NULL, NULL, '2025-10-08 19:21:45'),
(11, 17, 67, 0, 1, NULL, 1, NULL, NULL, '2025-10-08 19:32:10'),
(12, 17, 67, 0, 2, NULL, 1, NULL, NULL, '2025-10-08 19:37:34'),
(13, 17, 67, 100, 3, NULL, 1, 1, NULL, '2025-10-08 19:41:14'),
(14, 18, 67, 0, 1, NULL, 5, NULL, NULL, '2025-10-09 22:35:52'),
(15, 18, 67, 20, 2, NULL, 5, 1, NULL, '2025-10-09 22:47:03'),
(16, 20, 67, 100, 1, NULL, 1, 1, NULL, '2025-10-09 22:57:05'),
(17, 20, 67, 100, 2, NULL, 1, 1, NULL, '2025-10-09 22:59:15'),
(18, 20, 67, 100, 3, NULL, 1, 1, NULL, '2025-10-09 23:04:06'),
(19, 18, 67, 80, 3, 234, 5, 4, NULL, '2025-10-10 19:10:43'),
(20, 21, 67, 0, 1, 63, 5, NULL, NULL, '2025-10-10 20:12:08'),
(21, 21, 67, 20, 2, 154, 5, 1, NULL, '2025-10-10 20:15:13'),
(22, 21, 67, 60, 3, 55, 5, 3, NULL, '2025-10-10 21:09:44'),
(23, 22, 67, 0, 1, 217, 1, NULL, NULL, '2025-10-10 21:51:43'),
(24, 22, 67, 0, 2, 63, 1, NULL, NULL, '2025-10-10 21:53:10'),
(25, 22, 67, 100, 3, 72, 1, 1, NULL, '2025-10-10 22:01:55');

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
  `tipo` enum('opcion_multiple','multi_respuesta','verdadero_falso') DEFAULT 'opcion_multiple',
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
(7, 14, 1, 'Resuelve: $2x^2$', 'opcion_multiple', 1, 1, NULL, '2025-10-08 17:55:08', NULL),
(8, 15, 1, 'cuanto es 2+2', 'opcion_multiple', 1, 1, NULL, '2025-10-08 18:39:33', NULL),
(9, 16, 1, 'cuanto es 2+2?', 'opcion_multiple', 1, 1, NULL, '2025-10-08 18:59:01', NULL),
(10, 17, 1, 'fumas ?', 'opcion_multiple', 1, 1, NULL, '2025-10-08 19:09:06', NULL),
(11, 13, 1, 'RESUELVE LA SIGUIENTE OPERACION: $x^2$', 'opcion_multiple', 1, 1, NULL, '2025-10-09 19:19:11', NULL),
(12, 18, 1, '1. Puntuación Correcta:\nSelecciona la oración que utiliza los signos de puntuación de manera correcta.', 'opcion_multiple', 1, 1, NULL, '2025-10-09 20:28:05', NULL),
(13, 18, 2, '2. Acentuación Diacrítica:\nElige la opción que completa correctamente la siguiente frase: \"Quisiera ir a la fiesta, ___ no tengo tiempo\".', 'opcion_multiple', 1, 1, NULL, '2025-10-09 20:28:05', NULL),
(14, 18, 3, '3. Conectores Lógicos 🗣️:\nCompleta la oración con el conector que le da un sentido lógico: \"El cambio climático es un problema global; ___________, requiere soluciones de todos los países\".', 'opcion_multiple', 1, 1, NULL, '2025-10-09 20:28:05', NULL),
(15, 18, 4, '4. Estilo Indirecto\n¿Cuál es la forma correcta de reportar la siguiente frase en estilo indirecto?: El entrenador dijo: \"Mañana entrenaremos en la mañana\".', 'opcion_multiple', 1, 1, NULL, '2025-10-09 20:28:05', NULL),
(16, 18, 5, '5. Concordancia Verbal 🤓\nSelecciona la opción que completa la oración con la concordancia verbal correcta: \"La mayoría de los estudiantes ___________ que el examen fue difícil\".', 'opcion_multiple', 1, 1, NULL, '2025-10-09 20:28:05', NULL),
(17, 19, 1, 'lsakdlkmaldjlkasjdklsadksdkl', 'opcion_multiple', 1, 1, NULL, '2025-10-09 21:04:39', NULL),
(18, 20, 1, '$x^2$', 'opcion_multiple', 1, 1, NULL, '2025-10-09 21:06:44', NULL),
(20, 18, 1, 'Puntuación Correcta:\nSelecciona la oración que utiliza los signos de puntuación de manera correcta.', 'opcion_multiple', 1, 1, NULL, '2025-10-10 19:22:18', NULL),
(21, 21, 1, 'Selecciona la oración que utiliza los signos de puntuación de manera correcta.', 'opcion_multiple', 1, 1, NULL, '2025-10-10 19:55:46', NULL),
(22, 21, 2, 'Elige la opción que completa correctamente la siguiente frase: \"Quisiera ir a la fiesta, ___ no tengo tiempo\".', 'opcion_multiple', 1, 1, NULL, '2025-10-10 19:55:46', NULL),
(23, 21, 3, 'Completa la oración con el conector que le da un sentido lógico: \"El cambio climático es un problema global; ___________, requiere soluciones de todos los países\".', 'opcion_multiple', 1, 1, NULL, '2025-10-10 19:55:46', NULL),
(24, 21, 4, '¿Cuál es la forma correcta de reportar la siguiente frase en estilo indirecto?: El entrenador dijo: \"Mañana entrenaremos en la mañana\".', 'opcion_multiple', 1, 1, NULL, '2025-10-10 19:55:46', NULL),
(25, 21, 5, 'Selecciona la opción que completa la oración con la concordancia verbal correcta: \"La mayoría de los estudiantes ___________ que el examen fue difícil\".', 'opcion_multiple', 1, 1, NULL, '2025-10-10 19:55:46', NULL),
(26, 22, 1, ' Selecciona la oración construida correctamente, evitando los errores comunes de \'queísmo\' y \'dequeísmo\'.', 'opcion_multiple', 1, 1, NULL, '2025-10-10 21:30:36', NULL);

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
(3, 7, '4X', 1, 1, NULL, '2025-10-08 17:55:08'),
(4, 7, 'X', 0, 2, NULL, '2025-10-08 17:55:08'),
(5, 7, '2X', 0, 3, NULL, '2025-10-08 17:55:08'),
(6, 8, '2', 0, 1, NULL, '2025-10-08 18:39:33'),
(7, 8, '3', 0, 2, NULL, '2025-10-08 18:39:33'),
(8, 8, '4', 1, 3, NULL, '2025-10-08 18:39:33'),
(9, 8, '5', 0, 4, NULL, '2025-10-08 18:39:33'),
(10, 9, 'igua a pez?', 0, 1, NULL, '2025-10-08 18:59:01'),
(11, 9, '2', 0, 2, NULL, '2025-10-08 18:59:01'),
(12, 9, '4', 1, 3, NULL, '2025-10-08 18:59:01'),
(13, 10, 'si', 1, 1, NULL, '2025-10-08 19:09:06'),
(14, 10, 'no', 1, 2, NULL, '2025-10-08 19:09:06'),
(15, 11, '2X', 1, 1, NULL, '2025-10-09 19:19:11'),
(16, 12, 'A) El equipo trabajó duro toda la semana sin embargo, no logró el resultado esperado.', 0, 1, NULL, '2025-10-09 20:28:05'),
(17, 12, 'B) El equipo trabajó duro toda la semana, sin embargo no logró el resultado esperado.', 0, 2, NULL, '2025-10-09 20:28:05'),
(18, 12, 'C) El equipo trabajó duro toda la semana; sin embargo, no logró el resultado esperado.', 1, 3, NULL, '2025-10-09 20:28:05'),
(19, 13, 'A) más', 0, 1, NULL, '2025-10-09 20:28:05'),
(20, 13, 'B) mas', 1, 2, NULL, '2025-10-09 20:28:05'),
(21, 13, 'C) máz', 0, 3, NULL, '2025-10-09 20:28:05'),
(22, 14, 'A) no obstante', 0, 1, NULL, '2025-10-09 20:28:05'),
(23, 14, 'B) en cambio', 0, 2, NULL, '2025-10-09 20:28:05'),
(24, 14, 'DC) por lo tanto', 1, 3, NULL, '2025-10-09 20:28:05'),
(25, 15, 'A) El entrenador dijo que mañana entrenarían en la mañana.', 0, 1, NULL, '2025-10-09 20:28:05'),
(26, 15, 'B) El entrenador dijo que entrenarán mañana en la mañana.', 0, 2, NULL, '2025-10-09 20:28:05'),
(27, 15, 'C) El entrenador dijo que al día siguiente entrenarían en la mañana. ', 1, 3, NULL, '2025-10-09 20:28:05'),
(28, 16, 'A) opinó', 0, 1, NULL, '2025-10-09 20:28:05'),
(29, 16, 'B) opinaron ', 1, 2, NULL, '2025-10-09 20:28:05'),
(30, 16, 'C) opina', 0, 3, NULL, '2025-10-09 20:28:05'),
(31, 17, 'lkasdlkaldklñask', 1, 1, NULL, '2025-10-09 21:04:39'),
(32, 18, '2x', 1, 1, NULL, '2025-10-09 21:06:44'),
(33, 21, 'El equipo trabajó duro toda la semana sin embargo, no logró el resultado esperado.', 0, 1, NULL, '2025-10-10 19:55:46'),
(34, 21, 'El equipo trabajó duro toda la semana, sin embargo no logró el resultado esperado.', 0, 2, NULL, '2025-10-10 19:55:46'),
(35, 21, 'El equipo trabajó duro toda la semana; sin embargo, no logró el resultado esperado.', 1, 3, NULL, '2025-10-10 19:55:46'),
(36, 21, 'El equipo trabajó duro toda la semana, sin embargo, no logró el resultado esperado.', 0, 4, NULL, '2025-10-10 19:55:46'),
(37, 22, 'más', 0, 1, NULL, '2025-10-10 19:55:46'),
(38, 22, 'mas ', 1, 2, NULL, '2025-10-10 19:55:46'),
(39, 22, 'máz', 0, 3, NULL, '2025-10-10 19:55:46'),
(40, 22, 'maz', 0, 4, NULL, '2025-10-10 19:55:46'),
(41, 23, 'no obstante', 0, 1, NULL, '2025-10-10 19:55:46'),
(42, 23, 'en cambio', 0, 2, NULL, '2025-10-10 19:55:46'),
(43, 23, 'aun así', 0, 3, NULL, '2025-10-10 19:55:46'),
(44, 23, 'por lo tanto', 1, 4, NULL, '2025-10-10 19:55:46'),
(45, 24, 'El entrenador dijo que mañana entrenarían en la mañana.', 0, 1, NULL, '2025-10-10 19:55:46'),
(46, 24, 'El entrenador dijo que entrenarán mañana en la mañana.', 0, 2, NULL, '2025-10-10 19:55:46'),
(47, 24, ' El entrenador dijo que al día siguiente entrenarían en la mañana.', 1, 3, NULL, '2025-10-10 19:55:46'),
(48, 24, 'El entrenador dijo: al día siguiente entrenaremos en la mañana.', 0, 4, NULL, '2025-10-10 19:55:46'),
(49, 25, 'opinó', 0, 1, NULL, '2025-10-10 19:55:46'),
(50, 25, 'opinaron', 1, 2, NULL, '2025-10-10 19:55:46'),
(51, 25, 'opina', 0, 3, NULL, '2025-10-10 19:55:46'),
(52, 25, 'opinan', 0, 4, NULL, '2025-10-10 19:55:46'),
(53, 26, 'Estoy convencido que el esfuerzo es la clave del éxito', 0, 1, NULL, '2025-10-10 21:30:36'),
(54, 26, ' Pienso de que deberíamos considerar otras alternativas.', 0, 2, NULL, '2025-10-10 21:30:36'),
(55, 26, 'Me alegro de que hayas venido a la reunión de hoy.', 1, 3, NULL, '2025-10-10 21:30:36'),
(56, 26, 'No me di cuenta que ya era tan tarde.', 0, 4, NULL, '2025-10-10 21:30:36');

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
('022a4d01-e334-4d6b-909d-68eec32b01d7', 17, 67, 2, 'finalizado', '2025-10-08 19:36:32', '2025-10-08 19:37:34', 3600, '2025-10-10 15:23:34', NULL),
('07a4554e-525a-48c4-a28d-4c0d63304bf5', 16, 67, 3, 'finalizado', '2025-10-08 19:15:44', '2025-10-08 19:21:45', 10800, '2025-10-10 15:23:34', NULL),
('0830cd4b-a473-4ea0-a3a4-13e822703f07', 22, 67, 3, 'finalizado', '2025-10-10 22:00:43', '2025-10-10 22:01:55', 7200, '2025-10-10 16:00:43', NULL),
('0c29e9f0-d968-4590-8dc3-ece7167dc810', 20, 67, 2, 'finalizado', '2025-10-09 22:59:11', '2025-10-09 22:59:15', 3600, '2025-10-10 15:23:34', NULL),
('14039477-da39-4d39-aeda-a22928058bd6', 19, 67, 1, 'en_progreso', '2025-10-09 23:19:59', NULL, 3600, '2025-10-10 15:23:34', NULL),
('157727d9-613e-4b6c-9b3d-faa9badf9aff', 13, 67, 1, 'en_progreso', '2025-10-07 22:02:31', NULL, 3600, '2025-10-10 15:23:34', NULL),
('1a2390ce-408e-41db-a1fa-7b0f5d64b1a5', 21, 67, 2, 'finalizado', '2025-10-10 20:12:40', '2025-10-10 20:15:13', 3600, '2025-10-10 15:23:34', NULL),
('1aac2512-2885-48b1-a193-4a8ece8ee6cc', 17, 67, 1, 'finalizado', '2025-10-08 19:27:29', '2025-10-08 19:32:10', 3600, '2025-10-10 15:23:34', NULL),
('1c047394-c476-44d0-9353-b598f37d8bcb', 21, 67, 1, 'finalizado', '2025-10-10 20:11:04', '2025-10-10 20:12:08', 3600, '2025-10-10 15:23:34', NULL),
('34e2bf26-51db-4d91-8d2f-42b44a8adfa7', 15, 67, 3, 'finalizado', '2025-10-08 18:51:25', '2025-10-08 18:54:54', 4200, '2025-10-10 15:23:34', NULL),
('3c21ef77-d9f5-4310-9f74-082c35ba9114', 14, 67, 2, 'finalizado', '2025-10-08 18:20:49', '2025-10-08 18:21:12', 4200, '2025-10-10 15:23:34', NULL),
('414f2482-3252-4695-a0ef-d0f9a10bc30e', 21, 67, 3, 'finalizado', '2025-10-10 21:08:49', '2025-10-10 21:09:44', 3600, '2025-10-10 15:23:34', NULL),
('4338d694-84e4-44ee-b3ce-80aae20c8970', 17, 67, 3, 'finalizado', '2025-10-08 19:39:17', '2025-10-08 19:41:14', 3600, '2025-10-10 15:23:34', NULL),
('4b791edf-c8f5-46e6-85ca-8e9c70ef2db1', 18, 67, 1, 'finalizado', '2025-10-09 22:28:07', '2025-10-09 22:35:52', 3600, '2025-10-10 15:23:34', NULL),
('4c96c6ae-431f-4e37-a1dc-1146fdaf713a', 14, 67, 3, 'finalizado', '2025-10-08 18:25:20', '2025-10-08 18:29:46', 4200, '2025-10-10 15:23:34', NULL),
('55401d19-ebb9-4841-9e93-6cf2bcd22a62', 18, 67, 3, 'finalizado', '2025-10-10 19:06:49', '2025-10-10 19:10:43', 3600, '2025-10-10 15:23:34', NULL),
('669ff546-14a5-447b-ac63-760a28ac6fd9', 13, 67, 1, 'en_progreso', '2025-10-07 22:14:48', NULL, 3600, '2025-10-10 15:23:34', NULL),
('69070dc8-cb65-405f-ac07-1134842d1bf9', 13, 67, 1, 'en_progreso', '2025-10-07 22:17:24', NULL, 3600, '2025-10-10 15:23:34', NULL),
('733f4327-e7a7-4619-93d9-b3706931eccf', 13, 67, 1, 'en_progreso', '2025-10-07 22:10:12', NULL, 3600, '2025-10-10 15:23:34', NULL),
('74f25bc9-dcfe-4b6e-a0b9-3cecc3195719', 18, 67, 3, 'en_progreso', '2025-10-10 19:01:53', NULL, 3600, '2025-10-10 15:23:34', NULL),
('80566207-bb67-42fb-a36c-86a4d99a921d', 18, 67, 2, 'finalizado', '2025-10-09 22:38:48', '2025-10-09 22:47:03', 3600, '2025-10-10 15:23:34', NULL),
('9a750fc4-1859-4149-835b-aca97a94b270', 14, 67, 1, 'en_progreso', '2025-10-08 18:04:23', NULL, 4200, '2025-10-10 15:23:34', NULL),
('aaac61bc-7943-42c2-b86a-93a606cba0e8', 13, 67, 1, 'en_progreso', '2025-10-07 21:56:43', NULL, 3600, '2025-10-10 15:23:34', NULL),
('b560766e-8e34-46df-ad27-7a3185762d2b', 13, 67, 2, 'en_progreso', '2025-10-09 23:20:00', NULL, 3600, '2025-10-10 15:23:34', NULL),
('c01a69ea-9b02-4936-90b9-664b0e70bb91', 14, 67, 1, 'finalizado', '2025-10-08 18:14:39', '2025-10-08 18:15:05', 4200, '2025-10-10 15:23:34', NULL),
('c3a3c29d-ca84-438d-9026-77e7039395b0', 22, 67, 1, 'finalizado', '2025-10-10 21:48:06', '2025-10-10 21:51:43', 7200, '2025-10-10 15:48:06', NULL),
('d8a61c6b-b107-496f-a02c-4071e7a390f5', 14, 67, 1, 'en_progreso', '2025-10-08 17:57:41', NULL, 4200, '2025-10-10 15:23:34', NULL),
('da7c1c95-ddeb-406e-8965-cee401417a3f', 15, 67, 2, 'finalizado', '2025-10-08 18:46:38', '2025-10-08 18:48:37', 4200, '2025-10-10 15:23:34', NULL),
('df5e616d-9574-462a-9d72-502da7865d77', 15, 67, 1, 'finalizado', '2025-10-08 18:40:15', '2025-10-08 18:43:57', 4200, '2025-10-10 15:23:34', NULL),
('e05f5b3c-ab88-42fe-b2a5-e3200d3c4866', 13, 67, 1, 'en_progreso', '2025-10-07 22:04:28', NULL, 3600, '2025-10-10 15:23:34', NULL),
('e4de617c-67c3-40d5-a6ae-62becd5d93f8', 20, 67, 3, 'finalizado', '2025-10-09 23:02:09', '2025-10-09 23:04:06', 3600, '2025-10-10 15:23:34', NULL),
('e6c4e6de-bb45-44bb-be6b-472ad18381d1', 14, 67, 1, 'en_progreso', '2025-10-08 18:04:39', NULL, 4200, '2025-10-10 15:23:34', NULL),
('eb0b270a-a7d0-4088-b98c-16ef7ce2975b', 13, 67, 1, 'finalizado', '2025-10-07 22:19:58', '2025-10-07 22:27:17', 3600, '2025-10-10 15:23:34', NULL),
('ef265ae3-196c-45b4-b032-e008ec5e40fe', 20, 67, 1, 'finalizado', '2025-10-09 22:57:01', '2025-10-09 22:57:05', 3600, '2025-10-10 15:23:34', NULL),
('efeadd35-344e-42a1-a882-a9add62226f0', 16, 67, 2, 'finalizado', '2025-10-08 19:10:19', '2025-10-08 19:12:01', 10800, '2025-10-10 15:23:34', NULL),
('f2b1e705-2c49-458b-a092-5be667d73e07', 22, 67, 2, 'finalizado', '2025-10-10 21:52:07', '2025-10-10 21:53:10', 7200, '2025-10-10 15:52:07', NULL),
('fd957db5-a7bd-4ba2-9b7f-d317105d5307', 16, 67, 1, 'finalizado', '2025-10-08 19:01:05', '2025-10-08 19:04:52', 10800, '2025-10-10 15:23:34', NULL);

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `quizzes_sesiones_respuestas`
--

INSERT INTO `quizzes_sesiones_respuestas` (`id`, `id_sesion`, `id_pregunta`, `id_opcion`, `valor_texto`, `correcta`, `tiempo_ms`, `created_at`) VALUES
(2, '4338d694-84e4-44ee-b3ce-80aae20c8970', 10, 13, NULL, 1, NULL, '2025-10-08 19:41:14'),
(3, '80566207-bb67-42fb-a36c-86a4d99a921d', 12, 17, NULL, 0, NULL, '2025-10-09 22:47:03'),
(4, '80566207-bb67-42fb-a36c-86a4d99a921d', 13, 19, NULL, 0, NULL, '2025-10-09 22:47:03'),
(5, '80566207-bb67-42fb-a36c-86a4d99a921d', 14, 24, NULL, 1, NULL, '2025-10-09 22:47:03'),
(6, '80566207-bb67-42fb-a36c-86a4d99a921d', 15, 26, NULL, 0, NULL, '2025-10-09 22:47:03'),
(7, '80566207-bb67-42fb-a36c-86a4d99a921d', 16, 28, NULL, 0, NULL, '2025-10-09 22:47:03'),
(8, 'ef265ae3-196c-45b4-b032-e008ec5e40fe', 18, 32, NULL, 1, NULL, '2025-10-09 22:57:05'),
(9, '0c29e9f0-d968-4590-8dc3-ece7167dc810', 18, 32, NULL, 1, NULL, '2025-10-09 22:59:15'),
(10, 'e4de617c-67c3-40d5-a6ae-62becd5d93f8', 18, 32, NULL, 1, NULL, '2025-10-09 23:04:06'),
(11, '55401d19-ebb9-4841-9e93-6cf2bcd22a62', 12, 16, NULL, 0, NULL, '2025-10-10 19:10:43'),
(12, '55401d19-ebb9-4841-9e93-6cf2bcd22a62', 13, 20, NULL, 1, NULL, '2025-10-10 19:10:43'),
(13, '55401d19-ebb9-4841-9e93-6cf2bcd22a62', 14, 24, NULL, 1, NULL, '2025-10-10 19:10:43'),
(14, '55401d19-ebb9-4841-9e93-6cf2bcd22a62', 15, 27, NULL, 1, NULL, '2025-10-10 19:10:43'),
(15, '55401d19-ebb9-4841-9e93-6cf2bcd22a62', 16, 29, NULL, 1, NULL, '2025-10-10 19:10:43'),
(16, '1a2390ce-408e-41db-a1fa-7b0f5d64b1a5', 21, 33, NULL, 0, NULL, '2025-10-10 20:15:13'),
(17, '1a2390ce-408e-41db-a1fa-7b0f5d64b1a5', 22, 37, NULL, 0, NULL, '2025-10-10 20:15:13'),
(18, '1a2390ce-408e-41db-a1fa-7b0f5d64b1a5', 23, 41, NULL, 0, NULL, '2025-10-10 20:15:13'),
(19, '1a2390ce-408e-41db-a1fa-7b0f5d64b1a5', 24, 45, NULL, 0, NULL, '2025-10-10 20:15:13'),
(20, '1a2390ce-408e-41db-a1fa-7b0f5d64b1a5', 25, 50, NULL, 1, NULL, '2025-10-10 20:15:13'),
(21, '414f2482-3252-4695-a0ef-d0f9a10bc30e', 21, 33, NULL, 0, NULL, '2025-10-10 21:09:44'),
(22, '414f2482-3252-4695-a0ef-d0f9a10bc30e', 22, 38, NULL, 1, NULL, '2025-10-10 21:09:44'),
(23, '414f2482-3252-4695-a0ef-d0f9a10bc30e', 23, 44, NULL, 1, NULL, '2025-10-10 21:09:44'),
(24, '414f2482-3252-4695-a0ef-d0f9a10bc30e', 24, 46, NULL, 0, NULL, '2025-10-10 21:09:44'),
(25, '414f2482-3252-4695-a0ef-d0f9a10bc30e', 25, 50, NULL, 1, NULL, '2025-10-10 21:09:44'),
(26, 'c3a3c29d-ca84-438d-9026-77e7039395b0', 26, 54, NULL, 0, NULL, '2025-10-10 21:51:43'),
(27, 'f2b1e705-2c49-458b-a092-5be667d73e07', 26, 54, NULL, 0, NULL, '2025-10-10 21:53:10'),
(28, '0830cd4b-a473-4ea0-a3a4-13e822703f07', 26, 55, NULL, 1, NULL, '2025-10-10 22:01:55');

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
(1, '', NULL, NULL, NULL, NULL, 1, 0, 21, '2025-10-13 21:16:28', '2025-10-13 21:16:39', NULL),
(2, 'sdfsdfsd', 'dsfsdfdsfsdfsdf', NULL, '2025-10-21 00:00:00', 60, 1, 0, 21, '2025-10-13 21:21:48', '2025-10-13 21:43:45', '[\"v1\"]'),
(7, 'prueba 5', NULL, NULL, NULL, 60, 1, 1, 21, '2025-10-13 22:58:48', '2025-10-13 22:59:16', NULL);

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
(7, 7, 67, 80.00, 1, 28, 5, 4, '2025-10-14 16:36:28'),
(8, 7, 67, 60.00, 2, 21, 5, 3, '2025-10-14 16:51:26'),
(9, 7, 67, 40.00, 3, 44, 5, 2, '2025-10-14 17:51:22'),
(10, 7, 67, 60.00, 4, 29, 5, 3, '2025-10-14 18:10:14'),
(11, 7, 67, 80.00, 5, 228, 5, 4, '2025-10-14 18:23:19');

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
(5, 1, 1, 'dasfdasFSDFAASF', 'opcion_multiple', 1, 1),
(7, 2, 1, 'WDWQDWQDWQD', 'opcion_multiple', 1, 1),
(35, 7, 1, 'Español: ¿Cuál es un sinónimo de \"rápido\"?', 'opcion_multiple', 1, 1),
(36, 7, 2, 'Matemáticas: ¿Cuál es el resultado de 7 × 8?', 'opcion_multiple', 1, 1),
(37, 7, 3, 'Ciencias: ¿Cuál es el planeta más cercano al Sol?', 'opcion_multiple', 1, 1),
(38, 7, 4, 'Inglés: Selecciona la palabra escrita correctamente', 'opcion_multiple', 1, 1),
(39, 7, 5, 'Historia: ¿En qué año comenzó la Primera Guerra Mundial?', 'opcion_multiple', 1, 1);

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
(2, 5, 'ASFSAFF', 1, 1),
(4, 7, 'DQWDQW', 1, 1),
(107, 35, 'Veloz', 1, 1),
(108, 35, 'Lento', 0, 2),
(109, 35, 'Torpe', 0, 3),
(110, 35, 'Pesado', 0, 4),
(111, 36, '56', 1, 1),
(112, 36, '54', 0, 2),
(113, 36, '48', 0, 3),
(114, 36, '49', 0, 4),
(115, 37, 'Mercurio', 1, 1),
(116, 37, 'Venus', 0, 2),
(117, 37, 'Tierra', 0, 3),
(118, 37, 'Marte', 0, 4),
(119, 38, 'beautiful', 1, 1),
(120, 38, 'beatiful', 0, 2),
(121, 38, 'beautifull', 0, 3),
(122, 38, 'beutiful', 0, 4),
(123, 39, '1914', 1, 1),
(124, 39, '1918', 0, 2),
(125, 39, '1939', 0, 3),
(126, 39, '1945', 0, 4);

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
  `tiempo_ms` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `simulaciones_respuestas`
--

INSERT INTO `simulaciones_respuestas` (`id`, `id_sesion`, `id_pregunta`, `id_opcion`, `texto_libre`, `tiempo_ms`) VALUES
(32, 8, 35, 107, NULL, 3030),
(33, 8, 36, 111, NULL, 4204),
(34, 8, 37, 118, NULL, 6250),
(35, 8, 35, 107, NULL, 3030),
(36, 8, 36, 111, NULL, 4204),
(37, 8, 37, 118, NULL, 6250),
(38, 8, 38, 119, NULL, 10252),
(39, 8, 39, 123, NULL, 3173),
(40, 8, 35, 107, NULL, 3030),
(41, 8, 36, 111, NULL, 4204),
(42, 8, 37, 118, NULL, 6250),
(43, 8, 38, 119, NULL, 10252),
(44, 8, 39, 123, NULL, 3173),
(45, 9, 35, 107, NULL, 4736),
(46, 9, 36, 111, NULL, 2860),
(47, 9, 37, 118, NULL, 1248),
(48, 9, 38, 119, NULL, 8558),
(49, 9, 39, 124, NULL, 2010),
(50, 9, 35, 107, NULL, 4736),
(51, 9, 36, 111, NULL, 2860),
(52, 9, 37, 118, NULL, 1248),
(53, 9, 38, 119, NULL, 8558),
(54, 9, 39, 124, NULL, 2010),
(55, 11, 35, 107, NULL, 33391),
(56, 11, 36, 111, NULL, 4211),
(57, 11, 37, 118, NULL, 976),
(58, 11, 38, 121, NULL, 1492),
(59, 11, 39, 124, NULL, 924),
(60, 11, 35, 107, NULL, 33391),
(61, 11, 36, 111, NULL, 4211),
(62, 11, 37, 118, NULL, 976),
(63, 11, 38, 121, NULL, 1492),
(64, 11, 39, 124, NULL, 924),
(65, 12, 35, 107, NULL, 21773),
(66, 12, 36, 111, NULL, 1352),
(67, 12, 37, 118, NULL, 1084),
(68, 12, 38, 121, NULL, 1292),
(69, 12, 39, 123, NULL, 2426),
(70, 12, 35, 107, NULL, 21773),
(71, 12, 36, 111, NULL, 1352),
(72, 12, 37, 118, NULL, 1084),
(73, 12, 38, 121, NULL, 1292),
(74, 12, 39, 123, NULL, 2426),
(75, 13, 35, 107, NULL, 41782),
(76, 13, 36, 111, NULL, 3596),
(77, 13, 37, 118, NULL, 42794),
(78, 13, 37, 115, NULL, 53305),
(79, 13, 35, 109, NULL, 48344),
(80, 13, 36, 112, NULL, 17010),
(81, 13, 38, 119, NULL, 51050),
(82, 13, 36, 111, NULL, 29848),
(83, 13, 35, 107, NULL, 69358),
(84, 13, 35, 107, NULL, 69358),
(85, 13, 36, 111, NULL, 29848),
(86, 13, 37, 115, NULL, 53305),
(87, 13, 38, 119, NULL, 51050),
(88, 13, 39, 124, NULL, 19816),
(89, 13, 35, 107, NULL, 69358),
(90, 13, 36, 111, NULL, 29848),
(91, 13, 37, 115, NULL, 53305),
(92, 13, 38, 119, NULL, 51050),
(93, 13, 39, 124, NULL, 19816);

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
(8, 7, 67, '2025-10-14 16:36:00', '2025-10-14 16:36:28', 27912),
(9, 7, 67, '2025-10-14 16:51:05', '2025-10-14 16:51:26', 20895),
(10, 7, 67, '2025-10-14 17:48:00', NULL, NULL),
(11, 7, 67, '2025-10-14 17:50:38', '2025-10-14 17:51:22', 43675),
(12, 7, 67, '2025-10-14 18:09:45', '2025-10-14 18:10:14', 29312),
(13, 7, 67, '2025-10-14 18:19:31', '2025-10-14 18:23:19', 227664);

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
(2, 67, 102, 'actividad', 21, '2025-10-13 16:58:17');

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
(3, 67, 102, 'simulacion', 'pending', NULL, NULL, '2025-10-13 16:59:55', NULL),
(4, 67, 107, 'simulacion', 'pending', NULL, NULL, '2025-10-13 17:00:01', NULL),
(5, 67, 101, 'simulacion', 'pending', NULL, NULL, '2025-10-13 17:00:05', NULL),
(6, 67, 104, 'actividad', 'pending', NULL, NULL, '2025-10-13 17:02:55', NULL),
(7, 67, 103, 'actividad', 'pending', NULL, NULL, '2025-10-13 17:03:17', NULL);

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
(3, 67, 'assignment', 'Nueva actividad asignada', 'Se te asignó: prueba 2', '/alumno/actividades', '{\"actividad_id\":3}', 1, '2025-08-21 03:22:31'),
(4, 69, 'assignment', 'Nueva actividad asignada', 'Se te asignó: prueba 2', '/alumno/actividades', '{\"actividad_id\":3}', 1, '2025-08-21 03:22:31'),
(5, 71, 'assignment', 'Nueva actividad asignada', 'Se te asignó: prueba 2', '/alumno/actividades', '{\"actividad_id\":3}', 0, '2025-08-21 03:22:31'),
(6, 72, 'assignment', 'Nueva actividad asignada', 'Se te asignó: prueba 2', '/alumno/actividades', '{\"actividad_id\":3}', 0, '2025-08-21 03:22:31'),
(7, 67, 'grade', 'Calificación publicada', 'Tu entrega fue calificada con 10', '/alumno/actividades', '{\"entrega_id\":4,\"actividad_id\":3,\"calificacion\":10}', 1, '2025-08-21 04:20:35'),
(8, 67, 'assignment', 'Nueva actividad asignada', 'Se te asignó: PRODUCTOS NOTABLES', '/alumno/actividades', '{\"actividad_id\":4}', 1, '2025-08-21 19:03:39'),
(9, 69, 'assignment', 'Nueva actividad asignada', 'Se te asignó: PRODUCTOS NOTABLES', '/alumno/actividades', '{\"actividad_id\":4}', 0, '2025-08-21 19:03:39'),
(10, 71, 'assignment', 'Nueva actividad asignada', 'Se te asignó: PRODUCTOS NOTABLES', '/alumno/actividades', '{\"actividad_id\":4}', 0, '2025-08-21 19:03:39'),
(11, 72, 'assignment', 'Nueva actividad asignada', 'Se te asignó: PRODUCTOS NOTABLES', '/alumno/actividades', '{\"actividad_id\":4}', 0, '2025-08-21 19:03:39'),
(12, 73, 'assignment', 'Nueva actividad asignada', 'Se te asignó: PRODUCTOS NOTABLES', '/alumno/actividades', '{\"actividad_id\":4}', 1, '2025-08-21 19:03:39'),
(13, 73, 'grade', 'Calificación publicada', 'Tu entrega fue calificada con 8', '/alumno/actividades', '{\"entrega_id\":5,\"actividad_id\":4,\"calificacion\":8}', 1, '2025-08-21 19:07:32'),
(14, 67, 'assignment', 'Nueva actividad asignada', 'Se te asignó: prueba nuevo panel', '/alumno/actividades', '{\"actividad_id\":5}', 1, '2025-10-06 22:51:40'),
(15, 69, 'assignment', 'Nueva actividad asignada', 'Se te asignó: prueba nuevo panel', '/alumno/actividades', '{\"actividad_id\":5}', 0, '2025-10-06 22:51:40'),
(16, 71, 'assignment', 'Nueva actividad asignada', 'Se te asignó: prueba nuevo panel', '/alumno/actividades', '{\"actividad_id\":5}', 0, '2025-10-06 22:51:40'),
(17, 72, 'assignment', 'Nueva actividad asignada', 'Se te asignó: prueba nuevo panel', '/alumno/actividades', '{\"actividad_id\":5}', 0, '2025-10-06 22:51:40'),
(18, 73, 'assignment', 'Nueva actividad asignada', 'Se te asignó: prueba nuevo panel', '/alumno/actividades', '{\"actividad_id\":5}', 0, '2025-10-06 22:51:40'),
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
(42, 67, 'assignment', 'Nueva actividad asignada', 'Se te asignó: prueba 1', '/alumno/actividades', '{\"actividad_id\":23}', 1, '2025-10-10 22:54:08'),
(43, 69, 'assignment', 'Nueva actividad asignada', 'Se te asignó: prueba 1', '/alumno/actividades', '{\"actividad_id\":23}', 0, '2025-10-10 22:54:08'),
(44, 71, 'assignment', 'Nueva actividad asignada', 'Se te asignó: prueba 1', '/alumno/actividades', '{\"actividad_id\":23}', 0, '2025-10-10 22:54:08'),
(45, 72, 'assignment', 'Nueva actividad asignada', 'Se te asignó: prueba 1', '/alumno/actividades', '{\"actividad_id\":23}', 0, '2025-10-10 22:54:08'),
(46, 73, 'assignment', 'Nueva actividad asignada', 'Se te asignó: prueba 1', '/alumno/actividades', '{\"actividad_id\":23}', 0, '2025-10-10 22:54:08'),
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
(123, 73, 'assignment', 'Nueva simulación asignada', 'Se te asignó: sadd', '/alumno/simulaciones', '{\"simulacion_id\":4,\"kind\":\"simulacion\"}', 0, '2025-10-13 21:46:39');

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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(3, 'miguel', '$2b$10$JkGqmotlDUI4Kuutn3ywoesTpA3izIF6QjlJUygfyizNoO9xJpJye', 1, '2025-10-15 10:34:12', NULL, 0, NULL, 'estudiante', 67, '2025-08-11 00:41:45'),
(6, 'jesica_admin', '$2b$10$C9FZlnOw4.vJfjxh5E/H8OZu0S7g7ZF.dRiCopqNfz/8Hta1ta9VW', 1, '2025-10-13 12:52:51', NULL, 0, NULL, 'admin', NULL, '2025-08-11 04:00:37'),
(8, 'jessica.mqerk', '$2b$10$/.53BvJ4Vuh6E910koGzqOOHU7m5kvsR2x8q8gE.4iN7tEem93Une', 1, NULL, NULL, 0, NULL, 'estudiante', 69, '2025-08-11 19:36:41'),
(10, 'kelvincienytec', '$2b$10$A.Y8E73jINN6a0AWHDEId.lxAy6F4HBSz83NZhEvchCwAgGXfa7Oa', 1, '2025-10-06 11:03:12', NULL, 0, NULL, 'asesor', NULL, '2025-08-11 22:48:41'),
(20, 'juan8', '$2b$10$WY5sxiP7FVP5q6MxJHcsFeKo5P8Aah.9HvfqfWYkQF.ULEeBPewdC', 1, NULL, NULL, 0, NULL, 'estudiante', 73, '2025-08-21 18:19:30'),
(21, 'jair.asesor', '$2b$10$UjpfEXATomGY6ftdqu2niuLgNQ7sGLkd8Or/5EeQwsJW5d.ybdDp6', 0, '2025-10-14 10:33:48', '2025-10-13 12:59:25', 0, NULL, 'asesor', NULL, '2025-10-06 17:29:14');

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
  ADD KEY `idx_actividades_area` (`id_area`);

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
  ADD KEY `idx_entregas_comentarios_updated_at` (`comentarios_updated_at`);

--
-- Indices de la tabla `actividades_entregas_archivos`
--
ALTER TABLE `actividades_entregas_archivos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_entrega_archivos_entrega` (`entrega_id`);

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
  ADD KEY `idx_admin_user_id` (`user_id`);

--
-- Indices de la tabla `areas`
--
ALTER TABLE `areas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_areas_tipo` (`tipo`),
  ADD KEY `idx_areas_activo` (`activo`);

--
-- Indices de la tabla `asesor_perfiles`
--
ALTER TABLE `asesor_perfiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_asesor_perfiles_preregistro` (`preregistro_id`),
  ADD KEY `idx_ap_preregistro` (`preregistro_id`),
  ADD KEY `idx_ap_usuario` (`usuario_id`),
  ADD KEY `idx_asesor_perfiles_curp` (`curp`),
  ADD KEY `idx_asesor_perfiles_grupo` (`grupo_asesor`);

--
-- Indices de la tabla `asesor_preregistros`
--
ALTER TABLE `asesor_preregistros`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_asesor_prereg_correo` (`correo`);

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
-- Indices de la tabla `calendar_events`
--
ALTER TABLE `calendar_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_calendar_events_user_fecha` (`user_id`,`fecha`);

--
-- Indices de la tabla `comprobantes`
--
ALTER TABLE `comprobantes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_estudiante` (`id_estudiante`);

--
-- Indices de la tabla `contratos`
--
ALTER TABLE `contratos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_contratos_folio` (`folio`),
  ADD KEY `fk_contratos_estudiante` (`id_estudiante`);

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
  ADD KEY `idx_estudiantes_folio_formateado` (`folio_formateado`);

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
  ADD KEY `fk_feedback_submissions_replaced` (`replaced_by`);

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
  ADD KEY `idx_quiz_orden` (`id_quiz`,`orden`);

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
  ADD KEY `idx_qs_quiz_est` (`id_quiz`,`id_estudiante`);

--
-- Indices de la tabla `quizzes_sesiones_respuestas`
--
ALTER TABLE `quizzes_sesiones_respuestas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_resp_sesion` (`id_sesion`),
  ADD KEY `idx_resp_pregunta` (`id_pregunta`),
  ADD KEY `fk_resp_opcion` (`id_opcion`),
  ADD KEY `idx_qsr_sesion` (`id_sesion`);

--
-- Indices de la tabla `simulaciones`
--
ALTER TABLE `simulaciones`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `simulaciones_intentos`
--
ALTER TABLE `simulaciones_intentos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_sim_int_sim` (`id_simulacion`);

--
-- Indices de la tabla `simulaciones_preguntas`
--
ALTER TABLE `simulaciones_preguntas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_sim_preg_sim` (`id_simulacion`);

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
  ADD KEY `fk_sim_resp_opc` (`id_opcion`);

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
  ADD KEY `idx_student_created` (`student_id`,`created_at`);

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
  ADD KEY `idx_usuarios_id_estudiante` (`id_estudiante`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `actividades`
--
ALTER TABLE `actividades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `actividades_entregas`
--
ALTER TABLE `actividades_entregas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `actividades_entregas_archivos`
--
ALTER TABLE `actividades_entregas_archivos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

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
-- AUTO_INCREMENT de la tabla `calendar_events`
--
ALTER TABLE `calendar_events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=92;

--
-- AUTO_INCREMENT de la tabla `comprobantes`
--
ALTER TABLE `comprobantes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `contratos`
--
ALTER TABLE `contratos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `eeau`
--
ALTER TABLE `eeau`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `estudiantes`
--
ALTER TABLE `estudiantes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT de la tabla `estudiantes_config`
--
ALTER TABLE `estudiantes_config`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

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
-- AUTO_INCREMENT de la tabla `quizzes_intentos`
--
ALTER TABLE `quizzes_intentos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `quizzes_materias`
--
ALTER TABLE `quizzes_materias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `quizzes_preguntas`
--
ALTER TABLE `quizzes_preguntas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT de la tabla `quizzes_preguntas_materias`
--
ALTER TABLE `quizzes_preguntas_materias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `quizzes_preguntas_opciones`
--
ALTER TABLE `quizzes_preguntas_opciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT de la tabla `quizzes_sesiones_respuestas`
--
ALTER TABLE `quizzes_sesiones_respuestas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT de la tabla `simulaciones`
--
ALTER TABLE `simulaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `simulaciones_intentos`
--
ALTER TABLE `simulaciones_intentos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `simulaciones_preguntas`
--
ALTER TABLE `simulaciones_preguntas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT de la tabla `simulaciones_preguntas_opciones`
--
ALTER TABLE `simulaciones_preguntas_opciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=127;

--
-- AUTO_INCREMENT de la tabla `simulaciones_respuestas`
--
ALTER TABLE `simulaciones_respuestas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=94;

--
-- AUTO_INCREMENT de la tabla `simulaciones_sesiones`
--
ALTER TABLE `simulaciones_sesiones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `soft_deletes`
--
ALTER TABLE `soft_deletes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `student_area_permissions`
--
ALTER TABLE `student_area_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `student_area_requests`
--
ALTER TABLE `student_area_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `student_notifications`
--
ALTER TABLE `student_notifications`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=124;

--
-- AUTO_INCREMENT de la tabla `student_reminders`
--
ALTER TABLE `student_reminders`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

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
-- Filtros para la tabla `admin_profiles`
--
ALTER TABLE `admin_profiles`
  ADD CONSTRAINT `fk_admin_user` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `asesor_perfiles`
--
ALTER TABLE `asesor_perfiles`
  ADD CONSTRAINT `fk_ap_preregistro` FOREIGN KEY (`preregistro_id`) REFERENCES `asesor_preregistros` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ap_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
-- Filtros para la tabla `quizzes_intentos`
--
ALTER TABLE `quizzes_intentos`
  ADD CONSTRAINT `fk_quiz_intento_estudiante` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_quiz_intento_quiz` FOREIGN KEY (`id_quiz`) REFERENCES `actividades` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `quizzes_preguntas`
--
ALTER TABLE `quizzes_preguntas`
  ADD CONSTRAINT `fk_pregunta_quiz` FOREIGN KEY (`id_quiz`) REFERENCES `actividades` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `quizzes_preguntas_opciones`
--
ALTER TABLE `quizzes_preguntas_opciones`
  ADD CONSTRAINT `fk_opcion_pregunta` FOREIGN KEY (`id_pregunta`) REFERENCES `quizzes_preguntas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `quizzes_sesiones`
--
ALTER TABLE `quizzes_sesiones`
  ADD CONSTRAINT `fk_sesion_est` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_sesion_quiz` FOREIGN KEY (`id_quiz`) REFERENCES `actividades` (`id`) ON DELETE CASCADE;

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
