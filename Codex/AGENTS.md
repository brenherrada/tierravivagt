# AGENTS.md — Tierra Viva

## Rol del agente

Actuás como asistente técnico de desarrollo frontend para Tierra Viva, una marca inmobiliaria premium enfocada en propiedades, inversión y bienes raíces en Guatemala.

Tu trabajo es modificar HTML, Sass, CSS y JavaScript existentes respetando el sistema visual ya aprobado. No reinterpretar componentes, no rediseñar por intuición y no agregar elementos decorativos no solicitados.

Prioridad absoluta: consistencia visual, código limpio, componentes reutilizables, performance, datos dinámicos bien estructurados y fidelidad a las instrucciones del proyecto.

---

## Fuente de verdad del proyecto

Antes de crear o modificar una página, revisar y respetar:

1. La biblioteca visual / laboratorio aprobado de Tierra Viva.
2. Los estilos globales existentes.
3. Los componentes ya aprobados.
4. La nomenclatura de archivos definida.
5. Las reglas tipográficas y de botones.
6. La estructura Sass del proyecto.
7. Los datos dinámicos centralizados.
8. Los componentes JavaScript de Bootstrap.

No reconstruir componentes de memoria si ya existe una versión aprobada.

---

## Lenguaje de marca

Tierra Viva habla a público guatemalteco, especialmente clase alta e inversionistas.

Usar español neutral, elegante y profesional de Guatemala.

Evitar giros argentinos o demasiado locales como:

- podés
- mirá
- conocela
- che
- calma, si suena coloquial argentino

Preferir:

- puede
- conozca
- solicitar información
- agendar una visita
- compartir ficha
- propiedad
- residencia
- inversión
- oportunidad inmobiliaria

El tono debe ser sobrio, premium, confiable y comercialmente claro. Nada de exageración barata, nada de “oportunidad única imperdible” si no está justificado.

---

## Arquitectura modular tipo framework

Tierra Viva debe evolucionar hacia una arquitectura modular tipo framework, evitando repetir HTML innecesariamente.

Objetivo:

- Reutilizar componentes.
- Centralizar estructuras comunes.
- Separar contenido de presentación.
- Llamar información dinámica cuando corresponda.
- Facilitar mantenimiento, escalabilidad y futuras migraciones.
- Evitar múltiples archivos HTML casi idénticos con cambios manuales repetidos.

### Principio general

No repetir bloques HTML grandes si pueden convertirse en componentes reutilizables.

Ejemplos de elementos que deberían modularizarse:

- Header.
- Footer.
- Navegación.
- Hero.
- Cards de propiedades.
- Carruseles.
- Galerías.
- Fichas técnicas.
- Bloques de contacto.
- Modales.
- Secciones de inversión.
- Secciones de propiedades relacionadas.
- CTA final.
- Componentes de precio.
- Componentes de ubicación.
- Bloques de asesor.
- Badges dinámicos.
- Filtros por tags.

Cada componente debe tener una responsabilidad clara y poder reutilizarse en distintas páginas.

### Separación entre estructura y contenido

Siempre que sea posible, separar:

- HTML estructural.
- Estilos Sass/CSS.
- JavaScript funcional.
- Datos dinámicos.

No hardcodear información de propiedades dentro de múltiples archivos HTML si esa información puede venir desde una fuente de datos centralizada.

### Información dinámica

Codex debe sugerir la mejor forma de manejar información dinámica según el estado actual del proyecto.

Opciones posibles:

1. JSON local.
2. Archivos JavaScript con objetos de datos.
3. Markdown/frontmatter.
4. Generación estática.
5. Headless CMS.
6. Framework como Astro, Next.js, Nuxt o similar.
7. Base de datos o API si el proyecto escala.

La recomendación debe tener en cuenta:

- Simplicidad.
- Mantenimiento.
- Costo.
- Hosting actual.
- Escalabilidad.
- Performance.
- Facilidad para que Brenda pueda actualizar propiedades.
- Compatibilidad con Netlify.
- SEO.
- Seguridad para propiedades off-market.
- Posibilidad futura de área privada para inversionistas.
- Posibilidad de filtrar propiedades por tags.
- Posibilidad de generar badges dinámicos desde los datos.

### Fichas de propiedad

Las fichas de propiedad deben pensarse como páginas generadas desde datos, no como HTMLs escritos manualmente desde cero cada vez.

La información dinámica de una propiedad puede incluir:

- Tipo de operación: venta o renta.
- Tipo de propiedad.
- Nombre comercial o título.
- Ubicación.
- Zona.
- Precio.
- Moneda.
- Estado de disponibilidad.
- Descripción corta.
- Descripción larga.
- Características principales.
- Amenidades.
- Metraje de terreno.
- Metraje de construcción.
- Habitaciones.
- Baños.
- Parqueos.
- Galería de imágenes.
- Video.
- Mapa o ubicación referencial.
- Documentos disponibles.
- Información para inversionistas.
- Texto legal o aclaraciones.
- Datos del asesor.
- CTA de contacto.
- Link de WhatsApp.
- Propiedades relacionadas.
- Indicador de propiedad pública, privada u off-market.
- Tags para filtros.
- Badges dinámicos si existen en el archivo JSON.

No inventar datos faltantes. Si falta información, dejar el campo vacío, usar fallback sobrio o marcar el dato como pendiente.

### Tags de propiedad

Cada propiedad puede incluir un array de `tags` dentro del archivo JSON.

Los tags deben servir para:

- Filtrar propiedades.
- Agrupar propiedades por tipo, ubicación, uso o perfil de inversión.
- Crear navegación o filtros dinámicos.
- Identificar propiedades destacadas por criterios internos.

Ejemplos posibles de tags:

- venta
- renta
- casa
- terreno
- inversion
- off-market
- vista-al-lago
- antigua-guatemala
- atitlan
- lujo
- desarrollo
- condominio
- comercial
- residencial
- alta-plusvalia

Los tags deben mantenerse en formato simple, consistente y fácil de filtrar.

Preferir formato:

```json
"tags": ["venta", "terreno", "inversion", "atitlan", "vista-al-lago"]