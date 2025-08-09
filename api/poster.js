export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { command } = req.body;
  if (!command) {
    return res.status(400).json({ error: 'No command provided' });
  }

  // Minimal mapping (we can expand to all 11 later)
  const mapping = {
    "Smith Notes": { "database_id": "2175b0d7853f81ac9379e1bfbc5036b2", "properties": { "Name": "title" } },
    "Smith Tasks": { "database_id": "2175b0d7853f81d3aee0c40322b96df5", "properties": { "Name": "title" } }
  };

  const dbName = command.toLowerCase().includes("tasks") ? "Smith Tasks" : "Smith Notes";
  const db = mapping[dbName];
  const title = command.split(":")[1]?.trim() || command;

  const payload = {
    parent: { database_id: db.database_id },
    properties: {
      [db.properties.Name]: { title: [{ text: { content: title } }] }
    }
  };

  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
      'Notion-Version': process.env.NOTION_VERSION,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    return res.status(response.status).json({ error: data });
  }

  res.status(200).json({ status: 'success', url: data.url });
}
