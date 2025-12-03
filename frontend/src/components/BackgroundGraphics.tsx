/**
 * Decorative background graphics component.
 * Renders gradient blobs and dot pattern.
 */

export function BackgroundGraphics() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Top right gradient blob */}
      <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-accent-400/20 rounded-full blur-3xl" />

      {/* Mid-page gradient blob */}
      <div className="absolute top-[600px] -left-32 w-[400px] h-[400px] bg-accent-500/15 rounded-full blur-3xl" />

      {/* Bottom gradient blob */}
      <div className="absolute bottom-[200px] -right-20 w-[450px] h-[450px] bg-accent-400/15 rounded-full blur-3xl" />

      {/* Center accent */}
      <div className="absolute top-[400px] right-1/3 w-80 h-80 bg-gradient-to-br from-accent-300/10 to-transparent rounded-full blur-2xl" />

      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: "radial-gradient(#3b82f6 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}
