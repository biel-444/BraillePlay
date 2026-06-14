/**
 * BraillePlay — JavaScript Principal
 */

/* ════════════════════════════════════════
   DICIONÁRIO BRAILLE
   ════════════════════════════════════════ */
const BRAILLE = {
  A:[1],  B:[1,2],  C:[1,4],  D:[1,4,5],  E:[1,5],
  F:[1,2,4],  G:[1,2,4,5],  H:[1,2,5],  I:[2,4],  J:[2,4,5],
  K:[1,3],  L:[1,2,3],  M:[1,3,4],  N:[1,3,4,5],  O:[1,3,5],
  P:[1,2,3,4],  Q:[1,2,3,4,5],  R:[1,2,3,5],  S:[2,3,4],  T:[2,3,4,5],
  U:[1,3,6],  V:[1,2,3,6],  W:[2,4,5,6],  X:[1,3,4,6],
  Y:[1,3,4,5,6],  Z:[1,3,5,6],
};

const PONTOS_PARA_LETRA = {};
for (const [letra, pontos] of Object.entries(BRAILLE)) {
  PONTOS_PARA_LETRA[JSON.stringify([...pontos].sort((a,b)=>a-b))] = letra;
}

function identificarLetra(pontos) {
  return PONTOS_PARA_LETRA[JSON.stringify([...pontos].sort((a,b)=>a-b))] || null;
}

/* ════════════════════════════════════════
   CÉLULA BRAILLE INTERATIVA
   ════════════════════════════════════════ */
function inicializarCelula(container, onChange) {
  const dots  = container.querySelectorAll('.braille-dot');
  const ativos = new Set();
  const dotPorNumero = {};

  dots.forEach(dot => {
    const num = parseInt(dot.dataset.dot);
    dotPorNumero[num] = dot;

    const toggle = () => {
      if (ativos.has(num)) {
        ativos.delete(num);
        dot.classList.remove('active');
        dot.setAttribute('aria-checked', 'false');
      } else {
        ativos.add(num);
        dot.classList.add('active');
        dot.setAttribute('aria-checked', 'true');
      }
      if (onChange) onChange([...ativos]);
    };

    dot.addEventListener('click', toggle);
    dot.addEventListener('touchend', e => { e.preventDefault(); toggle(); });
    dot.addEventListener('keydown', e => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); }
    });
  });

  // ── Suporte ao teclado: teclas 1-6 marcam/desmarcam o ponto correspondente ──
  if (!container.hasAttribute('tabindex')) container.setAttribute('tabindex', '0');
  if (!container.hasAttribute('aria-label')) {
    container.setAttribute('aria-label', 'Célula Braille interativa. Use o mouse ou as teclas de 1 a 6 para marcar os pontos.');
  }
  container.addEventListener('keydown', e => {
    const num = parseInt(e.key, 10);
    const dot = dotPorNumero[num];
    if (!dot) return;

    e.preventDefault();
    dot.click(); // reaproveita o toggle já ligado ao clique

    const ativo = dot.classList.contains('active');
    narrar(`Ponto ${num} ${ativo ? 'ativado' : 'desativado'}`);
  });

  return {
    getAtivos: () => [...ativos],

    setAtivos(lista) {
      ativos.clear();
      dots.forEach(d => {
        const n  = parseInt(d.dataset.dot);
        const on = lista.includes(n);
        d.classList.toggle('active', on);
        d.setAttribute('aria-checked', on ? 'true' : 'false');
        if (on) ativos.add(n);
      });
      if (onChange) onChange([...ativos]);
    },

    limpar() {
      ativos.clear();
      dots.forEach(d => {
        d.classList.remove('active');
        d.setAttribute('aria-checked', 'false');
      });
      if (onChange) onChange([]);
    },

    animar() {
      dots.forEach((d, i) => {
        d.style.animation = 'none';
        setTimeout(() => {
          d.style.animation      = '';
          d.style.animationName  = 'dotBounce';
          d.style.animationDuration = '0.4s';
          d.style.animationDelay = `${i * 0.06}s`;
        }, 10);
      });
    },
  };
}

function renderizarCelulaMini(container, pontosAtivos) {
  container.querySelectorAll('.dot-mini').forEach(dot => {
    dot.classList.toggle('active', pontosAtivos.includes(parseInt(dot.dataset.dot)));
  });
}

/* ════════════════════════════════════════
   NAVBAR MOBILE + MODAL
   ════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const burger   = document.getElementById('nav-burger');
  const navLinks = document.getElementById('nav-links');
  if (burger && navLinks) {
    burger.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => navLinks.classList.remove('open'))
    );
  }

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });
});

/* ════════════════════════════════════════
   MODAL DE AJUDA
   ════════════════════════════════════════ */
function abrirAjuda(letra) {
  const overlay = document.getElementById('modal-ajuda');
  if (!overlay) return;

  const pontos = BRAILLE[letra] || [];
  overlay.querySelector('#ajuda-letra').textContent = letra;

  const celulaMini = overlay.querySelector('#ajuda-celula');
  if (celulaMini) renderizarCelulaMini(celulaMini, pontos);

  const pontosEl = overlay.querySelector('#ajuda-pontos');
  if (pontosEl) {
    pontosEl.textContent = pontos.length ? `Pontos: ${pontos.join(', ')}` : 'Sem pontos';
  }

  const librasImg = overlay.querySelector('#ajuda-libras');
  if (librasImg) {
    librasImg.src = `/static/libras/${letra}.png`;
    librasImg.onerror = () => {
      librasImg.style.display = 'none';
      const ph = overlay.querySelector('#ajuda-libras-ph');
      if (ph) ph.style.display = 'flex';
    };
    librasImg.onload = () => {
      librasImg.style.display = 'block';
      const ph = overlay.querySelector('#ajuda-libras-ph');
      if (ph) ph.style.display = 'none';
    };
  }

  overlay.classList.add('open');
}

function fecharAjuda() {
  const overlay = document.getElementById('modal-ajuda');
  if (overlay) overlay.classList.remove('open');
}

/* ════════════════════════════════════════
   MODAL DE REFERÊNCIA (alfabeto completo)
   ════════════════════════════════════════ */
function abrirReferencia() {
  const overlay = document.getElementById('modal-referencia');
  if (!overlay) return;

  const grid = overlay.querySelector('#referencia-grid');
  if (grid && !grid.dataset.preenchido) {
    Object.keys(BRAILLE).forEach(letra => {
      const pontos = BRAILLE[letra];

      const item = document.createElement('div');
      item.className = 'referencia-item';
      item.title = `Ouvir "${letra}"`;
      item.addEventListener('click', () => narrar(letra));

      // Célula Braille em miniatura
      const mini = document.createElement('div');
      mini.className = 'braille-cell-mini';
      [1, 4, 2, 5, 3, 6].forEach(n => {
        const dot = document.createElement('div');
        dot.className = 'dot-mini';
        dot.dataset.dot = n;
        if (pontos.includes(n)) dot.classList.add('active');
        mini.appendChild(dot);
      });

      // Imagem da datilologia em Libras (com placeholder se não existir)
      const librasWrap = document.createElement('div');
      librasWrap.className = 'referencia-libras-wrap';

      const librasImg = document.createElement('img');
      librasImg.className = 'referencia-libras-img';
      librasImg.alt = `Sinal de "${letra}" em Libras`;
      librasImg.src = `/static/libras/${letra}.png`;

      const ph = document.createElement('div');
      ph.className = 'referencia-libras-ph';
      ph.innerHTML = '<span>🤟</span>';
      ph.style.display = 'none';

      librasImg.onerror = () => { librasImg.style.display = 'none'; ph.style.display = 'flex'; };
      librasWrap.appendChild(librasImg);
      librasWrap.appendChild(ph);

      const label = document.createElement('span');
      label.className = 'referencia-letra';
      label.textContent = letra;

      item.appendChild(mini);
      item.appendChild(librasWrap);
      item.appendChild(label);
      grid.appendChild(item);
    });
    grid.dataset.preenchido = 'true';
  }

  overlay.classList.add('open');
}

function fecharReferencia() {
  const overlay = document.getElementById('modal-referencia');
  if (overlay) overlay.classList.remove('open');
}

/* ════════════════════════════════════════
   NARRAÇÃO DE VOZ
   ════════════════════════════════════════ */

let audioNarracaoAtual = null;

// Tenta usar voz natural gerada no servidor (gTTS). Se falhar (sem
// internet, erro no servidor, etc.), cai para a voz local do navegador.
// O Audio é criado e tocado de forma síncrona, dentro do clique do
// usuário, para não ser bloqueado pela política de autoplay.
function narrar(texto) {
  // Interrompe qualquer narração em andamento (servidor ou local)
  if (audioNarracaoAtual) {
    audioNarracaoAtual.pause();
    audioNarracaoAtual = null;
  }
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();

  let usouFallback = false;
  const fallback = (origem) => {
    if (usouFallback) return;
    usouFallback = true;
    console.warn('narrar(): áudio do servidor falhou (' + origem + '), usando voz local.');
    narrarLocal(texto);
  };

  const audio = new Audio('/api/tts?texto=' + encodeURIComponent(texto));
  audioNarracaoAtual = audio;
  audio.onerror = () => fallback('onerror');
  audio.play().catch(() => fallback('play().catch'));
}

// Fallback: voz sintetizada localmente pelo navegador/SO (mais robótica)
function narrarLocal(texto) {
  if (!('speechSynthesis' in window)) {
    toast('Narração de voz indisponível (sem internet e sem suporte local).', 'danger', 3000);
    return;
  }

  const falar = () => {
    const vozes = window.speechSynthesis.getVoices();
    if (!vozes.length) {
      toast('Nenhuma voz de narração encontrada no sistema. Verifique se há um motor de TTS instalado (ex.: espeak-ng no Linux).', 'danger', 5000);
      console.warn('speechSynthesis.getVoices() retornou vazio.');
      return;
    }

    window.speechSynthesis.cancel(); // interrompe qualquer fala anterior

    const utter = new SpeechSynthesisUtterance(texto);
    utter.rate  = 0.95;
    utter.pitch = 1;

    // Tenta achar uma voz em português; senão usa a padrão do sistema
    const vozPt = vozes.find(v => v.lang && v.lang.toLowerCase().startsWith('pt'));
    if (vozPt) {
      utter.voice = vozPt;
      utter.lang  = vozPt.lang;
    } else {
      utter.lang = 'pt-BR';
      console.warn('Nenhuma voz pt-BR encontrada, usando voz padrão do sistema.');
    }

    utter.onerror = (e) => {
      console.error('Erro na narração:', e);
      toast('Erro ao narrar: ' + (e.error || 'desconhecido'), 'danger', 3000);
    };

    window.speechSynthesis.speak(utter);
  };

  // No Chrome, a lista de vozes pode carregar de forma assíncrona
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = falar;
    setTimeout(falar, 250); // fallback se onvoiceschanged não disparar
  } else {
    falar();
  }
}

/* ════════════════════════════════════════
   UTILITÁRIOS
   ════════════════════════════════════════ */
function formatarTempo(s) {
  return `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
}

function toast(msg, tipo = 'info', duracao = 3000) {
  const el = document.createElement('div');
  el.className = `alert alert-${tipo} anim-pop`;
  el.style.cssText = `
    position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
    z-index:999; min-width:260px; max-width:90vw;
    box-shadow:0 4px 16px rgba(0,0,0,0.15);
  `;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = '0.3s';
    setTimeout(() => el.remove(), 300);
  }, duracao);
}

function embaralhar(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
