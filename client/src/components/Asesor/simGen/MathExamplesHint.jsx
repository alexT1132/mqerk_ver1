import React from "react";
import InlineMath from "./InlineMath.jsx";

export default function MathExamplesHint({ className = "" }) {
  return (
    <p className={`mt-1 text-xs text-slate-500 leading-relaxed ${className}`} style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
      Ejemplos: <InlineMath math={"\\sqrt{x}"} />, <InlineMath math={"\\frac{a}{b}"} />, <InlineMath math={"x_i"} />, <InlineMath math={"\\sum_{i=1}^{n} a_i"} />. Inserta con el botón de la calculadora y usa Tab/Shift+Tab para saltar entre los cuadros (□) editables.
    </p>
  );
}
