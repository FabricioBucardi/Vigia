# Estado Atual do Desenvolvimento - Aplicativo Vigia

## 📍 1. Onde Paramos (Ponto de Controle)
- **Semana/Passo Atual**: Fase 1 — Infraestrutura e Dependências (parcial) — Dependências de navegação + correção do ambiente instaladas e validadas.
- **Última tela/componente finalizado**: Ainda não há telas. Concluída a Fase 0 (estrutura + cores MD3) e a instalação/configuração das dependências de navegação, com a correção de um problema de ambiente (hoisting de `node_modules` na home do usuário) que impedia o bundling do Metro. `App.tsx` contém uma tela mínima de teste ("Vigia / Dependências instaladas").

## 🛠️ 2. Modificações Efetuadas nesta Sessão
- **Arquivos Criados**:
  - `babel.config.js` -> Presets `babel-preset-expo` + plugin `react-native-reanimated/plugin` (necessário para o Reanimated funcionar no Expo).
  - `.npmrc` -> `install-links=true` para impedir que o npm "vaze"/hoiste pacotes para diretórios-pai (preventivo contra o problema de ambiente).
  - `src/context/AuthContext.tsx` + `AuthContext.type.ts` -> Contexto global de autenticação mock (signIn/signUp com atraso de 1s, signOut, usuário logado).
  - `src/navigation/RootNavigator.tsx` -> Stack nativo com telas Auth e Main; aceita `initialRouteName` para alternar login/logado.
  - `src/navigation/MainTabs.tsx` -> BottomTabs com Mapa e Perfil.
  - `src/screens/auth/AuthScreen.tsx`, `src/screens/map/MapaScreen.tsx`, `src/screens/profile/PerfilScreen.tsx` -> Telas placeholder (visual limpo, para serem preenchidas nas Fases 2+).
  - (lado de fora do repo) `/home/delizia/node_modules` -> **movido** para `/home/delizia/node_modules.bak`. Era um `node_modules` contaminante de outro projeto (o projeto `intercept`), com `@react-native/codegen` na versão antiga `0.83.6`, que o Metro/Babel resolvia em vez da versão correta `0.86.3` do projeto, causando o erro `Unable to determine event arguments for "onModeChange"`.
- **Arquivos Modificados**:
  - `package.json` -> Adicionadas/atualizadas dependências (todas alinhadas ao Expo SDK 57 via `expo install`): `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`, `@react-navigation/stack`, `react-native-screens ~4.26.0`, `react-native-safe-area-context ~5.7.0`, `react-native-gesture-handler ~2.32.0`, `react-native-reanimated 4.5.1`, `@expo/vector-icons ^15.0.2`, `babel-preset-expo ~57.0.0`. `package-lock.json` regenerado.
  - `App.tsx` -> Integrado `GestureHandlerRootView` + `SafeAreaProvider` + `AuthProvider` + `NavigationContainer` + `RootNavigator` (alterna Auth/Main conforme estado de autenticação).
  - `docs/ESTADO_DESENVOLVIMENTO.md` -> Atualizado (este arquivo).

## 📋 3. Estado das Dependências instaladas
- **Instaladas e alinhadas ao SDK 57** (via `expo install`): `expo ~57.0.18`, `react-native 0.86.3`, `react 19.2.3`, `@types/react ~19.2.2`, `typescript ~6.0.3`, `expo-status-bar ~57.0.1`, `@react-navigation/native ^7.3.18`, `@react-navigation/stack ^7.10.24`, `@react-navigation/bottom-tabs ^7.18.18`, `react-native-screens ~4.26.0`, `react-native-safe-area-context ~5.7.0`, `react-native-gesture-handler ~2.32.0`, `react-native-reanimated 4.5.1`, `@expo/vector-icons ^15.0.2`, `babel-preset-expo ~57.0.0`.
- **Ainda NÃO instalado**: `react-native-maps` (previsto para a Semana 2/MapaScreen, conforme planejamento).

## ⚠️ Histórico de correções de ambiente (importante não repetir)
1. **Hoisting na home**: o host tinha `/home/delizia/node_modules` (detrito do projeto `intercept`) com `@react-native/codegen` 0.83.6, que era resolvido pelo Metro em vez do 0.86.3 do projeto, causando `Unable to determine event arguments for "onModeChange"`. Correção: mover para `node_modules.bak` + reinstall local + `.npmrc` (`install-links=true`). OK desde então.
2. **Libs de navegação perdidas**: o `rm -rf node_modules && npm install` removeu o `package.json`-com-navegação e o re-install regenerou sem elas. Correção: rodar `npx expo install` de novo para as 3 libs de navegação. **Lições**: usar `expo install` para adicionar libs (salva no `package.json`); sempre revalidar `package.json` + bundling após reinstalar deps.
3. **Erro VS Code `expo/tsconfig.base not found`**: o arquivo EXISTE em `node_modules/expo/tsconfig.base.json` e resolve via Node; o erro era cache desatualizado do TS Server após o `rm -rf node_modules`. Correção: **Restart TS Server** / recarregar a janela do VS Code.
- ⚠️ `npm audit`: 10 vulnerabilidades moderadas. NÃO rodar `npm audit fix --force` (risco de quebra). Pendente de revisão.

## 🚀 4. Próximos Passos Imediatos para a Próxima Sessão
1. **Testar de fato no Expo Go SDK 57** no celular: rodar `npm start` e confirmar que a navegação carrega (bundling já validado via `expo export` — sucesso). ⚠️ IMPORTANTE: encerrar o processo `expo start` antigo (terminal `pts/3`, port 8081) que usa a node_modules/cache antigo antes de abrir no celular.
2. **Fase 1**: Criar dados mockados `src/data/mockReports.json`, `mockBairros.json`, `mockUsers.json` (Seção 3 do planejamento).
3. **Fase 2**: Desenvolver de fato a `AuthScreen` (Tela 1 das specs — abas Login/Cadastro), integrando com o `AuthContext` já criado (ao logar/sign-up, `user` é setado e o `RootNavigator` troca para Main).
4. **PENDÊNCIAS**: (a) 10/17 vulnerabilidades moderadas do npm audit; (b) License "0BSD"; (c) identidade git local = Fabricio Bucardi / FabricioBucardi@users.noreply.github.com.

## 🧠 5. Contexto Técnico para o Próximo Chat
- **Stack**: Expo SDK 57, React Native 0.86, React 19, TypeScript 6 (strict), npm. Versões de módulos nativos alinhadas via `expo install` (importante para evitar incompatibilidade).
- **IMPORTANTE / AMBIENTE**: O host é Arch Linux. O usuário tem um `node_modules` de outro projeto na home (`/home/delizia/node_modules.bak`) que foi isolado porque causava conflito de versões (`@react-native/codegen` 0.83.6 vs 0.86.3) através do hoisting do npm. O `.npmrc` com `install-links=true` foi adicionado para evitar reincidência. **Não restaurar `/home/delizia/node_modules`** enquanto o Vigia for desenvolvido.
- **VS Code**: se aparecer `File 'expo/tsconfig.base' not found` ou "Cannot find module", o arquivo EXISTE em `node_modules/expo/tsconfig.base.json`. Tal erro é cache do TS Server → fazer `Ctrl+Shift+P` → "TypeScript: Restart TS Server" (ou "Developer: Reload Window"). Ver seção 3.3 deste doc.
- **Entrada**: `index.ts` registra `App.tsx`. `App.tsx` envolve tudo em `GestureHandlerRootView` → `SafeAreaProvider` → `AuthProvider` → `NavigationContainer` → `RootNavigator`. `RootNavigator` (native-stack) alterna `Auth` ↔ `Main` conforme `user` do `AuthContext`.
- **AuthContext** (`src/context/AuthContext.tsx`): expõe `user`, `signIn(email, senha)`, `signUp({nome,email,senha})` (ambos com `setTimeout` 1s + seta user mock idUsuario 101) e `signOut()`. Tipos em `AuthContext.type.ts` (`AppUser`, `AuthContextData`).
- **Navegação** (`src/navigation/`): `RootNavigator` (stack: Auth, Main; `initialRouteName` controlado por `useAuth`), `MainTabs` (BottomTabs: Mapa, Perfil com ícones MDI). Telas placeholder já criadas em `src/screens/{auth,map,profile}`.
- **Paleta global**: `src/styles/colors.ts` — SEMPRE usar `COLORS.*`, nunca hex solto.
- **Navegação planejada**: React Navigation — `AuthStack` (AuthScreen) → `MainTabs` (Mapa + Perfil). Alternância via AuthContext (a criar).
- **Coordenadas do mapa**: São Caetano do Sul `lat -23.6182, lon -46.5645, delta 0.02` (react-native-maps na Semana 2).
- **Expo Go**: SDK 57 NÃO está na Play Store. Instalado via APK direto do GitHub do Expo (`Expo-Go-57.0.9.apk`). Na Play Store, a versão disponível suporta apenas SDK 54 → erro "Project is incompatible".
- **Design**: Material Design 3, fundo `#F3F4F6`.
- **Git**: branch `main`, remote `origin` = `https://github.com/FabricioBucardi/Vigia.git`. Histórico: `6afb602` (vazio), `ac32ba5` (estrutura), `9144004` (estado). PRESENÇA DE MUDANÇAS NÃO COMMITADAS (App.tsx, package.json, package-lock.json, .npmrc, babel.config.js) — aguardando aprovação do usuário para commit (REGRA DE OURO do AGENTS.md).
- **REGRAS IMPORTANTES (reforçadas em AGENTS.md)**:
  - Nenhum commit/push/PR sem aprovação explícita do usuário.
  - Gerar/atualizar `docs/ESTADO_DESENVOLVIMENTO.md` a cada interação que altere o projeto.
- **Documentação**: `docs/` contém `planejamento-desenvolvimento-vigia-v2.md`, `vigia-specs-telas.md` e este `ESTADO_DESENVOLVIMENTO.md`. `AGENTS.md` permanece na raiz.
- **Comandos**: `npm run typecheck` (tsc --noEmit), `npm start`, `npm run android|ios|web`. Para validar bundling sem abrir servidor interativo: `npx expo export --platform android --output-dir /tmp/x`.
