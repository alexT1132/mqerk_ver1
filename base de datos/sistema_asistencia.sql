-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 12-01-2026 a las 19:42:08
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
-- Base de datos: `sistema_asistencia`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alumnos`
--

CREATE TABLE `alumnos` (
  `id` int(11) NOT NULL,
  `matricula` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `grado` varchar(50) DEFAULT NULL,
  `grupo` varchar(50) DEFAULT NULL,
  `carrera` varchar(100) DEFAULT NULL,
  `tutor_nombre` varchar(200) DEFAULT NULL,
  `tutor_telefono` varchar(20) DEFAULT NULL,
  `tutor_email` varchar(100) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `dias_semana` int(11) DEFAULT 3,
  `horas_semana` int(11) DEFAULT 6,
  `dias_asiste` varchar(100) DEFAULT NULL,
  `hora_entrada` time DEFAULT '09:00:00',
  `hora_salida` time DEFAULT '12:00:00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alumnos_padres`
--

CREATE TABLE `alumnos_padres` (
  `id` int(11) NOT NULL,
  `alumno_id` int(11) NOT NULL,
  `padre_id` int(11) NOT NULL,
  `relacion` enum('padre','madre','tutor','otro') DEFAULT 'tutor',
  `es_principal` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asignaciones_horario`
--

CREATE TABLE `asignaciones_horario` (
  `id` int(11) NOT NULL,
  `empleado_id` int(11) DEFAULT NULL,
  `alumno_id` int(11) DEFAULT NULL,
  `horario_id` int(11) DEFAULT NULL COMMENT 'ID del horario fijo (horarios)',
  `horario_flexible_id` int(11) DEFAULT NULL COMMENT 'ID del horario flexible',
  `tipo_asignacion` enum('permanente','temporal','eventual') DEFAULT 'permanente',
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL COMMENT 'NULL = indefinido (permanente)',
  `activo` tinyint(1) DEFAULT 1,
  `notas` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Disparadores `asignaciones_horario`
--
DELIMITER $$
CREATE TRIGGER `desactivar_asignaciones_vencidas` BEFORE INSERT ON `asignaciones_horario` FOR EACH ROW BEGIN
    -- Si tiene fecha_fin y ya pasó, no permitir que esté activa
    IF NEW.fecha_fin IS NOT NULL AND NEW.fecha_fin < CURDATE() THEN
        SET NEW.activo = FALSE;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asistencias`
--

CREATE TABLE `asistencias` (
  `id` int(11) NOT NULL,
  `empleado_id` int(11) NOT NULL,
  `fecha_entrada` datetime DEFAULT NULL,
  `fecha_salida` datetime DEFAULT NULL,
  `estatus` varchar(20) DEFAULT NULL,
  `estatus_salida` varchar(20) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asistencias_alumnos`
--

CREATE TABLE `asistencias_alumnos` (
  `id` int(11) NOT NULL,
  `alumno_id` int(11) NOT NULL,
  `fecha_entrada` datetime DEFAULT NULL,
  `fecha_salida` datetime DEFAULT NULL,
  `estatus` varchar(20) DEFAULT NULL,
  `estatus_salida` varchar(20) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auditoria_sesiones`
--

CREATE TABLE `auditoria_sesiones` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `fecha_inicio` datetime DEFAULT NULL,
  `fecha_intento` datetime DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `tipo_evento` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `avisos`
--

CREATE TABLE `avisos` (
  `id` int(11) NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `mensaje` text NOT NULL,
  `tipo` enum('general','empleado','alumno') NOT NULL DEFAULT 'general',
  `empleado_id` int(11) DEFAULT NULL,
  `alumno_id` int(11) DEFAULT NULL,
  `rfc` varchar(13) DEFAULT NULL,
  `matricula` varchar(20) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `prioridad` enum('baja','media','alta') DEFAULT 'media',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `avisos`
--

INSERT INTO `avisos` (`id`, `titulo`, `mensaje`, `tipo`, `empleado_id`, `alumno_id`, `rfc`, `matricula`, `activo`, `fecha_inicio`, `fecha_fin`, `prioridad`, `created_by`, `created_at`, `updated_at`) VALUES
(2, 'URGENTE', 'Un texto es un conjunto de frases ordenadas que tienen sentido y presentan coherencia y cohesión, permitiendo su correcta interpretación por parte del lector. Existen diferentes tipos de textos, que se pueden clasificar según su función comunicativa y estructura, como textos literarios, científicos, expositivos, entre otros. Además, todos los textos contienen m\n\nUn texto es un conjunto de frases ordenadas que tienen sentido y presentan coherencia y cohesión, permitiendo su correcta interpretación por parte del lector. Existen diferentes tipos de textos, que se pueden clasificar según su función comunicativa y estructura, como textos literarios, científicos, expositivos, entre otros. Además, todos los textos contienen m\n\nUn texto es un conjunto de frases ordenadas que tienen sentido y presentan coherencia y cohesión, permitiendo su correcta interpretación por parte del lector. Existen diferentes tipos de textos, que se pueden clasificar según su función comunicativa y estructura, como textos literarios, científicos, expositivos, entre otros. Además, todos los textos contienen m Un texto es un conjunto de frases ordenadas que tienen sentido y presentan coherencia y cohesión, permitiendo su correcta interpretación por parte del lector. Existen diferentes tipos de textos, que se pueden clasificar según su función comunicativa y estructura, como textos literarios, científicos, expositivos, entre otros. Además, todos los textos contienen m\n\n\nUn texto es un conjunto de frases ordenadas que tienen sentido y presentan coherencia y cohesión, permitiendo su correcta interpretación por parte del lector. Existen diferentes tipos de textos, que se pueden clasificar según su función comunicativa y estructura, como textos literarios, científicos, expositivos, entre otros. Además, todos los textos contienen m Un texto es un conjunto de frases ordenadas que tienen sentido y presentan coherencia y cohesión, permitiendo su correcta interpretación por parte del lector. Existen diferentes tipos de textos, que se pueden clasificar según su función comunicativa y estructura, como textos literarios, científicos, expositivos, entre otros. Además, todos los textos contienen m\n\n\nUn texto es un conjunto de frases ordenadas que tienen sentido y presentan coherencia y cohesión, permitiendo su correcta interpretación por parte del lector. Existen diferentes tipos de textos, que se pueden clasificar según su función comunicativa y estructura, como textos literarios, científicos, expositivos, entre otros. Además, todos los textos contienen m Un texto es un conjunto de frases ordenadas que tienen sentido y presentan coherencia y cohesión, permitiendo su correcta interpretación por parte del lector. Existen diferentes tipos de textos, que se pueden clasificar según su función comunicativa y estructura, como textos literarios, científicos, expositivos, entre otros. Además, todos los textos contienen m\n\nUn texto es un conjunto de frases ordenadas que tienen sentido y presentan coherencia y cohesión, permitiendo su correcta interpretación por parte del lector. Existen diferentes tipos de textos, que se pueden clasificar según su función comunicativa y estructura, como textos literarios, científicos, expositivos, entre otros. Además, todos los textos contienen m Un texto es un conjunto de frases ordenadas que tienen sentido y presentan coherencia y cohesión, permitiendo su correcta interpretación por parte del lector. Existen diferentes tipos de textos, que se pueden clasificar según su función comunicativa y estructura, como textos literarios, científicos, expositivos, entre otros. Además, todos los textos contienen m\n\nUn texto es un conjunto de frases ordenadas que tienen sentido y presentan coherencia y cohesión, permitiendo su correcta interpretación por parte del lector. Existen diferentes tipos de textos, que se pueden clasificar según su función comunicativa y estructura, como textos literarios, científicos, expositivos, entre otros. Además, todos los textos contienen m Un texto es un conjunto de frases ordenadas que tienen sentido y presentan coherencia y cohesión, permitiendo su correcta interpretación por parte del lector. Existen diferentes tipos de textos, que se pueden clasificar según su función comunicativa y estructura, como textos literarios, científicos, expositivos, entre otros. Además, todos los textos contienen m\n\n\n\nUn texto es un conjunto de frases ordenadas que tienen sentido y presentan coherencia y cohesión, permitiendo su correcta interpretación por parte del lector. Existen diferentes tipos de textos, que se pueden clasificar según su función comunicativa y estructura, como textos literarios, científicos, expositivos, entre otros. Además, todos los textos contienen m Un texto es un conjunto de frases ordenadas que tienen sentido y presentan coherencia y cohesión, permitiendo su correcta interpretación por parte del lector. Existen diferentes tipos de textos, que se pueden clasificar según su función comunicativa y estructura, como textos literarios, científicos, expositivos, entre otros. Además, todos los textos contienen m\n\nUn texto es un conjunto de frases ordenadas que tienen sentido y presentan coherencia y cohesión, permitiendo su correcta interpretación por parte del lector. Existen diferentes tipos de textos, que se pueden clasificar según su función comunicativa y estructura, como textos literarios, científicos, expositivos, entre otros. Además, todos los textos contienen m Un texto es un conjunto de frases ordenadas que tienen sentido y presentan coherencia y cohesión, permitiendo su correcta interpretación por parte del lector. Existen diferentes tipos de textos, que se pueden clasificar según su función comunicativa y estructura, como textos literarios, científicos, expositivos, entre otros. Además, todos los textos contienen m', 'general', NULL, NULL, NULL, NULL, 1, '2025-12-14', '2025-12-16', 'media', NULL, '2025-12-14 18:41:38', '2025-12-14 18:47:12');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `configuracion`
--

CREATE TABLE `configuracion` (
  `id` int(11) NOT NULL,
  `tolerancia_minutos` int(11) DEFAULT 10,
  `retardo_minutos` int(11) DEFAULT 15,
  `falta_automatica_minutos` int(11) DEFAULT 30,
  `calcular_tiempo_extra` tinyint(1) DEFAULT 1,
  `mostrar_nombre_empleado` tinyint(1) DEFAULT 1,
  `ultimo_cambio` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `modo_sistema` varchar(20) DEFAULT 'empresa',
  `nombre_institucion` varchar(200) DEFAULT 'Mi Institución',
  `logo_path` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `configuracion`
--

INSERT INTO `configuracion` (`id`, `tolerancia_minutos`, `retardo_minutos`, `falta_automatica_minutos`, `calcular_tiempo_extra`, `mostrar_nombre_empleado`, `ultimo_cambio`, `modo_sistema`, `nombre_institucion`, `logo_path`) VALUES
(1, 10, 15, 30, 1, 1, '2025-12-14 01:58:14', 'mixto', 'Mi Institución', 'img/logo.png');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `configuracion_whatsapp`
--

CREATE TABLE `configuracion_whatsapp` (
  `id` int(11) NOT NULL,
  `activo` tinyint(1) DEFAULT 0,
  `api_key` varchar(255) DEFAULT NULL,
  `api_url` varchar(500) DEFAULT NULL,
  `numero_remitente` varchar(20) DEFAULT NULL,
  `plantilla_entrada` text DEFAULT NULL,
  `plantilla_salida` text DEFAULT NULL,
  `plantilla_inasistencia` text DEFAULT NULL,
  `enviar_entrada` tinyint(1) DEFAULT 1,
  `enviar_salida` tinyint(1) DEFAULT 1,
  `enviar_inasistencia` tinyint(1) DEFAULT 1,
  `hora_marcado_inasistencia` time DEFAULT '18:00:00',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `configuracion_whatsapp`
--

INSERT INTO `configuracion_whatsapp` (`id`, `activo`, `api_key`, `api_url`, `numero_remitente`, `plantilla_entrada`, `plantilla_salida`, `plantilla_inasistencia`, `enviar_entrada`, `enviar_salida`, `enviar_inasistencia`, `hora_marcado_inasistencia`, `updated_at`) VALUES
(1, 0, NULL, NULL, NULL, '👋 *{{nombre}}* registró asistencia de ENTRADA\n📅 Fecha: {{fecha}}\n🕐 Hora: {{hora}}\n📍 {{institucion}}', '👋 *{{nombre}}* registró asistencia de SALIDA\n📅 Fecha: {{fecha}}\n🕐 Hora: {{hora}}\n⏱️ Tiempo trabajado: {{tiempo}}\n📍 {{institucion}}', '⚠️ *ALERTA DE INASISTENCIA*\n\n*{{nombre}}* no registró asistencia el día {{fecha}}\n\nPor favor, verifique la situación.\n📍 {{institucion}}', 1, 1, 1, '18:00:00', '2025-12-14 19:04:47');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contactos_notificaciones`
--

CREATE TABLE `contactos_notificaciones` (
  `id` int(11) NOT NULL,
  `empleado_id` int(11) DEFAULT NULL,
  `alumno_id` int(11) DEFAULT NULL,
  `nombre_contacto` varchar(200) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `relacion` varchar(50) DEFAULT 'tutor',
  `tipo_notificacion` enum('entrada','salida','inasistencia','todas') DEFAULT 'todas',
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `departamentos`
--

CREATE TABLE `departamentos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `departamentos`
--

INSERT INTO `departamentos` (`id`, `nombre`, `descripcion`, `activo`, `created_at`) VALUES
(1, 'General', 'Departamento general de la empresa', 1, '2025-12-13 23:44:42');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empleados`
--

CREATE TABLE `empleados` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `rfc` varchar(13) DEFAULT NULL,
  `curp` varchar(18) DEFAULT NULL,
  `departamento_id` int(11) DEFAULT NULL,
  `horario_id` int(11) DEFAULT NULL,
  `fecha_ingreso` date DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empresa`
--

CREATE TABLE `empresa` (
  `id` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `direccion` text DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `rfc` varchar(13) DEFAULT NULL,
  `color_primary` varchar(7) DEFAULT '#667eea',
  `color_secondary` varchar(7) DEFAULT '#764ba2',
  `color_accent` varchar(7) DEFAULT '#06b6d4',
  `logotipo` varchar(255) DEFAULT NULL,
  `configurado` tinyint(1) DEFAULT 0,
  `fecha_configuracion` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `empresa`
--

INSERT INTO `empresa` (`id`, `nombre`, `direccion`, `telefono`, `email`, `rfc`, `color_primary`, `color_secondary`, `color_accent`, `logotipo`, `configurado`, `fecha_configuracion`, `updated_at`) VALUES
(1, 'Mi Empresa', 'Calle Principal #123', '555-123-4567', 'contacto@miempresa.com', 'EMP123456ABC', '#667eea', '#764ba2', '#06b6d4', NULL, 0, NULL, '2025-12-13 23:44:42');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horarios`
--

CREATE TABLE `horarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `hora_entrada` time NOT NULL,
  `hora_salida` time NOT NULL,
  `tolerancia_minutos` int(11) DEFAULT 0,
  `dias_laborales` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dias_laborales`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horarios_flexibles`
--

CREATE TABLE `horarios_flexibles` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `tipo` enum('empleado','alumno') NOT NULL DEFAULT 'empleado',
  `descripcion` text DEFAULT NULL,
  `lunes_hora_entrada` time DEFAULT NULL,
  `lunes_hora_salida` time DEFAULT NULL,
  `lunes_activo` tinyint(1) DEFAULT 0,
  `martes_hora_entrada` time DEFAULT NULL,
  `martes_hora_salida` time DEFAULT NULL,
  `martes_activo` tinyint(1) DEFAULT 0,
  `miercoles_hora_entrada` time DEFAULT NULL,
  `miercoles_hora_salida` time DEFAULT NULL,
  `miercoles_activo` tinyint(1) DEFAULT 0,
  `jueves_hora_entrada` time DEFAULT NULL,
  `jueves_hora_salida` time DEFAULT NULL,
  `jueves_activo` tinyint(1) DEFAULT 0,
  `viernes_hora_entrada` time DEFAULT NULL,
  `viernes_hora_salida` time DEFAULT NULL,
  `viernes_activo` tinyint(1) DEFAULT 0,
  `sabado_hora_entrada` time DEFAULT NULL,
  `sabado_hora_salida` time DEFAULT NULL,
  `sabado_activo` tinyint(1) DEFAULT 0,
  `domingo_hora_entrada` time DEFAULT NULL,
  `domingo_hora_salida` time DEFAULT NULL,
  `domingo_activo` tinyint(1) DEFAULT 0,
  `tolerancia_minutos` int(11) DEFAULT 10,
  `horas_semana` decimal(5,2) DEFAULT NULL COMMENT 'Total de horas por semana',
  `dias_semana` int(11) DEFAULT NULL COMMENT 'Número de días por semana',
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `horarios_flexibles`
--

INSERT INTO `horarios_flexibles` (`id`, `nombre`, `tipo`, `descripcion`, `lunes_hora_entrada`, `lunes_hora_salida`, `lunes_activo`, `martes_hora_entrada`, `martes_hora_salida`, `martes_activo`, `miercoles_hora_entrada`, `miercoles_hora_salida`, `miercoles_activo`, `jueves_hora_entrada`, `jueves_hora_salida`, `jueves_activo`, `viernes_hora_entrada`, `viernes_hora_salida`, `viernes_activo`, `sabado_hora_entrada`, `sabado_hora_salida`, `sabado_activo`, `domingo_hora_entrada`, `domingo_hora_salida`, `domingo_activo`, `tolerancia_minutos`, `horas_semana`, `dias_semana`, `activo`, `created_at`, `created_by`, `updated_at`) VALUES
(1, 'Horario Tienda Completo', 'empleado', 'Horario completo de tienda: L-V 9-6, Sábado 10-2', '09:00:00', '18:00:00', 1, '09:00:00', '18:00:00', 1, '09:00:00', '18:00:00', 1, '09:00:00', '18:00:00', 1, '09:00:00', '18:00:00', 1, '10:00:00', '14:00:00', 1, NULL, NULL, 0, 10, 49.00, 6, 1, '2025-12-15 00:25:02', NULL, '2025-12-15 00:25:02'),
(2, 'Academia 3 Días - Tarde', 'alumno', 'Academia 3 días a la semana, 2 horas cada día', '16:00:00', '18:00:00', 1, NULL, NULL, 0, '16:00:00', '18:00:00', 1, NULL, NULL, 0, '16:00:00', '18:00:00', 1, NULL, NULL, 0, NULL, NULL, 0, 10, 6.00, 3, 1, '2025-12-15 00:25:02', NULL, '2025-12-15 00:25:02'),
(3, 'Horario Escuela - 3 Períodos', 'empleado', 'Horario con 3 períodos: Mañana (8-12), Tarde 1 (1-3), Tarde 2 (4-6)', NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 0, 10, 0.00, 0, 1, '2025-12-15 00:25:02', NULL, '2025-12-15 00:25:02');

--
-- Disparadores `horarios_flexibles`
--
DELIMITER $$
CREATE TRIGGER `calcular_horarios_semana_insert` BEFORE INSERT ON `horarios_flexibles` FOR EACH ROW BEGIN
    DECLARE total_horas DECIMAL(5,2) DEFAULT 0;
    DECLARE total_dias INT DEFAULT 0;
    
    -- Calcular horas totales y días activos
    IF NEW.lunes_activo = TRUE AND NEW.lunes_hora_entrada IS NOT NULL AND NEW.lunes_hora_salida IS NOT NULL THEN
        SET total_horas = total_horas + TIMESTAMPDIFF(HOUR, NEW.lunes_hora_entrada, NEW.lunes_hora_salida);
        SET total_dias = total_dias + 1;
    END IF;
    
    IF NEW.martes_activo = TRUE AND NEW.martes_hora_entrada IS NOT NULL AND NEW.martes_hora_salida IS NOT NULL THEN
        SET total_horas = total_horas + TIMESTAMPDIFF(HOUR, NEW.martes_hora_entrada, NEW.martes_hora_salida);
        SET total_dias = total_dias + 1;
    END IF;
    
    IF NEW.miercoles_activo = TRUE AND NEW.miercoles_hora_entrada IS NOT NULL AND NEW.miercoles_hora_salida IS NOT NULL THEN
        SET total_horas = total_horas + TIMESTAMPDIFF(HOUR, NEW.miercoles_hora_entrada, NEW.miercoles_hora_salida);
        SET total_dias = total_dias + 1;
    END IF;
    
    IF NEW.jueves_activo = TRUE AND NEW.jueves_hora_entrada IS NOT NULL AND NEW.jueves_hora_salida IS NOT NULL THEN
        SET total_horas = total_horas + TIMESTAMPDIFF(HOUR, NEW.jueves_hora_entrada, NEW.jueves_hora_salida);
        SET total_dias = total_dias + 1;
    END IF;
    
    IF NEW.viernes_activo = TRUE AND NEW.viernes_hora_entrada IS NOT NULL AND NEW.viernes_hora_salida IS NOT NULL THEN
        SET total_horas = total_horas + TIMESTAMPDIFF(HOUR, NEW.viernes_hora_entrada, NEW.viernes_hora_salida);
        SET total_dias = total_dias + 1;
    END IF;
    
    IF NEW.sabado_activo = TRUE AND NEW.sabado_hora_entrada IS NOT NULL AND NEW.sabado_hora_salida IS NOT NULL THEN
        SET total_horas = total_horas + TIMESTAMPDIFF(HOUR, NEW.sabado_hora_entrada, NEW.sabado_hora_salida);
        SET total_dias = total_dias + 1;
    END IF;
    
    IF NEW.domingo_activo = TRUE AND NEW.domingo_hora_entrada IS NOT NULL AND NEW.domingo_hora_salida IS NOT NULL THEN
        SET total_horas = total_horas + TIMESTAMPDIFF(HOUR, NEW.domingo_hora_entrada, NEW.domingo_hora_salida);
        SET total_dias = total_dias + 1;
    END IF;
    
    -- Actualizar campos
    SET NEW.horas_semana = total_horas;
    SET NEW.dias_semana = total_dias;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `calcular_horarios_semana_update` BEFORE UPDATE ON `horarios_flexibles` FOR EACH ROW BEGIN
    DECLARE total_horas DECIMAL(5,2) DEFAULT 0;
    DECLARE total_dias INT DEFAULT 0;
    
    -- Mismo cálculo que en INSERT
    IF NEW.lunes_activo = TRUE AND NEW.lunes_hora_entrada IS NOT NULL AND NEW.lunes_hora_salida IS NOT NULL THEN
        SET total_horas = total_horas + TIMESTAMPDIFF(HOUR, NEW.lunes_hora_entrada, NEW.lunes_hora_salida);
        SET total_dias = total_dias + 1;
    END IF;
    
    IF NEW.martes_activo = TRUE AND NEW.martes_hora_entrada IS NOT NULL AND NEW.martes_hora_salida IS NOT NULL THEN
        SET total_horas = total_horas + TIMESTAMPDIFF(HOUR, NEW.martes_hora_entrada, NEW.martes_hora_salida);
        SET total_dias = total_dias + 1;
    END IF;
    
    IF NEW.miercoles_activo = TRUE AND NEW.miercoles_hora_entrada IS NOT NULL AND NEW.miercoles_hora_salida IS NOT NULL THEN
        SET total_horas = total_horas + TIMESTAMPDIFF(HOUR, NEW.miercoles_hora_entrada, NEW.miercoles_hora_salida);
        SET total_dias = total_dias + 1;
    END IF;
    
    IF NEW.jueves_activo = TRUE AND NEW.jueves_hora_entrada IS NOT NULL AND NEW.jueves_hora_salida IS NOT NULL THEN
        SET total_horas = total_horas + TIMESTAMPDIFF(HOUR, NEW.jueves_hora_entrada, NEW.jueves_hora_salida);
        SET total_dias = total_dias + 1;
    END IF;
    
    IF NEW.viernes_activo = TRUE AND NEW.viernes_hora_entrada IS NOT NULL AND NEW.viernes_hora_salida IS NOT NULL THEN
        SET total_horas = total_horas + TIMESTAMPDIFF(HOUR, NEW.viernes_hora_entrada, NEW.viernes_hora_salida);
        SET total_dias = total_dias + 1;
    END IF;
    
    IF NEW.sabado_activo = TRUE AND NEW.sabado_hora_entrada IS NOT NULL AND NEW.sabado_hora_salida IS NOT NULL THEN
        SET total_horas = total_horas + TIMESTAMPDIFF(HOUR, NEW.sabado_hora_entrada, NEW.sabado_hora_salida);
        SET total_dias = total_dias + 1;
    END IF;
    
    IF NEW.domingo_activo = TRUE AND NEW.domingo_hora_entrada IS NOT NULL AND NEW.domingo_hora_salida IS NOT NULL THEN
        SET total_horas = total_horas + TIMESTAMPDIFF(HOUR, NEW.domingo_hora_entrada, NEW.domingo_hora_salida);
        SET total_dias = total_dias + 1;
    END IF;
    
    SET NEW.horas_semana = total_horas;
    SET NEW.dias_semana = total_dias;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horarios_periodos`
--

CREATE TABLE `horarios_periodos` (
  `id` int(11) NOT NULL,
  `horario_flexible_id` int(11) NOT NULL,
  `dia_semana` enum('lunes','martes','miercoles','jueves','viernes','sabado','domingo') NOT NULL,
  `periodo_numero` int(11) NOT NULL COMMENT 'Número de período del día (1, 2, 3, etc.)',
  `hora_entrada` time NOT NULL,
  `hora_salida` time NOT NULL,
  `descripcion` varchar(100) DEFAULT NULL COMMENT 'Ej: "Turno Mañana", "Hora de Comida", etc.',
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `horarios_periodos`
--

INSERT INTO `horarios_periodos` (`id`, `horario_flexible_id`, `dia_semana`, `periodo_numero`, `hora_entrada`, `hora_salida`, `descripcion`, `activo`, `created_at`) VALUES
(1, 3, 'lunes', 1, '08:00:00', '12:00:00', 'Turno Mañana', 1, '2025-12-15 00:25:03'),
(2, 3, 'lunes', 2, '13:00:00', '15:00:00', 'Turno Tarde 1', 1, '2025-12-15 00:25:03'),
(3, 3, 'lunes', 3, '16:00:00', '18:00:00', 'Turno Tarde 2', 1, '2025-12-15 00:25:03');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `incidencias`
--

CREATE TABLE `incidencias` (
  `id` int(11) NOT NULL,
  `tipo` enum('vacacion','permiso','falta_justificada','incapacidad','otro') NOT NULL,
  `empleado_id` int(11) DEFAULT NULL,
  `alumno_id` int(11) DEFAULT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `motivo` text DEFAULT NULL,
  `justificacion` text DEFAULT NULL,
  `estado` enum('pendiente','aprobada','rechazada') DEFAULT 'pendiente',
  `aprobado_por` int(11) DEFAULT NULL,
  `fecha_aprobacion` datetime DEFAULT NULL,
  `comentarios_aprobador` text DEFAULT NULL,
  `dias_calendario` int(11) DEFAULT NULL,
  `dias_laborables` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `log_notificaciones_whatsapp`
--

CREATE TABLE `log_notificaciones_whatsapp` (
  `id` int(11) NOT NULL,
  `tipo` enum('entrada','salida','inasistencia','otro') NOT NULL,
  `empleado_id` int(11) DEFAULT NULL,
  `alumno_id` int(11) DEFAULT NULL,
  `telefono_destino` varchar(20) NOT NULL,
  `mensaje` text DEFAULT NULL,
  `estado` enum('enviado','fallido','pendiente') DEFAULT 'pendiente',
  `respuesta_api` text DEFAULT NULL,
  `fecha_envio` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

CREATE TABLE `notificaciones` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `mensaje` text NOT NULL,
  `tipo` varchar(50) DEFAULT 'sistema',
  `leida` tinyint(1) DEFAULT 0,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `padres_tutores`
--

CREATE TABLE `padres_tutores` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_admin`
--

CREATE TABLE `usuarios_admin` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `role` varchar(20) DEFAULT 'admin',
  `activo` tinyint(1) DEFAULT 1,
  `intentos_fallidos` int(11) DEFAULT 0,
  `fecha_bloqueo` datetime DEFAULT NULL,
  `ultimo_inicio_sesion` datetime DEFAULT NULL,
  `ip_ultimo_inicio` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios_admin`
--

INSERT INTO `usuarios_admin` (`id`, `username`, `password`, `nombre`, `apellido`, `email`, `role`, `activo`, `intentos_fallidos`, `fecha_bloqueo`, `ultimo_inicio_sesion`, `ip_ultimo_inicio`, `created_at`, `updated_at`) VALUES
(1, 'admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Administrador', 'Sistema', 'admin@sistema.com', 'admin', 1, 0, NULL, NULL, NULL, '2025-12-13 23:44:42', '2025-12-13 23:44:42');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_horarios_activos_hoy`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_horarios_activos_hoy` (
`asignacion_id` int(11)
,`empleado_id` int(11)
,`alumno_id` int(11)
,`tipo_asignacion` enum('permanente','temporal','eventual')
,`hora_entrada_hoy` time
,`hora_salida_hoy` time
,`tiene_horario_hoy` tinyint(4)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_horarios_periodos_hoy`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_horarios_periodos_hoy` (
`asignacion_id` int(11)
,`empleado_id` int(11)
,`alumno_id` int(11)
,`tipo_asignacion` enum('permanente','temporal','eventual')
,`dia_semana` enum('lunes','martes','miercoles','jueves','viernes','sabado','domingo')
,`periodo_numero` int(11)
,`hora_entrada` time
,`hora_salida` time
,`descripcion` varchar(100)
,`dia_hoy` varchar(9)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `v_horarios_activos_hoy`
--
DROP TABLE IF EXISTS `v_horarios_activos_hoy`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_horarios_activos_hoy`  AS SELECT `a`.`id` AS `asignacion_id`, `a`.`empleado_id` AS `empleado_id`, `a`.`alumno_id` AS `alumno_id`, `a`.`tipo_asignacion` AS `tipo_asignacion`, CASE WHEN dayname(curdate()) = 'Monday' THEN `hf`.`lunes_hora_entrada` WHEN dayname(curdate()) = 'Tuesday' THEN `hf`.`martes_hora_entrada` WHEN dayname(curdate()) = 'Wednesday' THEN `hf`.`miercoles_hora_entrada` WHEN dayname(curdate()) = 'Thursday' THEN `hf`.`jueves_hora_entrada` WHEN dayname(curdate()) = 'Friday' THEN `hf`.`viernes_hora_entrada` WHEN dayname(curdate()) = 'Saturday' THEN `hf`.`sabado_hora_entrada` WHEN dayname(curdate()) = 'Sunday' THEN `hf`.`domingo_hora_entrada` END AS `hora_entrada_hoy`, CASE WHEN dayname(curdate()) = 'Monday' THEN `hf`.`lunes_hora_salida` WHEN dayname(curdate()) = 'Tuesday' THEN `hf`.`martes_hora_salida` WHEN dayname(curdate()) = 'Wednesday' THEN `hf`.`miercoles_hora_salida` WHEN dayname(curdate()) = 'Thursday' THEN `hf`.`jueves_hora_salida` WHEN dayname(curdate()) = 'Friday' THEN `hf`.`viernes_hora_salida` WHEN dayname(curdate()) = 'Saturday' THEN `hf`.`sabado_hora_salida` WHEN dayname(curdate()) = 'Sunday' THEN `hf`.`domingo_hora_salida` END AS `hora_salida_hoy`, CASE WHEN dayname(curdate()) = 'Monday' THEN `hf`.`lunes_activo` WHEN dayname(curdate()) = 'Tuesday' THEN `hf`.`martes_activo` WHEN dayname(curdate()) = 'Wednesday' THEN `hf`.`miercoles_activo` WHEN dayname(curdate()) = 'Thursday' THEN `hf`.`jueves_activo` WHEN dayname(curdate()) = 'Friday' THEN `hf`.`viernes_activo` WHEN dayname(curdate()) = 'Saturday' THEN `hf`.`sabado_activo` WHEN dayname(curdate()) = 'Sunday' THEN `hf`.`domingo_activo` END AS `tiene_horario_hoy` FROM (`asignaciones_horario` `a` left join `horarios_flexibles` `hf` on(`a`.`horario_flexible_id` = `hf`.`id`)) WHERE `a`.`activo` = 1 AND (`a`.`fecha_fin` is null OR `a`.`fecha_fin` >= curdate()) AND `a`.`fecha_inicio` <= curdate() ;

-- --------------------------------------------------------

--
-- Estructura para la vista `v_horarios_periodos_hoy`
--
DROP TABLE IF EXISTS `v_horarios_periodos_hoy`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_horarios_periodos_hoy`  AS SELECT `a`.`id` AS `asignacion_id`, `a`.`empleado_id` AS `empleado_id`, `a`.`alumno_id` AS `alumno_id`, `a`.`tipo_asignacion` AS `tipo_asignacion`, `hp`.`dia_semana` AS `dia_semana`, `hp`.`periodo_numero` AS `periodo_numero`, `hp`.`hora_entrada` AS `hora_entrada`, `hp`.`hora_salida` AS `hora_salida`, `hp`.`descripcion` AS `descripcion`, CASE END FROM ((`asignaciones_horario` `a` join `horarios_flexibles` `hf` on(`a`.`horario_flexible_id` = `hf`.`id`)) join `horarios_periodos` `hp` on(`hf`.`id` = `hp`.`horario_flexible_id`)) WHERE `a`.`activo` = 1 AND (`a`.`fecha_fin` is null OR `a`.`fecha_fin` >= curdate()) AND `a`.`fecha_inicio` <= curdate() AND `hp`.`activo` = 1 AND `hp`.`dia_semana` = ORDER BY `hp`.`periodo_numero` ASC ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `alumnos`
--
ALTER TABLE `alumnos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `matricula` (`matricula`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_matricula` (`matricula`),
  ADD KEY `idx_nombre` (`nombre`,`apellidos`),
  ADD KEY `idx_grado` (`grado`),
  ADD KEY `idx_grupo` (`grupo`),
  ADD KEY `idx_activo` (`activo`);

--
-- Indices de la tabla `alumnos_padres`
--
ALTER TABLE `alumnos_padres`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_alumno_padre` (`alumno_id`,`padre_id`),
  ADD KEY `idx_alumno` (`alumno_id`),
  ADD KEY `idx_padre` (`padre_id`);

--
-- Indices de la tabla `asignaciones_horario`
--
ALTER TABLE `asignaciones_horario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `horario_id` (`horario_id`),
  ADD KEY `horario_flexible_id` (`horario_flexible_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_empleado` (`empleado_id`,`activo`,`fecha_inicio`,`fecha_fin`),
  ADD KEY `idx_alumno` (`alumno_id`,`activo`,`fecha_inicio`,`fecha_fin`),
  ADD KEY `idx_fechas` (`fecha_inicio`,`fecha_fin`),
  ADD KEY `idx_activo` (`activo`);

--
-- Indices de la tabla `asistencias`
--
ALTER TABLE `asistencias`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_empleado` (`empleado_id`),
  ADD KEY `idx_fecha_entrada` (`fecha_entrada`),
  ADD KEY `idx_fecha_salida` (`fecha_salida`),
  ADD KEY `idx_estatus` (`estatus`);

--
-- Indices de la tabla `asistencias_alumnos`
--
ALTER TABLE `asistencias_alumnos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_alumno` (`alumno_id`),
  ADD KEY `idx_fecha_entrada` (`fecha_entrada`),
  ADD KEY `idx_fecha_salida` (`fecha_salida`),
  ADD KEY `idx_estatus` (`estatus`);

--
-- Indices de la tabla `auditoria_sesiones`
--
ALTER TABLE `auditoria_sesiones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario` (`usuario_id`),
  ADD KEY `idx_tipo_evento` (`tipo_evento`),
  ADD KEY `idx_fecha` (`created_at`);

--
-- Indices de la tabla `avisos`
--
ALTER TABLE `avisos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_tipo` (`tipo`),
  ADD KEY `idx_empleado` (`empleado_id`),
  ADD KEY `idx_alumno` (`alumno_id`),
  ADD KEY `idx_rfc` (`rfc`),
  ADD KEY `idx_matricula` (`matricula`),
  ADD KEY `idx_activo` (`activo`),
  ADD KEY `idx_fecha_inicio` (`fecha_inicio`),
  ADD KEY `idx_fecha_fin` (`fecha_fin`),
  ADD KEY `idx_prioridad` (`prioridad`);

--
-- Indices de la tabla `configuracion`
--
ALTER TABLE `configuracion`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `configuracion_whatsapp`
--
ALTER TABLE `configuracion_whatsapp`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `contactos_notificaciones`
--
ALTER TABLE `contactos_notificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_empleado` (`empleado_id`),
  ADD KEY `idx_alumno` (`alumno_id`),
  ADD KEY `idx_telefono` (`telefono`),
  ADD KEY `idx_activo` (`activo`);

--
-- Indices de la tabla `departamentos`
--
ALTER TABLE `departamentos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_nombre` (`nombre`),
  ADD KEY `idx_activo` (`activo`);

--
-- Indices de la tabla `empleados`
--
ALTER TABLE `empleados`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `rfc` (`rfc`),
  ADD UNIQUE KEY `curp` (`curp`),
  ADD KEY `horario_id` (`horario_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_nombre` (`nombre`,`apellidos`),
  ADD KEY `idx_rfc` (`rfc`),
  ADD KEY `idx_curp` (`curp`),
  ADD KEY `idx_activo` (`activo`),
  ADD KEY `idx_departamento` (`departamento_id`);

--
-- Indices de la tabla `empresa`
--
ALTER TABLE `empresa`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `horarios`
--
ALTER TABLE `horarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_nombre` (`nombre`);

--
-- Indices de la tabla `horarios_flexibles`
--
ALTER TABLE `horarios_flexibles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_nombre` (`nombre`),
  ADD KEY `idx_tipo` (`tipo`),
  ADD KEY `idx_activo` (`activo`);

--
-- Indices de la tabla `horarios_periodos`
--
ALTER TABLE `horarios_periodos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_periodo` (`horario_flexible_id`,`dia_semana`,`periodo_numero`),
  ADD KEY `idx_horario_dia` (`horario_flexible_id`,`dia_semana`),
  ADD KEY `idx_activo` (`activo`);

--
-- Indices de la tabla `incidencias`
--
ALTER TABLE `incidencias`
  ADD PRIMARY KEY (`id`),
  ADD KEY `aprobado_por` (`aprobado_por`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_tipo` (`tipo`),
  ADD KEY `idx_empleado` (`empleado_id`),
  ADD KEY `idx_alumno` (`alumno_id`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_fecha_inicio` (`fecha_inicio`),
  ADD KEY `idx_fecha_fin` (`fecha_fin`),
  ADD KEY `idx_fechas` (`fecha_inicio`,`fecha_fin`);

--
-- Indices de la tabla `log_notificaciones_whatsapp`
--
ALTER TABLE `log_notificaciones_whatsapp`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tipo` (`tipo`),
  ADD KEY `idx_empleado` (`empleado_id`),
  ADD KEY `idx_alumno` (`alumno_id`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_fecha_envio` (`fecha_envio`);

--
-- Indices de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario` (`usuario_id`),
  ADD KEY `idx_leida` (`leida`),
  ADD KEY `idx_fecha` (`fecha`);

--
-- Indices de la tabla `padres_tutores`
--
ALTER TABLE `padres_tutores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_activo` (`activo`);

--
-- Indices de la tabla `usuarios_admin`
--
ALTER TABLE `usuarios_admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_activo` (`activo`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `alumnos`
--
ALTER TABLE `alumnos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `alumnos_padres`
--
ALTER TABLE `alumnos_padres`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `asignaciones_horario`
--
ALTER TABLE `asignaciones_horario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `asistencias`
--
ALTER TABLE `asistencias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `asistencias_alumnos`
--
ALTER TABLE `asistencias_alumnos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `auditoria_sesiones`
--
ALTER TABLE `auditoria_sesiones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `avisos`
--
ALTER TABLE `avisos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `configuracion`
--
ALTER TABLE `configuracion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `configuracion_whatsapp`
--
ALTER TABLE `configuracion_whatsapp`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `contactos_notificaciones`
--
ALTER TABLE `contactos_notificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `departamentos`
--
ALTER TABLE `departamentos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `empleados`
--
ALTER TABLE `empleados`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `empresa`
--
ALTER TABLE `empresa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `horarios`
--
ALTER TABLE `horarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `horarios_flexibles`
--
ALTER TABLE `horarios_flexibles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `horarios_periodos`
--
ALTER TABLE `horarios_periodos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `incidencias`
--
ALTER TABLE `incidencias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `log_notificaciones_whatsapp`
--
ALTER TABLE `log_notificaciones_whatsapp`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `padres_tutores`
--
ALTER TABLE `padres_tutores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios_admin`
--
ALTER TABLE `usuarios_admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `alumnos`
--
ALTER TABLE `alumnos`
  ADD CONSTRAINT `alumnos_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `usuarios_admin` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `alumnos_padres`
--
ALTER TABLE `alumnos_padres`
  ADD CONSTRAINT `alumnos_padres_ibfk_1` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `alumnos_padres_ibfk_2` FOREIGN KEY (`padre_id`) REFERENCES `padres_tutores` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `asignaciones_horario`
--
ALTER TABLE `asignaciones_horario`
  ADD CONSTRAINT `asignaciones_horario_ibfk_1` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `asignaciones_horario_ibfk_2` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `asignaciones_horario_ibfk_3` FOREIGN KEY (`horario_id`) REFERENCES `horarios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `asignaciones_horario_ibfk_4` FOREIGN KEY (`horario_flexible_id`) REFERENCES `horarios_flexibles` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `asignaciones_horario_ibfk_5` FOREIGN KEY (`created_by`) REFERENCES `usuarios_admin` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `asistencias`
--
ALTER TABLE `asistencias`
  ADD CONSTRAINT `asistencias_ibfk_1` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `asistencias_alumnos`
--
ALTER TABLE `asistencias_alumnos`
  ADD CONSTRAINT `asistencias_alumnos_ibfk_1` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `auditoria_sesiones`
--
ALTER TABLE `auditoria_sesiones`
  ADD CONSTRAINT `auditoria_sesiones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios_admin` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `avisos`
--
ALTER TABLE `avisos`
  ADD CONSTRAINT `avisos_ibfk_1` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `avisos_ibfk_2` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `avisos_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `usuarios_admin` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `contactos_notificaciones`
--
ALTER TABLE `contactos_notificaciones`
  ADD CONSTRAINT `contactos_notificaciones_ibfk_1` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `contactos_notificaciones_ibfk_2` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `empleados`
--
ALTER TABLE `empleados`
  ADD CONSTRAINT `empleados_ibfk_1` FOREIGN KEY (`departamento_id`) REFERENCES `departamentos` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `empleados_ibfk_2` FOREIGN KEY (`horario_id`) REFERENCES `horarios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `empleados_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `usuarios_admin` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `horarios`
--
ALTER TABLE `horarios`
  ADD CONSTRAINT `horarios_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `usuarios_admin` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `horarios_flexibles`
--
ALTER TABLE `horarios_flexibles`
  ADD CONSTRAINT `horarios_flexibles_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `usuarios_admin` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `horarios_periodos`
--
ALTER TABLE `horarios_periodos`
  ADD CONSTRAINT `horarios_periodos_ibfk_1` FOREIGN KEY (`horario_flexible_id`) REFERENCES `horarios_flexibles` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `incidencias`
--
ALTER TABLE `incidencias`
  ADD CONSTRAINT `incidencias_ibfk_1` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `incidencias_ibfk_2` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `incidencias_ibfk_3` FOREIGN KEY (`aprobado_por`) REFERENCES `usuarios_admin` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `incidencias_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `usuarios_admin` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `log_notificaciones_whatsapp`
--
ALTER TABLE `log_notificaciones_whatsapp`
  ADD CONSTRAINT `log_notificaciones_whatsapp_ibfk_1` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `log_notificaciones_whatsapp_ibfk_2` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios_admin` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
