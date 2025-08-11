-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 11-08-2025 a las 21:57:43
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
-- Estructura de tabla para la tabla `admin_config`
--

CREATE TABLE `admin_config` (
  `id` int(11) NOT NULL DEFAULT 1,
  `sesion_maxima` int(11) DEFAULT 480,
  `intentos_login` int(11) DEFAULT 3,
  `cambio_password_obligatorio` int(11) DEFAULT 90,
  `autenticacion_dos_factor` tinyint(1) DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `admin_config`
--

INSERT INTO `admin_config` (`id`, `sesion_maxima`, `intentos_login`, `cambio_password_obligatorio`, `autenticacion_dos_factor`, `updated_at`) VALUES
(1, 480, 5, 90, 0, '2025-08-11 04:32:35');

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

INSERT INTO `comprobantes` (`id`, `id_estudiante`, `comprobante`, `importe`, `metodo`, `created_at`) VALUES
(9, 67, '/comprobantes/1754873043799-comprobante-pago-MQ-20250729-0001.pdf', 1500.00, 'efectivo', '2025-08-11 12:00:09'),
(10, 68, '/comprobantes/1754934365768-file_00000000c000624689779e0f1a3a6b7e.png', NULL, NULL, '2025-08-11 11:46:05'),
(11, 69, '/comprobantes/1754941053364-518323640_2494738954216624_926389333829993898_n.jpg', 1200.00, 'efectivo', '2025-08-11 13:50:53');

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
  `comentario1` text DEFAULT NULL,
  `comentario2` text DEFAULT NULL,
  `curso` varchar(200) NOT NULL,
  `plan` varchar(100) NOT NULL,
  `anio` int(11) NOT NULL,
  `folio` int(11) NOT NULL,
  `verificacion` int(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estudiantes`
--

INSERT INTO `estudiantes` (`id`, `nombre`, `apellidos`, `email`, `foto`, `grupo`, `comunidad1`, `comunidad2`, `telefono`, `fecha_nacimiento`, `nombre_tutor`, `tel_tutor`, `academico1`, `academico2`, `semestre`, `alergia`, `alergia2`, `discapacidad1`, `discapacidad2`, `orientacion`, `universidades1`, `universidades2`, `postulacion`, `comentario1`, `comentario2`, `curso`, `plan`, `anio`, `folio`, `verificacion`, `created_at`) VALUES
(67, 'Miguel', 'Angel', 'isc20350265@gmail.com', '/public/1754872897875-WhatsApp Image 2025-08-10 at 2.33.38 PM.jpeg', 'V1', 'SAN JUAN BAUTISTA TUXTEPEC', '', '281975587', '2000-11-01', 'Rosa Isela', '2811975587', 'CBTis', '', 'Concluido', 'No', '', 'No', '', 'No', 'NAVAL,TECNM', '', 'ISC', 'xxx', 'xxx', 'EEAU', 'Mensual', 25, 1, 2, '2025-08-11 00:41:37'),
(68, 'Kelvin Valentin', 'Gómez Ramírez', 'kegora1998@gmail.com', '/public/1754934311973-ChatGPT Image 10 ago 2025, 18_11_50.png', 'V1', 'SAN JUAN BAUTISTA TUXTEPEC', '', '2871811231', NULL, 'Valentin Gómez Salazar', '2878752825', 'CBTis', '', '5° semestre', 'Si', 'Antiiflamatorios', 'No', '', 'No', 'NAVAL,UDG,IPN', '', 'Química', 'ÉXITO', 'EXCELENTE', 'EEAU', 'Start', 25, 2, 1, '2025-08-11 17:45:12'),
(69, 'Jessica', 'Fernandez', 'ige19350409@gmail.com', '/public/1754940987329-518323640_2494738954216624_926389333829993898_n.jpg', 'V1', 'SAN JUAN BAUTISTA TUXTEPEC', '', '2878819370', NULL, 'kelvin', '2874581265', 'CBTis', '', 'Concluido', 'No', '', 'No', '', 'No', 'TECNM', '', 'ige', '...', '...', 'EEAU', 'Start', 25, 3, 2, '2025-08-11 19:36:27');

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
(1, 67, 'intermedio', '[\"programacion\",\"tecnologico\"]', '2025-08-11 00:46:28', '2025-08-11 00:49:46');

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `usuario` varchar(100) NOT NULL,
  `contraseña` varchar(255) NOT NULL,
  `role` varchar(100) NOT NULL,
  `id_estudiante` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `usuario`, `contraseña`, `role`, `id_estudiante`, `created_at`) VALUES
(3, 'miguel', '$2b$10$JkGqmotlDUI4Kuutn3ywoesTpA3izIF6QjlJUygfyizNoO9xJpJye', 'estudiante', 67, '2025-08-11 00:41:45'),
(6, 'jesica_admin', '$2b$10$C9FZlnOw4.vJfjxh5E/H8OZu0S7g7ZF.dRiCopqNfz/8Hta1ta9VW', 'admin', NULL, '2025-08-11 04:00:37'),
(7, 'kelvin98', '$2b$10$GtbeAhB7YZuBGk613WRkJOEURhm/Zyt8BmvJ/EhEk962xt5KnYyzq', 'estudiante', 68, '2025-08-11 17:45:20'),
(8, 'jessica.mqerk', '$2b$10$/.53BvJ4Vuh6E910koGzqOOHU7m5kvsR2x8q8gE.4iN7tEem93Une', 'estudiante', 69, '2025-08-11 19:36:41');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `admin_config`
--
ALTER TABLE `admin_config`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `admin_profiles`
--
ALTER TABLE `admin_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_admin_email` (`email`),
  ADD KEY `idx_admin_user_id` (`user_id`);

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
-- Indices de la tabla `estudiantes`
--
ALTER TABLE `estudiantes`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `estudiantes_config`
--
ALTER TABLE `estudiantes_config`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_estudiante` (`id_estudiante`);

--
-- Indices de la tabla `soft_deletes`
--
ALTER TABLE `soft_deletes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario` (`id_usuario`),
  ADD KEY `idx_estudiante` (`id_estudiante`);

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
-- AUTO_INCREMENT de la tabla `admin_profiles`
--
ALTER TABLE `admin_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `calendar_events`
--
ALTER TABLE `calendar_events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `comprobantes`
--
ALTER TABLE `comprobantes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `estudiantes`
--
ALTER TABLE `estudiantes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;

--
-- AUTO_INCREMENT de la tabla `estudiantes_config`
--
ALTER TABLE `estudiantes_config`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `soft_deletes`
--
ALTER TABLE `soft_deletes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `admin_profiles`
--
ALTER TABLE `admin_profiles`
  ADD CONSTRAINT `fk_admin_user` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

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
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_usuarios_estudiante` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
