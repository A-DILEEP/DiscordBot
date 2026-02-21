import { SlashCommandBuilder } from "discord.js";
import { activeRiddleGames } from "./state/riddleState.js";

export default {
  data: new SlashCommandBuilder()
    .setName("riddlehint")
    .setDescription("Get a hint (requires Riddle role)"),

  async execute(interaction) {
    const game = activeRiddleGames.get(interaction.channelId);

    if (!game || !game.active) {
      return interaction.reply({
        content: "❌ No active game!",
        ephemeral: true,
      });
    }

    if (!interaction.member.roles.cache.some((r) => r.name === "Riddle")) {
      return interaction.reply({
        content: "❌ You need the Riddle role!",
        ephemeral: true,
      });
    }

    if (game.hintCount <= 0) {
      return interaction.reply({
        content: "❌ No hints remaining!",
        ephemeral: true,
      });
    }

    const used = game.currentRiddle.hints.length - game.hintCount;
    const hint = game.currentRiddle.hints[Math.max(0, used)];

    game.hintCount--;

    await interaction.reply(`💡 **Hint:** ${hint}`);
  },
};
