export async function deleteTemplate(
  templateId: string
): Promise<{ error: string | null }> {
  const response = await fetch(
    `/api/supabase?id=${encodeURIComponent(templateId)}`,
    {
      method: "DELETE",
      credentials: "same-origin",
    }
  );

  const payload = (await response.json()) as { error?: string };

  if (!response.ok || payload.error) {
    return {
      error: payload.error ?? `요청 실패 (${response.status})`,
    };
  }

  return { error: null };
}
