/** Grey pulsing placeholder shown while a page loads. */
export function Bone({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-xl bg-line/70 ${className}`} />;
}

/** Announces loading to screen readers without showing extra text. */
export function LoadingLabel({ text = "Loading" }: { text?: string }) {
  return <p role="status" className="sr-only">{text}…</p>;
}

/** Placeholder for the login/sign-up form during the split second before it appears. */
export function AuthFormSkeleton({ fields }: { fields: number }) {
  return (
    <div className="space-y-5">
      <LoadingLabel />
      {Array.from({ length: fields }, (_, i) => (
        <div key={i}>
          <Bone className="h-4 w-20" />
          <Bone className="mt-2 h-11" />
        </div>
      ))}
      <Bone className="h-12 rounded-full" />
    </div>
  );
}
