# Claude Code Hook - macOS Notification

This repository includes a Claude Code hook that sends macOS notifications when tasks complete using the STOP event.

## Files

- `.claude/settings.json` - Claude Code hook configuration
- `claude-hook-notification.sh` - Notification script

## How it works

1. When Claude Code finishes a task (STOP event), the hook triggers
2. The `claude-hook-notification.sh` script runs
3. A macOS notification appears with task completion status

## Configuration

The hook configuration in `.claude/settings.json`:

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "./claude-hook-notification.sh",
            "timeout": 5000
          }
        ]
      }
    ]
  }
}
```

## Customization

Edit `claude-hook-notification.sh` to customize:
- Notification title (`TASK_TITLE`)
- Notification message (`TASK_DETAIL`)
- Add sound effects or other osascript options

## Usage

The hook runs automatically when Claude Code tasks complete. No manual intervention required.