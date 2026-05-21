# Pre-publish checklist

Run through this list before sharing or deploying a skill.

## Contents
- Core quality
- Description
- Structure
- Code and scripts (if applicable)
- Testing
- Anti-patterns to double-check

## Core quality

- [ ] SKILL.md body under 500 lines
- [ ] Concise — every paragraph earns its tokens
- [ ] Consistent terminology throughout
- [ ] No time-sensitive information (or quarantined in "old patterns" section)
- [ ] Examples are concrete, not abstract
- [ ] Forward slashes in every file path
- [ ] No XML tags in `name` or `description`

## Description

- [ ] Third person (not "I" or "you")
- [ ] States both what the skill does AND when to use it
- [ ] Includes specific user phrases or file types where relevant
- [ ] Adds a negative trigger if the skill could over-fire
- [ ] Under 1024 characters
- [ ] No XML tags

## Structure

- [ ] `name` in kebab-case, ≤64 chars, no reserved words (`anthropic`, `claude`)
- [ ] References (if any) are one level deep from SKILL.md
- [ ] Reference files over ~100 lines have a table of contents
- [ ] Files have descriptive names (`form_validation.md`, not `doc2.md`)
- [ ] Progressive disclosure used appropriately — long content moved out

## Code and scripts (skip if markdown-only)

- [ ] Scripts solve problems rather than punt to Claude
- [ ] Error handling is explicit and helpful
- [ ] No magic numbers — every constant is justified
- [ ] Required packages listed in SKILL.md and verified available
- [ ] Scripts have clear inline documentation
- [ ] Each script is clearly marked as "execute" or "read as reference"
- [ ] Validation steps for critical or destructive operations
- [ ] Feedback loops for quality-critical tasks

## Testing

- [ ] At least 3 evaluations created
- [ ] Includes positive, negative, and ambiguous cases
- [ ] Tested on each model you target (Haiku / Sonnet / Opus)
- [ ] Tested in real workflows, not just synthetic prompts
- [ ] Team feedback gathered (if applicable)

## Anti-patterns to double-check

- [ ] No first-person language in description (`"I can help..."`)
- [ ] No Windows-style paths (`scripts\helper.py`)
- [ ] No menu-of-options (`"use pypdf or pdfplumber or PyMuPDF..."`) — pick a default
- [ ] No nested references (SKILL.md → A.md → B.md)
- [ ] No `metadata:` block or other non-standard frontmatter fields
- [ ] No assuming packages are installed
- [ ] No bare MCP tool names (use `ServerName:tool_name`)
