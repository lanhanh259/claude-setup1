#!/usr/bin/env bash
# Claude Code status line: context usage | model | quota

input=$(cat)

# Model display name
model=$(echo "$input" | jq -r '.model.display_name // .model.id // "unknown"')

# Context usage percentage (pre-calculated)
ctx_used=$(echo "$input" | jq -r '.context_window.used_percentage // empty')
if [ -n "$ctx_used" ]; then
  ctx_str=$(printf "ctx:%.0f%%" "$ctx_used")
else
  ctx_str="ctx:--"
fi

# Quota: 5-hour and 7-day rate limits (Claude.ai subscribers only)
five=$(echo "$input" | jq -r '.rate_limits.five_hour.used_percentage // empty')
week=$(echo "$input" | jq -r '.rate_limits.seven_day.used_percentage // empty')
quota_str=""
if [ -n "$five" ]; then
  quota_str=$(printf "5h:%.0f%%" "$five")
fi
if [ -n "$week" ]; then
  [ -n "$quota_str" ] && quota_str="$quota_str "
  quota_str="${quota_str}$(printf "7d:%.0f%%" "$week")"
fi
[ -z "$quota_str" ] && quota_str="quota:--"

printf "%s | %s | %s" "$ctx_str" "$model" "$quota_str"
