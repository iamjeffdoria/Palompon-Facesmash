const steps = [
  { n: "1", title: "Post your photo", body: "Light filters are fine, just don't edit yourself into an unrecognizable stranger." },
  { n: "2", title: "Get matched, or swipe", body: "Go head-to-head in a VS matchup, or drop into the Smash or Pass deck — your call." },
  { n: "3", title: "Town decides", body: "Every vote and every smash updates the leaderboard live, barangay by barangay." },
];

export default function MarketingSections() {
  return (
    <>
      <section id="how" className="border-y border-ink/15 bg-ink text-sand">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-16 grid md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.n} className={i !== 0 ? "py-8 md:py-0 md:px-8 md:border-l border-sand/20" : "py-8 md:py-0 md:px-8"}>
              <span className="font-display text-4xl text-mango">{s.n}</span>
              <h3 className="mt-4 text-xl font-medium">{s.title}</h3>
              <p className="mt-2 text-sand/70">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-3 divide-x divide-ink/15 border-b border-ink/15">
        {[
          { value: "4,120", label: "votes cast today" },
          { value: "38", label: "barangays repping" },
          { value: "612", label: "faces in the running" },
        ].map((s) => (
          <div key={s.label} className="text-center py-6 sm:py-10 px-2 sm:px-4">
            <p className="font-display text-2xl sm:text-3xl md:text-4xl text-coral">{s.value}</p>
            <p className="mt-1 text-xs sm:text-sm text-ink/60">{s.label}</p>
          </div>
        ))}
      </section>
    </>
  );
}