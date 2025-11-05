export const production = true;
export const development = false;
export const staging = false;
export const baseURL = production
  ? "https://server.haquedigital.com/"
  : development
  ? "http://localhost:5001/"
  : staging
  ? "https://monkeyman-backend.vercel.app/"
  : "https://hpjql7hm-5000.usw3.devtunnels.ms/";
