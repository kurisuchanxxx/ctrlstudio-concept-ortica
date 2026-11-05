// YouTube facade. Nothing from YouTube loads until the visitor clicks:
// the page only holds a local poster and a plain link to the video. On
// click the link is swapped for a youtube-nocookie iframe.
// scripts/verify-dist.mjs fails the build if any YouTube resource is
// referenced by the static HTML.

const EMBED_ORIGIN = 'https://www.youtube-nocookie.com';

export function createPlayer(id: string, title: string): HTMLIFrameElement {
  const iframe = document.createElement('iframe');
  iframe.src = `${EMBED_ORIGIN}/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&playsinline=1`;
  iframe.title = title;
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.className = 'yt-frame';
  return iframe;
}

function activateFacade(link: HTMLAnchorElement): void {
  const id = link.dataset.ytFacade;
  if (!id) return;
  const frame = createPlayer(id, link.dataset.ytTitle ?? 'Trailer');
  link.replaceWith(frame);
  frame.focus();
}

/** Inline facades: <a data-yt-facade="ID" data-yt-title="..."> */
export function initFacades(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[data-yt-facade]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      activateFacade(link);
    });
  });

  // <a href="#trailer" data-yt-jump>: scroll to the trailer and start it.
  document.querySelectorAll<HTMLAnchorElement>('a[data-yt-jump]').forEach((jump) => {
    jump.addEventListener('click', (event) => {
      const hash = jump.getAttribute('href');
      if (!hash?.startsWith('#')) return;
      const section = document.getElementById(hash.slice(1));
      const facade = section?.querySelector<HTMLAnchorElement>('a[data-yt-facade]');
      if (!section || !facade) return;
      event.preventDefault();
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      section.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      activateFacade(facade);
    });
  });
}

/** Modal player: <a data-yt-open="ID"> + <dialog data-yt-dialog>. */
export function initTrailerDialog(): void {
  const dialog = document.querySelector<HTMLDialogElement>('dialog[data-yt-dialog]');
  const stage = dialog?.querySelector<HTMLElement>('[data-yt-stage]');
  if (!dialog || !stage) return;
  let opener: HTMLElement | null = null;

  document.querySelectorAll<HTMLAnchorElement>('a[data-yt-open]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.dataset.ytOpen;
      if (!id) return;
      event.preventDefault();
      opener = link;
      stage.replaceChildren(createPlayer(id, link.dataset.ytTitle ?? 'Trailer'));
      dialog.showModal();
    });
  });

  dialog.querySelector('[data-dialog-close]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    stage.replaceChildren();
    opener?.focus();
  });
}
