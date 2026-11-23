import Image from "next/image";

/**
 * The rendered chrome knot, used as the site's 3D signature on every route.
 *
 * It is a GIF — 40 frames rendered in Blender and finished in Resolve — so it
 * animates with no JavaScript at all. The artwork sits on pure black, which is
 * exactly why it is composited with `screen`: black drops out and the metal
 * floats on whatever dark plate it is placed over.
 */
export default function VoidOrb({
  className = "",
  size = 460,
  priority = false,
  label,
}: {
  className?: string;
  size?: number;
  priority?: boolean;
  label?: string;
}) {
  return (
    <div
      aria-hidden={label ? undefined : "true"}
      className={`void-orb ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/media/motion/void-orb.gif"
        alt={label ?? ""}
        width={size}
        height={size}
        priority={priority}
        unoptimized
        className="void-orb__art h-full w-full object-contain mix-blend-screen"
      />
    </div>
  );
}
