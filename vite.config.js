import { defineConfig } from "vite";

export default defineConfig({
  // optimizeDeps: {
  //   esbuildOptions: {
  //     keepNames: true,
  //   },
  // },
  build: {
    minify: "terser",
    terserOptions: { keep_classnames: true },
  },
});
