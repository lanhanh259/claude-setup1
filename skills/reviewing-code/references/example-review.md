# Ví dụ review end-to-end

Branch giả lập: `fix/board-ex` — fix bug drag-drop trong board cơ sở mới không gọi API khi kéo thả ở tab Danh mục.

Ví dụ này show **cả 2 phần** của skill: investigation notes (A) → report (B).

---

# PHẦN A — Thực hiện review (notes nội bộ)

## A1 — Xác định intent

```bash
git status              # 2 file M
git diff                # unstaged
git diff --cached       # staged
```

File thay đổi: `useDraggableCodes.ts` + `useUnderlyingDraggableCodes.ts`. Nội dung diff: refactor common hook + thêm event emit ở wrapper — không rõ là feature mới hay fix bug, nên **HỎI user**.

User confirm: "Fix bug bảng giá cơ sở mới không call API khi kéo thả tại tab Danh mục."

→ **Intent (notes):** Fix bug drag-drop trong UnderlyingBoard tab Danh mục — sau khi kéo thả thứ tự symbol, API reorder không được gọi.

## A2 — Phân tích impact qua GitNexus

```
gitnexus_detect_changes({scope: "all", repo: "dboard"})
  symbols: useDraggableCodes, useUnderlyingDraggableCodes
  flows: UnderlyingBoardDragFlow
  risk: LOW

gitnexus_impact({target: "useUnderlyingDraggableCodes", direction: "upstream"})
  d=1: useUnderlyingTableModel [0.95]
```

→ Scope hẹp, 1 caller trực tiếp. Không cần grep thủ công.

## A3 — Xác minh code đạt intent

**`useDraggableCodes.ts`:**
- Thay đổi: refactor common hook drag-drop, snapshot order tại drag start.
- **Đạt intent?** Một phần — đây là refactor preparation, không trực tiếp fix bug API call. Nhưng cần thiết để wrapper bên dưới hoạt động.

**`useUnderlyingDraggableCodes.ts`:**
- Thay đổi: wrapper emit 2 event (`REORDER_SYMBOLS_AFTER_DRAG` + `REORDER_SYMBOL_FROM_WATCHLIST`) trong callback `onReorder`.
- **Đạt intent?** Có. Trace `onReorder` → emit events → grep `REORDER_SYMBOLS_AFTER_DRAG` trong codebase → handler tại `useWatchlistSync.ts` đã có sẵn, gọi API `reorderSymbols`. ✅ Bug được fix.

**Findings nội bộ:**
- 🟡 Khi kéo về vị trí đầu (index=0) hoặc cuối, `prevSymbol`/`nextSymbol` sẽ là `undefined`. Đã grep consumer — handler có check `if (prevSymbol)` → an toàn.
- ❌ Out of scope (không 🔴): `void _rowHeight`, `useEffect` deps — không liên quan bug API call → bỏ qua theo quy tắc A3.

## A4 — Trace luồng thực thi (bug fix → 2 luồng)

Format tree ASCII — quy ước xem `report-template.md` § Quy ước vẽ Luồng thực thi. Notes A4 dùng nguyên xi cho section "Luồng thực thi" của report B.

**Luồng cũ (bug):**

```
User kéo thả symbol
│
├── onDragEnd                          [useDraggableCodes.ts cũ]
│   └── setDisplayCodes(updatedOrder)  → chỉ update local state
│
└── ❌ FAIL: không emit event → consumer không biết để call API
    → Output: reload page → thứ tự reset về server state (bug)
```

**Luồng mới (fix):**

```
User kéo thả symbol
│
├── onDragEnd                          [useDraggableCodes.ts]
│   └── onReorder?.(updatedOrder, draggedId)  ✨ thêm callback
│
├── onReorder                          [useUnderlyingDraggableCodes.ts:24]   ✨ MỚI
│   ├── emit REORDER_SYMBOLS_AFTER_DRAG, updatedOrder
│   └── emit REORDER_SYMBOL_FROM_WATCHLIST, { symbol, prev, next }
│
├── handler                            [useWatchlistSync.ts]   ← nhận cả 2 event
│   └── call API reorderSymbols(...)
│
└── → Output: reload page → thứ tự được lưu (đúng)
```

## Definition of Done cho A — check

- [x] Intent rõ (qua user confirm)
- [x] `detect_changes` đã chạy — risk LOW
- [x] Mỗi file đã trả lời "đạt intent?"
- [x] Mỗi risk verified (🟡 đầu/cuối → consumer xử lý đúng)
- [x] d=1 caller đã verify (signature không đổi)
- [x] Luồng thực thi: trace 2 luồng (cũ + fix)

→ Sẵn sàng sang Phần B.

---

# PHẦN B — Báo cáo kết quả (output cho user)

**File save:** `.claude/reviews/fix-board-ex-2026-05-16.md`

**Nội dung report:** dùng template Bug fix trong [`report-template.md`](report-template.md) — KHÔNG paste lại đầy đủ ở đây để tránh drift.

Mapping notes từ Phần A → các section của template:

| Section template     | Lấy từ Phần A                                                    |
| -------------------- | ---------------------------------------------------------------- |
| **TL;DR (2 dòng)**   | A1 intent → dòng "Code này"; A2 impact → dòng "Sau khi áp dụng"  |
| **Tổng quan**        | A1 intent + A3 "ảnh hưởng ai" — KHÔNG đưa root cause vào đây     |
| **Luồng thực thi**   | A4 — paste 2 luồng (cũ + fix) gần như nguyên xi                  |
| **Phân tích fix**    | A3 verify + suy luận root cause → fill 4 ô của bảng              |
| **Rủi ro**           | A3 findings ĐÃ verify (🟡 đầu/cuối) — bỏ findings ngoài intent  |
| **Impact (chi tiết)**| A2 — d=1 caller + flows                                          |
| **Verdict**          | A3 + Definition of Done — READY vì không 🔴 và 🟡 đã verify safe |

→ Output thực tế: ~60 dòng cho PR 2 file. Khớp size target.

---

## So sánh với review cũ trên cùng branch

Review cũ:
- 9 sections, ~60 dòng cho PR 2 file
- Liệt kê findings không liên quan intent (`void _rowHeight`, `useEffect` deps)
- Verdict "READY (với lưu ý)" — mâu thuẫn với 🟡 chưa verify
- Không có TL;DR — reader phải đọc cả "Tóm tắt" mới biết bug là gì

Review mới:
- TL;DR 2 dòng đầu → reader biết ngay vấn đề + safety
- Tổng quan / Phân tích fix phân vai rõ, không lặp
- Luồng thực thi 2 chiều (cũ + fix) → reader thấy fix can thiệp ở đâu
- Verdict rõ ràng vì đã verify 🟡 trong phần A trước khi viết B
