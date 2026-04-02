# CineChain

CineChain é uma aplicação web para gerenciar séries, temporadas, episódios e listas personalizadas. Tudo integrado à API blockchain da GoLedger.

🚀 **[CineChain](https://cine-chain.vercel.app/)**

---

## Sumário

- [Pré-requisitos](#pré-requisitos)
- [Instalação e configuração](#instalação-e-configuração)
- [Rodando o projeto](#rodando-o-projeto)
- [Rodando os testes](#rodando-os-testes)
- [Deploy na Vercel](#deploy-na-vercel)
- [Arquitetura](#arquitetura)
- [Decisões técnicas](#decisões-técnicas)
- [Acessibilidade](#acessibilidade)
- [Responsividade](#responsividade)
- [SEO](#seo)

---

## Pré-requisitos

- **Node.js** ≥ 18
- **npm** ≥ 9

---

## Instalação e configuração

Clone o repositório e instale as dependências:

```bash
npm install
```

Depois, crie um arquivo `.env` na raiz do projeto com as credenciais da API:

```env
# URL base da API GoLedger
VITE_API_URL=http://ec2-50-19-36-138.compute-1.amazonaws.com

# Credenciais de autenticação HTTP Basic
VITE_API_USER=seu_usuario
VITE_API_PASSWORD=sua_senha
```

> Vale lembrar: variáveis prefixadas com `VITE_` são embutidas no bundle pelo Vite e ficam visíveis no cliente. Não coloque nada aqui que não possa ser exposto no browser.

---

## Rodando o projeto

Para subir o servidor de desenvolvimento com hot reload:

```bash
npm run dev
```

Acesse em [http://localhost:5173](http://localhost:5173). O Vite cuida de recarregar a página instantaneamente a cada mudança no código, e o proxy redireciona chamadas para `/api/*` para a API GoLedger sem problemas de CORS.

Para gerar o build de produção:

```bash
npm run build
```

Os arquivos vão para `dist/`. Se quiser conferir o resultado do build localmente antes de subir:

```bash
npm run preview
```

Para rodar o linter:

```bash
npm run lint
```

---

## Rodando os testes

O projeto usa **Cypress** para testes e2e. Todos os testes interceptam as chamadas de rede com `cy.intercept` e respondem com fixtures locais, ou seja, **nenhuma API real precisa estar no ar**, somente a aplicação rodando localmente.

Suba o servidor de desenvolvimento em um terminal:

```bash
npm run dev
```

Depois, em outro terminal, escolha o modo que preferir:

```bash
# Abre o Cypress App — ótimo para desenvolver e depurar testes visualmente
npm run cy:open

# Roda tudo no terminal, sem interface — ideal para CI
npm run cy:run
```

### O que está coberto

| Arquivo | O que testa |
|---|---|
| `tv-shows.cy.ts` | Listagem de séries, busca, abertura do drawer de criação |
| `tv-show-detail.cy.ts` | Página de detalhe do show, temporadas, abertura do drawer |
| `season-detail.cy.ts` | Página de detalhe da temporada, episódios, botão de voltar |
| `watchlist.cy.ts` | Listagem de watchlists, criação, interações do card |
| `not-found.cy.ts` | Renderização da página 404 |

### Comandos customizados

Dois helpers estão disponíveis globalmente em todos os specs, declarados em `cypress/support/commands.ts`:

| Comando | O que faz |
|---|---|
| `cy.mockSearch({ tvShows: 'tv-shows.json' })` | Intercepta `POST /api/query/search` e responde com o fixture correto baseado no `@assetType` da query |
| `cy.mockReadAsset('seasons', { ... })` | Intercepta `POST /api/query/readAsset` e responde com o objeto fornecido |

---

## Deploy na Vercel

A aplicação está disponível em produção em **[CineChain](https://cine-chain.vercel.app/)**.

O deploy é simples porque a aplicação é uma SPA com arquivos estáticos e a Vercel lida muito bem com isso.

### Deploys automáticos

Uma vez conectado ao repositório, a Vercel faz deploy automaticamente a cada push na branch principal. Pull Requests também ganham URLs de preview, o que é útil para revisar mudanças antes de subir para produção.

---

## Arquitetura

```
src/
├── app.tsx                  # Definição de rotas (React Router)
├── main.tsx                 # Entry point — monta os providers globais
│
├── pages/                   # Views organizadas por domínio
│   ├── tvshow/
│   │   ├── tv-shows-page.tsx
│   │   ├── tv-show-detail-page.tsx
│   │   └── components/      # Componentes exclusivos deste domínio
│   ├── season/
│   │   ├── season-detail-page.tsx
│   │   └── components/
│   ├── watchlist/
│   │   ├── watchlist-page.tsx
│   │   └── components/
│   └── not-found-page.tsx
│
├── components/
│   ├── layout/              # Navbar e wrapper de layout com skip link
│   ├── shared/              # Peças reutilizáveis entre domínios
│   │   ├── confirm-dialog.tsx
│   │   └── query-error.tsx
│   ├── ui/                  # Design system (Button, Input, FormDrawer…)
│   └── error-boundary.tsx
│
├── hooks/                   # Lógica de negócio — queries, mutations, cache
│   ├── use-tv-shows.ts
│   ├── use-seasons.ts
│   ├── use-episodes.ts
│   ├── use-watchlist.ts
│   ├── use-page-title.ts    # Atualiza document.title reativamente
│   └── use-debounce.ts
│
├── services/                # Funções puras de acesso à API
│   ├── api.ts               # Instância Axios configurada com auth e baseURL
│   ├── tv-shows.ts
│   ├── seasons.ts
│   ├── episodes.ts
│   └── watchlists.ts
│
├── lib/
│   ├── query-keys.ts        # Chaves do TanStack Query centralizadas
│   ├── poster-gradient.ts   # Gradiente determinístico gerado a partir do título
│   └── utils.ts             # cn() — clsx + tailwind-merge
│
└── types/
    └── index.ts             # Tipos do domínio (TvShow, Season, Episode…)
```

### Rotas

| Path | Página |
|---|---|
| `/tv-shows` | Lista de séries com busca e carrossel em destaque |
| `/tv-shows/:key` | Detalhe da série com suas temporadas |
| `/seasons/:key` | Detalhe da temporada com seus episódios |
| `/watchlist` | Listas personalizadas do usuário |

### Como os dados fluem

```
Página → Hook (TanStack Query) → Service (Axios) → API GoLedger
```

A ideia é simples: **services** são funções que só sabem como chamar a API. **Hooks** envolvem essas funções com `useQuery`/`useMutation`, eles lidam com o cache, invalidação e dos toasts de feedback. **Páginas** consomem apenas os hooks, nunca chamam services diretamente. Essa separação facilita bastante na hora de testar ou trocar qualquer camada isoladamente.

### Endpoints da API

| Método | Path | Uso |
|---|---|---|
| `POST` | `/api/query/search` | Listagem e busca de assets |
| `POST` | `/api/query/readAsset` | Leitura de um asset por chave |
| `POST` | `/api/invoke/createAsset` | Criação de asset |
| `PUT` | `/api/invoke/updateAsset` | Atualização de asset |
| `DELETE` | `/api/invoke/deleteAsset` | Remoção de asset |

---

## Decisões técnicas

### Por que React + Vite e não Next.js?

O Next.js é uma ferramenta muito poderosa, mas traz um conjunto de complexidades que não fazem sentido para esse projeto:

A API GoLedger exige autenticação HTTP Basic em todas as requisições, não existe nenhum conteúdo público. Isso significa que **SSR não traria nenhum benefício de SEO**, já que crawlers (robos automatizados) não conseguiriam acessar nada mesmo com renderização no servidor. Toda aquela infraestrutura de servidor seria desnecessária.

Além disso, o CineChain é um **dashboard de gerenciamento**, o usuário está sempre autenticado e navegando ativamente. Isso é muito diferente de um blog ou e-commerce onde um pre-rendering faz mais diferença. Aqui, o que importa é a fluidez na navegação e a velocidade do feedback ao usuário, para isso uma SPA bem feito e organizado é suficiente.

Na prática, o Vite tem HMR (hot module replacement) quase na hora, o build gera arquivos que vão direto pra CDN sem precisar de uma runtime em produção, e a configuração é muito rápida. No fim das contas, é menos coisa para se preocupar.

### TanStack Query

Gerencia todo o estado do servidor: cache automático, `stale-while-revalidate`, invalidação após mutations e estados de loading/error sem boilerplate. Elimina a necessidade de Redux ou Context API para dados remotos. Foi configurado um `staleTime` de 30 segundos para evitar os refetches desnecessários em navegações entre páginas, os dados aparecem instantaneamente e só são revalidados quando realmente necessário.

### shadcn/ui - Radix UI + Tailwind CSS

Radix cuida de toda a parte chata de acessibilidade (focus trap, ARIA, gerenciamento de foco, teclas de escape), e o Tailwind cuida do visual usando os utilitários. Juntando os dois temos componentes que são acessíveis por padrão sem abrir mão do controle da aparência.

### Proxy via Vite (dev) e Vercel (prod)

Em desenvolvimento, o Vite redireciona `/api/*` para a URL da API GoLedger resolvendo possíveis problemas de CORS. Em produção, o `vercel.json` replica esse comportamento com rewrites. Em ambos os ambientes ele faz `POST /api/query/search` e tudo funciona.

---

## Acessibilidade

Acessibilidade foi tratada como requisito desde o início. O projeto segue as diretrizes **WCAG 2.1**.

### Skip link

O primeiro elemento focável da página é um link "Ir para o conteúdo principal". Ele fica oculto (`sr-only`) até receber foco pelo teclado, então ele aparece como um botão no canto superior esquerdo. Usuários que navegam por teclado conseguem pular a navbar e chegar direto ao conteúdo sem passar por todos os links de navegação.

### Semântica e estrutura

A estrutura usa os elementos certos nos lugares certos, sem `<div>` onde deveria ter `<button>`, sem `<span>` onde deveria ter `<h2>`:

- Elementos semânticos: `<main>`, `<nav>`, `<header>`, `<h1>`, `<h2>`
- Hierarquia de headings em todas as páginas
- `<nav aria-label="Navegação principal">` identifica a região de navegação da tela

### ARIA

- `aria-label` em todos os botões icon e links que precisam de contexto adicional
- `aria-hidden="true"` em ícones decorativos do Lucide para não poluir a árvore de acessibilidade
- `aria-current` no link ativo da navbar
- `aria-live="polite"` + `aria-atomic="true"` no carrossel para anunciar mudanças de slide a leitores de tela
- `role="dialog"`, `aria-modal="true"` e `aria-label` nos drawers de formulário
- `aria-roledescription="carrossel"` na seção de destaques
- Texto `(página atual)` com classe `sr-only` no link de navegação ativo

### Navegação por teclado

- Cards de séries e watchlists respondem a `Enter` e `Space` via `onKeyDown`, com `tabIndex={0}` para entrar no fluxo de foco
- Focus trap no `FormDrawer`: ao abrir, o foco é movido automaticamente para o painel via `panelRef.current?.focus()`
- `Escape` fecha qualquer drawer aberto
- Indicadores de foco visíveis (`focus-visible:ring-2`) em todos os controles interativos

### Feedback de estado

- Skeletons de loading comunicam o carregamento de dados
- Componente `QueryError` com botão de retry em todas as queries que possam ter falhado
- Toasts de sucesso e erro em todas as mutations, usando Sonner
- Estados vazios com mensagens descritivas e ações quando não há dados cadastrados

---

## Responsividade

A aplicação foi construída com abordagem *mobile-first* e funciona bem em qualquer tamanho de tela, desde celulares até monitores maiores.

### Layout geral

O conteúdo é todo centralizado com `max-w-7xl` e alguns paddings laterais aumentam progressivamente (`px-4` no mobile, `px-6` a partir de `sm`).

### Navegação

No mobile, o logo e os labels dos links da navbar ficam ocultos e só os ícones aparecem, economizando espaço.

### Grid de séries

A grade de cards se adapta conforme o espaço disponível:

| Breakpoint | Colunas |
|---|---|
| Mobile (padrão) | 2 |
| `sm` ≥ 640px | 3 |
| `lg` ≥ 1024px | 4 |

### Hero carousel

No mobile o carrossel fica mais compacto, a thumbnail lateral desaparece, a descrição é fica oculta, os botões de navegação somem e a altura é reduzida de `280px` para `208px`.

### Lista de episódios

A thumbnail de cada episódio é ocultada no mobile para não diminuir o espaço do conteúdo principal. Os botões de editar e excluir, que no desktop só aparecem no hover, no mobile ficam sempre visíveis pois os dispositivos touch não têm estado de hover.

### Drawer de formulário

No mobile o drawer ocupa a largura inteira da tela (`w-full`). A partir de `sm` ele assume uma largura fixa de `420px` ancorada à direita.

---

## SEO

Por ser uma aplicação autenticada, o foco de SEO foi em qualidade e boas práticas, não em indexação de conteúdo dinâmico, pois de qualquer forma estaria protegido por login.

### Meta tags base

Definidas no `index.html`:

```html
<html lang="pt-BR">
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="description" content="CineChain — gerencie séries, temporadas, episódios e crie listas personalizadas." />
<title>CineChain</title>
```

- `lang="pt-BR"` informa ao Google e leitores de tela o idioma do conteúdo
- A `description` é exibida como snippet nos resultados de busca

### Títulos dinâmicos por rota

O hook `usePageTitle` atualiza `document.title` conforme a navegação. Cada rota tem um título único:

| Rota | Título da aba |
|---|---|
| `/tv-shows` | `CineChain` |
| `/tv-shows/:key` | `Breaking Bad \| CineChain` |
| `/seasons/:key` | `Breaking Bad — Temporada 1 \| CineChain` |
| `/watchlist` | `Minhas Listas \| CineChain` |

Além de ser bom para buscadores, títulos únicos e descritivos tornam a experiência muito melhor quando o usuário tem várias abas abertas ao mesmo tempo.

### Por que não SSR/SSG para SEO?

Todo o conteúdo é protegido por autenticação, crawlers (robos do google) não conseguiriam acessar mesmo usando renderização no servidor. Usar SSR apenas para SEO seria over engineering sem retorno. Caso o produto evoluísse para ter uma área pública (landing page, catálogo aberto), a adição de SSR ou geração estática poderia ser implementada em locais específicos sem precisar reescrever a aplicação inteira.
