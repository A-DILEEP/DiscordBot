import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("color")
    .setDescription("Assigns a color role to the user")
    .addStringOption((option) =>
      option
        .setName("color")
        .setDescription("Choose a color")
        .setRequired(true)
        .addChoices(
          { name: "Red", value: "Red" },
          { name: "Blue", value: "Blue" },
          { name: "Green", value: "Green" }
        )
    ),
  async execute(interaction) {
    const color = interaction.options.getString("color");
    const guild = interaction.guild;
    const member = interaction.member;

    try {
      const role = guild.roles.cache.find((r) => r.name === color);

      if (!role) {
        return interaction.reply({
          content: `Role not found: ${color}`,
          ephemeral: true,
        });
      }

      const colorRoles = ["Red", "Blue", "Green"];
      const rolesToRemove = member.roles.cache.filter((r) =>
        colorRoles.includes(r.name)
      );

      await member.roles.remove(rolesToRemove);

      await member.roles.add(role);
      await interaction.reply({
        content: `You have been assigned the **${color}** role!`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error assigning the role.",
        ephemeral: true,
      });
    }
  },
};
