-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 29-09-2025 a las 23:26:30
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

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `estudiantes`
--
ALTER TABLE `estudiantes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_estudiantes_folio_formateado` (`folio_formateado`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `estudiantes`
--
ALTER TABLE `estudiantes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
