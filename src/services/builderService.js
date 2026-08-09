import { CONFIG } from '../config/api';

/**
 * Neutral SVG Data URL for default/demo avatars (prevents fake stock photos)
 */
const DEFAULT_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%2300240d"/><circle cx="50" cy="40" r="20" fill="%23005e22"/><path d="M20 90 C 20 65, 80 65, 80 90 Z" fill="%23005e22"/></svg>`;

/**
 * Initial Demo Participants
 */
const DEMO_RADAR_BUILDERS = [
  {
    id: 'HHG-2026-1082',
    builderNumber: 82,
    firstName: 'Aryan',
    lastName: 'Kulkarni',
    role: 'System Architect',
    location: 'Goa, India',
    archetype: 'Infrastructure',
    techStack: 'Rust, Solana, TypeScript, WebAssembly',
    photo: DEFAULT_AVATAR,
    timestamp: 'Demo Entry',
    isDemo: true,
  },
  {
    id: 'HHG-2026-3091',
    builderNumber: 14,
    firstName: 'Riya',
    lastName: 'Sen',
    role: 'Creative Developer',
    location: 'Mumbai, India',
    archetype: 'Creative Builder',
    techStack: 'Three.js, GLSL, React, TailwindCSS',
    photo: DEFAULT_AVATAR,
    timestamp: 'Demo Entry',
    isDemo: true,
  },
  {
    id: 'HHG-2026-4412',
    builderNumber: 199,
    firstName: 'Vedant',
    lastName: 'Nair',
    role: 'Full-Stack Engineer',
    location: 'Bengaluru, India',
    archetype: 'Protocol Builder',
    techStack: 'Node.js, GraphQL, React, PostgreSQL',
    photo: DEFAULT_AVATAR,
    timestamp: 'Demo Entry',
    isDemo: true,
  },
  {
    id: 'HHG-2026-8820',
    builderNumber: 47,
    firstName: 'Zara',
    lastName: 'Khan',
    role: 'AI Researcher',
    location: 'Delhi, India',
    archetype: 'AI / ML Engineer',
    techStack: 'PyTorch, Python, Transformers, CUDA',
    photo: DEFAULT_AVATAR,
    timestamp: 'Demo Entry',
    isDemo: true,
  },
];

/**
 * Persistent Local Mock Storage Helper
 */
const getStoredMockData = () => {
  try {
    const stored = localStorage.getItem('hhgoa_mock_radar');
    return stored ? JSON.parse(stored) : DEMO_RADAR_BUILDERS;
  } catch (e) {
    return DEMO_RADAR_BUILDERS;
  }
};

const setStoredMockData = (data) => {
  try {
    localStorage.setItem('hhgoa_mock_radar', JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage unavailable for mock persistence');
  }
};

/**
 * Production-Ready Service Layer
 */
export const builderService = {
  /**
   * Fetch aggregate statistics
   */
  getBuilderStats: async () => {
    if (CONFIG.USE_MOCK_DATA) {
      const storedRadar = getStoredMockData();
      return {
        isMock: true,
        activeBuilders: 247 + (storedRadar.length - DEMO_RADAR_BUILDERS.length),
        passesGenerated: 384 + (storedRadar.length - DEMO_RADAR_BUILDERS.length),
        frameInGoaPosts: 512,
        projectsBuilding: 88,
        citiesRepresented: 34,
      };
    }

    const response = await fetch(`${CONFIG.API_BASE_URL}/stats`, {
      headers: {
        'Content-Type': 'application/json',
        ...(CONFIG.API_KEY && { 'X-API-Key': CONFIG.API_KEY }),
      },
    });

    if (!response.ok) throw new Error('Failed to fetch live builder stats');
    const data = await response.json();
    return { ...data, isMock: false };
  },

  /**
   * Fetch participants for the Community Radar
   */
  getRadarParticipants: async () => {
    if (CONFIG.USE_MOCK_DATA) {
      return getStoredMockData();
    }

    const response = await fetch(`${CONFIG.API_BASE_URL}/participants`, {
      headers: {
        'Content-Type': 'application/json',
        ...(CONFIG.API_KEY && { 'X-API-Key': CONFIG.API_KEY }),
      },
    });

    if (!response.ok) throw new Error('Failed to fetch radar participants');
    return await response.json();
  },

  /**
   * Register or persist a newly created Builder Profile
   */
  createBuilderProfile: async (newProfile) => {
    const payload = {
      ...newProfile,
      createdAt: new Date().toISOString(),
    };

    if (CONFIG.USE_MOCK_DATA) {
      const currentList = getStoredMockData();
      const mockEntry = {
        ...payload,
        timestamp: 'Just now',
        isDemo: true,
      };
      const updated = [mockEntry, ...currentList];
      setStoredMockData(updated);
      return mockEntry;
    }

    const response = await fetch(`${CONFIG.API_BASE_URL}/participants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(CONFIG.API_KEY && { 'X-API-Key': CONFIG.API_KEY }),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error('Failed to register builder profile');
    return await response.json();
  },
};