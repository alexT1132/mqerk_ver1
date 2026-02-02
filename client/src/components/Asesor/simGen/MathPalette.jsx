import { useState, useEffect, useRef } from "react";
import InlineMath from './InlineMath.jsx';
import { MathLiveInput } from './MathLiveInput.jsx';
import axios from "../../../api/axios.js";

/* ------------------------------- Modal base ------------------------------ */
export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm px-4 pt-18 pb-6">
      <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl ring-4 ring-violet-200/30 h-[85vh] max-h-[85vh] flex flex-col overflow-hidden border-2 border-violet-200/50">
        <div className="flex items-center justify-between border-b-2 border-violet-200/50 bg-gradient-to-r from-violet-50/80 via-indigo-50/80 to-purple-50/80 p-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg ring-2 ring-violet-200/50">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="4" y="3" width="16" height="18" rx="2" />
                <path d="M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M16 15h0" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2.5 text-slate-500 hover:text-slate-700 transition-all hover:bg-white hover:scale-110 active:scale-95 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md"
            aria-label="Cerrar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto p-6 flex-1 min-h-0 bg-gradient-to-b from-white via-slate-50/20 to-white">{children}</div>
        <div className="flex justify-end gap-3 border-t-2 border-violet-200/50 bg-gradient-to-r from-slate-50/50 to-white p-4 flex-shrink-0">
          {footer ? footer : (
            <button
              onClick={onClose}
              className="inline-flex items-center rounded-xl border-2 border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------- Paleta de fórmulas ---------------------------- */
export const SECTIONS = {
  'Básico': [
    'x^2', 'x_i', '\\sqrt{x}', '\\sqrt[n]{x}',
    '\\frac{a}{b}', '\\cdot', '\\times', '\\div',
    '\\pm', '\\mp', '\\dots', '\\ldots', '\\cdots',
    '\\overline{AB}', '\\hat{\\theta}', '\\vec{v}', '^{\\circ}',
  ],

  'Griego': [
    '\\alpha', '\\beta', '\\gamma', '\\delta', '\\epsilon', '\\zeta', '\\eta', '\\theta',
    '\\iota', '\\kappa', '\\lambda', '\\mu', '\\nu', '\\xi', '\\pi', '\\rho', '\\sigma',
    '\\tau', '\\upsilon', '\\phi', '\\chi', '\\psi', '\\omega',
    '\\Gamma', '\\Delta', '\\Theta', '\\Lambda', '\\Xi', '\\Pi', '\\Sigma', '\\Upsilon', '\\Phi', '\\Psi', '\\Omega'
  ],

  'ABΓ (Conj.)': [
    '\\mathbb{N}', '\\mathbb{Z}', '\\mathbb{Q}', '\\mathbb{R}', '\\mathbb{C}',
    '\\mathcal{A}', '\\mathcal{B}', '\\mathcal{L}', '\\mathcal{F}',
    '\\subset', '\\subseteq', '\\supset', '\\supseteq', '\\in', '\\notin',
    '\\cup', '\\cap', '\\setminus', '\\varnothing'
  ],

  'Trig': [
    '\\sin', '\\cos', '\\tan', '\\cot', '\\sec', '\\csc',
    '\\arcsin', '\\arccos', '\\arctan',
    '\\sin^{-1}', '\\cos^{-1}', '\\tan^{-1}'
  ],

  'Rel/Op': [
    '\\le', '\\ge', '<', '>', '\\neq', '\\approx', '\\equiv', '\\propto',
    '\\to', '\\Rightarrow', '\\Leftarrow', '\\Leftrightarrow',
    '\\parallel', '\\perp', '\\angle', '\\measuredangle'
  ],

  'Álgebra': [
    '\\log', '\\ln', 'e^{x}', 'a^{b}', 'x^{\\square}', '_{\\square}',
    '(x+1)^2', '(a-b)^2', '(a+b)^3', '(a-b)^3',
    '\\sqrt{\\square}', '\\sqrt[n]{\\square}',
    '\\binom{n}{k}', '\\choose', '\\gcd', '\\operatorname{lcm}',
    'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}',
    'ax^2 + bx + c = 0',
    '(a+b)(a-b) = a^2 - b^2',
    'a^2 + 2ab + b^2 = (a+b)^2',
    'a^2 - 2ab + b^2 = (a-b)^2',
    'a^3 + b^3 = (a+b)(a^2-ab+b^2)',
    'a^3 - b^3 = (a-b)(a^2+ab+b^2)',
    '\\frac{a}{b} = \\frac{c}{d} \\Rightarrow ad = bc'
  ],

  'Cálculo': [
    '\\sum_{i=1}^{n} a_i', '\\prod_{k=1}^{n} b_k',
    '\\int f(x)\\,dx', '\\int_{a}^{b} f(x)\\,dx',
    '\\int \\square\\,dx', '\\int_{\\square}^{\\square} \\square\\,dx',
    '\\int x^{\\square}\\,dx', '\\int e^{\\square}\\,dx',
    '\\int \\sin(\\square)\\,dx', '\\int \\cos(\\square)\\,dx',
    '\\int \\frac{1}{\\square}\\,dx', '\\int \\ln(\\square)\\,dx',
    '\\iint\\, dA', '\\iiint\\, dV', '\\oint\\,',
    '\\lim_{x\\to 0}', '\\lim_{n\\to\\infty}',
    '\\lim_{x\\to \\square}', '\\lim_{x\\to \\square} \\frac{\\square}{\\square}',
    '\\frac{d}{dx}', '\\frac{d^2}{dx^2}',
    '\\frac{d}{dx}(\\square)', '\\frac{d^2}{dx^2}(\\square)',
    '\\frac{\\partial}{\\partial x}', '\\frac{\\partial^2}{\\partial x^2}',
    '\\frac{\\partial}{\\partial x}(\\square)', '\\frac{\\partial}{\\partial y}(\\square)',
    '\\frac{d}{dx}(x^n) = nx^{n-1}',
    '\\frac{d}{dx}(e^x) = e^x',
    '\\frac{d}{dx}(\\ln x) = \\frac{1}{x}',
    '\\frac{d}{dx}(\\sin x) = \\cos x',
    '\\frac{d}{dx}(\\cos x) = -\\sin x',
    '\\frac{d}{dx}(\\tan x) = \\sec^2 x',
    '\\frac{d}{dx}(\\cot x) = -\\csc^2 x',
    '\\frac{d}{dx}(\\sec x) = \\sec x \\tan x',
    '\\frac{d}{dx}(\\csc x) = -\\csc x \\cot x',
    '\\frac{d}{dx}(\\arcsin x) = \\frac{1}{\\sqrt{1-x^2}}',
    '\\frac{d}{dx}(\\arccos x) = -\\frac{1}{\\sqrt{1-x^2}}',
    '\\frac{d}{dx}(\\arctan x) = \\frac{1}{1+x^2}',
    '\\frac{d}{dx}(f \\cdot g) = f\'g + fg\'',
    '\\frac{d}{dx}\\left(\\frac{f}{g}\\right) = \\frac{f\'g - fg\'}{g^2}',
    '\\frac{d}{dx}(f(g(x))) = f\'(g(x)) \\cdot g\'(x)',
    '\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C',
    '\\int e^x\\,dx = e^x + C',
    '\\int \\frac{1}{x}\\,dx = \\ln|x| + C',
    '\\int \\sin x\\,dx = -\\cos x + C',
    '\\int \\cos x\\,dx = \\sin x + C',
    '\\int \\sec^2 x\\,dx = \\tan x + C',
    '\\int \\csc^2 x\\,dx = -\\cot x + C',
    '\\int \\sec x \\tan x\\,dx = \\sec x + C',
    '\\int \\csc x \\cot x\\,dx = -\\csc x + C',
    '\\int \\frac{1}{\\sqrt{1-x^2}}\\,dx = \\arcsin x + C',
    '\\int \\frac{1}{1+x^2}\\,dx = \\arctan x + C',
    '\\int \\frac{1}{x^2+a^2}\\,dx = \\frac{1}{a}\\arctan\\frac{x}{a} + C',
    '\\int \\frac{1}{\\sqrt{x^2-a^2}}\\,dx = \\ln|x+\\sqrt{x^2-a^2}| + C',
    '\\int u\\,dv = uv - \\int v\\,du',
    '\\int_{a}^{b} f(x)\\,dx = F(b) - F(a)',
    '\\lim_{x\\to a} \\frac{f(x)-f(a)}{x-a} = f\'(a)',
    '\\lim_{h\\to 0} \\frac{f(x+h)-f(x)}{h} = f\'(x)',
    '\\frac{d}{dx}\\left(\\int_{a}^{x} f(t)\\,dt\\right) = f(x)',
    '\\int_{a}^{b} f(x)g\'(x)\\,dx = f(x)g(x)\\big|_a^b - \\int_{a}^{b} f\'(x)g(x)\\,dx',
    '\\int f(g(x))g\'(x)\\,dx = \\int f(u)\\,du',
    '\\frac{\\partial f}{\\partial x} = \\lim_{h\\to 0} \\frac{f(x+h,y)-f(x,y)}{h}',
    '\\frac{\\partial^2 f}{\\partial x \\partial y} = \\frac{\\partial^2 f}{\\partial y \\partial x}',
    '\\nabla f = \\left(\\frac{\\partial f}{\\partial x}, \\frac{\\partial f}{\\partial y}, \\frac{\\partial f}{\\partial z}\\right)',
    '\\int_C \\vec{F} \\cdot d\\vec{r} = \\int_a^b \\vec{F}(\\vec{r}(t)) \\cdot \\vec{r}\'(t)\\,dt',
    '\\iint_D f(x,y)\\,dA = \\int_a^b \\int_{g_1(x)}^{g_2(x)} f(x,y)\\,dy\\,dx',
    '\\iiint_E f(x,y,z)\\,dV = \\int_a^b \\int_{g_1(x)}^{g_2(x)} \\int_{h_1(x,y)}^{h_2(x,y)} f(x,y,z)\\,dz\\,dy\\,dx'
  ],

  'Parént./Matriz': [
    '\\left(\\square\\right)', '\\left[\\square\\right]', '\\left\\{\\square\\right\\}',
    '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',
    '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}',
    '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}',
    '\\begin{matrix} a & b & c \\\\ d & e & f \\end{matrix}'
  ],

  'Vect/Flechas': [
    '\\vec{v}', '\\overrightarrow{AB}', '\\overleftarrow{CD}',
    '\\nabla', '\\nabla\\cdot\\vec{F}', '\\nabla\\times\\vec{F}'
  ],

  'Prob/Combi': [
    'P(A)', 'P(A\\mid B)', '\\Pr\\,(\\square)', '\\mathbb{E}[X]', '\\operatorname{Var}(X)',
    '\\binom{n}{k}', '\\frac{n!}{k!\\,(n-k)!}', 'n!', '(n-1)!'
  ],

  'Química/H₂O': [
    'H_2O', 'CO_2', 'Na^+', 'Cl^-', 'x^{2+}', 'x^{3-}',
    'H_2SO_4', 'HNO_3', 'HCl', 'NaOH', 'CaCO_3',
    'CH_4', 'C_2H_5OH', 'NH_3', 'H_2O_2',
    'NaCl', 'KCl', 'MgCl_2', 'AlCl_3',
    'pH = -\\log[H^+]',
    'pOH = -\\log[OH^-]',
    'pH + pOH = 14',
    'K_w = [H^+][OH^-] = 1.0 \\times 10^{-14}',
    'K_a = \\frac{[H^+][A^-]}{[HA]}',
    'K_b = \\frac{[OH^-][BH^+]}{[B]}',
    'K_a \\cdot K_b = K_w',
    '\\Delta G = \\Delta H - T\\Delta S',
    '\\Delta G = -RT\\ln K',
    'PV = nRT',
    '\\frac{P_1V_1}{T_1} = \\frac{P_2V_2}{T_2}',
    'C = \\frac{n}{V}',
    'M_1V_1 = M_2V_2',
    '\\Delta H = \\sum H_{products} - \\sum H_{reactants}',
    'q = mc\\Delta T',
    '\\Delta S = \\frac{q_{rev}}{T}',
    'E = E^0 - \\frac{RT}{nF}\\ln Q',
    'E^0 = E^0_{cathode} - E^0_{anode}',
    '\\Delta G^0 = -nFE^0'
  ],

  'Plantillas': [
    '\\frac{\\square}{\\square}', '\\sqrt{\\square}', '\\sqrt[n]{\\square}',
    '\\left(\\square\\right)', '\\left[\\square\\right]', '\\left\\{\\square\\right\\}',
    'a^{\\square}', '\\_{\\square}', '\\lim_{x\\to \\square}',
    '\\sum_{i=\\square}^{\\square} \\square', '\\int_{\\square}^{\\square} \\square\\,dx',
    'x = \\frac{-\\square \\pm \\sqrt{\\square^2-4\\square\\square}}{2\\square}',
    'ax^2 + \\square x + \\square = 0',
    'y = \\square x + \\square',
    'y - \\square = \\square(x - \\square)',
    'd = \\sqrt{(\\square-\\square)^2 + (\\square-\\square)^2}',
    'm = \\frac{\\square - \\square}{\\square - \\square}',
    'A = \\pi \\square^2',
    'V = \\frac{4}{3}\\pi \\square^3',
    'V = \\pi \\square^2 \\square',
    'V = \\frac{1}{3}\\pi \\square^2 \\square',
    'V = \\square \\cdot \\square \\cdot \\square',
    'a^2 + b^2 = c^2',
    'F = \\square \\cdot \\square',
    'E = \\frac{1}{2}\\square \\cdot \\square^2',
    'E = \\square \\cdot \\square \\cdot \\square',
    'v = \\square + \\square \\cdot \\square',
    'x = \\square + \\square \\cdot \\square + \\frac{1}{2}\\square \\cdot \\square^2'
  ],

  'Fórmulas': [
    'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}',
    'ax^2 + bx + c = 0',
    'y = mx + b',
    'y - y_1 = m(x - x_1)',
    'd = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}',
    'm = \\frac{y_2 - y_1}{x_2 - x_1}',
    'A = \\pi r^2',
    'C = 2\\pi r',
    'V = \\frac{4}{3}\\pi r^3',
    'A = 4\\pi r^2',
    'V = \\pi r^2 h',
    'A = 2\\pi r^2 + 2\\pi r h',
    'V = \\frac{1}{3}\\pi r^2 h',
    'A = \\pi r (r + \\sqrt{h^2 + r^2})',
    'V = lwh',
    'A = 2(lw + lh + wh)',
    'V = \\frac{1}{3}Bh',
    'a^2 + b^2 = c^2',
    '\\sin^2\\theta + \\cos^2\\theta = 1',
    '\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}',
    '\\sin(\\alpha \\pm \\beta) = \\sin\\alpha\\cos\\beta \\pm \\cos\\alpha\\sin\\beta',
    '\\cos(\\alpha \\pm \\beta) = \\cos\\alpha\\cos\\beta \\mp \\sin\\alpha\\sin\\beta',
    '\\sin(2\\theta) = 2\\sin\\theta\\cos\\theta',
    '\\cos(2\\theta) = \\cos^2\\theta - \\sin^2\\theta',
    '\\sin^2\\theta = \\frac{1-\\cos(2\\theta)}{2}',
    '\\cos^2\\theta = \\frac{1+\\cos(2\\theta)}{2}'
  ],

  'Física': [
    'F = ma',
    'E = mc^2',
    'E = \\frac{1}{2}mv^2',
    'E = mgh',
    'v = v_0 + at',
    'x = x_0 + v_0t + \\frac{1}{2}at^2',
    'v^2 = v_0^2 + 2a(x-x_0)',
    'F = G\\frac{m_1 m_2}{r^2}',
    'F = k\\frac{q_1 q_2}{r^2}',
    'E = \\frac{F}{q}',
    'V = \\frac{W}{q}',
    'P = IV',
    'R = \\frac{V}{I}',
    'P = \\frac{V^2}{R}',
    'P = I^2 R',
    '\\lambda = \\frac{v}{f}',
    'E = hf',
    'p = mv',
    '\\Delta p = F\\Delta t',
    'W = Fd',
    'P = \\frac{W}{t}',
    '\\tau = rF\\sin\\theta',
    'L = I\\omega',
    'K = \\frac{1}{2}I\\omega^2',
    'T = 2\\pi\\sqrt{\\frac{L}{g}}',
    'T = 2\\pi\\sqrt{\\frac{m}{k}}',
    'f = \\frac{1}{T}',
    '\\omega = 2\\pi f',
    'PV = nRT',
    'Q = mc\\Delta T',
    '\\Delta S = \\frac{Q}{T}',
    '\\eta = \\frac{W_{out}}{Q_{in}}',
    '\\Delta U = Q - W'
  ],

  'Geometría': [
    'A = \\frac{1}{2}bh',
    'A = \\frac{1}{2}ab\\sin C',
    'A = \\sqrt{s(s-a)(s-b)(s-c)}',
    's = \\frac{a+b+c}{2}',
    'A = \\frac{1}{2}(a+b)h',
    'A = \\frac{n}{2} \\cdot r^2 \\sin\\left(\\frac{360°}{n}\\right)',
    'V = \\frac{1}{3}Ah',
    'V = \\frac{4}{3}\\pi r^3',
    'A = 4\\pi r^2',
    'V = \\pi r^2 h',
    'A_{lateral} = 2\\pi r h',
    'A_{total} = 2\\pi r(r+h)',
    'V = \\frac{1}{3}\\pi r^2 h',
    'A_{lateral} = \\pi r l',
    'A_{total} = \\pi r(r+l)',
    'l = \\sqrt{r^2 + h^2}',
    'V = lwh',
    'A = 2(lw + lh + wh)',
    'V = a^3',
    'A = 6a^2',
    'd = a\\sqrt{3}',
    'V = \\frac{1}{3}a^2 h',
    'A_{lateral} = 2al',
    'A_{total} = a^2 + 2al',
    'l = \\sqrt{a^2 + h^2}',
    '\\theta = \\frac{s}{r}',
    'A = \\frac{1}{2}r^2\\theta',
    'A = \\frac{1}{2}r^2(\\theta - \\sin\\theta)'
  ],

  'IPN 2020': [
    // Álgebra IPN
    'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}',
    'ax^2 + bx + c = 0',
    '(a+b)^2 = a^2 + 2ab + b^2',
    '(a-b)^2 = a^2 - 2ab + b^2',
    '(a+b)(a-b) = a^2 - b^2',
    '(a+b)^3 = a^3 + 3a^2b + 3ab^2 + b^3',
    '(a-b)^3 = a^3 - 3a^2b + 3ab^2 - b^3',
    'a^3 + b^3 = (a+b)(a^2-ab+b^2)',
    'a^3 - b^3 = (a-b)(a^2+ab+b^2)',
    '\\log_a(xy) = \\log_a x + \\log_a y',
    '\\log_a\\left(\\frac{x}{y}\\right) = \\log_a x - \\log_a y',
    '\\log_a(x^n) = n\\log_a x',
    '\\log_a a = 1',
    '\\log_a 1 = 0',
    'a^m \\cdot a^n = a^{m+n}',
    '\\frac{a^m}{a^n} = a^{m-n}',
    '(a^m)^n = a^{mn}',
    'a^{-n} = \\frac{1}{a^n}',
    'a^{1/n} = \\sqrt[n]{a}',
    '\\sqrt{a} \\cdot \\sqrt{b} = \\sqrt{ab}',
    '\\frac{\\sqrt{a}}{\\sqrt{b}} = \\sqrt{\\frac{a}{b}}',

    // Geometría IPN
    'a^2 + b^2 = c^2',
    'd = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}',
    'm = \\frac{y_2 - y_1}{x_2 - x_1}',
    'y = mx + b',
    'y - y_1 = m(x - x_1)',
    'A = \\pi r^2',
    'C = 2\\pi r = \\pi d',
    'A = \\frac{1}{2}bh',
    'P = 2(l + w)',
    'A = lw',
    'A = s^2',
    'P = 4s',
    'V = lwh',
    'A = 2(lw + lh + wh)',
    'V = s^3',
    'A = 6s^2',
    'V = \\pi r^2 h',
    'A = 2\\pi r(r + h)',
    'V = \\frac{4}{3}\\pi r^3',
    'A = 4\\pi r^2',
    'V = \\frac{1}{3}\\pi r^2 h',
    'A_{lateral} = \\pi r l',
    'A_{total} = \\pi r(r + l)',

    // Trigonometría IPN
    '\\sin^2\\theta + \\cos^2\\theta = 1',
    '\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}',
    '\\cot\\theta = \\frac{\\cos\\theta}{\\sin\\theta}',
    '\\sec\\theta = \\frac{1}{\\cos\\theta}',
    '\\csc\\theta = \\frac{1}{\\sin\\theta}',
    '\\sin(\\alpha \\pm \\beta) = \\sin\\alpha\\cos\\beta \\pm \\cos\\alpha\\sin\\beta',
    '\\cos(\\alpha \\pm \\beta) = \\cos\\alpha\\cos\\beta \\mp \\sin\\alpha\\sin\\beta',
    '\\tan(\\alpha \\pm \\beta) = \\frac{\\tan\\alpha \\pm \\tan\\beta}{1 \\mp \\tan\\alpha\\tan\\beta}',
    '\\sin(2\\theta) = 2\\sin\\theta\\cos\\theta',
    '\\cos(2\\theta) = \\cos^2\\theta - \\sin^2\\theta',
    '\\cos(2\\theta) = 2\\cos^2\\theta - 1',
    '\\cos(2\\theta) = 1 - 2\\sin^2\\theta',
    '\\tan(2\\theta) = \\frac{2\\tan\\theta}{1 - \\tan^2\\theta}',
    '\\sin^2\\theta = \\frac{1-\\cos(2\\theta)}{2}',
    '\\cos^2\\theta = \\frac{1+\\cos(2\\theta)}{2}',
    '\\sin\\left(\\frac{\\theta}{2}\\right) = \\pm\\sqrt{\\frac{1-\\cos\\theta}{2}}',
    '\\cos\\left(\\frac{\\theta}{2}\\right) = \\pm\\sqrt{\\frac{1+\\cos\\theta}{2}}',
    'a^2 = b^2 + c^2 - 2bc\\cos A',
    '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R',

    // Física IPN - Mecánica
    'F = ma',
    'W = Fd',
    'P = \\frac{W}{t}',
    'E_c = \\frac{1}{2}mv^2',
    'E_p = mgh',
    'E_m = E_c + E_p',
    'v = v_0 + at',
    'x = x_0 + v_0t + \\frac{1}{2}at^2',
    'v^2 = v_0^2 + 2a(x-x_0)',
    'x = \\frac{v_0 + v}{2}t',
    'p = mv',
    '\\Delta p = F\\Delta t',
    'F_c = \\frac{mv^2}{r}',
    'F_g = G\\frac{m_1 m_2}{r^2}',
    '\\tau = rF\\sin\\theta',
    'L = I\\omega',
    'K = \\frac{1}{2}I\\omega^2',

    // Física IPN - Termodinámica
    'PV = nRT',
    '\\frac{P_1V_1}{T_1} = \\frac{P_2V_2}{T_2}',
    'Q = mc\\Delta T',
    'Q = mL',
    '\\Delta U = Q - W',
    '\\eta = \\frac{W_{out}}{Q_{in}}',
    '\\Delta S = \\frac{Q}{T}',

    // Física IPN - Electricidad y Magnetismo
    'F = k\\frac{q_1 q_2}{r^2}',
    'E = \\frac{F}{q}',
    'E = k\\frac{q}{r^2}',
    'V = \\frac{W}{q}',
    'V = k\\frac{q}{r}',
    'C = \\frac{Q}{V}',
    'C = \\frac{\\varepsilon_0 A}{d}',
    'U = \\frac{1}{2}CV^2',
    'I = \\frac{Q}{t}',
    'V = IR',
    'P = IV',
    'P = I^2R',
    'P = \\frac{V^2}{R}',
    'R = \\rho\\frac{L}{A}',
    'R_{eq} = R_1 + R_2 + \\cdots + R_n',
    '\\frac{1}{R_{eq}} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\cdots + \\frac{1}{R_n}',
    'F = qvB\\sin\\theta',
    'F = ILB\\sin\\theta',
    'B = \\frac{\\mu_0 I}{2\\pi r}',
    '\\Phi = BA\\cos\\theta',
    '\\varepsilon = -N\\frac{\\Delta\\Phi}{\\Delta t}',

    // Física IPN - Ondas
    'v = \\lambda f',
    'f = \\frac{1}{T}',
    '\\omega = 2\\pi f',
    'v = \\frac{d}{t}',
    'E = hf',
    '\\lambda = \\frac{h}{p}',
    'T = 2\\pi\\sqrt{\\frac{L}{g}}',
    'T = 2\\pi\\sqrt{\\frac{m}{k}}',
    'f = \\frac{1}{2\\pi}\\sqrt{\\frac{k}{m}}',

    // Química IPN - Estequiometría
    'n = \\frac{m}{M}',
    'M = \\frac{m}{n}',
    'C = \\frac{n}{V}',
    'M_1V_1 = M_2V_2',
    '\\% = \\frac{m_{soluto}}{m_{solución}} \\times 100',
    'ppm = \\frac{m_{soluto}}{m_{solución}} \\times 10^6',
    'X_i = \\frac{n_i}{n_{total}}',
    'P_i = X_i P_{total}',

    // Química IPN - Equilibrio y pH
    'pH = -\\log[H^+]',
    'pOH = -\\log[OH^-]',
    'pH + pOH = 14',
    'K_w = [H^+][OH^-] = 1.0 \\times 10^{-14}',
    'K_a = \\frac{[H^+][A^-]}{[HA]}',
    'K_b = \\frac{[OH^-][BH^+]}{[B]}',
    'K_a \\cdot K_b = K_w',
    'pH = pK_a + \\log\\left(\\frac{[A^-]}{[HA]}\\right)',
    'K_c = \\frac{[C]^c[D]^d}{[A]^a[B]^b}',
    'K_p = K_c(RT)^{\\Delta n}',

    // Química IPN - Termoquímica
    '\\Delta H = \\sum H_{products} - \\sum H_{reactants}',
    '\\Delta G = \\Delta H - T\\Delta S',
    '\\Delta G = -RT\\ln K',
    '\\Delta G^0 = -nFE^0',
    'q = mc\\Delta T',
    '\\Delta S = \\frac{q_{rev}}{T}',

    // Química IPN - Electroquímica
    'E^0 = E^0_{cathode} - E^0_{anode}',
    'E = E^0 - \\frac{RT}{nF}\\ln Q',
    'E = E^0 - \\frac{0.0592}{n}\\log Q',
    '\\Delta G = -nFE',
    'Q = It',
    'm = \\frac{MQ}{nF}',

    // Razonamiento matemático IPN
    '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}',
    '\\sum_{i=1}^{n} i^2 = \\frac{n(n+1)(2n+1)}{6}',
    '\\sum_{i=1}^{n} i^3 = \\left[\\frac{n(n+1)}{2}\\right]^2',
    'a_n = a_1 + (n-1)d',
    'S_n = \\frac{n}{2}(a_1 + a_n)',
    'a_n = a_1 r^{n-1}',
    'S_n = a_1\\frac{1-r^n}{1-r}',
    'S_\\infty = \\frac{a_1}{1-r}',
    '\\binom{n}{r} = \\frac{n!}{r!(n-r)!}',
    'P(n,r) = \\frac{n!}{(n-r)!}',
    'n! = n \\cdot (n-1) \\cdot (n-2) \\cdots 2 \\cdot 1'
  ],
};

/** Extrae los placeholders de una fórmula y genera etiquetas descriptivas */
function extractPlaceholders(formula) {
  const matches = formula.match(/\\square/g);
  if (!matches) return [];

  const count = matches.length;
  const labels = [];

  // Generar etiquetas descriptivas según el tipo de fórmula
  if (formula.includes('x = \\frac{-\\square \\pm \\sqrt{\\square^2-4\\square\\square}}{2\\square}')) {
    return ['Coeficiente b', 'Coeficiente b (en raíz)', 'Coeficiente a', 'Coeficiente c', 'Coeficiente a (denominador)'];
  } else if (formula.includes('x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}')) {
    return ['Coeficiente a', 'Coeficiente b', 'Coeficiente c'];
  } else if (formula.includes('ax^2 + \\square x + \\square = 0')) {
    return ['Coeficiente b', 'Coeficiente c'];
  } else if (formula.includes('ax^2 + bx + c = 0')) {
    return ['Coeficiente a', 'Coeficiente b', 'Coeficiente c'];
  } else if (formula.includes('y = \\square x + \\square')) {
    return ['Pendiente (m)', 'Ordenada al origen (b)'];
  } else if (formula.includes('y = mx + b')) {
    return ['Pendiente (m)', 'Ordenada al origen (b)'];
  } else if (formula.includes('y - \\square = \\square(x - \\square)')) {
    return ['Coordenada y₁', 'Pendiente (m)', 'Coordenada x₁'];
  } else if (formula.includes('y - y_1 = m(x - x_1)')) {
    return ['Coordenada y₁', 'Pendiente (m)', 'Coordenada x₁'];
  } else if (formula.includes('d = \\sqrt{(\\square-\\square)^2 + (\\square-\\square)^2}')) {
    return ['x₂', 'x₁', 'y₂', 'y₁'];
  } else if (formula.includes('d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}')) {
    return ['x₂', 'x₁', 'y₂', 'y₁'];
  } else if (formula.includes('m = \\frac{\\square - \\square}{\\square - \\square}')) {
    return ['y₂', 'y₁', 'x₂', 'x₁'];
  } else if (formula.includes('m = \\frac{y_2 - y_1}{x_2 - x_1}')) {
    return ['y₂', 'y₁', 'x₂', 'x₁'];
  } else if (formula.includes('\\frac{\\square}{\\square}')) {
    return ['Numerador', 'Denominador'];
  } else if (formula.includes('\\sqrt[n]{\\square}')) {
    return ['Índice (n)', 'Radicando'];
  } else if (formula.includes('\\sqrt{\\square}')) {
    return ['Radicando'];
  } else if (formula.includes('x^{\\square}')) {
    return ['Exponente'];
  } else if (formula.includes('_{\\square}')) {
    return ['Subíndice'];
  } else if (formula.includes('\\lim_{x\\to \\square}')) {
    return ['Valor límite'];
  } else if (formula.includes('\\sum_{i=\\square}^{\\square}')) {
    return ['Inicio (i)', 'Fin (n)', 'Término'];
  } else if (formula.includes('\\int_{\\square}^{\\square}')) {
    return ['Límite inferior (a)', 'Límite superior (b)', 'Función'];
  } else if (formula.includes('\\left(\\square\\right)') || formula.includes('\\left[\\square\\right]') || formula.includes('\\left\\{\\square\\right\\}')) {
    return ['Contenido'];
  } else if (formula.includes('a^{\\square}')) {
    return ['Exponente'];
  } else if (formula.includes('\\Pr\\,(\\square)')) {
    return ['Evento'];
  }

  // Etiquetas genéricas
  for (let i = 0; i < count; i++) {
    labels.push(`Valor ${i + 1}`);
  }
  return labels;
}

/** Analiza una fórmula LaTeX y extrae componentes editables */
function parseFormula(formula) {
  const clean = formula.replace(/^\$|\$$/g, '').trim();

  // Fórmula general cuadrática: x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}
  // Patrón más flexible que detecta la estructura general
  // Busca: variable = \frac{-coef \pm \sqrt{coef^2-4coefcoef}}{2coef}
  const quadraticPattern = /^([a-zA-Z])\s*=\s*\\frac\{-([a-zA-Z])\s*\\pm\s*\\sqrt\{([a-zA-Z])\^2-4([a-zA-Z])([a-zA-Z])\}\}\{2([a-zA-Z])\}$/;
  let quadraticMatch = clean.match(quadraticPattern);

  // Si no coincide, intentar sin espacios
  if (!quadraticMatch) {
    quadraticMatch = clean.match(/^([a-zA-Z])=\\frac\{-([a-zA-Z])\\pm\\sqrt\{([a-zA-Z])\^2-4([a-zA-Z])([a-zA-Z])\}\}\{2([a-zA-Z])\}$/);
  }

  if (quadraticMatch) {
    return {
      type: 'quadratic',
      variable: quadraticMatch[1],
      a: quadraticMatch[6], // del denominador 2a
      b: quadraticMatch[2], // del -b
      c: quadraticMatch[5]  // del 4ac (último)
    };
  }

  // Detectar manualmente si tiene la estructura de fórmula cuadrática
  // Buscar: variable = \frac{-... \pm \sqrt{...^2-4...}}{2...}
  if (clean.includes('\\frac') && clean.includes('\\pm') && clean.includes('\\sqrt') && clean.includes('^2-4')) {
    // Extraer los coeficientes manualmente
    const varMatch = clean.match(/^([a-zA-Z])\s*=/);
    const bMatch = clean.match(/-([a-zA-Z])\s*\\pm/);
    const aMatch = clean.match(/\{2([a-zA-Z])\}$/);
    const sqrtMatch = clean.match(/\\sqrt\{([a-zA-Z])\^2-4([a-zA-Z])([a-zA-Z])\}/);

    if (varMatch && bMatch && aMatch && sqrtMatch) {
      return {
        type: 'quadratic',
        variable: varMatch[1],
        a: aMatch[1],
        b: bMatch[1],
        c: sqrtMatch[3] // el último coeficiente en sqrt
      };
    }
  }

  // Ecuación cuadrática: ax^2 + bx + c = 0
  const quadEqMatch = clean.match(/^([a-zA-Z])([a-zA-Z])\^2\s*\+\s*([a-zA-Z])([a-zA-Z])\s*\+\s*([a-zA-Z])\s*=\s*0$/);
  if (quadEqMatch) {
    return {
      type: 'quadraticEq',
      a: quadEqMatch[1],
      aVar: quadEqMatch[2],
      b: quadEqMatch[3],
      bVar: quadEqMatch[4],
      c: quadEqMatch[5]
    };
  }

  // Límite: \lim_{x \to \infty} (opcionalmente seguido de expresión)
  // Ej: \lim_{x \to \infty} \frac{1}{x}
  const limitMatch = clean.match(
    /^\\lim_\{([a-zA-Z]+)\s*\\(?:to|rightarrow)\s*([^}]+)\}\s*(.*)?$/
  );
  if (limitMatch) {
    const expr = (limitMatch[3] || '').trim();
    return {
      type: 'limit',
      variable: limitMatch[1] || 'x',
      to: (limitMatch[2] || '\\infty').trim(),
      expression: expr
    };
  }

  // Regla de la cadena (forma común)
  // Ej: \frac{dy}{dx} = \frac{dy}{du} \frac{du}{dx}
  const chainRulePattern =
    /^\\frac\{d([a-zA-Z]+)\}\{d([a-zA-Z]+)\}\s*=\s*\\frac\{d\1\}\{d([a-zA-Z]+)\}\s*(?:\\cdot\s*)?\\frac\{d\3\}\{d\2\}$/;
  const chainRuleMatch = clean.match(chainRulePattern);
  if (chainRuleMatch) {
    return {
      type: 'chainRule',
      y: chainRuleMatch[1],
      x: chainRuleMatch[2],
      u: chainRuleMatch[3]
    };
  }

  // Patrones comunes para detectar
  // x^2 o x^{2}
  const powerMatch = clean.match(/^([a-zA-Z0-9]+)\^(?:\{([^}]+)\}|([0-9]+))$/);
  if (powerMatch) {
    return {
      type: 'power',
      base: powerMatch[1],
      exponent: powerMatch[2] || powerMatch[3] || '1'
    };
  }

  // \frac{a}{b}
  const fracMatch = clean.match(/^\\frac\{([^}]+)\}\{([^}]+)\}$/);
  if (fracMatch) {
    return {
      type: 'fraction',
      numerator: fracMatch[1],
      denominator: fracMatch[2]
    };
  }

  // \sqrt{x} o \sqrt[n]{x}
  const sqrtMatch = clean.match(/^\\sqrt(?:\[([^\]]+)\])?\{([^}]+)\}$/);
  if (sqrtMatch) {
    return {
      type: 'sqrt',
      index: sqrtMatch[1] || '',
      radicand: sqrtMatch[2]
    };
  }

  // Variable simple: x, y, a, etc.
  const simpleMatch = clean.match(/^([a-zA-Z])$/);
  if (simpleMatch) {
    return {
      type: 'variable',
      value: simpleMatch[1]
    };
  }

  // Número simple
  const numberMatch = clean.match(/^([0-9]+(?:\.[0-9]+)?)$/);
  if (numberMatch) {
    return {
      type: 'number',
      value: numberMatch[1]
    };
  }

  // Expresión compuesta simple: x + y, a - b, etc.
  const sumMatch = clean.match(/^([a-zA-Z0-9]+)\s*([+\-])\s*([a-zA-Z0-9]+)$/);
  if (sumMatch) {
    return {
      type: 'sum',
      left: sumMatch[1],
      operator: sumMatch[2],
      right: sumMatch[3]
    };
  }

  // Integral indefinida: \int f(x) \, dx o \int 2x \, dx o \int 2x dx
  // Detectar el patrón de integral: \int ... d[variable]
  // Usar un enfoque más flexible: buscar todo hasta encontrar d[variable] al final
  if (clean.startsWith('\\int') && /\bd[a-zA-Z]+\s*$/.test(clean)) {
    // Encontrar la posición de "d" seguida de letra al final
    const dMatch = clean.match(/\bd([a-zA-Z]+)\s*$/);
    if (dMatch) {
      // Extraer todo entre \int y d[variable]
      const funcPart = clean.slice(4).replace(/\bd[a-zA-Z]+\s*$/, '').trim();
      // Limpiar espacios extra y \,
      let func = funcPart.replace(/\\,/g, '').trim();
      // Remover espacios múltiples
      func = func.replace(/\s+/g, ' ').trim();
      if (func) {
        return {
          type: 'integral',
          function: func,
          differential: dMatch[1] || 'x'
        };
      }
    }
  }

  // Integral definida: \int_{a}^{b} f(x) \, dx
  const integralDefPattern = /^\\int_\{([^}]+)\}\^\{([^}]+)\}/;
  const integralDefMatch = clean.match(integralDefPattern);
  if (integralDefMatch && /\bd[a-zA-Z]+\s*$/.test(clean)) {
    const lower = integralDefMatch[1];
    const upper = integralDefMatch[2];
    const dMatch = clean.match(/\bd([a-zA-Z]+)\s*$/);
    if (dMatch) {
      // Extraer la función entre los límites y d[variable]
      const afterLimits = clean.slice(integralDefMatch[0].length);
      const funcPart = afterLimits.replace(/\bd[a-zA-Z]+\s*$/, '').trim();
      // Limpiar espacios extra y \,
      let func = funcPart.replace(/\\,/g, '').trim();
      func = func.replace(/\s+/g, ' ').trim();
      if (func) {
        return {
          type: 'integralDef',
          lower: lower,
          upper: upper,
          function: func,
          differential: dMatch[1] || 'x'
        };
      }
    }
  }

  // Si no coincide con ningún patrón conocido, devolver null para modo avanzado
  return null;
}

/** Construye LaTeX a partir de componentes editables */
function buildFormula(components) {
  if (!components) return '';

  switch (components.type) {
    case 'quadratic':
      return `${components.variable} = \\frac{-${components.b} \\pm \\sqrt{${components.b}^2-4${components.a}${components.c}}}{2${components.a}}`;

    case 'quadraticEq':
      return `${components.a}${components.aVar}^2 + ${components.b}${components.bVar} + ${components.c} = 0`;

    case 'power':
      const exp = components.exponent.includes('{') || components.exponent.includes(' ')
        ? `{${components.exponent}}`
        : components.exponent;
      return `${components.base}^${exp}`;

    case 'fraction':
      return `\\frac{${components.numerator}}{${components.denominator}}`;

    case 'sqrt':
      const idx = components.index ? `[${components.index}]` : '';
      return `\\sqrt${idx}{${components.radicand}}`;

    case 'variable':
    case 'number':
      return components.value;

    case 'sum':
      return `${components.left} ${components.operator} ${components.right}`;

    case 'integral':
      const diff = components.differential || 'x';
      return `\\int ${components.function || 'f(x)'} \\, d${diff}`;

    case 'integralDef':
      const diffDef = components.differential || 'x';
      return `\\int_{${components.lower || 'a'}}^{${components.upper || 'b'}} ${components.function || 'f(x)'} \\, d${diffDef}`;

    case 'limit': {
      const v = (components.variable || 'x').trim() || 'x';
      const to = (components.to || '\\infty').trim() || '\\infty';
      const expr = (components.expression || '').trim();
      return expr ? `\\lim_{${v} \\to ${to}} ${expr}` : `\\lim_{${v} \\to ${to}}`;
    }

    case 'chainRule': {
      const y = (components.y || 'y').trim() || 'y';
      const x = (components.x || 'x').trim() || 'x';
      const u = (components.u || 'u').trim() || 'u';
      return `\\frac{d${y}}{d${x}} = \\frac{d${y}}{d${u}} \\frac{d${u}}{d${x}}`;
    }

    default:
      return '';
  }
}

/** Modal para editar una fórmula existente */
export function FormulaEditModal({ open, onClose, formula, onSave }) {
  const [components, setComponents] = useState(null);
  const [useAdvanced, setUseAdvanced] = useState(false);
  const [advancedFormula, setAdvancedFormula] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && formula) {
      const cleanFormula = formula.replace(/^\$|\$$/g, '');
      const parsed = parseFormula(cleanFormula);

      if (parsed) {
        setComponents(parsed);
        setUseAdvanced(false);
      } else {
        setAdvancedFormula(cleanFormula);
        setUseAdvanced(true);
      }
      setError('');
    }
  }, [open, formula]);

  if (!open) return null;

  const handleSave = () => {
    let finalFormula;

    if (useAdvanced) {
      if (!advancedFormula.trim()) {
        setError('La fórmula no puede estar vacía');
        return;
      }
      finalFormula = advancedFormula.trim();
    } else {
      if (!components) {
        setError('Error al procesar la fórmula');
        return;
      }
      finalFormula = buildFormula(components);
    }

    // Agregar delimitadores
    const final = finalFormula.startsWith('$') ? finalFormula : `$${finalFormula}$`;
    onSave(final);
    onClose();
  };

  const updateComponent = (field, value) => {
    setComponents(prev => ({ ...prev, [field]: value }));
  };

  const currentFormula = useAdvanced ? advancedFormula : (components ? buildFormula(components) : '');

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 backdrop-blur-sm px-4 pt-28 pb-6">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl flex flex-col h-[70vh] max-h-[70vh] overflow-hidden border border-slate-200/50">
        <div className="border-b border-slate-200 bg-gradient-to-r from-violet-50/50 to-indigo-50/50 p-5 flex-shrink-0 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Editar fórmula</h3>
              <p className="mt-1.5 text-sm text-slate-600">Modifica los valores de la fórmula matemática</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-white hover:text-slate-700 transition-all hover:scale-110 active:scale-95 border border-slate-200 hover:border-slate-300"
              aria-label="Cerrar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1 min-h-0 bg-gradient-to-b from-white to-slate-50/30">
          {/* Vista previa de la fórmula */}
          <div className="rounded-xl border-2 border-violet-300 bg-gradient-to-br from-violet-50 to-indigo-50 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"></div>
              <p className="text-xs font-bold text-violet-700 uppercase tracking-wider">Vista previa</p>
            </div>
            <div className="text-3xl font-medium text-slate-900 flex items-center justify-center min-h-[70px] bg-white/60 rounded-xl p-4 border border-violet-200/50">
              {currentFormula ? <InlineMath math={currentFormula} /> : <span className="text-slate-400 text-base">Ingresa valores para ver la vista previa</span>}
            </div>
          </div>

          {/* Editor visual según el tipo de fórmula */}
          {!useAdvanced && components && (
            <div className="space-y-4">
              {components.type === 'quadratic' && (
                <>
                  <div className="rounded-xl border-2 border-violet-300 bg-gradient-to-r from-violet-50 to-indigo-50 p-4 mb-4 shadow-sm">
                    <p className="text-xs font-bold text-violet-700 mb-1.5 uppercase tracking-wide">Fórmula general cuadrática</p>
                    <p className="text-xs text-slate-600">Edita los coeficientes de la ecuación cuadrática</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Variable (x) <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      value={components.variable}
                      onChange={(e) => updateComponent('variable', e.target.value)}
                      placeholder="Ej: x, y, t"
                      className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 bg-white hover:border-violet-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Coeficiente a <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      value={components.a}
                      onChange={(e) => updateComponent('a', e.target.value)}
                      placeholder="Ej: a, 1, 2"
                      className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 bg-white hover:border-violet-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Coeficiente b <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      value={components.b}
                      onChange={(e) => updateComponent('b', e.target.value)}
                      placeholder="Ej: b, 3, -5"
                      className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 bg-white hover:border-violet-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Coeficiente c <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      value={components.c}
                      onChange={(e) => updateComponent('c', e.target.value)}
                      placeholder="Ej: c, 2, -7"
                      className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 bg-white hover:border-violet-400"
                    />
                  </div>
                </>
              )}

              {components.type === 'power' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Base <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      value={components.base}
                      onChange={(e) => updateComponent('base', e.target.value)}
                      placeholder="Ej: x, a, 2"
                      className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 bg-white hover:border-violet-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Exponente <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      value={components.exponent}
                      onChange={(e) => updateComponent('exponent', e.target.value)}
                      placeholder="Ej: 2, 3, n"
                      className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 bg-white hover:border-violet-400"
                    />
                  </div>
                </>
              )}

              {components.type === 'fraction' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Numerador (arriba) <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      value={components.numerator}
                      onChange={(e) => updateComponent('numerator', e.target.value)}
                      placeholder="Ej: a, x+1, 2"
                      className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 bg-white hover:border-violet-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Denominador (abajo) <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      value={components.denominator}
                      onChange={(e) => updateComponent('denominator', e.target.value)}
                      placeholder="Ej: b, y-1, 3"
                      className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 bg-white hover:border-violet-400"
                    />
                  </div>
                </>
              )}

              {components.type === 'sqrt' && (
                <>
                  {components.index && (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Índice de la raíz
                      </label>
                      <input
                        type="text"
                        value={components.index}
                        onChange={(e) => updateComponent('index', e.target.value)}
                        placeholder="Ej: 2 (raíz cuadrada), 3 (raíz cúbica)"
                        className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 bg-white hover:border-violet-400"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Valor dentro de la raíz <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      value={components.radicand}
                      onChange={(e) => updateComponent('radicand', e.target.value)}
                      placeholder="Ej: x, a+b, 16"
                      className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 bg-white hover:border-violet-400"
                    />
                  </div>
                </>
              )}

              {components.type === 'variable' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Variable <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    value={components.value}
                    onChange={(e) => updateComponent('value', e.target.value)}
                    placeholder="Ej: x, y, a"
                    className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 bg-white hover:border-violet-400"
                  />
                </div>
              )}

              {components.type === 'number' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Número <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    value={components.value}
                    onChange={(e) => updateComponent('value', e.target.value)}
                    placeholder="Ej: 2, 3.14, 100"
                    className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 bg-white hover:border-violet-400"
                  />
                </div>
              )}

              {components.type === 'sum' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Primer valor <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      value={components.left}
                      onChange={(e) => updateComponent('left', e.target.value)}
                      placeholder="Ej: x, 2, a"
                      className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 bg-white hover:border-violet-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Operador
                    </label>
                    <select
                      value={components.operator}
                      onChange={(e) => updateComponent('operator', e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 bg-white hover:border-violet-400"
                    >
                      <option value="+">+ (Suma)</option>
                      <option value="-">- (Resta)</option>
                      <option value="*">× (Multiplicación)</option>
                      <option value="/">÷ (División)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Segundo valor <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      value={components.right}
                      onChange={(e) => updateComponent('right', e.target.value)}
                      placeholder="Ej: y, 3, b"
                      className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 bg-white hover:border-violet-400"
                    />
                  </div>
                </>
              )}

              {components.type === 'integral' && (
                <>
                  <div className="rounded-xl border-2 border-violet-300 bg-gradient-to-r from-violet-50 to-indigo-50 p-4 mb-4 shadow-sm">
                    <p className="text-xs font-bold text-violet-700 mb-1.5 uppercase tracking-wide">Integral indefinida</p>
                    <p className="text-xs text-slate-600">Edita la función y la variable de integración</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Función a integrar <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      value={components.function}
                      onChange={(e) => updateComponent('function', e.target.value)}
                      placeholder="Ej: 2x, x^2, sin(x), e^x"
                      className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 bg-white hover:border-violet-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Variable de integración <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      value={components.differential}
                      onChange={(e) => updateComponent('differential', e.target.value)}
                      placeholder="Ej: x, y, t"
                      className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 bg-white hover:border-violet-400"
                    />
                  </div>
                </>
              )}

              {components.type === 'integralDef' && (
                <>
                  <div className="rounded-xl border-2 border-violet-300 bg-gradient-to-r from-violet-50 to-indigo-50 p-4 mb-4 shadow-sm">
                    <p className="text-xs font-bold text-violet-700 mb-1.5 uppercase tracking-wide">Integral definida</p>
                    <p className="text-xs text-slate-600">Edita los límites y la función de integración</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Límite inferior (a) <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        value={components.lower}
                        onChange={(e) => updateComponent('lower', e.target.value)}
                        placeholder="Ej: 0, a, -∞"
                        className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 bg-white hover:border-violet-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Límite superior (b) <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        value={components.upper}
                        onChange={(e) => updateComponent('upper', e.target.value)}
                        placeholder="Ej: 1, b, ∞"
                        className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 bg-white hover:border-violet-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Función a integrar <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      value={components.function}
                      onChange={(e) => updateComponent('function', e.target.value)}
                      placeholder="Ej: 2x, x^2, sin(x), e^x"
                      className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 bg-white hover:border-violet-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Variable de integración <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      value={components.differential}
                      onChange={(e) => updateComponent('differential', e.target.value)}
                      placeholder="Ej: x, y, t"
                      className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 bg-white hover:border-violet-400"
                    />
                  </div>
                </>
              )}

              {components.type === 'limit' && (
                <>
                  <div className="rounded-xl border-2 border-violet-300 bg-gradient-to-r from-violet-50 to-indigo-50 p-4 mb-4 shadow-sm">
                    <p className="text-xs font-bold text-violet-700 mb-1.5 uppercase tracking-wide">Límite</p>
                    <p className="text-xs text-slate-600">Edita la variable y hacia dónde tiende (y opcionalmente la expresión)</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Variable <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        value={components.variable}
                        onChange={(e) => updateComponent('variable', e.target.value)}
                        placeholder="Ej: x"
                        className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 bg-white hover:border-violet-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Tiende a <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        value={components.to}
                        onChange={(e) => updateComponent('to', e.target.value)}
                        placeholder="Ej: \\infty, 0, a"
                        className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 bg-white hover:border-violet-400 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Expresión (opcional)
                    </label>
                    <input
                      type="text"
                      value={components.expression}
                      onChange={(e) => updateComponent('expression', e.target.value)}
                      placeholder="Ej: \\frac{1}{x}"
                      className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 bg-white hover:border-violet-400 font-mono"
                    />
                  </div>
                </>
              )}

              {components.type === 'chainRule' && (
                <>
                  <div className="rounded-xl border-2 border-violet-300 bg-gradient-to-r from-violet-50 to-indigo-50 p-4 mb-4 shadow-sm">
                    <p className="text-xs font-bold text-violet-700 mb-1.5 uppercase tracking-wide">Regla de la cadena</p>
                    <p className="text-xs text-slate-600">Edita las variables de derivación: \(y\), \(u\) y \(x\)</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        y <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        value={components.y}
                        onChange={(e) => updateComponent('y', e.target.value)}
                        placeholder="Ej: y"
                        className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 bg-white hover:border-violet-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        u <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        value={components.u}
                        onChange={(e) => updateComponent('u', e.target.value)}
                        placeholder="Ej: u"
                        className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 bg-white hover:border-violet-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        x <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        value={components.x}
                        onChange={(e) => updateComponent('x', e.target.value)}
                        placeholder="Ej: x"
                        className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 bg-white hover:border-violet-400"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Botón para cambiar a modo avanzado */}
              <div className="pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setUseAdvanced(true);
                    setAdvancedFormula(buildFormula(components));
                  }}
                  className="flex items-center gap-2 text-xs text-violet-600 hover:text-violet-700 font-bold transition-all duration-200 hover:gap-3 group"
                >
                  <span>Editar código LaTeX avanzado</span>
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Modo avanzado (editor de LaTeX) */}
          {useAdvanced && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-bold text-slate-700">
                  Editor visual (MathLive) <span className="text-rose-500 font-bold">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const parsed = parseFormula(advancedFormula);
                    if (parsed) {
                      setComponents(parsed);
                      setUseAdvanced(false);
                    }
                  }}
                  className="flex items-center gap-2 text-xs text-violet-600 hover:text-violet-700 font-bold transition-all duration-200 hover:gap-3 group"
                >
                  <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                  <span>Modo visual</span>
                </button>
              </div>
              <MathLiveInput
                value={advancedFormula}
                onChange={(next) => {
                  setAdvancedFormula(next);
                  setError('');
                }}
                className="shadow-sm hover:shadow-md transition-shadow"
                placeholder="Escribe tu fórmula aquí…"
              />

              <details className="mt-3 group">
                <summary className="cursor-pointer select-none text-xs font-bold text-slate-500 hover:text-violet-700 transition-colors flex items-center gap-2">
                  <span className="inline-block transition-transform group-open:rotate-90">▶</span>
                  Ver/editar código LaTeX (texto)
                </summary>
                <div className="mt-2">
                  <textarea
                    value={advancedFormula}
                    onChange={(e) => {
                      setAdvancedFormula(e.target.value);
                      setError('');
                    }}
                    placeholder="LaTeX (opcional)"
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm font-mono focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 bg-white hover:border-violet-300 resize-y min-h-[90px]"
                    rows={4}
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    Esto es opcional (para usuarios avanzados). MathLive siempre guarda LaTeX internamente.
                  </p>
                </div>
              </details>
            </div>
          )}

          {/* Mensaje de error */}
          {error && (
            <div className="rounded-xl border-2 border-rose-300 bg-gradient-to-r from-rose-50 to-rose-100/50 p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                <p className="text-sm font-semibold text-rose-700">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 border-t border-slate-200 bg-gradient-to-r from-slate-50/50 to-white p-5 flex-shrink-0 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border-2 border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 active:scale-95"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-300/50 transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-xl hover:shadow-violet-400/50 flex items-center gap-2"
          >
            <span>Guardar cambios</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/** Modal para ingresar valores en fórmulas con placeholders */
export function PlaceholderModal({ open, onClose, formula, onConfirm }) {
  const [values, setValues] = useState([]);
  const labels = extractPlaceholders(formula);

  useEffect(() => {
    if (open) {
      setValues(new Array(labels.length).fill(''));
    }
  }, [open, labels.length]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    let result = formula;
    let placeholderIndex = 0;

    // Reemplazar cada \square en orden con los valores ingresados
    result = result.replace(/\\square/g, () => {
      const val = values[placeholderIndex] || '?';
      placeholderIndex++;
      return val;
    });

    onConfirm(result);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 backdrop-blur-sm px-4 pt-16 pb-6">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl ring-4 ring-violet-200/30 border-2 border-violet-200/50 h-[600px] max-h-[600px] flex flex-col overflow-hidden">
        <div className="border-b-2 border-violet-200/50 bg-gradient-to-r from-violet-50/80 via-indigo-50/80 to-purple-50/80 p-5 rounded-t-3xl flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg ring-2 ring-violet-200/50">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Completar fórmula</h3>
              <p className="mt-1 text-xs text-slate-600 font-medium">Ingresa los valores necesarios para personalizar la fórmula</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="overflow-y-auto flex-1 min-h-0 p-4 space-y-4 bg-gradient-to-b from-white to-slate-50/30">
            {/* Vista previa única y dinámica */}
            <div className="rounded-2xl border-2 border-violet-300 bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 p-4 shadow-md ring-2 ring-violet-100/50">
              <p className="text-xs font-extrabold text-violet-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></span>
                Vista previa
              </p>
              <div className="text-xl font-medium text-slate-900 flex items-center justify-center min-h-[60px] bg-white/80 rounded-xl p-4 border-2 border-violet-200/50 shadow-sm">
                <InlineMath math={(() => {
                  // Generar vista previa con valores ingresados o placeholders
                  let preview = formula;
                  let placeholderIdx = 0;
                  preview = preview.replace(/\\square/g, () => {
                    const val = values[placeholderIdx] || '□';
                    placeholderIdx++;
                    return val;
                  });
                  return preview;
                })()} />
              </div>
              {/* Indicador de progreso */}
              {values.some(v => v) && (
                <div className="mt-2 pt-2 border-t border-violet-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">
                      {values.filter(v => v).length} de {labels.length}
                    </span>
                    <div className="flex gap-1">
                      {labels.map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-2 h-2 rounded-full transition-all ${values[idx]
                            ? 'bg-violet-500 scale-125'
                            : 'bg-slate-300'
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Campos de entrada */}
            <div className="space-y-3">
              {labels.map((label, idx) => (
                <div key={idx}>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {label} <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    value={values[idx] || ''}
                    onChange={(e) => {
                      const newValues = [...values];
                      newValues[idx] = e.target.value;
                      setValues(newValues);
                    }}
                    placeholder={`Ingresa ${label.toLowerCase()}`}
                    className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 bg-white hover:border-violet-400 shadow-sm hover:shadow-md"
                    required
                    autoFocus={idx === 0}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 p-4 border-t-2 border-violet-200/50 bg-gradient-to-r from-slate-50/50 to-white flex-shrink-0 rounded-b-3xl">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border-2 border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-6 py-2.5 text-sm font-bold text-white hover:from-violet-700 hover:via-indigo-700 hover:to-purple-700 shadow-lg shadow-violet-300/50 transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2 ring-2 ring-violet-200/50 hover:shadow-xl hover:shadow-violet-400/50"
            >
              <span>Insertar</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** Genera un nombre descriptivo para una fórmula */
function getFormulaName(formula) {
  // Fórmulas comunes con nombres descriptivos
  const formulaNames = {
    'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}': 'Fórmula general (cuadrática)',
    'ax^2 + bx + c = 0': 'Ecuación cuadrática',
    'y = mx + b': 'Ecuación de la recta (pendiente-ordenada)',
    'y - y_1 = m(x - x_1)': 'Ecuación punto-pendiente',
    'd = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}': 'Distancia entre dos puntos',
    'm = \\frac{y_2 - y_1}{x_2 - x_1}': 'Pendiente de una recta',
    'A = \\pi r^2': 'Área del círculo',
    'C = 2\\pi r': 'Circunferencia del círculo',
    'V = \\frac{4}{3}\\pi r^3': 'Volumen de la esfera',
    'A = 4\\pi r^2': 'Área de la esfera',
    'V = \\pi r^2 h': 'Volumen del cilindro',
    'A = 2\\pi r^2 + 2\\pi r h': 'Área del cilindro',
    'V = \\frac{1}{3}\\pi r^2 h': 'Volumen del cono',
    'A = \\pi r (r + \\sqrt{h^2 + r^2})': 'Área del cono',
    'V = lwh': 'Volumen del prisma rectangular',
    'A = 2(lw + lh + wh)': 'Área del prisma rectangular',
    'V = \\frac{1}{3}Bh': 'Volumen de la pirámide',
    'a^2 + b^2 = c^2': 'Teorema de Pitágoras',
    '\\sin^2\\theta + \\cos^2\\theta = 1': 'Identidad trigonométrica fundamental',
    '\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}': 'Tangente en términos de seno y coseno',
    '\\sin(\\alpha \\pm \\beta) = \\sin\\alpha\\cos\\beta \\pm \\cos\\alpha\\sin\\beta': 'Suma/resta de senos',
    '\\cos(\\alpha \\pm \\beta) = \\cos\\alpha\\cos\\beta \\mp \\sin\\alpha\\sin\\beta': 'Suma/resta de cosenos',
    '\\sin(2\\theta) = 2\\sin\\theta\\cos\\theta': 'Ángulo doble del seno',
    '\\cos(2\\theta) = \\cos^2\\theta - \\sin^2\\theta': 'Ángulo doble del coseno',
    '(a+b)(a-b) = a^2 - b^2': 'Diferencia de cuadrados',
    'a^2 + 2ab + b^2 = (a+b)^2': 'Cuadrado de la suma',
    'a^2 - 2ab + b^2 = (a-b)^2': 'Cuadrado de la diferencia',
    'a^3 + b^3 = (a+b)(a^2-ab+b^2)': 'Suma de cubos',
    'a^3 - b^3 = (a-b)(a^2+ab+b^2)': 'Diferencia de cubos',
    'F = ma': 'Segunda ley de Newton',
    'E = mc^2': 'Equivalencia masa-energía (Einstein)',
    'E = \\frac{1}{2}mv^2': 'Energía cinética',
    'E = mgh': 'Energía potencial gravitatoria',
    'v = v_0 + at': 'Velocidad final (MRUA)',
    'x = x_0 + v_0t + \\frac{1}{2}at^2': 'Posición (MRUA)',
    'v^2 = v_0^2 + 2a(x-x_0)': 'Ecuación de Torricelli',
    'F = G\\frac{m_1 m_2}{r^2}': 'Ley de gravitación universal',
    'F = k\\frac{q_1 q_2}{r^2}': 'Ley de Coulomb',
    'P = IV': 'Potencia eléctrica',
    'R = \\frac{V}{I}': 'Ley de Ohm',
    'P = \\frac{V^2}{R}': 'Potencia en términos de voltaje',
    'P = I^2 R': 'Potencia en términos de corriente',
    'p = mv': 'Momento lineal',
    'W = Fd': 'Trabajo',
    'P = \\frac{W}{t}': 'Potencia',
    'PV = nRT': 'Ley de los gases ideales',
    'Q = mc\\Delta T': 'Calor específico',
    'pH = -\\log[H^+]': 'pH',
    'pOH = -\\log[OH^-]': 'pOH',
    'pH + pOH = 14': 'Relación pH-pOH',
    'K_a = \\frac{[H^+][A^-]}{[HA]}': 'Constante de acidez',
    'K_b = \\frac{[OH^-][BH^+]}{[B]}': 'Constante de basicidad',
    '\\Delta G = \\Delta H - T\\Delta S': 'Energía libre de Gibbs',
    '\\frac{d}{dx}': 'Derivada',
    '\\frac{d^2}{dx^2}': 'Segunda derivada',
    '\\frac{\\partial}{\\partial x}': 'Derivada parcial',
    '\\int f(x)\\,dx': 'Integral indefinida',
    '\\int_{a}^{b} f(x)\\,dx': 'Integral definida',
    '\\sum_{i=1}^{n} a_i': 'Sumatoria',
    '\\prod_{k=1}^{n} b_k': 'Productoria',
    '\\lim_{x\\to 0}': 'Límite',
    '\\lim_{n\\to\\infty}': 'Límite al infinito',
    '\\frac{d}{dx}(x^n) = nx^{n-1}': 'Regla de la potencia',
    '\\frac{d}{dx}(e^x) = e^x': 'Derivada de exponencial',
    '\\frac{d}{dx}(\\ln x) = \\frac{1}{x}': 'Derivada del logaritmo natural',
    '\\frac{d}{dx}(\\sin x) = \\cos x': 'Derivada del seno',
    '\\frac{d}{dx}(\\cos x) = -\\sin x': 'Derivada del coseno',
    '\\frac{d}{dx}(\\tan x) = \\sec^2 x': 'Derivada de la tangente',
    '\\frac{d}{dx}(f \\cdot g) = f\'g + fg\'': 'Regla del producto',
    '\\frac{d}{dx}\\left(\\frac{f}{g}\\right) = \\frac{f\'g - fg\'}{g^2}': 'Regla del cociente',
    '\\frac{d}{dx}(f(g(x))) = f\'(g(x)) \\cdot g\'(x)': 'Regla de la cadena',
    '\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C': 'Integral de potencia',
    '\\int e^x\\,dx = e^x + C': 'Integral de exponencial',
    '\\int \\frac{1}{x}\\,dx = \\ln|x| + C': 'Integral de 1/x',
    '\\int \\sin x\\,dx = -\\cos x + C': 'Integral del seno',
    '\\int \\cos x\\,dx = \\sin x + C': 'Integral del coseno',
    '\\int u\\,dv = uv - \\int v\\,du': 'Integración por partes',
    '\\int_{a}^{b} f(x)\\,dx = F(b) - F(a)': 'Teorema fundamental del cálculo',
    '\\lim_{h\\to 0} \\frac{f(x+h)-f(x)}{h} = f\'(x)': 'Definición de derivada',
    '\\frac{d}{dx}\\left(\\int_{a}^{x} f(t)\\,dt\\right) = f(x)': 'Teorema fundamental del cálculo (parte 1)',
    '\\int f(g(x))g\'(x)\\,dx = \\int f(u)\\,du': 'Integración por sustitución',
    '\\iint_D f(x,y)\\,dA': 'Integral doble',
    '\\iiint_E f(x,y,z)\\,dV': 'Integral triple',
    '\\oint\\,': 'Integral de línea cerrada',
  };

  // Si tiene un nombre específico, retornarlo
  if (formulaNames[formula]) {
    return formulaNames[formula];
  }

  // Si tiene placeholders, indicarlo
  if (formula.includes('\\square')) {
    return 'Fórmula con parámetros (requiere valores)';
  }

  // Para fórmulas simples, generar un nombre básico
  if (formula.length < 10) {
    return formula;
  }

  // Para fórmulas largas, intentar extraer información útil
  if (formula.includes('\\frac')) return 'Fracción';
  if (formula.includes('\\sqrt')) return 'Raíz';
  if (formula.includes('^')) return 'Potencia';
  if (formula.includes('\\sin') || formula.includes('\\cos') || formula.includes('\\tan')) return 'Función trigonométrica';
  if (formula.includes('\\log') || formula.includes('\\ln')) return 'Logaritmo';
  if (formula.includes('\\int')) return 'Integral';
  if (formula.includes('\\sum')) return 'Sumatoria';
  if (formula.includes('\\lim')) return 'Límite';
  if (formula.includes('\\frac{d}{dx}') || formula.includes('\\partial')) return 'Derivada';

  return 'Fórmula matemática';
}

/** Modal con la paleta mejorada - más visual e intuitivo */
export default function MathPalette({ open, onClose, onPick, initialFormula }) {
  const [tab, setTab] = useState("Básico");
  const [selectedFormula, setSelectedFormula] = useState(null);
  // Fórmula editable universal: sirve tanto para “desde cero” como para “plantilla”
  const [editableFormula, setEditableFormula] = useState('');
  const [placeholderModal, setPlaceholderModal] = useState({ open: false, formula: '' });
  const [formulasFromDB, setFormulasFromDB] = useState(null);
  const [loadingFormulas, setLoadingFormulas] = useState(false);
  const [errorFormulas, setErrorFormulas] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Cargar fórmulas desde la API cuando se abre el modal
  useEffect(() => {
    if (open && !formulasFromDB && !loadingFormulas) {
      setLoadingFormulas(true);
      setErrorFormulas(null);
      axios.get('/formulas')
        .then(response => {
          const grouped = response.data;
          // Convertir el objeto agrupado a arrays de fórmulas (solo latex)
          const sections = {};
          Object.keys(grouped).forEach(category => {
            sections[category] = grouped[category].map(f => f.latex);
          });
          setFormulasFromDB(sections);
          setLoadingFormulas(false);
        })
        .catch(error => {
          setErrorFormulas(error.message);
          setFormulasFromDB(null); // Usar SECTIONS como fallback
          setLoadingFormulas(false);
        });
    }
  }, [open, formulasFromDB, loadingFormulas]);

  // Usar fórmulas de la BD si están disponibles, sino usar SECTIONS como fallback
  const SECTIONS_TO_USE = formulasFromDB || SECTIONS;

  useEffect(() => {
    if (open) {
      if (initialFormula) {
        // Si hay una fórmula inicial (editando), buscar en qué categoría está
        let foundTab = "Básico";
        for (const [category, formulas] of Object.entries(SECTIONS_TO_USE)) {
          if (formulas.includes(initialFormula)) {
            foundTab = category;
            break;
          }
        }
        setTab(foundTab);
        setSelectedFormula(initialFormula);
        setEditableFormula(initialFormula);
      } else {
        setTab("Básico");
        setSelectedFormula(null);
        setEditableFormula('');
      }
      setPlaceholderModal({ open: false, formula: '' });
      setSearchQuery('');
    }
  }, [open, initialFormula, SECTIONS_TO_USE]);

  // Filtrar fórmulas según la búsqueda
  const filteredFormulas = searchQuery.trim()
    ? (SECTIONS_TO_USE[tab] || []).filter(formula => {
      const formulaName = getFormulaName(formula).toLowerCase();
      const formulaCode = formula.toLowerCase();
      const query = searchQuery.toLowerCase();
      return formulaName.includes(query) || formulaCode.includes(query);
    })
    : (SECTIONS_TO_USE[tab] || []);

  const handleFormulaClick = (formula) => {
    // Solo mostrar la fórmula seleccionada en la vista previa (no insertar aún)
    setSelectedFormula(formula);
    setEditableFormula(formula);
  };

  const handleInsertFormula = () => {
    const formulaToUse = (editableFormula || selectedFormula || '').trim();
    if (!formulaToUse) return;

    // Verificar si la fórmula tiene placeholders
    if (formulaToUse.includes('\\square')) {
      // Para placeholders mantenemos el flujo existente
      setPlaceholderModal({ open: true, formula: formulaToUse });
    } else {
      // Insertar directamente si no tiene placeholders
      onPick(`$${formulaToUse}$`);
      setSelectedFormula(null);
      setEditableFormula('');
    }
  };

  const handlePlaceholderConfirm = (completedFormula) => {
    onPick(`$${completedFormula}$`);
    setPlaceholderModal({ open: false, formula: '' });
    setSelectedFormula(null);
    setEditableFormula('');
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Insertar fórmula matemática">
      <div className="space-y-5">
        {/* Barra de búsqueda */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar fórmulas por nombre o código LaTeX..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-violet-200 bg-white text-sm font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 shadow-sm hover:shadow-md"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Campo en blanco (opción 1): Editor visual universal */}
        <div className="rounded-3xl border-2 border-violet-200 bg-gradient-to-br from-violet-50/70 via-indigo-50/40 to-white p-5 shadow-md ring-2 ring-violet-100/50">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-xs font-extrabold text-violet-700 uppercase tracking-widest">
                Editor visual (MathLive)
              </p>
              <p className="mt-1 text-xs text-slate-600 font-medium">
                Escribe desde cero o carga una plantilla de abajo para ajustarla aquí.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditableFormula('');
                  setSelectedFormula(null);
                }}
                className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={handleInsertFormula}
                disabled={!String(editableFormula || '').trim()}
                className="rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-4 py-2 text-xs font-extrabold text-white shadow-lg shadow-violet-300/50 transition-all hover:from-violet-700 hover:via-indigo-700 hover:to-purple-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Insertar lo escrito
              </button>
            </div>
          </div>
          <MathLiveInput
            value={editableFormula}
            onChange={(v) => {
              setEditableFormula(v);
              // si el usuario edita manualmente, dejamos la selección como “contexto” pero ya no depende de ella
            }}
            className="bg-white/70 rounded-2xl"
            placeholder="Ej: \\frac{1}{2}gt^2, \\int_0^1 x^2\\,dx, F=ma ..."
          />
          <div className="mt-3 text-[11px] text-slate-500">
            **Opción 2 (plantillas):** baja y elige una fórmula; se cargará aquí para editarla.
          </div>
        </div>

        {/* Tabs de categorías - mejor diseño */}
        <div className="sticky top-0 z-10 bg-white pb-3 border-b-2 border-violet-200/50 -mx-4 px-4 pt-2 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-extrabold text-violet-700 uppercase tracking-widest">Categorías</p>
            {loadingFormulas && (
              <div className="text-xs text-violet-600 font-medium italic">Cargando fórmulas...</div>
            )}
            {errorFormulas && !loadingFormulas && (
              <div className="text-xs text-amber-600 font-medium italic">Usando fórmulas por defecto</div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {Object.keys(SECTIONS_TO_USE).map((label) => (
              <button
                key={label}
                onClick={() => {
                  setTab(label);
                  setSelectedFormula(null);
                  setSearchQuery('');
                }}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 transform ${tab === label
                  ? "bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-violet-300/50 scale-105 ring-2 ring-violet-200/50"
                  : "bg-slate-100 text-slate-600 hover:bg-gradient-to-r hover:from-violet-50 hover:to-indigo-50 hover:text-violet-700 hover:scale-105 active:scale-95 border-2 border-slate-200 hover:border-violet-300 shadow-sm hover:shadow-md"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Vista previa de fórmula seleccionada - solo al hacer click */}
        {selectedFormula && (
          <div className="rounded-3xl border-2 border-violet-400 bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 p-6 shadow-xl shadow-violet-200/50 ring-4 ring-violet-200/30 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"></div>
                  <p className="text-xs font-bold text-violet-700 uppercase tracking-wider">Fórmula seleccionada</p>
                </div>
                <div className="text-3xl font-medium text-slate-900 mb-3 flex items-center justify-center min-h-[60px] bg-white/60 rounded-xl p-4 border border-violet-200/50">
                  <InlineMath math={editableFormula || selectedFormula} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 bg-white/80 px-3 py-2 rounded-lg border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide mb-1">Código LaTeX</p>
                    <p className="text-xs text-slate-700 font-mono break-all">
                      {editableFormula || selectedFormula}
                    </p>
                  </div>
                </div>

                {/* Editor visual para ajustar plantillas sin escribir LaTeX */}
                {!selectedFormula.includes('\\square') && (
                  <div className="mt-3">
                    <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-2">
                      Editor visual (MathLive) — también se carga arriba
                    </p>
                    <MathLiveInput
                      value={editableFormula}
                      onChange={setEditableFormula}
                      className="bg-white/70 rounded-xl"
                      placeholder="Ajusta la fórmula aquí…"
                    />
                  </div>
                )}
                {selectedFormula.includes('\\square') && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-100/80 border border-amber-300/50 px-3 py-2">
                    <span className="text-base">⚙</span>
                    <p className="text-xs text-amber-800 font-semibold">
                      Esta fórmula requiere que ingreses valores personalizados
                    </p>
                  </div>
                )}
                <p className="mt-3 text-xs text-slate-600 font-medium">
                  📝 {getFormulaName(selectedFormula)}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedFormula(null);
                  setEditableFormula('');
                }}
                className="ml-3 rounded-xl p-2 text-slate-400 hover:bg-white hover:text-slate-700 transition-all hover:scale-110 active:scale-95 border border-slate-200 hover:border-slate-300"
                title="Cerrar vista previa"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <button
              onClick={handleInsertFormula}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-6 py-3.5 text-sm font-bold text-white hover:from-violet-700 hover:via-indigo-700 hover:to-purple-700 shadow-lg shadow-violet-300/50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl hover:shadow-violet-400/50 flex items-center justify-center gap-2 ring-2 ring-violet-200/50"
            >
              <span>{selectedFormula.includes('\\square') ? '📝 Completar e Insertar' : '✨ Insertar Fórmula'}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        )}

        {/* Grid de fórmulas - más grande y visual */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-extrabold text-violet-700 uppercase tracking-widest">
              {searchQuery ? `Resultados de búsqueda` : `Selecciona una fórmula`}
            </p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-xs font-bold ring-2 ring-violet-200 shadow-md">
              <span className="opacity-90">{filteredFormulas.length}</span>
              <span className="opacity-90">fórmulas</span>
            </span>
          </div>
          {filteredFormulas.length === 0 ? (
            <div className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100/50 p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 mb-4 ring-4 ring-violet-200/50">
                <svg className="w-8 h-8 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-slate-700 mb-1">No se encontraron fórmulas</p>
              <p className="text-xs text-slate-500">Intenta con otros términos de búsqueda o selecciona otra categoría</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4">
              {filteredFormulas.map((tok, i) => {
                const hasPlaceholders = tok.includes('\\square');
                // Detectar fórmulas largas o complejas
                const isLongFormula = tok.length > 30 ||
                  tok.includes('\\frac{-b') ||
                  tok.includes('a^3 + b^3') ||
                  tok.includes('a^3 - b^3') ||
                  tok.includes('a^2 + 2ab') ||
                  tok.includes('a^2 - 2ab') ||
                  tok.includes('\\Rightarrow') ||
                  (tok.includes('\\frac') && tok.length > 20);
                // Fórmulas muy largas que necesitan tamaño extra pequeño
                const isVeryLongFormula = tok.length > 40 ||
                  tok.includes('a^3 + b^3') ||
                  tok.includes('a^3 - b^3') ||
                  tok.includes('\\frac{-b');
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleFormulaClick(tok);
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      // Prevenir el comportamiento por defecto para evitar selección
                      e.preventDefault();
                    }}
                    className={`group relative rounded-2xl border-2 p-3 sm:p-3.5 transition-all duration-200 transform select-none cursor-pointer backdrop-blur-sm ${selectedFormula === tok
                      ? hasPlaceholders
                        ? 'border-amber-500 bg-gradient-to-br from-amber-100 via-amber-50 to-amber-100 ring-4 ring-amber-200/50 shadow-xl shadow-amber-300/50 scale-105 z-10'
                        : 'border-violet-500 bg-gradient-to-br from-violet-100 via-indigo-50 to-purple-50 ring-4 ring-violet-200/50 shadow-xl shadow-violet-300/50 scale-105 z-10'
                      : hasPlaceholders
                        ? 'border-amber-200/80 bg-gradient-to-br from-amber-50/80 to-amber-100/40 hover:border-amber-400 hover:bg-gradient-to-br hover:from-amber-100 hover:via-amber-50 hover:to-amber-100 active:scale-95 hover:scale-105 hover:shadow-lg hover:shadow-amber-200/50 active:bg-amber-200'
                        : 'border-slate-200/80 bg-white hover:border-violet-400 hover:bg-gradient-to-br hover:from-violet-50/80 hover:via-indigo-50/40 hover:to-purple-50/40 active:scale-95 hover:scale-105 hover:shadow-lg hover:shadow-violet-200/50 active:bg-violet-100'
                      }`}
                    title={hasPlaceholders ? `${getFormulaName(tok)} - Haz clic para completar valores` : getFormulaName(tok)}
                  >
                    <div className={`font-medium text-slate-800 flex items-center justify-center min-h-[50px] sm:min-h-[55px] max-h-[80px] sm:max-h-[90px] overflow-hidden pointer-events-none ${isVeryLongFormula ? 'text-[10px] sm:text-xs' : isLongFormula ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'}`}>
                      <div className="w-full text-center px-1">
                        <InlineMath math={tok} />
                      </div>
                    </div>
                    {hasPlaceholders && (
                      <div className="absolute top-2 right-2 pointer-events-none">
                        <span className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 w-6 h-6 text-xs font-bold text-white shadow-lg border-2 border-amber-400 ring-2 ring-amber-200/50">
                          ⚙
                        </span>
                      </div>
                    )}
                    {selectedFormula === tok && (
                      <div className="absolute top-2 left-2 pointer-events-none">
                        <span className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-600 w-6 h-6 text-xs font-bold text-white shadow-lg ring-2 ring-violet-200/50">
                          ✓
                        </span>
                      </div>
                    )}
                    {/* Hover effect overlay */}
                    <div className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-200 ${selectedFormula === tok ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
                      } ${hasPlaceholders ? 'bg-amber-500/5' : 'bg-violet-500/5'}`}></div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Ayuda */}
        <div className="rounded-2xl border-2 border-violet-200/80 bg-gradient-to-r from-violet-50/80 via-indigo-50/80 to-purple-50/80 p-5 shadow-md ring-2 ring-violet-100/50">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg ring-2 ring-violet-200/50">
              <span className="text-lg">💡</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-extrabold text-violet-700 mb-2 uppercase tracking-widest">Consejo</p>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                Haz clic en cualquier fórmula para ver una vista previa detallada y seleccionarla. Las fórmulas marcadas con ⚙ requieren que ingreses valores personalizados antes de insertarlas. Usa la barra de búsqueda para encontrar fórmulas rápidamente.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para fórmulas con placeholders */}
      <PlaceholderModal
        open={placeholderModal.open}
        onClose={() => setPlaceholderModal({ open: false, formula: '' })}
        formula={placeholderModal.formula}
        onConfirm={handlePlaceholderConfirm}
      />
    </Modal>
  );
}

