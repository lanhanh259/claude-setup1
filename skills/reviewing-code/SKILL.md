---
name: reviewing-code
description: Reviews uncommitted local changes (staged + unstaged + untracked) as a senior reviewer — investigates intent and impact via GitNexus, then writes a markdown report to .claude/reviews/. Use when the user says "review my changes", "check my changes", "/review", "is this ready to merge?". Do NOT use for branch-level review vs another ref, single-file review, committed PR review, or general code Q&A.
---

# Reviewing Code

Hai phase tuần tự — **A xong mới được B**.

| Phase | Mindset | Output |
|---|---|---|
| **A — Thực hiện review (Investigate)** | Detective — tìm sự thật | Notes nội bộ |
| **B — Viết báo cáo (Report)** | Writer — truyền đạt | Markdown saved to `.claude/reviews/` |

**Ngôn ngữ:** thuật ngữ tiếng Anh — mở ngoặc tiếng Việt lần đầu, không lặp lại.

**Narration cho user:** khi báo cáo tiến độ với user, dùng **tên đầy đủ của bước** (ví dụ: *"đang xác định intent"*, *"đang phân tích impact"*) — KHÔNG dùng code rút gọn như *"đang thực hiện A1"* hay *"A2 xong"*. Code A1/A2 chỉ là tham chiếu nội bộ trong skill.

---

## Phase A — Thực hiện review (Investigate)

### A1. Xác định intent (Intent)

```bash
git status              # files đã đổi (M / ??)
git diff                # unstaged
git diff --cached       # staged
```

Suy intent từ file thay đổi + nội dung diff. **Không tham chiếu branch khác** (không `git log master..HEAD`) — skill này review vùng uncommitted, không phải branch vs base. Không rõ intent → **hỏi user**. Intent phải là **1 câu cụ thể**. Phân loại file: **NEW** (untracked / mới thêm) vs **MODIFIED**.

### A2. Phân tích impact (Impact via GitNexus)

```
gitnexus_detect_changes({scope: "all", repo: "<repo>"})
```

Ghi nhận: changed symbols, affected execution flows, risk assessment.

**MODIFIED** — chạy `gitnexus_impact` cho mỗi symbol thay đổi:

```
gitnexus_impact({target: "<symbolName>", direction: "upstream"})
```

Đọc output theo [references/impact-output.md](references/impact-output.md).

**NEW** — chưa có trong graph, grep thủ công:

```bash
grep -r "import.*<fileName>" src/
```

### A3. Xác minh code đạt intent (Verify)

Với mỗi file thay đổi, đọc code và trả lời **2 câu**:

1. **Phục vụ intent?** (có / một phần / không — tại sao)
2. **Risk nào?** Có → grep consumer/caller để verify ngay tại đây.

Không verify được → ghi "chưa verify + lý do".

**Finding ngoài intent:**
- **Mặc định bỏ qua** — tránh scope creep.
- **Exception:** nếu là 🔴 critical (security hole, data loss, crash chắc chắn xảy ra ở production path) → **vẫn raise** trong report ở section riêng `Phát hiện ngoài intent`. Không silent.
- 🟡 / 🔵 ngoài intent → bỏ qua.

### A4. Trace luồng thực thi (Trace execution flow)

Bắt buộc trace luồng thực thi chính (entry → output) — tái dùng cho Phase B.

- **Bug fix** → trace **2 luồng**:
  1. Luồng cũ (bị lỗi) — đi qua đâu, fail ở bước nào, vì sao
  2. Luồng mới (sau fix) — đi qua đâu, fix can thiệp ở bước nào
- **Feature / Refactor** → trace luồng chính: entry point → các bước trung gian → output

Dùng `gitnexus_query({query: "<keyword>"})` để tìm process, hoặc `READ gitnexus://repo/dboard/process/{name}` để xem step-by-step.

### Definition of Done — Phase A (Thực hiện review)

- [ ] Intent rõ (1 câu, nguồn: commit hoặc user confirm)
- [ ] `detect_changes` đã chạy — ghi nhận risk
- [ ] Mỗi file: trả lời "đạt intent?"
- [ ] Mỗi risk: verified (safe / unsafe / chưa verify + lý do)
- [ ] d=1 callers: signature không đổi
- [ ] Luồng thực thi đã trace (bug: 2 luồng / feature: 1 luồng)

Chưa đủ → quay lại investigate. **KHÔNG viết report vội.**

---

## Phase B — Viết báo cáo (Report)

**Tiền đề:** mọi risk đã verify ở A3. Không verify lần đầu ở đây.

**Nguyên tắc số 1 — Lead with the answer.** Reader đọc 2 dòng đầu BẮT BUỘC biết:
1. Code này làm gì (fix bug X / thêm feature Y) — góc nhìn user, không changelog kỹ thuật
2. Sau khi áp dụng có ảnh hưởng không (✅ / ⚠️ / 🔴 / ❓)

### Phân loại trước khi viết

- **Bug fix** → template Bug fix
- **Feature / refactor** → template Feature
- **Branch mixed** → tách 2 phần riêng trong cùng report

Template + ví dụ writeup: [references/report-template.md](references/report-template.md).

### Size target

| PR size | Target |
|---|---|
| 1–3 file | ~30–50 dòng |
| 4–10 file | ~50–100 dòng |
| >10 file | Cảnh báo user, sau đó viết |

### Verdict — chỉ 3 giá trị

| Verdict | Khi nào |
|---|---|
| **READY TO MERGE** | Đạt intent, không có 🔴, mọi 🟡 verified safe |
| **NEEDS WORK** | Có 🟡 chưa verify, hoặc 🔴 fix được nhanh |
| **BLOCKED** | Không đạt intent, hoặc 🔴 nghiêm trọng (security/data loss) |

**KHÔNG "READY với lưu ý"** — có lưu ý chưa resolve → NEEDS WORK.

### Save

```
.claude/reviews/<branch>-<YYYY-MM-DD>.md
```

Branch chứa `/` → thay bằng `-`. Append với separator `---` nếu file cùng ngày đã tồn tại.

---

## References

| File | Khi nào đọc |
|---|---|
| [references/impact-output.md](references/impact-output.md) | A2 — đọc output `gitnexus_impact` |
| [references/report-template.md](references/report-template.md) | B — viết report (bug fix + feature templates) |
| [references/example-review.md](references/example-review.md) | Ví dụ end-to-end (A → B) |
