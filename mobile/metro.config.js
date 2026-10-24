const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname);
if (!config.resolver.assetExts.includes("dat")) config.resolver.assetExts.push("dat");
module.exports = config;
