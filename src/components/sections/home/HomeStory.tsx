import BlobButton from "@/components/ui/BlobButton";
import { Frame, FrameRule } from "@/components/ui/Frame";
import Sparkle from "@/components/ui/Sparkle";

export default function HomeStory() {
  return (
    <section aria-labelledby="home-story">
      <Frame className="pt-section pb-24 lg:pb-32">
        <FrameRule />

        <div className="flex flex-col items-center px-inset pt-16 text-center">
          <h2 id="home-story" className="flex items-center gap-2 text-kicker text-accent">
            <Sparkle />
            Sava Story
          </h2>
          <p data-heading-effect className="mt-4 max-w-232 text-lead text-muted">
            SAVA combines advanced sweat-control technology with refined fragrance to redefine everyday personal care.
            Our innovative formulations deliver reliable protection, lasting freshness, and confidence without
            compromise.
          </p>
          <BlobButton data-reveal href="/about" className="mt-12">
            Read More
          </BlobButton>
        </div>
      </Frame>
    </section>
  );
}
