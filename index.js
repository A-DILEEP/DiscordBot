import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  Collection,
} from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

const { CLIENT_ID: clientId, TOKEN: token } = process.env;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));
const commands = [];

async function loadCommands() {
  for (const file of commandFiles) {
    const command = (await import(`./commands/${file}`)).default;
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
  }

  const rest = new REST({ version: "10" }).setToken(token);

  try {
    console.log("Started refreshing application (/) commands.");
    await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });
    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
}

client.once("ready", () => {
  console.log("Bot is online");
  loadCommands();
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.endsWith("bish spongebob")) {
    await message.react("😭");
    await message.reply("Don't be mean to me!");
  }

  if (message.content === "what am i" || message.content === "what i am") {
    await message.reply("You are a Noob bish! 😂");
  } else if (message.content.includes("cry")) {
    await message.reply("<:crying:1306851636735643729>");
  } else if (message.content.includes("jr")) {
    await message.reply("He is prob staring at the screen haha");
  } else if (message.content.includes("rave")) {
    await message.reply("Are you calling the person who likes toes? 🤔");
  } else if (message.content.includes("jonny")) {
    await message.reply("Oh, is that noob online?");
  } else if (message.content.includes(":pan:")) {
    await message.reply("Go shove that pan in another place");
  } else if (message.content.includes("trix")) {
    await message.reply("She is a kidnapper 😨");
  } else if (message.content.includes("ments")) {
    await message.reply("we need some darfield pictures ments😍");
  } else if (message.content === "boo" || message.content === "Boo") {
    await message.reply("👻🐝");
  } else if (message.content === "kill" || message.content === "Kill") {
    await message.reply("<:im_gonna_kill_u:1307037318305284147>");
  } else if (
    message.content.includes("money") ||
    message.content.includes("Money")
  ) {
    await message.react("<:money:1307037302593425408>");
  } else if (message.content.includes("hehe")) {
    await message.react("<:hehe:1307038056141815880>");
  }

  if (message.reference) {
    try {
      const messageReplied = await message.channel.messages.fetch(
        message.reference.messageId
      );

      if (
        messageReplied.author.id === client.user.id &&
        message.content === "boo"
      ) {
        await message.reply("👻👻");
      } else if (
        messageReplied.author.id === client.user.id &&
        message.content.includes("which screen")
      ) {
        await message.reply("idk, prob some Instagram haha.");
      }
    } catch (e) {
      console.error(e);
    }
  }
});

client.login(token);
