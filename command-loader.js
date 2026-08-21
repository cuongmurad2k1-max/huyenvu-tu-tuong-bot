const fs = require("fs");
const path = require("path");

/** Loads both grouped command bundles (arrays) and normal command modules. */
function loadCommands(commandsDir = path.join(__dirname, "commands")) {
  const all = [];
  for (const file of fs.readdirSync(commandsDir).filter(f => f.endsWith(".js") && f !== "_helper.js")) {
    const mod = require(path.join(commandsDir, file));
    if (Array.isArray(mod)) all.push(...mod);
    else if (mod && mod.data && typeof mod.execute === "function") all.push(mod);
  }
  return all;
}

module.exports = { loadCommands };
