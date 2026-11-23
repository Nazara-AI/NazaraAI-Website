import { Eyebrow } from "./ui";
import { WaitlistForm } from "./waitlist-form";

const AUDIENCE = [
  "Engineering & design offices",
  "Fabrication yards",
  "Owners & operators",
  "Verification & certifying bodies",
];

export function EarlyAccess({
  heading = "From issued drawings to reviewed designs.",
}: {
  heading?: string;
}) {
  return (
    <section id="early-access" className="blueprint-dark scroll-mt-20 bg-deep px-4 py-20 text-white sm:px-6 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-2">
        <div>
          <Eyebrow dark>Early access program</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">{heading}</h2>
          <p className="mt-5 max-w-lg text-white/70">
            Join the teams piloting Nazara AI on live offshore packages. Early partners shape the
            checks we build next.
          </p>
          <p className="mt-10 font-mono text-xs tracking-wider text-white/50 uppercase">Built for</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {AUDIENCE.map((a) => (
              <li key={a} className="flex items-center gap-2.5 text-sm text-white/85">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-bright" />
                {a}
              </li>
            ))}
          </ul>
        </div>
        <WaitlistForm />
      </div>
    </section>
  );
}
