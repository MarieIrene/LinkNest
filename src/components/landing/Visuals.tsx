import { PlatformIcon } from "@/lib/platforms";

export function NfcIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" aria-hidden="true" className={className}>
      <path d="M6 8.3a6 6 0 0 1 0 7.4" />
      <path d="M9.5 5.5a10 10 0 0 1 0 13" />
      <path d="M13 3a14 14 0 0 1 0 18" />
      <circle cx="3" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

function CardMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#5EEAD4" />
      <rect x="7" y="9" width="18" height="5" rx="2.5" fill="#164E63" />
      <rect x="7" y="18" width="18" height="5" rx="2.5" fill="#164E63" opacity=".55" />
    </svg>
  );
}

/** The Business Smart Card, drawn in CSS. Width drives everything; the ratio is a real card's. */
export function SmartCard({ className = "", name = "Amani CEO", role = "Founder & CEO" }: {
  className?: string; name?: string; role?: string;
}) {
  return (
    <div
      className={`card-shine aspect-[1.586] rounded-2xl bg-gradient-to-br from-primary via-primary-dark to-[#071f28] p-[7%] text-white shadow-[0_24px_50px_-18px_rgba(11,47,59,0.7)] ring-1 ring-white/10 ${className}`}
    >
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <span className="flex items-center gap-1.5 font-display text-[0.8em] font-bold tracking-tight">
            <CardMark /> LinkNest
          </span>
          <NfcIcon size={22} className="text-secondary" />
        </div>
        <div>
          <p className="font-display text-[1.15em] font-bold leading-tight">{name}</p>
          <p className="text-[0.7em] text-secondary">{role}</p>
        </div>
      </div>
    </div>
  );
}

/** The Social Media Tag: a compact round NFC tag with social icons. */
export function SocialTag({ className = "" }: { className?: string }) {
  return (
    <div className={`card-shine flex aspect-square items-center justify-center rounded-[28%] bg-gradient-to-br from-secondary to-[#2dd4bf] shadow-[0_24px_50px_-18px_rgba(11,47,59,0.6)] ${className}`}>
      <div className="flex flex-col items-center gap-2 text-primary-dark">
        <NfcIcon size={30} />
        <div className="flex -space-x-1.5">
          {["instagram", "tiktok", "whatsapp"].map((id) => (
            <PlatformIcon key={id} id={id} size={26} className="ring-2 ring-secondary" />
          ))}
        </div>
        <span className="font-display text-xs font-bold uppercase tracking-widest">Tap me</span>
      </div>
    </div>
  );
}
