-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 22-08-2025 a las 20:15:48
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
) ;

--
-- Volcado de datos para la tabla `actividades`
--

INSERT INTO `actividades` (`id`, `titulo`, `descripcion`, `tipo`, `id_area`, `materia`, `puntos_max`, `peso_calificacion`, `fecha_limite`, `grupos`, `recursos_json`, `imagen_portada`, `visible_desde`, `visible_hasta`, `max_intentos`, `time_limit_min`, `passing_score`, `shuffle_questions`, `requiere_revision`, `activo`, `publicado`, `creado_por`, `created_at`, `updated_at`) VALUES
(2, 'probando', 'probando', 'actividad', 1, NULL, 100, 0.00, '2025-08-19 23:59:00', '[\"V1\"]', '[{\"archivo\":\"/public/1755659683193-fundamentos-de-sql-3edi-oppel-o6t27e.pdf\",\"nombre\":\"fundamentos_de_sql_3edi_oppel.pdf\",\"mime\":\"application/pdf\",\"tamano\":2735617}]', NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 1, 1, NULL, '2025-08-20 03:14:43', '2025-08-20 03:14:43'),
(3, 'prueba 2', 'dwdwd', 'actividad', 2, NULL, 100, 0.00, '2025-08-20 23:59:00', '[\"V1\"]', '[{\"archivo\":\"/public/1755746551923-manual-sql1-xse5n7.pdf\",\"nombre\":\"Manual-SQL1.pdf\",\"mime\":\"application/pdf\",\"tamano\":1083603}]', NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 1, 1, NULL, '2025-08-21 03:22:31', '2025-08-21 03:22:31'),
(4, 'PRODUCTOS NOTABLES', 'ANALIZA Y RESUELVE LOS EJERCICIOS DE MANERA ORDENADA', 'actividad', 2, NULL, 100, 0.00, '2025-08-22 23:59:00', '[\"V1\"]', '[{\"archivo\":\"/public/1755803019726-reglamento-uwilb0.pdf\",\"nombre\":\"REGLAMENTO.pdf\",\"mime\":\"application/pdf\",\"tamano\":182775}]', NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 1, 1, NULL, '2025-08-21 19:03:39', '2025-08-21 19:03:39');

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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Volcado de datos para la tabla `actividades_entregas`
--

INSERT INTO `actividades_entregas` (`id`, `id_actividad`, `id_estudiante`, `archivo`, `original_nombre`, `mime_type`, `tamano`, `calificacion`, `comentarios`, `estado`, `version`, `replaced_by`, `entregada_at`, `created_at`, `updated_at`) VALUES
(2, 2, 67, '/public/1755663991234-manual-sql1-compressed-xqr4i9.pdf', 'Manual-SQL1_compressed.pdf', 'application/pdf', 159959, 8, NULL, 'revisada', 1, 3, '2025-08-20 04:26:31', '2025-08-20 04:26:31', '2025-08-20 21:10:01'),
(3, 2, 67, '/public/1755664370234-comprobante-pago-mq-20250729-0001-xn3rl6.pdf', 'comprobante-pago-MQ-20250729-0001.pdf', 'application/pdf', 8708, NULL, NULL, 'entregada', 2, NULL, '2025-08-20 04:32:50', '2025-08-20 04:32:50', '2025-08-20 04:32:50'),
(4, 3, 67, '/public/1755748227979-manual-sql1-compressed-rbyjro.pdf', 'Manual-SQL1_compressed.pdf', 'application/pdf', 159959, 10, NULL, 'revisada', 1, NULL, '2025-08-21 03:50:28', '2025-08-21 03:50:28', '2025-08-21 04:20:35'),
(5, 4, 73, '/public/1755803132983-i-ndice-del-modelo-educativo-disruptivo--q621tt.pdf', 'IÌNDICE DEL MODELO EDUCATIVO DISRUPTIVO Y SOSTENIBLE 1) (1).pdf', 'application/pdf', 1096240, 8, NULL, 'revisada', 1, NULL, '2025-08-21 19:05:33', '2025-08-21 19:05:33', '2025-08-21 19:07:32');

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
(4, 5, '/public/1755803132983-i-ndice-del-modelo-educativo-disruptivo--q621tt.pdf', 'IÌNDICE DEL MODELO EDUCATIVO DISRUPTIVO Y SOSTENIBLE 1) (1).pdf', 'application/pdf', 1096240, '2025-08-21 19:05:33');

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
(1, 480, 5, 90, 0, '2025-08-22 17:12:32', 'MQerKAcademy', 'admin@mqerk.com', '+52 999 123 4567', 'Calle Principal #123, Mérida, Yucatán', 'https://mqerk.com', '8:00 AM - 6:00 PM', NULL, NULL, NULL, NULL);

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
(1, 1, 10, 'V1', NULL, 'Calle Falsa 123', 'Tuxtepec', '1990-05-10', 'Mexicana', 'Masculino', 'PECA900510XXX', 'Licenciatura', 'Universidad X', 1, 2014, NULL, NULL, '1-3 años', NULL, 'Empresa Demo', 'Desarrollador', 'Desarrollo de apps', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, NULL, NULL, NULL, '2025-08-17 00:26:43', '2025-08-18 02:48:52');

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
(1, 'Carlos', 'Pérez', 'carlos.perez@example.com', '2871000000', 'Tecnologia', 'Licenciatura', 'completed', '2025-08-17 00:26:43', '2025-08-17 23:26:43');

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
  `bigfive_respuestas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`bigfive_respuestas`)),
  `dass21_respuestas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dass21_respuestas`)),
  `zavic_respuestas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`zavic_respuestas`)),
  `baron_respuestas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`baron_respuestas`)),
  `wais_respuestas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`wais_respuestas`)),
  `academica_respuestas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`academica_respuestas`)),
  `dass21_subescalas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dass21_subescalas`)),
  `bigfive_dimensiones` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`bigfive_dimensiones`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `bigfive_respuestas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`bigfive_respuestas`)),
  `dass21_respuestas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dass21_respuestas`)),
  `zavic_respuestas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`zavic_respuestas`)),
  `baron_respuestas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`baron_respuestas`)),
  `wais_respuestas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`wais_respuestas`)),
  `academica_respuestas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`academica_respuestas`)),
  `dass21_subescalas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dass21_subescalas`)),
  `bigfive_dimensiones` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`bigfive_dimensiones`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(2, 6, 'sxsx', 'sdsd', '2025-01-30', '16:00:00', 'academico', 'alta', 15, 0, '2025-08-21 18:24:55', '2025-08-21 18:24:55');

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

INSERT INTO `estudiantes` (`id`, `nombre`, `apellidos`, `email`, `foto`, `grupo`, `comunidad1`, `comunidad2`, `telefono`, `fecha_nacimiento`, `nombre_tutor`, `tel_tutor`, `academico1`, `academico2`, `semestre`, `alergia`, `alergia2`, `discapacidad1`, `discapacidad2`, `orientacion`, `universidades1`, `universidades2`, `postulacion`, `modalidad`, `comentario1`, `comentario2`, `curso`, `turno`, `plan`, `academia`, `anio`, `folio`, `verificacion`, `created_at`, `asesor`) VALUES
(67, 'Miguel', 'Angel', 'isc20350265@gmail.com', '/public/1755139227661-abelito-83uin1.jfif', 'V1', 'SAN JUAN BAUTISTA TUXTEPEC', '', '2811975587', '2000-11-01', 'Rosa Isela', '2811975587', 'CBTis', 'CBTis', 'Concluido', 'Si', 'Antibioticos', 'Si', 'Autismo', 'No', 'NAVAL,TECNM', '', 'ISC', 'ISC', 'ok', 'bien', 'EEAU', 'VESPERTINO', 'Start', 'CBTis', 25, 1, 2, '2025-08-11 00:41:37', 'Carlos Pérez'),
(69, 'Jessica', 'Fernandez', 'ige19350409@gmail.com', '/public/1754940987329-518323640_2494738954216624_926389333829993898_n.jpg', 'V1', 'SAN JUAN BAUTISTA TUXTEPEC', '', '2878819370', NULL, 'kelvin', '2874581265', 'CBTis', '', 'Concluido', 'No', '', 'No', '', 'No', 'TECNM', '', 'ige', 'ige', '...', '...', 'EEAU', 'VESPERTINO', 'Start', 'MQerKAcademy', 25, 3, 2, '2025-08-11 19:36:27', 'Carlos Pérez'),
(70, 'Emir', 'cruz zamora', 'isc20350265@gmail.com', '/public/1754943896459-WhatsApp Image 2025-08-10 at 2.33.38 PM.jpeg', 'V2', 'LOMA BONITA', '', '281975587', NULL, 'Miguel Angel', '281975587', 'CBTis', '', '6° semestre', 'No', '', 'No', '', 'No', 'TECNM,NAVAL', '', 'ISC', 'ISC', 'xxx', 'xxx', 'EEAU', 'VESPERTINO', 'Mensual', 'MQerKAcademy', 25, 4, 3, '2025-08-11 20:24:56', 'Kélvil Valentín Gómez Ramírez'),
(71, 'Gerardo ', 'Arcilla', 'gera@gmail.com', '/public/1755028421157-ChatGPT Image 10 ago 2025, 18_11_50.png', 'V1', 'SAN JOSÉ CHILTEPEC', '', '2871811232', NULL, 'Alejandro Lopez', '2871809089', 'CBTis', '', '5° semestre', 'Si', 'Antibioticos', 'Si', 'TDH', 'No', 'IPN,UAQ', '', 'Logistica', 'Logistica', 'educar', 'excelente', 'EEAU', 'VESPERTINO', 'Premium', 'MQerKAcademy', 25, 5, 2, '2025-08-12 19:53:41', 'Carlos Pérez'),
(72, 'Andres', 'Saul Canelo', 'andy@gmail.com', '/public/1755029883708-file_000000007acc61f6a8019e5a25720850.png', 'V1', 'AYOTZINTEPEC', '', '2871811231', NULL, 'Aron Vazquez', '2878752825', 'COLEGIO AMÉRICA', 'cbtis', '6° semestre', 'si', 'Antibioticos', 'Si', 'Autismo', 'No', 'ANAHUAC', '', 'Medicina', 'Presencial', 'x', 'x', 'EEAU', 'VESPERTINO', 'Start', 'COLEGIO AMÉRICA', 25, 6, 2, '2025-08-12 20:18:03', 'Carlos Pérez'),
(73, 'Juan ', 'Perez Del Rio ', 'juanperez8@gmail.com', '/public/1755800362156-5-7u6pqt.png', 'V1', '', 'Valle de bravo', '2871811233', NULL, 'Jessica Hernandez', '2871811234', '', 'CEBETIS', '5° semestre', 'Si', 'ANTIBIOTICOS', 'Si', 'Autismo', 'Si', '', '', '', 'Presencial', 'SSS', 'SSS', 'EEAU', 'VESPERTINO', 'Premium', 'MQerKAcademy', 25, 7, 2, '2025-08-21 18:19:22', 'Kélvil Valentín Gómez Ramírez');

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
-- Estructura de tabla para la tabla `feedback_tasks`
--

CREATE TABLE `feedback_tasks` (
  `id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
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

INSERT INTO `feedback_tasks` (`id`, `nombre`, `descripcion`, `puntos`, `due_date`, `grupos`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'Operaciones Fundamentales', NULL, 10, '2025-08-19 16:37:50', NULL, 1, '2025-08-16 16:37:50', '2025-08-16 16:37:50'),
(2, 'Expresiones Algebraicas', NULL, 10, '2025-08-22 16:37:50', NULL, 1, '2025-08-16 16:37:50', '2025-08-16 16:37:50'),
(3, 'Geometría Básica', NULL, 10, '2025-08-25 16:37:50', NULL, 1, '2025-08-16 16:37:50', '2025-08-16 16:37:50'),
(4, 'probando', NULL, 10, '2025-08-21 20:25:51', '[67]', 1, '2025-08-21 20:24:16', '2025-08-21 20:25:51'),
(5, 'dsa', NULL, 10, '2025-08-21 20:59:22', '[67]', 1, '2025-08-21 20:47:30', '2025-08-21 20:59:22');

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
(2, NULL, 72, 'Eliminado por admin', '2025-08-21 18:30:11');

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
(13, 73, 'grade', 'Calificación publicada', 'Tu entrega fue calificada con 8', '/alumno/actividades', '{\"entrega_id\":5,\"actividad_id\":4,\"calificacion\":8}', 1, '2025-08-21 19:07:32');

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
  `role` varchar(100) NOT NULL,
  `id_estudiante` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `usuario`, `contraseña`, `must_change`, `last_login_at`, `role`, `id_estudiante`, `created_at`) VALUES
(3, 'miguel', '$2b$10$JkGqmotlDUI4Kuutn3ywoesTpA3izIF6QjlJUygfyizNoO9xJpJye', 1, NULL, 'estudiante', 67, '2025-08-11 00:41:45'),
(6, 'jesica_admin', '$2b$10$C9FZlnOw4.vJfjxh5E/H8OZu0S7g7ZF.dRiCopqNfz/8Hta1ta9VW', 1, NULL, 'admin', NULL, '2025-08-11 04:00:37'),
(8, 'jessica.mqerk', '$2b$10$/.53BvJ4Vuh6E910koGzqOOHU7m5kvsR2x8q8gE.4iN7tEem93Une', 1, NULL, 'estudiante', 69, '2025-08-11 19:36:41'),
(10, 'kelvincienytec', '$2b$10$A.Y8E73jINN6a0AWHDEId.lxAy6F4HBSz83NZhEvchCwAgGXfa7Oa', 1, NULL, 'asesor', NULL, '2025-08-11 22:48:41'),
(20, 'juan8', '$2b$10$WY5sxiP7FVP5q6MxJHcsFeKo5P8Aah.9HvfqfWYkQF.ULEeBPewdC', 1, NULL, 'estudiante', 73, '2025-08-21 18:19:30');

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
  ADD KEY `idx_entregas_estudiante_estado` (`id_estudiante`,`estado`);

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
-- Indices de la tabla `feedback_tasks`
--
ALTER TABLE `feedback_tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_feedback_tasks_due_date` (`due_date`),
  ADD KEY `idx_feedback_tasks_activo` (`activo`);

--
-- Indices de la tabla `quizzes_intentos`
--
ALTER TABLE `quizzes_intentos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_quiz_estudiante_intento` (`id_quiz`,`id_estudiante`,`intent_number`),
  ADD KEY `idx_quiz_estudiante` (`id_quiz`,`id_estudiante`),
  ADD KEY `idx_estudiante` (`id_estudiante`);

--
-- Indices de la tabla `soft_deletes`
--
ALTER TABLE `soft_deletes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario` (`id_usuario`),
  ADD KEY `idx_estudiante` (`id_estudiante`);

--
-- Indices de la tabla `student_notifications`
--
ALTER TABLE `student_notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student_unread` (`student_id`,`is_read`),
  ADD KEY `idx_student_created` (`student_id`,`created_at`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `asesor_preregistros`
--
ALTER TABLE `asesor_preregistros`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `asesor_tests`
--
ALTER TABLE `asesor_tests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `asesor_tests_history`
--
ALTER TABLE `asesor_tests_history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `calendar_events`
--
ALTER TABLE `calendar_events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `comprobantes`
--
ALTER TABLE `comprobantes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `contratos`
--
ALTER TABLE `contratos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `feedback_submissions`
--
ALTER TABLE `feedback_submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `feedback_tasks`
--
ALTER TABLE `feedback_tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `quizzes_intentos`
--
ALTER TABLE `quizzes_intentos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `soft_deletes`
--
ALTER TABLE `soft_deletes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `student_notifications`
--
ALTER TABLE `student_notifications`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

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
-- Filtros para la tabla `quizzes_intentos`
--
ALTER TABLE `quizzes_intentos`
  ADD CONSTRAINT `fk_quiz_intento_estudiante` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_quiz_intento_quiz` FOREIGN KEY (`id_quiz`) REFERENCES `actividades` (`id`) ON DELETE CASCADE;

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
