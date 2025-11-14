// src/lib/formatDescription.ts
// Convierte texto plano en HTML seguro con saltos de línea, listas y negritas

export function formatDescription(text: string): string {
  if (!text) return '';

  // 1. Escapar HTML básico para evitar XSS
  const escapeHtml = (str: string) =>
    str.replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;')
       .replace(/'/g, '&#39;');

  // 2. Procesar negritas (**texto** o __texto__)
  let html = escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>');

  // 3. Procesar listas (líneas que empiezan con •, -, *)
  const lines = html.split(/\r?\n/);
  let inList = false;
  let result = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (/^(•|-|\*)\s+/.test(line)) {
      if (!inList) {
        result += '<ul style="margin:0 0 0 1em;padding:0 0 0 1em;list-style-type:disc;">';
        inList = true;
      }
      result += `<li>${line.replace(/^(•|-|\*)\s+/, '')}</li>`;
    } else {
      if (inList) {
        result += '</ul>';
        inList = false;
      }
      result += line ? line + '<br>' : '<br>';
    }
  }
  if (inList) result += '</ul>';

  return result;
}
