export default async function handler(req, res) {
  const id = String(req.query.id || "").trim();
  const width = String(req.query.w || "1000").replace(/[^0-9]/g, "") || "1000";

  if (!id) {
    res.status(400).send("ID do arquivo não informado");
    return;
  }

  const urls = [
    `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w${width}`,
    `https://drive.google.com/uc?export=view&id=${encodeURIComponent(id)}`
  ];

  try {
    let lastError = null;
    for (const url of urls) {
      try {
        const response = await fetch(url, {
          redirect: "follow",
          headers: { "User-Agent": "Mozilla/5.0 (compatible; EncaixeCatalogo/1.0)" }
        });
        const contentType = response.headers.get("content-type") || "";
        if (response.ok && contentType.startsWith("image/")) {
          const buffer = Buffer.from(await response.arrayBuffer());
          res.setHeader("Content-Type", contentType);
          res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
          res.status(200).send(buffer);
          return;
        }
        lastError = new Error(`Resposta inválida ${response.status} ${contentType}`);
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError || new Error("Imagem não encontrada");
  } catch (error) {
    console.error("Erro ao carregar imagem do Drive:", error);
    res.status(404).send("Imagem indisponível");
  }
}
