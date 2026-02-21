import { SlashCommandBuilder } from "discord.js";

export const activeGames = new Map();

export default {
  data: new SlashCommandBuilder()
    .setName("guess")
    .setDescription("Play a number guessing game!")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("start")
        .setDescription("Start a new guessing game (1–100)"),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("stop").setDescription("Stop the current game"),
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const channelId = interaction.channelId;

    if (subcommand === "start") {
      if (activeGames.has(channelId)) {
        return interaction.reply({
          content:
            "❌ A game is already running in this channel! Use `/guess stop` first.",
          ephemeral: true,
        });
      }

      const targetNumber = Math.floor(Math.random() * 100) + 1;

      activeGames.set(channelId, {
        targetNumber,
        attempts: 0,
        starterId: interaction.user.id,
        startTime: Date.now(),
      });

      return interaction.reply(
        "🎯 **Number Guessing Game Started!**\n\n" +
          "I’m thinking of a number between **1 and 100**.\n" +
          "**Just type a number in chat** to guess 👀",
      );
    }

    // STOP
    const game = activeGames.get(channelId);
    if (!game) {
      return interaction.reply({
        content: "❌ No active guessing game in this channel.",
        ephemeral: true,
      });
    }

    if (interaction.user.id !== game.starterId) {
      return interaction.reply({
        content: "❌ Only the game starter can stop the game.",
        ephemeral: true,
      });
    }

    activeGames.delete(channelId);

    await interaction.reply(
      `🛑 **Game stopped!**\nThe number was **${game.targetNumber}**`,
    );
  },
};
