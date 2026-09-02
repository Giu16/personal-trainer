/* ==========================================================================
   Paulo Andrade · Personal Trainer — interações
   ========================================================================== */

/* === CONFIG: troque só estas linhas por cliente ========================== */
const WHATSAPP = "5567998397624";                 // DDI+DDD+número, só dígitos
const MSG = "Olá! Vi o modelo de site para personal trainer no seu portfólio e me interessei. Gostaria de saber como funciona pra criar um site assim pro meu negócio.";
/* ========================================================================= */

/* WhatsApp: monta o link e rastreia a origem do clique (data-cta).
   O evento vai para dataLayer/gtag se existirem — pronto p/ GA4 ou Meta Pixel.
   Botão dentro de um .plan manda mensagem própria, com nome e preço lidos do
   próprio card: mudar o preço no HTML já atualiza a mensagem, sem tocar aqui. */
for (const link of document.querySelectorAll(".wa-link")) {
  const plano = link.closest(".plan");
  const nome = plano?.querySelector(".tag")?.textContent.trim();
  const preco = plano?.querySelector(".price")?.textContent.replace(/\s+/g, " ").replace(/\s*\/\s*/g, "/").trim();
  const texto = nome && preco
    ? `Olá! Me interessei pelo plano ${nome} (${preco}) e gostaria de saber como funciona.`
    : MSG;

  link.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
  link.target = "_blank";
  link.rel = "noopener";
  link.addEventListener("click", () => {
    const origem = link.dataset.cta ?? "desconhecido";
    window.dataLayer?.push({ event: "whatsapp_click", origem });
    window.gtag?.("event", "whatsapp_click", { origem });
  });
}

/* Header ganha fundo ao rolar (fixo, sem mudar de tamanho) */
const hdr = document.getElementById("hdr");
const onScroll = () => hdr.classList.toggle("scrolled", document.documentElement.scrollTop > 24);
onScroll();
addEventListener("scroll", onScroll, { passive: true });

/* Contadores animados nas estatísticas (respeita reduced-motion) */
const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!prefersReducedMotion) {
  const countUp = (el) => {
    const m = el.textContent.trim().match(/^(\D*)(\d+)(\D*)$/);
    if (!m) return;
    const [, prefix, numStr, suffix] = m;
    const target = Number(numStr);
    const duration = 1100;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const value = Math.round(target * (1 - (1 - p) ** 3));
      el.textContent = `${prefix}${value}${suffix}`;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const statObserver = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { countUp(e.target); statObserver.unobserve(e.target); }
    }
  }, { threshold: .6 });
  document.querySelectorAll(".stat .n").forEach((el) => statObserver.observe(el));
}

/* Ano corrente no rodapé */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* Aparição no scroll: fade + subir (usa a marcação .reveal já presente no HTML).
   Ativa .js-reveal só aqui — sem JS ou com reduced-motion, o conteúdo aparece normal. */
if (!prefersReducedMotion && "IntersectionObserver" in window) {
  document.documentElement.classList.add("js-reveal");
  const revealObserver = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        revealObserver.unobserve(e.target);
      }
    }
  }, { threshold: .15, rootMargin: "0px 0px -8% 0px" });
  for (const el of document.querySelectorAll(".reveal")) {
    // stagger: irmãos .reveal no mesmo container entram em sequência
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
    const i = siblings.indexOf(el);
    if (i > 0) el.style.setProperty("--d", `${Math.min(i * 90, 270)}ms`);
    revealObserver.observe(el);
  }
}

/* #metodo: "carrega" a luz laranja pela trilha ao chegar na seção (nós acendem em sequência) */
const track = document.getElementById("track");
if (track && !prefersReducedMotion && "IntersectionObserver" in window) {
  track.classList.add("track-anim");
  const trackObserver = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { track.classList.add("is-charged"); trackObserver.disconnect(); }
    }
  }, { threshold: .1, rootMargin: "0px 0px -12% 0px" });
  trackObserver.observe(track);
}

/* FAQ: accordion acessível (só uma resposta aberta por vez) */
const faqItems = document.querySelectorAll(".faq-item");
/* max-height:0 esconde só visualmente — o leitor de tela leria as 5 respostas sempre.
   aria-hidden tira a fechada da árvore de acessibilidade sem mexer na animação. */
const fecharFaq = () => {
  for (const item of faqItems) {
    const answer = item.querySelector(".faq-a");
    item.querySelector(".faq-q").setAttribute("aria-expanded", "false");
    answer.style.maxHeight = null;
    answer.setAttribute("aria-hidden", "true");
    item.classList.remove("is-open");
  }
};
fecharFaq();

for (const item of faqItems) {
  const btn = item.querySelector(".faq-q");
  const answer = item.querySelector(".faq-a");
  btn.addEventListener("click", () => {
    const isOpen = btn.getAttribute("aria-expanded") === "true";
    fecharFaq();
    if (!isOpen) {
      btn.setAttribute("aria-expanded", "true");
      answer.style.maxHeight = `${answer.scrollHeight}px`;
      answer.setAttribute("aria-hidden", "false");
      item.classList.add("is-open");
    }
  });
}
/* a altura acima é gravada em px no momento do clique. girar o celular (ou redimensionar
   a janela) reflui o texto e a resposta aberta passaria a cortar o final — recalcula. */
addEventListener("resize", () => {
  const aberta = document.querySelector(".faq-item.is-open .faq-a");
  if (aberta) aberta.style.maxHeight = `${aberta.scrollHeight}px`;
}, { passive: true });

/* sair da seção fecha a resposta aberta — ao voltar no FAQ ele está limpo de novo */
const faqSection = document.getElementById("faq");
if (faqSection && "IntersectionObserver" in window) {
  new IntersectionObserver((entries) => {
    for (const e of entries) if (!e.isIntersecting) fecharFaq();
  }, { threshold: 0 }).observe(faqSection);
}

/* Textura de ruído WebGL atrás do hero — só desktop, sutil, ember da marca, gatilhada.
   Pausa quando o hero sai da tela ou a aba fica oculta. Fallback: sem WebGL, hero fica no fundo escuro. */
(() => {
  const canvas = document.getElementById("heroCanvas");
  if (!canvas || prefersReducedMotion) return;
  if (!matchMedia("(min-width: 861px)").matches) return;
  const hero = canvas.closest(".hero");
  const gl = canvas.getContext("webgl", { alpha: false, antialias: false });
  if (!gl) return;

  const vert = "attribute vec2 position;void main(){gl_Position=vec4(position,0.0,1.0);}";
  const frag = `
    precision highp float;
    uniform vec2 u_resolution; uniform float u_time; uniform float u_grain;
    uniform vec3 u_colors[4]; uniform vec3 u_bg;
    vec3 permute(vec3 x){return mod(((x*34.0)+1.0)*x,289.0);}
    float snoise(vec2 v){
      const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
      vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);
      vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
      vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod(i,289.0);
      vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
      vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
      m=m*m;m=m*m;vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;vec3 ox=floor(x+0.5);
      vec3 a0=x-ox;m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
      vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.0*dot(m,g);
    }
    void main(){
      vec2 uv=gl_FragCoord.xy/u_resolution.xy;
      float ratio=u_resolution.x/u_resolution.y;
      vec2 p=uv-0.5;p.x*=ratio;
      float t=u_time*0.1;
      float n1=snoise(p*0.4+vec2(t*0.2,-t*0.3));
      float n2=snoise(p*0.55+vec2(-t*0.15,t*0.25)+n1*0.25);
      float n3=snoise(p*0.75+vec2(t*0.1,-t*0.2)+n2*0.2);
      vec3 col=u_bg;
      float dist=length(p)*1.5;
      float vignette=1.0-smoothstep(0.25,1.15,dist);
      col=mix(col,u_colors[0],smoothstep(-0.1,0.7,n1)*0.30);
      col=mix(col,u_colors[1],smoothstep(-0.1,0.6,n2)*0.28);
      col=mix(col,u_colors[2],smoothstep(-0.3,0.4,n3)*0.30);
      float glow=smoothstep(0.8,0.0,dist)*0.10;
      col+=u_colors[0]*glow;
      col=mix(col*0.35,col,vignette);
      float grain=fract(sin(dot(uv,vec2(12.9898,78.233)))*43758.5453+u_time);
      col+=(grain-0.5)*u_grain*0.1;
      gl_FragColor=vec4(col,1.0);
    }`;

  const compile = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(prog, "position");
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, "u_resolution");
  const uTime = gl.getUniformLocation(prog, "u_time");
  const uGrain = gl.getUniformLocation(prog, "u_grain");
  const uColors = gl.getUniformLocation(prog, "u_colors");
  const uBg = gl.getUniformLocation(prog, "u_bg");

  const hex = (h) => [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255];
  const bg = hex("0F1013");
  const colors = new Float32Array(["FF5A2C", "5f2811", "17110b", "0F1013"].flatMap(hex));

  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const resize = () => {
    canvas.width = Math.max(1, Math.floor(hero.clientWidth * dpr));
    canvas.height = Math.max(1, Math.floor(hero.clientHeight * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  resize();
  new ResizeObserver(resize).observe(hero);

  let raf = 0, running = false, inView = false;
  const render = (t) => {
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, t * 0.001 * 0.5);
    gl.uniform1f(uGrain, 0.4);
    gl.uniform3f(uBg, bg[0], bg[1], bg[2]);
    gl.uniform3fv(uColors, colors);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    raf = requestAnimationFrame(render);
  };
  const start = () => { if (!running) { running = true; raf = requestAnimationFrame(render); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  new IntersectionObserver((entries) => {
    for (const e of entries) { inView = e.isIntersecting; inView ? start() : stop(); }
  }, { threshold: 0 }).observe(hero);
  /* voltar pra aba só religa se o hero ainda estiver na tela — senão o shader
     ficaria renderizando a 60fps com o hero fora de vista, gastando GPU à toa. */
  document.addEventListener("visibilitychange", () => {
    document.hidden || !inView ? stop() : start();
  });
})();
