# Page Design — Refatoração UX Mobile (sem backend)

## Diretrizes globais (todas as páginas/abas)

### Layout
- Abordagem **desktop-first** com ajustes mobile via breakpoints.
- Estrutura base: `AppShell` (coluna) com:
  1) Navegação desktop existente (somente desktop)
  2) Área de conteúdo (scroll vertical)
  3) Bottom navigation fixa (somente mobile)
- Implementação recomendada: Flexbox (coluna) + containers com `max-width` no desktop.

### Meta Information
- Title: manter o padrão atual do produto; sem mudanças funcionais.
- Description/OG: manter valores atuais; não é escopo desta refatoração.

### Global Styles (tokens e regras)
- `box-sizing: border-box` global.
- Regra anti-scroll horizontal (camada de app):
  - `html, body { overflow-x: hidden; }`
  - Evitar `width: 100vw` em wrappers que causem “vazamento”; preferir `width: 100%`.
  - Garantir que grids/cards tenham `min-width: 0` quando necessário (especialmente em flex).
- Tipografia: manter escala atual.
- Cores: manter tema atual.
- Estados: foco visível em botões/abas (acessibilidade).

### Responsivo (breakpoints)
- Desktop: >= 1024px
  - Bottom nav **oculta**.
  - Navegação desktop **mantida**.
- Mobile: < 1024px
  - Bottom nav **visível e fixa**.
  - Conteúdo recebe `padding-bottom` >= altura da bottom nav + safe-area.

---

## Página: Aplicação (App Shell Responsivo)

### Page Structure
- Header/Top nav: apenas no desktop (como hoje).
- Main content:
  - Área rolável apenas verticalmente.
  - Container com largura fluida no mobile e `max-width` no desktop.
- Bottom navigation:
  - Renderizada apenas no mobile.

### Seções & Componentes
1) **Root Container**
   - `display: flex; flex-direction: column; min-height: 100dvh;`
   - Evitar qualquer elemento filho com largura maior que o viewport.
2) **Main Content**
   - `flex: 1; overflow-y: auto; overflow-x: clip/hidden;`
   - `padding-bottom` para não ficar atrás da bottom nav.
3) **Compatibilidade desktop**
   - Não mover/alterar a navegação atual; apenas garantir que componentes não extrapolem a largura.

---

## Página/Componente: Bottom Navigation fixa (5 abas)

### Objetivo
- Fornecer navegação principal no mobile com **5 abas fixas**.

### Layout e posicionamento
- `position: fixed; left: 0; right: 0; bottom: 0;`
- Altura recomendada: 56–64px + `env(safe-area-inset-bottom)`.
- Fundo sólido (tema atual) + borda superior sutil para separação.

### Estrutura de abas
- 5 itens, distribuídos igualmente:
  - `display: grid; grid-template-columns: repeat(5, 1fr);`
- Cada item:
  - Ícone + rótulo curto (1 linha) (definidos pelo produto).
  - Estado ativo: cor/indicador conforme tema.
  - Acessibilidade: `role="tablist"` / `role="tab"` ou botões com `aria-label`.

### Interações
- Toque/clique altera a aba ativa e o conteúdo exibido.
- Deep link opcional via query `?tab=1..5` (ou mapeamento equivalente) para permitir voltar/avançar no browser.
- Transições: opcional e discreta (ex.: 150–200ms) ao trocar estado ativo (sem animações pesadas).

### Regras para evitar problemas comuns
- Garantir que o conteúdo principal sempre tenha `padding-bottom` suficiente.
- Evitar sombras grandes que causem “overflow visual” lateral.
- Ícones devem respeitar um bounding box consistente para não “empurrar” layout.
