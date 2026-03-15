export const BusinessPlan = {
  company_overview: {
    company_name: "Help Each Other Pvt.",
    mission: "Empowering individuals through a structured, transparent, and performance-driven business ecosystem.",
    contact: { email: "support@heoenterprise.in", phone: "+91 98765 43210" }
  },
  direct_seller_onboarding: {
    activation: { activation_fee: 1199, referral_required: true }
  },
  income_system_overview: {
    income_streams: ["Level Income", "Autopool Income", "Pin Income", "Marriage Help", "Daily Cashback"]
  },
  level_income_structure: {
    levels: [
      { level: 1, points: 6, title: "Start Up" },
      { level: 2, points: 3, title: "Leader" },
      { level: 3, points: 1, title: "Senior Start Up Leader" },
      { level: 4, points: 1, title: "Royal Leader" },
      { level: 5, points: 0.5, title: "Silver Leader" },
      { level: 6, points: 0.5, title: "Ruby Leader" },
      { level: 7, points: 0.25, title: "Gold Leader" },
      { level: 8, points: 0.25, title: "Diamond Leader" }
    ]
  },
  dream_autopool_club: {
    autopool_types: [
      { entry: 2500, levels: [{ team_size: 3, income: 2500 }, { team_size: 9, income: 5000 }, { team_size: 27, income: 10000 }, { team_size: 81, income: 15000 }] },
      { entry: 5000, levels: [{ team_size: 3, income: 5000 }, { team_size: 9, income: 10000 }, { team_size: 27, income: 15000 }, { team_size: 81, income: 20000 }] },
      { entry: 7500, levels: [{ team_size: 3, income: 7500 }, { team_size: 9, income: 12500 }, { team_size: 27, income: 15000 }, { team_size: 81, income: 20000 }] },
      { entry: 10000, levels: [{ team_size: 3, income: 10000 }, { team_size: 9, income: 15000 }, { team_size: 27, income: 20000 }, { team_size: 81, income: 25000 }] }
    ]
  },
  pin_income_system: {
    pin_purchase: { quantity: 10, benefit: 500 }
  },
  special_benefits: {
    marriage_help: { amount: 5100, conditions: { direct: 15, active: 35 } }
  },
  rules_and_compliance: {
    minimum_withdrawal_points: 500,
    charges: { admin: 15, tds: 5 }
  },
  daily_cashback: {
    daily_amount: 40,
    max_days_per_month: 22,
    valid_months: 3
  }
};

export type AutopoolType = typeof BusinessPlan.dream_autopool_club.autopool_types[number];
export type LevelStructure = typeof BusinessPlan.level_income_structure.levels[number];
