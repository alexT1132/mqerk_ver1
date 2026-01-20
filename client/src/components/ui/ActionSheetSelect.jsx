import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Reusable Action Sheet Select for mobile
// Props:
// - value: string | any
// - onChange: (val) => void
// - options: Array<{ value: string, label: string }>
// - placeholder?: string
// - id?: string
// - title?: string (optional header text)
// - cancelText?: string
// - disabled?: boolean
// - className?: string (applied to the trigger button)
export default function ActionSheetSelect({
  value,
  onChange,
  options,
  placeholder = "Selecciona una opción",
  id,
  title,
  cancelText = "Cancelar",
  disabled = false,
  className = "",
  // Controlled open (optional). If provided, component behaves as controlled.
  open: openProp,
  onOpenChange,
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = typeof openProp === 'boolean';
  const open = isControlled ? openProp : internalOpen;
  const [dragY, setDragY] = useState(0);
  const [startY, setStartY] = useState(null);
  const sheetRef = useRef(null);
  const openerRef = useRef(null);
  const visibleOptions = (options || []).filter((o) => o && o.value !== "");

  // Prevent body scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeSheet();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Restore focus to opener when closing
  useEffect(() => {
    if (!open && openerRef.current) {
      try {
        openerRef.current.focus();
      } catch {}
    }
  }, [open]);

  const onTouchStart = (e) => {
    setStartY(e.touches[0].clientY);
    setDragY(0);
  };
  const onTouchMove = (e) => {
    if (startY == null) return;
    const dy = e.touches[0].clientY - startY;
    setDragY(dy > 0 ? dy : 0);
  };
  const onTouchEnd = () => {
    if (dragY > 80) {
      closeSheet();
    }
    setDragY(0);
    setStartY(null);
  };

  const sheetStyle = dragY > 0 ? { transform: `translateY(${dragY}px)` } : undefined;

  const openSheet = () => {
    if (isControlled) onOpenChange?.(true); else setInternalOpen(true);
  };
  const closeSheet = () => {
    if (isControlled) onOpenChange?.(false); else setInternalOpen(false);
  };

  const selected = (options || []).find((o) => o.value === value);

  return (
    <div className="relative mt-2">
      <button
        id={id}
        type="button"
        onClick={openSheet}
        disabled={disabled}
        className={
          "p-3 w-full border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between " +
          className
        }
        ref={openerRef}
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {selected?.label || placeholder}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-500">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
        </svg>
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[10000]" role="dialog" aria-modal="true">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50" onClick={closeSheet} />
            {/* Bottom sheet */}
            <div
              ref={sheetRef}
              className="absolute left-0 right-0 bottom-0 bg-white rounded-t-2xl shadow-xl p-2 pb-4 will-change-transform"
              style={sheetStyle}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div className="h-1 w-10 bg-gray-300 rounded-full mx-auto my-2" aria-hidden="true" />
              {(title || placeholder) && (
                <div className="px-4 pb-2 text-sm text-gray-500">{title || placeholder}</div>
              )}
              <ul className="max-h-80 overflow-auto">
                {visibleOptions.map((opt) => {
                  const sel = opt.value === value;
                  return (
                    <li key={opt.value}>
                      <button
                        type="button"
                        onClick={() => {
                          onChange?.(opt.value);
                          closeSheet();
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 ${sel ? "bg-blue-50 text-blue-700" : "text-gray-900"} hover:bg-blue-50`}
                      >
                        <span>{opt.label}</span>
                        {sel && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M2.25 12a9.75 9.75 0 1119.5 0 9.75 9.75 0 01-19.5 0zm14.28-1.78a.75.75 0 00-1.06-1.06l-4.72 4.72-2.22-2.22a.75.75 0 10-1.06 1.06l2.75 2.75a.75.75 0 001.06 0l5.25-5.25z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="px-4 pt-2">
                <button type="button" onClick={closeSheet} className="w-full mt-2 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50">
                  {cancelText}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
