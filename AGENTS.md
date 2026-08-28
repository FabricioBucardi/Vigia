# Instruções Persistentes para Assistentes de IA - Projeto Vigia

Este arquivo é lido em toda sessão de desenvolvimento. Leia e siga rigorosamente as regras abaixo em **toda** conversa.

---

## 🚫 REGRA DE OURO: APROVAÇÃO OBRIGATÓRIA PARA COMMITS

> **QUALQUER commit, push, amend, rebase ou criação de Pull Request — SEM EXCEÇÃO — requer a aprovação explícita do usuário ANTES de ser executado.**

- Nunca execute `git commit`, `git push`, `git amend`, `git rebase` ou crie PRs por conta própria.
- Sempre aguarde o usuário dizer explicitamente algo como "pode commitar", "pode dar push", "aprovado".
- Ao terminar uma tarefa que alterou arquivos, **informe ao usuário** que está pronto para commit e aguarde a autorização.
- **Exceção única já concedida**: um commit vazio inicial da estrutura da Fase 0 (`git commit --allow-empty`) foi aprovado pelo usuário. Nenhum outro commit está pré-aprovado.
- Antes de commitar: revise `git status`, `git diff`, e o histórico recente (`git log --oneline -10`).
- Mensagens de commit devem ser em português e concisas, refletindo o estilo do histórico existente.

---

## 📦 Contexto do Projeto

- **App**: Vigia — plataforma colaborativa de segurança urbana de São Caetano do Sul (MVP).
- **Stack**: React Native (Expo SDK ~57), TypeScript, Material Design 3.
- **Gerenciador de pacotes**: npm.
- **Navegação**: React Navigation (Stack + BottomTabs) — será instalada em fase futura.
- **Mapa**: react-native-maps — será instalada em fase futura.
- **Dados**: mockados localmente em JSON (espelhando o schema MySQL), integração futura com API Spring Boot.

## 📁 Estrutura de Pastas

```
vigia-app/
├── assets/                  # Imagens, logos e ícones locais
├── docs/                    # Documentação (planejamento, specs, estado de desenvolvimento)
│   ├── planejamento-desenvolvimento-vigia-v2.md
│   ├── vigia-specs-telas.md
│   └── ESTADO_DESENVOLVIMENTO.md
├── src/
│   ├── components/          # Componentes reutilizáveis (Card, Button, BottomSheet)
│   ├── data/                # Mocks em JSON (mockReports.json, mockBairros.json, mockUsers.json)
│   ├── navigation/          # Rotas (AppNavigator, MainTabs, AuthStack)
│   ├── screens/
│   │   ├── auth/            # AuthScreen (Login + Cadastro em abas)
│   │   ├── map/             # MapaScreen, CriarReporteScreen, DetalheBairroScreen
│   │   └── profile/         # PerfilScreen
│   ├── services/            # Camada de requisições (futura: api, reportService)
│   └── styles/              # colors.ts (paleta MD3) e estilos compartilhados
├── App.tsx                  # Ponto de entrada
├── AGENTS.md                # Regras persistentes para IA (lido automaticamente na raiz)
├── app.json                 # Configurações do Expo
└── index.ts                 # Registration do Expo
```

## 🎨 Paleta de Cores (Material Design 3)

Centralizada em `src/styles/colors.ts`. Usar sempre as variáveis, nunca hex solto:
- `primary` `#1E3A8A` (Azul Escuro — Segurança/GCM)
- `secondary` `#3B82F6` (Azul Claro — Ações Secundárias)
- `danger` `#EF4444` (Vermelho — Insegurança/Alerta)
- `success` `#10B981` (Verde — Segurança/Pontos Positivos)
- `warning` `#F59E0B` (Amarelo — Atenção/Moderação)
- `background` `#F3F4F6` (Cinza Claro — Fundo)
- `surface` `#FFFFFF` (Branco — Cards/Modais/Inputs)
- `textDark` `#1F2937`, `textLight` `#6B7280`, `border` `#D1D5DB`

## 📂 Documentos de Referência (em `docs/`)

- `docs/planejamento-desenvolvimento-vigia-v2.md` → cronograma, estrutura, modelo de dados, protocolo diário.
- `docs/vigia-specs-telas.md` → especificações técnicas detalhadas de cada tela (Spec-Driven Development).

## 📋 Protocolo de Sincronização de Estado (Seção 6 do planejamento)

**REGRAS DE GERENCIAMENTO DE ESTADO:**
- Gere/atualize o arquivo `docs/ESTADO_DESENVOLVIMENTO.md` **a cada interação que adicione, altere ou remova algo do projeto** (não apenas no fim do dia).
- Siga o template da Seção 6 do planejamento: ponto de controle, modificações, dependências, próximos passos, contexto técnico.
- Reforce neste `AGENTS.md` qualquer nova regra/convenção persistente criada na sessão.
- Ao encerrar a sessão do dia, garanta que o `docs/ESTADO_DESENVOLVIMENTO.md` esteja sempre atualizado com o último estado.
