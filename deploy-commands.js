import fs from "fs";
import path from "path";
import { REST, Routes } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;

const commands = [];
function readCommands(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);

    if (fs.statSync(fullPath).isDirectory()) {
      readCommands(fullPath);
    } else if (file.endsWith(".js")) {
      commands.push(fullPath);
    }
  }
}

readCommands("./commands");

const commandData = [];

for (const filePath of commands) {
  const command = (await import(`file://${path.resolve(filePath)}`)).default;

  if (!command?.data) continue;

  commandData.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(TOKEN);

try {
  console.log(`🔄 Deploying ${commandData.length} commands...`);

  await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
    body: commandData,
  });

  console.log("✅ Successfully deployed slash commands.");
} catch (error) {
  console.error("❌ Failed to deploy commands:", error);
}
