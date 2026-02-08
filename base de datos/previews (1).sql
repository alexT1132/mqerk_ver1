-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 09-02-2026 a las 00:03:42
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
-- Estructura de tabla para la tabla `previews`
--

CREATE TABLE `previews` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `video_url` varchar(500) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `aprenderas` text DEFAULT NULL,
  `areas_ensenanza` text DEFAULT NULL,
  `plan_lateral` text DEFAULT NULL,
  `planes` text DEFAULT NULL,
  `tagline` varchar(255) DEFAULT NULL,
  `total_classes` varchar(50) DEFAULT NULL,
  `hours_per_day` varchar(50) DEFAULT NULL,
  `views` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `previews`
--

INSERT INTO `previews` (`id`, `course_id`, `video_url`, `descripcion`, `aprenderas`, `areas_ensenanza`, `plan_lateral`, `planes`, `tagline`, `total_classes`, `hours_per_day`, `views`, `created_at`, `updated_at`) VALUES
(1, 1, 'https://www.youtube.com/watch?v=GX9dDbaLts4', 'Prepárate para tu examen de admisión con un curso diferente: olvida la memorización y enfócate en entender, aplicar y destacar. Con el método MQ+Disruptivo, recibirás acompañamiento personalizado, herramientas digitales, simuladores y estrategias que activan tu mente y refuerzan tu seguridad. Este no es un curso más: es una guía integral para ingresar a las mejores universidades pensando, resolviendo y avanzando con propósito.', '[\"Técnicas para resolver reactivos de opción múltiple de forma eficiente.\",\"Estrategias de lectura y análisis de textos complejos.\",\"Fundamentos esenciales de ciencias naturales (física, química y biología).\",\"Habilidades para organizar el tiempo de estudio y mejorar la concentración.\",\"Seguridad, confianza y control del estrés antes y durante el examen.\",\"Uso de herramientas digitales para reforzar el aprendizaje.\"]', '[\"Entorno Social.\",\"Habilidades cognitivas.\",\"Habilidades lógicas.\",\"Español y comprensión lectora.\",\"Redacción indirecta.\",\"Orientación Académica.\",\"Matemáticas.\",\"Ciencias exactas.\",\"Civica y Etica.\",\"Psicoeducación.\",\"Inglés.\"]', '{\"nombre\":\"MENSUAL\",\"precio\":\"1,500\",\"precio_tachado\":\"2,000\",\"descuento\":\"25\",\"beneficios\":[\"Guías digitales con ejercicios tipo examen\",\"Libros electrónicos en PDF\",\"Simuladores en línea\",\"Conferencias con expertos\",\"Acceso a nuestra plataforma educativa\",\"Orientación psicoeducativa\"]}', '[{\"id\":1,\"nombre\":\"Mensual\",\"descripcion\":\"Pago mes a mes durante los 8 meses\",\"precio\":\"1,500\",\"etiquetaPrecio\":\"PAGO\",\"beneficios\":[\"Acceso a nuestra plataforma educativa\",\"Guías digitales con ejercicios tipo examen\",\"Libros electrónicos en PDF por materia\",\"Simuladores en línea\"],\"destacado\":false},{\"id\":2,\"nombre\":\"Start\",\"descripcion\":\"Pago en 2 exhibiciones (inicio y mitad del curso)\",\"precio\":\"5,500\",\"etiquetaPrecio\":\"2 PAGOS DE\",\"beneficios\":[\"Acceso a nuestra plataforma educativa\",\"Guías digitales con ejercicios tipo examen\",\"Libros electrónicos en PDF por materia\",\"Simuladores en línea\"],\"destacado\":true},{\"id\":3,\"nombre\":\"Premium\",\"descripcion\":\"Pago único con precio preferencial\",\"precio\":\"10,500\",\"etiquetaPrecio\":\"1 SOLO PAGO DE\",\"beneficios\":[\"Acceso a nuestra plataforma educativa\",\"Guías digitales con ejercicios tipo examen\",\"Libros electrónicos en PDF por materia\",\"Simuladores en línea\"],\"destacado\":false}]', 'Despierta todo tu potencial.', '+ 130 clases', '2 h x dia', 0, '2026-01-23 20:52:48', '2026-01-27 20:32:49');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `previews`
--
ALTER TABLE `previews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_previews_curso` (`course_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `previews`
--
ALTER TABLE `previews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `previews`
--
ALTER TABLE `previews`
  ADD CONSTRAINT `fk_previews_curso` FOREIGN KEY (`course_id`) REFERENCES `cursos` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
