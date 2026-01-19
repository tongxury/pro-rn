export const light = {
  "--background": "255 255 255",
  "--foreground": "28 28 30", // Darker for better contrast

  "--card": "240 240 240", // Clean card look
  "--card-foreground": "28 28 30",

  "--popover": "255 255 255",
  "--popover-foreground": "28 28 30",

  "--primary": "113 80 255",
  "--primary-foreground": "255 255 255",

  "--secondary": "244 244 245", // Light gray for secondary actions
  "--secondary-foreground": "24 24 27",

  "--muted": "244 244 245",
  "--muted-foreground": "161 161 170", // Zinc-400 for premium subtle gray

  "--accent": "244 244 245",
  "--accent-foreground": "24 24 27",

  "--destructive": "239 68 68",
  "--destructive-foreground": "255 255 255",

  "--border": "228 228 231",
  "--input": "238 238 245",
  "--ring": "113 80 255",

  "--success": "34 197 94",
  "--warning": "245 158 11",

  "--fontSizeXXS": "9px",
  "--fontSizeXS": "12px",
  "--fontSizeSM": "14px",
  "--fontSizeMD": "16px",
  "--fontSizeLG": "18px",
  "--fontSizeXL": "20px",
};

export const dark = {
  "--background": "9 9 11", // Very dark (zinc-950)
  "--foreground": "250 250 250",

  "--card": "9 9 11",
  "--card-foreground": "250 250 250",

  "--popover": "9 9 11",
  "--popover-foreground": "250 250 250",

  "--primary": "113 80 255",
  "--primary-foreground": "255 255 255",

  "--secondary": "39 39 42", // Zinc-800
  "--secondary-foreground": "250 250 250",

  "--muted": "39 39 42",
  "--muted-foreground": "161 161 170",

  "--accent": "39 39 42",
  "--accent-foreground": "250 250 250",

  "--destructive": "127 29 29",
  "--destructive-foreground": "250 250 250",

  "--border": "39 39 42",
  "--input": "39 39 42",
  "--ring": "113 80 255",

  "--success": "34 197 94",
  "--warning": "245 158 11",

  "--fontSizeXXS": "9px",
  "--fontSizeXS": "12px",
  "--fontSizeSM": "14px",
  "--fontSizeMD": "16px",
  "--fontSizeLG": "18px",
  "--fontSizeXL": "20px",
};

type RemoveDashPrefix<T> = {
  [K in keyof T as K extends `--${infer R}` ? R : K]: T[K];
};

export type Theme = RemoveDashPrefix<typeof dark>;
