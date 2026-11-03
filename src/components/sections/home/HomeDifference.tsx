import { RiCloseLine } from "@remixicon/react";
import CroppedImage from "@/components/ui/CroppedImage";
import { Frame, FrameRule } from "@/components/ui/Frame";
import SectionHeading from "@/components/ui/SectionHeading";
import DifferenceMotion from "./DifferenceMotion";
import StickThumb from "./StickThumb";

const rows = [
  {
    point: "Scent Longevity",
    icon: "/icons/home/compare-scent.png",
    standard: "5% – 10% (Eau de Toilette)",
    sava: "20% High-Grade Extrait / EDP",
  },
  {
    point: "Clean & Non-Toxic",
    icon: "/icons/home/compare-clean.png",
    standard: "Harsh Synthetic",
    sava: "Clean & Vegan",
  },
  {
    point: "Ingredients Sourcing",
    icon: "/icons/home/compare-ingredients.png",
    standard: "Drying",
    sava: "Hydrating Botanical Carrier Oils",
  },
  {
    point: "Urban Shield Tech",
    icon: "/icons/home/compare-urban.png",
    standard: null,
    sava: "Anti-Pollution Skin Defense",
  },
];

/** Tint behind a SAVA-column cell; DifferenceMotion runs them top to bottom as one column of light */
function SavaFill() {
  return <span data-diff-fill aria-hidden="true" className="absolute inset-0 -z-10 bg-accent/10" />;
}

export default function HomeDifference() {
  return (
    <DifferenceMotion aria-labelledby="home-difference" className="relative isolate bg-surface">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grain opacity-12" />

      <Frame className="py-section">
        <FrameRule />
        <SectionHeading
          id="home-difference"
          eyebrow="Our difference"
          title="The Difference Behind SAVA’s Approach to Fragrance"
          className="px-inset py-10"
        />
        <FrameRule />

        {/* Below md the table restacks instead of scrolling: each row's label spans the full width,
            with its two values side by side underneath, under a two-column product header */}
        <div className="md:overflow-x-auto">
          <table
            data-diff-table
            className="w-full border-collapse text-left text-caption text-muted max-md:block md:min-w-160 md:text-body-lg"
          >
            <caption className="sr-only">How SAVA compares with standard perfume</caption>
            <colgroup>
              <col className="w-[30%]" />
              <col className="w-[40%]" />
              <col className="w-[30%]" />
            </colgroup>
            <thead className="max-md:block">
              <tr className="border-b border-line max-md:grid max-md:grid-cols-2">
                <th scope="col" className="px-inset py-10 text-h4 text-ink max-md:hidden">
                  <span data-diff-head className="block">
                    Comparison Point
                  </span>
                </th>
                <th
                  scope="col"
                  className="border-r border-line px-4 py-6 text-h6 text-ink md:border-l md:px-6 md:py-10 md:text-h5"
                >
                  <span data-diff-head className="flex flex-col items-center gap-3">
                    <span data-diff-product>
                      <CroppedImage
                        src="/images/home/perfume-sprite.png"
                        width={2000}
                        height={2000}
                        crop={{ width: 472.81, height: 240.38, left: -31.91, top: -15.26 }}
                        sizes="160px"
                        className="h-16 w-8.25"
                      />
                    </span>
                    Standard Perfume
                  </span>
                </th>
                {/* isolate: keeps the fill's -z-10 inside the cell */}
                <th scope="col" className="relative isolate px-4 py-6 text-h6 text-ink md:px-6 md:py-10 md:text-h5">
                  <SavaFill />
                  <span data-diff-head className="flex flex-col items-center gap-3">
                    <span data-diff-product>
                      <StickThumb />
                    </span>
                    SAVA Fragrance
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="max-md:block">
              {rows.map((row) => (
                <tr
                  key={row.point}
                  data-diff-row
                  className="border-b border-line transition-colors duration-300 last:border-b-0 hover:bg-paper/60 max-md:grid max-md:grid-cols-2"
                >
                  {/* font-normal undoes the browser's bold <th>: row labels read as body text */}
                  <th
                    scope="row"
                    className="px-inset py-7 font-normal max-md:col-span-2 max-md:border-b max-md:border-line max-md:py-4 max-md:text-body"
                  >
                    <span className="flex items-center gap-3 max-md:justify-center md:gap-4">
                      <span
                        data-diff-badge
                        className="center size-10 shrink-0 rounded-full bg-gradient-badge md:size-12"
                      >
                        <span
                          aria-hidden="true"
                          className="size-5 bg-paper mask-contain mask-center mask-no-repeat md:size-6"
                          style={{ maskImage: `url(${row.icon})` }}
                        />
                      </span>
                      <span data-diff-point>{row.point}</span>
                    </span>
                  </th>
                  <td className="border-r border-line px-4 text-center max-md:center max-md:py-5 md:border-l md:px-6">
                    <span data-diff-value className="inline-block">
                      {row.standard ?? (
                        <span className="inline-flex items-center gap-1.5">
                          <RiCloseLine className="size-4.5" aria-hidden="true" />
                          None
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="relative isolate px-4 text-center max-md:center max-md:py-5 md:px-6">
                    <SavaFill />
                    <span data-diff-value className="inline-block">
                      {row.sava}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <FrameRule />
      </Frame>
    </DifferenceMotion>
  );
}
