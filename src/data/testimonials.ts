/*
 * Customer stories, shared by the About page's carousel (AboutTestimonials) and the /home page's
 * reviews. Dummy reviews and stand-in photos until the real ones are in.
 */

export interface Testimonial {
  name: string;
  role: string;
  city: string;
  country: string;
  image: string;
  /** Length of the story's video (m.ss), shown on the About carousel's play badge */
  duration: string;
  quote: string;
}

export const testimonials: Testimonial[] = [
  {
    name: "Janna Sims",
    role: "Designer",
    city: "Mumbai",
    country: "IN",
    image: "/images/home/review-3.png",
    duration: "2.19",
    quote:
      "Effective sweat control with a lightweight feel and refined fragrance. SAVA has become my everyday essential.",
  },
  {
    name: "Jeromy Ellison",
    role: "Personal Trainer",
    city: "Delhi",
    country: "IN",
    image: "/images/about/gym_img.png",
    duration: "1.48",
    quote: "Two sessions a day and it still holds up. It's the first antiperspirant I haven't had to reapply at lunch.",
  },
  {
    name: "Mira Kapoor",
    role: "Swim Coach",
    city: "Chennai",
    country: "IN",
    image: "/images/about/confidence_img_3.png",
    duration: "2.05",
    quote: "Humid pool deck, long days — and I stay dry and fresh. The Forest Air scent is subtle in the best way.",
  },
  {
    name: "Alexandra Chase",
    role: "Product Manager",
    city: "Bengaluru",
    country: "IN",
    image: "/images/home/review-1.png",
    duration: "1.32",
    quote:
      "Back-to-back meetings in a Bengaluru summer used to mean sweat patches. Not any more. Clean, calm, confident.",
  },
  {
    name: "Ananya Rao",
    role: "Runner",
    city: "Pune",
    country: "IN",
    image: "/images/about/confidence_img_1.png",
    duration: "1.17",
    quote:
      "My 7am run is done before the city wakes up, and I'm still fresh at my desk by ten. Gentle on my skin, too.",
  },
  {
    name: "Kabir Shah",
    role: "Architect",
    city: "Ahmedabad",
    country: "IN",
    image: "/images/products/shared/sava-very-local.png",
    duration: "2.40",
    quote: "No white marks, no sticky feel, no overpowering smell. It just works — which is exactly what I wanted.",
  },
];
