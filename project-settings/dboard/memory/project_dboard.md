---
name: dboard project overview
description: Tổng quan dự án dboard - bảng giá chứng khoán React
type: project
originSessionId: d33fed42-04c2-41aa-b1f2-fe7625ad29bb
---

Dboard là ứng dụng **bảng giá chứng khoán** (price board) web dành cho thị trường Việt Nam (VND). Version hiện tại: 26.3.2.

**Why:** Cung cấp bảng giá realtime cho cổ phiếu cơ sở, chứng quyền (CW), phái sinh (Derivative) với tính năng kéo thả cột, sort, sticky header.

**How to apply:** Khi làm việc với code, nhớ đây là financial app với dữ liệu realtime qua MQTT/WebSocket, UI phức tạp với virtual list và drag-drop.

## Tech Stack

**Chung:** React 18, Highcharts, TailwindCSS, styled-components, MQTT, Firebase, axios, react-scripts (CRA), react-app-rewired

**Board cũ:** Redux + Redux Saga, JavaScript (không TypeScript), global event emitter, StockRenderer/StockDragger (DOM mutation)

**Board26:** TypeScript, Zustand, react-window (virtual list), @hello-pangea/dnd

## Hệ thống Board (bảng giá)

Có 4 loại board: **Cơ sở** (khớp lệnh), **Cơ bản** (fundamental), **Phái sinh**, **Chứng quyền**.

### Board cũ — nằm trong `src/modules/price-board/components/`

| Loại        | File                                                     |
| ----------- | -------------------------------------------------------- |
| Cơ sở (CS)  | `quotes-priceBoard/main.js` (hiện bị comment, chưa dùng) |
| Cơ bản      | `fundament-board/index.js` ← **vẫn đang được dùng**      |
| Phái sinh   | `derivative/index.js`                                    |
| Chứng quyền | `covered-warrant/` (export: `CoveredWarrantBoard`)       |

Pattern board cũ: Class component hoặc function component + Redux + **global event emitter** (`emitter`) + **StockRenderer/StockDragger** mutate DOM trực tiếp ngoài React.

### Board26 — migration viết lại toàn bộ board cũ (`src/modules/price-board/components/Board26/`)

> Board26 **không phải board riêng** — đây là dự án migration thay thế lần lượt từng board cũ bằng kiến trúc mới.

| Loại        | File                                                                |
| ----------- | ------------------------------------------------------------------- |
| Cơ sở (CS)  | `UnderlyingBoard/index.tsx`                                         |
| Cơ bản      | `FundamentalBoard/index.tsx` (chưa dùng, bị comment trong index.js) |
| Phái sinh   | `DerivativeBoard/index.tsx`                                         |
| Chứng quyền | `CWBoard/index.tsx`                                                 |

Pattern Board26: Functional component + TypeScript + Zustand store riêng + `react-window` virtual list + `@hello-pangea/dnd` + `CommonPriceTable` shared infrastructure.

### Trạng thái migration (tại thời điểm 2026-05)

- ✅ UnderlyingBoard, DerivativeBoard, CWBoard → đã dùng Board26
- ❌ FundamentalBoard → vẫn dùng board cũ (`fundament-board/index.js`)

**Entry point:** `src/modules/price-board/index.js` — chọn board theo `boardType`
ø
