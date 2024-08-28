import { Client, GatewayIntentBits, Message } from "discord.js";
import data from "./models.js";
import dotenv from 'dotenv'

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log("Bot is online");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return "";
  if (message.content.endsWith("bish spongebob")) {
    message.react("😭") && message.reply(`this looks like ${data[1]}`);
  }
  if (message.content == "what am i" || message.content == "what i am") {
    message.reply({
      content: "You are a Human bish !",
    });
  } else if (message.content.includes("tdd")) {
    message.reply({
      content: "I think she is at Gym",
    });
  } else if (message.content.includes("jr")) {
    message.reply({
      content: "He is prob staring at the screen 🤣",
    });
  } else if (message.content == "hi pial") {
    message.reply({
      content: "ahh crap is he online ?",
    });
  }

  if (message.reference) {
    try {
      const messageReplied = await message.channel.messages.fetch(
        message.reference.messageId
      );

      if (
        messageReplied.author.id === client.user.id &&
        message.content == "boo"
      ) {
        await message.reply("Yeah it looks workiing ");
      } else if (
        messageReplied.author.id === client.user.id &&
        message.content.includes("which screen")
      ) {
        await message.reply("idk prob some instagram haha ");
      }
    } catch (e) {
      console.log(e);
    }
  }
});

client.login(process.env.TOKEN);
