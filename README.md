# ⠃⠕⠍⠀⠙⠊⠁ — BraillePlay 🎮

> **Plataforma web educacional e inclusiva para o aprendizado prático do alfabeto Braille e da datilologia em Libras.**

![Python](https://img.shields.io/badge/Python-3.14-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-Latest-000000?style=for-the-badge&logo=flask&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Acessibilidade](https://img.shields.io/badge/Acessibilidade-WCAG_Alineada-22C55E?style=for-the-badge)

O **BraillePlay** é uma aplicação web desenvolvida para tornar o ensino do sistema Braille e de Libras mais interativo, dinâmico e acessível. Através de uma abordagem de aprendizado incremental e gamificada, o usuário pode praticar e testar seus conhecimentos diretamente no navegador, contando com recursos avançados de áudio e suporte total a comandos por teclado.

---

## 🚀 Módulos Funcionais

A aplicação está dividida em três pilares interativos:

### 1. Módulo Aprender 🧠
* **Como funciona:** O usuário é desafiado a montar letras sorteadas aleatoriamente em uma célula Braille virtual de 6 pontos.
* **Recursos:** Feedback visual e sonoro imediato, animações explicativas em caso de erro e botão de ajuda instantânea.

### 2. Forca Braille 💀
* **Como funciona:** Jogo tradicional adaptado para dois jogadores no mesmo dispositivo. O Jogador 1 insere uma palavra secreta e o Jogador 2 deve adivinhá-la ativando os pontos correspondentes na célula Braille em vez de usar o teclado convencional.
* **Recursos:** Cronômetro integrado, gerenciamento de vidas animado e acesso rápido ao painel de referência cruzada.

### 3. Conversor Texto ↔ Braille 🔁
* **Como funciona:** Traduz textos livres de até 200 caracteres para o bloco de caracteres Unicode oficiais do Braille (`U+2800` a `U+28FF`).
* **Recursos:** Exibição de mini-células táteis virtuais interativas e sistema de áudio caractere por caractere ou da frase completa.

---

## 🛠️ Stack Tecnológica

### Backend
* **Python 3.14 & Flask:** Motor do servidor, roteamento de APIs e renderização de templates dinâmicos com Jinja2.
* **edge-tts:** Síntese de voz neural avançada em português (`pt-BR-FranciscaNeural`), garantindo uma narração fluida e natural.
* **Asyncio & Hashlib:** Controle assíncrono de requisições de áudio e geração de cache determinístico via MD5.

### Frontend
* **HTML5 Semântico & CSS3 Moderno:** Layout responsivo construído com Grid/Flexbox, variáveis CSS para design tokens e animações nativas.
* **Vanilla JavaScript (ES6+):** Toda a lógica de interação, manipulação de estados do jogo e fallback de acessibilidade local.

---

## 🔊 Arquitetura Inteligente de Áudio (Dupla Camada)

Para contornar instabilidades de rede e limitações de sistemas operacionais, o sistema de narração foi projetado com resiliência:

1. **Camada Primária (Servidor):** Requisições na API `/api/tts` geram arquivos MP3 neurais de alta fidelidade. O servidor conta com um sistema de **Cache LRU** automático, limitando o armazenamento em disco a 60 arquivos (removendo os menos utilizados recentemente).
2. **Camada de Fallback (Navegador):** Se o servidor falhar ou o usuário estiver offline, o JavaScript assume o controle utilizando a **Web Speech API (`speechSynthesis`)** local do sistema operacional.

---

## ♿ Acessibilidade Integrada (Atalhos e Referência)

O projeto foi desenhado sob a perspectiva do design inclusivo:
* **Navegação por Teclado:** Ao focar na célula Braille, as teclas de **1 a 6** ativam/desativam diretamente os respectivos pontos, com feedback em tempo real para leitores de tela ("Ponto N ativado").
* **Semântica ARIA:** Utilização rigorosa de atributos como `role="dialog"`, `aria-modal`, `aria-checked` e `aria-label`.
* **Referência Cruzada Braille ↔ Libras:** Modais globais que mapeiam visualmente e sonoramente o alfabeto completo combinando a célula Braille com a imagem de datilologia em Libras correspondente.

---

## 📁 Estrutura do Projeto

```text
BraillePlay/
├── app.py                  # Aplicação Flask (rotas, lógica de conversão e TTS)
├── static/
│   ├── script.js           # Lógica interativa compartilhada e fallbacks de áudio
│   ├── style.css           # Design tokens, componentes e responsividade
│   ├── audio/              # Cache dinâmico de áudios MP3 (LRU)
│   └── libras/             # Banco de imagens da datilologia (A.png a Z.png)
└── templates/
    ├── base.html           # Estrutura master, navbar e modais globais
    ├── index.html          # Dashboard/Página inicial
    ├── aprender.html       # Interface do módulo de aprendizado
    ├── forca.html          # Painel do jogo da forca em dupla
    └── conversor.html      # Tela de tradução textual e interativa
