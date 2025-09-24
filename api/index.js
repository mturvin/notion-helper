export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { title, division, itemType, status, mode, riskTier, confidenceLevel } = req.body;

    // ✅ Allowed schema options
    const allowed = {
      Division: ["C1", "C2", "C3", "C4", "C5", "C6"],
      "Item Type": ["Decision", "Charter", "Protocol", "Build Spec", "Narrative", "Other"],
      Status: ["Needs Validation", "Draft", "Pending Ops", "In Critical Review", "Locked"],
      Mode: ["Exploration", "Exploitation"],
      "Risk Tier": ["Critical", "High", "Medium", "Low"],
      "Confidence Level": ["High", "Medium", "Low"],
    };

    // ✅ Validate inputs
    const invalidFields = {};

    if (division && !allowed.Division.includes(division)) {
      invalidFields.Division = { provided: division, allowed: allowed.Division };
    }
    if (itemType && !allowed["Item Type"].includes(itemType)) {
      invalidFields["Item Type"] = { provided: itemType, allowed: allowed["Item Type"] };
    }
    if (status && !allowed.Status.includes(status)) {
      invalidFields.Status = { provided: status, allowed: allowed.Status };
    }
    if (mode && !allowed.Mode.includes(mode)) {
      invalidFields.Mode = { provided: mode, allowed: allowed.Mode };
    }
    if (riskTier && !allowed["Risk Tier"].includes(riskTier)) {
      invalidFields["Risk Tier"] = { provided: riskTier, allowed: allowed["Risk Tier"] };
    }
    if (confidenceLevel && !allowed["Confidence Level"].includes(confidenceLevel)) {
      invalidFields["Confidence Level"] = { provided: confidenceLevel, allowed: allowed["Confidence Level"] };
    }

    if (Object.keys(invalidFields).length > 0) {
      return res.status(400).json({
        error: "Schema mismatch",
        invalid_fields: invalidFields
      });
    }

    // ✅ Notion credentials
    const notionToken = process.env.NOTION_TOKEN;
    const databaseId = process.env.NOTION_DATABASE_ID;

    // ✅ Build Notion payload
    const payload = {
      parent: { database_id: databaseId },
      properties: {
        Title: {
          title: [{ text: { content: title || "Untitled" } }]
        },
        Division: division ? { select: { name: division } } : undefined,
        "Item Type": itemType ? { select: { name: itemType } } : undefined,
        Status: status ? { select: { name: status } } : undefined,
        Mode: mode ? { select: { name: mode } } : undefined,
        "Risk Tier": riskTier ? { select: { name: riskTier } } : undefined,
        "Confidence Level": confidenceLevel ? { select: { name: confidenceLevel } } : undefined
      }
    };

    // Remove undefined props
    Object.keys(payload.properties).forEach(key => {
      if (payload.properties[key] === undefined) {
        delete payload.properties[key];
      }
    });

    // ✅ Send request to Notion
    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${notionToken}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    return res.status(200).json({ success: true, data });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
