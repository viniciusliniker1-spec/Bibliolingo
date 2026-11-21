/**
 * Ícones de humor da Lumi na tela inicial do Android.
 *
 * Cada PNG de assets/app-icons vira um ícone adaptativo e um <activity-alias> desligado;
 * o alias "neutra" vem ligado (é o ícone padrão) e a MainActivity deixa de ser o atalho.
 * O módulo local modules/lumi-app-icon liga um alias e desliga os outros.
 */
const fs = require("fs");
const path = require("path");
const { AndroidConfig, withAndroidManifest, withDangerousMod } = require("expo/config-plugins");

const DEFAULT_ICON = "neutra";

function listIcons(projectRoot, dir) {
  return fs.readdirSync(path.join(projectRoot, dir))
    .filter((file) => file.endsWith(".png"))
    .map((file) => file.replace(/\.png$/, ""))
    .sort();
}

module.exports = function withLumiAppIcons(config, { directory = "assets/app-icons" } = {}) {
  config = withAndroidManifest(config, (modConfig) => {
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(modConfig.modResults);
    const prefix = `${modConfig.android.package}.LumiIcon_`;
    const icons = listIcons(modConfig.modRequest.projectRoot, directory);
    if (!icons.includes(DEFAULT_ICON)) throw new Error(`withLumiAppIcons: falta ${directory}/${DEFAULT_ICON}.png`);

    const main = (application.activity ?? []).find((activity) => activity.$["android:name"] === ".MainActivity");
    if (!main) throw new Error("withLumiAppIcons: MainActivity não encontrada");
    for (const filter of main["intent-filter"] ?? []) {
      filter.category = (filter.category ?? []).filter((item) => item.$["android:name"] !== "android.intent.category.LAUNCHER");
    }

    const aliases = (application["activity-alias"] ?? []).filter((alias) => !alias.$["android:name"].startsWith(prefix));
    for (const id of icons) {
      aliases.push({
        $: {
          "android:name": `${prefix}${id}`,
          "android:enabled": id === DEFAULT_ICON ? "true" : "false",
          "android:exported": "true",
          "android:icon": `@mipmap/lumi_icon_${id}`,
          "android:label": "@string/app_name",
          "android:targetActivity": ".MainActivity"
        },
        "intent-filter": [{
          action: [{ $: { "android:name": "android.intent.action.MAIN" } }],
          category: [{ $: { "android:name": "android.intent.category.LAUNCHER" } }]
        }]
      });
    }
    application["activity-alias"] = aliases;
    return modConfig;
  });

  return withDangerousMod(config, ["android", async (modConfig) => {
    const { projectRoot, platformProjectRoot } = modConfig.modRequest;
    const res = path.join(platformProjectRoot, "app/src/main/res");
    for (const folder of ["drawable-nodpi", "mipmap-anydpi-v26", "mipmap-xxxhdpi"]) fs.mkdirSync(path.join(res, folder), { recursive: true });
    fs.mkdirSync(path.join(res, "values"), { recursive: true });
    fs.writeFileSync(path.join(res, "values/lumi_icon_colors.xml"), `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n  <color name="lumi_icon_bg">#02381B</color>\n</resources>\n`);
    for (const id of listIcons(projectRoot, directory)) {
      const source = path.join(projectRoot, directory, `${id}.png`);
      fs.copyFileSync(source, path.join(res, "drawable-nodpi", `lumi_icon_fg_${id}.png`));
      fs.copyFileSync(source, path.join(res, "mipmap-xxxhdpi", `lumi_icon_${id}.png`));
      fs.writeFileSync(path.join(res, "mipmap-anydpi-v26", `lumi_icon_${id}.xml`), `<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n  <background android:drawable="@color/lumi_icon_bg"/>\n  <foreground android:drawable="@drawable/lumi_icon_fg_${id}"/>\n</adaptive-icon>\n`);
    }
    return modConfig;
  }]);
};
