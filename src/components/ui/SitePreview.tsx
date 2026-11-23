import Image from "next/image";
import type { SitePreviewData } from "@/lib/content";

/**
 * A real browser frame with a miniature website inside it. The type is sized
 * in container units, so the same preview reads at 320px in the hero and at
 * 700px in the work grid.
 */
export default function SitePreview({
  site,
  className = "",
  sizes = "(max-width: 1024px) 100vw, 50vw",
}: {
  site: SitePreviewData;
  className?: string;
  sizes?: string;
}) {
  const t = site.theme;

  return (
    <div className={`overflow-hidden border-2 border-ink bg-paper ${className}`}>
      <div className="flex items-center gap-1.5 border-b-2 border-ink bg-ink px-2.5 py-2">
        <span className="h-2 w-2 rounded-full bg-[#ff5a36]" aria-hidden="true" />
        <span className="h-2 w-2 rounded-full bg-[#f5b72f]" aria-hidden="true" />
        <span className="h-2 w-2 rounded-full bg-[#1fae8a]" aria-hidden="true" />
        <span className="ml-2 min-w-0 flex-1 truncate rounded-full bg-white/10 px-2.5 py-[0.2rem] font-mono text-[0.46rem] uppercase tracking-[0.12em] text-paper/55">
          {site.url}
        </span>
      </div>

      <div className="[container-type:inline-size]" style={{ background: t.bg, color: t.ink }}>
        <div className="flex items-center justify-between gap-[3cqw] px-[4.5cqw] py-[3cqw]">
          <span className="font-display whitespace-nowrap text-[3.2cqw] font-extrabold uppercase leading-none tracking-[-0.04em]">
            {site.brand}
          </span>
          <span className="hidden items-center gap-[2.6cqw] text-[1.8cqw] font-semibold uppercase tracking-[0.1em] opacity-70 sm:flex">
            {site.nav.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </span>
          <span
            className="whitespace-nowrap rounded-full px-[2.8cqw] py-[1.2cqw] text-[1.6cqw] font-bold"
            style={{ background: t.accent, color: t.accentText }}
          >
            {site.cta}
          </span>
        </div>

        <div className="relative mx-[3cqw] aspect-[16/10] overflow-hidden">
          <Image
            src={site.image}
            alt={site.imageAlt}
            fill
            sizes={sizes}
            className="object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(180deg, transparent 26%, ${t.ink}d9 100%)` }}
          />
          <div className="absolute inset-x-0 bottom-0 p-[4cqw]">
            <p className="font-display max-w-[88%] text-[6cqw] font-extrabold uppercase leading-[0.9] tracking-[-0.045em] text-white">
              {site.headline}
            </p>
            <p className="mt-[1.2cqw] max-w-[76%] text-[1.85cqw] leading-snug text-white/80">
              {site.sub}
            </p>
          </div>
          {site.badge ? (
            <span
              className="absolute right-[2.4cqw] top-[2.4cqw] rounded-full bg-white/90 px-[2.4cqw] py-[1.1cqw] text-[1.45cqw] font-bold uppercase tracking-[0.1em]"
              style={{ color: t.ink }}
            >
              {site.badge}
            </span>
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-[2.2cqw] px-[3cqw] pb-[3.4cqw] pt-[2.8cqw]">
          {site.cards.map((card, index) => (
            <div
              key={card}
              className="rounded-[1.4cqw] px-[2.2cqw] py-[2.2cqw]"
              style={{ background: index === 0 ? t.accent : `${t.ink}0f` }}
            >
              <span
                className="block h-[1.2cqw] w-[1.2cqw] rounded-full"
                style={{ background: index === 0 ? t.accentText : t.accent }}
              />
              <span
                className="mt-[1.2cqw] block text-[1.55cqw] font-bold leading-tight"
                style={{ color: index === 0 ? t.accentText : t.ink }}
              >
                {card}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
