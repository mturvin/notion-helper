export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { title, division, itemType, status, mode, riskTier, confidenceLevel } = req.body;

  // Check environment variables
  const missingEnv = [];
  if (!process.env.NOTION_TOKEN) missingEnv.push("NOTION_TOKEN");
  if (!process.env.NOTION_DATABASE_ID) missingEnv.push("NOTION_DATABASE_ID");

  // Check required fields
  const missingFields = [];
  if (!title) missingFields.push("title");
  if (!division) missingFields.push("division");
  if (!itemType) missingFields.push("itemType");
  if (!status) missingFields.push("status");
  if (!mode) missingFields.push("mode");
  if (!riskTier) missingFields.push("riskTier");
  if (!confidenceLevel) missingFields.push("confidenceLevel");

  // Build debug response
  const debugReport = {
    receivedPayload: req.body,
    missingEnv: missingEnv.length > 0 ? missingEnv : null,
    missingFields: missingFields.length > 0 ? missingFields : null,
    message: "Debug check complete"
  };

  return res.status(200).json(debugReport);
}
