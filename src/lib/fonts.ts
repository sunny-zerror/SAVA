/*
 * Brand fonts. Swap the two families here and the whole site follows:
 * headings use `font-primary`, body/UI uses `font-secondary`.
 *
 * For licensed fonts, drop the files in public/fonts/ and use next/font/local:
 *   import localFont from "next/font/local";
 *   export const primary = localFont({ src: "../../public/fonts/brand/Brand.woff2", variable: "--ff-primary" });
 */
import { Cormorant_Garamond, Inter } from "next/font/google";

export const primary = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--ff-primary",
  display: "swap",
});

export const secondary = Inter({
  subsets: ["latin"],
  variable: "--ff-secondary",
  display: "swap",
});

export const fontVariables = `${primary.variable} ${secondary.variable}`;
