/** @type {import('tailwindcss').Config} */

// 不能是 “@/colors” 打包会失败
import { dark, light } from "./src/tailwind.vars";

module.exports = {
    darkMode: "media",
    // NOTE: Update this to include the paths to all of your component files.
    content: [
        "./src/app/**/*.{js,jsx,ts,tsx}",
        "./src/components/**/*.{js,jsx,ts,tsx}",
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                border: "rgb(var(--border) / <alpha-value>)",
                input: "rgb(var(--input) / <alpha-value>)",
                ring: "rgb(var(--ring) / <alpha-value>)",
                background: "rgb(var(--background) / <alpha-value>)",
                foreground: "rgb(var(--foreground) / <alpha-value>)",
                primary: {
                    DEFAULT: "rgb(var(--primary) / <alpha-value>)",
                    foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
                },
                secondary: {
                    DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
                    foreground: "rgb(var(--secondary-foreground) / <alpha-value>)",
                },
                destructive: {
                    DEFAULT: "rgb(var(--destructive) / <alpha-value>)",
                    foreground: "rgb(var(--destructive-foreground) / <alpha-value>)",
                },
                muted: {
                    DEFAULT: "rgb(var(--muted) / <alpha-value>)",
                    foreground: "rgb(var(--muted-foreground) / <alpha-value>)",
                },
                accent: {
                    DEFAULT: "rgb(var(--accent) / <alpha-value>)",
                    foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
                },
                popover: {
                    DEFAULT: "rgb(var(--popover) / <alpha-value>)",
                    foreground: "rgb(var(--popover-foreground) / <alpha-value>)",
                },
                card: {
                    DEFAULT: "rgb(var(--card) / <alpha-value>)",
                    foreground: "rgb(var(--card-foreground) / <alpha-value>)",
                },
                success: "rgb(var(--success) / <alpha-value>)",
                warning: "rgb(var(--warning) / <alpha-value>)",
            },
            fontSize: {
                xxs: "var(--fontSizeXXS)",
                xs: "var(--fontSizeXS)",
                sm: "var(--fontSizeSM)",
                md: "var(--fontSizeMD)",
                lg: "var(--fontSizeLG)",
                xl: "var(--fontSizeXL)",
            },
        },
    },
    plugins: [
        // Set a default value on the `:root` element
        ({ addBase }: { addBase: (base: any) => void }) =>
            addBase({
                ":root": light,
                "@media (prefers-color-scheme: dark)": {
                    ":root": dark,
                },
            }),
    ],
};
