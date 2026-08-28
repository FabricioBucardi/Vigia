# Plano de Desenvolvimento do Front-End (MVP) - Aplicativo Vigia

Esta documentação foi estruturada para orientar assistentes de desenvolvimento de código (como o OpenCode) na criação rápida e eficiente do front-end do aplicativo **Vigia** (plataforma colaborativa de segurança urbana focada em São Caetano do Sul).

Com um prazo de **3 semanas**, o desenvolvimento priorizará um **Mínimo Produto Viável (MVP)** vertical, utilizando **dados locais simulados (mockados)** estruturados de forma idêntica ao banco de dados MySQL oficial da aplicação, facilitando a futura integração com a API Spring Boot.

> 🚨 **DIRETRIZ DE PERSISTÊNCIA DE CONTEXTO**: Como o OpenCode não retém histórico entre sessões de dias diferentes, siga rigorosamente o **Protocolo de Sincronização Diária (Seção 6)** ao final de cada conversa para gerar um arquivo de transição de contexto.

---

## 1. Stack Tecnológica e Padrões de Projeto

*   **Framework**: React Native (com Expo Bare ou Managed Workflow para acelerar o desenvolvimento).
*   **Linguagem**: JavaScript / TypeScript.
*   **Design System**: Diretrizes do **Material Design 3 (Google)** para consistência no ambiente Android (compatibilidade a partir do Android 11 / API 30).
*   **Navegação**: React Navigation (`@react-navigation/native` com suporte a `Stack` e `BottomTabs`).
*   **Biblioteca de Mapas**: `react-native-maps` (configurado com coordenadas geográficas de São Caetano do Sul).
*   **Biblioteca de Ícones**: Expo Vector Icons (MaterialCommunityIcons ou Feather).

---

## 2. Estrutura de Pastas Sugerida para o Projeto

```text
vigia-app/
├── assets/                  # Imagens, logos e ícones locais
├── src/
│   ├── components/          # Componentes reutilizáveis (Card, Button, BottomSheet, CustomModal)
│   ├── data/                # Dados mockados em arquivos JSON (mockReports.json, mockUsers.json)
│   ├── navigation/          # Configuração de rotas e abas (AppNavigator.js)
│   ├── screens/             # Telas principais do aplicativo
│   │   ├── auth/            # LoginScreen.js, CadastroScreen.js
│   │   ├── map/             # MapaScreen.js, CriarReporteScreen.js, DetalheBairroScreen.js
│   │   └── profile/         # PerfilScreen.js
│   ├── services/            # Camada de requisições (api.js, reportService.js)
│   └── styles/              # Cores globais e estilos compartilhados
├── App.js                   # Ponto de entrada do aplicativo
├── AppNavigator.js          # Navegador principal (se preferir fora da pasta src)
├── ESTADO_DESENVOLVIMENTO.md # ARQUIVO DE CONTEXTO DO OPENCODE (Gerado ao fim de cada sessão)
└── app.json                 # Configurações do Expo
```

---

## 3. Modelo dos Dados Mockados (Arquivos locais JSON)

Para que o aplicativo funcione de forma dinâmica no vídeo mesmo sem estar conectado à API, criaremos arquivos JSON locais com o mesmo esquema das tabelas físicas do MySQL.

### `src/data/mockReports.json`
```json
[
  {
    "idReporte": 1,
    "idUsuario": 101,
    "autorNome": "Fernando Domingues",
    "titulo": "Rua com Iluminação Inadequada",
    "descricao": "Vários postes apagados na rua de trás da USCS, facilitando a ação de criminosos.",
    "latitude": -23.6182,
    "longitude": -46.5645,
    "endereco": "Rua Santo Antônio, Centro, São Caetano do Sul - SP",
    "tipoCategoria": "Insegurança",
    "tipoSubcategoria": "Iluminação Pública Ruim",
    "avaliacaoGravidade": 4,
    "bairroNome": "Centro",
    "dataReporte": "2026-08-28T10:30:00Z"
  },
  {
    "idReporte": 2,
    "idUsuario": 102,
    "autorNome": "Erick Teixeira",
    "titulo": "Presença Policial Reforçada",
    "descricao": "Ronda da GCM ativa em frente à estação ferroviária hoje pela tarde.",
    "latitude": -23.6110,
    "longitude": -46.5712,
    "endereco": "Estação São Caetano do Sul, Centro - SP",
    "tipoCategoria": "Segurança",
    "tipoSubcategoria": "Presença Policial",
    "avaliacaoGravidade": 5,
    "bairroNome": "Centro",
    "dataReporte": "2026-08-28T12:00:00Z"
  },
  {
    "idReporte": 3,
    "idUsuario": 103,
    "autorNome": "Murilo Mandelli",
    "titulo": "Tentativa de Assalto",
    "descricao": "Indivíduo suspeito de bicicleta abordando pedestres perto da praça.",
    "latitude": -23.6234,
    "longitude": -46.5598,
    "endereco": "Praça dos Imigrantes, Barcelona, São Caetano do Sul - SP",
    "tipoCategoria": "Insegurança",
    "tipoSubcategoria": "Assalto/Roubo",
    "avaliacaoGravidade": 5,
    "bairroNome": "Barcelona",
    "dataReporte": "2026-08-27T21:15:00Z"
  }
]
```

### `src/data/mockBairros.json`
```json
[
  {
    "id": 1,
    "nome": "Centro",
    "classificacaoSeguranca": 4.2
  },
  {
    "id": 2,
    "nome": "Barcelona",
    "classificacaoSeguranca": 3.5
  },
  {
    "id": 3,
    "nome": "Santa Maria",
    "classificacaoSeguranca": 4.8
  }
]
```

---

## 4. Escopo do MVP e Especificação das Telas

### Tela 1: Login e Cadastro (`src/screens/auth/`)
*   **Cadastro**: Inputs para `Nome Completo`, `E-mail`, `Senha` e `Data de Nascimento`. Botão "Criar Conta".
*   **Login**: Inputs para `E-mail` e `Senha` com botão "Acessar".
*   *Comportamento de Mock*: Ao clicar em "Acessar", o app atualiza o estado local para autenticado, guardando um usuário mock no contexto global e navegando diretamente para o Mapa.

### Tela 2: Mapa Interativo (Tela Principal - `src/screens/map/MapaScreen.js`)
*   **Visualização**: Carregar o componente `MapView` focado em São Caetano do Sul:
    *   Latitude: `-23.6182`
    *   Longitude: `-46.5645`
    *   Latitude Delta / Longitude Delta: `0.02` (aproximação ideal da cidade).
*   **Pins**: Exibir os pins de `mockReports.json`.
    *   *Marcador Verde*: Se `tipoCategoria` for "Segurança".
    *   *Marcador Vermelho*: Se `tipoCategoria` for "Insegurança".
*   **Interação**:
    *   Ao clicar em um pin, deve abrir um `BottomSheet` ou um Card inferior customizado exibindo: Título, Subcategoria, Descrição, Gravidade (1 a 5 estrelas ou escala de bolinhas) e o nome do autor do reporte.
    *   Deve possuir um botão flutuante **"+"** ou **"Reportar"** visível em destaque.

### Tela 3: Formulário de Criação de Reporte (`src/screens/map/CriarReporteScreen.js`)
*   **Formulário**:
    *   **Classificação**: Botões seletores para "Segurança" ou "Insegurança".
    *   **Subcategoria**: Seletor (ex: Iluminação Ruim, Presença de GCM/Polícia, Furto/Assalto).
    *   **Gravidade**: Slider ou seletor de 1 a 5 estrelas.
    *   **Localização**: Exibir as coordenadas capturadas pelo GPS (ou simuladas na posição central do mapa).
    *   **Descrição**: Campo de texto longo para detalhes adicionais.
*   *Comportamento de Mock*: Ao clicar em "Concluir", a função insere o novo objeto no array local de reportes do estado do aplicativo e retorna ao mapa. O novo marcador deve surgir na tela instantaneamente.

### Tela 4: Visão Geral de Bairro (`src/screens/map/DetalheBairroScreen.js` ou BottomSheet)
*   **Visualização**: Quando o usuário seleciona um bairro específico na barra de busca ou no menu lateral:
    *   Exibir a nota de segurança do bairro (Ex: 4.2 / 5.0) com uma barra de progresso colorida correspondente.
    *   Listar de forma resumida todos os reportes cadastrados naquele bairro.

### Tela 5: Perfil do Usuário (`src/screens/profile/PerfilScreen.js`)
*   **Conteúdo**:
    *   Nome do usuário autenticado, e-mail e avatar.
    *   **Indicador de Reputação**: Círculo ou badge mostrando a classificação da reputação do usuário baseada em suas interações.
    *   **Histórico de Reportes**: Lista horizontal ou vertical de todos os reportes criados exclusivamente por esse usuário (idUsuario logado).
    *   Botão "Sair" (Logout).

---

## 5. Cronograma e Passos Recomendados para Desenvolvimento (3 Semanas)

### **Semana 1: Infraestrutura Básica e Telas de Acesso**
*   **Passo 1.1**: Inicializar o projeto Expo (`npx create-expo-app vigia-app`) e limpar os componentes padrões.
*   **Passo 1.2**: Instalar as dependências essenciais:
    ```bash
    npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs react-native-gesture-handler react-native-reanimated react-native-safe-area-context react-native-screens
    ```
*   **Passo 1.3**: Configurar a navegação de login (`Stack.Navigator`) e a navegação principal pós-login (`Tab.Navigator` conectando Mapa e Perfil).
*   **Passo 1.4**: Criar os designs das telas de Cadastro e Login focando em um visual limpo utilizando os esquemas de cores do projeto (Azul escuro e cinza neutro).

### **Semana 2: O Mapa Interativo e o Cadastro de Ocorrências**
*   **Passo 2.1**: Instalar a biblioteca de mapa e as permissões de geolocalização:
    ```bash
    npm install react-native-maps react-native-geolocation-service
    ```
*   **Passo 2.2**: Criar a tela do mapa com coordenadas fixadas em São Caetano do Sul. Carregar os marcadores vindos do arquivo `mockReports.json`.
*   **Passo 2.3**: Criar o componente de **Card Inferior** (modal ou bottom-sheet) que exibe as informações completas quando um pin é tocado pelo usuário.
*   **Passo 2.4**: Implementar a tela de **Criar Reporte**. Integrar o seletor de classificação ("Segurança" / "Insegurança") e de gravidade de 1 a 5. Configurar o botão "Concluir" para atualizar o estado local de dados na memória.

### **Semana 3: Perfil, Feedback de Moderação e Gravação**
*   **Passo 3.1**: Desenvolver a tela de **Perfil do Usuário** exibindo o histórico de seus reportes de segurança pessoais e seu score de reputação.
*   **Passo 3.2**: Criar uma simulação rápida de Moderação (ex: criar um reporte teste, clicar em um pin e clicar no botão "Denunciar" para ver o card mudar de status para "Reporte sob análise" ou sumir temporariamente).
*   **Passo 3.3 (Opcional - Integração com Back)**: Se a API Spring Boot estiver de pé, criar o arquivo `src/services/reportService.js` com chamadas `fetch` ou `axios` para substituir os dados mockados pelos do servidor real.
*   **Passo 3.4**: Gravar as telas em funcionamento e exportar o vídeo de demonstração do aplicativo em funcionamento contínuo.

---

## 6. Protocolo de Registro de Estado do OpenCode (Sincronização Diária)

Como o desenvolvedor utiliza uma instância de IA sem memória persistente de longo prazo (como o OpenCode), a IA **deve atuar ativamente na preservação do contexto do projeto** seguindo a instrução abaixo ao final de cada conversa.

### 📝 Instrução para o OpenCode ao Final de Toda Sessão:
> *"Sempre que o usuário informar que está encerrando a sessão de desenvolvimento por hoje, você deve gerar um arquivo em formato Markdown chamado `ESTADO_DESENVOLVIMENTO.md` na raiz do projeto contendo as seções descritas no template abaixo. O desenvolvedor usará este arquivo para restaurar seu contexto no início da próxima conversa."*

### 📁 Template do arquivo `ESTADO_DESENVOLVIMENTO.md`:
```markdown
# Estado Atual do Desenvolvimento - Aplicativo Vigia

## 📍 1. Onde Paramos (Ponto de Controle)
- **Semana/Passo Atual**: [Indicar ex: Semana 1, Passo 1.3]
- **Última tela/componente finalizado**: [Descrever o que foi concluído na sessão]

## 🛠️ 2. Modificações Efetuadas nesta Sessão
- **Arquivos Criados**:
  - `caminho/do/arquivo.js` -> [Função deste arquivo]
- **Arquivos Modificados**:
  - `caminho/do/arquivo.js` -> [O que foi mudado e por quê]

## 📋 3. Estado das Dependências instaladas
- [Listar as bibliotecas novas que foram instaladas na máquina do usuário, se houver]

## 🚀 4. Próximos Passos Imediatos para a Próxima Sessão
1. [Próxima tarefa 1 baseada no cronograma]
2. [Próxima tarefa 2]

## 🧠 5. Contexto Técnico para o Próximo Chat
*(Resumo compacto da arquitetura atual, estados globais criados, variáveis e props principais para que a IA da próxima sessão compreenda a lógica de código sem precisar ler todo o projeto).*
```

---

*Com este documento base e o protocolo de sincronização diária ativo, o desenvolvedor do Vigia garante consistência máxima, velocidade no desenvolvimento do MVP e uma documentação limpa do processo!*
