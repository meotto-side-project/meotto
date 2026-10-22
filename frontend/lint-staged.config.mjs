import path from "node:path";

const app = (name) => {
  const dir = path.join(import.meta.dirname, "apps", name);
  return [
    `pnpm -C ${dir} exec prettier --write`,
    `pnpm -C ${dir} exec eslint --fix`,
  ];
};

export default {
  "apps/web/**/*.{js,jsx,ts,tsx}": app("web"),
  "apps/mobile/**/*.{js,jsx,ts,tsx}": app("mobile"),
};
