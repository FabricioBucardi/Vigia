# Estado Atual do Desenvolvimento - Aplicativo Vigia

## 📍 1. Onde Paramos (Ponto de Controle)
- **Semana/Passo Atual**: Fase 2 — Tela de Login/Cadastro (AuthScreen real) implementada e validada (typecheck + bundling). Fase 1 (infraestrutura/navegação) concluída, commitada e enviada (`1b9a27e` em `origin/main`).
- **Última tela/componente finalizado**: `AuthScreen` (Login + Cadastro em abas) totalmente implementada em `src/screens/auth/AuthScreen.tsx`, integrada ao `AuthContext`. Ao logar/cadastrar, o `RootNavigator` troca automaticamente para `Main` (Mapa).

## 🛠️ 2. Modificações Efetuadas nesta Sessão
- **Arquivos Criados**: nenhum novo (npm não recebeu novas dependências nesta sessão).
- **Arquivos Modificados**:
  - `src/screens/auth/AuthScreen.tsx` -> Substituído o placeholder pela tela real de Login e Cadastro (único arquivo, conforme decisão — sem subcomponentes):
    - Layout MD3 via `StyleSheet.create` + `COLORS` (sem NativeWind; refatoração futura prevista).
    - Topo: ícone `shield-home` (MaterialCommunityIcons) + título **VIGIA** (cor primária).
    - Abas alternadoras "Entrar"/"Cadastrar" (botões com destaque na aba ativa).
    - **Login**: e-mail (`email-address`) + senha oculta com botão 👁 (revelar/ocultar) + botão "Acessar".
    - **Cadastro**: nome, e-mail, **data de nascimento com máscara manual `DD/MM/AAAA`** (sem DatePicker/dependência nova), senha, confirmar senha (ambos com 👁) + botão "Criar Conta".
    - **Validações**: login só verifica campos preenchidos; cadastro verifica campos preenchidos + senha forte (regex `SENHA_REGEX`: mínimo 8 chars, 1 maiúscula, 1 minúscula, 1 número, 1 especial) + confirmação de senha.
    - **Fluxo**: `loading` (ActivityIndicator no botão) -> chama `signIn`/`signUp` do `useAuth()` -> ao sucesso, `user` é setado e `RootNavigator` troca para Main. Erros exibidos em caixa vermelha.
  - `docs/ESTADO_DESENVOLVIMENTO.md` -> Atualizado (este arquivo).
- **Commit/Push**: enviados na sessão anterior — `1b9a27e` "feat: implementa infraestrutura de navegação e autenticação (Fase 1)" em `origin/main` (após aprovação do usuário).

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
- **AuthScreen** (`src/screens/auth/AuthScreen.tsx`): tela única com abas Entrar/Cadastrar. Login: e-mail + senha (👁). Cadastro: nome, e-mail, data de nascimento (máscara manual `DD/MM/AAAA`, sem dependência), senha + confirmar senha (👁). Regra de senha forte via `SENHA_REGEX` (`/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/`). Estados: `activeTab`, `loading`, `erro`; campos individuais. Botão com `ActivityIndicator` durante `loading`. Erros em caixa vermelha (`#FEE2E2`). `useAuth()`: `signIn(email,senha)`/`signUp({nome,email,senha})`.
- **Paleta global**: `src/styles/colors.ts` — SEMPRE usar `COLORS.*`, nunca hex solto.
- **Coordenadas do mapa**: São Caetano do Sul `lat -23.6182, lon -46.5645, delta 0.02` (react-native-maps na Semana 2).
- **Expo Go**: SDK 57 NÃO está na Play Store. Instalado via APK direto do GitHub do Expo (`Expo-Go-57.0.9.apk`). Na Play Store, a versão disponível suporta apenas SDK 54 → erro "Project is incompatible".
- **Design**: Material Design 3, fundo `#F3F4F6`.
- **Git**: branch `main`, remote `origin` = `https://github.com/FabricioBucardi/Vigia.git`. Histórico: `6afb602` (vazio), `ac32ba5` (estrutura), `9144004` (estado), `1b9a27e` (Fase 1). **MUDANÇAS ATUAIS NÃO COMMITADAS**: `src/screens/auth/AuthScreen.tsx` (tela real) + `docs/ESTADO_DESENVOLVIMENTO.md` — aguardando aprovação do usuário para commit (REGRA DE OURO do AGENTS.md).
- **REGRAS IMPORTANTES (reforçadas em AGENTS.md)**:
  - Nenhum commit/push/PR sem aprovação explícita do usuário.
  - Gerar/atualizar `docs/ESTADO_DESENVOLVIMENTO.md` a cada interação que altere o projeto.
- **Documentação**: `docs/` contém `planejamento-desenvolvimento-vigia-v2.md`, `vigia-specs-telas.md` e este `ESTADO_DESENVOLVIMENTO.md`. `AGENTS.md` permanece na raiz.
- **Comandos**: `npm run typecheck` (tsc --noEmit), `npm start`, `npm run android|ios|web`. Para validar bundling sem abrir servidor interativo: `npx expo export --platform android --output-dir /tmp/x`.
