-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 09-02-2026 a las 00:02:31
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.2.4

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
-- Estructura de tabla para la tabla `cursos`
--

CREATE TABLE `cursos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `codigo` varchar(100) DEFAULT '',
  `subtitulo` varchar(255) DEFAULT '',
  `modalidad` varchar(100) DEFAULT 'Presencial',
  `imagenUrl` varchar(500) DEFAULT '',
  `tags` text DEFAULT NULL,
  `alumnos` int(11) DEFAULT 0,
  `likes` int(11) DEFAULT 0,
  `vistas` int(11) DEFAULT 0,
  `section` varchar(100) DEFAULT 'alumnos',
  `nivel` varchar(100) DEFAULT 'Intermedio',
  `duration` int(11) DEFAULT 0,
  `durationUnit` varchar(50) DEFAULT 'semanas',
  `rating` decimal(3,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cursos`
--

INSERT INTO `cursos` (`id`, `nombre`, `codigo`, `subtitulo`, `modalidad`, `imagenUrl`, `tags`, `alumnos`, `likes`, `vistas`, `section`, `nivel`, `duration`, `durationUnit`, `rating`, `created_at`, `updated_at`) VALUES
(1, 'Entrenamiento para el examen de admisión a la universidad', 'EEAU', 'Razonamiento y habilidades para aprobar el examen', 'PRESENCIAL', 'http://localhost:1002/uploads/cursos/curso-1-1769122404722.webp', 'Problemas,Razonamiento,Estrategias', 120, 0, 0, 'alumnos', 'INTERMEDIO', 8, 'semanas', 4.80, '2026-01-22 22:53:24', '2026-01-22 22:57:35');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cursos`
--
ALTER TABLE `cursos`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `cursos`
--
ALTER TABLE `cursos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
