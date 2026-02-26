import fs from "fs";
import path from "path";

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
    const commandModule = await import(`file://${path.resolve(filePath)}`);

    const command = commandModule.default;

    if (!command?.data || !command?.execute) continue;

    client.commands.set(command.data.name, command);
  }

  console.log(`✅ Loaded ${client.commands.size} commands`);
}
