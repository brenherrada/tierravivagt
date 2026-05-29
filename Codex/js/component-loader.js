(function () {
  const script = document.currentScript;
  const root = script?.dataset.root || '';

  async function loadComponent(slot) {
    const name = slot.dataset.component;
    if (!name) return;

    const response = await fetch(`${root}components/${name}.html`);
    if (!response.ok) {
      throw new Error(`No se pudo cargar el componente: ${name}`);
    }

    const html = await response.text();
    slot.outerHTML = html.replaceAll('{{root}}', root);
  }

  async function initComponents() {
    const slots = Array.from(document.querySelectorAll('[data-component]'));
    await Promise.all(slots.map(loadComponent));
    document.dispatchEvent(new CustomEvent('tv:components-loaded'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initComponents);
  } else {
    initComponents();
  }
})();
