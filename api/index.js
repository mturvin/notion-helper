import { Client } from "@notionhq/client";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { title, division, status } = req.body;

    const notion = new Client({ auth: process.env.NOTION_TOKEN });

    const response = await notion.pages.create({
      parent: { database_id: process.env.NOTION_DATABASE_ID },
      properties: {
        Title: {
          title: [{ text: { content: title || "Untitled Governance Draft" } }]
        },
        Division: {
          rich_text: [{ text: { content: division || "Unassigned" } }]
        },
        Status: {
          select: { name: status || "Draft" }
        }
      }
    });

    res.status(200).json({ success: true, pageId: response.id });
  } catch (error) {
    console.error("Error creating page in Notion:", error);
    res.status(500).json({ error: error.message });
  }
}
