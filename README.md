# Huyền Vũ — 276 Commands Prefix

Toàn bộ 276 lệnh dùng prefix `.` thay cho Slash Command.

Ví dụ:
- `.bat_dau`
- `.phoban`
- `.dotpha`
- `.dung <tên hoặc ID vật phẩm>`
- `.resetall`

`.help` hoặc `.lenh` sẽ hiện danh sách lệnh.

## Railway / Discord Developer Portal

Bot cần các biến môi trường:
- `DISCORD_TOKEN`

Quan trọng: bật **Message Content Intent** trong Discord Developer Portal → Bot → Privileged Gateway Intents.

Slash Command đã được loại bỏ khỏi hệ thống. Không có bước deploy `/` nào nữa. Không chạy file deploy lệnh cũ. Chỉ chạy:

```bash
node index.js
```

Logic `execute()` của 276 command được giữ nguyên; `index.js` tạo adapter để các command cũ nhận được `interaction.user`, `interaction.options.getString()` và `interaction.reply()` như trước.


## 🚫 Slash Command

Bản này **chỉ nhận lệnh bắt đầu bằng `.`**. Ví dụ `.bat_dau`, `.phoban`, `.dotpha`.
Các lệnh `/...` không được đăng ký và bot không xử lý Slash Command.

Nếu Discord vẫn còn hiện lệnh `/` cũ, đó là lệnh đã được đăng ký từ phiên bản trước; cần xóa các application commands cũ trong Discord Developer Portal hoặc dùng một lần script xóa command cũ trước khi bỏ script đó.
