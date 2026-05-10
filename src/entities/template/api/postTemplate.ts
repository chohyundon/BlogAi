export const postTemplate = async (template: {
  title: string;
  content: string;
  template_type: string;
  keywords: string[];
}) => {
  const response = await fetch("/api/supabase", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(template),
  });

  const payload = (await response.json()) as {
    data?: unknown;
    error?: string;
  };

  if (!response.ok || payload.error) {
    throw new Error(payload.error ?? `요청 실패 (${response.status})`);
  }

  return payload.data;
};
