import { LinkPage } from "@/components/LinkPage";
import { APP_HOST } from "@/lib/site";
import { sampleProfile } from "./sample";
import { SmartCard } from "./Visuals";

/**
 * Animated scene for the hero: the smart card moves to the phone, NFC waves ripple,
 * the phone shows a notification and the business profile slides open. Pure CSS (see
 * globals.css); with reduced motion it rests on the opened profile.
 */
export function TapDemo() {
  return (
    <div
      role="img"
      aria-label={`Animation: tapping the ${sampleProfile.displayName} smart card on a phone opens their business profile`}
      className="relative mx-auto h-[540px] w-[330px] [--tap-x:90px] [--tap-y:-190px] sm:h-[600px] sm:w-[480px] sm:[--tap-x:150px] sm:[--tap-y:-190px]"
    >
      {/* Phone */}
      <div className="absolute right-0 top-0 w-[250px] rounded-[2.5rem] border-[9px] border-ink bg-ink shadow-[0_30px_70px_-25px_rgba(11,47,59,0.7)] sm:w-[290px]">
        <div className="relative h-[500px] overflow-hidden rounded-[1.9rem] sm:h-[570px]">
          {/* Lock screen */}
          <div className="absolute inset-0 flex flex-col items-center bg-gradient-to-b from-primary-dark via-primary to-[#1d6b7f] pt-14 text-white">
            <p className="font-display text-6xl font-bold tracking-tight">09:41</p>
            <p className="mt-auto mb-10 text-xs text-white/60">Hold near an NFC card</p>
          </div>

          {/* Notification */}
          <div className="tap-notice absolute inset-x-2.5 top-2.5 z-20 rounded-2xl bg-white/95 p-3 text-ink shadow-xl backdrop-blur">
            <div className="flex items-center gap-2 text-[11px] text-ink/60">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary">
                <span className="h-1.5 w-2.5 rounded-full bg-secondary" />
              </span>
              <span className="font-semibold uppercase tracking-wide">NFC tag</span>
              <span className="ml-auto">now</span>
            </div>
            <p className="mt-1.5 text-sm font-semibold">Open {sampleProfile.displayName}&apos;s profile</p>
            <p className="truncate text-xs text-ink/60">{APP_HOST}/{sampleProfile.username}</p>
            <span className="tap-touch pointer-events-none absolute right-6 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-primary/40" />
          </div>

          {/* Opened profile */}
          <div className="tap-profile absolute inset-0 z-10 overflow-hidden bg-primary">
            <div inert>
              <LinkPage {...sampleProfile} links={sampleProfile.links.slice(0, 3)} mode="preview" />
            </div>
          </div>
        </div>
      </div>

      {/* NFC waves at the tap point */}
      <div aria-hidden="true" className="pointer-events-none absolute left-[160px] top-[322px] z-30 sm:left-[250px] sm:top-[340px]">
        {[0, 1, 2].map((i) => (
          <span key={i} className="nfc-wave absolute -left-12 -top-12 h-24 w-24 rounded-full border-2 border-secondary" />
        ))}
      </div>

      {/* The card */}
      <div className="tap-card absolute -bottom-4 -left-2 z-40 w-[140px] text-[11px] sm:bottom-2 sm:left-0 sm:w-[200px] sm:text-[15px]">
        <SmartCard />
      </div>
    </div>
  );
}
