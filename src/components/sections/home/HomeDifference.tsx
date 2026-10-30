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

        <div className="overflow-x-auto">
          <table data-diff-table className="w-full min-w-160 border-collapse text-left text-lg text-muted">
            <caption className="sr-only">How SAVA compares with standard perfume</caption>
            <colgroup>
              <col className="w-[30%]" />
              <col className="w-[40%]" />
              <col className="w-[30%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="px-inset py-10 text-2xl font-bold text-ink">
                  <span data-diff-head className="block">
                    Comparison Point
                  </span>
                </th>
                <th scope="col" className="border-x border-line px-6 py-10 text-xl font-bold text-ink">
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
                <th scope="col" className="relative isolate px-6 py-10 text-xl font-bold text-ink">
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
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.point}
                  data-diff-row
                  className="border-b border-line transition-colors duration-300 last:border-b-0 hover:bg-paper/60"
                >
                  <th scope="row" className="px-inset py-7 font-normal">
                    <span className="flex items-center gap-4">
                      <span data-diff-badge className="center size-12 shrink-0 rounded-full bg-gradient-badge">
                        <span
                          aria-hidden="true"
                          className="size-6 bg-paper mask-contain mask-center mask-no-repeat"
                          style={{ maskImage: `url(${row.icon})` }}
                        />
                      </span>
                      <span data-diff-point>{row.point}</span>
                    </span>
                  </th>
                  <td className="border-x border-line px-6 text-center">
                    <span data-diff-value className="inline-block">
                      {row.standard ?? (
                        <span className="inline-flex items-center gap-1.5">
                          <RiCloseLine className="size-4.5" aria-hidden="true" />
                          None
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="relative isolate px-6 text-center">
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
