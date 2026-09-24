// カーソル追従 — マウスが動くと小さな泡がぷくぷくと生まれて上に昇る
// ・マウス操作可能な端末のみ／タッチ・prefers-reduced-motion では無効
// ・標準カーソルは残す／pointer-events: none／aria-hidden／入力欄では抑制
const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const old = document.querySelector('.cursor-box');
if (old) old.remove();

if (fine && !reduce) {
  const cv = document.createElement('canvas');
  cv.className = 'cursor-bubbles';
  cv.setAttribute('aria-hidden', 'true');
  Object.assign(cv.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '9999' });
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d')!;
  let W = 0, H = 0; const dpr = Math.min(2, window.devicePixelRatio || 1);
  const resize = () => { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  resize(); addEventListener('resize', resize);

  type P = { x: number; y: number; r: number; vy: number; vx: number; life: number; max: number; fill: boolean };
  const ps: P[] = [];
  let lastX = 0, lastY = 0, acc = 0;
  const INPUT = 'input, textarea, select, [contenteditable="true"]';

  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    if ((e.target as Element | null)?.closest?.(INPUT)) { lastX = e.clientX; lastY = e.clientY; return; }
    const d = Math.hypot(e.clientX - lastX, e.clientY - lastY);
    lastX = e.clientX; lastY = e.clientY;
    acc += d;
    // 動いた距離に応じて泡を出す（速く動かすほど多く）
    while (acc > 19 && ps.length < 68) {
      acc -= 19;
      const fill = Math.random() < 0.5;
      ps.push({ x: e.clientX + (Math.random() - 0.5) * 10, y: e.clientY + (Math.random() - 0.5) * 10, r: fill ? 1.5 + Math.random() * 2 : 3 + Math.random() * 6, vy: -(20 + Math.random() * 40), vx: (Math.random() - 0.5) * 20, life: 0, max: 0.9 + Math.random() * 0.8, fill });
    }
  }, { passive: true });

  let last = performance.now();
  const tick = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    ctx.clearRect(0, 0, W, H);
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i];
      p.life += dt; if (p.life > p.max) { ps.splice(i, 1); continue; }
      p.y += p.vy * dt; p.x += p.vx * dt; p.vx *= 0.98;
      const k = p.life / p.max; const a = k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85;
      const r = p.r * (0.6 + 0.4 * Math.min(1, k * 3));
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      if (p.fill) { ctx.fillStyle = `rgba(120,170,220,${0.7 * a})`; ctx.fill(); }
      else { ctx.lineWidth = 1.5; ctx.strokeStyle = `rgba(90,140,200,${0.8 * a})`; ctx.stroke(); }
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
