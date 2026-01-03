export const production = false;
export const development = true;
export const staging = false;
export const baseURL = production
  ? "https://4njg1pst-5001.inc1.devtunnels.ms/"
  : development
  ? "https://4njg1pst-5001.inc1.devtunnels.ms/"
  : staging
  ? "https://monkeyman-backend.vercel.app/"
  : "https://hpjql7hm-5000.usw3.devtunnels.ms/";
