import { ButtonLink } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";

export default function HomeStory() {
  return (
    <section className="section bg-surface" aria-labelledby="home-story">
      <div className="container grid gap-stack md:grid-cols-2 md:items-center">
        <div className="aspect-[4/3] bg-line" aria-hidden="true" />
        <div className="flex max-w-lg flex-col gap-6">
          <p className="text-eyebrow text-muted">About {siteConfig.name}</p>
          <h2 id="home-story">Made with intention, worn every day</h2>
          <p className="text-body text-muted">
            Use this space for the brand story — what you make, how you make it and why it matters. Swap the block on
            the left for campaign imagery from public/images/home/.
          </p>
          <ButtonLink href="/about" variant="outline" className="self-start">
            Read our story
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
