import {
  Client,
  GatewayIntentBits,
  Collection,
  ActivityType,
} from "discord.js";
import dotenv from "dotenv";
import { loadCommands } from "./handlers/commandLoader.js";
import { activeGames } from "./commands/guess.js";
import { handleC4Button } from "./commands/C4/C4.js";

dotenv.config();
const { TOKEN } = process.env;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();
await loadCommands(client, "./commands");

const statuses = [
  "Listening to your commands 🎧",
  "Laughing at your typos 😂",
  "Roasting noobs 🔥",
  "Do you get Dejavu.....",
  "Hacking the mainframe... jk",
];

let statusIndex = 0;
setInterval(() => {
  if (!client.user) return;
  client.user.setActivity(statuses[statusIndex % statuses.length], {
    type: ActivityType.Watching,
  });
  statusIndex++;
}, 10000);

client.once("ready", () => {
  console.log("=================================");
  console.log(`✅ Bot online as ${client.user.tag}`);
  console.log(`🆔 Bot ID: ${client.user.id}`);
  console.log(`📦 Loaded Commands: ${client.commands.size}`);
  console.log("=================================");
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isButton()) {
    return handleC4Button(interaction);
  }

  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`❌ Error executing ${interaction.commandName}`, error);

    const reply = {
      content: "❌ There was an error while executing this command.",
      ephemeral: true,
    };

    if (interaction.replied || interaction.deferred)
      await interaction.followUp(reply);
    else await interaction.reply(reply);
  }
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const game = activeGames.get(message.channel.id);
  if (game && /^\d+$/.test(message.content)) {
    const guess = parseInt(message.content, 10);
    if (guess < 1 || guess > 100) return;

    game.attempts++;

    if (guess === game.targetNumber) {
      const time = Math.floor((Date.now() - game.startTime) / 1000);
      activeGames.delete(message.channel.id);

      return message.reply(
        `🎉 **${message.author.username} guessed it right!**\n\n` +
          `🎯 Number: **${guess}**\n` +
          `📊 Attempts: ${game.attempts}\n` +
          `⏱ Time: ${time}s`,
      );
    }

    return message.reply(
      guess < game.targetNumber
        ? "📉 Too low! Try higher ⬆️"
        : "📈 Too high! Try lower ⬇️",
    );
  }

  if (message.content.toLowerCase().startsWith("?pfp")) {
    if (!message.guild) return;

    let user = message.author;
    const args = message.content.slice(4).trim();

    if (args) {
      try {
        if (message.mentions.users.size > 0) {
          user = message.mentions.users.first();
        } else {
          const search = args.replace(/^@/, "").toLowerCase();
          const members = await message.guild.members.fetch();

          const found =
            members.find(
              (m) =>
                m.user.username.toLowerCase() === search ||
                m.nickname?.toLowerCase() === search ||
                m.user.globalName?.toLowerCase() === search,
            ) ||
            members.find(
              (m) =>
                m.user.username.toLowerCase().includes(search) ||
                m.nickname?.toLowerCase().includes(search) ||
                m.user.globalName?.toLowerCase().includes(search),
            );

          if (!found) {
            return message.reply(`❌ User **${args}** not found.`);
          }

          user = found.user;
        }
      } catch (err) {
        console.error(err);
        return message.reply("❌ Error fetching user.");
      }
    }

    const member = await message.guild.members.fetch(user.id);

    return message.reply({
      embeds: [
        {
          author: {
            name: `${member.displayName}'s Avatar`,
            icon_url: member.displayAvatarURL({ dynamic: true }),
          },
          image: {
            url: member.displayAvatarURL({ size: 1024, dynamic: true }),
          },
          color: 0xf0e000,
          footer: {
            text: `Requested by ${message.member.displayName}`,
            icon_url: message.member.displayAvatarURL({ dynamic: true }),
          },
        },
      ],
    });
  }
});

client.login(TOKEN);
