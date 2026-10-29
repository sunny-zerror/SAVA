import Image from "next/image";
import Link from "next/link";
import { getCategories } from "@/services/catalog";
import { mediaUrl } from "@/utils/media";

export default async function HomeCategories() {
  const categories = (await getCategories()).slice(0, 3);
  if (categories.length === 0) return null;

  return (
    <section className="section container" aria-labelledby="home-categories">
      <h2 id="home-categories" className="mb-stack">
        Shop by category
      </h2>
      <ul className="grid gap-grid md:grid-cols-3">
        {categories.map((category) => (
          <li key={category._id}>
            <Link
              href={`/shop?category=${category.slug}`}
              className="group relative block aspect-[4/5] overflow-hidden bg-surface"
            >
              <Image
                src={mediaUrl(category.imgsrc)}
                alt=""
                fill
                sizes="(min-width: 48rem) 33vw, 100vw"
                className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]"
              />
              <span className="absolute bottom-6 left-6 bg-paper px-4 py-2 text-cta">{category.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
