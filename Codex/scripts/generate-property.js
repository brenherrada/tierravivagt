const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const slug = process.argv[2];

if (!slug) {
  console.error('Uso: npm run generate:property -- <slug>');
  process.exit(1);
}

const propertyPath = path.join(rootDir, 'data', 'properties', `${slug}.json`);
const schemaPath = path.join(rootDir, 'schemas', 'property.schema.json');
const templatePath = path.join(rootDir, 'templates', 'ficha.template.html');
const siteDataPath = path.join(rootDir, 'data', 'propiedades.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getByPath(source, keyPath) {
  if (keyPath === 'this') return source;
  return keyPath.split('.').reduce((value, key) => {
    if (value == null) return undefined;
    return value[key];
  }, source);
}

function resolveValue(expression, stack) {
  let keyPath = expression.trim();
  let parentDepth = 0;

  while (keyPath.startsWith('../')) {
    parentDepth += 1;
    keyPath = keyPath.slice(3);
  }

  if (keyPath.startsWith('@')) {
    const meta = stack[stack.length - 1]?.meta || {};
    return meta[keyPath.slice(1)];
  }

  const currentMeta = stack[stack.length - 1]?.meta || {};
  if (Object.prototype.hasOwnProperty.call(currentMeta, keyPath)) {
    return currentMeta[keyPath];
  }

  const index = Math.max(0, stack.length - 1 - parentDepth);
  const context = stack[index]?.data;
  return getByPath(context, keyPath);
}

function isTruthy(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === 'object') return Object.values(value).some(isTruthy);
  return Boolean(value);
}

function findBlockEnd(template, contentStart, blockType) {
  const tagPattern = /{{\s*(#each|#if|\/each|\/if)\b[^}]*}}/g;
  tagPattern.lastIndex = contentStart;
  let depth = 1;

  for (let match; (match = tagPattern.exec(template));) {
    const tag = match[1];
    const isOpen = tag === '#each' || tag === '#if';
    const isClose = tag === '/each' || tag === '/if';
    const closeType = tag.slice(1);

    if (isOpen) depth += 1;
    if (isClose) {
      depth -= 1;
      if (depth === 0) {
        if (closeType !== blockType) {
          throw new Error(`Bloque cerrado con {{/${closeType}}}, se esperaba {{/${blockType}}}`);
        }

        return {
          innerEnd: match.index,
          blockEnd: tagPattern.lastIndex,
        };
      }
    }
  }

  throw new Error(`No se encontró cierre para {{#${blockType}}}`);
}

function render(template, stack) {
  let output = '';
  let cursor = 0;
  const tagPattern = /{{\s*([^}]+?)\s*}}/g;

  for (let match; (match = tagPattern.exec(template));) {
    output += template.slice(cursor, match.index);
    const tag = match[1].trim();

    if (tag.startsWith('#each ')) {
      const keyPath = tag.slice(6).trim();
      const block = findBlockEnd(template, tagPattern.lastIndex, 'each');
      const items = resolveValue(keyPath, stack);
      const parent = stack[stack.length - 1];

      if (Array.isArray(items)) {
        output += items.map((item, index) => render(template.slice(tagPattern.lastIndex, block.innerEnd), [
          ...stack,
          {
            data: item,
            meta: {
              index,
              first: index === 0,
              last: index === items.length - 1,
              displayIndex: index + 1,
            },
            parent,
          },
        ])).join('');
      }

      cursor = block.blockEnd;
      tagPattern.lastIndex = block.blockEnd;
      continue;
    }

    if (tag.startsWith('#if ')) {
      const keyPath = tag.slice(4).trim();
      const block = findBlockEnd(template, tagPattern.lastIndex, 'if');
      if (isTruthy(resolveValue(keyPath, stack))) {
        output += render(template.slice(tagPattern.lastIndex, block.innerEnd), stack);
      }

      cursor = block.blockEnd;
      tagPattern.lastIndex = block.blockEnd;
      continue;
    }

    if (tag.startsWith('/')) {
      throw new Error(`Cierre inesperado: {{${tag}}}`);
    }

    output += escapeHtml(resolveValue(tag, stack));
    cursor = tagPattern.lastIndex;
  }

  output += template.slice(cursor);
  return output;
}

function relativeRoot(outputPath) {
  const depth = path.dirname(outputPath).split(/[\\/]/).filter(Boolean).length;
  return depth === 0 ? '' : '../'.repeat(depth);
}

function slugifyPathValue(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function resolvePathTemplate(template, property) {
  return template.replace(/{{\s*([a-zA-Z0-9_.]+)\s*}}/g, (_, keyPath) => {
    const value = getByPath(property, keyPath);

    if (value === undefined || value === null || value === '') {
      throw new Error(`No se pudo resolver {{${keyPath}}} en output_path`);
    }

    return slugifyPathValue(value);
  });
}

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function getOutputPath(property) {
  return property.output_path ? resolvePathTemplate(property.output_path, property) : `pages/${property.slug}.html`;
}

function relativeHref(fromOutputPath, toOutputPath) {
  const fromDir = path.posix.dirname(toPosix(fromOutputPath));
  const href = path.posix.relative(fromDir, toPosix(toOutputPath));
  return href || path.posix.basename(toPosix(toOutputPath));
}

function readAllProperties() {
  const propertiesDir = path.join(rootDir, 'data', 'properties');

  if (!fs.existsSync(propertiesDir)) return [];

  return fs.readdirSync(propertiesDir)
    .filter((fileName) => fileName.endsWith('.json'))
    .map((fileName) => readJson(path.join(propertiesDir, fileName)));
}

function operationLabel(value) {
  const labels = {
    venta: 'Venta',
    renta: 'Renta',
    inversion: 'Inversión',
  };

  return labels[value] || String(value || '').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getRelatedImage(property) {
  return property.related_card?.image || property.hero?.images?.[0] || {
    src: '',
    alt: property.identity?.title || '',
  };
}

function getPropertyImage(property) {
  return property.upsell_card?.media || property.hero?.images?.[0] || {
    src: '',
    alt: property.identity?.title || '',
  };
}

function buildRelatedCard(property, currentOutputPath) {
  const title = property.related_card?.title || property.identity?.short_label || property.identity?.title || property.identity?.name;
  const operation = property.related_card?.eyebrow || operationLabel(property.identity?.operation);

  return {
    eyebrow: operation,
    title,
    href: relativeHref(currentOutputPath, getOutputPath(property)),
    price: property.related_card?.price || property.pricing?.amount || '',
    price_note: property.related_card?.price_note || property.pricing?.note || '',
    image: getRelatedImage(property),
    aria_label: property.related_card?.aria_label || `Ver ficha de ${title}`,
  };
}

function buildUpsellCard(property, currentOutputPath) {
  const title = property.upsell_card?.title || property.identity?.name || property.identity?.title;
  const media = getPropertyImage(property);

  return {
    operation: property.upsell_card?.operation || operationLabel(property.identity?.operation),
    title,
    href: relativeHref(currentOutputPath, getOutputPath(property)),
    mobile_aria_label: property.upsell_card?.mobile_aria_label || `Ver ficha de ${title}`,
    media: {
      type: media.type || 'image',
      src: media.src || '',
      poster: media.poster,
      alt: media.alt || title,
    },
    price: property.upsell_card?.price || property.pricing?.amount || '',
    price_note: property.upsell_card?.price_note || property.pricing?.note || '',
    specs: property.upsell_card?.specs || property.summary?.items?.slice(0, 3).map((item) => item.value) || [],
  };
}

function withMediaFlags(items = []) {
  return items.map((item) => ({
    ...item,
    media: item.media ? {
      ...item.media,
      is_video: item.media.type === 'video',
      is_image: item.media.type === 'image',
    } : item.media,
  }));
}

function resolveRelatedProducts(property, allProperties, outputPath) {
  const config = property.related_products;
  if (!config) return config;

  if (config.mode !== 'same-location') {
    return config;
  }

  const matchField = config.match_field || 'identity.location';
  const currentValue = getByPath(property, matchField);
  const limit = config.limit || 3;

  const items = allProperties
    .filter((candidate) => candidate.slug !== property.slug)
    .filter((candidate) => candidate.template === 'ficha')
    .filter((candidate) => candidate.status?.visibility === 'publica')
    .filter((candidate) => getByPath(candidate, matchField) === currentValue)
    .slice(0, limit)
    .map((candidate) => buildRelatedCard(candidate, outputPath));

  return {
    ...config,
    items: items.length || !config.fallback_to_manual ? items : config.items,
  };
}

function resolveUpsellProperties(property, allProperties, outputPath) {
  const config = property.upsell_properties;
  if (!config) return config;

  const propertyIds = config.property_ids || [];
  if (!propertyIds.length) {
    return {
      ...config,
      items: [],
    };
  }

  const items = propertyIds
    .map((propertyId) => allProperties.find((candidate) => candidate.id === propertyId))
    .filter(Boolean)
    .filter((candidate) => candidate.slug !== property.slug)
    .filter((candidate) => candidate.template === 'ficha')
    .filter((candidate) => candidate.status?.visibility === 'publica')
    .map((candidate) => buildUpsellCard(candidate, outputPath));

  return {
    ...config,
    items: withMediaFlags(items),
  };
}

function deriveData(property, siteData, allProperties) {
  const outputPath = getOutputPath(property);
  const root = relativeRoot(outputPath);
  const phone = siteData.site?.contact?.whatsapp || '50232465215';
  const propertyUrl = property.seo.canonical_url || outputPath;
  const whatsappMessage = property.final_cta.whatsapp_message || `Hola Brenda, quisiera solicitar información sobre ${property.identity.title}.`;
  const shareMessage = property.final_cta.share_message || `Le comparto esta propiedad de Tierra Viva: ${property.identity.title}.`;

  return {
    ...property,
    output_path: outputPath,
    paths: { root },
    contact: {
      whatsapp_url: `https://wa.me/${phone}?text=${encodeURIComponent(`${whatsappMessage} Vi la ficha aquí: ${propertyUrl}`)}`,
      share_url: `https://wa.me/?text=${encodeURIComponent(`${shareMessage} ${propertyUrl}`)}`,
    },
    related_products: resolveRelatedProducts(property, allProperties, outputPath),
    upsell_properties: resolveUpsellProperties(property, allProperties, outputPath),
  };
}

function validateRequiredFields(property, schema) {
  const missing = (schema.required || []).filter((key) => property[key] === undefined);
  if (missing.length) {
    throw new Error(`Faltan campos requeridos: ${missing.join(', ')}`);
  }
}

const property = readJson(propertyPath);
const schema = readJson(schemaPath);
const siteData = readJson(siteDataPath);
const allProperties = readAllProperties();
const template = fs.readFileSync(templatePath, 'utf8');

validateRequiredFields(property, schema);

const data = deriveData(property, siteData, allProperties);
const html = render(template, [{ data, meta: {} }]);
const outputPath = path.join(rootDir, data.output_path);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, html);

console.log(`Ficha generada: ${path.relative(rootDir, outputPath)}`);
