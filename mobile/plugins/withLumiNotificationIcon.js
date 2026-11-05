/**
 * Mostra a Lumi como imagem grande das notificações no Android
 * (meta-data expo.modules.notifications.large_notification_icon).
 * O ícone pequeno, monocromático, continua vindo do plugin do expo-notifications.
 */
const fs = require("fs");
const path = require("path");
const { AndroidConfig, withAndroidManifest, withDangerousMod } = require("expo/config-plugins");

const RESOURCE = "notification_lumi_large";

module.exports = function withLumiNotificationIcon(config, { image } = {}) {
  if (!image) throw new Error("withLumiNotificationIcon: informe { image }");
  config = withDangerousMod(config, ["android", async (modConfig) => {
    const folder = path.join(modConfig.modRequest.platformProjectRoot, "app/src/main/res/drawable-xxhdpi");
    fs.mkdirSync(folder, { recursive: true });
    fs.copyFileSync(path.join(modConfig.modRequest.projectRoot, image), path.join(folder, `${RESOURCE}.png`));
    return modConfig;
  }]);
  return withAndroidManifest(config, (modConfig) => {
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(modConfig.modResults);
    AndroidConfig.Manifest.addMetaDataItemToMainApplication(application, "expo.modules.notifications.large_notification_icon", `@drawable/${RESOURCE}`, "resource");
    return modConfig;
  });
};
