import { VoiceState } from "discord.js";
import { AppDataSource } from "../database";
import { VoiceChatRole } from "../entities/VoiceRoles";
import { Users } from "../entities/Users";
import BotClient from "../BotClient";

export async function handleVoiceActivity(
  oldState: VoiceState,
  newState: VoiceState,
  client: BotClient
) {
  console.log("Voice state update");
  const userRespository = AppDataSource.getRepository(Users);
  const roleRepository = AppDataSource.getRepository(VoiceChatRole);

  // If the user joins a voice channel
  if (!oldState.channelId && newState.channelId && newState.member) {
    let currentUser = await userRespository.findOne({
      where: { user_id: String(newState.member.id) },
    });

    console.log("newState", newState.member.id);

    if (!currentUser) return;

    // If the user has never joined a voice channel before set time spent in vc to 0
    if (!currentUser.time_spent_in_voice) {
      currentUser.time_spent_in_voice = 0;
    }

    // Initialize new voice session and save it to the database
    currentUser.current_voice_session_start = new Date();
    await userRespository.save(currentUser);

    // If the user leaves a voice channel
  } else if (oldState.channelId && !newState.channelId) {
    if (!oldState.member) return;
    let currentUser = await userRespository.findOne({
      where: { user_id: String(oldState.member.id) },
    });

    if (!currentUser) return;

    if (currentUser.current_voice_session_start) {
      const now = new Date();
      const timeInChannel = Math.round(
        (now.getTime() - currentUser.current_voice_session_start!.getTime()) /
          1000
      );
      console.log("Time in channel", timeInChannel);

      // Increment total_voice_time in the database
      await userRespository.increment(
        { user_id: currentUser.user_id },
        "time_spent_in_voice",
        timeInChannel
      );

      // Reload voiceActivity from the database
      currentUser = await userRespository.findOne({
        where: { user_id: String(oldState.member.id) },
      });

      if (!currentUser) return;
      currentUser.current_voice_session_start = undefined;
      // Retrieve the roles from the voice_chat_roles table
      const roles = await roleRepository.find();

      // Find the role that the user's time_spent_in_voice satisfies
      const role = roles.find(
        (role) =>
          currentUser &&
          currentUser.time_spent_in_voice >= role.time_requirement
      );

      if (role) {
        // Update the user's voice_chat_role_id with the role_id of the found role
        currentUser.voice_chat_role_id = role;

        await userRespository.save(currentUser);
      }
    }
  }
}
