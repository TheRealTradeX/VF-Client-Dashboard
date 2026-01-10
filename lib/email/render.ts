export type TemplateVariables = Record<string, string | number | boolean | null | undefined>;

export function renderTemplate(template: string, variables: TemplateVariables = {}) {
  return template.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, key: string) => {
    const value = variables[key];
    if (value === null || value === undefined) return "";
    return String(value);
  });
}
