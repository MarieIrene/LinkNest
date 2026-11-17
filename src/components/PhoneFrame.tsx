export function PhoneFrame({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div
      className="mx-auto w-full max-w-[340px] rounded-[2.75rem] border-[10px] border-ink bg-ink shadow-[0_24px_60px_-20px_rgba(11,47,59,0.55)]"
      role={label ? "img" : undefined}
      aria-label={label}
    >
      <div className="h-[620px] overflow-y-auto rounded-[2rem] bg-primary">{children}</div>
    </div>
  );
}
