import { CommandInteraction, User } from "discord.js";
import { Warning } from "../entities/Warning"; // adjust the import path according to your project structure
import { AppDataSource } from "../database"; // adjust the import path according to your project structure

export async function handleWarning(interaction: CommandInteraction) {
  if (!interaction.isChatInputCommand()) return; // Type guard

  if (interaction.commandName === "warn") {
    const user = interaction.options.getUser("user") as User; // Assertion for proper typing
    const reason = interaction.options.getString("reason");
    const moderator = interaction.user.username;

    if (user && reason) {
      const warning = new Warning();
      warning.username = user.username;
      warning.reason = reason;
      warning.moderator = moderator;

      const warningRepository = AppDataSource.getRepository(Warning);
      await warningRepository.save(warning);
      await interaction.reply(`Warned ${user.username} for ${reason}`);
    } else {
      await interaction.reply("Please provide a user and reason.");
    }
  }
}
