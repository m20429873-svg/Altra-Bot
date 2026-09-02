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
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
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
  return message.member?.permissions.has(
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
// الأوامر
// ======================

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;
  if (!message.content.startsWith("!")) return;

  const args = message.content
    .slice(1)
    .trim()
    .split(/\s+/);

  const command = args.shift();

  if (!command) return;

  try {

    // ======================
    // بنق
    // ======================

    if (command === "بنق" || command === "ping") {
      return message.reply(
        `🏓 Pong!\n⚡ سرعة البوت: **${client.ws.ping}ms**`
      );
    }

    // ======================
    // مساعدة
    // ======================

    if (
      command === "مساعدة" ||
      command === "اوامر" ||
      command === "أوامر"
    ) {
      return message.reply(`
🤖 **Altra-Bot**

━━━━━━━━━━━━━━━━

👤 **أوامر الأعضاء**

\`!نقاط\`
\`!راتب\`
\`!كليم\`
\`!رتبتي\`
\`!احصائياتي\`

🎫 **التذاكر**

\`!تذكرة\`
\`!اغلاق\`
\`!اضافة @عضو\`
\`!ازالة @عضو\`

⭐ **النقاط**

\`!توب\`

🛡️ **الإدارة**

\`!اعطاء-نقاط @عضو 10\`
\`!خصم-نقاط @عضو 10\`
\`!تصفير-نقاط @عضو\`
\`!تحذير @عضو\`
\`!ترقية @عضو\`
\`!تنزيل @عضو\`

📋 **الحضور**

\`!حضور\`
\`!غياب\`

━━━━━━━━━━━━━━━━
`);
    }

    // ======================
    // النقاط
    // ======================

    if (command === "نقاط") {
      const amount = getPoints(message.author.id);

      return message.reply(
        `⭐ **نقاطك**\n\n👤 ${message.author}\n⭐ النقاط: **${amount}**`
      );
    }

    // ======================
    // الراتب
    // ======================

    if (command === "راتب" || command === "راتبي") {
      const amount = getPoints(message.author.id);
      const salary = amount * 100;

      return message.reply(
        `💰 **راتبك**\n\n⭐ النقاط: **${amount}**\n💵 الراتب: **${salary}**`
      );
    }

    // ======================
    // كليم
    // ======================

    if (
      command === "كليم" ||
      command === "claim" ||
      command === "كلايم"
    ) {
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
    // رتبتي
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
    // إحصائياتي
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
    // إعطاء نقاط
    // ======================

    if (
      command === "اعطاء-نقاط" ||
      command === "اعطاءنقاط"
    ) {
      if (!isAdmin(message)) {
        return message.reply("❌ هذا الأمر للإدارة فقط.");
      }

      const user = message.mentions.users.first();
      const amount = Number(args[1]);

      if (
        !user ||
        !Number.isInteger(amount) ||
        amount <= 0
      ) {
        return message.reply(
          "❌ الاستخدام الصحيح:\n`!اعطاء-نقاط @عضو 10`"
        );
      }

      const total = getPoints(user.id) + amount;

      setPoints(user.id, total);

      return message.reply(
        `✅ تم إعطاء ${user} **${amount} نقطة**.\n⭐ نقاطه الآن: **${total}**`
      );
    }

    // ======================
    // خصم نقاط
    // ======================

    if (
      command === "خصم-نقاط" ||
      command === "خصمنقاط"
    ) {
      if (!isAdmin(message)) {
        return message.reply("❌ هذا الأمر للإدارة فقط.");
      }

      const user = message.mentions.users.first();
      const amount = Number(args[1]);

      if (
        !user ||
        !Number.isInteger(amount) ||
        amount <= 0
      ) {
        return message.reply(
          "❌ الاستخدام الصحيح:\n`!خصم-نقاط @عضو 10`"
        );
      }

      const total = Math.max(
        0,
        getPoints(user.id) - amount
      );

      setPoints(user.id, total);

      return message.reply(
        `✅ تم خصم **${amount} نقطة** من ${user}.\n⭐ نقاطه الآن: **${total}**`
      );
    }

    // ======================
    // تصفير النقاط
    // ======================

    if (
      command === "تصفير-نقاط" ||
      command === "تصفيرنقاط"
    ) {
      if (!isAdmin(message)) {
        return message.reply("❌ هذا الأمر للإدارة فقط.");
      }

      const user = message.mentions.users.first();

      if (!user) {
        return message.reply(
          "❌ الاستخدام الصحيح:\n`!تصفير-نقاط @عضو`"
        );
      }

      setPoints(user.id, 0);

      return message.reply(
        `♻️ تم تصفير نقاط ${user}.`
      );
    }

    // ======================
    // التوب
    // ======================

    if (command === "توب") {
      if (points.size === 0) {
        return message.reply(
          "📊 لا توجد نقاط مسجلة حتى الآن."
        );
      }

      const list = [...points.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      let text =
        "🏆 **أفضل الأعضاء بالنقاط**\n\n";

      for (let i = 0; i < list.length; i++) {
        const user = await client.users
          .fetch(list[i][0])
          .catch(() => null);

        text += `${i + 1}. ${
          user ? user.username : "عضو"
        } — ⭐ **${list[i][1]}**\n`;
      }

      return message.reply(text);
    }

    // ======================
    // تحذير
    // ======================

    if (command === "تحذير") {
      if (!isAdmin(message)) {
        return message.reply("❌ هذا الأمر للإدارة فقط.");
      }

      const user = message.mentions.users.first();

      if (!user) {
        return message.reply(
          "❌ الاستخدام الصحيح:\n`!تحذير @عضو`"
        );
      }

      const total = getWarnings(user.id) + 1;

      warnings.set(user.id, total);

      return message.reply(
        `⚠️ تم تحذير ${user}.\nعدد التحذيرات: **${total}**`
      );
    }

    // ======================
    // ترقية
    // ======================

    if (command === "ترقية") {
      if (!isAdmin(message)) {
        return message.reply("❌ هذا الأمر للإدارة فقط.");
      }

      const member =
        message.mentions.members.first();

      if (!member) {
        return message.reply(
          "❌ الاستخدام الصحيح:\n`!ترقية @عضو`"
        );
      }

      return message.reply(
        `⬆️ تم طلب ترقية ${member} بنجاح.`
      );
    }

    // ======================
    // تنزيل
    // ======================

    if (command === "تنزيل") {
      if (!isAdmin(message)) {
        return message.reply("❌ هذا الأمر للإدارة فقط.");
      }

      const member =
        message.mentions.members.first();

      if (!member) {
        return message.reply(
          "❌ الاستخدام الصحيح:\n`!تنزيل @عضو`"
        );
      }

      return message.reply(
        `⬇️ تم طلب تنزيل ${member} بنجاح.`
      );
    }

    // ======================
    // حضور
    // ======================

    if (command === "حضور") {
      attendance.set(
        message.author.id,
        "حاضر"
      );

      return message.reply(
        "🟢 تم تسجيل حضورك بنجاح."
      );
    }

    // ======================
    // غياب
    // ======================

    if (command === "غياب") {
      attendance.set(
        message.author.id,
        "غائب"
      );

      return message.reply(
        "🔴 تم تسجيل غيابك."
      );
    }

    // ======================
    // إنشاء تذكرة
    // ======================

    if (command === "تذكرة") {
      const existing =
        message.guild.channels.cache.find(
          (channel) =>
            channel.type === ChannelType.GuildText &&
            channel.name ===
              `ticket-${message.author.id}`
        );

      if (existing) {
        return message.reply(
          `🎫 لديك تذكرة مفتوحة بالفعل: ${existing}`
        );
      }

      const channel =
        await message.guild.channels.create({
          name: `ticket-${message.author.id}`,
          type: ChannelType.GuildText,

          permissionOverwrites: [
            {
              id: message.guild.id,
              deny: [
                PermissionsBitField.Flags.ViewChannel
              ]
            },
            {
              id: message.author.id,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory
              ]
            },
            {
              id: client.user.id,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory,
                PermissionsBitField.Flags.ManageChannels
              ]
            }
          ]
        });

      await channel.send(`
🎫 **تذكرة جديدة**

مرحبًا ${message.author} 👋

اكتب مشكلتك هنا وسيقوم فريق الإدارة بمساعدتك.

🔒 لإغلاق التذكرة:
\`!اغلاق\`
`);

      return message.reply(
        `✅ تم إنشاء التذكرة: ${channel}`
      );
    }

    // ======================
    // إغلاق التذكرة
    // ======================

    if (command === "اغلاق") {
      if (
        !message.channel.name.startsWith("ticket-")
      ) {
        return message.reply(
          "❌ هذا الأمر يعمل داخل التذاكر فقط."
        );
      }

      await message.reply(
        "🔒 سيتم إغلاق التذكرة خلال 5 ثواني..."
      );

      setTimeout(() => {
        message.channel.delete().catch(() => {});
      }, 5000);

      return;
    }

    // ======================
    // إضافة عضو للتذكرة
    // ======================

    if (command === "اضافة") {
      if (!isAdmin(message)) {
        return message.reply("❌ هذا الأمر للإدارة فقط.");
      }

      if (
        !message.channel.name.startsWith("ticket-")
      ) {
        return message.reply(
          "❌ هذا الأمر يعمل داخل التذاكر فقط."
        );
      }

      const member =
        message.mentions.members.first();

      if (!member) {
        return message.reply(
          "❌ الاستخدام الصحيح:\n`!اضافة @عضو`"
        );
      }

      await message.channel.permissionOverwrites.edit(
        member.id,
        {
          ViewChannel: true,
          SendMessages: true,
          ReadMessageHistory: true
        }
      );

      return message.reply(
        `✅ تمت إضافة ${member} إلى التذكرة.`
      );
    }

    // ======================
    // إزالة عضو من التذكرة
    // ======================

    if (command === "ازالة") {
      if (!isAdmin(message)) {
        return message.reply("❌ هذا الأمر للإدارة فقط.");
      }

      if (
        !message.channel.name.startsWith("ticket-")
      ) {
        return message.reply(
          "❌ هذا الأمر يعمل داخل التذاكر فقط."
        );
      }

      const member =
        message.mentions.members.first();

      if (!member) {
        return message.reply(
          "❌ الاستخدام الصحيح:\n`!ازالة @عضو`"
        );
      }

      await message.channel.permissionOverwrites.delete(
        member.id
      );

      return message.reply(
        `✅ تمت إزالة ${member} من التذكرة.`
      );
    }

    // ======================
    // أمر غير معروف
    // ======================

    return message.reply(
      `❌ الأمر **!${command}** غير موجود.\nاكتب **!مساعدة**`
    );

  } catch (error) {
    console.error("❌ ERROR:");
    console.error(error);

    return message.reply(
      "❌ حدث خطأ أثناء تنفيذ الأمر."
    ).catch(() => {});
  }
});

// ======================
// تسجيل الدخول
// ======================

client.login(TOKEN);
