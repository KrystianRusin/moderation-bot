import "dotenv/config";
import BotClient from "./BotClient";
import { initializeDatabase } from "./database";
import { AppDataSource } from "./database";
import { BannedWord } from "./entities/BannedWord";
import { handleWarning } from "./commands/warnCommand";
import { CommandInteraction, PartialGuildMember } from "discord.js";
import { GuildMember } from "discord.js";
import Warn from "./commands/utility/warn";
import { Users } from "./entities/Users";
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

client.on("guildMemberAdd", async (member: GuildMember) => {
  const userRepository = AppDataSource.getRepository(Users);
  // Create a new Users entity
  const user = new Users();
  user.user_id = member.id;
  user.username = member.user.username;
  user.date_joined = new Date();
  user.warning_count = 0;
  user.time_spent_in_voice = 0;

  // Save the new user to the database
  await userRepository.save(user);
});

client.on(
  "guildMemberRemove",
  async (member: GuildMember | PartialGuildMember) => {
    console.log("User left the server");
    const userRepository = AppDataSource.getRepository(Users);

    // Find the user in the database
    const user = await userRepository.findOne({
      where: { user_id: member.id },
    });

    // If the user is found, delete them from the database
    if (user) {
      await userRepository.remove(user);
    }
  }
);

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const messageContent = message.content.toLowerCase();

  // Check if any of the words in args are in the bannedWords.words array
  const containsBannedWord = bannedWords.some((bannedWord) =>
    messageContent.includes(bannedWord.words.toLowerCase())
  );
  if (containsBannedWord) {
    message.delete();
    const warningMessage = await message.channel.send(
      `${message.author.toString()} That word is banned!`
    );
    setTimeout(() => warningMessage.delete(), 5000);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  handleWarning(interaction as CommandInteraction);
});

client.on("voiceStateUpdate", async (oldState, newState) => {
  handleVoiceActivity(oldState, newState, client);
});

client.on("ready", async () => {
  console.log(`Logged in as ${client.user?.tag}`);
  bannedWords = await getWords();
  const guildId = process.env.GUILD_ID as string;
  await client.guilds.cache.get(guildId)?.commands.set([Warn.data]);
});
