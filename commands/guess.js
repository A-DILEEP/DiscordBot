import { SlashCommandBuilder } from "discord.js";

// Store active games (in production, use a database)
const activeGames = new Map();

export default {
  data: new SlashCommandBuilder()
    .setName("guess")
    .setDescription("Play a number guessing game!")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("start")
        .setDescription("Start a new guessing game (1-100)"),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("number")
        .setDescription("Guess a number")
        .addIntegerOption((option) =>
          option
            .setName("number")
            .setDescription("Your guess (1-100)")
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(100),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("stop").setDescription("Stop the current game"),
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const channelId = interaction.channelId;
    const userId = interaction.user.id;

    if (subcommand === "start") {
      if (activeGames.has(channelId)) {
        return await interaction.reply(
          "A game is already running in this channel! Use `/guess stop` to end it first.",
        );
      }

      const targetNumber = Math.floor(Math.random() * 100) + 1;
      activeGames.set(channelId, {
        targetNumber,
        attempts: 0,
        players: new Map(),
        startTime: Date.now(),
      });

      await interaction.reply(
        `🎯 **Number Guessing Game Started!**\nI'm thinking of a number between 1 and 100.\nUse \`/guess number\` to make your guess!\n\nGood luck! 🍀`,
      );
    } else if (subcommand === "number") {
      const game = activeGames.get(channelId);
      if (!game) {
        return await interaction.reply(
          "No active game in this channel! Use `/guess start` to begin a new game.",
        );
      }

      const guess = interaction.options.getInteger("number");
      game.attempts++;

      if (!game.players.has(userId)) {
        game.players.set(userId, { attempts: 0, guesses: [] });
      }
      const playerData = game.players.get(userId);
      playerData.attempts++;
      playerData.guesses.push(guess);

      if (guess === game.targetNumber) {
        const totalTime = Math.floor((Date.now() - game.startTime) / 1000);
        const winner = interaction.user;

        activeGames.delete(channelId);

        await interaction.reply(
          `🎉 **Congratulations ${winner}!**\n\nYou guessed **${guess}** correctly! 🎯\n\n📊 **Game Stats:**\n• Total attempts: ${game.attempts}\n• Your attempts: ${playerData.attempts}\n• Time taken: ${totalTime} seconds\n\nUse \`/guess start\` to play again!`,
        );
      } else if (guess < game.targetNumber) {
        await interaction.reply(
          `📉 **${guess}** is too low! Try higher! ⬆️\n\nAttempts so far: ${game.attempts}`,
        );
      } else {
        await interaction.reply(
          `📈 **${guess}** is too high! Try lower! ⬇️\n\nAttempts so far: ${game.attempts}`,
        );
      }
    } else if (subcommand === "stop") {
      if (!activeGames.has(channelId)) {
        return await interaction.reply("No active game to stop!");
      }

      const game = activeGames.get(channelId);
      activeGames.delete(channelId);

      await interaction.reply(
        `🛑 **Game Stopped!**\nThe number was: **${game.targetNumber}**\n\nUse \`/guess start\` to begin a new game!`,
      );
    }
  },
};
