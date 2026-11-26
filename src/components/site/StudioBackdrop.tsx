/**
 * The room the site sits in: warm paper, three soft colour washes, a pointer
 * spotlight and a blueprint grid. Decorative only, fixed behind every route.
 *
 * The washes read `--mx` / `--my` from ScrollDriver, so the room leans a
 * little toward the pointer. Under reduced motion the variables stay at 0 and
 * the whole layer is static.
 */
export default function StudioBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-paper">
      <div className="aurora-blob absolute -left-[18rem] -top-[16rem] h-[46rem] w-[46rem] rounded-full bg-[#2f4bff]/12 blur-[130px]" />
      <div className="aurora-blob absolute -right-[16rem] top-[14rem] h-[44rem] w-[44rem] rounded-full bg-[#ff5a36]/12 blur-[130px]" />
      <div className="aurora-blob absolute left-[26%] top-[58%] h-[38rem] w-[38rem] rounded-full bg-[#f5b72f]/16 blur-[120px]" />
      <div className="aurora-blob absolute -bottom-40 left-[6%] h-[34rem] w-[34rem] rounded-full bg-[#1fae8a]/10 blur-[120px]" />
      <div className="studio-spot absolute inset-0" />
      <div className="blueprint absolute inset-0 opacity-70" />
      <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-paper via-paper/70 to-transparent" />
    </div>
  );
}
