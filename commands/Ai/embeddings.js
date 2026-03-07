export async function getEmbedding(text) {
  const res = await fetch("http://localhost:11434/api/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3",
      prompt: text,
    }),
  });

  const data = await res.json();

  return data.embedding;
}
