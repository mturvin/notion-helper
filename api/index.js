const { Client } = require("@notionhq/client");

// Initialize Notion client with the secret from environment variables
const notion = new Client({ auth: process.env.NOTION_TOKEN });

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ message: "✅ Notion Helper is running" });
  }

  if (req.method === "POST") {
    try {
      const response = await notion.pages.create({
        parent: { database_id: "2673b7feea95812da93ae51f71d02291" },
        properties: {
          Title: {
            title: [{ text: { content: "Test entry from Vercel /api" } }]
          }
        }
      });

      return res.status(200).json(response);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
