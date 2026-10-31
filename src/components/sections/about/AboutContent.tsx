import { siteConfig } from "@/config/site";

const values = [
  { title: "Considered design", body: "Describe how pieces are designed and what makes them distinct." },
  { title: "Honest materials", body: "Where materials come from and why they were chosen." },
  { title: "Made to last", body: "Craft, quality control and the care promise." },
];

export default function AboutContent() {
  return (
    <>
      <section className="section container grid gap-stack md:grid-cols-2">
        {/* Placeholder for the story image: a plain fade for now. When a real image goes in, make this
            wrapper overflow-hidden with data-reveal="image" and give the image data-parallax="0.1" */}
        <div data-reveal="fade" className="aspect-[4/5] bg-surface" aria-hidden="true" />
        <div data-reveal="stagger" className="flex flex-col justify-center gap-6 text-body text-muted">
          <h2 className="text-ink">Our story</h2>
          <p>
            {siteConfig.name} began with a simple idea. Replace this copy with the founding story — who started the
            brand, what they set out to make and what still guides every collection.
          </p>
          <p>A second paragraph for the craft, the people and the places behind the product.</p>
        </div>
      </section>

      <section className="section bg-surface" aria-labelledby="about-values">
        <div className="container">
          <h2 data-reveal id="about-values" className="mb-stack">
            What we stand for
          </h2>
          <ul data-reveal="stagger" className="grid gap-stack md:grid-cols-3">
            {values.map((v) => (
              <li key={v.title} className="flex flex-col gap-3 border-t border-ink pt-6">
                <h3 className="text-h4">{v.title}</h3>
                <p className="text-body text-muted">{v.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
