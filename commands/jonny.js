import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("jonny")
    .setDescription("who da jonny"),
  async execute(interaction) {
    await interaction.reply("ahh he's a noob!");
  },
};
