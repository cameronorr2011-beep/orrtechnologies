/**
 * Every route enters by settling a few pixels instead of appearing. The route
 * wipe covers the hard cut for same-origin clicks; this handles first paint,
 * back/forward and any navigation the wipe lets through.
 */
import type { ReactNode } from "react";

export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
