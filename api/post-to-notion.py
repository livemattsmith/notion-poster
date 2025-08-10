import requests
import os
import json

NOTION_TOKEN = os.environ["NOTION_TOKEN"]
NOTION_VERSION = os.environ.get("NOTION_VERSION", "2022-06-28")

def handler(request):
    try:
        # Read incoming JSON body
        body = json.loads(request.body.decode())

        # Send request to Notion
        r = requests.post(
            "https://api.notion.com/v1/pages",
            headers={
                "Authorization": f"Bearer {NOTION_TOKEN}",
                "Content-Type": "application/json",
                "Notion-Version": NOTION_VERSION
            },
            data=json.dumps(body)
        )

        return r.json(), r.status_code

    except Exception as e:
        return {"error": str(e)}, 500
