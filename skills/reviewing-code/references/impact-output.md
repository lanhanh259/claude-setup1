# Đọc output của gitnexus_impact

## Contents
- Depth levels
- Confidence score
- Khi nào dừng ở d=2

## Depth levels

| Depth | Label | Nghĩa | Hành động |
|---|---|---|---|
| d=1 | WILL BREAK | Caller trực tiếp — chắc chắn vỡ | Bắt buộc kiểm tra/cập nhật |
| d=2 | LIKELY AFFECTED | Phụ thuộc gián tiếp | Nên test |
| d=3 | MAY NEED TESTING | Ảnh hưởng lan | Test nếu là critical path |

## Confidence score

- `>0.8` — tin cậy cao, xử lý như WILL BREAK
- `0.5–0.8` — cần xem xét thêm
- `<0.5` — ít khả năng ảnh hưởng, có thể bỏ qua

## Khi nào dừng ở d=2

Nếu d=3 trả về >30 symbols mà tất cả confidence đều thấp (<0.5), không cần xử lý từng cái — ghi nhận "d=3 rộng nhưng low confidence" trong report là đủ.

## Ví dụ output

```
gitnexus_impact({target: "loginHandler", direction: "upstream"})

→ d=1 (WILL BREAK):
  - authRouter (src/routes/auth.ts:22) [CALLS, 100%]

→ d=2 (LIKELY AFFECTED):
  - appBootstrap (src/app.ts:8) [CALLS, 90%]

→ d=3 (MAY NEED TESTING):
  - serverInit (src/server.ts:5) [CALLS, 60%]
```

Đọc: `authRouter` gọi trực tiếp `loginHandler` → **bắt buộc kiểm tra**. `appBootstrap` gián tiếp → nên test. `serverInit` xa hơn → test nếu release critical.
