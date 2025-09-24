export default async function handler(req, res) {
  if (req.method === "POST") {
    // Echo back what GPT (or PowerShell) actually sent
    return res.status(200).json({
      message: "Debug echo",
      headers: req.headers,
      body: req.body,
    });
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
