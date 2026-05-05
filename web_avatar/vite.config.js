import { defineConfig } from "vite";

export default defineConfig({
  base: './',
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  // .vrm / .task 都是二进制静态资源,放在 public/ 自动服务
  assetsInclude: ["**/*.vrm", "**/*.task"]
});
