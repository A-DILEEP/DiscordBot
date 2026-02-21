import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show all available commands"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("🤖 Command Guide")
      .setDescription("Here’s what I can do 👇")
      .setColor(0x5865f2)
      .addFields(
        {
          name: "🧩 Riddle Survival",
          value:
            "`/riddlegame` – start the game\n" +
            "`/riddlehint` – use a hint\n" +
            "`/riddlestop` – stop the game",
          inline: false,
        },
        {
          name: "💣 Minesweeper",
          value: "`/minesweeper` – play classic minesweeper",
          inline: false,
        },
        {
          name: "🔥 Fun",
          value: "`/roast` – get roasted 😈\n" + "`/av` – view avatar",
          inline: false,
        },
      )
      .setFooter({
        text: "Use slash (/) commands to interact",
      });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
