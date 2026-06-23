interface LogoProps {
  size?: number;
  className?: string;
  withWordmark?: boolean;
}

// Inline custom SVG mark: an "L" stroke crossed by an "X" — a single geometric
// monogram for Lixen.AI. Monochrome-first; accent applied via fill props.
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-label="Lixen.AI"
      className={className}
    >
      <rect width="32" height="32" rx="7" fill="#0D3070" />
      <path d="M9 8 v16 h7" fill="none" stroke="#60AAFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 8 l7 16 M23 8 l-7 16" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ size = 32, className, withWordmark = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <LogoMark size={size} />
      {withWordmark && (
        <div className="leading-tight">
          <div className="font-semibold text-[15px] tracking-tight">
            Lixen<span className="text-[#1E5BA8]">.AI</span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Agent OS
          </div>
        </div>
      )}
    </div>
  );
}
