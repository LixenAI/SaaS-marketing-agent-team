/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive) / <alpha-value>)", foreground: "hsl(var(--destructive-foreground) / <alpha-value>)" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        'bg-base': '#0A0A0F', 'bg-surface': '#111118', 'bg-elevated': '#1A1A24',
        'bg-hover': '#22222E', 'bg-active': '#2A2A38',
        'accent-violet': '#8B5CF6', 'accent-violet-bright': '#A78BFA',
        'accent-cyan': '#06B6D4', 'accent-cyan-bright': '#22D3EE',
        'accent-amber': '#F59E0B', 'accent-rose': '#F43F5E', 'accent-emerald': '#10B981',
        'text-primary': '#F1F5F9', 'text-secondary': '#94A3B8',
        'text-tertiary': '#64748B', 'text-disabled': '#475569',
      },
      fontFamily: {
        'headline': ['"Space Grotesk"', 'sans-serif'],
        'body': ['"Inter"', 'sans-serif'],
        'mono': ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)", lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)',
        'elevated': '0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)',
        'modal': '0 24px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
        'glow-violet': '0 0 20px rgba(139,92,246,0.3), 0 0 60px rgba(139,92,246,0.1)',
        'glow-cyan': '0 0 20px rgba(6,182,212,0.3), 0 0 60px rgba(6,182,212,0.1)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out-expo': 'cubic-bezier(0.87, 0, 0.13, 1)',
        'out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
