/**
 * Configuração dinâmica sobre o app.json.
 * Na web publicada em subpasta (GitHub Pages: /Bibliolingo), defina EXPO_BASE_URL=/Bibliolingo no build.
 */
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...(config.experiments ?? {}),
    ...(process.env.EXPO_BASE_URL ? { baseUrl: process.env.EXPO_BASE_URL } : {})
  }
});
