const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSm473znFyIRUn-6ge-W2FALIro2XCrc02K7v9vOx1zkk0wh_jyT4gqCGS-GDFgTOAy-l0uc-Rxcc7N/pub?gid=0&single=true&output=csv";

export default async function handler(req, res) {
  try {
    const response = await fetch(SHEET_CSV_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; EncaixeCatalog/1.0)"
      }
    });

    if (!response.ok) {
      throw new Error(`Google Sheets respondeu com status ${response.status}`);
    }

    const csv = await response.text();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    res.status(200).send(csv);
  } catch (error) {
    console.error("Erro ao carregar planilha:", error);
    res.status(500).json({
      error: "Erro ao carregar catálogo.",
      details: String(error && error.message ? error.message : error)
    });
  }
}
