#!/bin/bash

# Deploy Code.gs to Google Apps Script using curl
# Set these environment variables before running:
#   GOOGLE_SCRIPT_ID
#   GOOGLE_ACCESS_TOKEN

SCRIPT_ID="${GOOGLE_SCRIPT_ID:-}"
ACCESS_TOKEN="${GOOGLE_ACCESS_TOKEN:-}"

if [ -z "$SCRIPT_ID" ] || [ -z "$ACCESS_TOKEN" ]; then
  echo "Error: Set GOOGLE_SCRIPT_ID and GOOGLE_ACCESS_TOKEN environment variables"
  exit 1
fi

# Read the file content (escaping newlines properly)
CODE_CONTENT=$(cat Code.gs | jq -Rs .)

# Create the JSON payload
PAYLOAD=$(jq -n \
  --arg code "$CODE_CONTENT" \
  '{files: [{name: "Code", source: $code, type: "SERVER_JS"}]}')

echo "Enviando código a Google Apps Script..."
echo "Script ID: $SCRIPT_ID"

# Send the update request
curl -X PUT \
  "https://script.googleapis.com/v1/projects/$SCRIPT_ID/content" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  -w "\nStatus: %{http_code}\n"

echo -e "\n✅ Deploy completado!"
