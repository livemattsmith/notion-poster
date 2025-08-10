import requests
import os
import json

NOTION_TOKEN = os.environ.get("NOTION_TOKEN")
NOTION_VERSION = os.environ.get("NOTION_VERSION", "2022-06-28")

def handler(request):
    try:
        if NOTION_TOKEN is None:
            return {"error": "NOTION_TOKEN not set"}, 500

        # Read JSON body from the incoming request
        body = json.loads(request.body.decode())

        # Send request to Notion API
        r = requests.post(
            "https://api.notion.com/v1/pages",
            headers={
                "Authorization": f"Bearer {NOTION_TOKEN}",
                "Content-Type": "application/json",
                "Notion-Version": NOTION_VERSION
            },
            data=json.dumps(body)
        )

        # Return Notion's response JSON and status code
        return r.json(), r.status_code

    except Exception as e:
        return {"error": str(e)}, 500
