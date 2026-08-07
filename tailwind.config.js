/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#10263F",
          soft: "#1B3A5C",
        },
        ocean: {
          DEFAULT: "#2F6690",
          light: "#5A8CB3",
        },
        sunset: {
          DEFAULT: "#E8734A",
          deep: "#D65F35",
        },
        coral: "#F0876B",
        "sea-green": "#3F7C6B",
        gold: "#C79A4B",
        sand: "#F1E6D2",
        canvas: "#FBF8F2",
      },
      fontFamily: {
        display: ["Instrument Sans", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        card: "1.25rem",
      },
      boxShadow: {
        soft: "0 20px 60px -20px rgba(16, 38, 63, 0.25)",
        lift: "0 12px 24px -8px rgba(16, 38, 63, 0.18)",
      },
      backgroundImage: {
        "sunset-fade": "linear-gradient(180deg, #F7B267 0%, #E8734A 55%, #D65F35 100%)",
        "ocean-fade": "linear-gradient(180deg, #5A8CB3 0%, #2F6690 60%, #10263F 100%)",
      },
    },
  },
  plugins: [],
};
