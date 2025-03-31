export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  // tailwind.config.js
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5",
        sidebar: "#F9FAFB",
        active: "#EEF4FF",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
