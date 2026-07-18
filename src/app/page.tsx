import { ArrowUpRight, Cuboid, Mic2, SplitSquareHorizontal } from "lucide-react";

const foundations = [
  {
    icon: Cuboid,
    label: "Spatial truth",
    detail: "Measured, inferred, and unknown parts of a space stay visibly distinct.",
  },
  {
    icon: Mic2,
    label: "Bounded refinement",
    detail: "Voice and keyboard requests change known scene elements or fail clearly.",
  },
  {
    icon: SplitSquareHorizontal,
    label: "Decision memory",
    detail: "Named options preserve real scene state for factual comparison.",
  },
];

export default function Home() {
  return (
    <main className="foundation-page">
      <a className="skip-link" href="#foundation-content">
        Skip to product foundation
      </a>
      <header className="site-header" aria-label="Interiorin">
        <span className="wordmark">Interiorin</span>
        <span className="build-state">BUILD FOUNDATION · 2026.07</span>
      </header>

      <section className="foundation-hero" id="foundation-content">
        <div className="hero-copy">
          <p className="eyebrow">INTERIOR + EXTERIOR SPATIAL STUDIO</p>
          <h1>Bring the space.<br />Keep the truth.</h1>
          <p className="lede">
            Interiorin is becoming a voice-refinable design workspace that separates
            real spatial constraints from generated possibility—so a beautiful idea
            can survive contact with the room, yard, facade, or patio it belongs to.
          </p>
        </div>

        <aside className="status-note" aria-labelledby="status-title">
          <div>
            <p className="note-index">00 / FOUNDATION</p>
            <h2 id="status-title">The implementation contract is being verified.</h2>
            <p>
              Research, architecture, interaction, and provider choices are moving
              through Forge before the interactive studio opens. This page does not
              simulate a finished model or connected AI service.
            </p>
          </div>
          <a href="https://github.com/KIRTIRAJ4327/Interiorin">
            Follow the build <ArrowUpRight aria-hidden="true" size={18} />
          </a>
        </aside>
      </section>

      <section className="foundation-grid" aria-label="Product foundations">
        {foundations.map(({ icon: Icon, label, detail }, index) => (
          <article key={label}>
            <div className="foundation-number">0{index + 1}</div>
            <Icon aria-hidden="true" size={22} strokeWidth={1.5} />
            <h2>{label}</h2>
            <p>{detail}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
