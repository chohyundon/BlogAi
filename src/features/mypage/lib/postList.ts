import type { DatabaseDocument } from "@/shared/types/database";

export function filterPostsByTypeAndSearch(
  templates: DatabaseDocument[],
  selectedTemplateType: string,
  searchQuery: string
): DatabaseDocument[] {
  const q = searchQuery.trim();
  return templates.filter((template) => {
    if (
      selectedTemplateType !== "전체" &&
      template.template_type !== selectedTemplateType
    ) {
      return false;
    }
    if (q && !template.title.includes(q)) return false;
    return true;
  });
}

export function sortPostsByCreatedDesc(
  templates: DatabaseDocument[]
): DatabaseDocument[] {
  return [...templates].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
