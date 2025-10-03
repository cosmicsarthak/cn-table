export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "AeroFlow",
  description:
    "Hissan AeroFlow New Interactive Tables",
  url: "https://app.hissan-aero.com",
  links: { github: "https://github.com/cosmicsarthak" },
  baseLinks: {
    home: "/",
    overview: "/overview",
    orders: "/orders",
    settings: {
      general: "/settings/general",
      workflows: "/settings/workflows",
      orderbills: "/settings/orderbills",
      users: "/settings/users",
      billing: "/settings/billing",
    },
  },
};
