import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { title, division, itemType, status, mode, riskTier, confidenceLevel, debug } = req.body;

  // Map from simple keys -> exact Notion property names
  const notionPayload = {
    parent: { database_id: process.env.NOTION_DATABASE_ID },
    properties: {
      "Title": {
        title: [{ text: { content: title || "Untitled" } }]
      },
      "Division": division ? { select: { name: division } } : undefined,
      "Item Type": itemType ? { select: { name: itemType } } : undefined,
      "Status": status ? { select: { name: status } } : undefined,
      "Mode": mode ? { select: { name: mode } } : undefined,
      "Risk Tier": riskTier ? { select: { name: riskTier } } : undefined,
      "Confidence Level": confidenceLevel ? { select: { name: confidenceLevel } } : undefined
    }
  };

  // Remove undefined fields
  Object.keys(notionPayload.properties).forEach(
    key => notionPayload.properties[key] === undefined && delete notionPayload.properties[key]
  );

  // Debug mode: echo payload back without calling Notion
  if (debug) {
    return res.status(200).json({
      mode: "debug",
      received: req.body,
      mappedForNotion: notionPayload.properties
    });
  }

  try {
    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NOTION_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
      },
      body: JSON.stringify(notionPayload)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Notion API error",
        details: data
      });
    }

    return res.status(200).json({
      success: true,
      notionResponse: data
    });

  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
}
