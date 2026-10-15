# Bibliolingo Mobile

Cliente React Native + Expo do Bibliolingo. A aplicação web na raiz permanece independente.

## Comandos

```bash
npm install
npm run start:tunnel
npm test
npm run typecheck
npm run export:android
```

O catálogo, os tipos e as regras puras são reutilizados de `../src`. O estado específico do aparelho é persistido com AsyncStorage.

Consulte [MOBILE_SETUP.md](../MOBILE_SETUP.md) para o fluxo completo usando somente um celular Android e [MOBILE_AUDIT.md](../MOBILE_AUDIT.md) para as decisões arquiteturais.
