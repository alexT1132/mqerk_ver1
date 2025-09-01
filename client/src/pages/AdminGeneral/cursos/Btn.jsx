export default function CreateButton({
  label = "Crear curso",
  onClick,
  className = "",
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex items-center gap-2 rounded-full",
        "px-3 py-2 sm:px-4 sm:py-2",
        "bg-white text-gray-900 ring-1 ring-gray-300 shadow",
        "hover:ring-gray-400 hover:shadow-md active:scale-[.98]",
        "transition focus:outline-none focus-visible:ring-2 focus-visible:ring-black/50",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
    >
      <span className="grid place-items-center rounded-full bg-gradient-to-r from-indigo-700 via-violet-700 to-fuchsia-700 text-white size-8 sm:size-9">
        <svg viewBox="0 0 24 24" className="size-4 sm:size-5" aria-hidden="true">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </span>
      <span className="hidden sm:inline text-base font-medium">{label}</span>
    </button>
  );
}