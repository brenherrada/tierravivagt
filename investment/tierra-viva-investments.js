document.addEventListener('DOMContentLoaded', () => {
  fetchInvestmentData()
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
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
        const heroActions = document.querySelectorAll('.hero-actions a');
        if (data.hero.actions) {
          heroActions.forEach((a, i) => {
            const action = data.hero.actions[i];
            if (action) {
              a.textContent = action.text;
              a.href = action.href;
              if (action.target) a.target = action.target;
              if (action.rel) a.rel = action.rel;
            }
          });
        }
        setText('.floating-card strong', data.hero.floating_card?.strong);
        setText('.floating-card span', data.hero.floating_card?.span);
      }

      if (data.featured) {
        setText('#destacada h2', data.featured.title);
        setText('#destacada .featured-content p', data.featured.paragraph);
        const featuredActions = document.querySelectorAll('#destacada .hero-actions a');
        if (data.featured.actions) {
          featuredActions.forEach((a, i) => {
            const action = data.featured.actions[i];
            if (action) {
              a.textContent = action.text;
              a.href = action.href;
              if (action.target) a.target = action.target;
              if (action.rel) a.rel = action.rel;
            }
          });
        }
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
