import "dotenv/config";
import BotClient from "./BotClient";
import { initializeDatabase } from "./database";
import { AppDataSource } from "./database";
import { BannedWord } from "./entities/BannedWord";
import { handleWarning } from "./commands/warnCommand";
import { CommandInteraction } from "discord.js";
import Warn from "./commands/utility/warn";
import { handleVoiceActivity } from "./commands/voiceActivity";

const client = new BotClient({
  intents: [
    "Guilds",
    "GuildMessages",
    "GuildMembers",
    "MessageContent",
    "GuildVoiceStates",
  ],
});

async function startBot() {
  // Initialize database first
  await initializeDatabase();

  // Log in to Discord
  client.login(process.env.TOKEN);
}

let bannedWords: BannedWord[] = [];
startBot(); // Start the bot

const getWords = async () => {
  const bannedWords = await AppDataSource.getRepository(BannedWord).find();
  console.log(bannedWords);
  return bannedWords;
};

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const messageContent = message.content.toLowerCase();

  // Check if any of the words in args are in the bannedWords.words array
  const containsBannedWord = bannedWords.some((bannedWord) =>
    messageContent.includes(bannedWord.words.toLowerCase())
  );
  if (containsBannedWord) {
    message.delete();
    message.channel.send(`${message.author.toString()} That word is banned!`);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  handleWarning(interaction as CommandInteraction);
});

client.on("voiceStateUpdate", async (oldState, newState) => {
  handleVoiceActivity(oldState, newState);
});

client.on("ready", async () => {
  console.log(`Logged in as ${client.user?.tag}`);
  bannedWords = await getWords();
  const guildId = process.env.GUILD_ID as string;
  await client.guilds.cache.get(guildId)?.commands.set([Warn.data]);
});
