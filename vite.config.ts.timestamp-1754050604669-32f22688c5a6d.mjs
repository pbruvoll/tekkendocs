// vite.config.ts
import { vitePlugin as remix } from "file:///C:/projects/tekkendocs/node_modules/@remix-run/dev/dist/index.js";
import { sentryVitePlugin } from "file:///C:/projects/tekkendocs/node_modules/@sentry/vite-plugin/dist/esm/index.mjs";
import { remixDevTools } from "file:///C:/projects/tekkendocs/node_modules/remix-development-tools/dist/index.js";
import { defineConfig } from "file:///C:/projects/tekkendocs/node_modules/vite/dist/node/index.js";
import tsconfigPaths from "file:///C:/projects/tekkendocs/node_modules/vite-tsconfig-paths/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [
    remixDevTools(),
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true
      }
    }),
    tsconfigPaths(),
    sentryVitePlugin({
      org: "philip-bruvoll",
      project: "javascript-remix"
    })
  ],
  ssr: {
    noExternal: ["@radix-ui/themes"]
  },
  build: {
    sourcemap: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxwcm9qZWN0c1xcXFx0ZWtrZW5kb2NzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxwcm9qZWN0c1xcXFx0ZWtrZW5kb2NzXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9wcm9qZWN0cy90ZWtrZW5kb2NzL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgdml0ZVBsdWdpbiBhcyByZW1peCB9IGZyb20gJ0ByZW1peC1ydW4vZGV2J1xyXG5pbXBvcnQgeyBzZW50cnlWaXRlUGx1Z2luIH0gZnJvbSAnQHNlbnRyeS92aXRlLXBsdWdpbidcclxuaW1wb3J0IHsgcmVtaXhEZXZUb29scyB9IGZyb20gJ3JlbWl4LWRldmVsb3BtZW50LXRvb2xzJ1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xyXG5pbXBvcnQgdHNjb25maWdQYXRocyBmcm9tICd2aXRlLXRzY29uZmlnLXBhdGhzJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbXHJcbiAgICByZW1peERldlRvb2xzKCksXHJcbiAgICByZW1peCh7XHJcbiAgICAgIGZ1dHVyZToge1xyXG4gICAgICAgIHYzX2ZldGNoZXJQZXJzaXN0OiB0cnVlLFxyXG4gICAgICAgIHYzX3JlbGF0aXZlU3BsYXRQYXRoOiB0cnVlLFxyXG4gICAgICAgIHYzX3Rocm93QWJvcnRSZWFzb246IHRydWUsXHJcbiAgICAgIH0sXHJcbiAgICB9KSxcclxuICAgIHRzY29uZmlnUGF0aHMoKSxcclxuICAgIHNlbnRyeVZpdGVQbHVnaW4oe1xyXG4gICAgICBvcmc6ICdwaGlsaXAtYnJ1dm9sbCcsXHJcbiAgICAgIHByb2plY3Q6ICdqYXZhc2NyaXB0LXJlbWl4JyxcclxuICAgIH0pLFxyXG4gIF0sXHJcblxyXG4gIHNzcjoge1xyXG4gICAgbm9FeHRlcm5hbDogWydAcmFkaXgtdWkvdGhlbWVzJ10sXHJcbiAgfSxcclxuXHJcbiAgYnVpbGQ6IHtcclxuICAgIHNvdXJjZW1hcDogdHJ1ZSxcclxuICB9LFxyXG59KVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTBQLFNBQVMsY0FBYyxhQUFhO0FBQzlSLFNBQVMsd0JBQXdCO0FBQ2pDLFNBQVMscUJBQXFCO0FBQzlCLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sbUJBQW1CO0FBRTFCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLGNBQWM7QUFBQSxJQUNkLE1BQU07QUFBQSxNQUNKLFFBQVE7QUFBQSxRQUNOLG1CQUFtQjtBQUFBLFFBQ25CLHNCQUFzQjtBQUFBLFFBQ3RCLHFCQUFxQjtBQUFBLE1BQ3ZCO0FBQUEsSUFDRixDQUFDO0FBQUEsSUFDRCxjQUFjO0FBQUEsSUFDZCxpQkFBaUI7QUFBQSxNQUNmLEtBQUs7QUFBQSxNQUNMLFNBQVM7QUFBQSxJQUNYLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFFQSxLQUFLO0FBQUEsSUFDSCxZQUFZLENBQUMsa0JBQWtCO0FBQUEsRUFDakM7QUFBQSxFQUVBLE9BQU87QUFBQSxJQUNMLFdBQVc7QUFBQSxFQUNiO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
