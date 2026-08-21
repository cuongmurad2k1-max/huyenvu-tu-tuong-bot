# Huyền Vũ — 276 Commands Grouped

Bản này chuyển toàn bộ 276 command thành 15 nhóm top-level để dùng dạng:

- `/combat <lệnh>`
- `/tutuong <lệnh>`
- `/thanthu <lệnh>`
- `/nhanvat <lệnh>`
- `/bossraid <lệnh>`
- `/pvp <lệnh>`
- `/guild <lệnh>`
- `/quest <lệnh>`
- `/world <lệnh>`
- `/item <lệnh>`
- `/economy <lệnh>`
- `/social <lệnh>`
- `/progress <lệnh>`
- `/misc <lệnh>`

## Giới hạn Discord

Một top-level command có tối đa 25 options. Ba bundle vượt 25 lệnh:

- combat: 30
- item: 29
- economy: 26

Vì vậy các lệnh vượt quá 24 của ba nhóm này được đặt dưới `more`:

- `/combat more <lệnh>`
- `/item more <lệnh>`
- `/economy more <lệnh>`

Tất cả 276 logic command gốc vẫn được giữ và dispatcher gọi đúng `execute()` của command cũ.

## File mới

- `grouped-commands.js` — tạo 15 nhóm và map interaction → command gốc.
- `deploy-commands.js` — đăng ký 15 top-level commands.
- `index.js` — dispatcher grouped.
- `command-loader.js` — loader bundle.
- `package.json` — thêm dotenv.

## Railway

Variables cần có:

- `DISCORD_TOKEN`
- `CLIENT_ID`
- `GUILD_ID` (khuyên dùng khi test; bỏ trống nếu muốn global)

Chạy:

```bash
node deploy-commands.js
```

Sau đó:

```bash
node index.js
```

Kỳ vọng:

```text
📦 Command gốc: 276
📚 Nhóm Discord: 15
```

Nếu deploy guild, lệnh cập nhật nhanh hơn global.
