import ModeloDesktop from "../../assets/mqerk/modelo.png";
import ModeloMovile from "../../assets/mqerk/modeloPhone.png";

export default function HeroDeviceImage({
  title = "Modelo Educativo Disruptivo y Sostenible",
  images = { desktop: ModeloDesktop, tablet: ModeloDesktop, mobile: ModeloMovile },
  alt = "",
  className = "",
}) {
  return (
    <section className={`py-10 sm:py-12 lg:py-16 ${className}`}>
      <div className="mx-auto max-w-7xl px-4">
        {/* Título */}
        <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#F4138A]">
          {title}
        </h2>

        {/* Imagen responsiva */}
        <div>
          <div className="relative w-[95vw] left-1/2 -translate-x-1/2">
            <picture>
                {/* Desktop (>=1024px) */}
                {images.desktop && (
                <source media="(min-width: 1024px)" srcSet={images.desktop} />
                )}
                {/* Tablet (>=640px) */}
                {images.tablet && (
                <source media="(min-width: 640px)" srcSet={images.tablet} />
                )}
                {/* Mobile (default) */}
                <img
                src={images.mobile || images.tablet || images.desktop}
                alt={alt}
                loading="lazy"
                decoding="async"
                className="block w-full h-auto object-contain select-none"
                />
            </picture>
          </div>
        </div>
      </div>
    </section>
  );
}
