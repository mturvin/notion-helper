export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const requiredFields = [
    "title", "division", "itemType",
    "status", "mode", "riskTier", "confidenceLevel"
  ];

  const payload = req.body;

  // Step 1: Check required fields
  const missingFields = requiredFields.filter(f => !payload[f]);

  // Step 2: Check environment variables
  const missingEnv = [];
  if (!process.env.NOTION_TOKEN) missingEnv.push("NOTION_TOKEN");
  if (!process.env.NOTION_DATABASE_ID) missingEnv.push("NOTION_DATABASE_ID");

  // Step 3: Check schema from Notion
  let notionSchema = null;
  let schemaErrors = null;
  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${process.env.NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      }
    });

    const dbInfo = await response.json();
    notionSchema = Object.keys(dbInfo.properties);

    // compare payload keys against schema
    schemaErrors = Object.keys(payload).filter(
      key => key !== "title" && !notionSchema.includes(capitalizeKey(key))
    );
  } catch (err) {
    schemaErrors = [`Schema fetch failed: ${err.message}`];
  }

  // Response
  return res.status(200).json({
    receivedPayload: payload,
    missingFields: missingFields.length ? missingFields : null,
    missingEnv: missingEnv.length ? missingEnv : null,
    schemaErrors,
    notionSchema,
    message: "Diagnostics complete"
  });
}

function capitalizeKey(key) {
  // Convert camelCase keys like "itemType" into "Item Type" to match Notion schema
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, str => str.toUpperCase())
    .trim();
}
