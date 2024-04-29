import { VoiceState } from "discord.js";
import { AppDataSource } from "../database";
import { VoiceActivity } from "../entities/VoiceActivity";
import { handleRolePromotion } from "./utility/promote";
import BotClient from "../BotClient";

export async function handleVoiceActivity(
  oldState: VoiceState,
  newState: VoiceState,
  client: BotClient
) {
  console.log("Voice state update");
  const voiceActivityRespository = AppDataSource.getRepository(VoiceActivity);

  if (!oldState.channelId && newState.channelId && newState.member) {
    let voiceActivity = await voiceActivityRespository.findOne({
      where: { user_id: String(newState.member.id) },
    });

    console.log("newState", newState.member.id);
    console.log("Voice activity", voiceActivity?.user_id);

    if (!voiceActivity) {
      voiceActivity = new VoiceActivity();
      voiceActivity.user_id = String(newState.member.id);
      voiceActivity.guild_id = String(newState.guild.id);
      voiceActivity.total_voice_time = 0;
    }

    voiceActivity.current_session_start = new Date();

    await voiceActivityRespository.save(voiceActivity);
  } else if (oldState.channelId && !newState.channelId) {
    if (!oldState.member) return;
    let voiceActivity = await voiceActivityRespository.findOne({
      where: { user_id: String(oldState.member.id) },
    });

    if (voiceActivity) {
      const now = new Date();
      const timeInChannel = Math.round(
        (now.getTime() - voiceActivity.current_session_start!.getTime()) / 1000
      );
      console.log("Time in channel", timeInChannel);

      // Increment total_voice_time in the database
      await voiceActivityRespository.increment(
        { user_id: voiceActivity.user_id },
        "total_voice_time",
        timeInChannel
      );

      // Reload voiceActivity from the database
      voiceActivity = await voiceActivityRespository.findOne({
        where: { user_id: String(oldState.member.id) },
      });

      if (!voiceActivity) return;
      voiceActivity.current_session_start = undefined;
      if (voiceActivity.total_voice_time < 60) {
        voiceActivity.current_role_id = 1;
      }

      await voiceActivityRespository.save(voiceActivity);
      handleRolePromotion(voiceActivity.user_id, client);
    }
  }
}
