export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { title, division, status } = req.body;

    // fallback defaults if nothing is passed
    const pageTitle = title || "Untitled Governance Draft";
    const pageDivision = division || "C-1";
    const pageStatus = status || "Draft";

    const notionResponse = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
      },
      body: JSON.stringify({
        parent: { database_id: "2673b7feea95812da93ae51f71d02291" }, // Governance Intake DB
        properties: {
          Title: {
            title: [
              {
                text: { content: pageTitle }
              }
            ]
          },
          Division: {
            select: { name: pageDivision }
          },
          Status: {
            select: { name: pageStatus }
          }
        }
      })
    });

    const data = await notionResponse.json();

    if (!notionResponse.ok) {
      throw new Error(JSON.stringify(data));
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
