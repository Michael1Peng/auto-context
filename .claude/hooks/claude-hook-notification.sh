#!/bin/bash

# Claude Code Hook - macOS Notification Script
# This script sends a macOS notification when Claude Code tasks complete

# Read JSON input from stdin (contains session and context data)
INPUT_JSON=$(cat)

# Parse session information
SESSION_ID=$(echo "$INPUT_JSON" | jq -r '.session_id // empty')
TRANSCRIPT_PATH=$(echo "$INPUT_JSON" | jq -r '.transcript_path // empty')

# Default values
TASK_TITLE="${CLAUDE_TASK_TITLE:-Claude Code}"
TASK_DETAIL="${CLAUDE_TASK_DETAIL:-Task completed}"

# Try to extract more context from available environment variables
if [ -n "$CLAUDE_TOOL_OUTPUT" ]; then
    TASK_DETAIL="Tool completed: ${CLAUDE_TOOL_OUTPUT:0:50}..."
elif [ -n "$CLAUDE_NOTIFICATION" ]; then
    TASK_DETAIL="$CLAUDE_NOTIFICATION"
elif [ -n "$SESSION_ID" ]; then
    TASK_DETAIL="Session ${SESSION_ID:0:8} completed"
fi

# If transcript path exists, try to get last few lines for context
if [ -n "$TRANSCRIPT_PATH" ] && [ -f "$TRANSCRIPT_PATH" ]; then
    LAST_CONTENT=$(tail -2 "$TRANSCRIPT_PATH" | jq -r '.content // empty' 2>/dev/null | head -1)
    if [ -n "$LAST_CONTENT" ] && [ ${#LAST_CONTENT} -gt 10 ]; then
        TASK_DETAIL="${LAST_CONTENT:0:60}..."
    fi
fi

# Send the notification
osascript -e "display notification \"$TASK_DETAIL\" with title \"$TASK_TITLE\""

# Optional: Log for debugging
echo "$(date): Notification sent - $TASK_TITLE: $TASK_DETAIL" >> ~/.claude_hook.log