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
          tint: "oklch(var(--brand-tint) / <alpha-value>)",
        },
        // Vai trò riêng cho giá và giảm giá. Sàn TMĐT Việt (Shopee/Tiki/Lazada)
        // đều dùng đỏ cho giá; đây là quy ước người mua đã đọc quen, không phải
        // phản xạ chọn màu theo ngành.
        price: {
          DEFAULT: "oklch(var(--price) / <alpha-value>)",
          bg: "oklch(var(--price-bg) / <alpha-value>)",
        },
        surface: {
          page: "oklch(var(--surface-page) / <alpha-value>)",
          card: "oklch(var(--surface-card) / <alpha-value>)",
          sunken: "oklch(var(--surface-sunken) / <alpha-value>)",
        },
        chrome: {
          DEFAULT: "oklch(var(--chrome) / <alpha-value>)",
          soft: "oklch(var(--chrome-soft) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "oklch(var(--ink) / <alpha-value>)",
          muted: "oklch(var(--ink-muted) / <alpha-value>)",
          faint: "oklch(var(--ink-faint) / <alpha-value>)",
        },
        // Năm vai trò trạng thái dùng chung cho cả 6 loại trạng thái backend.
        // Đừng viết thẳng các lớp này ra trang — đi qua <StatusBadge /> để chỉ
        // có MỘT nơi biết mã nào ứng với màu nào.
        state: {
          "pending-fg": "oklch(var(--state-pending-fg) / <alpha-value>)",
          "pending-bg": "oklch(var(--state-pending-bg) / <alpha-value>)",
          "progress-fg": "oklch(var(--state-progress-fg) / <alpha-value>)",
          "progress-bg": "oklch(var(--state-progress-bg) / <alpha-value>)",
          "success-fg": "oklch(var(--state-success-fg) / <alpha-value>)",
          "success-bg": "oklch(var(--state-success-bg) / <alpha-value>)",
          "danger-fg": "oklch(var(--state-danger-fg) / <alpha-value>)",
          "danger-bg": "oklch(var(--state-danger-bg) / <alpha-value>)",
          "neutral-fg": "oklch(var(--state-neutral-fg) / <alpha-value>)",
          "neutral-bg": "oklch(var(--state-neutral-bg) / <alpha-value>)",
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
      // Thang chữ cố định. Trước đây mỗi file tự chọn một cỡ bằng px tuỳ hứng:
      // text-[13.5px], text-[14.5px], text-[11.5px], text-[16px], text-[12.5px]
      // — không có thứ bậc chung nào giữa các trang.
      fontSize: {
        display: ["28px", { lineHeight: "34px", fontWeight: "700" }],
        h1: ["22px", { lineHeight: "28px", fontWeight: "700" }],
        h2: ["18px", { lineHeight: "24px", fontWeight: "700" }],
        h3: ["15px", { lineHeight: "20px", fontWeight: "600" }],
        body: ["14px", { lineHeight: "22px" }],
        small: ["13px", { lineHeight: "18px" }],
        caption: ["11.5px", { lineHeight: "16px", fontWeight: "600" }],
      },
      // Đúng ba mức nổi. Mức 0 là chỉ viền, không cần lớp nào.
      boxShadow: {
        raise: "0 8px 24px -12px rgba(20,30,60,0.18)",
        float: "0 12px 32px -8px rgba(20,30,60,0.24)",
      },
      // Thang opacity mặc định của Tailwind chỉ có bội số của 5 (0,5,10,15,...).
      // Hệ viền của Zoldify dùng 8% và 12%, nên `border-ink/8` KHÔNG sinh ra CSS
      // nào — im lặng, không cảnh báo. Đây là nguyên nhân thứ hai, độc lập với
      // chuyện token viết bằng var(). Đo ngày 2026-08-06.
      opacity: {
        8: "0.08",
        12: "0.12",
        16: "0.16",
      },
      borderRadius: {
        // lg/md/sm giữ nguyên cho shadcn dùng.
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Ba mức bo của Zoldify, đặt theo VAI TRÒ chứ không theo cỡ, để không
        // còn cảnh mỗi trang tự chọn rounded-lg hay rounded-xl cho cùng một loại
        // phần tử.
        //
        // Hạ từ 10/14/16 xuống 4/4/8 ngày 2026-08-08. Bo góc lớn cộng với
        // rounded-full ở ô tìm kiếm và chip là ngôn ngữ "app thân thiện"; sàn
        // này đọc đúng hơn ở dạng SỔ KÊ — hairline, góc gần vuông, cột thẳng.
        control: "4px",
        card: "4px",
        modal: "8px",
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
