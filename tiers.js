// ── QOORE TIER CONFIG ─────────────────────────────────────────
// Single source of truth for all tier limits and features.
// Imported by both frontend and (future) Cloud Functions.
// Never hardcode limits elsewhere.

const TIER_CONFIG = {
  free: {
    label: 'Free',
    maxTeams: 1,
    maxCategoriesPerTeam: 1,
    maxMembersPerTeam: 2,
    maxPlayersPerCategory: 10,
    features: {
      exportPDF:     false,
      exportExcel:   false,
      advancedStats: false,
      fullHistory:   false,
      branding:      false,
      dashboard:     false,
    }
  },
  pro: {
    label: 'Pro',
    price: { monthly: 9, annual: 79 },
    maxTeams: 2,
    maxCategoriesPerTeam: 3,
    maxMembersPerTeam: 5,
    maxPlayersPerCategory: 20,
    features: {
      exportPDF:     true,
      exportExcel:   true,
      advancedStats: true,
      fullHistory:   true,
      branding:      false,
      dashboard:     false,
    }
  },
  elite: {
    label: 'Elite',
    price: { monthly: 25, annual: 199 },
    maxTeams: Infinity,
    maxCategoriesPerTeam: Infinity,
    maxMembersPerTeam: Infinity,
    maxPlayersPerCategory: Infinity,
    features: {
      exportPDF:     true,
      exportExcel:   true,
      advancedStats: true,
      fullHistory:   true,
      branding:      true,
      dashboard:     true,
    }
  }
};

// Which tier unlocks each feature (used by upgrade modal)
const FEATURE_UPGRADE_TO = {
  exportPDF:     'pro',
  exportExcel:   'pro',
  advancedStats: 'pro',
  fullHistory:   'pro',
  branding:      'elite',
  dashboard:     'elite',
};
