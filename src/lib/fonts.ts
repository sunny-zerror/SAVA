/*
 * Brand fonts. SAVA is set in Helvetica, which isn't on Google Fonts — until the
 * licensed files arrive, globals.css falls back to the system Helvetica / Arial stack.
 *
 * To wire up the licensed family, drop the files in public/fonts/ and use next/font/local:
 *   import localFont from "next/font/local";
 *   export const primary = localFont({ src: "../../public/fonts/helvetica/Helvetica-Bold.woff2", variable: "--ff-primary" });
 *   export const secondary = localFont({ src: "../../public/fonts/helvetica/Helvetica.woff2", variable: "--ff-secondary" });
 *   export const fontVariables = `${primary.variable} ${secondary.variable}`;
 */
export const fontVariables = "";
