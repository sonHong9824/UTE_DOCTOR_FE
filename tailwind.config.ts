import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Doctor Theme Colors
        'doctor-primary': 'var(--doctor-primary)',
        'doctor-primary-foreground': 'var(--doctor-primary-foreground)',
        'doctor-secondary': 'var(--doctor-secondary)',
        'doctor-secondary-foreground': 'var(--doctor-secondary-foreground)',
        'doctor-accent': 'var(--doctor-accent)',
        'doctor-accent-foreground': 'var(--doctor-accent-foreground)',
        'doctor-muted': 'var(--doctor-muted)',
        'doctor-muted-foreground': 'var(--doctor-muted-foreground)',
        'doctor-border': 'var(--doctor-border)',
        'doctor-ring': 'var(--doctor-ring)',
        
        // Status Colors
        'status-success': 'var(--status-success)',
        'status-success-foreground': 'var(--status-success-foreground)',
        'status-warning': 'var(--status-warning)',
        'status-warning-foreground': 'var(--status-warning-foreground)',
        'status-error': 'var(--status-error)',
        'status-error-foreground': 'var(--status-error-foreground)',
        'status-info': 'var(--status-info)',
        'status-info-foreground': 'var(--status-info-foreground)',
      },
      backgroundImage: {
        "banner-bg": "url('/assets/banner-bg.jpg')",
      },
    },
  },
  plugins: [
    function({ addComponents }: any) {
      addComponents({
        '.doctor-card': {
          '@apply bg-card border border-doctor-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200': {},
        },
        '.doctor-card-header': {
          '@apply border-b border-doctor-border/50 pb-4': {},
        },
        '.doctor-button-primary': {
          '@apply bg-doctor-primary text-doctor-primary-foreground hover:bg-doctor-primary/90 shadow-sm': {},
        },
        '.doctor-button-secondary': {
          '@apply bg-doctor-secondary text-doctor-secondary-foreground hover:bg-doctor-secondary/80 border border-doctor-border': {},
        },
        '.doctor-sidebar': {
          '@apply bg-doctor-muted border-r border-doctor-border': {},
        },
        '.doctor-topbar': {
          '@apply bg-card border-b border-doctor-border': {},
        },
        '.doctor-nav-item': {
          '@apply flex items-center gap-3 px-4 py-3 rounded-lg text-doctor-muted-foreground hover:text-doctor-primary-foreground hover:bg-doctor-accent transition-all duration-200': {},
        },
        '.doctor-nav-item.active': {
          '@apply bg-doctor-primary text-doctor-primary-foreground shadow-sm': {},
        },
        '.doctor-status-success': {
          '@apply bg-status-success/10 text-status-success border border-status-success/20': {},
        },
        '.doctor-status-warning': {
          '@apply bg-status-warning/10 text-status-warning border border-status-warning/20': {},
        },
        '.doctor-status-error': {
          '@apply bg-status-error/10 text-status-error border border-status-error/20': {},
        },
        '.doctor-status-info': {
          '@apply bg-status-info/10 text-status-info border border-status-info/20': {},
        },
      })
    }
  ],
};
export default config;
