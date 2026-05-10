import { DatabaseDocument } from "@/shared/types/database";

export const recentTemplates = (templates: DatabaseDocument[]) =>
  [...templates]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 3);
