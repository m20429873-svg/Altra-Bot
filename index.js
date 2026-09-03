const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const fs = require("fs");

// ==============================
// الإعدادات
// ==============================

const TOKEN = process.env.DISCORD_TOKEN;
const PREFIX = "!";

if (!TOKEN) {
  console.error("❌ لم يتم العثور على DISCORD_TOKEN في Variables");
  process.exit(1);
}

// ==============================
// قاعدة بيانات بسيطة
// ==============================

const DB_FILE = "./data.json";

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({}, null, 2));
}

function loadDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } catch {
    return {};
  }
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

const db = loadDB();

function getUser(userId) {
  if (!db[userId]) {
    db[userId] = {
      points: 0
    };
    saveDB(db);
  }

  return db[userId];
}

// ==============================
// البوت
// ==============================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ==============================
// تشغيل البوت
// ==============================

client.once("ready", () => {
  console.log("=================================");
  console.log(`✅ البوت اشتغل: ${client.user.tag}`);
  console.log(`🌐 السيرفرات: ${client.guilds.cache.size}`);
  console.log("=================================");

  client.user.setPresence({
    activities: [
      {
        name: "!مساعدة",
        type: 0
      }
    ],
    status: "online"
  });
});

// ==============================
// استقبال الأوامر
// ==============================

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

    // ==========================
    // !مساعدة
    // ==========================

    if (command === "مساعدة" || command === "help") {
      const embed = new EmbedBuilder()
        .setTitle("🤖 Altra-Bot")
        .setDescription(
          "أهلًا بك في قائمة أوامر البوت!\n\n" +
          "**📊 النقاط**\n" +
          "`!نقاط` — معرفة نقاطك\n" +
          "`!نقاط @عضو` — معرفة نقاط عضو\n" +
          "`!اعطاء @عضو 100` — إعطاء نقاط\n" +
          "`!سحب @عضو 100` — سحب نقاط\n\n" +
          "**🎫 التذاكر**\n" +
          "`!تذكرة` — إنشاء تذكرة\n\n" +
          "**ℹ️ عام**\n" +
          "`!مساعدة` — عرض هذه القائمة"
        )
        .setFooter({
          text: "Altra-Bot • جميع الحقوق محفوظة"
        })
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }

    // ==========================
    // !نقاط
    // ==========================

    if (command === "نقاط") {
      const member =
        message.mentions.members.first() || message.member;

      const user = getUser(member.id);

      const embed = new EmbedBuilder()
        .setTitle("💰 نقاط العضو")
        .setDescription(
          `👤 العضو: ${member}\n\n` +
          `⭐ النقاط: **${user.points}**`
        )
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }

    // ==========================
    // !اعطاء
    // ==========================

    if (command === "اعطاء") {
      if (
        !message.member.permissions.has(
          PermissionsBitField.Flags.Administrator
        )
      ) {
        return message.reply("❌ هذا الأمر للإدارة فقط.");
      }

      const member = message.mentions.members.first();

      if (!member) {
        return message.reply(
          "❌ الاستخدام الصحيح:\n`!اعطاء @العضو 100`"
        );
      }

      const amount = Number(args[1]);

      if (!Number.isInteger(amount) || amount <= 0) {
        return message.reply("❌ اكتب عدد نقاط صحيح.");
      }

      const user = getUser(member.id);

      user.points += amount;
      saveDB(db);

      return message.reply(
        `✅ تم إعطاء ${member} **${amount} نقطة**.\n` +
        `⭐ نقاطه الآن: **${user.points}**`
      );
    }

    // ==========================
    // !سحب
    // ==========================

    if (command === "سحب") {
      if (
        !message.member.permissions.has(
          PermissionsBitField.Flags.Administrator
        )
      ) {
        return message.reply("❌ هذا الأمر للإدارة فقط.");
      }

      const member = message.mentions.members.first();

      if (!member) {
        return message.reply(
          "❌ الاستخدام الصحيح:\n`!سحب @العضو 100`"
        );
      }

      const amount = Number(args[1]);

      if (!Number.isInteger(amount) || amount <= 0) {
        return message.reply("❌ اكتب عدد نقاط صحيح.");
      }

      const user = getUser(member.id);

      user.points = Math.max(0, user.points - amount);

      saveDB(db);

      return message.reply(
        `✅ تم سحب **${amount} نقطة** من ${member}.\n` +
        `⭐ نقاطه الآن: **${user.points}**`
      );
    }

    // ==========================
    // !تذكرة
    // ==========================

    if (command === "تذكرة" || command === "ticket") {
      const existing = message.guild.channels.cache.find(
        (channel) =>
          channel.name === `تذكرة-${message.author.username}` &&
          channel.type === ChannelType.GuildText
      );

      if (existing) {
        return message.reply(
          `❌ لديك تذكرة مفتوحة بالفعل: ${existing}`
        );
      }

      const channel = await message.guild.channels.create({
        name: `تذكرة-${message.author.username}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: message.guild.roles.everyone.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: message.author.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory
            ]
          }
        ]
      });

      const embed = new EmbedBuilder()
        .setTitle("🎫 تذكرة الدعم")
        .setDescription(
          `مرحبًا ${message.author} 👋\n\n` +
          "اكتب مشكلتك هنا وسيقوم فريق الإدارة بمساعدتك.\n\n" +
          "عند الانتهاء اضغط على زر **إغلاق التذكرة**."
        )
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("close_ticket")
          .setLabel("إغلاق التذكرة")
          .setEmoji("🔒")
          .setStyle(ButtonStyle.Danger)
      );

      await channel.send({
        content: `${message.author}`,
        embeds: [embed],
        components: [row]
      });

      return message.reply(
        `✅ تم إنشاء تذكرتك: ${channel}`
      );
    }

    // ==========================
    // أمر غير معروف
    // ==========================

    return message.reply(
      `❌ الأمر غير موجود.\nاكتب \`${PREFIX}مساعدة\` لمعرفة الأوامر.`
    );
  } catch (error) {
    console.error("❌ خطأ:", error);

    try {
      await message.reply(
        "❌ حدث خطأ أثناء تنفيذ الأمر."
      );
    } catch {}
  }
});

// ==============================
// الأزرار
// ==============================

client.on("interactionCreate", async (interaction) => {
  try {
    if (!interaction.isButton()) return;

    if (interaction.customId === "close_ticket") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.Administrator
        )
      ) {
        return interaction.reply({
          content: "❌ الإدارة فقط تستطيع إغلاق التذكرة.",
          ephemeral: true
        });
      }

      await interaction.reply("🔒 سيتم إغلاق التذكرة...");

      setTimeout(async () => {
        try {
          await interaction.channel.delete();
        } catch (error) {
          console.error(error);
        }
      }, 2000);
    }
  } catch (error) {
    console.error("❌ Interaction Error:", error);
  }
});

// ==============================
// تسجيل الدخول
// ==============================

client.login(TOKEN).catch((error) => {
  console.error("❌ فشل تسجيل دخول البوت:");
  console.error(error);
});
