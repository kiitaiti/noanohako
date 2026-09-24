// 計測イベント（GA4 / dataLayer）。個人情報・相談内容は送信しない。
// - cta_click     : 見学・体験・相談への導線クリック（data-cta 属性）
// - tel_click     : 電話リンクのクリック
// - contact_submit: フォーム送信ボタン押下（完了とは区別）
// - contact_complete は /contact/thanks/ ページ側で送信（送信完了）
type DL = { push: (e: Record<string, unknown>) => void };
const dl = ((window as any).dataLayer ||= []) as DL;
const send = (event: string, params: Record<string, string> = {}) => {
  dl.push({ event, ...params });
  const g = (window as any).gtag;
  if (typeof g === 'function') g('event', event, params);
};

document.addEventListener('click', (e) => {
  const t = (e.target as Element).closest<HTMLElement>('a, button');
  if (!t) return;
  const href = (t as HTMLAnchorElement).getAttribute?.('href') || '';
  if (href.startsWith('tel:')) {
    send('tel_click', { location: t.dataset.location || location.pathname });
  } else if (t.dataset.cta) {
    send('cta_click', { cta: t.dataset.cta, location: location.pathname });
  }
});
