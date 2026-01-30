import React, { useState, useRef } from 'react';
import { 
  ChevronDown,
  ChevronUp,
  Calculator,
  X
} from 'lucide-react';

/**
 * Editor de ecuaciones matemáticas para estudiantes
 * Permite insertar símbolos matemáticos comunes mediante botones
 * Solo debe mostrarse en materias relacionadas con matemáticas
 */
export default function MathEquationEditor({ 
  value = '', 
  onChange, 
  placeholder = 'Escribe tu respuesta aquí...',
  rows = 4,
  className = ''
}) {
  // Modal flotante - oculto por defecto, se muestra con botón
  const [showModal, setShowModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState('rapidas'); // 'rapidas', 'algebra', 'calculo', 'quimica', 'geometria', 'trigonometria', 'logaritmos', 'fisica', 'griegas'
  const textareaRef = useRef(null);

  // Insertar texto en la posición del cursor
  const insertAtCursor = (text) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = value || '';
    const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);
    
    onChange(newValue);
    
    // Restaurar posición del cursor después de la inserción
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + text.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  // Símbolos organizados por categoría
  const simbolosAlgebra = [
    { label: '²', value: '²', desc: 'Al cuadrado' },
    { label: '³', value: '³', desc: 'Al cubo' },
    { label: 'ⁿ', value: 'ⁿ', desc: 'Potencia n' },
    { label: '√', value: '√', desc: 'Raíz cuadrada' },
    { label: '∛', value: '∛', desc: 'Raíz cúbica' },
    { label: 'ⁿ√', value: 'ⁿ√', desc: 'Raíz n-ésima' },
    { label: '±', value: '±', desc: 'Más menos' },
    { label: '×', value: '×', desc: 'Multiplicación' },
    { label: '÷', value: '÷', desc: 'División' },
    { label: '≠', value: '≠', desc: 'Diferente' },
    { label: '≤', value: '≤', desc: 'Menor o igual' },
    { label: '≥', value: '≥', desc: 'Mayor o igual' },
    { label: '≈', value: '≈', desc: 'Aproximadamente' },
    { label: '≡', value: '≡', desc: 'Idéntico' },
    { label: '∝', value: '∝', desc: 'Proporcional' },
    { label: '∈', value: '∈', desc: 'Pertenece a' },
    { label: '∉', value: '∉', desc: 'No pertenece' },
    { label: '⊂', value: '⊂', desc: 'Subconjunto' },
    { label: '∪', value: '∪', desc: 'Unión' },
    { label: '∩', value: '∩', desc: 'Intersección' },
  ];

  const simbolosCalculo = [
    { label: '∫', value: '∫', desc: 'Integral' },
    { label: '∬', value: '∬', desc: 'Integral doble' },
    { label: '∭', value: '∭', desc: 'Integral triple' },
    { label: '∂', value: '∂', desc: 'Derivada parcial' },
    { label: '∇', value: '∇', desc: 'Nabla/Gradiente' },
    { label: '∑', value: '∑', desc: 'Sumatoria' },
    { label: '∏', value: '∏', desc: 'Productoria' },
    { label: 'lim', value: 'lim', desc: 'Límite' },
    { label: '∞', value: '∞', desc: 'Infinito' },
    { label: '→', value: '→', desc: 'Tender a' },
    { label: '∆', value: '∆', desc: 'Delta/Incremento' },
    { label: 'd/dx', value: 'd/dx', desc: 'Derivada' },
    { label: '∫dx', value: '∫dx', desc: 'Integral dx' },
    { label: 'f\'(x)', value: "f'(x)", desc: 'Derivada de f' },
    { label: 'f\'\'(x)', value: "f''(x)", desc: 'Segunda derivada' },
  ];

  const simbolosQuimica = [
    { label: '→', value: '→', desc: 'Reacción' },
    { label: '⇌', value: '⇌', desc: 'Equilibrio' },
    { label: '↑', value: '↑', desc: 'Gas' },
    { label: '↓', value: '↓', desc: 'Precipitado' },
    { label: 'Δ', value: 'Δ', desc: 'Cambio' },
    { label: '°C', value: '°C', desc: 'Grados Celsius' },
    { label: '°F', value: '°F', desc: 'Grados Fahrenheit' },
    { label: 'K', value: 'K', desc: 'Kelvin' },
    { label: 'mol', value: 'mol', desc: 'Mol' },
    { label: 'M', value: 'M', desc: 'Molaridad' },
    { label: 'pH', value: 'pH', desc: 'pH' },
    { label: 'pOH', value: 'pOH', desc: 'pOH' },
    { label: 'H₂O', value: 'H₂O', desc: 'Agua' },
    { label: 'CO₂', value: 'CO₂', desc: 'Dióxido de carbono' },
    { label: 'H₂SO₄', value: 'H₂SO₄', desc: 'Ácido sulfúrico' },
    { label: 'NaCl', value: 'NaCl', desc: 'Cloruro de sodio' },
    { label: 'H⁺', value: 'H⁺', desc: 'Ión hidrógeno' },
    { label: 'OH⁻', value: 'OH⁻', desc: 'Ión hidróxido' },
    { label: 'e⁻', value: 'e⁻', desc: 'Electrón' },
    { label: 'n', value: 'n', desc: 'Neutrón' },
    { label: 'p⁺', value: 'p⁺', desc: 'Protón' },
  ];

  const simbolosGeometria = [
    { label: '∠', value: '∠', desc: 'Ángulo' },
    { label: '°', value: '°', desc: 'Grados' },
    { label: 'π', value: 'π', desc: 'Pi' },
    { label: 'τ', value: 'τ', desc: 'Tau (2π)' },
    { label: '⊥', value: '⊥', desc: 'Perpendicular' },
    { label: '∥', value: '∥', desc: 'Paralelo' },
    { label: '△', value: '△', desc: 'Triángulo' },
    { label: '□', value: '□', desc: 'Cuadrado' },
    { label: '○', value: '○', desc: 'Círculo' },
    { label: '◊', value: '◊', desc: 'Rombo' },
    { label: '≈', value: '≈', desc: 'Aproximadamente igual' },
    { label: '≅', value: '≅', desc: 'Congruente' },
    { label: '~', value: '~', desc: 'Similar' },
  ];

  const simbolosTrigonometria = [
    { label: 'sin', value: 'sin', desc: 'Seno' },
    { label: 'cos', value: 'cos', desc: 'Coseno' },
    { label: 'tan', value: 'tan', desc: 'Tangente' },
    { label: 'cot', value: 'cot', desc: 'Cotangente' },
    { label: 'sec', value: 'sec', desc: 'Secante' },
    { label: 'csc', value: 'csc', desc: 'Cosecante' },
    { label: 'arcsin', value: 'arcsin', desc: 'Arcoseno' },
    { label: 'arccos', value: 'arccos', desc: 'Arcocoseno' },
    { label: 'arctan', value: 'arctan', desc: 'Arcotangente' },
    { label: 'θ', value: 'θ', desc: 'Theta (ángulo)' },
    { label: 'α', value: 'α', desc: 'Alfa (ángulo)' },
    { label: 'β', value: 'β', desc: 'Beta (ángulo)' },
    { label: '°', value: '°', desc: 'Grados' },
    { label: 'π', value: 'π', desc: 'Pi' },
    { label: 'rad', value: 'rad', desc: 'Radianes' },
  ];

  const simbolosLogaritmos = [
    { label: 'log', value: 'log', desc: 'Logaritmo base 10' },
    { label: 'ln', value: 'ln', desc: 'Logaritmo natural' },
    { label: 'logₐ', value: 'logₐ', desc: 'Logaritmo base a' },
    { label: 'e', value: 'e', desc: 'Número de Euler' },
    { label: 'ln(x)', value: 'ln(x)', desc: 'Logaritmo natural de x' },
    { label: 'log(x)', value: 'log(x)', desc: 'Logaritmo base 10 de x' },
  ];

  const simbolosFisica = [
    { label: 'F', value: 'F', desc: 'Fuerza' },
    { label: 'm', value: 'm', desc: 'Masa' },
    { label: 'a', value: 'a', desc: 'Aceleración' },
    { label: 'v', value: 'v', desc: 'Velocidad' },
    { label: 'v₀', value: 'v₀', desc: 'Velocidad inicial' },
    { label: 't', value: 't', desc: 'Tiempo' },
    { label: 'd', value: 'd', desc: 'Distancia' },
    { label: 'E', value: 'E', desc: 'Energía' },
    { label: 'W', value: 'W', desc: 'Trabajo' },
    { label: 'P', value: 'P', desc: 'Potencia' },
    { label: 'I', value: 'I', desc: 'Intensidad/Corriente' },
    { label: 'V', value: 'V', desc: 'Voltaje' },
    { label: 'R', value: 'R', desc: 'Resistencia' },
    { label: 'Q', value: 'Q', desc: 'Carga/Calor' },
    { label: 'T', value: 'T', desc: 'Temperatura' },
    { label: 'Δ', value: 'Δ', desc: 'Delta (cambio)' },
    { label: 'λ', value: 'λ', desc: 'Lambda (longitud de onda)' },
    { label: 'f', value: 'f', desc: 'Frecuencia' },
    { label: 'ω', value: 'ω', desc: 'Omega (velocidad angular)' },
  ];

  const letrasGriegas = [
    { label: 'α', value: 'α', desc: 'Alfa' },
    { label: 'β', value: 'β', desc: 'Beta' },
    { label: 'γ', value: 'γ', desc: 'Gamma' },
    { label: 'δ', value: 'δ', desc: 'Delta' },
    { label: 'ε', value: 'ε', desc: 'Épsilon' },
    { label: 'θ', value: 'θ', desc: 'Theta' },
    { label: 'λ', value: 'λ', desc: 'Lambda' },
    { label: 'μ', value: 'μ', desc: 'Mu' },
    { label: 'π', value: 'π', desc: 'Pi' },
    { label: 'ρ', value: 'ρ', desc: 'Rho' },
    { label: 'σ', value: 'σ', desc: 'Sigma' },
    { label: 'τ', value: 'τ', desc: 'Tau' },
    { label: 'φ', value: 'φ', desc: 'Phi' },
    { label: 'ω', value: 'ω', desc: 'Omega' },
    { label: 'Γ', value: 'Γ', desc: 'Gamma mayúscula' },
    { label: 'Δ', value: 'Δ', desc: 'Delta mayúscula' },
    { label: 'Θ', value: 'Θ', desc: 'Theta mayúscula' },
    { label: 'Λ', value: 'Λ', desc: 'Lambda mayúscula' },
    { label: 'Σ', value: 'Σ', desc: 'Sigma mayúscula' },
    { label: 'Ω', value: 'Ω', desc: 'Omega mayúscula' },
  ];

  // Plantillas organizadas por materia (basadas en IPN 2020)
  // FORMATO: Texto legible para el alumno (no LaTeX crudo)
  // Las fórmulas se muestran en formato legible que el alumno puede entender y editar fácilmente
  const plantillasAlgebra = [
    // Plantillas básicas de estructura (formato estructurado con saltos de línea)
    { label: 'Fracción simple', value: '     a\n     ───\n     b', desc: 'Fracción estructurada - edita a y b' },
    { label: 'Fracción (formato línea)', value: '(a)/(b)', desc: 'Fracción en una línea' },
    { label: 'Raíz cuadrada', value: '√(x)', desc: 'Raíz cuadrada - reemplaza x con tu valor' },
    { label: 'Raíz cuadrada (estructurada)', value: '     ────\n    √ x', desc: 'Raíz cuadrada con formato visual' },
    { label: 'Raíz n-ésima', value: 'ⁿ√(x)', desc: 'Raíz n-ésima - reemplaza n y x' },
    { label: 'Raíz n-ésima (estructurada)', value: '     ────\n   ⁿ√ x', desc: 'Raíz n-ésima con formato visual' },
    { label: 'Potencia', value: 'x²', desc: 'Al cuadrado - reemplaza x con tu variable' },
    { label: 'Potencia cubo', value: 'x³', desc: 'Al cubo - reemplaza x con tu variable' },
    { label: 'Subíndice', value: 'x₁', desc: 'Subíndice - reemplaza variable e índice' },
    
    // Factorización - Las 7 fórmulas principales (formato legible)
    { label: '1. Factor común', value: 'ab + ac = a(b + c)', desc: 'Factor común monomio' },
    { label: '2. Factor común por agrupación', value: 'ax + ay + bx + by = (a + b)(x + y)', desc: 'Agrupación de términos' },
    { label: '3. Diferencia de cuadrados', value: 'a² - b² = (a + b)(a - b)', desc: 'Fórmula 3 de factorización' },
    { label: '4. Suma de cuadrados', value: 'a² + b² = (a + bi)(a - bi)', desc: 'Números complejos' },
    { label: '5. Trinomio cuadrado perfecto', value: 'a² + 2ab + b² = (a + b)²', desc: 'Fórmula 5 de factorización' },
    { label: '6. Trinomio cuadrado perfecto (resta)', value: 'a² - 2ab + b² = (a - b)²', desc: 'Fórmula 6 de factorización' },
    { label: '7. Suma de cubos', value: 'a³ + b³ = (a + b)(a² - ab + b²)', desc: 'Fórmula 7 de factorización' },
    { label: '8. Diferencia de cubos', value: 'a³ - b³ = (a - b)(a² + ab + b²)', desc: 'Fórmula 8 de factorización' },
    
    // Binomios
    { label: 'Binomio al cuadrado', value: '(a + b)² = a² + 2ab + b²', desc: 'Fórmula del binomio' },
    { label: 'Binomio al cubo', value: '(a + b)³ = a³ + 3a²b + 3ab² + b³', desc: 'Binomio al cubo' },
    { label: 'Binomio al cuadrado (resta)', value: '(a - b)² = a² - 2ab + b²', desc: 'Binomio resta al cuadrado' },
    { label: 'Binomio al cubo (resta)', value: '(a - b)³ = a³ - 3a²b + 3ab² - b³', desc: 'Binomio resta al cubo' },
    
    // Ecuaciones (formato legible con estructura clara)
    { label: 'Ecuación lineal', value: 'ax + b = 0 → x = -b/a', desc: 'Ecuación de primer grado' },
    { label: 'Ecuación cuadrática', value: 'ax² + bx + c = 0', desc: 'Forma general' },
    { label: 'Fórmula cuadrática', value: '     -b ± √(b² - 4ac)\nx = ─────────────────\n         2a', desc: 'Solución estructurada con fracción visual' },
    { label: 'Fórmula cuadrática (línea)', value: 'x = (-b ± √(b² - 4ac)) / (2a)', desc: 'Solución en formato línea' },
    { label: 'Discriminante', value: 'Δ = b² - 4ac', desc: 'Discriminante de cuadrática' },
    { label: 'Ecuación cúbica', value: 'ax³ + bx² + cx + d = 0', desc: 'Ecuación de tercer grado' },
    
    // Inecuaciones
    { label: 'Inecuación lineal', value: 'ax + b > 0', desc: 'Inecuación de primer grado' },
    { label: 'Inecuación cuadrática', value: 'ax² + bx + c > 0', desc: 'Inecuación de segundo grado' },
    { label: 'Inecuación racional', value: '(ax + b)/(cx + d) > 0', desc: 'Inecuación con fracción' },
    { label: 'Inecuación racional (estructurada)', value: '     ax + b\n─────── > 0\n     cx + d', desc: 'Inecuación con fracción estructurada' },
    
    // División sintética
    { label: 'División sintética', value: 'P(x) ÷ (x - r)', desc: 'División sintética básica' },
    { label: 'Teorema del residuo', value: 'P(r) = residuo', desc: 'Teorema del residuo' },
    { label: 'Teorema del factor', value: 'Si P(r) = 0, entonces (x - r) es factor', desc: 'Teorema del factor' },
    
    // Exponentes y radicales (formato legible)
    { label: 'Leyes de exponentes 1', value: 'a^m · a^n = a^(m+n)', desc: 'Multiplicación' },
    { label: 'Leyes de exponentes 2', value: 'a^m / a^n = a^(m-n)', desc: 'División' },
    { label: 'Leyes de exponentes 3', value: '(a^m)^n = a^(mn)', desc: 'Potencia de potencia' },
    { label: 'Exponente negativo', value: 'a^(-n) = 1/(a^n)', desc: 'Inverso' },
    { label: 'Exponente negativo (estructurada)', value: '          1\na^(-n) = ───\n          a^n', desc: 'Inverso con fracción estructurada' },
    { label: 'Raíz como exponente', value: 'a^(1/n) = ⁿ√a', desc: 'Raíz n-ésima' },
    { label: 'Producto de radicales', value: '√a · √b = √(ab)', desc: 'Multiplicación de raíces' },
    { label: 'Cociente de radicales', value: '√a / √b = √(a/b)', desc: 'División de raíces' },
    { label: 'Cociente de radicales (estructurada)', value: '     √a\n     ─── = √(a/b)\n     √b', desc: 'División de raíces estructurada' },
    { label: 'Producto de radicales (estructurada)', value: '√a · √b = √(ab)', desc: 'Multiplicación de raíces - formato línea' },
  ];

  const plantillasCalculo = [
    { label: 'Derivada', value: 'd/dx [f(x)]', desc: 'Derivada de función' },
    { label: 'Integral indefinida', value: '∫ f(x) dx', desc: 'Integral' },
    { label: 'Integral definida', value: '∫[a,b] f(x) dx', desc: 'Integral con límites' },
    { label: 'Límite', value: 'lim(x→a) f(x)', desc: 'Límite' },
    { label: 'Regla de la cadena', value: "d/dx [f(g(x))] = f'(g(x)) · g'(x)", desc: 'Derivada compuesta' },
    { label: 'Regla del producto', value: "d/dx [f(x)·g(x)] = f'(x)·g(x) + f(x)·g'(x)", desc: 'Derivada de producto' },
  ];

  const plantillasQuimica = [
    { label: 'Ecuación química', value: 'A + B → C + D', desc: 'Reacción simple' },
    { label: 'Equilibrio químico', value: 'A + B ⇌ C + D', desc: 'Equilibrio' },
    { label: 'Ley de gases', value: 'PV = nRT', desc: 'Ideal' },
    { label: 'pH', value: 'pH = -log[H⁺]', desc: 'Cálculo de pH' },
    { label: 'Concentración molar', value: 'M = n/V', desc: 'Molaridad' },
    { label: 'Concentración molar (estructurada)', value: '     n\nM = ───\n     V', desc: 'Molaridad con fracción estructurada' },
    { label: 'Dilución', value: 'M₁V₁ = M₂V₂', desc: 'Fórmula de dilución' },
  ];

  const plantillasGeometria = [
    { label: 'Área círculo', value: 'A = πr²', desc: 'Área del círculo' },
    { label: 'Perímetro círculo', value: 'P = 2πr = πd', desc: 'Circunferencia IPN' },
    { label: 'Área triángulo', value: 'A = (b·h)/2', desc: 'Base por altura' },
    { label: 'Teorema de Pitágoras', value: 'a² + b² = c²', desc: 'Triángulo rectángulo' },
    { label: 'Volumen esfera', value: 'V = (4/3)πr³', desc: 'Esfera' },
    { label: 'Volumen esfera (estructurada)', value: '     4\nV = ─── πr³\n     3', desc: 'Volumen con fracción estructurada' },
    { label: 'Área esfera', value: 'A = 4πr²', desc: 'Superficie esfera' },
    { label: 'Volumen cilindro', value: 'V = πr²h', desc: 'Cilindro' },
    { label: 'Área cilindro', value: 'A = 2πr(r + h)', desc: 'Superficie cilindro' },
    { label: 'Volumen cono', value: 'V = (1/3)πr²h', desc: 'Cono' },
    { label: 'Volumen cono (estructurada)', value: '     1\nV = ─── πr²h\n     3', desc: 'Volumen con fracción estructurada' },
    { label: 'Distancia entre puntos', value: 'd = √[(x₂-x₁)² + (y₂-y₁)²]', desc: 'Geometría analítica IPN' },
    { label: 'Pendiente', value: 'm = (y₂ - y₁)/(x₂ - x₁)', desc: 'Pendiente de recta' },
    { label: 'Pendiente (estructurada)', value: '     y₂ - y₁\nm = ────────\n     x₂ - x₁', desc: 'Pendiente con fracción estructurada' },
    { label: 'Ecuación punto-pendiente', value: 'y - y₁ = m(x - x₁)', desc: 'Recta IPN' },
    { label: 'Ecuación pendiente-ordenada', value: 'y = mx + b', desc: 'Forma estándar' },
  ];

  const plantillasTrigonometria = [
    { label: 'Identidad fundamental', value: 'sin²θ + cos²θ = 1', desc: 'IPN 2020' },
    { label: 'Tangente', value: 'tan θ = sin θ / cos θ', desc: 'Definición' },
    { label: 'Cotangente', value: 'cot θ = cos θ / sin θ', desc: 'Definición' },
    { label: 'Secante', value: 'sec θ = 1 / cos θ', desc: 'Definición' },
    { label: 'Cosecante', value: 'csc θ = 1 / sin θ', desc: 'Definición' },
    { label: 'Suma de senos', value: 'sin(α ± β) = sin α cos β ± cos α sin β', desc: 'IPN 2020' },
    { label: 'Suma de cosenos', value: 'cos(α ± β) = cos α cos β ∓ sin α sin β', desc: 'IPN 2020' },
    { label: 'Suma de tangentes', value: 'tan(α ± β) = (tan α ± tan β)/(1 ∓ tan α tan β)', desc: 'IPN 2020' },
    { label: 'Suma de tangentes (estructurada)', value: '     tan α ± tan β\ntan(α ± β) = ─────────────────\n     1 ∓ tan α tan β', desc: 'Suma de tangentes con fracción estructurada' },
    { label: 'Ángulo doble seno', value: 'sin(2θ) = 2 sin θ cos θ', desc: 'IPN 2020' },
    { label: 'Ángulo doble coseno', value: 'cos(2θ) = cos²θ - sin²θ', desc: 'IPN 2020' },
    { label: 'Ángulo doble tangente', value: 'tan(2θ) = (2 tan θ)/(1 - tan²θ)', desc: 'IPN 2020' },
    { label: 'Ley de senos', value: 'a/sin A = b/sin B = c/sin C = 2R', desc: 'IPN 2020' },
    { label: 'Ley de cosenos', value: 'a² = b² + c² - 2bc cos A', desc: 'IPN 2020' },
  ];

  const plantillasLogaritmos = [
    { label: 'Logaritmo producto', value: 'logₐ(xy) = logₐ x + logₐ y', desc: 'IPN 2020' },
    { label: 'Logaritmo cociente', value: 'logₐ(x/y) = logₐ x - logₐ y', desc: 'IPN 2020' },
    { label: 'Logaritmo potencia', value: 'logₐ(xⁿ) = n logₐ x', desc: 'IPN 2020' },
    { label: 'Logaritmo base igual', value: 'logₐ a = 1', desc: 'IPN 2020' },
    { label: 'Logaritmo de 1', value: 'logₐ 1 = 0', desc: 'IPN 2020' },
    { label: 'Cambio de base', value: 'logₐ x = log x / log a', desc: 'Cambio de base' },
  ];

  const plantillasFisica = [
    { label: 'Segunda ley de Newton', value: 'F = ma', desc: 'IPN 2020' },
    { label: 'Trabajo', value: 'W = Fd', desc: 'IPN 2020' },
    { label: 'Potencia', value: 'P = W/t', desc: 'IPN 2020' },
    { label: 'Energía cinética', value: 'E_c = (1/2)mv²', desc: 'IPN 2020' },
    { label: 'Energía potencial', value: 'E_p = mgh', desc: 'IPN 2020' },
    { label: 'Velocidad', value: 'v = v₀ + at', desc: 'IPN 2020' },
    { label: 'Posición', value: 'x = x₀ + v₀t + (1/2)at²', desc: 'IPN 2020' },
    { label: 'Velocidad al cuadrado', value: 'v² = v₀² + 2a(x - x₀)', desc: 'IPN 2020' },
    { label: 'Ley de gases ideales', value: 'PV = nRT', desc: 'IPN 2020' },
    { label: 'Ley de gases combinada', value: 'P₁V₁/T₁ = P₂V₂/T₂', desc: 'IPN 2020' },
    { label: 'Calor', value: 'Q = mcΔT', desc: 'IPN 2020' },
    { label: 'Ley de Ohm', value: 'V = IR', desc: 'IPN 2020' },
    { label: 'Potencia eléctrica', value: 'P = IV', desc: 'IPN 2020' },
    { label: 'Fuerza eléctrica', value: 'F = k(q₁q₂)/r²', desc: 'IPN 2020' },
    { label: 'Velocidad de onda', value: 'v = λf', desc: 'IPN 2020' },
    { label: 'Energía fotón', value: 'E = hf', desc: 'IPN 2020' },
  ];

  // Insertar y cerrar modal
  const handleInsertAndClose = (text) => {
    insertAtCursor(text);
    setShowModal(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Botón flotante para abrir modal */}
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="mb-3 w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 border-2 border-indigo-700 rounded-lg transition-colors shadow-md hover:shadow-lg"
      >
        <Calculator className="w-5 h-5" />
        <span>📐 Abrir calculadora de fórmulas matemáticas</span>
      </button>

      {/* Modal flotante con scroll */}
      {showModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-indigo-400 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <Calculator className="w-6 h-6" />
                <h3 className="text-lg font-bold">Calculadora de Fórmulas Matemáticas</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido con scroll */}
            <div className="flex-1 overflow-y-auto p-4 bg-indigo-50">
              <div className="space-y-4">
                {/* Pestañas de categorías */}
                <div className="mb-3">
                  <p className="text-xs font-semibold text-indigo-800 mb-2">Selecciona una categoría:</p>
                  <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setActiveCategory('rapidas')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                  activeCategory === 'rapidas' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-indigo-700 border border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                Rápidas
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('algebra')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                  activeCategory === 'algebra' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-indigo-700 border border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                Álgebra
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('calculo')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                  activeCategory === 'calculo' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-indigo-700 border border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                Cálculo
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('quimica')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                  activeCategory === 'quimica' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-indigo-700 border border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                Química
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('geometria')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                  activeCategory === 'geometria' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-indigo-700 border border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                Geometría
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('trigonometria')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                  activeCategory === 'trigonometria' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-indigo-700 border border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                Trigonometría
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('logaritmos')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                  activeCategory === 'logaritmos' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-indigo-700 border border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                Logaritmos
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('fisica')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                  activeCategory === 'fisica' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-indigo-700 border border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                Física
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('griegas')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                  activeCategory === 'griegas' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-indigo-700 border border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                Letras Griegas
                  </button>
                  </div>
                </div>

                {/* Símbolos según categoría activa */}
                <div className="mb-3 bg-white p-3 rounded-lg border border-indigo-200">
            <p className="text-xs font-semibold text-indigo-800 mb-2">
              {activeCategory === 'rapidas' && '⚡ Operaciones rápidas'}
              {activeCategory === 'algebra' && '📊 Símbolos de Álgebra'}
              {activeCategory === 'calculo' && '∫ Símbolos de Cálculo'}
              {activeCategory === 'quimica' && '⚗️ Símbolos de Química'}
              {activeCategory === 'geometria' && '📐 Símbolos de Geometría'}
              {activeCategory === 'trigonometria' && '📐 Símbolos de Trigonometría'}
              {activeCategory === 'logaritmos' && '📈 Símbolos de Logaritmos'}
              {activeCategory === 'fisica' && '⚛️ Símbolos de Física'}
              {activeCategory === 'griegas' && 'α Letras Griegas'}
            </p>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {(() => {
                let simbolos = [];
                if (activeCategory === 'rapidas') {
                  simbolos = [
                    { label: '²', value: '²', desc: 'Al cuadrado' },
                    { label: '³', value: '³', desc: 'Al cubo' },
                    { label: '√', value: '√', desc: 'Raíz cuadrada' },
                    { label: '±', value: '±', desc: 'Más menos' },
                    { label: '×', value: '×', desc: 'Multiplicación' },
                    { label: '÷', value: '÷', desc: 'División' },
                    { label: '≠', value: '≠', desc: 'Diferente' },
                    { label: '≤', value: '≤', desc: 'Menor o igual' },
                    { label: '≥', value: '≥', desc: 'Mayor o igual' },
                    { label: '≈', value: '≈', desc: 'Aproximadamente' },
                    { label: '∞', value: '∞', desc: 'Infinito' },
                    { label: 'π', value: 'π', desc: 'Pi' },
                  ];
                } else if (activeCategory === 'algebra') {
                  simbolos = simbolosAlgebra;
                } else if (activeCategory === 'calculo') {
                  simbolos = simbolosCalculo;
                } else if (activeCategory === 'quimica') {
                  simbolos = simbolosQuimica;
                } else if (activeCategory === 'geometria') {
                  simbolos = simbolosGeometria;
                } else if (activeCategory === 'trigonometria') {
                  simbolos = simbolosTrigonometria;
                } else if (activeCategory === 'logaritmos') {
                  simbolos = simbolosLogaritmos;
                } else if (activeCategory === 'fisica') {
                  simbolos = simbolosFisica;
                } else if (activeCategory === 'griegas') {
                  simbolos = letrasGriegas;
                }
                return simbolos.map((symbol, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleInsertAndClose(symbol.value)}
                    className="px-2 py-2 text-sm sm:text-base font-medium bg-white border border-indigo-300 rounded-lg hover:bg-indigo-50 hover:border-indigo-400 active:bg-indigo-100 transition-colors shadow-sm"
                    title={symbol.desc}
                  >
                    {symbol.label}
                  </button>
                ));
              })()}
                  </div>
                </div>

                {/* Plantillas según categoría */}
                <div className="bg-white p-3 rounded-lg border border-indigo-200">
                  <p className="text-xs font-semibold text-indigo-800 mb-2">Fórmulas y plantillas:</p>
                  <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
              {(() => {
                let plantillas = [];
                if (activeCategory === 'rapidas' || activeCategory === 'algebra') {
                  plantillas = plantillasAlgebra;
                } else if (activeCategory === 'calculo') {
                  plantillas = plantillasCalculo;
                } else if (activeCategory === 'quimica') {
                  plantillas = plantillasQuimica;
                } else if (activeCategory === 'geometria') {
                  plantillas = plantillasGeometria;
                } else if (activeCategory === 'trigonometria') {
                  plantillas = plantillasTrigonometria;
                } else if (activeCategory === 'logaritmos') {
                  plantillas = plantillasLogaritmos;
                } else if (activeCategory === 'fisica') {
                  plantillas = plantillasFisica;
                } else {
                  plantillas = [
                    { label: 'Fracción', value: '( )/( )', desc: 'Insertar fracción' },
                    { label: 'Raíz cuadrada', value: '√( )', desc: 'Insertar raíz cuadrada' },
                    { label: 'Potencia', value: '^', desc: 'Insertar exponente' },
                  ];
                }
                return plantillas.map((template, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleInsertAndClose(template.value)}
                    className="px-3 py-1.5 text-xs bg-white border border-indigo-400 rounded-lg hover:bg-indigo-50 active:bg-indigo-100 transition-colors font-medium"
                    title={template.desc}
                  >
                    {template.label}
                  </button>
                ));
              })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Textarea principal - con fuente monoespaciada para mejor alineación */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-colors resize-y font-mono leading-relaxed whitespace-pre"
        style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
      />
      
      <p className="mt-2 text-xs text-gray-500">
        💡 Haz clic en los botones de arriba para insertar símbolos matemáticos directamente en tu respuesta.
        <br />
        📝 Las fórmulas se insertan en formato legible. Puedes editarlas y usar símbolos como ², ³, √, π, etc.
      </p>
    </div>
  );
}

/**
 * Función helper para determinar si una materia es relacionada con matemáticas
 */
export function isMathSubject(materia) {
  if (!materia) {
    console.log('[MathEquationEditor] No hay materia especificada');
    return false;
  }
  
  const materiaLower = materia.toLowerCase().trim();
  console.log('[MathEquationEditor] Verificando materia:', materiaLower);
  
  const mathKeywords = [
    'matemática', 'matematicas', 'math', 'algebra', 'álgebra',
    'geometría', 'geometria', 'trigonometría', 'trigonometria',
    'cálculo', 'calculo', 'estadística', 'estadistica',
    'física', 'fisica', 'química', 'quimica',
    'pensamiento analítico', 'pensamiento analitico', 'analítico', 'analitico',
    'aritmética', 'aritmetica', 'numeros', 'números',
    'pensamiento', 'analitico', 'analítico' // Para "Matemáticas y pensamiento analítico"
  ];
  
  const isMath = mathKeywords.some(keyword => materiaLower.includes(keyword));
  console.log('[MathEquationEditor] ¿Es matemáticas?', isMath);
  
  return isMath;
}

/**
 * Función helper para detectar si una pregunta individual es de matemáticas
 * basándose en su contenido (texto, símbolos matemáticos, palabras clave)
 */
export function isMathQuestion(pregunta) {
  if (!pregunta) return false;
  
  // Obtener el texto de la pregunta (puede venir de diferentes campos)
  const textoPregunta = (
    pregunta.enunciado || 
    pregunta.pregunta || 
    pregunta.texto || 
    pregunta.contenido || 
    ''
  ).toLowerCase();
  
  if (!textoPregunta) return false;
  
  // Palabras clave matemáticas en el texto de la pregunta
  const mathKeywords = [
    'fórmula', 'formula', 'calcular', 'despeja', 'despejar', 'resolver',
    'ecuación', 'ecuacion', 'inecuación', 'inecuacion',
    'álgebra', 'algebra', 'geometría', 'geometria',
    'trigonometría', 'trigonometria', 'cálculo', 'calculo',
    'derivada', 'integral', 'límite', 'limite',
    'volumen', 'área', 'area', 'perímetro', 'perimetro',
    'radio', 'diámetro', 'diametro', 'altura', 'base',
    'binomio', 'factorización', 'factorizacion', 'polinomio',
    'raíz', 'raiz', 'exponente', 'potencia', 'logaritmo',
    'seno', 'coseno', 'tangente', 'cotangente',
    'triángulo', 'triangulo', 'círculo', 'circulo', 'cilindro',
    'esfera', 'cono', 'prisma', 'pirámide', 'piramide',
    'teorema', 'pitágoras', 'pitagoras', 'pascal',
    'variable', 'incógnita', 'incognita', 'coeficiente',
    'fracción', 'fraccion', 'decimal', 'porcentaje',
    'suma', 'resta', 'multiplicación', 'multiplicacion', 'división', 'division'
  ];
  
  // Símbolos matemáticos comunes
  const mathSymbols = [
    'π', '²', '³', '√', '±', '×', '÷', '≤', '≥', '≠', '≈', '∞',
    '∫', '∑', '∏', '∂', '∇', 'Δ', 'α', 'β', 'θ', 'λ', 'μ', 'σ',
    'sin', 'cos', 'tan', 'log', 'ln', 'e^', 'x²', 'x³', 'r²', 'h²'
  ];
  
  // Verificar palabras clave
  const hasMathKeywords = mathKeywords.some(keyword => textoPregunta.includes(keyword));
  
  // Verificar símbolos matemáticos
  const hasMathSymbols = mathSymbols.some(symbol => textoPregunta.includes(symbol.toLowerCase()));
  
  // Verificar patrones matemáticos comunes (fórmulas, ecuaciones)
  const mathPatterns = [
    /\b[a-z]\s*=\s*[a-z]/i,  // x = y (ecuaciones)
    /\b[a-z]²\b/i,           // x² (exponentes)
    /\b[a-z]³\b/i,           // x³ (exponentes)
    /\b√[a-z]/i,             // √x (raíces)
    /\bπ\s*[a-z]²/i,         // πr² (fórmulas)
    /\b[a-z]\s*\+\s*[a-z]/i, // x + y (expresiones)
    /\b[a-z]\s*-\s*[a-z]/i,  // x - y (expresiones)
    /\b[a-z]\s*\*\s*[a-z]/i, // x * y (multiplicación)
    /\b[a-z]\s*\/\s*[a-z]/i, // x / y (división)
    /\b\d+\s*[a-z]/i,        // 2x, 3y (coeficientes)
    /\b[a-z]\s*\d+/i,        // x2, y3 (variables con números)
  ];
  
  const hasMathPatterns = mathPatterns.some(pattern => pattern.test(textoPregunta));
  
  const isMath = hasMathKeywords || hasMathSymbols || hasMathPatterns;
  
  console.log('[MathEquationEditor] Verificando pregunta:', {
    texto: textoPregunta.substring(0, 50) + '...',
    hasMathKeywords,
    hasMathSymbols,
    hasMathPatterns,
    isMath
  });
  
  return isMath;
}
