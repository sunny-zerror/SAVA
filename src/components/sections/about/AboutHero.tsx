import Image from "next/image";
import BlobButton from "@/components/ui/BlobButton";
import { Frame } from "@/components/ui/Frame";
import Price from "@/components/ui/Price";
import { productPickers } from "@/config/shop";
import { siteConfig } from "@/config/site";
import { productContent } from "@/data/product-content";
import { getProduct } from "@/services/catalog";
import { mediaUrl, primaryImage } from "@/utils/media";
import { cardVariant, displayPrice } from "@/utils/product";
import { productHref } from "@/utils/url";

const proofs = ["Built on quality", "15 formulation iterations", "ISO 22716 certified"];

/**
 * The About page's opening: a full-screen photo under the see-through header, with the featured
 * product in a card at the bottom left and the brand's proofs at the bottom right. The h1 is there for
 * screen readers and search; the photo does the talking on screen.
 */
export default async function AboutHero() {
  const product = await getProduct(siteConfig.featuredProductSlug);
  const image = product ? primaryImage(product.assets) : null;
  const variant = product ? cardVariant(product) : null;
  const size = product?.productOptions
    ?.find((o) => o.optionName === productPickers.size)
    ?.choices.find((c) => variant?.selectedOptions?.includes(c.name))?.name;
  const subtitle = product && [productContent[product.slug]?.scent, size].filter(Boolean).join(" · ");
  const { price, compareAt } = product ? displayPrice(product) : { price: 0, compareAt: null };

  return (
    // data-reveal-sequence: the opening plays in page order, a step apart
    <section
      aria-labelledby="about-hero"
      data-reveal-sequence
      className="relative isolate -mt-[calc(var(--spacing-header)+var(--spacing-announcement))] overflow-hidden bg-accent text-paper"
    >
      <Image
        src="/images/about/about_hero_banner.jpg"
        alt="A laughing woman in a yellow hoodie holding a SAVA Balanced stick out towards the camera"
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
      />

      <Frame tone="dark" className="flex h-svh min-h-144 flex-col justify-end">
        <h1 id="about-hero" className="sr-only">
          Sweat is a problem. We&rsquo;re solving it.
        </h1>

        <div className="flex flex-col gap-6 px-inset pb-10 md:flex-row md:items-end md:justify-between md:pb-14">
          {product && (
            // A tall photo beside the details, the button closing the column (with room for its hover disc)
            <article
              data-reveal
              className="flex w-fit gap-5 rounded-3xl bg-paper p-3 pr-20 text-ink shadow-xl shadow-navy/10"
            >
              <div className="relative aspect-4/5 w-28 shrink-0 overflow-hidden rounded-2xl bg-surface">
                <Image
                  src={mediaUrl(image?.path)}
                  alt={image?.altText || product.name}
                  fill
                  sizes="7rem"
                  className="scale-110 object-cover mix-blend-multiply"
                />
              </div>
              <div className="flex flex-col justify-between gap-4 py-1">
                <div className="flex flex-col gap-1">
                  <p className="text-eyebrow text-accent uppercase">Bestseller</p>
                  <h2 className="text-h5">{product.name}</h2>
                  {subtitle && <p className="text-caption text-muted">{subtitle}</p>}
                  <Price price={price} compareAt={compareAt} className="mt-1 text-body font-medium" />
                </div>
                <BlobButton href={productHref(product.slug)} className="self-start">
                  Shop now
                </BlobButton>
              </div>
            </article>
          )}

          <ul data-reveal="stagger" className="flex flex-col items-start gap-2 md:items-end">
            {proofs.map((proof) => (
              <li key={proof} className="rounded-full border border-paper/70 px-4 py-1.5 text-eyebrow uppercase">
                {proof}
              </li>
            ))}
          </ul>
        </div>
      </Frame>
    </section>
  );
}
