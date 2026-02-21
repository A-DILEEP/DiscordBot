import fs from "fs";
import path from "path";

/**
 * Recursively loads all slash commands from subfolders
 */
export async function loadCommands(client, commandsPath) {
  const commandFiles = [];

  function walk(dir) {
    for (const file of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, file);

      if (fs.statSync(fullPath).isDirectory()) {
        walk(fullPath);
      } else if (file.endsWith(".js")) {
        commandFiles.push(fullPath);
      }
    }
  }

  walk(commandsPath);

  for (const filePath of commandFiles) {
    // 🔑 THIS WAS THE BUG — await must be inside async function
    const commandModule = await import(`file://${path.resolve(filePath)}`);

    const command = commandModule.default;

    if (!command?.data || !command?.execute) continue;

    client.commands.set(command.data.name, command);
  }

  console.log(`✅ Loaded ${client.commands.size} commands`);
}
