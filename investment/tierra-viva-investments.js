function setElementVisibility(selector, visible) {
  const element = document.querySelector(selector);
  if (element) {
    element.style.display = visible ? '' : 'none';
  }
}

function renderCards(selector, items) {
  const cards = Array.from(document.querySelectorAll(selector));
  cards.forEach((card, index) => {
    const item = items[index];
    if (!item) return;

    setText('h3', item.title, card);
    setText('p', item.description, card);
    const link = card.querySelector('.type-link');
    if (link && item.link) {
      link.href = item.link;
      if (item.target) link.target = item.target;
      if (item.rel) link.rel = item.rel;
    }
  });
}

function renderDataList(selector, items) {
  const list = document.querySelector(selector);
  if (!list || !Array.isArray(items)) return;
  const rows = Array.from(list.querySelectorAll('.data-item'));
  rows.forEach((row, index) => {
    const data = items[index];
    if (!data) return;
    setText('strong', data.value, row);
    setText('small', data.label, row);
  });
}

function renderProcess(items) {
  const steps = Array.from(document.querySelectorAll('.process-step'));
  steps.forEach((step, index) => {
    const data = items[index];
    if (!data) return;
    setText('span', data.step, step);
    setText('h3', data.title, step);
    setText('p', data.text, step);
  });
}

function renderCriteria(items) {
  const criteria = Array.from(document.querySelectorAll('.criteria-grid .criterion'));
  criteria.forEach((criterion, index) => {
    const data = items[index];
    if (!data) return;
    setText('.criterion-number', data.number, criterion);
    setText('h3', data.title, criterion);
    setText('p', data.text, criterion);
  });
}

function renderFeaturedActions(actions) {
  const buttons = Array.from(document.querySelectorAll('#destacada .hero-actions a'));
  buttons.forEach((button, index) => {
    const action = actions[index];
    if (!action) return;
    button.textContent = action.text;
    button.href = action.href;
    if (action.target) button.target = action.target;
    if (action.rel) button.rel = action.rel;
  });
}

function renderHeroActions(actions) {
  const actionAnchors = Array.from(document.querySelectorAll('.hero-actions a'));
  actionAnchors.forEach((button, index) => {
    const action = actions[index];
    if (!action) return;
    button.textContent = action.text;
    button.href = action.href;
    if (action.target) button.target = action.target;
    if (action.rel) button.rel = action.rel;
  });
}

function renderInvestmentTypes(items) {
  const cards = Array.from(document.querySelectorAll('.investment-types .type-card'));
  cards.forEach((card, index) => {
    const data = items[index];
    if (!data) return;
    setText('h3', data.title, card);
    setText('p', data.description, card);
    const link = card.querySelector('.type-link');
    if (link && data.link) {
      link.href = data.link;
      if (data.target) link.target = data.target;
      if (data.rel) link.rel = data.rel;
    }
  });
}

function renderFeaturedImage(image) {
  const featuredImage = document.querySelector('.featured-image');
  if (!featuredImage || !image) return;
  if (image.role) featuredImage.setAttribute('role', image.role);
  if (image.aria_label) featuredImage.setAttribute('aria-label', image.aria_label);
}

function renderAnnouncement(data) {
  if (!data) return;
  if (data.hero) {
    renderHeroActions(data.hero.actions || []);
    setElementVisibility('.hero-actions', Boolean(data.hero.actions?.length));
    setElementVisibility('.floating-card', Boolean(data.hero.floating_card));
  }
  if (data.featured?.actions?.length) {
    setElementVisibility('#destacada .hero-actions', true);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchInvestmentData()
    .then((data) => {
      if (data.meta?.title) document.title = data.meta.title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && data.meta?.description) metaDesc.content = data.meta.description;

      const brandLink = document.querySelector('header .brand-link');
      if (brandLink && data.header?.brand_link) {
        brandLink.href = data.header.brand_link;
        if (data.header.brand_aria_label) brandLink.setAttribute('aria-label', data.header.brand_aria_label);
      }

      const logo = document.querySelector('header .brand-link img');
      if (logo && data.header?.logo) {
        logo.src = data.header.logo.src || logo.src;
        if (data.header.logo.alt) logo.alt = data.header.logo.alt;
      }

      if (data.hero) {
        setText('.hero .eyebrow', data.hero.eyebrow);
        setText('.hero h1', data.hero.title);
        setText('.hero p', data.hero.paragraph);
        setText('.floating-card strong', data.hero.floating_card?.strong);
        setText('.floating-card span', data.hero.floating_card?.span);
      }

      if (Array.isArray(data.criteria)) {
        renderCriteria(data.criteria);
      }

      if (Array.isArray(data.investment_types)) {
        renderInvestmentTypes(data.investment_types);
      }

      if (data.featured) {
        renderFeaturedImage(data.featured.image);
        setText('#destacada .eyebrow', data.featured.eyebrow);
        setText('#destacada h2', data.featured.title);
        setText('#destacada .featured-content p', data.featured.paragraph);
        renderDataList('#destacada .data-list', data.featured.data_list || []);
        renderFeaturedActions(data.featured.actions || []);
      }

      if (Array.isArray(data.process)) {
        renderProcess(data.process);
      }

      if (data.cta) {
        setText('.cta h2', data.cta.title);
        setText('.cta p', data.cta.paragraph);
        const ctaBtn = document.querySelector('.cta a.btn');
        if (ctaBtn && data.cta.action) {
          ctaBtn.textContent = data.cta.action.text;
          ctaBtn.href = data.cta.action.href;
          if (data.cta.action.target) ctaBtn.target = data.cta.action.target;
          if (data.cta.action.rel) ctaBtn.rel = data.cta.action.rel;
        }
      }

      if (data.footer) {
        setText('.site-footer div', data.footer.text);
        setText('.construction-note', data.footer.construction_note);
      }

      renderAnnouncement(data);
    })
    .catch((err) => console.error('Error cargando JSON de inversiones:', err));

  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.16,
    rootMargin: '0px 0px -60px 0px'
  });
  revealElements.forEach((element) => revealObserver.observe(element));
});
