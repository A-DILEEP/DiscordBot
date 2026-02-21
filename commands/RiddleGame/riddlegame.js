import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import riddles from "./riddles.json" assert { type: "json" };
import newRiddles from "./newRiddles.json" assert { type: "json" };
import { activeRiddleGames } from "./state/riddleState.js";

const ALL_RIDDLES = [...riddles, ...newRiddles];
let riddlePool = [];

/* Shuffle */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function getRandomRiddle() {
  if (riddlePool.length === 0) {
    riddlePool = [...ALL_RIDDLES];
    shuffle(riddlePool);
  }
  return riddlePool.pop();
}

export default {
  data: new SlashCommandBuilder()
    .setName("riddlegame")
    .setDescription("Start a riddle survival game"),

  async execute(interaction) {
    const channelId = interaction.channelId;

    if (activeRiddleGames.has(channelId)) {
      return interaction.reply({
        content: "❌ A riddle game is already running!",
        ephemeral: true,
      });
    }

    const gameState = {
      starterId: interaction.user.id,
      active: true,
      lossCount: 0,
      maxLosses: 3,
      hintCount: 5,
      currentRiddle: null,
      scores: new Map(),
    };

    activeRiddleGames.set(channelId, gameState);
    await interaction.reply("🧩 **Riddle Survival Game Started!**");

    while (gameState.active && gameState.lossCount < gameState.maxLosses) {
      const riddle = getRandomRiddle();
      gameState.currentRiddle = riddle;

      const embed = new EmbedBuilder()
        .setTitle("🧠 RIDDLE TIME")
        .setDescription(
          `**${riddle.question}**\n\n` +
            `🎯 Difficulty: **${riddle.difficulty.toUpperCase()}**\n` +
            `📚 Category: **${riddle.category.toUpperCase()}**\n` +
            `⏱️ 30 seconds`,
        )
        .setFooter({
          text: `Misses: ${gameState.lossCount}/3 | Hints left: ${gameState.hintCount}`,
        });

      await interaction.channel.send({ embeds: [embed] });

      let solved = false;

      const collector = interaction.channel.createMessageCollector({
        filter: (m) => !m.author.bot,
        time: 30000,
      });

      collector.on("collect", (msg) => {
        if (solved) return;

        const guess = msg.content.toLowerCase().trim();
        const correct = riddle.answers.some((a) =>
          new RegExp(`\\b${a}\\b`).test(guess),
        );

        if (correct) {
          solved = true;
          collector.stop();

          const id = msg.author.id;
          const prev = gameState.scores.get(id) || {
            name: msg.author.username,
            points: 0,
          };

          gameState.scores.set(id, {
            name: prev.name,
            points: prev.points + 1,
          });

          msg.reply(`✅ Correct! **${riddle.answers[0]}** 🎉`);
        }
      });

      await new Promise((r) => collector.on("end", r));

      if (!solved) {
        gameState.lossCount++;
        await interaction.channel.send(
          `⏰ Time’s up!\n` +
            `✅ Answer: **${riddle.answers[0].toUpperCase()}**\n` +
            `💀 Misses: ${gameState.lossCount}/3`,
        );
      }

      await new Promise((r) => setTimeout(r, 2500));
    }

    activeRiddleGames.delete(channelId);

    await interaction.channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("🏆 GAME OVER")
          .setDescription("Thanks for playing!"),
      ],
    });
  },
};
