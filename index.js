import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Map aliases to database IDs
const DB_MAP = {
  "Governance Intake": "2673b7feea95812da93ae51f71d02291"
};

// Health check
app.get("/", (req, res) => {
  res.send("✅ Notion Helper is running");
});

// Create a new page
app.post("/pages", async (req, res) => {
  try {
    const { parent, properties } = req.body;

    const dbId = DB_MAP[parent.alias];
    if (!dbId) {
      return res.status(400).json({ error: `Unknown DB alias: ${parent.alias}` });
    }

    const notionRes = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        parent: { database_id: dbId },
        properties
      })
    });

    const data = await notionRes.json();
    res.status(notionRes.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default app;
