/** @type {import('tailwindcss').Config} */

// 不能是 “@/colors” 打包会失败
import {light, dark} from "./src/tailwind.vars";

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
                plain: "rgb(var(--plain) / <alpha-value>)",
                background: "rgb(var(--background) / <alpha-value>)",
                background0: "rgb(var(--background0) / <alpha-value>)",
                background1: "rgb(var(--background1) / <alpha-value>)",
                background2: "rgb(var(--background2) / <alpha-value>)",
                black: "rgb(var(--black) / <alpha-value>)",
                disabled: "rgb(var(--disabled) / <alpha-value>)",
                divider: "rgb(var(--divider))",
                error: "rgb(var(--error) / <alpha-value>)",
                grey0: "rgb(var(--grey0) / <alpha-value>)",
                grey1: "rgb(var(--grey1) / <alpha-value>)",
                grey2: "rgb(var(--grey2) / <alpha-value>)",
                grey3: "rgb(var(--grey3) / <alpha-value>)",
                grey4: "rgb(var(--grey4) / <alpha-value>)",
                grey5: "rgb(var(--grey5) / <alpha-value>)",
                greyOutline: "rgb(var(--greyoutline) / <alpha-value>)",
                primary: "rgb(var(--primary) / <alpha-value>)",
                searchBg: "rgb(var(--search-bg) / <alpha-value>)",
                secondary: "rgb(var(--secondary) / <alpha-value>)",
                success: "rgb(var(--success) / <alpha-value>)",
                warning: "rgb(var(--warning) / <alpha-value>)",
                white: "rgb(var(--white) / <alpha-value>)",
                cardBg: "rgb(var(--card-bg) / <alpha-value>)",
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
        ({addBase}: { addBase: (base: any) => void }) =>
            addBase({
                ":root": light,
                "@media (prefers-color-scheme: dark)": {
                    ":root": dark,
                },
            }),
    ],
};
