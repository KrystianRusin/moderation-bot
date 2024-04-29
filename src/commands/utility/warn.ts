import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warns a user and logs the warning.")
    .addUserOption((option: any) =>
      option
        .setName("user")
        .setDescription("The user to warn")
        .setRequired(true)
    )
    .addStringOption((option: any) =>
      option
        .setName("reason")
        .setDescription("The reason for the warning")
        .setRequired(true)
    )
    .toJSON(),
  async execute(interaction: CommandInteraction) {
    await interaction.reply("This command is not implemented yet.");
  },
};
