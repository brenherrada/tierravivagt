import { getDatabase } from "@netlify/database";

const allowedOperations = new Set(["renta", "venta"]);

function json(data, init = {}) {
  return Response.json(data, {
    ...init,
    headers: {
      "cache-control": "no-store",
      ...(init.headers || {}),
    },
  });
}

function badRequest(message) {
  return json({ error: message }, { status: 400 });
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export default async function handler(request) {
  const db = getDatabase();
  const url = new URL(request.url);

  if (request.method === "GET") {
    const operation = normalizeText(url.searchParams.get("operation"));

    if (operation && !allowedOperations.has(operation)) {
      return badRequest("operation must be renta or venta");
    }

    const rows = operation
      ? await db.sql`
          SELECT
            id,
            slug,
            operation,
            property_type,
            location,
            title,
            summary,
            price,
            href,
            image_url,
            image_alt,
            sort_order,
            created_at,
            updated_at
          FROM properties
          WHERE is_published = true AND operation = ${operation}
          ORDER BY sort_order ASC, id ASC
        `
      : await db.sql`
          SELECT
            id,
            slug,
            operation,
            property_type,
            location,
            title,
            summary,
            price,
            href,
            image_url,
            image_alt,
            sort_order,
            created_at,
            updated_at
          FROM properties
          WHERE is_published = true
          ORDER BY sort_order ASC, id ASC
        `;

    return json({ properties: rows });
  }

  if (request.method === "POST") {
    let payload;

    try {
      payload = await request.json();
    } catch {
      return badRequest("request body must be valid JSON");
    }

    const slug = normalizeText(payload.slug);
    const operation = normalizeText(payload.operation);
    const propertyType = normalizeText(payload.propertyType);
    const location = normalizeText(payload.location);
    const title = normalizeText(payload.title);
    const summary = normalizeText(payload.summary);
    const price = normalizeText(payload.price);
    const href = normalizeText(payload.href);
    const imageUrl = normalizeText(payload.imageUrl);
    const imageAlt = normalizeText(payload.imageAlt);
    const sortOrder = Number.isInteger(payload.sortOrder) ? payload.sortOrder : 0;

    if (!slug) return badRequest("slug is required");
    if (!allowedOperations.has(operation)) return badRequest("operation must be renta or venta");
    if (!propertyType) return badRequest("propertyType is required");
    if (!location) return badRequest("location is required");
    if (!title) return badRequest("title is required");
    if (!price) return badRequest("price is required");
    if (!href) return badRequest("href is required");
    if (!imageUrl) return badRequest("imageUrl is required");

    const [property] = await db.sql`
      INSERT INTO properties (
        slug,
        operation,
        property_type,
        location,
        title,
        summary,
        price,
        href,
        image_url,
        image_alt,
        sort_order
      )
      VALUES (
        ${slug},
        ${operation},
        ${propertyType},
        ${location},
        ${title},
        ${summary},
        ${price},
        ${href},
        ${imageUrl},
        ${imageAlt},
        ${sortOrder}
      )
      RETURNING
        id,
        slug,
        operation,
        property_type,
        location,
        title,
        summary,
        price,
        href,
        image_url,
        image_alt,
        sort_order,
        created_at,
        updated_at
    `;

    return json({ property }, { status: 201 });
  }

  return json({ error: "Method not allowed" }, { status: 405, headers: { allow: "GET, POST" } });
}

export const config = {
  path: "/api/properties",
};
