(function () {
  const DATA_URL = "propiedades.json";
  const LOCATION_ICON = `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      <path d="M12 12.2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" stroke-width="2"/>
    </svg>
  `;

  let dataPromise;

  function getData() {
    if (!dataPromise) {
      dataPromise = fetch(DATA_URL).then((response) => {
        if (!response.ok) throw new Error("No se pudo cargar propiedades.json");
        return response.json();
      });
    }

    return dataPromise;
  }

  function normalizeFileName(value) {
    return value.split("/").pop().split("?")[0].split("#")[0];
  }

  function findCurrentProperty(properties) {
    const currentFile = normalizeFileName(window.location.pathname || "");
    return properties.find((property) => normalizeFileName(property.href) === currentFile);
  }

  function formatCardTitle(property) {
    return `${property.property_type} en ${property.operation}`;
  }

  function labelForFilter(filter, count) {
    const suffix = filter === "venta" ? "en venta" : "en renta";
    return `${count} ${count === 1 ? "propiedad" : "propiedades"} ${suffix}`;
  }

  function createCard(property) {
    const card = document.createElement("a");
    card.className = "property-card";
    card.dataset.operation = property.operation;
    card.href = property.href;
    card.setAttribute("aria-label", `Ver ficha de ${formatCardTitle(property)} en ${property.display_location || property.location}`);

    card.innerHTML = `
      <div class="media">
        <img src="${property.image.url}" alt="${property.image.alt}" loading="lazy" />
      </div>
      <div class="card-body">
        <p class="location">
          ${LOCATION_ICON}
          ${property.display_location || property.location}
        </p>
        <h2>${formatCardTitle(property)}</h2>
        <p class="summary">${property.summary}</p>
        <span class="price">${property.price}</span>
        <div class="open-link">Ver ficha <span>→</span></div>
      </div>
    `;

    return card;
  }

  function initIndex(data) {
    const grid = document.getElementById("propertyGrid");
    const countText = document.getElementById("countText");
    const filterButtons = document.querySelectorAll(".filter-btn");
    if (!grid || !countText || !filterButtons.length) return;

    const properties = [...data.properties].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    grid.innerHTML = "";
    properties.forEach((property) => grid.appendChild(createCard(property)));

    function applyFilter(filter) {
      let visibleCount = 0;
      grid.querySelectorAll(".property-card").forEach((card) => {
        const shouldShow = card.dataset.operation === filter;
        card.style.display = shouldShow ? "flex" : "none";
        if (shouldShow) visibleCount += 1;
      });

      const label = labelForFilter(filter, visibleCount);
      countText.innerHTML = `<strong>${visibleCount}</strong> ${label.replace(String(visibleCount) + " ", "")}`;
    }

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        filterButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        applyFilter(button.dataset.filter);
      });
    });

    const activeFilter = document.querySelector(".filter-btn.active")?.dataset.filter || "renta";
    applyFilter(activeFilter);
  }

  function renderFeatureGrid(container, items) {
    container.innerHTML = "";
    items.forEach((item) => {
      const element = document.createElement("div");
      element.className = "feature-item";
      element.textContent = item;
      container.appendChild(element);
    });
  }

  function renderAccordion(id, items, title) {
    const accordion = document.getElementById(id);
    if (!accordion) return;

    const heading = accordion.querySelector("h2");
    const grid = accordion.querySelector(".feature-grid");
    if (heading && title) heading.textContent = title;
    if (grid) renderFeatureGrid(grid, items);
    accordion.style.display = items.length ? "" : "none";
  }

  function initPropertyPage(data) {
    if (!document.body.classList.contains("property-page")) return;
    const property = findCurrentProperty(data.properties);
    if (!property) return;

    const photos = property.photos.map((photo) => ({ src: photo.url, alt: photo.alt }));
    window.propertyPhotos = photos;
    window.operationTitle = property.title.toLowerCase();
    window.propertyData = property;

    document.title = `${property.title} · ${property.display_location || property.location} | ${data.site.name}`;
    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta) descriptionMeta.content = property.meta_description || property.description;

    const logo = document.querySelector(".brand-link img");
    if (logo && data.site.logo) {
      logo.src = data.site.logo.url;
      logo.alt = data.site.logo.alt;
    }

    const kicker = document.querySelector(".property-kicker span");
    if (kicker) kicker.textContent = property.display_location || property.location;

    const title = document.querySelector(".info-card h1");
    if (title) title.textContent = property.title;

    const price = document.querySelector(".info-card > .price");
    if (price) price.textContent = property.price;

    const description = document.querySelector(".info-card > .description");
    if (description) description.textContent = property.description;

    const mainImage = document.getElementById("mainImage");
    if (mainImage && photos.length) {
      mainImage.src = photos[0].src;
      mainImage.alt = photos[0].alt;
    }

    renderAccordion("featuresAccordion", property.features || [], "Características");
    renderAccordion("amenitiesAccordion", property.amenities || [], "Amenidades");
    renderAccordion("conditionsAccordion", property.conditions || [], "Condiciones");

    const distributionAccordion = document.getElementById("distributionAccordion");
    if (distributionAccordion) {
      const grid = distributionAccordion.querySelector(".accordion-content");
      if (grid && Array.isArray(property.distribution) && property.distribution.length) {
        grid.innerHTML = property.distribution.map((group) => `
          <div class="feature-grid">
            <div class="feature-item"><strong>${group.level}</strong></div>
            ${group.items.map((item) => `<div class="feature-item">${item}</div>`).join("")}
          </div>
        `).join("");
        distributionAccordion.style.display = "";
      } else {
        distributionAccordion.style.display = "none";
      }
    }

    const mapPanel = document.getElementById("ubicacion");
    if (mapPanel && property.map) {
      const mapText = mapPanel.querySelector(".description");
      const iframe = mapPanel.querySelector("iframe");
      const mapLink = mapPanel.querySelector(".map-link");
      if (mapText) mapText.textContent = property.map.label;
      if (iframe) {
        iframe.title = property.map.iframe_title;
        iframe.src = property.map.embed_url;
      }
      if (mapLink) mapLink.href = property.map.link_url;
    }

    if (typeof window.applyPropertyPhotos === "function") {
      window.applyPropertyPhotos(photos);
    } else if (typeof window.renderThumbs === "function") {
      window.renderThumbs();
    }

    const fichaUrl = window.location.href;
    const phone = data.site.contact.whatsapp;
    const place = property.display_location || property.location;
    const appointmentMessage = `Hola Brenda, quiero solicitar información para conocer la ${property.title.toLowerCase()} en ${place}. Vi la ficha aquí: ${fichaUrl}`;
    const shareMessage = `Mirá esta propiedad de Tierra Viva: ${fichaUrl}`;
    const whatsappButton = document.getElementById("whatsappButton");
    const shareWhatsappButton = document.getElementById("shareWhatsappButton");
    if (whatsappButton) whatsappButton.href = `https://wa.me/${phone}?text=${encodeURIComponent(appointmentMessage)}`;
    if (shareWhatsappButton) shareWhatsappButton.href = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
  }

  getData()
    .then((data) => {
      initIndex(data);
      initPropertyPage(data);
    })
    .catch((error) => {
      console.error(error);
    });
})();
