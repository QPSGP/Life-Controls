/** Optional model. Returns null when no usable key is configured or the call fails. */

export async function completeJson(system: string, user: string): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY?.trim() ?? "";
  if (!/^sk-[A-Za-z0-9_-]{20,}$/.test(key)) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) {
      console.error("Model request failed", res.status);
      return null;
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return data.choices?.[0]?.message?.content ?? null;
  } catch (e) {
    console.error("Model request error", e);
    return null;
  }
}
