# Huyền Vũ Tứ Tượng — Bản Gộp 15 File

Đã gộp toàn bộ 276 slash commands thành 14 bundle command + các file lõi. Không xóa lệnh; mỗi bundle export một mảng command để loader nạp toàn bộ.

## Cấu trúc
- commands/01_combat.js ... commands/14_misc.js: toàn bộ 276 lệnh
- - database.js: database người chơi
- systems.js: toàn bộ 31 hệ thống đã gộp
- catalog.json: toàn bộ catalog dữ liệu
- command-loader.js: loader cho bundle

## Tích hợp vào bot hiện tại
Nếu bot của bạn đang tự động quét `commands/*.js`, thay loader bằng:
```js
const { loadCommands } = require('./command-loader');
const commands = loadCommands();
```
Khi đăng ký slash commands, dùng `commands.map(c => c.data.toJSON())`. Khi xử lý interaction, tìm command theo `interaction.commandName` trong mảng `commands`.

Bản này phù hợp để upload GitHub bằng điện thoại: chỉ còn 19 file chính thay vì hơn 300 file.
