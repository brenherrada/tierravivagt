(function () {
  function renderHeroActions(actions) {
    const heroActions = Array.from(document.querySelectorAll('.hero-actions a'));
    heroActions.forEach((element, index) => {
      const action = actions[index];
      if (!action) return;
      if (action.text) element.textContent = action.text;
      if (action.href) element.href = action.href;
      if (action.target) element.target = action.target;
      if (action.rel) element.rel = action.rel;
    });
    const heroActionsContainer = document.querySelector('.hero-actions');
    if (heroActionsContainer) {
      heroActionsContainer.style.display = actions.length ? '' : 'none';
    }
  }

  function renderAssetStrip(items) {
    mapElements('.asset-strip > div', items, (element, asset) => {
      setText('strong', asset.value, element);
      setText('span', asset.label, element);
    });
  }

  function renderOperatingModel(items) {
    const cards = Array.from(document.querySelectorAll('.cards .card'));
    cards.forEach((card, index) => {
      const item = items[index];
      if (!item) return;
      setText('h3', item.title, card);
      setText('.card-back span', item.title, card);
      setText('p', item.description, card);
      const imageWrap = card.querySelector('.card-image-mobile');
      if (imageWrap && item.image) {
        imageWrap.style.backgroundImage = `url('${item.image}')`;
      }
    });
  }

  function renderSnapshot(section, snapshot) {
    if (!section || !Array.isArray(snapshot)) return;
    const snapshotItems = section.querySelectorAll('.snapshot > .metric');
    snapshot.forEach((item, index) => {
      const metric = snapshotItems[index];
      if (!metric) return;
      setText('strong', item.value, metric);
      setText('span', item.label, metric);
    });
  }

  function renderSectionList(section, items) {
    if (!section || !Array.isArray(items)) return;
    applyListItems(section, items);
  }

  function showElement(selector) {
    const el = document.querySelector(selector);
    if (el) el.style.display = '';
  }

  async function init() {
    try {
      const data = await fetchInvestmentData();
      const page = data.hotel_ficha;
      if (!page) return;

      if (page.page_title) {
        document.title = page.page_title;
      }

      if (page.hero) {
        setText('.brand', page.hero.brand);
        setText('.private-label', page.hero.private_label);
        setText('.hero .eyebrow', page.hero.eyebrow);
        setText('.hero h1', page.hero.title);
        setText('.hero .location', page.hero.location);
        setText('.hero .thesis', page.hero.thesis);
        renderHeroActions(page.hero.actions || []);
        showElement('.hero .thesis');
      }

      if (Array.isArray(page.asset_strip)) {
        renderAssetStrip(page.asset_strip);
      }

      if (page.investment_thesis) {
        const section = document.querySelector('#investment');
        if (section) {
          setText('.section-kicker', page.investment_thesis.kicker, section);
          setText('h2', page.investment_thesis.heading, section);
          setText('.lead', page.investment_thesis.lead, section);
          setText('.muted', page.investment_thesis.muted, section);
          renderSnapshot(section, page.investment_thesis.snapshot);
        }
      }

      if (page.operating_model && page.operating_model.cards) {
        const section = findSectionByHeading(page.operating_model.heading);
        if (section) {
          setText('.section-kicker', page.operating_model.kicker, section);
          setText('h2', page.operating_model.heading, section);
        }
        renderOperatingModel(page.operating_model.cards);
      }

      if (page.current_operation && page.current_operation.items) {
        const section = findSectionByHeading(page.current_operation.heading);
        if (section) {
          setText('.section-kicker', page.current_operation.kicker, section);
          setText('h2', page.current_operation.heading, section);
        }
        renderSectionList(section, page.current_operation.items);
      }

      if (page.legal_fiscal && page.legal_fiscal.items) {
        const section = findSectionByHeading(page.legal_fiscal.heading);
        if (section) {
          setText('.section-kicker', page.legal_fiscal.kicker, section);
          setText('h2', page.legal_fiscal.heading, section);
        }
        renderSectionList(section, page.legal_fiscal.items);
      }

      if (page.location_advantage) {
        const section = findSectionByHeading(page.location_advantage.heading);
        if (section) {
          setText('.section-kicker', page.location_advantage.kicker, section);
          setText('h2', page.location_advantage.heading, section);
          setText('.lead', page.location_advantage.lead, section);
          renderSnapshot(section, page.location_advantage.snapshot);
        }
      }

      if (page.cta_section) {
        const section = document.querySelector('.cta-section');
        if (section) {
          setText('.section-kicker', page.cta_section.kicker, section);
          setText('h2', page.cta_section.heading, section);
          setText('p', page.cta_section.text, section);
          const button = section.querySelector('.btn');
          if (button && page.cta_section.action) {
            if (page.cta_section.action.text) button.textContent = page.cta_section.action.text;
            if (page.cta_section.action.href) button.href = page.cta_section.action.href;
            if (page.cta_section.action.target) button.target = page.cta_section.action.target;
            if (page.cta_section.action.rel) button.rel = page.cta_section.action.rel;
          }
        }
      }

      if (page.footer) {
        const footerSpans = Array.from(document.querySelectorAll('footer span'));
        if (footerSpans[0]) footerSpans[0].textContent = page.footer.brand;
        if (footerSpans[1]) footerSpans[1].textContent = page.footer.subtitle;
      }
    } catch (error) {
      console.error(error);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
