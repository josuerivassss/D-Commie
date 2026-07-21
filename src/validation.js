// Centralized limits so every form validates consistently, and so a limit
// only ever needs to change in one place.

export const LIMITS = {
  PREFIX_MAX: 10,
  MESSAGE_MAX: 1000, // welcome/leave templates; comfortably under Discord's 2000-char message cap
  EMOJI_MAX: 60,
  THRESHOLD_MIN: 1,
  THRESHOLD_MAX: 500,
};

export function clamp(value, min, max) {
  const n = Number(value);
  if (Number.isNaN(n)) return min;
  return Math.min(Math.max(n, min), max);
}

export const LANGUAGES = [
  { code: "es", label: "Español", flag: "\uD83C\uDDF2\uD83C\uDDFD" }, // 🇲🇽
  { code: "en", label: "English", flag: "\uD83C\uDDFA\uD83C\uDDF8" }, // 🇺🇸
];

export const EMBED_LIMITS = {
  TITLE_MAX: 256,
  DESCRIPTION_MAX: 4096,
  FIELD_NAME_MAX: 256,
  FIELD_VALUE_MAX: 1024,
  FIELDS_MAX: 25,
  FOOTER_TEXT_MAX: 2048,
  AUTHOR_NAME_MAX: 256,
  CONTENT_MAX: 2000,
  EMBEDS_MAX: 10,
  TOTAL_CHARACTERS_MAX: 6000,
  REACTIONS_MAX: 20,
};

export function embedCharacterCount(embed) {
  let total = (embed.title || "").length + (embed.description || "").length;
  total += (embed.footer?.text || "").length;
  total += (embed.author?.name || "").length;
  for (const field of embed.fields || []) total += (field.name || "").length + (field.value || "").length;
  return total;
}

/** Mirrors the backend's SendEmbedRequest validation so JSON import gets
 * the same, specific error messages without a round trip to the API. */
export function validateEmbedPayload(data) {
  const errors = [];
  if (!data || typeof data !== "object") return ["El JSON no es un objeto válido."];

  const embeds = Array.isArray(data.embeds) ? data.embeds : null;
  if (!embeds || embeds.length === 0) errors.push("Debe incluir al menos un embed en 'embeds'.");
  else if (embeds.length > EMBED_LIMITS.EMBEDS_MAX) errors.push(`Máximo ${EMBED_LIMITS.EMBEDS_MAX} embeds por mensaje.`);

  if (data.content !== undefined && data.content !== null) {
    if (typeof data.content !== "string") errors.push("'content' debe ser texto.");
    else if (data.content.length > EMBED_LIMITS.CONTENT_MAX) errors.push(`'content' excede ${EMBED_LIMITS.CONTENT_MAX} caracteres.`);
  }

  let totalCharacters = 0;
  (embeds || []).forEach((embed, index) => {
    const label = `Embed ${index + 1}`;
    if (embed.title && embed.title.length > EMBED_LIMITS.TITLE_MAX) errors.push(`${label}: título excede ${EMBED_LIMITS.TITLE_MAX} caracteres.`);
    if (embed.description && embed.description.length > EMBED_LIMITS.DESCRIPTION_MAX) errors.push(`${label}: descripción excede ${EMBED_LIMITS.DESCRIPTION_MAX} caracteres.`);
    if (embed.footer?.text && embed.footer.text.length > EMBED_LIMITS.FOOTER_TEXT_MAX) errors.push(`${label}: footer excede ${EMBED_LIMITS.FOOTER_TEXT_MAX} caracteres.`);
    if (embed.author?.name && embed.author.name.length > EMBED_LIMITS.AUTHOR_NAME_MAX) errors.push(`${label}: nombre de autor excede ${EMBED_LIMITS.AUTHOR_NAME_MAX} caracteres.`);
    if (embed.color !== undefined && embed.color !== null) {
      if (typeof embed.color !== "number" || embed.color < 0 || embed.color > 0xffffff) errors.push(`${label}: color debe ser un entero entre 0 y 16777215.`);
    }
    const fields = Array.isArray(embed.fields) ? embed.fields : [];
    if (fields.length > EMBED_LIMITS.FIELDS_MAX) errors.push(`${label}: máximo ${EMBED_LIMITS.FIELDS_MAX} campos.`);
    fields.forEach((field, fieldIndex) => {
      if (!field.name || !field.value) errors.push(`${label}, campo ${fieldIndex + 1}: 'name' y 'value' son requeridos.`);
      if (field.name && field.name.length > EMBED_LIMITS.FIELD_NAME_MAX) errors.push(`${label}, campo ${fieldIndex + 1}: nombre excede ${EMBED_LIMITS.FIELD_NAME_MAX} caracteres.`);
      if (field.value && field.value.length > EMBED_LIMITS.FIELD_VALUE_MAX) errors.push(`${label}, campo ${fieldIndex + 1}: valor excede ${EMBED_LIMITS.FIELD_VALUE_MAX} caracteres.`);
    });
    totalCharacters += embedCharacterCount(embed);
  });

  if (totalCharacters > EMBED_LIMITS.TOTAL_CHARACTERS_MAX) {
    errors.push(`El total combinado de texto (${totalCharacters}) excede el límite de Discord de ${EMBED_LIMITS.TOTAL_CHARACTERS_MAX} caracteres.`);
  }

  if (data.reactions !== undefined) {
    if (!Array.isArray(data.reactions)) errors.push("'reactions' debe ser una lista.");
    else if (data.reactions.length > EMBED_LIMITS.REACTIONS_MAX) errors.push(`Máximo ${EMBED_LIMITS.REACTIONS_MAX} reacciones.`);
  }

  return errors;
}