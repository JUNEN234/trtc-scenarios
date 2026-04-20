// ============ Detail page shared behavior ============
// 1) TOC active-link highlight on scroll
// 2) Copy Prompt (full prompt) button
// 3) Per-code-block copy button
// 4) Video placeholder click -> alert stub (will be swapped for a real player later)
// 5) Minimal keyword highlighter for code blocks (no heavy deps)

document.addEventListener('DOMContentLoaded', () => {
  initTOCHighlight();
  initCopyPrompt();
  initCodeCopyButtons();
  initVideoPlayer();
  initSyntaxHighlight();
});

// ---- TOC scroll spy ----
function initTOCHighlight(){
  const links = document.querySelectorAll('.toc a[href^="#"]');
  if (!links.length) return;
  const map = new Map();
  links.forEach(a => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) map.set(el, a);
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        links.forEach(a => a.classList.remove('active'));
        const active = map.get(entry.target);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

  map.forEach((_a, el) => io.observe(el));
}

// ---- Copy full prompt ----
function initCopyPrompt(){
  const btn = document.getElementById('copyPromptBtn');
  const src = document.getElementById('rawPrompt');
  if (!btn || !src) return;
  btn.addEventListener('click', async () => {
    const text = src.textContent.trim();
    try {
      await navigator.clipboard.writeText(text);
      const original = btn.innerHTML;
      btn.classList.add('copied');
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copied!';
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = original;
      }, 1800);
    } catch (e){
      console.error('Copy failed', e);
    }
  });
}

// ---- Per-code-block copy ----
function initCodeCopyButtons(){
  document.querySelectorAll('.code-block').forEach(block => {
    const btn = block.querySelector('.copy-inline');
    const code = block.querySelector('pre code, pre');
    if (!btn || !code) return;
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.textContent);
        btn.classList.add('copied');
        const original = btn.textContent;
        btn.textContent = '✓ Copied';
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.textContent = original;
        }, 1500);
      } catch (e){
        console.error('Copy failed', e);
      }
    });
  });
}

// ---- Video player placeholder ----
function initVideoPlayer(){
  const player = document.querySelector('.video-player');
  if (!player) return;
  player.addEventListener('click', () => {
    alert('🎬 Video player will be wired up once the preview clip is provided.');
  });
}

// ---- Very light syntax highlighting ----
// Applies only to .code-block pre > code elements that have data-lang attr.
function initSyntaxHighlight(){
  document.querySelectorAll('.code-block pre > code[data-lang]').forEach(el => {
    const lang = el.dataset.lang;
    let html = escapeHtml(el.textContent);

    if (lang === 'typescript' || lang === 'javascript' || lang === 'ts' || lang === 'js'){
      html = html
        .replace(/(\/\/[^\n]*)/g, '<span class="tok-cmt">$1</span>')
        .replace(/('[^'\n]*'|"[^"\n]*"|`[^`]*`)/g, '<span class="tok-str">$1</span>')
        .replace(/\b(const|let|var|function|class|interface|type|return|import|from|export|if|else|for|while|async|await|new|extends|implements|public|private|protected|readonly|void|null|undefined|true|false|this)\b/g, '<span class="tok-key">$1</span>')
        .replace(/\b(\d+\.?\d*)\b/g, '<span class="tok-num">$1</span>');
    } else if (lang === 'json'){
      html = html
        .replace(/("[^"\n]*")\s*:/g, '<span class="tok-key">$1</span>:')
        .replace(/:\s*("[^"\n]*")/g, ': <span class="tok-str">$1</span>')
        .replace(/:\s*(true|false|null)\b/g, ': <span class="tok-key">$1</span>')
        .replace(/:\s*(-?\d+\.?\d*)/g, ': <span class="tok-num">$1</span>');
    } else if (lang === 'bash' || lang === 'sh' || lang === 'shell' || lang === 'env'){
      html = html
        .replace(/(#[^\n]*)/g, '<span class="tok-cmt">$1</span>')
        .replace(/^([A-Z_]+)=/gm, '<span class="tok-key">$1</span>=');
    } else if (lang === 'prompt' || lang === 'text' || lang === 'markdown' || lang === 'md'){
      html = html
        .replace(/(\{\{[^}]+\}\})/g, '<span class="tok-fn">$1</span>');
    }
    el.innerHTML = html;
  });
}

function escapeHtml(s){
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
