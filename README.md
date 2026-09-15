# Vigia App — Guia de Instalação e Execução

Plataforma colaborativa de segurança urbana focada em São Caetano do Sul (MVP).

---

## 🚀 Pré-requisitos

* **Git** instalado.
* **Node.js** v20+ (LTS).
* **NPM** instalado.
* **Smartphone Android com Expo Go (SDK 57)**:

  > **Nota sobre o SDK 57:** Caso a Google Play Store disponibilize apenas versões legadas do Expo Go, instale o APK correspondente ao SDK 57 diretamente da página de [Releases oficiais do Expo no GitHub](https://github.com/expo/expo/releases).

---

## 📦 Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/FabricioBucardi/Vigia.git
   cd Vigia
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

---

## ▶️ Executando o Projeto

1. Inicie o servidor Metro:
   ```bash
   npx expo start
   ```

2. **No celular:**
   - Abra o aplicativo **Expo Go**.
   - Toque em **Scan QR code** e escaneie o código do terminal (ambos devem estar na mesma rede Wi-Fi).

3. Em caso de isolamento de rede ou redes Wi-Fi diferentes, utilize o modo túnel:
   ```bash
   npx expo start --tunnel
   ```

---

## 🛠️ Scripts Úteis

| Comando | Descrição |
|---------|-----------|
| `npm run typecheck` | Verificação estrita de tipagem (TypeScript) |
| `npm run web` | Execução no navegador desktop |
| `npx expo start` | Inicia o servidor Metro de desenvolvimento |
| `npx expo start --tunnel` | Servidor Metro via modo túnel (redes diferentes) |

---

## 📁 Estrutura do Projeto

```
vigia-app/
├── assets/                  # Imagens, logos e ícones locais
├── docs/                    # Documentação (planejamento, specs, estado)
├── src/
│   ├── components/          # Componentes reutilizáveis
│   ├── context/             # Contextos (Auth, Reports)
│   ├── data/                # Mocks em JSON
│   ├── navigation/          # Rotas (AuthStack, MainStack, MainTabs)
│   ├── screens/
│   │   ├── auth/            # Tela de Login/Cadastro
│   │   ├── map/             # Mapa e criação de reportes
│   │   └── profile/         # Perfil do usuário
│   ├── services/            # Camada de requisições (futura API)
│   ├── styles/              # Paleta de cores (MD3) e estilos
│   ├── types/               # Definições TypeScript
│   └── utils/               # Funções utilitárias
├── App.tsx                  # Ponto de entrada
├── app.json                 # Configurações do Expo
└── package.json             # Dependências e scripts
```

---

## 🎨 Stack Tecnológica

- **Framework**: React Native (Expo SDK 57)
- **Linguagem**: TypeScript (strict)
- **UI**: Material Design 3
- **Mapa**: Leaflet 1.9.4 (via CDN + WebView)
- **Navegação**: React Navigation (Stack + BottomTabs)
- **Animações**: React Native Reanimated

---

## 📄 Licença

Projeto em fase de desenvolvimento (MVP). Direitos reservados.
