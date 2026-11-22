type Props = {
  className?: string;
  /** kept for API compatibility with the old field */
  variant?: "field" | "core";
  interactive?: boolean;
};

/**
 * A still field of dust for inner pages. No WebGL, no warm gradient:
 * three sparse star layers over the void. The live black hole is reserved
 * for the homepage hero so it stays a signature, not wallpaper.
 */
export default function VoidDust({ className = "", variant = "field" }: Props) {
  const density = variant === "core" ? 0.75 : 1;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
      style={{
        backgroundImage: [
          "radial-gradient(1px 1px at 18% 22%, rgba(242,239,232,0.55), transparent 100%)",
          "radial-gradient(1px 1px at 72% 14%, rgba(242,239,232,0.35), transparent 100%)",
          "radial-gradient(1px 1px at 41% 63%, rgba(242,239,232,0.45), transparent 100%)",
          "radial-gradient(1px 1px at 86% 71%, rgba(200,247,81,0.45), transparent 100%)",
          "radial-gradient(1px 1px at 9% 82%, rgba(242,239,232,0.3), transparent 100%)",
          "radial-gradient(1px 1px at 57% 34%, rgba(242,239,232,0.25), transparent 100%)",
          "repeating-linear-gradient(90deg, rgba(242,239,232,0.035) 0 1px, transparent 1px 120px)",
          "repeating-linear-gradient(0deg, rgba(242,239,232,0.028) 0 1px, transparent 1px 120px)",
        ].join(","),
        backgroundSize: `480px 420px, 620px 540px, 760px 620px, 900px 700px, 540px 480px, 380px 340px, auto, auto`,
        opacity: density,
      }}
    />
  );
}
