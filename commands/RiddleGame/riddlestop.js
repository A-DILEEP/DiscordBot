import { SlashCommandBuilder } from "discord.js";
import { activeRiddleGames } from "./state/riddleState.js";

export default {
  data: new SlashCommandBuilder()
    .setName("riddlestop")
    .setDescription("Stop the current riddle game"),

  async execute(interaction) {
    const game = activeRiddleGames.get(interaction.channelId);

    if (!game) {
      return interaction.reply({ content: "❌ No active game!", ephemeral: true });
    }

    if (interaction.user.id !== game.starterId) {
      return interaction.reply({
        content: "❌ Only the starter can stop the game!",
        ephemeral: true,
      });
    }

    game.active = false;
    activeRiddleGames.delete(interaction.channelId);

    await interaction.reply("🛑 Riddle game stopped.");
  },
};