import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Map simple aliases to your real Notion DB IDs
const DB_MAP = {
  governance_intake: "2673b7feea95812da93ae51f71d02291",
  learning: "2763b7feea9580cca42bce1940e18dc6"
};

// Route to create new Notion pages
app.post("/pages", async (req, res) => {
  try {
    const body = { ...req.body };

    // Swap alias for the real database_id
    if (body.parent?.alias) {
      const dbId = DB_MAP[body.parent.alias];
      if (!dbId) {
        return res.status(400).json({ error: "Unknown database alias" });
      }
      body.parent.database_id = dbId;
      delete body.parent.alias;
    }

    // Forward the request to Notion
    const notionRes = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await notionRes.json();
    res.status(notionRes.status).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default app;
