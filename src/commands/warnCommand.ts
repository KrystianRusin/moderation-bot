import { CommandInteraction, User } from "discord.js";
import { Warning } from "../entities/Warning";
import { Users } from "../entities/Users";
import { AppDataSource } from "../database";

export async function handleWarning(interaction: CommandInteraction) {
  if (!interaction.isChatInputCommand()) return; // Type guard

  if (interaction.commandName === "warn") {
    const user = interaction.options.getUser("user") as User;
    const reason = interaction.options.getString("reason");
    const moderator = interaction.user;

    if (user && reason) {
      const warning = new Warning();
      warning.user_id = user.id;
      warning.reason = reason;
      warning.moderator_id = moderator.id;

      const warningRepository = AppDataSource.getRepository(Warning);
      const userRepository = AppDataSource.getRepository(Users);

      await warningRepository.save(warning);
      await interaction.reply(`Warned ${user.username} for ${reason}`);
      await userRepository.increment({ user_id: user.id }, "warning_count", 1);
    } else {
      await interaction.reply("Please provide a user and reason.");
    }
  }
}
