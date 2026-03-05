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
import { createCanvas, loadImage } from "canvas";

dotenv.config();
const { TOKEN } = process.env;

/* ---------------- AVATAR COMBINER ---------------- */

async function combineAvatars(avatar1, avatar2) {
  const canvas = createCanvas(512, 256);
  const ctx = canvas.getContext("2d");
  
  const img1 = await loadImage(avatar1);
  const img2 = await loadImage(avatar2);

  ctx.drawImage(img1, 0, 0, 256, 256);
  ctx.drawImage(img2, 256, 0, 256, 256);

  return canvas.toBuffer();
}

/* ---------------- DISCORD CLIENT ---------------- */

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

/* ---------------- BOT STATUS ---------------- */

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

/* ---------------- READY EVENT ---------------- */

client.once("ready", () => {
  console.log("=================================");
  console.log(`✅ Bot online as ${client.user.tag}`);
  console.log(`🆔 Bot ID: ${client.user.id}`);
  console.log(`📦 Loaded Commands: ${client.commands.size}`);
  console.log("=================================");
});

/* ---------------- SLASH COMMAND HANDLER ---------------- */

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

/* ---------------- MESSAGE COMMANDS ---------------- */

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  /* ---------- GUESS GAME ---------- */

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
  /* ---------- PFP COMMAND ---------- */

  if (message.content.toLowerCase().startsWith("?pfp")) {
    if (!message.guild) return;

    const args = message.content.slice(4).trim().split(/\s+/);

    let users = [];

    try {
      const members = await message.guild.members.fetch();

      for (const arg of args) {
        if (message.mentions.users.size > 0) {
          users = [...message.mentions.users.values()];
          break;
        }

        const search = arg.replace(/^@/, "").toLowerCase();

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

        if (found) users.push(found.user);
      }
    } catch (err) {
      console.error(err);
      return message.reply("❌ Error fetching users.");
    }

    if (users.length === 0) users = [message.author];

    if (users.length > 2) {
      return message.reply("❌ Please specify at most 2 users.");
    }

    /* ----- TWO USERS (MERGED AVATAR) ----- */

    if (users.length === 2) {
      const avatar1 = users[0].displayAvatarURL({
        size: 512,
        extension: "png",
      });

      const avatar2 = users[1].displayAvatarURL({
        size: 512,
        extension: "png",
      });

      const buffer = await combineAvatars(avatar1, avatar2);

      const member1 = await message.guild.members.fetch(users[0].id);
      const member2 = await message.guild.members.fetch(users[1].id);

      return message.reply({
        content: `${member1.displayName} <a:ghostlovehearts:1479043244380913675> ${member2.displayName}`,
        files: [{ attachment: buffer, name: "avatars.png" }],
      });
    }

    /* ----- SINGLE USER ----- */

    const user = users[0];
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

/* ---------------- LOGIN ---------------- */

client.login(TOKEN);
