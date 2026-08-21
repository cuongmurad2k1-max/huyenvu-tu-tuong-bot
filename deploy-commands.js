require("dotenv").config();

const { REST, Routes } = require("discord.js");
const { buildGroupedCommands } = require("./grouped-commands");

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token) {
  console.error("❌ Thiếu DISCORD_TOKEN.");
  process.exit(1);
}

if (!clientId) {
  console.error("❌ Thiếu CLIENT_ID.");
  process.exit(1);
}

const { commands, grouped } = buildGroupedCommands();

console.log("");
console.log("======================================");
console.log("📜 HUYỀN VŨ GROUPED COMMAND DEPLOY");
console.log("======================================");
console.log(`📦 Command gốc: ${commands.length}`);
console.log(`📚 Nhóm Discord: ${grouped.length}`);
console.log("");

for (const command of grouped) {
  const direct = command.options.filter(x => x.type === 1).length;
  const groups = command.options.filter(x => x.type === 2).length;
  const nested = command.options
    .filter(x => x.type === 2)
    .reduce((n, x) => n + x.options.length, 0);

  console.log(
    `/${command.name}: ${direct} lệnh trực tiếp` +
    (groups ? ` + ${nested} lệnh trong /${command.name}/more` : "")
  );
}

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    const route = guildId
      ? Routes.applicationGuildCommands(clientId, guildId)
      : Routes.applicationCommands(clientId);

    console.log("");
    console.log(
      guildId
        ? `🏠 Deploy vào guild: ${guildId}`
        : "🌍 Deploy GLOBAL"
    );

    await rest.put(route, { body: grouped });

    console.log("");
    console.log("✅ DEPLOY THÀNH CÔNG");
    console.log(`📚 ${grouped.length} nhóm top-level`);
    console.log(`⚔️ ${commands.length} command gốc`);
    console.log("");
    console.log("Ví dụ:");
    console.log("  /combat arena");
    console.log("  /tutuong hop_the");
    console.log("  /thanthu huyetmach");
    console.log("  /item ban_item");
    console.log("  /economy muasam");
  } catch (error) {
    console.error("");
    console.error("❌ DEPLOY THẤT BẠI:");
    console.error(error);
    process.exit(1);
  }
})();
