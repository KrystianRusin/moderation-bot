import { AppDataSource } from "../../database";
import { VoiceActivity } from "../../entities/VoiceActivity";
import { VoiceChatRole } from "../../entities/VoiceRoles";
import BotClient from "../../BotClient";

export async function handleRolePromotion(user_id: String, client: BotClient) {
  const voiceActivityRepository = AppDataSource.getRepository(VoiceActivity);
  const voiceChatRoleRepository = AppDataSource.getRepository(VoiceChatRole);
  let voiceActivity = await voiceActivityRepository.findOne({
    where: { user_id: String(user_id) },
  });

  if (!voiceActivity) return;

  let currentRole = await voiceChatRoleRepository.findOne({
    where: { role_id: voiceActivity.current_role_id },
  });

  if (!currentRole) return;
  let nextRoleId = Number(currentRole.role_id) + 1;
  let nextRole = await voiceChatRoleRepository.findOne({
    where: { role_id: nextRoleId },
  });

  if (!nextRole) return;

  if (voiceActivity.total_voice_time >= nextRole.time_requirement) {
    console.log("Promoting user to", nextRole.role_name);
    await voiceActivityRepository.update(
      { user_id: String(user_id) },
      { current_role_id: nextRole.role_id }
    );

    console.log("Guild ID", voiceActivity.guild_id);
    const guild = client.guilds.cache.get(process.env.GUILD_ID as string);
    if (!guild) {
      console.log("Guild not found");
      return;
    }
    console.log(guild);

    console.log("User ID", user_id);
    const member = guild.members.cache.get(user_id.toString());
    if (!member) {
      console.log("Member not found");
      return;
    }
    console.log(member);

    // Find the role by its name
    const role = guild.roles.cache.find(
      (role) => role.name === nextRole.role_name
    );
    if (!role) return;

    // Add the role to the member
    await member.roles.add(role);
  }
}
