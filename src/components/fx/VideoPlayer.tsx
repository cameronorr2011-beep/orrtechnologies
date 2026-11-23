/**
 * A real, playable video with controls.
 *
 * Deliberately not autoplaying: this is content the reader chose to watch, so
 * it does not steal bandwidth or start talking at them. `preload="metadata"`
 * means the poster paints immediately without pulling the whole file.
 */
export default function VideoPlayer({
  src,
  poster,
  caption,
  title,
  className = "",
}: {
  src: string;
  poster: string;
  caption?: string;
  title: string;
  className?: string;
}) {
  return (
    <figure className={className}>
      <div className="overflow-hidden rounded-3xl border border-royal-300/15 bg-ink shadow-[0_24px_60px_-30px_rgba(10,12,30,0.55)]">
        <video
          controls
          playsInline
          preload="metadata"
          poster={poster}
          className="aspect-video w-full bg-ink"
          aria-label={title}
        >
          <source src={src} type="video/mp4" />
          Your browser cannot play this video.
        </video>
      </div>
      {caption ? (
        <figcaption className="mt-3 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-bone/40">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
