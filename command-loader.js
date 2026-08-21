const fs = require("fs");
const path = require("path");

/**
 * Load toàn bộ command trong thư mục commands
 *
 * Hỗ trợ:
 * - File export Array command
 * - File export một command
 */
function loadCommands(
    commandsDir = path.join(__dirname, "commands")
) {

    const all = [];

    if (!fs.existsSync(commandsDir)) {

        throw new Error(
            `Không tìm thấy thư mục commands: ${commandsDir}`
        );
    }

    const files = fs
        .readdirSync(commandsDir)
        .filter(
            file =>
                file.endsWith(".js") &&
                file !== "_helper.js"
        )
        .sort();

    console.log(
        `📂 Tìm thấy ${files.length} file command bundle.`
    );

    for (const file of files) {

        try {

            const filePath =
                path.join(
                    commandsDir,
                    file
                );

            const mod =
                require(filePath);

            // =============================================
            // 📦 BUNDLE ARRAY
            // =============================================

            if (Array.isArray(mod)) {

                console.log(
                    `📦 ${file}: ${mod.length} commands`
                );

                for (const command of mod) {

                    if (
                        command &&
                        command.data &&
                        typeof command.execute === "function"
                    ) {
                        all.push(command);
                    } else {

                        console.warn(
                            `⚠️ ${file}: phát hiện command không hợp lệ.`
                        );
                    }
                }

            }

            // =============================================
            // ⚔️ COMMAND ĐƠN
            // =============================================

            else if (
                mod &&
                mod.data &&
                typeof mod.execute === "function"
            ) {

                console.log(
                    `📦 ${file}: 1 command`
                );

                all.push(mod);

            }

            // =============================================
            // ❌ KHÔNG HỢP LỆ
            // =============================================

            else {

                console.warn(
                    `⚠️ ${file}: không chứa command hợp lệ.`
                );
            }

        } catch (error) {

            console.error(
                `❌ Không thể load ${file}:`
            );

            console.error(error);
        }
    }

    // =============================================
    // 🔍 KIỂM TRA TRÙNG TÊN
    // =============================================

    const names = new Map();
    const duplicates = [];

    for (const command of all) {

        const name =
            command.data.name;

        if (names.has(name)) {

            duplicates.push(name);

        } else {

            names.set(name, command);
        }
    }

    if (duplicates.length > 0) {

        console.warn(
            "⚠️ COMMAND TRÙNG TÊN:"
        );

        console.warn(
            [...new Set(duplicates)].join(", ")
        );
    }

    // =============================================
    // 📊 THỐNG KÊ
    // =============================================

    console.log(
        `📊 Tổng command load được: ${all.length}`
    );

    console.log(
        `📊 Command tên duy nhất: ${names.size}`
    );

    return all;
}

module.exports = {
    loadCommands
};
