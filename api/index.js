export default async function handler(req, res) {
  try {
    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NOTION_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
      },
      body: JSON.stringify({
        parent: { database_id: "2673b7feea95812da93ae51f71d02291" },
        properties: {
          Title: {
            title: [
              {
                text: { content: "Hello from Vercel!" }
              }
            ]
          }
        }
      })
    });

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
