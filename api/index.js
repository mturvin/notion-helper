export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { title, division, itemType, status, mode, riskTier, confidenceLevel } = req.body;

    // Translate inputs → exact Notion property names
    const notionPayload = {
      parent: { database_id: process.env.NOTION_DATABASE_ID },
      properties: {
        Title: {
          title: [{ text: { content: title } }]
        },
        Division: {
          select: { name: division }
        },
        "Item Type": {
          select: { name: itemType }
        },
        Status: {
          select: { name: status }
        },
        Mode: {
          select: { name: mode }
        },
        "Risk Tier": {
          select: { name: riskTier }
        },
        "Confidence Level": {
          select: { name: confidenceLevel }
        }
      }
    };

    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
      },
      body: JSON.stringify(notionPayload)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: "Notion API error",
        details: data
      });
    }

    res.status(200).json({
      message: "Governance draft created successfully",
      notionResponse: data
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
}
