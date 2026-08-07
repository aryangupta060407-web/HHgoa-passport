// A "Builder Vibe" is not a random theme — it's a coherent restyle of the
// same frame system: one accent pair, one decorative motif, one mood.
// Every vibe still reads as HH Goa; only the light changes.

export const VIBES = {
  sunset: {
    id: "sunset",
    label: "Sunset Builder",
    emoji: "🌅",
    tagline: "Golden hour on Anjuna, deadline energy.",
    accent: "#E8734A",
    accentDeep: "#D65F35",
    base: "#10263F",
    pattern: "sunburst",
    gradient: "linear-gradient(180deg, #F7B267 0%, #E8734A 55%, #10263F 100%)",
  },
  ocean: {
    id: "ocean",
    label: "Ocean Builder",
    emoji: "🌊",
    tagline: "Steady, deep-focus, tide-paced shipping.",
    accent: "#2F6690",
    accentDeep: "#10263F",
    base: "#10263F",
    pattern: "wave",
    gradient: "linear-gradient(180deg, #5A8CB3 0%, #2F6690 60%, #10263F 100%)",
  },
  heritage: {
    id: "heritage",
    label: "Heritage Builder",
    emoji: "🏛",
    tagline: "Fontainhas facades, patient craftsmanship.",
    accent: "#C79A4B",
    accentDeep: "#8A6A2F",
    base: "#10263F",
    pattern: "azulejo",
    gradient: "linear-gradient(180deg, #F1E6D2 0%, #C79A4B 55%, #10263F 100%)",
  },
  tropical: {
    id: "tropical",
    label: "Tropical Builder",
    emoji: "🌴",
    tagline: "Palm shade, humid air, unhurried ambition.",
    accent: "#3F7C6B",
    accentDeep: "#264F44",
    base: "#10263F",
    pattern: "palm",
    gradient: "linear-gradient(180deg, #6FAE9B 0%, #3F7C6B 60%, #10263F 100%)",
  },
};

export const VIBE_LIST = Object.values(VIBES);
