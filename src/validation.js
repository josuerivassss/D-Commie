export const LIMITS = {
  PREFIX_MAX: 10,
  MESSAGE_MAX: 800,
  EMOJI_MAX: 60,
  THRESHOLD_MIN: 2,
  THRESHOLD_MAX: 250,
  NICKNAME_MAX: 32,
};

export function clamp(value, min, max) {
  const n = Number(value);
  if (Number.isNaN(n)) return min;
  return Math.min(Math.max(n, min), max);
}

export const LANGUAGES = [
  { code: "es", label: "Español", flag: "\uD83C\uDDF2\uD83C\uDDFD" },
  { code: "en", label: "English", flag: "\uD83C\uDDFA\uD83C\uDDF8" },
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

const URL_PATTERN = /^https?:\/\/\S+$/;

export function isValidUrl(value) {
  return !value || URL_PATTERN.test(value);
}

/** Mirrors the backend's SendEmbedRequest validation so JSON import/paste
 * gets the same, specific error messages without a round trip to the API.
 * `t` is the translation function from useTranslation() -- pass it in from
 * the calling component so this stays a plain function, not a hook. */
export function validateEmbedPayload(data, t) {
  const errors = [];
  if (!data || typeof data !== "object") return [t("validation.notObject")];

  const embeds = Array.isArray(data.embeds) ? data.embeds : null;
  if (!embeds || embeds.length === 0) errors.push(t("validation.missingEmbeds"));
  else if (embeds.length > EMBED_LIMITS.EMBEDS_MAX) errors.push(t("validation.tooManyEmbeds", { max: EMBED_LIMITS.EMBEDS_MAX }));

  if (data.content !== undefined && data.content !== null) {
    if (typeof data.content !== "string") errors.push(t("validation.contentNotString"));
    else if (data.content.length > EMBED_LIMITS.CONTENT_MAX) errors.push(t("validation.contentTooLong", { max: EMBED_LIMITS.CONTENT_MAX }));
  }

  let totalCharacters = 0;
  (embeds || []).forEach((embed, index) => {
    const label = t("embeds.embedTabLabel", { n: index + 1 });
    if (embed.title && embed.title.length > EMBED_LIMITS.TITLE_MAX) errors.push(t("validation.titleTooLong", { label, max: EMBED_LIMITS.TITLE_MAX }));
    if (embed.description && embed.description.length > EMBED_LIMITS.DESCRIPTION_MAX) errors.push(t("validation.descriptionTooLong", { label, max: EMBED_LIMITS.DESCRIPTION_MAX }));
    if (embed.footer?.text && embed.footer.text.length > EMBED_LIMITS.FOOTER_TEXT_MAX) errors.push(t("validation.footerTooLong", { label, max: EMBED_LIMITS.FOOTER_TEXT_MAX }));
    if (embed.author?.name && embed.author.name.length > EMBED_LIMITS.AUTHOR_NAME_MAX) errors.push(t("validation.authorNameTooLong", { label, max: EMBED_LIMITS.AUTHOR_NAME_MAX }));
    if (embed.color !== undefined && embed.color !== null) {
      if (typeof embed.color !== "number" || embed.color < 0 || embed.color > 0xffffff) errors.push(t("validation.invalidColor", { label }));
    }
    if (embed.url && !isValidUrl(embed.url)) errors.push(t("validation.invalidTitleUrl", { label }));
    if (embed.image && !isValidUrl(embed.image)) errors.push(t("validation.invalidImageUrl", { label }));
    if (embed.thumbnail && !isValidUrl(embed.thumbnail)) errors.push(t("validation.invalidThumbnailUrl", { label }));
    if (embed.author?.url && !isValidUrl(embed.author.url)) errors.push(t("validation.invalidAuthorUrl", { label }));
    if (embed.author?.icon_url && !isValidUrl(embed.author.icon_url)) errors.push(t("validation.invalidAuthorIconUrl", { label }));
    if (embed.footer?.icon_url && !isValidUrl(embed.footer.icon_url)) errors.push(t("validation.invalidFooterIconUrl", { label }));

    const fields = Array.isArray(embed.fields) ? embed.fields : [];
    if (fields.length > EMBED_LIMITS.FIELDS_MAX) errors.push(t("validation.tooManyFields", { label, max: EMBED_LIMITS.FIELDS_MAX }));
    fields.forEach((field, fieldIndex) => {
      const n = fieldIndex + 1;
      if (!field.name || !field.value) errors.push(t("validation.fieldRequired", { label, n }));
      if (field.name && field.name.length > EMBED_LIMITS.FIELD_NAME_MAX) errors.push(t("validation.fieldNameTooLong", { label, n, max: EMBED_LIMITS.FIELD_NAME_MAX }));
      if (field.value && field.value.length > EMBED_LIMITS.FIELD_VALUE_MAX) errors.push(t("validation.fieldValueTooLong", { label, n, max: EMBED_LIMITS.FIELD_VALUE_MAX }));
    });
    totalCharacters += embedCharacterCount(embed);
  });

  if (totalCharacters > EMBED_LIMITS.TOTAL_CHARACTERS_MAX) {
    errors.push(t("validation.totalCharactersExceeded", { total: totalCharacters, max: EMBED_LIMITS.TOTAL_CHARACTERS_MAX }));
  }

  if (data.reactions !== undefined) {
    if (!Array.isArray(data.reactions)) errors.push(t("validation.reactionsNotArray"));
    else if (data.reactions.length > EMBED_LIMITS.REACTIONS_MAX) errors.push(t("validation.tooManyReactions", { max: EMBED_LIMITS.REACTIONS_MAX }));
  }

  return errors;
}

export const TICKET_LIMITS = { MESSAGE_MIN: 5, MESSAGE_MAX: 1000 };