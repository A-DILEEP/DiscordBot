import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  Collection,
  ActivityType,
} from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

const { CLIENT_ID: clientId, TOKEN: token, GUILD_ID: guildId } = process.env;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();
const statuses = [
  "Listening to your commands 🎧",
  "Laughing at your typos 😂",
  "Roasting noobs 🔥",
  "Hacking the mainframe... jk",
];

let i = 0;
setInterval(() => {
  client.user.setActivity(statuses[i % statuses.length], {
    type: ActivityType.Watching,
  });
  i++;
}, 10000);

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
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });
    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
}

client.on("guildMemberAdd", (member) => {
  const channel = member.guild.systemChannel;
  if (channel) {
    channel.send(`Welcome, ${member}! I am watching you... 👀`);
  }
});

client.once("ready", () => {
  console.log("Bot is online");
  console.log(`Logged in as: ${client.user.tag}`);
  console.log(`Bot ID: ${client.user.id}`);
  console.log("Guilds/Servers the bot is in:");
  client.guilds.cache.forEach((guild) => {
    console.log(`- ${guild.name}: ${guild.id}`);
  });
  client.user.setActivity("Your Commands", { type: ActivityType.Listening });
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

  if (message.content.toLowerCase().startsWith("?av")) {
    let user = message.author;
    const args = message.content.slice(3).trim();

    if (args) {
      try {
        if (message.mentions.users.size > 0) {
          user = message.mentions.users.first();
        } else {
          const searchQuery = args.replace(/^@/, "").toLowerCase();
          const members = await message.guild.members.fetch();

          let foundMember = members.find(
            (member) =>
              member.user.username.toLowerCase() === searchQuery ||
              (member.nickname &&
                member.nickname.toLowerCase() === searchQuery) ||
              (member.user.globalName &&
                member.user.globalName.toLowerCase() === searchQuery),
          );
          if (!foundMember) {
            foundMember = members.find(
              (member) =>
                member.user.username.toLowerCase().includes(searchQuery) ||
                (member.nickname &&
                  member.nickname.toLowerCase().includes(searchQuery)) ||
                (member.user.globalName &&
                  member.user.globalName.toLowerCase().includes(searchQuery)),
            );
          }

          if (foundMember) {
            user = foundMember.user;
          } else {
            await message.reply(
              `❌ User **${args}** not found in this server.`,
            );
            return;
          }
        }
      } catch (error) {
        console.error("Error fetching members:", error);
        await message.reply("❌ Error searching for user. Please try again.");
        return;
      }
    }

    const avatarEmbed = {
      title: `${user.username}'s Avatar`,
      image: {
        url: user.displayAvatarURL({ size: 1024 }),
      },
      color: 0x5865f2,
      footer: {
        text: user.id,
      },
    };
    await message.reply({ embeds: [avatarEmbed] });
    return;
  }

  if (message.content.endsWith("bish naruto")) {
    await message.react("😭");
    await message.reply("Don't be mean to me!");
  }
  if (message.content === "what am i" || message.content === "what i am") {
    await message.reply("You are a Noob bish! 😂");
  } else if (message.content.includes("cry")) {
    await message.reply("<:crying:1306851636735643729>");
  } else if (message.content.includes(":pan:")) {
    await message.reply("Go shove that pan in another place");
  } else if (message.content === "kill" || message.content === "Kill") {
    await message.reply("<:im_gonna_kill_u:1307037318305284147>");
  } else if (
    message.content.includes("money") ||
    message.content.includes("Money")
  ) {
    await message.react("<:money:1307037302593425408>");
  } else if (message.content.includes("hehe")) {
    await message.react("<:hehe:1307038056141815880>");
  } else if (
    message.content.includes("crazy") ||
    message.content.includes("wth") ||
    message.content.includes("omg")
  ) {
    await message.reply("<:psych:1307394614948397137>");
  } else if (message.content.includes("good morning")) {
    await message.reply(
      "https://media.giphy.com/media/kYNVwkyB3jkauFJrZA/giphy.gif",
    );
  }
});

client.login(token);
