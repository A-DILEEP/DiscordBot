import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("junior")
    .setDescription("who is Junior"),
  async execute(interaction) {
    await interaction.reply("ahh he's a noob!");
  },
};
