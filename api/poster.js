export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { command } = req.body;
  if (!command) {
    return res.status(400).json({ error: 'No command provided' });
  }

  // Full mapping from notion_master_mapping.json
  const mapping = {
    "Smith Notes": {
      "database_id": "2175b0d7853f81ac9379e1bfbc5036b2",
      "properties": { "Name": "title", "People": "rK%7BQ", "Reminder": "moAR", "Date of event": "arw~" }
    },
    "Smith Tasks": {
      "database_id": "2175b0d7853f81d3aee0c40322b96df5",
      "properties": { "Name": "title", "People": "%3B%60Us", "Do on": "y%5EeX", "Deadline": "N%5BVS" }
    },
    "Smith Para": {
      "database_id": "2175b0d7853f8115935ccf097c358b4c",
      "properties": { "Name": "title", "People": "%3DJH_", "Deadline": "Trli" }
    },
    "Trip Planner": {
      "database_id": "2065b0d7853f8175b509ea2f41cd087d",
      "properties": { "Destination": "title", "People": "wNYL", "Dates": "O%5Bwi" }
    },
    "Matt Inventory": {
      "database_id": "2065b0d7853f81bfac5dc43be43f1771",
      "properties": { "Name": "title", "People": "%3E%3BNe", "Reminder": "Hws%3B" }
    },
    "Dani Inventory": {
      "database_id": "2405b0d7853f80d281ccf4327a43c649",
      "properties": { "Name": "title", "People": "%3E%3BNe", "Reminder": "Hws%3B" }
    },
    "Matt Income": {
      "database_id": "2065b0d7853f81539ce7fef6f5fe65cd",
      "properties": { "Name": "title", "Date": "%7DNHC", "Income Amount": "%7DOVR" }
    },
    "Matt Expenses": {
      "database_id": "2065b0d7853f810fbdd2c414719fcaff",
      "properties": { "Name": "title", "Date": "%7DNHC", "Amount": "%7DOVR" }
    },
    "Dani Income": {
      "database_id": "2105b0d7853f81dd9f27ebe937afcece",
      "properties": { "Name": "title", "Date": "%7DNHC", "Income Amount": "%7DOVR" }
    },
    "Dani Expenses": {
      "database_id": "2105b0d7853f81f5965af9203fc97e75",
      "properties": { "Name": "title", "Date": "%7DNHC", "Amount": "%7DOVR" }
    },
    "Smith Content": {
      "database_id": "2175b0d7853f81a6b452c0122f831150",
      "properties": { "Name": "title", "People": "zfm%7B", "Date finished": "h%60L%5D" }
    }
  };

  // Alias lookup
  const aliases = {
    "notes": "Smith Notes",
    "tasks": "Smith Tasks",
    "para": "Smith Para",
    "trip": "Trip Planner",
    "minv": "Matt Inventory",
    "dinv": "Dani Inventory",
    "mincome": "Matt Income",
    "mexpense": "Matt Expenses",
    "dincome": "Dani Income",
    "dexpenses": "Dani Expenses",
    "content": "Smith Content"
  };

  // Figure out which DB to use
  let targetDb = null;
  for (const alias in aliases) {
    if (command.toLowerCase().includes(alias)) {
      targetDb = aliases[alias];
      break;
    }
  }
  if (!targetDb) {
    return res.status(400).json({ error: "Could not detect database from command." });
  }

  const db = mapping[targetDb];
  const title = command.split(":").slice(1).join(":").trim() || command;

  // Build basic payload
  const payload = {
    parent: { database_id: db.database_id },
    properties: {
      [db.properties.Name]: { title: [{ text: { content: title } }] }
    }
  };

  // Tag people
  if (command.toLowerCase().includes("tag matt") && db.properties.People) {
    payload.properties[db.properties.People] = { people: [{ name: "Matt" }] };
  }
  if (command.toLowerCase().includes("tag dani") && db.properties.People) {
    payload.properties[db.properties.People] = { people: [{ name: "Dani" }] };
  }

  // Add "Do on" date
  if (command.toLowerCase().includes("do on") && db.properties["Do on"]) {
    const match = command.match(/do on (\d{3,4}[ap])/i);
    if (match) {
      const timeStr = match[1];
      let hour = parseInt(timeStr.slice(0, -1), 10);
      let minute = (timeStr.length === 4) ? parseInt(timeStr.slice(1, 3)) : 0;
      const ampm = timeStr.slice(-1).toLowerCase();
      if (ampm === "p" && hour !== 12) hour += 12;
      if (ampm === "a" && hour === 12) hour = 0;
      const now = new Date();
      now.setHours(hour, minute, 0, 0);
      payload.properties[db.properties["Do on"]] = { date: { start: now.toISOString() } };
    }
  }

  // Add reminder
  if (command.toLowerCase().includes("reminder") && db.properties.Reminder) {
    payload.properties[db.properties.Reminder] = { select: { name: "At time of event" } };
  }

  // Send to Notion
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

  res.status(200).json({ status: 'success', url: data.url, database: targetDb });
}
