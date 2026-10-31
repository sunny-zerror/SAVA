import { Inter, Inter_Tight } from "next/font/google";

/*
 * Brand fonts, self-hosted by next/font: identical on every OS (no Arial fallback on Windows) and
 * no layout shift. SAVA is set in Helvetica; until the licensed files arrive, the closest open
 * grotesks stand in — Inter Tight for display and headings, Inter for text. latin-ext carries ₹.
 *
 * To switch to the licensed family, load it with next/font/local under the same variable names:
 *   import localFont from "next/font/local";
 *   const primary = localFont({ src: "../../public/fonts/helvetica/HelveticaNowDisplay.woff2", variable: "--ff-primary" });
 * The type roles in src/styles/globals.css pick these up through --font-primary / --font-secondary.
 */
const primary = Inter_Tight({ subsets: ["latin", "latin-ext"], variable: "--ff-primary", display: "swap" });
const secondary = Inter({ subsets: ["latin", "latin-ext"], variable: "--ff-secondary", display: "swap" });

export const fontVariables = `${primary.variable} ${secondary.variable}`;
