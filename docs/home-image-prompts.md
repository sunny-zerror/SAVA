# /home — image prompts

Prompts for the generated imagery on the `/home` product page, run by hand in **Google AI Studio** (Playground) on the
Google AI Pro plan. Claude crops, colour-matches and converts the results into `public/images/experience/` and wires
them in — the page uses stand-ins until each one lands.

## How to run them

1. Open [aistudio.google.com](https://aistudio.google.com) → **Playground**. Pick **Nano Banana Pro** for the shots
   with the stick in them, **Nano Banana 2.1** for the rest. If you only have one of them, use it for everything.
2. In the run settings, set the **aspect ratio** and **output resolution** listed for the image (2K unless it says 4K).
3. Attach the reference photos listed under _Attach_ (they're in this repo, under `public/images/…`), paste the prompt,
   and run. Generate two or three and keep the best.
4. Save it as a PNG named exactly as the heading (e.g. `hero-flatlay.png`) into **`E:\Zerror\sava-refs\generated\`**.
5. Check the corners for a sparkle watermark. AI Studio shouldn't add one; the Gemini app does, so don't use the app.

Do the **Must** set first — the page's main sections wait on those. The **Nice** set has stand-ins that already work.

### Fix-up prompts

Send these as a follow-up in the same chat, with the bad result still in view.

- **Label wrong:**

  ```text
  Keep everything else exactly the same, but redraw the stick's printed label to match the attached reference photo exactly: the large vertical "sava" logo, the range name beside it, "OWN YOUR MOVEMENT", and the round water-drop badge. Same colours, same layout, nothing added.
  ```

- **Too busy where the text sits:**

  ```text
  Same image, but make the left third of the frame calmer and slightly darker, with nothing in it but soft, out-of-focus background.
  ```

### The stick, described

The prompts below with the stick in them already include this; it's here if you write your own.

```text
Use the attached photos as the exact reference for the SAVA stick and copy it faithfully: a matte, dusty-blue twist-up antiperspirant stick with an oval body that narrows slightly at the waist, a domed cap, and a ribbed twist knob set into a notch at the base. On the front, the large navy "sava" logo runs vertically up the left side, with "BALANCED" in white beside it, "OWN YOUR MOVEMENT" in navy, and a round water-drop badge reading "DUAL-ACTION SWEAT AND ODOR DEFENSE". Keep the shape, proportions, colours and print exactly as in the reference — no extra text, no redesign.
```

---

## Must

### hero-flatlay

Intro (desktop) — the 3D stick lies on this surface. **16:9 · 4K · Nano Banana 2.1 · Attach: nothing**

```text
Top-down flat lay photograph, camera pointing straight down at a warm honey-oak tabletop with fine natural grain, lit by soft early-morning sun from the upper left that casts long, soft shadows of a window frame and a few leaves across the surface. Arranged loosely around the edges only: a folded navy cotton gym towel in the top-right corner, a matte black sports watch and a white wireless-earbuds case near the bottom right, a set of keys and a small round sage-green ceramic dish on the left edge, a sprig of eucalyptus at the bottom left. The centre of the frame — a wide diagonal band from the upper left to the lower right — is completely empty tabletop, because a product will be placed there later. Calm, warm, premium editorial styling, photorealistic, crisp detail, subtle film grain. No people, no products, no text, no logos, no watermark.
```

### hero-flatlay-mobile

Intro (phones). **9:16 · 2K · Nano Banana 2.1 · Attach: nothing**

```text
Tall vertical top-down flat lay photograph, camera pointing straight down at a warm honey-oak tabletop with fine natural grain, lit by soft early-morning sun from the upper left that casts long, soft shadows of a window frame and a few leaves across the surface. Objects only along the top and bottom edges: a folded navy cotton gym towel and a sprig of eucalyptus at the top, a matte black sports watch, a white wireless-earbuds case and a small round sage-green ceramic dish at the bottom. The whole middle of the frame is completely empty tabletop, because a product will be placed there later. Calm, warm, premium editorial styling, photorealistic, crisp detail, subtle film grain. No people, no products, no text, no logos, no watermark.
```

### feature-sweat

Features, step 1 — "Stops sweat at the source". **3:2 · 2K · Nano Banana 2.1 · Attach:
`public/images/products/shared/sava-sweat-ducts.png`**

```text
Cinematic scientific 3D render: a macro cross-section through human underarm skin. A single sweat duct rises from a coiled gland deep below, through translucent, glassy layers of tissue, to a pore at the skin's surface. Near the top of the duct a cluster of fine white mineral crystals forms a temporary plug, holding back tiny droplets of sweat beneath it. Soft translucent tissue in cool pale blues under a warm, natural skin surface, studio rim light, shallow depth of field, deep navy falling off into darkness at the edges. Keep the plug and the pore in the right half of the frame and the left third quiet and dark. Elegant, precise, keynote-quality render. Use the attached image only as a loose reference for the subject — remove all of its text, labels, grid lines and arrows. No text, no watermark.
```

### feature-scent

Features, step 2 — "Freshness on a timer". **3:2 · 2K · Nano Banana 2.1 · Attach: nothing**

```text
Macro photograph of hundreds of tiny translucent fragrance micro-capsules — clear, glassy pearls a fraction of a millimetre across — drifting in the air. A few capsules in the right half of the frame are bursting open, each releasing a fine, glowing wisp of mist. Airy morning light in white and pale powder blue, with a hint of fresh citrus zest blurred far in the background. Extremely shallow depth of field, soft bokeh, ethereal and clean, keynote quality. Keep the left third soft and out of focus. No text, no products, no watermark.
```

### feature-apply

Features, step 3 — "Kind to sensitive skin". **3:2 · 2K · Nano Banana Pro · Attach:
`public/images/products/sava-balanced.jpg`, `public/images/products/balanced/sava-balanced-angle.jpg`**

```text
Bright, minimal bathroom in soft morning window light. A young Indian woman in her late twenties, wearing a fitted white tank top, hair tied back, raises one arm and glides the SAVA stick across her underarm — relaxed, confident, a slight smile — framed from the waist up in three-quarter view, standing in the right half of the frame. The cap is off and rests on the stone counter, and the top of the stick shows a smooth white dome of formula. Use the attached photos as the exact reference for the stick and copy it faithfully: matte dusty-blue oval body that narrows slightly at the waist, ribbed twist knob in a notch at the base, the large navy vertical "sava" logo with "BALANCED" in white beside it, "OWN YOUR MOVEMENT" and the round water-drop badge — same shape, colours and print, no extra text. Natural skin texture, tasteful, warm white and pale stone palette with the stick's dusty blue as the only strong colour. Leave the left third as soft, out-of-focus bathroom wall. Photorealistic editorial photography, 50mm lens. No other text, no watermark.
```

### stain-free

The "no marks" section, full screen. **16:9 · 4K · Nano Banana Pro · Attach: `public/images/products/sava-balanced.jpg`,
`public/images/products/balanced/sava-balanced-angle.jpg`**

```text
Overhead editorial still life on pale limestone: a crisply folded white Egyptian-cotton shirt beside a softly draped black silk shirt, both spotless, fine fabric weave visible. The SAVA stick lies diagonally on the white shirt, label facing up. Use the attached photos as the exact reference for the stick and copy it faithfully: matte dusty-blue oval body that narrows slightly at the waist, domed cap, ribbed twist knob in a notch at the base, the large navy vertical "sava" logo with "BALANCED" in white beside it, "OWN YOUR MOVEMENT" and the round water-drop badge — same shape, colours and print, no extra text. Soft diffused daylight from the upper left, gentle natural shadows, calm and premium. Keep the fabrics and the stick in the right two-thirds of the frame; the left third is plain limestone. Photorealistic, high detail. No other text, no logos, no watermark.
```

### heat-commute

The "built for heat" section, full screen. **16:9 · 4K · Nano Banana 2.1 · Attach: nothing**

```text
Cinematic photograph inside a Mumbai local train on a hot, humid afternoon. A young Indian man in a crisp light-blue linen shirt stands near the open doorway holding the overhead rail, calm, composed and fresh, while the city slides past outside in golden heat haze. Warm low sun, glowing dust in the air, motion blur outside the train, sharp subject, natural skin. He stands in the right half of the frame; the left third is the dim interior of the carriage. Palette of warm amber light with his cool blue shirt. Photorealistic, 35mm lens. No text, no logos, no watermark.
```

### closing-shelf

The closing section (your second Oryzo screenshot). **3:2 · 4K · Nano Banana Pro · Attach:
`public/images/products/sava-balanced.jpg`, `public/images/products/balanced/sava-balanced-angle.jpg`**

```text
Eye-level interior photograph of a calm, sunlit corner: a warm oak shelf under a pale grey perforated pegboard wall holding a few tidy objects — a small trailing plant in a white pot, a folded linen towel, over-ear headphones on a hook. On the shelf, the SAVA stick stands upright on a small round travertine tray with its label facing the camera, next to a matte black wristwatch and a ceramic cup. Use the attached photos as the exact reference for the stick and copy it faithfully: matte dusty-blue oval body that narrows slightly at the waist, domed cap, ribbed twist knob in a notch at the base, the large navy vertical "sava" logo with "BALANCED" in white beside it, "OWN YOUR MOVEMENT" and the round water-drop badge — same shape, colours and print, no extra text. Soft afternoon sun with dappled leaf shadows across the pegboard, shallow depth of field, warm and quiet. The stick sits slightly right of centre; the left third is quiet wall and shelf. Photorealistic, 50mm lens. No other text, no watermark.
```

### scent-citrus-tide

The range — Balanced. **1:1 · 2K · Nano Banana 2.1 · Attach: nothing**

```text
Studio still life for a fragrance called Citrus Tide: slices of yuzu, blood orange and lime dropping into cool, clear sea water, a crown of water splashing up, droplets frozen mid-air, small bubbles. Soft gradient backdrop from dusty blue at the bottom to pale misty blue at the top, crisp high-speed studio lighting. Fresh, bright, balanced. Square composition, subject centred. No text, no products, no watermark.
```

### scent-silver-lining

The range — Kinetic. **1:1 · 2K · Nano Banana 2.1 · Attach: nothing**

```text
Studio still life for a fragrance called Silver Lining: drops of liquid silver and clear water colliding mid-air, a soft white cloud of mist with bright silver edges catching the light, thin streaks of cobalt blue reflected in the metal. Pale brushed-aluminium backdrop, crisp high-speed studio lighting. Energising, cool, clean. Square composition, subject centred. No text, no products, no watermark.
```

### scent-forest-air

The range — Renewed. **1:1 · 2K · Nano Banana 2.1 · Attach: nothing**

```text
Studio still life for a fragrance called Forest Air: dewy pine sprigs, unfurling fern fronds and soft moss drifting in cool morning mist, a few water droplets catching the light. Deep forest-green backdrop with soft mint-green highlights. Calm, green, restorative. Square composition, subject centred, shallow depth of field. No text, no products, no watermark.
```

### scent-amber-wood

The range — Grounded. **1:1 · 2K · Nano Banana 2.1 · Attach: nothing**

```text
Studio still life for a fragrance called Amber Wood: glowing pieces of golden amber resin and curled cedar-wood shavings on dark walnut, a thin wisp of smoke, warm bronze light against a deep chocolate-brown backdrop. Warm, grounded, rich. Square composition, subject centred, shallow depth of field. No text, no products, no watermark.
```

---

## Nice

### day-run

A day with SAVA — 06:30. **4:5 · 2K · Nano Banana 2.1 · Attach: nothing**

```text
Dawn on Mumbai's Marine Drive. A young Indian woman runner in navy running gear has just finished her run and pauses at the sea wall, breathing easy, fresh and confident, the curve of the promenade and the city's lights behind her in soft pink-and-blue morning light. Candid editorial sports photography, natural skin, 85mm lens, vertical composition. No text, no logos, no watermark.
```

### day-commute

A day with SAVA — 09:00. **4:5 · 2K · Nano Banana Pro · Attach: `public/images/products/sava-balanced.jpg`**

```text
9 a.m. inside a modern Indian metro train. A young professional man in a crisp white shirt stands holding the rail, relaxed and fresh among other commuters, soft daylight through the windows. The SAVA stick peeks out of the open top of his canvas tote bag — copy it exactly from the attached photo: matte dusty-blue oval body, domed cap, the large navy vertical "sava" logo with "BALANCED" in white. Candid editorial photography, 35mm lens, vertical composition. No other text, no watermark.
```

### day-meetings

A day with SAVA — 13:00. **4:5 · 2K · Nano Banana 2.1 · Attach: nothing**

```text
Midday in a glass-walled meeting room in a modern Bengaluru office. A confident Indian woman in a light linen blazer presents to colleagues, calm, composed and visibly comfortable despite the bright sun outside. Natural window light, editorial business photography, 50mm lens, vertical composition. No text, no logos, no watermark.
```

### day-gym

A day with SAVA — 18:30. **4:5 · 2K · Nano Banana Pro · Attach: `public/images/products/sava-balanced.jpg`,
`public/images/products/balanced/sava-balanced-angle.jpg`**

```text
Evening in a modern gym with warm, moody light. On a wooden bench in the foreground, the SAVA stick stands upright next to a steel water bottle and a folded navy towel, label facing the camera; a man finishes a set of rows in the soft-focus background. Copy the stick exactly from the attached photos: matte dusty-blue oval body that narrows slightly at the waist, domed cap, ribbed twist knob in a notch at the base, the large navy vertical "sava" logo with "BALANCED" in white, "OWN YOUR MOVEMENT" and the round water-drop badge. Shallow depth of field, editorial sports photography, vertical composition. No other text, no watermark.
```

### day-night

A day with SAVA — 22:00. **4:5 · 2K · Nano Banana 2.1 · Attach: nothing**

```text
Night on a Mumbai rooftop. Three friends in their late twenties laugh around a candle-lit dinner table under warm string lights, the city skyline glowing out of focus behind them, everyone relaxed and fresh at the end of a long day. Candid, warm editorial photography, 35mm lens, vertical composition. No text, no logos, no watermark.
```

### bento-pocket

Tile grid — "Pocket-sized". **1:1 · 2K · Nano Banana Pro · Attach: `public/images/products/sava-balanced.jpg`,
`public/images/products/balanced/sava-balanced-angle.jpg`**

```text
Close-up of the back pocket of light-wash denim jeans with the SAVA stick sliding out of it, label visible. Copy the stick exactly from the attached photos: matte dusty-blue oval body, domed cap, the large navy vertical "sava" logo with "BALANCED" in white beside it. Soft daylight, shallow depth of field, calm and minimal. Square composition. No other text, no watermark.
```

### bento-gymbag

Tile grid — "Gym-bag ready". **1:1 · 2K · Nano Banana Pro · Attach: `public/images/products/sava-balanced.jpg`,
`public/images/products/balanced/sava-balanced-angle.jpg`**

```text
Overhead flat lay inside an open navy gym bag: the SAVA stick, white wireless earbuds, a rolled grey towel, a steel water bottle and a resistance band, neatly packed. Copy the stick exactly from the attached photos: matte dusty-blue oval body, domed cap, ribbed twist knob in a notch at the base, the large navy vertical "sava" logo with "BALANCED" in white. Soft daylight, square composition. No other text, no watermark.
```

### bento-twist

Tile grid — "One twist". **1:1 · 2K · Nano Banana Pro · Attach: `public/images/products/balanced/sava-balanced-base.jpg`,
`public/images/products/sava-balanced.jpg`**

```text
Extreme close-up of a thumb turning the ribbed twist knob at the base of the SAVA stick, against a soft dusty-blue backdrop. Match the attached photos exactly: the knob is a ribbed wheel set into a rectangular notch cut into the front and back of the stick's flared foot, in the same matte dusty blue as the body. Crisp studio macro lighting, square composition. No text, no watermark.
```

### range-lineup

The specs section header. **16:9 · 4K · Nano Banana Pro · Attach: `public/images/products/sava-balanced.jpg`,
`public/images/products/sava-kinetic.jpg`, `public/images/products/sava-renewed.jpg`,
`public/images/products/grounded/sava-grounded-front.jpg`**

```text
Studio product photograph of four SAVA sticks standing in a row on a pale stone plinth, labels facing the camera, evenly spaced: from left to right matte dusty blue (Balanced), brushed silver (Kinetic), deep forest green (Renewed) and dark chocolate brown (Grounded). Each stick must match its attached reference photo exactly — the same mould, cap and twist knob, and the same vertical "sava" logo and print in its own colours. Soft gradient backdrop from pale misty blue to white, gentle reflections on the plinth, crisp soft shadows, keynote-style hero product shot. No other text, no watermark.
```
