import requests
import os
import json

# Read Notion token from environment variable in Vercel
NOTION_TOKEN = os.environ["NOTION_TOKEN"]
NOTION_VERSION = os.environ.get("NOTION_VERSION", "2022-06-28")

def handler(request, response):
    try:
        # Read the incoming JSON payload
        body = request.json()

        # Forward request to Notion API
        r = requests.post(
            "https://api.notion.com/v1/pages",
            headers={
                "Authorization": f"Bearer {NOTION_TOKEN}",
                "Content-Type": "application/json",
                "Notion-Version": NOTION_VERSION
            },
            data=json.dumps(body)
        )

        # Return Notion's response
        return response.status(r.status_code).json(r.json())

    except Exception as e:
        return response.status(500).json({"error": str(e)})
