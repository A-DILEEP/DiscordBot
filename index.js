import { Client, GatewayIntentBits, Message } from "discord.js";
import data from "./models.js";
import dotenv from "dotenv";

dotenv.config();
const channelID = "1301871778221658152";

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
  //if (message.channel.id !== channelID) return "";
  if (message.author.bot) return "";
  if (message.content.endsWith("bish spongebob")) {
    message.react("😭") && message.reply(`Dont be mean to me !`);
  }
  if (message.content == "what am i" || message.content == "what i am") {
    message.reply({
      content: "You are a Noob bish ! 😂 ",
    });
  } else if (message.content.includes("tdd")) {
    message.reply({
      content: "I think she is at Gym",
    });
  } else if (message.content.includes("jr")) {
    message.reply({
      content: `He is prob staring at the screen haha`,
    });
  } else if (message.content.includes("rave")) {
    message.reply({
      content: `are you calling the person who like toes ? 🤔`,
    });
  } else if (message.content.includes("jonny")) {
    message.reply({
      content: "Oh is that noob online ? ",
    });
  } else if (message.content.includes(":pan:")) {
    message.reply({
      content: "Go shove that pan in another place ",
    });
  } else if (message.content.includes("trix")) {
    message.reply({
      content: "she is a kidnapper 😨 ",
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
        await message.reply("👻👻");
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

client.login(
  ""
);
