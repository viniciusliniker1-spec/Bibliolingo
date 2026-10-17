# Validação do Bibliolingo Mobile — Expo SDK 57

Data: 17 de outubro de 2026  
Branch: `feature/bibliolingo-mobile-full-parity`  
PR: [#43](https://github.com/viniciusliniker1-spec/Bibliolingo/pull/43)

## Pacote de melhorias

- revisão somente para conceitos respondidos incorretamente; acerto na revisão resolve o conceito;
- o próximo passo e o botão Continuar não forçam revisão de conteúdo dominado;
- modal do Noah redimensionado com o teclado Android;
- login/cadastro/recuperação Supabase, OAuth oficial Google/Facebook por navegador e proteção biométrica da sessão;
- catálogos de Grego/Formação memorizados para reduzir atraso de abertura;
- grego original restrito ao Novo Testamento com transliteração fonética;
- sons originais de acerto, erro e conclusão, feedback tátil opcional e confetes;
- exatamente um lembrete local agendado; agendas antigas são removidas;
- ícone Android/iOS criado a partir da arte fornecida.

## Validação automatizada

Head funcional antes desta atualização documental: `ae3b9d141a7a8936c9932b873cf4863926315520`.

- [Web CI #267](https://github.com/viniciusliniker1-spec/Bibliolingo/actions/runs/39035028822): sucesso;
- [Mobile Expo CI #124](https://github.com/viniciusliniker1-spec/Bibliolingo/actions/runs/39035028866): sucesso;
- Expo Doctor: 21/21;
- testes Web, Worker e domínio: sucesso;
- testes Mobile: sucesso;
- TypeScript Mobile: sucesso;
- export/bundle Android: sucesso;
- Expo SDK mantido em 57.

## Validação externa ainda obrigatória

A CI não substitui instalação do novo APK. É necessário validar em Android real:

1. campo do Noah visível com o teclado aberto;
2. uma lição com erro e outra perfeita, incluindo próximo passo e fila de revisão;
3. sons, vibração e confetes;
4. existência de somente um lembrete nas configurações do Android;
5. ícone na tela inicial;
6. digital/biometria após ativação no Perfil;
7. e-mail/senha com o Supabase real;
8. Google e Facebook somente depois de configurar cada provedor e os redirects.

Google/Facebook não são declarados validados enquanto não houver login real com os consoles externos configurados. O novo APK EAS ainda precisa ser gerado a partir deste head; o APK anterior não contém estas alterações.
