import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Be Vietnam Pro: chọn vì tiêu đề sản phẩm tiếng Việt xuống 2 dòng ở
        // 13-14px trong lưới dày, và dấu chồng (ữ, ề, ộ) ở cỡ đó là chỗ font
        // Latin-first vỡ. Một họ nhiều trọng lượng, không ghép hai họ.
        sans: ["var(--font-bvp)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        // Màu thương hiệu Zoldify. Dùng bg-brand / text-brand / border-brand
        // thay cho bg-[#2C67C8] rải rác khắp nơi.
        brand: {
          DEFAULT: "#2C67C8",
          dark: "#22539F",
          // #1990AA cũ chỉ đạt 3.82:1 với chữ trắng ở đầu nhạt của gradient;
          // đo bằng pixel thật trên nút "Đăng Bán". Tông này đạt 5.6:1.
          accent: "#14708A",
          // Nền nhạt cho khối hero/danh mục, lệch về đúng hue thương hiệu
          // chứ không phải xám trung tính chung chung.
          tint: "var(--brand-tint)",
        },
        // Vai trò riêng cho giá và giảm giá. Sàn TMĐT Việt (Shopee/Tiki/Lazada)
        // đều dùng đỏ cho giá; đây là quy ước người mua đã đọc quen, không phải
        // phản xạ chọn màu theo ngành.
        price: {
          DEFAULT: "var(--price)",
          bg: "var(--price-bg)",
        },
        surface: {
          page: "var(--surface-page)",
          card: "var(--surface-card)",
          sunken: "var(--surface-sunken)",
        },
        ink: {
          DEFAULT: "var(--ink)",
          muted: "var(--ink-muted)",
          faint: "var(--ink-faint)",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // Semantic layering scale. Use these names instead of ad-hoc z-[9999].
      zIndex: {
        dropdown: "100",
        sticky: "200",
        backdrop: "300",
        modal: "400",
        toast: "500",
        tooltip: "600",
      },
    },
  },
  plugins: [],
};
export default config;
