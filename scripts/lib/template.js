// Mini moteur de gabarits : {{clé}} insère un texte échappé, {{{clé}}} insère du HTML tel quel.

export const escapeHtml = (value) =>
  String(value).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export function render(template, vars, source) {
  return template.replace(/\{\{(\{?)\s*(\w+)\s*\}?\}\}/g, (_, raw, key) => {
    if (!(key in vars)) throw new Error(`${source} : clé inconnue "${key}" (à ajouter dans src/content.js)`);
    return raw ? vars[key] : escapeHtml(vars[key]);
  });
}
