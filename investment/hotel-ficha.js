(function () {
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

        const heroActions = Array.from(document.querySelectorAll('.hero-actions a'));
        (page.hero.actions || []).forEach((action, index) => {
          const element = heroActions[index];
          if (!element) return;
          if (action.text) element.textContent = action.text;
          if (action.href) element.href = action.href;
        });
      }

      if (Array.isArray(page.asset_strip)) {
        mapElements('.asset-strip > div', page.asset_strip, (element, asset) => {
          setText('strong', asset.value, element);
          setText('span', asset.label, element);
        });
      }

      if (page.investment_thesis) {
        const section = document.querySelector('#investment');
        if (section) {
          setText('.section-kicker', page.investment_thesis.kicker, section);
          setText('h2', page.investment_thesis.heading, section);
          setText('.lead', page.investment_thesis.lead, section);
          setText('.muted', page.investment_thesis.muted, section);

          const snapshotItems = section.querySelectorAll('.snapshot > .metric');
          (page.investment_thesis.snapshot || []).forEach((item, index) => {
            const metric = snapshotItems[index];
            if (!metric) return;
            const strong = metric.querySelector('strong');
            const span = metric.querySelector('span');
            if (strong) strong.textContent = item.value;
            if (span) span.textContent = item.label;
          });
        }
      }

      if (page.operating_model && page.operating_model.items) {
        const section = findSectionByHeading(page.operating_model.heading);
        applyListItems(section, page.operating_model.items);
      }

      if (page.current_operation && page.current_operation.items) {
        const section = findSectionByHeading(page.current_operation.heading);
        applyListItems(section, page.current_operation.items);
      }

      if (page.legal_fiscal && page.legal_fiscal.items) {
        const section = findSectionByHeading(page.legal_fiscal.heading);
        applyListItems(section, page.legal_fiscal.items);
      }

      if (page.location_advantage) {
        const section = findSectionByHeading(page.location_advantage.heading);
        if (section) {
          setText('.section-kicker', page.location_advantage.kicker, section);
          setText('h2', page.location_advantage.heading, section);
          setText('.lead', page.location_advantage.lead, section);

          const snapshotGroups = section.querySelectorAll('.snapshot');
          page.location_advantage.snapshot?.forEach((item, index) => {
            const container = snapshotGroups[index];
            if (!container) return;
            setText('.value', item.value, container);
            setText('span', item.label, container);
          });
        }
      }

      if (page.cta) {
        const section = document.querySelector('.cta-section');
        if (section) {
          setText('.cta-kicker', page.cta.kicker, section);
          setText('h2', page.cta.heading, section);
          setText('p', page.cta.paragraph, section);
          const button = section.querySelector('.cta a');
          if (button && page.cta.button) {
            if (page.cta.button.text) button.textContent = page.cta.button.text;
            if (page.cta.button.href) button.href = page.cta.button.href;
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
