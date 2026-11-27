/** A photo (or film) in the care gallery (CareGallery): the card that steps through them, and its strips */
export interface CareSlide {
  /** The photo — for a video slide, its poster (and the strips' thumbnail) */
  src: string;
  /** A muted loop, played from its start while the slide has the card (Mixkit, free licence) */
  video?: string;
  alt: string;
  /** Caption card over the photo; a first photo carries its own feature callouts or product instead */
  title?: string;
  text?: string;
  /** object-position for photos of another shape, so the crop keeps their subject in frame */
  position?: string;
  /** The same for the video, where its shape differs from the photo's */
  videoPosition?: string;
}

// The card (and each thumbnail) has the main photo's shape, 1792 × 2400, so that one shows whole and its circle
// stays put; the others are cropped to it — landscape ones down to about half their width
export const MAIN_FEATURE: CareSlide = {
  src: "/images/newhome/main_feature.png",
  alt: "A raised underarm marked with a dashed circle, beside four callouts: dermatologist approved, no parabens or artificial dyes, stain-free on white clothes, gentle for everyday use",
};

/** /home's films after the main photo */
export const CARE_FILMS: CareSlide[] = [
  {
    src: "/images/newhome/care/sweat.webp",
    video: "/videos/care/sweat.mp4",
    alt: "A woman beaded with sweat, mid-workout",
    title: "Advanced sweat control",
    text: "Stays fresh through every move, every commute, and everything in between.",
  },
  {
    src: "/images/newhome/care/active.webp",
    video: "/videos/care/active.mp4",
    alt: "A runner on a forest path",
    title: "Made for active lifestyles",
    text: "Daily commutes, training sessions and long, warm days.",
  },
  {
    src: "/images/newhome/care/stain-free.webp",
    video: "/videos/care/stain-free.mp4",
    alt: "Washing blowing on a line outdoors",
    title: "Stain-free guarantee",
    text: "Tested on white cotton and delicate silks with zero residue transfer.",
  },
  {
    src: "/images/newhome/care/lab.webp",
    video: "/videos/care/lab.mp4",
    alt: "A lab technician measuring out a formula",
    title: "ISO 22716 certified",
    text: "Made to cosmetic GMP standards with traceable batches.",
  },
  {
    src: "/images/newhome/care/fragrance.webp",
    video: "/videos/care/fragrance.mp4",
    alt: "A finger pressing down on a fragrance bottle",
    title: "Refined fragrance",
    text: "Three signature scents: Silver Lining, Citrus Tide and Forest Air.",
  },
];

/**
 * /home1's first photo: a bathroom shelf (1086 × 1448, near enough the card's shape) with a gap on its
 * lower shelf, between the toothbrushes and the towels, where the stick comes to stand (CabinetCare)
 */
export const SHELF_FEATURE: CareSlide = {
  src: "/images/newhome/feature_img.png",
  alt: "A sunlit bathroom shelf with a trailing plant, toothbrushes, folded towels and a perfume bottle, a Sava Balanced stick standing among them",
};

/**
 * /home1's photos after the shelf: posters with their own type set in them, so they carry no caption
 * card. A little wider than the card, they're cropped at the sides — towards the side their type
 * keeps clear of. Each has its film (care2/vid<n>.mp4, portrait but for the fourth), played in the card
 * while it's there, the poster standing in until it does and in the strips
 */
export const CARE_POSTERS: CareSlide[] = [
  {
    src: "/images/newhome/care2/img1.jpg",
    alt: "A man lifting weights in a dim, blue-lit gym. Poster: they know you're nervous before the room does — your palms are snitches",
  },
  {
    src: "/images/newhome/care2/img2.jpg",
    video: "/images/newhome/care2/vid2.mp4",
    alt: "A woman glistening with sweat between sets. Poster: your body can get better at sweating",
    position: "0% 50%",
  },
  {
    src: "/images/newhome/care2/img3.jpg",
    alt: "An athlete working battle ropes in a dark gym. Poster: sweat is a system, not a failure",
  },
  {
    src: "/images/newhome/care2/img4.jpg",
    video: "/images/newhome/care2/vid4.mp4",
    videoPosition: "65% 50%",
    alt: "A man swinging a medicine ball in a dark studio. Poster: your sweat can get saltier when it rushes — yes, apparently sweat has a speed setting",
  },
  {
    src: "/images/newhome/care2/img5.jpg",
    alt: "Two iced coffees picked up from a café table. Poster: your coffee might be making things sweatier",
    position: "100% 50%",
  },
];
