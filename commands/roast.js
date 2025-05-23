import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("roast")
    .setDescription("Roasts the mentioned user")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Who gets roasted?")
        .setRequired(true)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("target");
    const roasts = [
      "You're not stupid; you just have bad luck thinking.",
      "Your secrets are safe with me. I never even listen when you talk.",
      "You're like a cloud. When you disappear, it's a beautiful day.",
    ];
    const roast = roasts[Math.floor(Math.random() * roasts.length)];
    await interaction.reply(`${user}, ${roast}`);
  },
};
