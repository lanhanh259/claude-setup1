---
name: GitNexus deferred tools — luôn ToolSearch trước
description: GitNexus là deferred tools, phải load schema qua ToolSearch trước khi gọi, không được fallback sang Explore/Grep
type: feedback
originSessionId: b2ded342-76a7-45cd-8203-b31b57c11354
---
GitNexus tools (`mcp__gitnexus__*`) là deferred tools — schema chưa được load sẵn. PHẢI gọi `ToolSearch` trước khi dùng bất kỳ GitNexus tool nào:

```
ToolSearch("select:mcp__gitnexus__query,mcp__gitnexus__context,mcp__gitnexus__impact,mcp__gitnexus__detect_changes,mcp__gitnexus__rename,mcp__gitnexus__cypher")
```

**Why:** Nhiều lần bỏ qua bước này và fallback sang Explore agent/Grep — vi phạm quy tắc trong CLAUDE.md. Friction (rào cản) từ permission prompt cũng là nguyên nhân — đã fix bằng allowlist trong `.claude/settings.json`.

**How to apply:** Đây là bước đầu tiên bắt buộc trước mọi task liên quan đến explore, debug, refactor, hoặc impact analysis trong dboard.
