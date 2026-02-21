import { REST, Routes } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log("🧹 Clearing guild commands...");
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: [],
    });
    console.log("✅ Guild commands cleared.");
  } catch (err) {
    console.error(err);
  }
})();
