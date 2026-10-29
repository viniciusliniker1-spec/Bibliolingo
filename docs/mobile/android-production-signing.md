# Assinatura Android permanente e validação da nuvem

## Objetivo

Toda versão pública do Bibliolingo deve usar a mesma chave privada. O workflow aceita
uma credencial permanente pelos GitHub Actions Secrets e continua permitindo APKs de
diagnóstico com assinatura de teste enquanto os secrets não estiverem configurados.

## Preferência: reutilizar a credencial EAS existente

Não crie outra chave se a credencial Android do projeto `bibliolingo` já existir no EAS.
No Codespaces, execute:

```bash
cd /workspaces/Bibliolingo/mobile
npx eas-cli credentials -p android
```

Escolha o projeto Bibliolingo, as credenciais de build Android e a opção para baixar o
keystore existente. Guarde uma cópia fora do Codespaces em local seguro. A perda dessa
chave impede atualizações futuras da mesma instalação.

## GitHub Actions Secrets obrigatórios

No repositório, abra **Settings → Secrets and variables → Actions** e configure:

- `ANDROID_KEYSTORE_BASE64`: conteúdo Base64 do arquivo inteiro do keystore;
- `ANDROID_KEYSTORE_PASSWORD`: senha do keystore;
- `ANDROID_KEY_ALIAS`: alias da chave;
- `ANDROID_KEY_PASSWORD`: senha da chave.

O arquivo Base64 pode ser enviado diretamente pelo GitHub CLI, sem imprimi-lo:

```bash
base64 -w0 /caminho/seguro/bibliolingo.keystore | gh secret set ANDROID_KEYSTORE_BASE64
read -s -p "Senha do keystore: " STORE_PASSWORD; echo
printf '%s' "$STORE_PASSWORD" | gh secret set ANDROID_KEYSTORE_PASSWORD
unset STORE_PASSWORD
read -p "Alias da chave: " KEY_ALIAS
printf '%s' "$KEY_ALIAS" | gh secret set ANDROID_KEY_ALIAS
unset KEY_ALIAS
read -s -p "Senha da chave: " KEY_PASSWORD; echo
printf '%s' "$KEY_PASSWORD" | gh secret set ANDROID_KEY_PASSWORD
unset KEY_PASSWORD
```

O workflow falha se apenas parte dos quatro secrets estiver configurada. A chave nunca
é commitada nem publicada como artefato.

## Transição da assinatura de teste

APKs #167 e #177 usam chave de teste. Uma versão assinada pela chave permanente pode
exigir uma única desinstalação para trocar de assinatura. Antes disso:

1. Entre na conta.
2. Conclua uma atividade de teste.
3. Em Perfil, toque em **Confirmar progresso na nuvem**.
4. Confirme a data/hora exibida.
5. Somente então remova a versão de teste.
6. Instale a primeira versão de produção, entre na mesma conta e confirme a restauração.

Depois dessa transição, todas as atualizações assinadas com o mesmo keystore serão
instaladas por cima sem apagar dados locais.

## Validação de recuperação

A aprovação exige evidência no aparelho:

1. XP, lições, checkpoint, moedas, skin e perfil antes da remoção.
2. Confirmação de sincronização na tela Perfil.
3. Nova instalação sem armazenamento local anterior.
4. Login na mesma conta Google.
5. Recuperação dos mesmos valores.
6. Nova atividade sincronizada sem duplicação.
