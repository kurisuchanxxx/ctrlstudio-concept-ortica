// Hand-written lightbox on a native <dialog>: modal focus containment and
// Esc come from the platform; arrows navigate; focus returns to the
// thumbnail that opened it. Without JS, thumbnails link to the images.

export function initLightbox(root: HTMLElement): void {
  const items = Array.from(root.querySelectorAll<HTMLAnchorElement>('a[data-lightbox-item]'));
  const dialog = root.querySelector<HTMLDialogElement>('dialog[data-lightbox]');
  if (!dialog || !items.length) return;

  const img = dialog.querySelector<HTMLImageElement>('[data-lightbox-img]')!;
  const counter = dialog.querySelector<HTMLElement>('[data-lightbox-count]')!;
  const prev = dialog.querySelector<HTMLButtonElement>('[data-lightbox-prev]')!;
  const next = dialog.querySelector<HTMLButtonElement>('[data-lightbox-next]')!;
  const close = dialog.querySelector<HTMLButtonElement>('[data-lightbox-close]')!;
  const template = dialog.dataset.countTemplate ?? '{n} / {total}';

  let index = 0;
  let opener: HTMLElement | null = null;

  if (items.length < 2) {
    prev.hidden = true;
    next.hidden = true;
  }

  // Warm the cache for the neighbours so arrows feel immediate.
  function preload(i: number): void {
    const item = items[(i + items.length) % items.length];
    if (item) new Image().src = item.href;
  }

  function show(i: number): void {
    index = (i + items.length) % items.length;
    const item = items[index]!;
    // Hide the previous picture until the new one has loaded, so the
    // counter and the image never disagree.
    img.classList.add('is-loading');
    img.onload = () => img.classList.remove('is-loading');
    img.src = item.href;
    if (img.complete) img.classList.remove('is-loading');
    preload(index + 1);
    preload(index - 1);
    img.width = Number(item.dataset.width) || 1920;
    img.height = Number(item.dataset.height) || 1080;
    img.alt = item.dataset.alt ?? '';
    counter.textContent = template
      .replace('{n}', String(index + 1))
      .replace('{total}', String(items.length));
  }

  items.forEach((item, i) => {
    item.addEventListener('click', (event) => {
      event.preventDefault();
      opener = item;
      show(i);
      dialog.showModal();
      close.focus();
    });
  });

  prev.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  close.addEventListener('click', () => dialog.close());

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      show(index - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      show(index + 1);
    }
  });

  // Click on the backdrop closes.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener('close', () => {
    img.removeAttribute('src');
    opener?.focus();
  });
}
