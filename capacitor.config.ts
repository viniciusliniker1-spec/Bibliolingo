import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.bibliolingo.app",
  appName: "Bibliolingo",
  webDir: "dist",
  server: {
    androidScheme: "https"
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_bibliolingo",
      iconColor: "#18a999"
    }
  }
};

export default config;
