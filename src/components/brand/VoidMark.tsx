type Props = {
  size?: number;
  className?: string;
  /** signal = green leading edge (default), mono = bone only */
  tone?: "signal" | "mono";
  title?: string;
};

/**
 * The VoidBuilds mark.
 * A black event horizon, a photon ring, and a tilted accretion disk with
 * one green leading edge. Geometry, not type: it reads at 16px and at 2000px.
 */
export default function VoidMark({
  size = 40,
  className = "",
  tone = "signal",
  title = "VoidBuilds mark",
}: Props) {
  const uid = tone;
  const green = tone === "signal" ? "#C8F751" : "#F2EFE8";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id={`disk-${uid}`} x1="4" y1="50" x2="96" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={green} stopOpacity="0.95" />
          <stop offset="0.32" stopColor="#F2EFE8" stopOpacity="0.9" />
          <stop offset="0.62" stopColor="#F2EFE8" stopOpacity="0.4" />
          <stop offset="1" stopColor="#F2EFE8" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id={`ring-${uid}`} x1="30" y1="18" x2="70" y2="82" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#F2EFE8" stopOpacity="0.35" />
          <stop offset="0.45" stopColor="#FFFDF4" stopOpacity="1" />
          <stop offset="1" stopColor="#F2EFE8" stopOpacity="0.55" />
        </linearGradient>
        <radialGradient id={`core-${uid}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.78" stopColor="#060607" />
          <stop offset="1" stopColor="#060607" stopOpacity="0" />
        </radialGradient>
        <filter id={`soft-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.6" />
        </filter>
        <filter id={`haze-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="0.7" />
        </filter>
      </defs>

      {/* photon halo */}
      <circle cx="50" cy="50" r="26.4" stroke="#FFFDF4" strokeOpacity="0.22" strokeWidth="4.5" filter={`url(#soft-${uid})`} />

      {/* far side of the disk, passing behind the horizon */}
      <g transform="rotate(-21 50 50)">
        <ellipse cx="50" cy="50" rx="47" ry="12.5" stroke={`url(#disk-${uid})`} strokeWidth="5.5" opacity="0.22" filter={`url(#soft-${uid})`} />
        <ellipse cx="50" cy="50" rx="47" ry="12.5" stroke={`url(#disk-${uid})`} strokeWidth="1.3" opacity="0.82" />
        <ellipse cx="50" cy="50" rx="40" ry="8.4" stroke={`url(#disk-${uid})`} strokeWidth="3.4" opacity="0.34" filter={`url(#haze-${uid})`} />
        {/* leading edge: the one green note */}
        <path
          d="M9 56.5 A47 12.5 0 0 0 33 61.6"
          stroke={green}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </g>

      {/* event horizon */}
      <circle cx="50" cy="50" r="24.5" fill="#060607" />
      <circle cx="50" cy="50" r="24.5" fill={`url(#core-${uid})`} />

      {/* photon ring */}
      <circle cx="50" cy="50" r="25.4" stroke="#FFFDF4" strokeOpacity="0.4" strokeWidth="3.6" filter={`url(#soft-${uid})`} />
      <circle cx="50" cy="50" r="25.4" stroke={`url(#ring-${uid})`} strokeWidth="1.6" />
      <circle cx="50" cy="50" r="27.4" stroke="#F2EFE8" strokeOpacity="0.09" strokeWidth="0.7" />

      {/* lensed arc over the top: the far side bent into view */}
      <path
        d="M31.5 33.5 A26 26 0 0 1 68.5 33.5"
        stroke="#FFFDF4"
        strokeOpacity="0.66"
        strokeWidth="0.9"
      />
    </svg>
  );
}
