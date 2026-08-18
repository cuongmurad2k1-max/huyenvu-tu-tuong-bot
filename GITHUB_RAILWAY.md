# GitHub → Railway
1. Giải nén ZIP.
2. Upload toàn bộ file/thư mục vào GitHub.
3. Railway → New Project → Deploy from GitHub Repo.
4. Variables: DISCORD_TOKEN, CLIENT_ID, GUILD_ID, ADMIN_IDS.
5. Start command: npm start.
6. Chạy npm run deploy một lần để đăng ký slash commands.
7. Nếu dùng Railway Volume, mount vào `/app/data` để giữ JSON database.
