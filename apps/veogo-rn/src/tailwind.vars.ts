export const light = {
    "--plain": "255 255 255",
    "--background": "250 250 250",
    "--background0": "245 245 245",
    "--background1": "240 240 240",
    "--background2": "235 235 235",
    "--black": "17 24 39",
    "--disabled": "229 231 235",
    "--divider": "0 0 0 0.08",
    "--error": "239 68 68",
    "--grey0": "55 65 81",
    "--grey1": "75 85 99",
    "--grey2": "107 114 128",
    "--grey3": "156 163 175",
    "--grey4": "209 213 219",
    "--grey5": "243 244 246",
    "--greyoutline": "156 163 175",
    "--primary": "10 217 162",
    "--search-bg": "55 65 81",
    "--secondary": "168 85 247",
    "--success": "34 197 94",
    "--warning": "245 158 11",
    "--white": "0 0 0",
    "--card-bg": "255 255 255",

    "--fontSizeXXS": "9px",
    "--fontSizeXS": "12px",
    "--fontSizeSM": "14px",
    "--fontSizeMD": "16px",
    "--fontSizeLG": "18px",
    "--fontSizeXL": "20px",
};

export const dark = {
    "--plain": "0 0 0",
    "--background": "15 15 15",
    "--background0": "20 20 20",
    "--background1": "25 25 25",
    "--background2": "30 30 30",
    "--black": "243 244 246",
    "--disabled": "75 85 99",
    "--divider": "255 255 255 0.08",
    "--error": "248 113 113",
    "--grey0": "243 244 246",
    "--grey1": "209 213 219",
    "--grey2": "156 163 175",
    "--grey3": "107 114 128",
    "--grey4": "75 85 99",
    "--grey5": "31 31 31",
    "--greyoutline": "75 85 99",
    "--primary": "10 217 162",
    "--search-bg": "31 41 55",
    "--secondary": "196 181 253",
    "--success": "94 222 128",
    "--warning": "251 191 36",
    "--white": "255 255 255",
    "--card-bg": "20 20 20",

    "--fontSizeXXS": "9px",
    "--fontSizeXS": "12px",
    "--fontSizeSM": "14px",
    "--fontSizeMD": "16px",
    "--fontSizeLG": "18px",
    "--fontSizeXL": "20px",
};

// 添加新的类型定义
type RemoveDashPrefix<T> = {
    [K in keyof T as K extends `--${infer R}` ? R : K]: T[K];
};

export type Theme = RemoveDashPrefix<typeof dark>;
