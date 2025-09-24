export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { title, division, status } = req.body;

    // Pull from Vercel environment variables
    const notionToken = process.env.NOTION_TOKEN;
    const databaseId = process.env.NOTION_DATABASE_ID;

    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${notionToken}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
      },
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties: {
          Title: {
            title: [{ text: { content: title } }]
          },
          Division: {
            select: { name: division }
          },
          Status: {
            select: { name: status }
          }
        }
      })
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json({ success: true, pageId: data.id });
    } else {
      return res.status(400).json({ error: data });
    }

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
