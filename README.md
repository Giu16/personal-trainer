# Paulo Andrade · Personal Trainer

Landing page estática (HTML + CSS + JS, sem build). Foco em conversão para captação de alunos via WhatsApp.

## Estrutura

```
personal trainer/
├── index.html              # marcação e conteúdo
├── assets/
│   ├── css/styles.css      # tokens + estilos
│   ├── js/main.js          # WhatsApp, reveal, método, FAQ, rastreamento
│   └── img/                # coloque aqui as fotos e o og-cover.jpg
└── README.md
```

## Personalizar por cliente

| O quê                | Onde                                                        |
|----------------------|-------------------------------------------------------------|
| WhatsApp             | `assets/js/main.js` → `const WHATSAPP` (só dígitos: DDI+DDD+número) |
| Mensagem inicial     | `assets/js/main.js` → `const MSG`                           |
| Nome / cidade / CREF | `index.html` (buscar "Paulo Andrade", "Nova Andradina", "000000")  |
| Preços dos planos    | `index.html` → seção `#planos`                              |
| Depoimentos          | `index.html` → seção `#depoimentos`                         |
| FAQ                  | `index.html` → seção `#faq`                                 |
| Cores                | `assets/css/styles.css` → `:root` (`--accent` é a cor de marca) |
| SEO / compartilhamento | `index.html` → `<meta name="description">`, tags `og:` e o bloco JSON-LD |

## Fotos

Já estão fiadas em `assets/img/` (stand-ins genéricos royalty-free do Unsplash):
`hero.jpg` (4:5), `retrato.jpg` (1:1) e `aluno-1..3.jpg` (3:4).

- Trocar pelas fotos reais do Paulo (hero/retrato) mantendo o mesmo nome de arquivo.
- **`aluno-1..3.jpg` são fotos genéricas de treino** na seção "Resultados reais" — substituir pelos antes/depois reais de alunos (com autorização) antes de publicar.
- Preview de compartilhamento (WhatsApp/Instagram): colocar `assets/img/og-cover.jpg` (1200×630) e conferir a tag `og:image`.

## Seção "O caminho da transformação" (antes/depois)

- Copy **suavizada**: marcada como *exemplo ilustrativo*, não promete resultado documentado.
- Componente diptych ANTES | DEPOIS (`trans-emagrecimento-*.jpg`, `trans-musculacao-*.jpg`).
- **Trocar pelas fotos reais de antes/depois dos seus alunos (com autorização)** nos mesmos slots — aí sim remover a tag "Exemplo ilustrativo".

## Scroll stacking (só no hero — mobile e desktop)

- O **hero** é `position:sticky; top:0; min-height:100svh; z-index:0`. As demais seções têm `z-index:1` e sobem cobrindo o hero ao rolar (efeito só na primeira tela; o resto rola normal). Só CSS, sem lib.
  - Depende de `body{overflow-x:clip}` (não `hidden`, que quebraria o `sticky`).
  - `.trustbar` (primeira a cobrir) tem canto arredondado + sombra pro efeito de card deslizando.
- No mobile/tablet (`≤ 860px`) a foto do hero vira **fundo full-bleed com overlay** e o texto fica por cima — assim o hero cabe em 1 tela e nada é coberto antes de aparecer. No desktop volta a ser 2 colunas.

## Mobile

- Barra CTA fixa no rodapé — o botão flutuante some no mobile pra não duplicar.
- Safe-area (notch/gesture bar) tratada no header e na barra fixa.
- Micro-interações: feedback `:active`, `touch-action:manipulation` (sem delay de 300ms), sem sticky-hover em toque.

## Dinamismo (JS, `assets/js/main.js`)

- **Barra de progresso** de leitura no topo (largura = % de rolagem).
- **Contadores animados** nas estatísticas do hero (respeitam `prefers-reduced-motion`).

## Textura de ruído WebGL (só atrás do hero, desktop)

- `#heroCanvas` roda um shader simplex-noise (porte vanilla do Velaris) em ember da marca, bem sutil, atrás do hero. Config no fim de `assets/js/main.js`.
- **Só desktop** (`≥861px`): no mobile o canvas fica `display:none` e o shader nem inicia (bateria).
- Gatilhos: pausa quando o hero sai da tela (IntersectionObserver) e quando a aba fica oculta; `devicePixelRatio` capado em 1.5; **desliga em `prefers-reduced-motion`**; fallback pra fundo escuro se não houver WebGL.
- A foto do hero é escurecida por `filter:brightness(.58)` + overlay, pra dar contraste e clima.

## Ember ambiente (CSS)

- Brilho quente sutil da cor da marca (`#FF5A2C`, ~5% de opacidade) que percorre o site inteiro via `::before` em cada seção, com deriva lenta (`emberDrift`, 26s). Motivo repetido = harmonia; só `transform/opacity` = custo quase zero.
- Conteúdo das seções fica em `z-index:1`, o ember em `z-index:0` (nunca cobre texto).
- No hero, o ember só entra no **desktop** (`≥861px`) pra não conflitar com a foto full-bleed do mobile.
- `prefers-reduced-motion` congela a animação (fica um glow estático).
- **Não** é WebGL: um shader global ficaria escondido atrás das seções opacas (exigidas pelo stacking do hero). Se quiser textura de ruído WebGL só no hero, dá pra adicionar depois.

## Recuo do hero (scroll-driven)

- O hero encolhe (`scale .94`) e escurece (`brightness .5`) conforme é coberto, via `animation-timeline: scroll(root)` (range `0→90vh`). Mobile e desktop.
- Envolto em `@supports (animation-timeline: scroll())` — navegador sem suporte ignora (sem fallback quebrado). Reduced-motion desliga.

## Rastreamento de conversão

Todo clique no WhatsApp dispara o evento `whatsapp_click` com a origem (`data-cta`: hero, planos, float, etc.)
em `dataLayer` (GTM) e `gtag` (GA4), se instalados. Basta adicionar o snippet do GA/GTM no `<head>` — o código já está pronto para capturar.

## Rodar localmente

```bash
npx -y http-server -p 8777 -c-1
```

Abrir http://localhost:8777
