import * as Formulas from '../models/formulas.model.js';

// Convertir SECTIONS a formato para la BD
const SECTIONS = {
  'Básico': [
    'x^2', 'x_i', '\\sqrt{x}', '\\sqrt[n]{x}',
    '\\frac{a}{b}', '\\cdot', '\\times', '\\div',
    '\\pm', '\\mp', '\\dots', '\\ldots', '\\cdots',
    '\\overline{AB}', '\\hat{\\theta}', '\\vec{v}', '^{\\circ}',
  ],

  'Griego': [
    '\\alpha','\\beta','\\gamma','\\delta','\\epsilon','\\zeta','\\eta','\\theta',
    '\\iota','\\kappa','\\lambda','\\mu','\\nu','\\xi','\\pi','\\rho','\\sigma',
    '\\tau','\\upsilon','\\phi','\\chi','\\psi','\\omega',
    '\\Gamma','\\Delta','\\Theta','\\Lambda','\\Xi','\\Pi','\\Sigma','\\Upsilon','\\Phi','\\Psi','\\Omega'
  ],

  'ABΓ (Conj.)': [
    '\\mathbb{N}','\\mathbb{Z}','\\mathbb{Q}','\\mathbb{R}','\\mathbb{C}',
    '\\mathcal{A}','\\mathcal{B}','\\mathcal{L}','\\mathcal{F}',
    '\\subset','\\subseteq','\\supset','\\supseteq','\\in','\\notin',
    '\\cup','\\cap','\\setminus','\\varnothing'
  ],

  'Trig': [
    '\\sin','\\cos','\\tan','\\cot','\\sec','\\csc',
    '\\arcsin','\\arccos','\\arctan',
    '\\sin^{-1}','\\cos^{-1}','\\tan^{-1}'
  ],

  'Rel/Op': [
    '\\le','\\ge','<','>','\\neq','\\approx','\\equiv','\\propto',
    '\\to','\\Rightarrow','\\Leftarrow','\\Leftrightarrow',
    '\\parallel','\\perp','\\angle','\\measuredangle'
  ],

  'Álgebra': [
    '\\log','\\ln','e^{x}','a^{b}','x^{\\square}','_{\\square}',
    '(x+1)^2','(a-b)^2','(a+b)^3','(a-b)^3',
    '\\sqrt{\\square}','\\sqrt[n]{\\square}',
    '\\binom{n}{k}','\\choose','\\gcd','\\operatorname{lcm}',
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
    '\\sum_{i=1}^{n} a_i','\\prod_{k=1}^{n} b_k',
    '\\int f(x)\\,dx','\\int_{a}^{b} f(x)\\,dx',
    '\\int \\square\\,dx','\\int_{\\square}^{\\square} \\square\\,dx',
    '\\int x^{\\square}\\,dx','\\int e^{\\square}\\,dx',
    '\\int \\sin(\\square)\\,dx','\\int \\cos(\\square)\\,dx',
    '\\int \\frac{1}{\\square}\\,dx','\\int \\ln(\\square)\\,dx',
    '\\iint\\, dA','\\iiint\\, dV','\\oint\\,',
    '\\lim_{x\\to 0}','\\lim_{n\\to\\infty}',
    '\\lim_{x\\to \\square}','\\lim_{x\\to \\square} \\frac{\\square}{\\square}',
    '\\frac{d}{dx}','\\frac{d^2}{dx^2}',
    '\\frac{d}{dx}(\\square)','\\frac{d^2}{dx^2}(\\square)',
    '\\frac{\\partial}{\\partial x}','\\frac{\\partial^2}{\\partial x^2}',
    '\\frac{\\partial}{\\partial x}(\\square)','\\frac{\\partial}{\\partial y}(\\square)',
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
    '\\left(\\square\\right)','\\left[\\square\\right]','\\left\\{\\square\\right\\}',
    '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',
    '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}',
    '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}',
    '\\begin{matrix} a & b & c \\\\ d & e & f \\end{matrix}'
  ],

  'Vect/Flechas': [
    '\\vec{v}','\\overrightarrow{AB}','\\overleftarrow{CD}',
    '\\nabla','\\nabla\\cdot\\vec{F}','\\nabla\\times\\vec{F}'
  ],

  'Prob/Combi': [
    'P(A)','P(A\\mid B)','\\Pr\\,(\\square)','\\mathbb{E}[X]','\\operatorname{Var}(X)',
    '\\binom{n}{k}','\\frac{n!}{k!\\,(n-k)!}','n!','(n-1)!'
  ],

  'Química/H₂O': [
    'H_2O','CO_2','Na^+','Cl^-','x^{2+}','x^{3-}',
    'H_2SO_4','HNO_3','HCl','NaOH','CaCO_3',
    'CH_4','C_2H_5OH','NH_3','H_2O_2',
    'NaCl','KCl','MgCl_2','AlCl_3',
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
    '\\frac{\\square}{\\square}','\\sqrt{\\square}','\\sqrt[n]{\\square}',
    '\\left(\\square\\right)','\\left[\\square\\right]','\\left\\{\\square\\right\\}',
    'a^{\\square}','\\_{\\square}','\\lim_{x\\to \\square}',
    '\\sum_{i=\\square}^{\\square} \\square','\\int_{\\square}^{\\square} \\square\\,dx',
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

async function seedFormulas() {
  console.log('🌱 Iniciando seed de fórmulas...');
  
  try {
    const allFormulas = [];

    // Convertir SECTIONS a formato para la BD
    for (const [categoria, formulas] of Object.entries(SECTIONS)) {
      let orden = 0;
      for (const latex of formulas) {
        allFormulas.push({
          categoria,
          nombre: null, // Se puede agregar después
          latex,
          descripcion: null,
          orden: orden++,
          activo: true
        });
      }
    }

    console.log(`📊 Total de fórmulas a insertar: ${allFormulas.length}`);
    console.log(`📁 Categorías: ${Object.keys(SECTIONS).join(', ')}`);

    // Insertar en lotes para mejor rendimiento
    const batchSize = 100;
    let inserted = 0;

    for (let i = 0; i < allFormulas.length; i += batchSize) {
      const batch = allFormulas.slice(i, i + batchSize);
      const result = await Formulas.bulkCreateFormulas(batch);
      inserted += result.length;
      console.log(`✅ Insertadas ${inserted}/${allFormulas.length} fórmulas...`);
    }

    console.log(`✨ Seed completado! ${inserted} fórmulas insertadas.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
}

seedFormulas();

