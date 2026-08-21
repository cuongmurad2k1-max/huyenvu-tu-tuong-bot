const fs = require("fs");
const path = require("path");

/**
 * =====================================================
 * 📦 HUYỀN VŨ COMMAND LOADER
 * =====================================================
 *
 * Tự động hỗ trợ:
 *
 * 1. /app/commands/*.js
 *
 * 2. /app/*.js
 *
 * Nếu có thư mục commands thì ưu tiên commands/.
 * Nếu không có thì tự tìm 14 bundle ở /app.
 */

function loadCommands() {

    const rootDir = __dirname;

    const commandsDir =
        path.join(
            rootDir,
            "commands"
        );

    let files = [];
    let loadDir = rootDir;

    // =================================================
    // 📁 ƯU TIÊN /commands
    // =================================================

    if (
        fs.existsSync(commandsDir) &&
        fs.statSync(commandsDir).isDirectory()
    ) {

        loadDir = commandsDir;

        files = fs
            .readdirSync(commandsDir)
            .filter(
                file =>
                    file.endsWith(".js") &&
                    !file.startsWith("_")
            )
            .sort();

        console.log(
            `📂 Đang load commands từ: ${commandsDir}`
        );

    } else {

        // =================================================
        // 📁 FALLBACK: LOAD TRỰC TIẾP /app
        // =================================================

        files = fs
            .readdirSync(rootDir)
            .filter(
                file =>
                    /^(\d{2})_.+\.js$/i.test(file)
            )
            .sort();

        console.log(
            "📂 Không có /commands."
        );

        console.log(
            "📂 Tự động load command bundle trực tiếp từ /app."
        );
    }

    // =================================================
    // ❌ KHÔNG CÓ FILE
    // =================================================

    if (files.length === 0) {

        throw new Error(
            "Không tìm thấy file command bundle."
        );
    }

    console.log(
        `📂 Tìm thấy ${files.length} file command bundle.`
    );

    // =================================================
    // 📦 LOAD COMMAND
    // =================================================

    const all = [];

    for (
        const file of files
    ) {

        try {

            const filePath =
                path.join(
                    loadDir,
                    file
                );

            const mod =
                require(filePath);

            let count = 0;

            // =================================================
            // 📦 EXPORT ARRAY
            // =================================================

            if (
                Array.isArray(mod)
            ) {

                for (
                    const command of mod
                ) {

                    if (
                        command &&
                        command.data &&
                        typeof command.execute ===
                            "function"
                    ) {

                        all.push(command);

                        count++;

                    } else {

                        console.warn(
                            `⚠️ ${file}: command không hợp lệ.`
                        );
                    }
                }

            }

            // =================================================
            // ⚔️ EXPORT COMMAND ĐƠN
            // =================================================

            else if (
                mod &&
                mod.data &&
                typeof mod.execute ===
                    "function"
            ) {

                all.push(mod);

                count++;
            }

            // =================================================
            // ❌ KHÔNG PHẢI COMMAND
            // =================================================

            else {

                console.warn(
                    `⚠️ ${file}: không chứa command hợp lệ.`
                );

                continue;
            }

            console.log(
                `📦 ${file}: ${count} commands`
            );

        } catch (error) {

            console.error(
                `❌ Không thể load ${file}:`
            );

            console.error(
                error
            );
        }
    }

    // =================================================
    // 🔍 KIỂM TRA TRÙNG TÊN
    // =================================================

    const uniqueCommands = [];

    const names = new Set();

    const duplicates = [];

    for (
        const command of all
    ) {

        const name =
            command.data.name;

        if (
            names.has(name)
        ) {

            duplicates.push(
                name
            );

            continue;
        }

        names.add(
            name
        );

        uniqueCommands.push(
            command
        );
    }

    // =================================================
    // ⚠️ COMMAND TRÙNG
    // =================================================

    if (
        duplicates.length > 0
    ) {

        console.warn(
            "⚠️ COMMAND TRÙNG TÊN:"
        );

        console.warn(
            [
                ...new Set(
                    duplicates
                )
            ].join(", ")
        );
    }

    // =================================================
    // 📊 THỐNG KÊ
    // =================================================

    console.log(
        `📊 Tổng command load được: ${all.length}`
    );

    console.log(
        `📊 Command tên duy nhất: ${uniqueCommands.length}`
    );

    return uniqueCommands;
}

// =====================================================
// 📤 EXPORT
// =====================================================

module.exports = {
    loadCommands
};
