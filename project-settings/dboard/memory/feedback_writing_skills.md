---
name: feedback_writing_skills
description: Luôn đọc skill writing-skills trước khi viết bất kỳ skill nào
type: feedback
originSessionId: 98a6ce80-d4f4-475b-9710-5c4f57a9c920
---
Trước khi viết hoặc sửa bất kỳ SKILL.md nào, PHẢI invoke skill `writing-skills` trước.

**Why:** Lần đầu viết skill `reviewing-code`, tôi bỏ qua bước này và tự dùng các skill gitnexus có sẵn làm mẫu — dẫn đến vi phạm spec (description sai format, thiếu progressive disclosure đúng chuẩn).

**How to apply:** Ngay khi user yêu cầu viết/tạo/cải thiện skill → gọi `Skill({skill: "writing-skills"})` trước, đọc đủ references cần thiết, rồi mới bắt đầu viết.
