/*
 * Sweat School, SAVA's journal. z-commerce doesn't carry articles, so the posts live here: newest
 * first, each with its category, cover photo (public/images/blogs/) and body as a run of headed
 * sections. Read them through src/services/blog.ts. Dummy dates and author for now — swap in the
 * real ones (or move the posts to a CMS) before launch.
 */

export interface BlogCategory {
  slug: string;
  name: string;
}

export interface BlogSection {
  heading: string;
  body: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  /** Card and meta description; also the article's opening paragraph */
  excerpt: string;
  category: string;
  author: string;
  /** ISO date */
  date: string;
  image: { src: string; alt: string; width: number; height: number; position?: string };
  sections: BlogSection[];
}

/** The journal's name — the breadcrumb, the listing's h1 and the menu link */
export const BLOG_NAME = "Sweat School";

export const blogCategories: BlogCategory[] = [
  { slug: "sweat-control", name: "Sweat Control" },
  { slug: "fragrance-science", name: "Fragrance Science" },
  { slug: "skincare-comfort", name: "Skincare & Comfort" },
  { slug: "daily-freshness", name: "Daily Freshness" },
  { slug: "tips-lifestyle", name: "Tips & Lifestyle" },
];

const author = "Leona Wright";

/** The post the listing's banner features (BlogHero) */
export const FEATURED_BLOG_SLUG = "sweat-control-vs-deodorant-whats-the-difference";

export const blogPosts: BlogPost[] = [
  {
    slug: "sweat-control-vs-deodorant-whats-the-difference",
    title: "Sweat Control vs. Deodorant: What's the Difference?",
    excerpt:
      "They sit side by side on the shelf and often get called the same thing, but deodorants and sweat-control antiperspirants do different jobs. Knowing which does what helps you choose the right one for your day.",
    category: "sweat-control",
    author,
    date: "2026-11-20",
    image: {
      src: "/images/blogs/blogs_hero_banner.png",
      alt: "SAVA antiperspirant sticks standing on dark rocks under a stormy sky",
      width: 1024,
      height: 576,
    },
    sections: [
      {
        heading: "What a Deodorant Does",
        body: "Sweat itself has almost no smell. Odour comes from bacteria on the skin breaking it down. A deodorant targets that odour, neutralising it and adding fragrance, but it doesn't change how much you sweat.",
      },
      {
        heading: "What Sweat Control Does",
        body: "An antiperspirant reduces the sweat that reaches your skin. Its actives form temporary plugs near the surface of the sweat ducts, so you stay drier — and with less moisture, there's less for odour-causing bacteria to work on.",
      },
      {
        heading: "Which One Do You Need?",
        body: "If odour is your only concern, a deodorant may be enough. If you notice damp patches, sweat through shirts or want to feel dry through long, active days, sweat control is the one that makes the difference.",
      },
      {
        heading: "Why SAVA Does Both",
        body: "SAVA combines advanced sweat control with refined fragrance in a single stick. You get less moisture and lasting freshness in one step, designed for days that don't slow down.",
      },
      {
        heading: "Conclusion",
        body: "Deodorants manage odour; sweat control manages the moisture behind it. Choosing a product that does both keeps you dry, fresh and confident from morning to night.",
      },
    ],
  },
  {
    slug: "the-science-behind-long-lasting-fragrance",
    title: "The Science Behind Long-Lasting Fragrance",
    excerpt:
      "Fragrance is more than a scent — it's a balance of carefully selected notes, thoughtful formulation, and lasting performance. At SAVA, we bring refined fragrance and advanced sweat control together to create an everyday experience designed around freshness, comfort, and confidence.",
    category: "fragrance-science",
    author,
    date: "2026-11-14",
    image: {
      src: "/images/blogs/blogs/blog1.png",
      alt: "Water droplets beading on a green leaf, framed in a grid with the words “Ask: Fresh how?”",
      width: 1080,
      height: 1350,
      // Low enough to keep the “Fresh how?” line in the wide crops
      position: "50% 80%",
    },
    sections: [
      {
        heading: "The Role of Formulation",
        body: "A fragrance's performance depends on more than its scent. Ingredient selection, formulation, and interaction with the skin all influence how a fragrance develops and lasts. Thoughtfully formulated products help create a consistent, enjoyable fragrance experience.",
      },
      {
        heading: "How Fragrance Interacts with Skin",
        body: "Fragrance can develop differently depending on skin type, temperature, and daily activity. Understanding these factors helps explain why the same scent may smell slightly different from one person to another and change throughout the day.",
      },
      {
        heading: "Fragrance Meets Sweat Control",
        body: "At SAVA, refined fragrance comes together with targeted sweat control to support everyday freshness. This dual-action approach is designed to help manage excess moisture while delivering a sophisticated scent experience, combining performance and personal care in one routine.",
      },
      {
        heading: "Designed for Everyday Performance",
        body: "From busy mornings to long days on the move, SAVA is designed to fit seamlessly into your daily routine. The combination of sweat control and refined fragrance helps you feel fresh, comfortable, and ready to take on the day.",
      },
      {
        heading: "Making Your Fragrance Last",
        body: "Applying fragrance as directed and storing it away from heat and direct sunlight can help preserve its quality. Choosing a fragrance that suits your preferences and routine can also make your daily scent experience more enjoyable.",
      },
      {
        heading: "Conclusion",
        body: "Long-lasting fragrance is shaped by scent composition, formulation, and how it interacts with your skin. SAVA brings targeted sweat control and refined fragrance together to make everyday freshness part of your routine.",
      },
    ],
  },
  {
    slug: "what-to-look-for-in-a-skin-friendly-deodorant",
    title: "What to Look for in a Skin-Friendly Deodorant",
    excerpt:
      "Underarm skin is thinner and more sensitive than most of the body, and it works hard every day. Choosing a deodorant that respects it starts with knowing what to look for on the label — and how your skin responds.",
    category: "skincare-comfort",
    author,
    date: "2026-11-02",
    image: {
      src: "/images/blogs/blogs/bolg2.png",
      alt: "A woman with sun-warmed skin looking into the distance after a run",
      width: 2247,
      height: 1180,
    },
    sections: [
      {
        heading: "Start with Your Skin",
        body: "Dry, sensitive or easily irritated skin needs a gentler formula than skin that rarely reacts. Paying attention to how your underarms feel after shaving, after exercise and at the end of a long day tells you more than any marketing claim.",
      },
      {
        heading: "Read the Ingredient List",
        body: "Look for soothing, skin-conditioning ingredients and a formula that's been dermatologically tested. If you know a particular ingredient doesn't agree with you, check for it before you buy rather than after.",
      },
      {
        heading: "Texture Matters",
        body: "A formula that glides on smoothly and dries quickly is less likely to rub or leave residue on clothes. A solid stick gives you control over how much you apply, so you only use what you need.",
      },
      {
        heading: "Fragrance, Thoughtfully Done",
        body: "Fragrance and sensitive skin can go together when it's carefully formulated. SAVA pairs refined scents with a comfortable base designed for everyday wear, so freshness never has to come at the cost of comfort.",
      },
      {
        heading: "Conclusion",
        body: "A skin-friendly deodorant feels as good at the end of the day as when you put it on. Know your skin, read the label and choose a formula built for comfort as well as performance.",
      },
    ],
  },
  {
    slug: "how-to-choose-the-right-fragrance-for-your-lifestyle",
    title: "How to Choose the Right Fragrance for Your Lifestyle",
    excerpt:
      "The right fragrance fits the way you live — your mornings, your workouts and the places you spend your day. Here's how to match a scent to your routine rather than the other way round.",
    category: "fragrance-science",
    author,
    date: "2026-10-24",
    image: {
      src: "/images/blogs/blogs/blog3.png",
      alt: "A raised arm showing the underarm, in an orange top against a warm brown background",
      width: 500,
      height: 750,
    },
    sections: [
      {
        heading: "Think About Your Day",
        body: "A long commute, a desk job, an evening at the gym — each asks something different of your fragrance. Lighter, fresher notes tend to suit active days, while warmer notes can feel right for slower, cooler ones.",
      },
      {
        heading: "Know the Fragrance Families",
        body: "Citrus, aquatic, green, woody and floral scents each have their own character. Knowing which families you're drawn to narrows the choice quickly and makes trying new scents more rewarding.",
      },
      {
        heading: "Test Before You Commit",
        body: "Fragrance changes as it settles on skin. Wear a scent for a full day before deciding — what you notice in the first minute is rarely what you'll live with in the afternoon.",
      },
      {
        heading: "Let Your Routine Work Together",
        body: "Your deodorant is often the first scent you put on. Choosing one that complements, rather than competes with, the rest of your routine keeps your fragrance clear and considered.",
      },
      {
        heading: "Conclusion",
        body: "The best fragrance for you is the one that fits your life. Start with your day, explore the families you love and let SAVA's refined scents bring that freshness to every part of it.",
      },
    ],
  },
  {
    slug: "why-your-fragrance-fades-and-how-to-make-it-last-longer",
    title: "Why Your Fragrance Fades and How to Make It Last Longer",
    excerpt:
      "You put it on in the morning and by lunch it's gone. Fragrance fading isn't a mystery — it comes down to chemistry, skin and a few everyday habits you can change.",
    category: "fragrance-science",
    author,
    date: "2026-10-12",
    image: {
      src: "/images/blogs/blogs/blog6.png",
      alt: "Beads of sweat across a toned stomach after a workout",
      width: 4096,
      height: 2150,
    },
    sections: [
      {
        heading: "How Fragrance Evaporates",
        body: "Every fragrance is built from notes that evaporate at different speeds. Bright top notes fade first, heart notes carry the middle of the day and base notes linger longest. When a scent seems to disappear, it's often the top notes you're missing.",
      },
      {
        heading: "The Effect of Heat and Sweat",
        body: "Warmth speeds up evaporation, and moisture on the skin can dilute and change how a scent reads. That's why fragrance can feel fleeting on hot, active days — and why managing sweat helps it last.",
      },
      {
        heading: "Skin Type Plays a Part",
        body: "Dry skin holds on to fragrance less well than moisturised skin. Applying to clean, well-cared-for skin gives the scent something to settle into.",
      },
      {
        heading: "Simple Ways to Make It Last",
        body: "Apply to clean, dry skin, don't rub after applying, and store your products away from heat and sunlight. Pairing sweat control with fragrance, as SAVA does, keeps skin drier so the scent stays truer for longer.",
      },
      {
        heading: "Conclusion",
        body: "Fragrance fades for good reasons, but a few small habits go a long way. Look after your skin, manage moisture and let a well-formulated product do the rest.",
      },
    ],
  },
  {
    slug: "how-to-build-a-better-personal-care-routine",
    title: "How to Build a Better Personal Care Routine",
    excerpt:
      "The best routine is the one you'll actually keep. A few well-chosen steps, done consistently, do more for how you look and feel than a shelf full of products you rarely use.",
    category: "tips-lifestyle",
    author,
    date: "2026-09-30",
    image: {
      src: "/images/blogs/blogs/blog5.png",
      alt: "Two runners crossing a grey surface, with the words “The best routine is the one you can repeat”",
      width: 1080,
      height: 1350,
    },
    sections: [
      {
        heading: "Keep It Simple",
        body: "Start with the essentials: cleanse, care and protect. A short routine is easier to stick to, and consistency is what makes the difference over time.",
      },
      {
        heading: "Build Around Your Day",
        body: "Morning routines should get you out of the door feeling fresh and ready; evening routines are for recovery. Apply your antiperspirant at night onto clean, dry skin so it can get to work while you rest, then refresh in the morning.",
      },
      {
        heading: "Choose Products That Do More",
        body: "Products that combine benefits — like sweat control with refined fragrance — save steps without cutting corners. Fewer products, chosen well, make a routine easier to maintain.",
      },
      {
        heading: "Adjust as You Go",
        body: "Seasons, training plans and travel all change what your skin needs. Notice what's working and adapt, rather than starting over every time something changes.",
      },
      {
        heading: "Conclusion",
        body: "A better routine isn't about doing more. It's about doing the right few things every day, with products you trust.",
      },
    ],
  },
  {
    slug: "fragrance-and-confidence-the-power-of-feeling-fresh",
    title: "Fragrance and Confidence: The Power of Feeling Fresh",
    excerpt:
      "Feeling fresh changes how you move through the day. Scent and comfort have a quiet but real influence on confidence — in a meeting, on a run or out with friends.",
    category: "daily-freshness",
    author,
    date: "2026-09-18",
    image: {
      src: "/images/blogs/blogs/blog4.png",
      alt: "Clear bubbles linked together in pale blue liquid",
      width: 1280,
      height: 853,
    },
    sections: [
      {
        heading: "Scent and Memory",
        body: "Smell is closely tied to memory and mood. A familiar, well-loved fragrance can be grounding — a small signal that you're ready for whatever comes next.",
      },
      {
        heading: "Comfort Comes First",
        body: "Confidence is hard to find when you're worrying about sweat marks or odour. Reliable sweat control takes that worry away, so you can focus on what you're doing rather than how you feel.",
      },
      {
        heading: "Freshness That Lasts the Day",
        body: "A scent that fades by noon leaves you second-guessing in the afternoon. SAVA pairs advanced sweat control with refined fragrance so the fresh feeling you start with stays with you.",
      },
      {
        heading: "Conclusion",
        body: "Feeling fresh isn't vanity — it's comfort, ease and confidence in one. Choose products that help you feel like yourself from morning to night.",
      },
    ],
  },
  {
    slug: "how-to-stay-fresh-during-hot-and-humid-weather",
    title: "How to Stay Fresh During Hot and Humid Weather",
    excerpt:
      "Heat and humidity test every part of your routine. With a few adjustments, you can stay comfortable and fresh even on the stickiest days of the year.",
    category: "daily-freshness",
    author,
    date: "2026-09-05",
    image: {
      src: "/images/about/confidence_img_3.png",
      alt: "Droplets of water on a shoulder in a red swimsuit, beside a pool",
      width: 500,
      height: 750,
    },
    sections: [
      {
        heading: "Apply at the Right Time",
        body: "Antiperspirant works best on clean, completely dry skin. Applying it at night, when sweat glands are least active, gives it time to work before the heat of the day.",
      },
      {
        heading: "Dress for the Weather",
        body: "Loose, breathable fabrics such as cotton and linen let air move and moisture escape. Lighter colours reflect heat and show less.",
      },
      {
        heading: "Stay Hydrated",
        body: "Drinking enough water helps your body regulate its temperature. It's one of the simplest ways to feel better on hot days.",
      },
      {
        heading: "Refresh Through the Day",
        body: "A quick rinse and a fresh application after a workout or a long commute resets the clock. SAVA's compact stick is made to travel with you.",
      },
      {
        heading: "Conclusion",
        body: "Hot, humid weather doesn't have to mean feeling uncomfortable. Time your routine well, dress for the conditions and keep freshness close at hand.",
      },
    ],
  },
  {
    slug: "the-benefits-of-advanced-sweat-control-technology",
    title: "The Benefits of Advanced Sweat-Control Technology",
    excerpt:
      "Modern sweat control does far more than mask odour. Advanced formulations target moisture where it starts, so you stay drier, fresher and more comfortable for longer.",
    category: "sweat-control",
    author,
    date: "2026-08-22",
    image: {
      src: "/images/blogs/blogs/blog7.png",
      alt: "A man wiping his face with a towel after a hard workout at the gym",
      width: 800,
      height: 533,
    },
    sections: [
      {
        heading: "Deodorant vs. Antiperspirant",
        body: "Deodorants address odour; antiperspirants reduce the sweat itself. Advanced sweat-control formulas do both, managing moisture and keeping you smelling fresh.",
      },
      {
        heading: "How It Works",
        body: "Antiperspirant actives form temporary plugs near the surface of the sweat ducts, reducing how much sweat reaches the skin. The effect builds with regular use and fades naturally over time.",
      },
      {
        heading: "Comfort Without Compromise",
        body: "Today's formulations are designed to be effective and gentle, gliding on smoothly and drying quickly so they feel comfortable all day.",
      },
      {
        heading: "Made for Movement",
        body: "Whether you're training, commuting or presenting, dependable sweat control lets you focus on what you're doing. SAVA is built for days that don't slow down.",
      },
      {
        heading: "Conclusion",
        body: "Advanced sweat control means less moisture, lasting freshness and more confidence. It's personal care designed around the way you move.",
      },
    ],
  },
  {
    slug: "common-deodorant-mistakes-and-how-to-avoid-them",
    title: "Common Deodorant Mistakes and How to Avoid Them",
    excerpt:
      "Even the best formula can't do its job if it's used the wrong way. These everyday habits hold your deodorant back — and they're all easy to fix.",
    category: "sweat-control",
    author,
    date: "2026-08-14",
    image: {
      src: "/images/blogs/blogs/blog8.png",
      alt: "Runners' legs and shoes in a blur of motion on a blue track",
      width: 1024,
      height: 576,
    },
    sections: [
      {
        heading: "Applying to Damp Skin",
        body: "Moisture gets in the way of antiperspirant actives. Always dry your underarms fully after showering before you apply.",
      },
      {
        heading: "Only Applying in the Morning",
        body: "Night-time application gives antiperspirant time to work while your sweat glands are quiet. A morning top-up then keeps you fresh through the day.",
      },
      {
        heading: "Using Too Much",
        body: "More product doesn't mean more protection. Two or three even swipes are enough; any more can leave residue on skin and clothes.",
      },
      {
        heading: "Applying Straight After Shaving",
        body: "Freshly shaved skin can be sensitive. If you notice stinging, shave at night and apply in the morning, or give your skin a few minutes first.",
      },
      {
        heading: "Conclusion",
        body: "Small changes in how you apply your deodorant make a big difference to how well it works. Clean, dry skin, the right timing and the right amount are all it takes.",
      },
    ],
  },
  {
    slug: "how-to-find-your-signature-everyday-scent",
    title: "How to Find Your Signature Everyday Scent",
    excerpt:
      "A signature scent is one that feels unmistakably yours — easy to wear, every day. Finding it takes a little curiosity and a little patience.",
    category: "fragrance-science",
    author,
    date: "2026-08-03",
    image: {
      src: "/images/about/confidence_img_2.png",
      alt: "A perfumer dipping a testing strip into a glass vial in a fragrance lab",
      width: 1125,
      height: 750,
    },
    sections: [
      {
        heading: "Notice What You Love",
        body: "Think about the smells you're drawn to — fresh laundry, citrus peel, rain, wood. These everyday preferences point to the fragrance families that will suit you.",
      },
      {
        heading: "Wear It, Don't Just Smell It",
        body: "A scent on a testing strip is only half the story. Wear it on your skin through a full day to see how it develops and whether you still love it in the evening.",
      },
      {
        heading: "Keep It Wearable",
        body: "An everyday scent should feel easy, not overpowering. Look for something balanced enough for the office, the gym and everything in between.",
      },
      {
        heading: "Layer with Care",
        body: "Your signature scent starts with your routine. A refined, complementary deodorant fragrance — like SAVA's — makes a quiet foundation for everything else you wear.",
      },
      {
        heading: "Conclusion",
        body: "Your signature scent is the one you reach for without thinking. Explore, take your time and let it become part of who you are.",
      },
    ],
  },
];
