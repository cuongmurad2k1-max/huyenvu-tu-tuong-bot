const fs = require("fs");
const path = require("path");

/*
 * HUYỀN VŨ - 276 COMMANDS -> 15 TOP-LEVEL GROUPS
 *
 * Ví dụ:
 *   /tutuong hop_the
 *   /combat arena
 *   /item ban_item
 *
 * Discord cho tối đa 25 options cho một top-level command.
 * Vì vậy 3 nhóm có hơn 25 lệnh sẽ có thêm nhánh "more":
 *   /combat more <command>
 *   /item more <command>
 *   /economy more <command>
 *
 * Logic execute() của 276 command gốc được giữ nguyên.
 */

const GROUPS = {
  "01_combat.js": "combat",
  "02_tutuong.js": "tutuong",
  "03_thanthu.js": "thanthu",
  "04_nhanvat.js": "nhanvat",
  "05_boss_raid.js": "bossraid",
  "06_pvp.js": "pvp",
  "07_guild.js": "guild",
  "08_quest_story.js": "quest",
  "09_world.js": "world",
  "10_items_craft.js": "item",
  "11_economy.js": "economy",
  "12_social.js": "social",
  "13_progress.js": "progress",
  "14_misc.js": "misc"
};

const DESCRIPTIONS = {
  combat: "⚔️ Chiến đấu và kỹ năng",
  tutuong: "🐉 Tứ Tượng",
  thanthu: "🐾 Thần thú",
  nhanvat: "👤 Nhân vật",
  bossraid: "👹 Boss và Raid",
  pvp: "🏆 PvP",
  guild: "🏰 Bang hội",
  quest: "📜 Nhiệm vụ và cốt truyện",
  world: "🌎 Thế giới",
  item: "🎒 Vật phẩm và chế tạo",
  economy: "💰 Kinh tế",
  social: "👥 Xã hội",
  progress: "📈 Tiến trình",
  misc: "🧩 Khác"
};

const ROOT = __dirname;
const COMMANDS_DIR = path.join(ROOT, "commands");

function ensureCommandDirectory() {
  if (fs.existsSync(COMMANDS_DIR) && fs.statSync(COMMANDS_DIR).isDirectory()) {
    return;
  }

  // Railway may upload/extract the command bundles directly into /app.
  // Create /app/commands automatically and copy the bundles there so their
  // original require("../database") / require("../systems") paths keep working.
  const rootBundles = Object.keys(GROUPS).filter(file =>
    fs.existsSync(path.join(ROOT, file))
  );

  if (rootBundles.length === 0) {
    throw new Error(
      `Không tìm thấy thư mục commands hoặc command bundle tại ${ROOT}`
    );
  }

  fs.mkdirSync(COMMANDS_DIR, { recursive: true });

  for (const file of rootBundles) {
    fs.copyFileSync(
      path.join(ROOT, file),
      path.join(COMMANDS_DIR, file)
    );
  }

  console.log(`📁 Tự tạo /commands và copy ${rootBundles.length} bundle từ /app.`);
}

function loadBundle(file) {
  ensureCommandDirectory();
  const bundlePath = path.join(COMMANDS_DIR, file);

  if (!fs.existsSync(bundlePath)) {
    throw new Error(`Không tìm thấy command bundle: ${bundlePath}`);
  }

  const mod = require(bundlePath);
  if (Array.isArray(mod)) return mod;
  if (mod && mod.data && typeof mod.execute === "function") return [mod];
  return [];
}

function loadGrouped() {
  const commands = [];
  const byGroup = new Map();

  for (const [file, group] of Object.entries(GROUPS)) {
    const list = loadBundle(file);

    if (!byGroup.has(group)) byGroup.set(group, []);

    for (const command of list) {
      if (!command || !command.data || typeof command.execute !== "function") {
        console.warn(`⚠️ Bỏ qua command không hợp lệ trong ${file}`);
        continue;
      }

      const name = command.data.name;

      if (!name || !/^[a-z0-9_-]{1,32}$/.test(name)) {
        console.warn(`⚠️ Tên command không hợp lệ: ${name}`);
        continue;
      }

      commands.push({
        group,
        command,
        file
      });

      byGroup.get(group).push({
        group,
        command,
        file
      });
    }
  }

  return { commands, byGroup };
}

function makeSubcommand(command) {
  const json = command.data.toJSON();

  return {
    type: 1,
    name: json.name,
    description: (json.description || "Thực hiện lệnh").slice(0, 100),
    ...(json.options && json.options.length
      ? { options: json.options }
      : {})
  };
}

function buildGroupedCommands() {
  const { commands, byGroup } = loadGrouped();

  const result = [];
  const dispatch = new Map();

  for (const group of Object.values(GROUPS)) {
    const list = byGroup.get(group) || [];

    if (!list.length) continue;

    // Discord giới hạn 25 options cho mỗi top-level command.
    // Giữ 24 command trực tiếp + 1 subcommand-group "more" nếu cần.
    const direct = list.length > 25 ? list.slice(0, 24) : list;
    const overflow = list.length > 25 ? list.slice(24) : [];

    const options = direct.map(entry => {
      const sub = makeSubcommand(entry.command);
      dispatch.set(`${group}.${entry.command.data.name}`, entry.command);
      return sub;
    });

    if (overflow.length) {
      const moreOptions = overflow.map(entry => {
        const sub = makeSubcommand(entry.command);
        dispatch.set(
          `${group}.more.${entry.command.data.name}`,
          entry.command
        );
        return sub;
      });

      options.push({
        type: 2,
        name: "more",
        description: `Các lệnh còn lại của ${group}`,
        options: moreOptions
      });
    }

    result.push({
      type: 1,
      name: group,
      description: DESCRIPTIONS[group] || `Nhóm ${group}`,
      options
    });
  }

  return {
    commands,
    grouped: result,
    dispatch
  };
}

function getCommandForInteraction(interaction, dispatch) {
  if (!interaction.isChatInputCommand()) return null;

  const group = interaction.commandName;
  const sub = interaction.options.getSubcommand(false);
  const subGroup = interaction.options.getSubcommandGroup(false);

  if (!sub) return null;

  const key = subGroup
    ? `${group}.${subGroup}.${sub}`
    : `${group}.${sub}`;

  return dispatch.get(key) || null;
}

module.exports = {
  GROUPS,
  DESCRIPTIONS,
  buildGroupedCommands,
  getCommandForInteraction
};
