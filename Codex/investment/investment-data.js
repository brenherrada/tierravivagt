window.INVESTMENT_DATA_URL = 'tierra-viva-investments.json';

window.fetchInvestmentData = async function () {
  const response = await fetch(window.INVESTMENT_DATA_URL);
  if (!response.ok) {
    throw new Error(`Error cargando ${window.INVESTMENT_DATA_URL}: ${response.status}`);
  }
  return response.json();
};

window.setText = function (selector, value, container = document) {
  const element = container.querySelector(selector);
  if (element && value != null) {
    element.textContent = value;
  }
  return element;
};

window.setAttr = function (selector, attr, value, container = document) {
  const element = container.querySelector(selector);
  if (element && value != null) {
    element.setAttribute(attr, value);
  }
  return element;
};

window.mapElements = function (selector, items, mapper, container = document) {
  const elements = Array.from(container.querySelectorAll(selector));
  elements.forEach((element, index) => {
    const item = items[index];
    if (item) mapper(element, item, index);
  });
};

window.findSectionByHeading = function (text, container = document) {
  return Array.from(container.querySelectorAll('section')).find((section) => {
    const heading = section.querySelector('h2');
    return heading && heading.textContent.trim() === text;
  });
};

window.applyListItems = function (section, listItems) {
  if (!section || !Array.isArray(listItems)) return;
  const items = section.querySelectorAll('.list-item');
  items.forEach((item, index) => {
    const data = listItems[index];
    if (!data) return;
    const spans = item.querySelectorAll('span');
    if (spans[0]) spans[0].textContent = data.label;
    if (spans[1]) spans[1].textContent = data.value;
  });
};
