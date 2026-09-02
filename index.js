const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  ChannelType,
  EmbedBuilder
} = require("discord.js");

// ==================================================
// إعداد البوت
// ==================================================

const TOKEN = process.env.DISCORD_TOKEN;

if (!TOKEN) {
  console.error("❌ متغير DISCORD_TOKEN غير موجود في Railway!");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// ==================================================
// البيانات
// ==================================================

const points = new Map();
const warnings = new Map();
const attendance = new Map();

// ==================================================
// الإعدادات
// ==================================================

const PREFIX = "!";

// كل نقطة = 100
const SALARY_PER_POINT = 100;

// ==================================================
// دوال مساعدة
// ==================================================

function getPoints(id) {
  return points.get(id) || 0;
}

function setPoints(id, amount) {
  points.set(id, Math.max(0, amount));
}

function getWarnings(id) {
  return warnings.get(id) || 0;
}

function isAdmin(message) {
  return message.member?.permissions.has(
    PermissionsBitField.Flags.ManageGuild
  );
}

function embed(title, description) {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setTimestamp()
    .setFooter({
      text: "Altra-Bot • نظام الإدارة"
    });
}

function errorEmbed(text) {
  return embed("❌ حدث خطأ", text);
}

function successEmbed(text) {
  return embed("✅ تمت العملية", text);
}

// ==================================================
// تشغيل البوت
// ==================================================

client.once("ready", () => {
  console.log("====================================");
  console.log(`🤖 Altra-Bot Online: ${client.user.tag}`);
  console.log(`📡 السيرفرات: ${client.guilds.cache.size}`);
  console.log("✅ النظام العربي جاهز!");
  console.log("====================================");
});

// ==================================================
// استقبال الأوامر
// ==================================================

client.on("messageCreate", async (message) => {
  try {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content
      .slice(PREFIX.length)
      .trim()
      .split(/\s+/);

    const command = args.shift()?.toLowerCase();

    if (!command) return;

    // ==================================================
    // بنق
    // ==================================================

    if (command === "بنق" || command === "ping") {
      return message.reply({
        embeds: [
          embed(
            "🏓 سرعة Altra-Bot",
            `⚡ سرعة البوت: **${client.ws.ping}ms**\n\n🟢 البوت يعمل بشكل طبيعي.`
          )
        ]
      });
    }

    // ==================================================
    // المساعدة
    // ==================================================

    if (
      command === "مساعدة" ||
      command === "اوامر" ||
      command === "أوامر"
    ) {
      return message.reply({
        embeds: [
          embed(
            "🤖 أوامر Altra-Bot",
            `
━━━━━━━━━━━━━━━━━━━━

👤 **أوامر الأعضاء**

\`!نقاط\`
عرض نقاطك ⭐

\`!راتبي\`
عرض راتبك 💰

\`!ك
