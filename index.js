const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  ChannelType
} = require("discord.js");

const TOKEN = process.env.DISCORD_TOKEN;

if (!TOKEN) {
  console.error("❌ DISCORD_TOKEN غير موجود!");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ======================
// البيانات
// ======================

const points = new Map();
const warnings = new Map();
const attendance = new Map();

// ======================
// دوال
// ======================

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
  return message.member.permissions.has(
    PermissionsBitField.Flags.ManageGuild
  );
}

// ======================
// تشغيل البوت
// ======================

client.once("ready", () => {
  console.log("================================");
  console.log(`✅ Altra-Bot Online: ${client.user.tag}`);
  console.log("🤖 الأوامر العربية جاهزة!");
  console.log("================================");
});

// ======================
// استقبال الأوامر
// ======================

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;
  if (!message.content.startsWith("!")) return;

  const parts = message.content.slice(1).trim().split(/\s+/);

  const command = parts.shift();

  if (!command) return;

  try {

    // ======================
    // !بنق
    // ======================

    if (command === "بنق") {
      return message.reply(
        `🏓 Pong!\n⚡ سرعة البوت: ${client.ws.ping}ms`
      );
    }

    // ======================
    // !مساعدة
    // ======================

    if (command === "مساعدة" || command === "اوامر") {
      return message.reply(`
🤖 **Altra-Bot**

━━━━━━━━━━━━━━

👤 **أوامر الأعضاء**

!نقاط
!راتب
!كليم
!رتبتي
!احصائياتي

━━━━━━━━━━━━━━

🎫 **التذاكر**

!تذكرة
!اغلاق
!اضافة @عضو
!ازالة @عضو

━━━━━━━━━━━━━━

⭐ **النقاط**

!توب

━━━━━━━━━━━━━━

🛡️ **الإدارة**

!اعطاء-نقاط @عضو 10
!خصم-نقاط @عضو 10
!تصفير-نقاط @عضو
!تحذير @عضو

━━━━━━━━━━━━━━

📋 **الحضور**

!حضور
!غياب

━━━━━━━━━━━━━━

🤖 **عام**

!بنق
!مساعدة
`);
    }

    // ======================
    // !نقاط
    // ======================

    if (command === "نقاط") {
      const amount = getPoints(message.author.id);

      return message.reply(
        `⭐ **نقاطك**\n\n👤 ${message.author}\n⭐ النقاط: **${amount}**`
      );
    }

    // ======================
    // !راتب
    // ======================

    if (command === "راتب") {
      const amount = getPoints(message.author.id);
      const salary = amount * 100;

      return message.reply(
        `💰 **راتبك**\n\n⭐ النقاط: **${amount}**\n💵 الراتب: **${salary}**`
      );
    }

    // ======================
    // !كليم
    // ======================

    if (command === "كليم") {
      const amount = getPoints(message.author.id);

      if (amount <= 0) {
        return message.reply(
          "❌ ليس لديك نقاط لاستلام الراتب."
        );
      }

      const salary = amount * 100;

      setPoints(message.author.id, 0);

      return message.reply(
        `💰 **تم استلام الراتب!**\n\n💵 المبلغ: **${salary}**\n⭐ نقاطك أصبحت: **0**`
      );
    }

    // ======================
    // !رتبتي
    // ======================

    if (command === "رتبتي") {
      const amount = getPoints(message.author.id);

      let rank = "👤 عضو";

      if (amount >= 1000) {
        rank = "🏆 إداري متقدم";
      } else if (amount >= 500) {
        rank = "⭐ إداري";
      } else if (amount >= 250) {
        rank = "🛡️ مشرف";
      } else if (amount >= 100) {
        rank = "📋 مساعد";
      } else if (amount >= 50) {
        rank = "🔰 متدرب";
      }

      return message.reply(
        `🏅 **رتبتك**\n\n${rank}\n⭐ النقاط: **${amount}**`
      );
    }

    // ======================
    // !احصائياتي
    // ======================

    if (command === "احصائياتي") {
      const pts = getPoints(message.author.id);
      const warn = getWarnings(message.author.id);
      const status =
        attendance.get(message.author.id) || "غير مسجل";

      return message.reply(`
📊 **إحصائياتك**

⭐ النقاط: **${pts}**
⚠️ التحذيرات: **${warn}**
📋 الحضور: **${status}**
`);
    }

    // ======================
    // !اعطاء-نقاط
    // ======================

    if (command === "اعطاء-نقاط") {

      if (!isAdmin(message)) {
        return message.reply("❌ هذا الأمر للإدارة فقط.");
      }

      const user = message.mentions.users.first();
     
