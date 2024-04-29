import { VoiceState } from "discord.js";
import { AppDataSource } from "../database";
import { VoiceActivity } from "../entities/VoiceActivity";

export async function handleVoiceActivity(
  oldState: VoiceState,
  newState: VoiceState
) {
  console.log("Voice state update");
  const voiceActivityRespository = AppDataSource.getRepository(VoiceActivity);

  if (!oldState.channelId && newState.channelId && newState.member) {
    let voiceActivity = await voiceActivityRespository.findOne({
      where: { user_id: Number(newState.member.id) },
    });

    if (!voiceActivity) {
      voiceActivity = new VoiceActivity();
      voiceActivity.user_id = Number(newState.member.id);
      voiceActivity.guild_id = Number(newState.guild.id);
      voiceActivity.total_voice_time = 0;
    }

    voiceActivity.current_session_start = new Date();

    await voiceActivityRespository.save(voiceActivity);
  } else if (oldState.channelId && !newState.channelId) {
    if (!oldState.member) return;
    let voiceActivity = await voiceActivityRespository.findOne({
      where: { user_id: Number(oldState.member.id) },
    });

    if (voiceActivity) {
      const now = new Date();
      const timeInChannel = Math.round(
        (now.getTime() - voiceActivity.current_session_start!.getTime()) / 1000
      );
      voiceActivity.total_voice_time += timeInChannel;
      voiceActivity.current_session_start = undefined;

      await voiceActivityRespository.save(voiceActivity);
    }
  }
}
