---
name: Step narration uses plain language, not codes
description: Khi narrate progress workflow nhiều bước, dùng tên đầy đủ của bước (vd "đang xác định intent") thay vì code rút gọn (A1/A2/B). Áp dụng chung cho mọi skill/workflow.
type: feedback
originSessionId: c7c1ce06-c004-44d1-b0c8-1c2b375db82b
---
Khi đang chạy workflow có nhiều bước được đánh số (A1, A2, B1...), narrate cho user bằng **tên đầy đủ mô tả nội dung bước**, không dùng code rút gọn.

**Why:** User feedback (2026-05-16) khi review skill `reviewing-code`: "tại sao không nói rõ ra, chẳng hạn đang phân Thực hiện review?". Code A1/A2 chỉ có nghĩa với người đã đọc skill source; user theo dõi tiến độ không biết A1 là gì.

**How to apply:**
- ✅ "Đang xác định intent của thay đổi", "Đang phân tích impact", "Đang viết báo cáo"
- ❌ "Đang thực hiện A1", "A2 xong", "Bắt đầu phase B"
- Áp dụng cho mọi skill/workflow có step codes — không chỉ `reviewing-code`.
- Code (A1, B...) chỉ dùng trong document/SKILL.md làm tham chiếu nội bộ, KHÔNG phát ra cho user.
