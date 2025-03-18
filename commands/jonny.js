import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("Junior")
    .setDescription("who is Junior"),
  async execute(interaction) {
    await interaction.reply("ahh he's a noob!");
  },
};
