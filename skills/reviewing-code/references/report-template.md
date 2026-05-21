# Report Template

Mục tiêu: người chưa xem code **đọc 2 dòng đầu là biết ngay** (1) code này làm gì và (2) sau khi áp dụng có ảnh hưởng gì không.

**Ngôn ngữ:** thuật ngữ tiếng Anh — mở ngoặc tiếng Việt lần đầu, không lặp lại. Ví dụ: lần đầu viết "drag-drop (kéo thả)", các lần sau chỉ "drag-drop". Áp dụng cho `caller`, `signature`, `hook`, `consumer`, `wrapper`, `intent`, `flow`, v.v.

## Legend — 2 hệ icon, KHÔNG dùng lẫn

Report dùng 2 hệ icon riêng biệt cho 2 mục đích khác nhau:

| Vị trí               | Hệ icon       | Ý nghĩa                                                                               |
| -------------------- | ------------- | ------------------------------------------------------------------------------------- |
| **TL;DR — "Sau khi áp dụng"** | ✅ ⚠️ 🔴 ❓ | **Impact-level** sau merge: không ảnh hưởng / có ảnh hưởng đã handle / breaking / chưa verify |
| **Findings (Rủi ro)** | 🔴 🟡 🔵     | **Severity** của từng finding: block merge / nên sửa / nice-to-have                   |

> ⚠️ 🔴 **xuất hiện ở cả 2 hệ với nghĩa khác nhau** — TL;DR 🔴 = "merge sẽ phá runtime", Findings 🔴 = "finding này block merge". Đọc theo vị trí.

## Contents

- Legend 2 hệ icon (ở trên)
- 3 yêu cầu bắt buộc của report
- Cấu trúc "TL;DR" — 2 dòng đầu
- Khi nào dùng template nào
- Template Bug fix
- Template Feature / Refactor
- **Quy ước vẽ Luồng thực thi (tree ASCII)** ← mới
- Quy tắc viết Findings (4 phần)
- Ví dụ Executive Summary tốt/xấu

## 3 yêu cầu bắt buộc

Mỗi report BẮT BUỘC có đủ 3 phần này — thiếu 1 là chưa đạt:

1. **Tổng quan tình trạng** — không liệt kê lỗi, mô tả bản chất:
   - **Bug fix** → bug là gì, xảy ra khi nào, ảnh hưởng ai
   - **Feature** → tính năng làm gì, giải quyết vấn đề nào của user
2. **Luồng thực thi** — entry → output, từng bước:
   - **Bug fix** → trace **2 luồng**: luồng lỗi (cũ) + luồng fix (mới)
   - **Feature** → trace luồng chính (1 luồng)
3. **Mô tả vấn đề đúng format** — mỗi finding đủ 4 phần: Vấn đề là gì / Ở đâu / Tại sao là vấn đề / Gợi ý

## Cấu trúc "TL;DR" — 2 dòng đầu

Ngay sau `# Review: <branch>`, BẮT BUỘC có 2 dòng này — không có narrative ở giữa:

```markdown
> **Code này:** [fix bug X / thêm feature Y] — 1 câu, cụ thể, góc nhìn user.
> **Sau khi áp dụng:** [✅ không ảnh hưởng / ⚠️ ảnh hưởng N caller / 🔴 BREAK X] — kèm 1 câu lý do.
```

Reader đọc 2 dòng này phải biết: vấn đề gì + an toàn merge không. Narrative chi tiết đẩy xuống "Tổng quan".

### Bảng giá trị "Sau khi áp dụng"

| Ký hiệu                          | Khi nào                                                                | Ví dụ                                                                                      |
| -------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| ✅ **Không ảnh hưởng**           | Signature giữ nguyên, không caller nào cần đổi, không flow khác đi qua | "✅ Không ảnh hưởng — signature giữ nguyên, 1 caller `useUnderlyingTableModel` đã verify." |
| ⚠️ **Ảnh hưởng nhưng đã handle** | Có caller bị ảnh hưởng nhưng đã update hoặc consumer xử lý đúng        | "⚠️ Ảnh hưởng 3 caller — đã update cả 3, signature backward-compatible."                   |
| 🔴 **BREAKING**                  | Caller bên ngoài chưa update, sẽ vỡ runtime                            | "🔴 BREAKING — `OrderForm.tsx` gọi `placeOrder()` với arity cũ, chưa update."              |
| ❓ **Chưa verify đủ**            | Có dependent chưa kiểm chứng được                                      | "❓ Chưa verify — 2 d=2 caller ở module `reporting` chưa đọc, không chắc safe."            |

---

## Khi nào dùng template nào

Đọc intent từ A1 để phân loại:

- **Bug fix** → template Bug fix
- **Feature / Refactor** → template Feature
- **Branch mixed** → 2 phần riêng, mỗi phần dùng template tương ứng

---

## Template Bug fix

```markdown
# Review: <branch>

> **Code này:** fix bug [hiện tượng user thấy] khi [trigger / điều kiện].
> **Sau khi áp dụng:** [✅/⚠️/🔴/❓ + 1 câu lý do]

**Files:** N • **Symbols:** [tên ngắn] • **Verdict:** READY TO MERGE / NEEDS WORK / BLOCKED

## Tổng quan

[2–3 câu narrative MỞ RỘNG TL;DR. CHỈ trả lời:

- Bug xảy ra trong tình huống nào (chi tiết hơn TL;DR)?
- Ảnh hưởng ai (user nào, feature nào)?

KHÔNG nói root cause / fix approach / regression ở đây — đó là việc của
"Phân tích fix" bên dưới. Tránh lặp.]

## Luồng thực thi

> **Format BẮT BUỘC: tree ASCII** (`├──` `└──` `│`), không dùng numbered list. Xem [Quy ước vẽ Luồng thực thi](#quy-ước-vẽ-luồng-thực-thi) bên dưới.

**Luồng lỗi (trước fix):**

```
User [hành động trigger]
│
├── <entryFunction>(args)              [file.ts:line]
│   ├── <childCall>(args)              → giải thích ngắn
│   └── <anotherCall>()                → ...
│
└── ❌ FAIL: [bước nào fail, lý do kỹ thuật]
    → Kết quả: [user thấy gì sai]
```

**Luồng fix (sau fix):**

```
User [hành động trigger]
│
├── <entryFunction>(args)              [file.ts:line]
│   ├── <childCall>(args)              → giải thích
│   └── <newCall>(newArgs)             → ✨ THAY ĐỔI: [gì]
│
├── <newStep>(args)                    [file.ts:line]   ✨ MỚI
│   └── ...
│
└── → Kết quả: [user thấy gì đúng]
```

## Phân tích fix

[Section này CHỨA toàn bộ phần kỹ thuật — không lặp ở Tổng quan.]

|                     |                                                |
| ------------------- | ---------------------------------------------- |
| **Root cause**      | Nguyên nhân thực sự (không phải triệu chứng)   |
| **Fix approach**    | Cách fix đã chọn (1 câu)                       |
| **Đánh giá**        | Trị gốc ✅ / che triệu chứng ⚠️ / sai hướng ❌ |
| **Regression risk** | Fix có thể phá gì khác? (đã verify ở A3)       |

## Rủi ro

[Chỉ list risk ĐÃ VERIFY ở A3. Mỗi risk đủ 4 phần Findings.
Không có → "Không phát hiện rủi ro đáng kể."]

## Impact (chi tiết)

**Risk overall:** LOW / MEDIUM / HIGH / CRITICAL (từ `detect_changes`)

**Affected execution flows:** [list process names — hoặc "không flow nào khác đi qua"]

**Dependents:**

- d=1 (WILL BREAK): `<symbol>` @ `file:line` [confidence] — signature đổi? cần update?
- d=2 (LIKELY AFFECTED): N symbols — đã test? (chỉ list confidence >0.5)
- d=3: bỏ qua hoặc 1 dòng tóm tắt nếu rộng-low-confidence

[Section này MỞ RỘNG dòng "Sau khi áp dụng" ở TL;DR. Bỏ nếu thực sự
không có dependent nào.]

## Verdict

**READY TO MERGE / NEEDS WORK / BLOCKED**

[1–2 câu lý do. NEEDS/BLOCKED → list blockers cụ thể.]
```

---

## Template Feature / Refactor

```markdown
# Review: <branch>

> **Code này:** thêm feature [tên feature] giải quyết [user pain point].
> (Refactor: "refactor [tên module] để [mục đích — ví dụ: tái sử dụng / giảm coupling]")
> **Sau khi áp dụng:** [✅/⚠️/🔴/❓ + 1 câu lý do]

**Files:** N • **Symbols:** [tên ngắn] • **Verdict:** READY TO MERGE / NEEDS WORK / BLOCKED

## Tổng quan

[3–5 câu narrative MỞ RỘNG TL;DR. Trả lời:

- Feature/refactor cụ thể là gì (chi tiết hơn TL;DR)?
- Approach kỹ thuật chính (1 câu)?
- Code đạt intent không + chất lượng tổng thể?
- Risk overall (LOW / MEDIUM / HIGH)?]

## Luồng thực thi

> **Format BẮT BUỘC: tree ASCII** (`├──` `└──` `│`), không dùng numbered list. Xem [Quy ước vẽ Luồng thực thi](#quy-ước-vẽ-luồng-thực-thi) bên dưới.

**Luồng chính:**

```
User [hành động trigger]
│
├── <entryFunction>(args)              [file.ts:line]
│   ├── <childCall>(args)              → giải thích ngắn
│   ├── setState(...)                  → state nào đổi
│   └── <emitOrCall>(EVENT, payload)   → ai nhận?
│
├── <listenerOrNextStep>               [file.ts:line]   ← nhận EVENT
│   └── <doWork>(...)                  → side effect gì
│
└── → Output: [kết quả user thấy / state cuối]
```

[Nếu là refactor — thêm khối "Trước refactor" trước khối chính, format tree y hệt, để reader so sánh hai cây cạnh nhau.]

## Đánh giá

[1–2 đoạn narrative. KHÔNG liệt kê "thêm function X". Phải đánh giá:
"function X giải quyết Y bằng cách Z — đúng/sai vì..."]

## Rủi ro

[Chỉ list risk ĐÃ VERIFY ở A3. Mỗi risk đủ 4 phần Findings.
Không có → "Không phát hiện rủi ro đáng kể."]

## Impact (chi tiết)

**Risk overall:** LOW / MEDIUM / HIGH / CRITICAL (từ `detect_changes`)

**Affected execution flows:** [list process names — hoặc "không flow nào khác đi qua"]

**Dependents (file MODIFIED):**

- d=1 (WILL BREAK): `<symbol>` @ `file:line` [confidence] — signature đổi? cần update?
- d=2 (LIKELY AFFECTED): N symbols — đã test? (chỉ list confidence >0.5)
- d=3: bỏ qua hoặc 1 dòng tóm tắt nếu rộng-low-confidence

**External callers (file NEW):** từ grep — đã wire chưa? "Chưa ai import" = chưa
được dùng → flag.

## Verdict

**READY TO MERGE / NEEDS WORK / BLOCKED**

[1–2 câu lý do. NEEDS/BLOCKED → list blockers cụ thể.]
```

---

## Quy ước vẽ Luồng thực thi

Tree ASCII bắt buộc — KHÔNG numbered list. Mục tiêu: reader scan 1 cái thấy ngay call hierarchy (cha → con) và nơi can thiệp của fix.

### Ký tự & cấu trúc

| Ký tự | Dùng cho |
|---|---|
| `├──` | Node anh em ở giữa (còn anh em sau nó) |
| `└──` | Node anh em cuối cùng (kết thúc nhánh) |
| `│`   | Cột dọc nối tiếp (cha chưa hết con) |
| 4 spaces | Indent thay `│` khi nhánh trên đã `└──` |

### Nội dung mỗi dòng

```
<functionOrEvent>(args)         [file.ts:line]   → annotation
```

- **Function call** hoặc **event emit** ở đầu — code style backticks không bắt buộc trong block, nhưng tên phải chính xác.
- **`[file.ts:line]`** đặt sau tên, cách bằng khoảng trắng — reader bấm số dòng nhảy thẳng tới.
- **`→ annotation`** giải thích NGẮN: state nào đổi / side effect gì / ai nhận event. Không có gì để nói → bỏ.

### Marker đặc biệt

| Marker | Nghĩa |
|---|---|
| `✨` đứng cuối dòng hoặc đầu node | Bước MỚI hoặc THAY ĐỔI ở fix/feature |
| `❌ FAIL: ...` | Điểm fail trong luồng lỗi |
| `← nhận EVENT` | Node listener nhận event nào |
| `→ Output: ...` | Dòng cuối — kết quả user thấy |

### Ví dụ mini

```
User kéo thả symbol
│
├── handleDragEnd(result)              [useDraggableCodes.ts:92]
│   ├── syncOrderWithCodes(...)        → tính updatedOrder
│   ├── setManualOrder(updatedOrder)
│   └── onReorder?.(updatedOrder, draggedId)   ✨ thêm tham số 2
│
├── onReorder callback                 [useUnderlyingDraggableCodes.ts:24]   ✨ MỚI
│   ├── updateSort({ columnId: null }) → xoá sort theo cột
│   ├── emit(REORDER_SYMBOLS_AFTER_DRAG, updatedOrder)
│   └── emit(REORDER_SYMBOL_FROM_WATCHLIST, { symbol, prev, next })
│
├── onReorderSymbol                    [use-watchlist-symbols/index.ts:66]   ← nhận REORDER_SYMBOLS_AFTER_DRAG
│   └── update symbols của free watchlist
│
└── → Output: thứ tự symbol được lưu cho cả free + private watchlist
```

### Khi nào nén / khi nào tách

- Nhánh > 4 cấp sâu → cân nhắc tách thành nhiều cây, mỗi cây 1 entry point.
- Bước trung gian không quan trọng (vd: helper trivial) → gộp 1 dòng có `→ ...`.
- Listener / async side effect → tách thành **subtree riêng** ở cùng cấp với entry, không lồng vào tree caller.

---

## Quy tắc viết Findings (4 phần)

Mỗi finding BẮT BUỘC có đủ **4 phần** — thiếu 1 phần thì bỏ cả finding:

| Phần                  | Nội dung                         | Câu hỏi tự kiểm tra                             |
| --------------------- | -------------------------------- | ----------------------------------------------- |
| **Vấn đề là gì**      | Mô tả cụ thể, không chung chung  | Reader hiểu vấn đề mà không cần đọc code không? |
| **Ở đâu**             | `file:line` hoặc `function:line` | Có thể nhảy thẳng tới chỗ sửa không?            |
| **Tại sao là vấn đề** | Hậu quả nếu không sửa            | Crash? Data loss? Slow? UX confusing?           |
| **Gợi ý**             | Hướng sửa hoặc snippet ngắn      | Reader biết bước tiếp theo phải làm gì không?   |

Severity: 🔴 block merge · 🟡 nên sửa · 🔵 nice-to-have.

> ✅ 🔴 **Không guard danh sách rỗng** · `useDraggableCodes.ts:42`
> Khi `codes` rỗng, `codes[0]` trả về `undefined` và crash ở bước sort tiếp theo.
> **Gợi ý:** thêm `if (!codes.length) return [];` trước vòng lặp.
>
> ❌ 🔴 `useDraggableCodes.ts:42` — không handle edge case. **Action:** fix.
> (Thiếu "tại sao", "gợi ý không cụ thể" → bỏ.)

---

## Ví dụ TL;DR (2 dòng đầu)

> ✅ **Bug fix:**
>
> > **Code này:** fix bug user kéo thả symbol trong bảng giá cơ sở mới (tab Danh mục) nhưng thứ tự không được lưu lên server — reload là mất.
> > **Sau khi áp dụng:** ✅ Không ảnh hưởng — chỉ thêm event emit ở wrapper mới, consumer hiện có sẵn handler. 1 d=1 caller `useUnderlyingTableModel` đã verify signature không đổi.
>
> ✅ **Feature:**
>
> > **Code này:** thêm khả năng kéo thả sắp xếp lại watchlist cá nhân — user có thể pin symbol thường xem lên đầu.
> > **Sau khi áp dụng:** ⚠️ Ảnh hưởng 2 component (`UnderlyingBoard`, `DerivativeBoard`) — cả 2 đã update để dùng hook mới, signature backward-compatible. Risk LOW.
>
> ❌ "Files: 2. Symbols: useDraggableCodes. Thêm wrapper. Verdict: READY."
> (Reader đọc xong vẫn không biết bug/feature là gì, có ảnh hưởng không.)
