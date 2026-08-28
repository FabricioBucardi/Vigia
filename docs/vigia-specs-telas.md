# Especificação Técnica das Telas (MVP) - Aplicativo Vigia

Este documento contém a especificação técnica detalhada para o desenvolvimento das telas do MVP do aplicativo **Vigia** (React Native / Expo). Ele foi estruturado sob a metodologia **Spec-Driven Development (SDD)**, utilizando os requisitos, casos de uso e regras de negócio extraídos diretamente do relatório do projeto.

---

## Como usar este documento com o OpenCode:
1. Escolha a tela que deseja desenvolver no momento.
2. Copie a seção correspondente (Requisitos, Interface, Estado, Fluxos).
3. Copie o **Prompt Pronto para o OpenCode** correspondente e envie para a IA.
4. Teste o código gerado no seu celular físico com o Expo Go.
5. Faça o commit no Git ao validar o funcionamento da tela antes de passar para a próxima.

---

## 1. Contexto Global de Estilo (Material Design 3)

Para manter a consistência visual em todo o aplicativo, instrua o OpenCode a usar as seguintes variáveis globais de estilo (`src/styles/colors.js`):

```javascript
export const COLORS = {
  primary: '#1E3A8A',     // Azul Escuro (Segurança/GCM)
  secondary: '#3B82F6',   // Azul Claro (Ações Secundárias)
  danger: '#EF4444',      // Vermelho (Insegurança/Alerta)
  success: '#10B981',     // Verde (Segurança/Pontos Positivos)
  warning: '#F59E0B',     // Amarelo (Atenção/Moderação)
  background: '#F3F4F6',  // Cinza Claro (Fundo das telas)
  surface: '#FFFFFF',     // Branco (Cards, Modais, Inputs)
  textDark: '#1F2937',    // Cinza Quase Preto (Textos principais)
  textLight: '#6B7280',   // Cinza Médio (Textos secundários/legendas)
  border: '#D1D5DB'       // Cinza Claro (Bordas de inputs/divisores)
};
```

---

## 2. ESPECIFICAÇÕES DETALHADAS POR TELA

### TELA 1: LOGIN E CADASTRO (`src/screens/auth/AuthScreen.js`)

#### A. Requisitos e Casos de Uso Vinculados
*   **Requisitos Funcionais**: **R01** (Cadastro de Cidadão), **R04** (Autenticação/Login).
*   **Regra de Negócio**: O acesso ao aplicativo e visualização do mapa requer autenticação prévia de segurança.

#### B. Interface Visual (Componentes MD3)
*   Container centralizado com o logotipo (ou ícone de escudo) e o nome do app (**Vigia**).
*   Abas deslizantes ou botões alternadores (Tabs) no topo da tela para transicionar entre **"Entrar" (Login)** e **"Cadastrar" (Cadastro)**.
*   **Formulário de Login**:
    *   Campo de texto para E-mail (com teclado do tipo `email-address`).
    *   Campo de senha oculto (com botão de olho para revelar/esconder).
    *   Botão de ação principal "Acessar" (estilo preenchido, cor Primária).
*   **Formulário de Cadastro**:
    *   Campo de texto: Nome Completo.
    *   Campo de texto: E-mail.
    *   Campo de data: Data de Nascimento (com máscara `DD/MM/AAAA` ou DatePicker).
    *   Campo de senha oculto.
    *   Campo de confirmação de senha oculto.
    *   Botão de ação principal "Criar Conta" (estilo preenchido, cor Primária).

#### C. Gerenciamento de Estado (React States)
*   `activeTab`: `'login'` ou `'register'`.
*   `formData`: Objeto contendo `nome`, `email`, `dataNascimento`, `senha`, `confirmarSenha`.
*   `loading`: Booleano para exibir spinner de carregamento no botão.

#### D. Ações e Fluxos Interativos
1.  **Validação Visual Simples**: Ao clicar em "Acessar" ou "Criar Conta", verificar se os campos obrigatórios estão preenchidos.
2.  **Fluxo de Mock**: Se as validações passarem, simular um tempo de resposta de 1 segundo (`setTimeout`), atualizar o estado de autenticação global e redirecionar o usuário para a rota principal (`Mapa`).

---

#### 📥 PROMPT PRONTO PARA COPIAR (TELA 1):
> "Estou desenvolvendo o front-end em React Native (Expo) do app de segurança comunitária 'Vigia'. Preciso que você crie a tela de login e cadastro unificada chamada `src/screens/auth/AuthScreen.js`.
>
> Siga estas especificações de desenvolvimento:
> 1. Use as cores do nosso arquivo global: Fundo `#F3F4F6`, Primário `#1E3A8A`, Inputs brancos com bordas finas.
> 2. No topo, exiba um ícone de escudo (`MaterialCommunityIcons` 'shield-home') e o título 'VIGIA' em destaque.
> 3. Crie um seletor visual elegante no estilo de Abas para alternar entre as abas 'Login' e 'Cadastro' na mesma tela.
> 4. O formulário de Login deve pedir E-mail e Senha (com opção de ver a senha).
> 5. O formulário de Cadastro deve pedir Nome Completo, E-mail, Data de Nascimento, Senha e Confirmar Senha.
> 6. Ao clicar nos botões 'Acessar' ou 'Criar Conta', faça uma validação rápida dos campos vazios e simule uma requisição de rede com `setTimeout` de 1 segundo exibindo um ActivityIndicator.
> 7. Se tudo der certo, chame uma função de sucesso simulada que navega para a tela 'Mapa'.
>
> Gere o código completo, limpo e bem comentado usando componentes nativos do React Native e Expo Vector Icons."

---

### TELA 2: MAPA INTERATIVO (`src/screens/map/MapaScreen.js`)

#### A. Requisitos e Casos de Uso Vinculados
*   **Requisitos Funcionais**: **R16** (Visualizar Mapa com Ocorrências), **R17** (Filtragem por Categoria/Bairro), **R60** (Visualizar Detalhes do Reporte).
*   **Regra de Negócio**: O mapa deve abrir centralizado na cidade de São Caetano do Sul e carregar os marcadores diferenciados visualmente por cores dependendo da gravidade e classificação.

#### B. Interface Visual (Componentes MD3)
*   Tela cheia ocupada pelo componente `MapView`.
*   **Botão Flutuante de Adição (FAB)**: Botão redondo posicionado no canto inferior direito contendo o ícone **"+"**, na cor Primária, para abrir o fluxo de criação de reporte.
*   **Filtros Rápidos (Chips/Pílulas)**: Uma fileira horizontal flutuante no topo do mapa contendo filtros rápidos: "Todos", "Segurança" (Verde), "Insegurança" (Vermelho).
*   **BottomSheet / Painel Deslizante Inferior**: Um painel oculto que sobe automaticamente a partir do rodapé da tela sempre que o usuário toca em um marcador no mapa.

#### C. Gerenciamento de Estado (React States)
*   `reports`: Array contendo a lista completa de reportes (inicializado com os dados do arquivo `mockReports.json`).
*   `selectedReport`: Objeto com o reporte atualmente selecionado pelo clique no pin (ou `null` se nenhum estiver aberto).
*   `filtroAtivo`: String indicando o filtro de visualização selecionado (`'todos'`, `'seguranca'`, `'inseguranca'`).

#### D. Ações e Fluxos Interativos
1.  **Renderização do Mapa**: Carregar as coordenadas padrão de São Caetano do Sul (`latitude: -23.6182`, `longitude: -46.5645`, `latitudeDelta: 0.02`).
2.  **Filtragem de Pins**: Exibir no mapa apenas os marcadores que correspondem ao `filtroAtivo`.
3.  **Toque no Marcador**: Ao clicar em um pin:
    *   O marcador verde representa uma categoria de **"Segurança"** (ex: Ronda ativa, boa iluminação).
    *   O marcador vermelho representa uma categoria de **"Insegurança"** (ex: Assalto, falta de iluminação).
    *   Ao tocar, atualizar o estado `selectedReport` e fazer com que o BottomSheet apareça exibindo o resumo das informações do reporte (Título, Endereço, Gravidade e Tipo).

---

#### 📥 PROMPT PRONTO PARA COPIAR (TELA 2):
> "Crie a tela do mapa principal do aplicativo chamada `src/screens/map/MapaScreen.js` usando React Native e a biblioteca `react-native-maps`.
>
> Siga estas especificações detalhadas:
> 1. O mapa deve iniciar focado nas coordenadas de São Caetano do Sul (lat: -23.6182, lon: -46.5645, delta: 0.02).
> 2. Importe e utilize os dados mockados de ocorrências de um arquivo local contido na estrutura `../../data/mockReports.json`.
> 3. Plote marcadores (Markers) no mapa com base nos dados. Se o atributo `tipoCategoria` for 'Segurança', o pin deve ser Verde. Se for 'Insegurança', o pin deve ser Vermelho.
> 4. Crie um cabeçalho flutuante no topo do mapa com botões do tipo 'Chips' horizontais: 'Todos', 'Segurança', 'Insegurança'. Ao clicar neles, filtre os marcadores exibidos no mapa em tempo real.
> 5. Crie um botão flutuante redondo (FAB) no canto inferior direito com um ícone de '+' (cor `#1E3A8A`) que navega para a tela 'CriarReporte'.
> 6. Se o usuário clicar em um marcador do mapa, exiba um card flutuante na parte inferior da tela (estilo BottomSheet simplificado) contendo: Título, Endereço, a Gravidade avaliada de 1 a 5 (mostrada em estrelas) e um botão 'Ver Detalhes' que abre um modal com a descrição completa do reporte.
>
> Garanta que o layout flua perfeitamente, tratando margens seguras com `SafeAreaView` e que a navegação do Expo funcione corretamente."

---

### TELA 3: CRIAR REPORTE (`src/screens/map/CriarReporteScreen.js`)

#### A. Requisitos e Casos de Uso Vinculados
*   **Requisitos Funcionais**: **R19** (Classificação do Reporte), **R20** (Seleção de Subcategoria), **R22** (Preenchimento de Informações do Reporte).
*   **Regras de Negócio**: Todo reporte deve ter uma classificação ("Segurança" ou "Insegurança"), uma subcategoria correspondente, um nível de gravidade de 1 a 5 e descrição de texto obrigatória.

#### B. Interface Visual (Componentes MD3)
*   **Cabeçalho da Tela**: Botão de voltar "Seta" e título "Novo Reporte".
*   **Seletor de Categoria (Dois Botões de Alternância)**:
    *   Botão "Segurança" (Fundo Verde quando selecionado).
    *   Botão "Insegurança" (Fundo Vermelho quando selecionado).
*   **Seletor Dropdown / Lista**: Menu de seleção para a subcategoria.
    *   *Opções de Segurança*: Presença Policial, Iluminação Pública Boa, Câmeras de Vigilância Ativas, Área Segura.
    *   *Opções de Insegurança*: Assalto/Falta de Segurança, Iluminação Pública Ruim, Furto, Atividade Suspeita.
*   **Avaliação de Gravidade**: Seletor horizontal com ícones de estrelas (1 a 5) ou pílulas numeradas.
*   **Campo de Localização**: Exibição em modo de leitura (apenas texto) do endereço capturado ou coordenadas da ocorrência (fixas em São Caetano do Sul para fins de teste no vídeo).
*   **Campo de Texto (Descrição)**: Input multilinha com espaço para o usuário relatar o ocorrido de forma detalhada.
*   **Botão de Envio**: Botão "Publicar Reporte" (cor Primária).

#### C. Gerenciamento de Estado (React States)
*   `tipoCategoria`: `'Segurança'` ou `'Insegurança'`.
*   `tipoSubcategoria`: String contendo a subcategoria selecionada.
*   `avaliacaoGravidade`: Número de 1 a 5 (padrão iniciado em 3).
*   `titulo`: String do título do reporte.
*   `descricao`: String de texto explicativo.

#### D. Ações e Fluxos Interativos
1.  **Validação de Preenchimento**: Bloquear o botão de envio ou mostrar um alerta se o Título ou Descrição estiverem em branco.
2.  **Adicionar ao Banco Local (Memória)**: Ao clicar em "Publicar Reporte":
    *   Criar um novo objeto estruturado com todos os estados preenchidos.
    *   Atribuir automaticamente um novo ID sequencial, coordenadas do centro de São Caetano, nome do bairro fixo e data atual.
    *   Adicionar esse objeto na lista global em memória para que o novo pin surja no mapa.
    *   Exibir uma mensagem de sucesso ("Reporte publicado com sucesso!") e retornar para a tela anterior do Mapa.

---

#### 📥 PROMPT PRONTO PARA COPIAR (TELA 3):
> "Gere o código completo da tela de criação de reportes do app chamada `src/screens/map/CriarReporteScreen.js`.
>
> Siga estas especificações estritas baseadas nas regras de negócio do aplicativo:
> 1. No topo, adicione um cabeçalho simples com um botão de voltar (seta) e o título 'Criar Nova Ocorrência'.
> 2. Adicione um campo de texto para o 'Título' do reporte.
> 3. Crie um seletor de duas colunas para a Categoria:
>    * Botão 'Segurança': Se selecionado, fica preenchido de Verde (`#10B981`) com texto branco.
>    * Botão 'Insegurança': Se selecionado, fica preenchido de Vermelho (`#EF4444`) com texto branco.
> 4. Adicione um Dropdown de seleção simples (pode simular com um modal de lista ou Picker) para a 'Subcategoria' que mude de acordo com a categoria selecionada:
>    * Se Segurança: 'Presença Policial/GCM', 'Boa Iluminação', 'Câmeras de Segurança'.
>    * Se Insegurança: 'Assalto/Furto', 'Iluminação Ruim', 'Ponto de Drogas', 'Ausência de Policiamento'.
> 5. Crie um seletor visual de 'Gravidade' de 1 a 5 estrelas usando ícones interativos (`star` ou `star-outline` do `MaterialCommunityIcons`). O usuário deve conseguir clicar nas estrelas para mudar a nota.
> 6. Adicione um campo de texto longo (multilinha) para a 'Descrição detalhada do ocorrido'.
> 7. Ao clicar em 'Publicar Reporte', valide se o Título e a Descrição estão preenchidos. Caso positivo, exiba um alerta de sucesso, simule a inclusão desse novo item na lista de dados do app e use o comando `navigation.goBack()` para retornar ao mapa exibindo o novo ponto."

---

### TELA 4: DETALHE DO BAIRRO (`src/screens/map/DetalheBairroScreen.js`)

#### A. Requisitos e Casos de Uso Vinculados
*   **Requisitos Funcionais**: **R64** (Visualizar Visão Geral/Overview do Bairro), **R17** (Filtragem por Bairro).
*   **Regra de Negócio**: O aplicativo deve calcular automaticamente e exibir uma nota consolidada de segurança de cada bairro de São Caetano do Sul com base nas notas dadas pelos usuários locais.

#### B. Interface Visual (Componentes MD3)
*   **Título do Bairro**: Texto grande no topo (Ex: "Bairro Barcelona").
*   **Painel de Segurança do Bairro**:
    *   Um grande círculo central contendo a classificação de segurança calculada (Ex: `3.5 / 5.0`).
    *   Barra de progresso de status horizontal que muda de cor (Verde para notas acima de 4, Amarelo para notas entre 3 e 4, e Vermelho para notas abaixo de 3).
*   **Seção de Estatísticas**:
    *   Contador simples de reportes de Segurança versus contadores de Insegurança no bairro.
*   **Lista de Reportes Recentes**:
    *   Uma lista vertical (FlatList) exibindo apenas os reportes específicos que pertencem àquele bairro selecionado. Cada item deve ser renderizado em um card com título, data e gravidade.

#### C. Gerenciamento de Estado (React States)
*   `bairroData`: Objeto contendo o nome do bairro e a sua nota consolidada.
*   `bairrosReports`: Array com a lista de reportes filtrada contendo apenas os dados do bairro exibido.

---

#### 📥 PROMPT PRONTO PARA COPIAR (TELA 4):
> "Desenvolva a tela de visão geral de um bairro chamada `src/screens/map/DetalheBairroScreen.js` para o app Vigia.
>
> Siga esta especificação técnica para o layout e lógica:
> 1. A tela deve receber via parâmetros de rota (params) o nome do bairro selecionado (por exemplo, 'Barcelona' ou 'Centro').
> 2. Busque os dados correspondentes no arquivo `src/data/mockBairros.json` para exibir o score de segurança do bairro (ex: 3.5).
> 3. Exiba um painel visual destacado no topo com a nota grande e um indicador colorido de progresso circular ou linear:
>    * Nota >= 4: Verde (`#10B981`) indicando 'Região Segura'.
>    * Nota entre 3 e 3.9: Amarelo (`#F59E0B`) indicando 'Atenção Necessária'.
>    * Nota < 3: Vermelho (`#EF4444`) indicando 'Área com Alta Ocorrência'.
> 4. Exiba um pequeno sumário com o total de reportes de Segurança e Insegurança registrados naquele bairro.
> 5. Crie uma lista vertical (`FlatList`) abaixo do painel carregando e exibindo todos os reportes específicos daquele bairro que estão gravados no arquivo de dados mockados `mockReports.json`. Cada linha deve ser um card limpo mostrando o título, a data resumida e o ícone indicando se é segurança ou insegurança."

---

### TELA 5: PERFIL DO CIDADÃO (`src/screens/profile/PerfilScreen.js`)

#### A. Requisitos e Casos de Uso Vinculados
*   **Requisitos Funcionais**: **R11** (Visualizar Informações do Cidadão), **R13** (Exibir Histórico de Reportes Próprios).
*   **Regra de Negócio**: O cidadão deve poder visualizar seus dados, sua classificação de reputação na comunidade (baseada em quantos reportes válidos ele já realizou) e seu histórico pessoal de interações.

#### B. Interface Visual (Componentes MD3)
*   **Cabeçalho de Perfil**:
    *   Imagem de avatar circular centralizada.
    *   Nome do Usuário e e-mail logo abaixo em destaque.
*   **Selo de Reputação do Usuário**:
    *   Um Badge ou selo colorido destacado exibindo o título da sua reputação na comunidade (Ex: "Cidadão Protetor", "Colaborador Bronze").
*   **Histórico de Atividade (Seus Reportes)**:
    *   Uma FlatList mostrando exclusivamente os reportes que pertencem ao ID do usuário conectado.
    *   Cada item deve possuir um botão para visualizar o status do reporte (ex: "Ativo" ou "Sob Análise da Moderação").
*   **Ação de Logout**:
    *   Um botão destacado de "Sair da Conta" posicionado no rodapé da página.

#### C. Gerenciamento de Estado (React States)
*   `usuarioLogado`: Objeto contendo os dados do usuário autenticado (Ex: Fernando Domingues, idUsuario: 101).
*   `meusReportes`: Array filtrando e listando apenas as ocorrências feitas por aquele idUsuario específico.

---

#### 📥 PROMPT PRONTO PARA COPIAR (TELA 5):
> "Crie a tela de perfil do usuário chamada `src/screens/profile/PerfilScreen.js` para o app Vigia.
>
> Desenvolva respeitando a seguinte especificação:
> 1. No cabeçalho, exiba um avatar padrão redondo (use um ícone de pessoa ou imagem de placeholder) acompanhado do nome do usuário logado (ex: 'Fernando Domingues') e seu e-mail.
> 2. Adicione uma seção de 'Score de Reputação do Cidadão' contendo um card com um indicador de nível (ex: 'Reputação: Excelente - Nível Cidadão Ativo') e uma pequena descrição explicando que seu score cresce quando seus reportes ajudam a comunidade.
> 3. Crie uma listagem vertical com o título 'Meus Reportes Cadastrados'. Filtre os dados do arquivo `mockReports.json` para exibir apenas as ocorrências que pertencem ao ID de usuário logado (ex: idUsuario 101).
> 4. Cada linha de reporte do usuário deve vir formatada em um card com visual agradável, exibindo o título, a data do reporte e um badge colorido de status (Ex: 'Publicado' em verde, ou 'Em Moderação' em amarelo).
> 5. Adicione um botão de 'Sair da Conta' (Logout) no final da página que simula o encerramento da sessão e retorna o usuário à tela de login."
