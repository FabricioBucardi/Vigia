# Estado Atual do Desenvolvimento - Aplicativo Vigia

## 📍 1. Onde Paramos (Ponto de Controle)
- **Semana/Passo Atual**: Fase 2 — Tela de Login/Cadastro redesenhada: logo real, efeito flip 3D e campos com floating label animado (inspirado na LP `lpLogin`), mantendo a identidade MD3/azul do app. Validada (typecheck + bundling).
- **Última tela/componente finalizado**: `AuthScreen` reescrita com flip 3D (Reanimated) entre as faces Login e Cadastro, usando os novos componentes `FloatingTextInput`, `VigiaLogo` e `PrimaryButton`.

## 🛠️ 2. Modificações Efetuadas nesta Sessão
- **Arquivos Criados**:
  - `src/components/FloatingTextInput.tsx` -> Campo de texto reutilizável com **floating label animado** (rótulo sobe ao focar/preencher, via Reanimated `withTiming`), **estado de erro** (borda + label vermelhos + animação de **shake** lateral com `withSequence`) e opção de **botão de olho** p/ senha. Reutiliza `COLORS`. Inspirado na LP `lpLogin`. (Exceção à regra "tudo num arquivo" — justificada pela reusabilidade/complexidade.)
  - `src/components/VigiaLogo.tsx` -> Logo `VIGIA.png` + título "VIGIA", centralizados.
  - `src/components/PrimaryButton.tsx` -> Botão primário com estado `loading` (ActivityIndicator interno), estilo `COLORS.primary`.
  - `assets/login/vigia.png` -> Logo copiada de `/home/delizia/Documentos/Projetos/lpLogin/img/VIGIA.png` (2.2MB, imagem original).
- **Arquivos Modificados**:
  - `src/screens/auth/AuthScreen.tsx` -> **Reescrita**: usa `VigiaLogo`, `FloatingTextInput` (todos os campos) e `PrimaryButton`. **Efeito flip 3D** com Reanimated (`useSharedValue` + `useAnimatedStyle` + `withTiming`, faces `backfaceVisibility:'hidden'` em `rotateY` 0°↔180°, `zIndex` na face ativa). Fundo claro `COLORS.background` mantido (decidido NÃO usar o `fundo.png` dark da LP). Validações agora por campo (objeto `erros: ErrosForm`) em vez de caixa única de erro: e-mail regex, senha forte, confirmar senha, máscara data `DD/MM/AAAA` mantidas. `loadingLogin`/`loadingCadastro` separados.
  - `docs/ESTADO_DESENVOLVIMENTO.md` -> Atualizado (este arquivo).
- **Correção de logout (não retornava à tela de login)**:
  - **Causa**: o `App.tsx` usava `RootNavigator` com `key` + `initialRouteName` controlados pelo `user`, dentro de um `NavigationContainer` único. Ao deslogar, o `key` mudava e remontava o navigator, mas o `NavigationContainer` mantinha o estado de navegação interno — por isso o `user` ficava `null` (Perfil mostrava "deslogado") mas a tela não voltava ao Login.
  - **Correção**: adotada a **abordagem de renderização condicional** (padrão oficial do React Navigation p/ auth flow): `App.tsx` agora renderiza `{user ? <MainTabs /> : <AuthStack />}` dentro do `NavigationContainer`. A troca condicional desmonta/remonta o navigator, garantindo retorno real ao Login/Cadastro.
  - **Criado**: `src/navigation/AuthStack.tsx` (stack com a AuthScreen). **Removido**: `src/navigation/RootNavigator.tsx` (órfão, não mais usado).
- **Modificações p/ testes (logout p/ voltar ao login)**:
  - `src/screens/profile/PerfilScreen.tsx` -> Adicionado **botão "Sair da Conta"** funcional (usa `PrimaryButton` + `signOut()` do `useAuth()`), que retorna o usuário à tela de Login sem precisar de reload (ideal p/ testar login/cadastro repetidamente). Exibe nome/email do usuário logado.
  - `src/screens/auth/AuthScreen.tsx` -> Adicionado **botão "Voltar ao Login"** (outlined) na face de Cadastro, que gira o card de volta (chama `trocarAba('login')`).
- **Correções de layout na AuthScreen / FloatingTextInput (nesta sessão)**:
  - **Centralização do label**: o label passou de `top` fixo + translateY arbitrário para um modelo com `top: ALTURA_CAMPO/2` + `translateY` animado (`-9` em repouso, `-28` ativo) + `fontSize` animado (16->12), mantendo o label **verticalmente centralizado** no campo em repouso e subindo para o topo ao focar/preencher.
  - **Espaço enorme acima de "Nome Completo"** (causa raiz): as faces estavam em `position:'relative'` e **empilhavam** uma abaixo da outra — a face de cadastro (5 campos) ficava depois da de login (2 campos), deixando vazio (os campos de login "invisíveis" via `backfaceVisibility` ainda ocupavam espaço). Correção: faces agora em `position:'absolute'` (top/left/right fixos, `backfaceVisibility:'hidden'`) sobrepostas dentro do `cartao` (`position:'relative'`, `minHeight: 440`), eliminando o espaço fantasma.
  - **Teclado tapando campos**: `KeyboardAvoidingView` agora usa `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}` + `keyboardVerticalOffset` (antes `undefined` no Android -> não fazia nada), fazendo a tela encolher para o espaço disponível acima do teclado.
- **Decisões de design registradas**:
  - **Identidade mantida**: MD3 / paleta `COLORS` clara (azul escuro primário). A LP `lpLogin` inspira apenas estética de campos (floating label + shake), flip 3D e logo.
  - **`fundo.png` da LP DESCARTADO** (dark/neon não combina com identidade clara). Logo `VIGIA.png` trazida.
  - **Modal de sucesso** da LP NÃO implementado (o usuário criará algo parecido depois).
  - **Componentização**: criados `FloatingTextInput`, `PrimaryButton`, `VigiaLogo`; adiados `TabSelector` e `ErrorMessage` (usados uma vez / pequenos).
- **Commit/Push anteriores**: `1b9a27e` (Fase 1) e `ceadd94` (AuthScreen inicial) já em `origin/main`.

## 📋 3. Estado das Dependências instaladas
- **Instaladas e alinhadas ao SDK 57** (via `expo install`): `expo ~57.0.18`, `react-native 0.86.3`, `react 19.2.3`, `@types/react ~19.2.2`, `typescript ~6.0.3`, `expo-status-bar ~57.0.1`, `@react-navigation/native ^7.3.18`, `@react-navigation/stack ^7.10.24`, `@react-navigation/bottom-tabs ^7.18.18`, `react-native-screens ~4.26.0`, `react-native-safe-area-context ~5.7.0`, `react-native-gesture-handler ~2.32.0`, `react-native-reanimated 4.5.1`, `@expo/vector-icons ^15.0.2`, `babel-preset-expo ~57.0.0`.
- **Ainda NÃO instalado**: `react-native-maps` (previsto para a Semana 2/MapaScreen, conforme planejamento).
- **Decisão**: `react-dom` + `react-native-web` NÃO instalados (necessários apenas p/ abrir na web com `w`; não requeridos para o celular/Expo Go). PENDENTE de decisão do usuário se quer suporte web.
- **Decisão**: Tailwind/NativeWind NÃO adotado por ora (o usuário decidiu prosseguir com `StyleSheet`/`COLORS`; refatoração futura prevista para o projeto final).

## ⚠️ Histórico de correções de ambiente (importante não repetir)
1. **Hoisting na home**: o host tinha `/home/delizia/node_modules` (detrito do projeto `intercept`) com `@react-native/codegen` 0.83.6, que era resolvido pelo Metro em vez do 0.86.3 do projeto, causando `Unable to determine event arguments for "onModeChange"`. Correção: mover para `node_modules.bak` + reinstall local + `.npmrc` (`install-links=true`). OK desde então.
2. **Libs de navegação perdidas**: o `rm -rf node_modules && npm install` removeu o `package.json`-com-navegação e o re-install regenerou sem elas. Correção: rodar `npx expo install` de novo para as 3 libs de navegação. **Lições**: usar `expo install` para adicionar libs (salva no `package.json`); sempre revalidar `package.json` + bundling após reinstalar deps.
3. **Erro VS Code `expo/tsconfig.base not found`**: o arquivo EXISTE em `node_modules/expo/tsconfig.base.json` e resolve via Node; o erro era cache desatualizado do TS Server após o `rm -rf node_modules`. Correção: **Restart TS Server** / recarregar a janela do VS Code.
4. **Porta 8081 ocupada**: havia um `expo start` antigo (pid removido via `kill`) usando `node_modules`/cache antiga. IMPORTANTE: matar processos antigos antes de iniciar novo `npm start`.
- ⚠️ `npm audit`: 10 vulnerabilidades moderadas. NÃO rodar `npm audit fix --force` (risco de quebra). Pendente de revisão.

## 🚀 4. Próximos Passos Imediatos para a Próxima Sessão
1. **Testar a AuthScreen no celular** (Expo Go SDK 57 via QR): confirmar visual (escudo + VIGIA, abas Entrar/Cadastrar, máscara de data, olho de senha) e que logar/cadastrar navega para o Mapa.
2. **Criar dados mockados** `src/data/mockReports.json`, `mockBairros.json`, `mockUsers.json` (Seção 3 do planejamento) — necessários p/ Mapa e Perfil.
3. **Fase 2/Mapa**: instalar `react-native-maps` e implementar a `MapaScreen` real (Tela 2 das specs) + `CriarReporteScreen` (Tela 3).
4. **PENDÊNCIAS**: (a) 10/17 vulnerabilidades moderadas do npm audit; (b) License "0BSD"; (c) identidade git local = Fabricio Bucardi / FabricioBucardi@users.noreply.github.com; (d) decidir se instala suporte web (`react-dom`+`react-native-web`) ou remove `"web"` do app.json.

## 🧠 5. Contexto Técnico para o Próximo Chat
- **Stack**: Expo SDK 57, React Native 0.86, React 19, TypeScript 6 (strict), npm. Versões de módulos nativos alinhadas via `expo install` (importante para evitar incompatibilidade).
- **IMPORTANTE / AMBIENTE**: O host é Arch Linux. O usuário tem um `node_modules` de outro projeto na home (`/home/delizia/node_modules.bak`) que foi isolado porque causava conflito de versões (`@react-native/codegen` 0.83.6 vs 0.86.3) através do hoisting do npm. O `.npmrc` com `install-links=true` foi adicionado para evitar reincidência. **Não restaurar `/home/delizia/node_modules`** enquanto o Vigia for desenvolvido.
- **VS Code**: se aparecer `File 'expo/tsconfig.base' not found` ou "Cannot find module", o arquivo EXISTE em `node_modules/expo/tsconfig.base.json`. Tal erro é cache do TS Server → fazer `Ctrl+Shift+P` → "TypeScript: Restart TS Server" (ou "Developer: Reload Window"). Ver seção 3.3 deste doc.
- **Entrada**: `index.ts` registra `App.tsx`. `App.tsx` envolve tudo em `GestureHandlerRootView` → `SafeAreaProvider` → `AuthProvider` → `NavigationContainer` → `RootNavigator`. `RootNavigator` (native-stack) alterna `Auth` ↔ `Main` conforme `user` do `AuthContext`.
- **AuthContext** (`src/context/AuthContext.tsx`): expõe `user`, `signIn(email, senha)`, `signUp({nome,email,senha})` (ambos com `setTimeout` 1s + seta user mock idUsuario 101) e `signOut()`. Tipos em `AuthContext.type.ts` (`AppUser`, `AuthContextData`).
- **Navegação** (`src/navigation/`): `RootNavigator` (stack: Auth, Main; `initialRouteName` controlado por `useAuth`), `MainTabs` (BottomTabs: Mapa, Perfil com ícones MDI). Em `src/screens/`: **auth/AuthScreen.tsx REAL (implementada)**, map/MapaScreen e profile/PerfilScreen ainda placeholders.
- **AuthScreen** (`src/screens/auth/AuthScreen.tsx`): **flip 3D** entre faces Login (frontal) e Cadastro (traseira). Abas Entrar/Cadastrar controlam a rotação via Reanimated (`virada` sharedValue, `withTiming` 600ms, `perspective:1200`, `backfaceVisibility:'hidden'`, `zIndex` na face ativa). Usa `VigiaLogo` (logo `assets/login/vigia.png`), `FloatingTextInput` (todos os campos) e `PrimaryButton`. Estados: `activeTab`, `loadingLogin`, `loadingCadastro`, `erros` (objeto `ErrosForm` por campo). Validações: e-mail regex, senha forte (`SENHA_REGEX`), confirmar senha, máscara data `DD/MM/AAAA`. `useAuth()`: `signIn`/`signUp` → troca para Main.
- **Componentes** (`src/components/`): `FloatingTextInput` (floating label animado + erro + shake + olho), `PrimaryButton` (loading), `VigiaLogo` (logo + título).
- **Paleta global**: `src/styles/colors.ts` — SEMPRE usar `COLORS.*`, nunca hex solto.
- **Coordenadas do mapa**: São Caetano do Sul `lat -23.6182, lon -46.5645, delta 0.02` (react-native-maps na Semana 2).
- **Expo Go**: SDK 57 NÃO está na Play Store. Instalado via APK direto do GitHub do Expo (`Expo-Go-57.0.9.apk`). Na Play Store, a versão disponível suporta apenas SDK 54 → erro "Project is incompatible".
- **Design**: Material Design 3, fundo `#F3F4F6`.
- **Git**: branch `main`, remote `origin` = `https://github.com/FabricioBucardi/Vigia.git`. Histórico: `6afb602` (vazio), `ac32ba5` (estrutura), `9144004` (estado), `1b9a27e` (Fase 1), `ceadd94` (AuthScreen v1). **MUDANÇAS ATUAIS NÃO COMMITADAS**: `App.tsx` (renderização condicional auth/main), `src/navigation/AuthStack.tsx` (novo), `src/navigation/RootNavigator.tsx` (removido), `src/screens/auth/AuthScreen.tsx` (v2: flip 3D + correções + botão voltar), `src/screens/profile/PerfilScreen.tsx` (logout), `src/components/FloatingTextInput.tsx`, `src/components/VigiaLogo.tsx`, `src/components/PrimaryButton.tsx`, `assets/login/vigia.png` + `docs/ESTADO_DESENVOLVIMENTO.md` — aguardando aprovação do usuário para commit (REGRA DE OURO do AGENTS.md). ⚠️ `.gitignore` tem alteração LOCAL não commitada (ignorar `docs/*.docx`); não commitá-la (irrelevante para o usuário).
- **REGRAS IMPORTANTES (reforçadas em AGENTS.md)**:
  - Nenhum commit/push/PR sem aprovação explícita do usuário.
  - Gerar/atualizar `docs/ESTADO_DESENVOLVIMENTO.md` a cada interação que altere o projeto.
- **Documentação**: `docs/` contém `planejamento-desenvolvimento-vigia-v2.md`, `vigia-specs-telas.md` e este `ESTADO_DESENVOLVIMENTO.md`. `AGENTS.md` permanece na raiz.
- **Comandos**: `npm run typecheck` (tsc --noEmit), `npm start`, `npm run android|ios|web`. Para validar bundling sem abrir servidor interativo: `npx expo export --platform android --output-dir /tmp/x`.
