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

// الراتب = عدد النقاط × 100
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
    // !بنق
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
    // !مساعدة
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

\`!كليم\`
استلام الراتب 💵

\`!رتبتي\`
عرض رتبتك 🏅

\`!احصائياتي\`
عرض إحصائياتك 📊

━━━━━━━━━━━━━━━━━━━━

⭐ **نظام النقاط**

\`!توب\`
أفضل الأعضاء بالنقاط 🏆

━━━━━━━━━━━━━━━━━━━━

📋 **الحضور**

\`!حضور\`
تسجيل حضور 🟢

\`!غياب\`
تسجيل غياب 🔴

\`!الحضور\`
عرض الحاضرين 👥

━━━━━━━━━━━━━━━━━━━━

🎫 **التذاكر**

\`!تذكرة\`
فتح تذكرة 🎫

\`!اغلاق\`
إغلاق التذكرة 🔒

\`!اضافة @عضو\`
إضافة عضو للتذكرة ➕

\`!ازالة @عضو\`
إزالة عضو من التذكرة ➖

━━━━━━━━━━━━━━━━━━━━

🛡️ **أوامر الإدارة**

\`!اعطاء-نقاط @عضو 10\`
إعطاء نقاط ⭐

\`!خصم-نقاط @عضو 10\`
خصم نقاط ⭐

\`!تصفير-نقاط @عضو\`
تصفير النقاط ♻️

\`!تحذير @عضو\`
إعطاء تحذير ⚠️

\`!ترقية @عضو\`
ترقية عضو ⬆️

\`!تنزيل @عضو\`
تنزيل عضو ⬇️

━━━━━━━━━━━━━━━━━━━━
`
          )
        ]
      });
    }

    // ==================================================
    // !نقاط
    // ==================================================

    if (command === "نقاط") {
      const amount = getPoints(message.author.id);

      return message.reply({
        embeds: [
          embed(
            "⭐ نقاطك",
            `
👤 العضو: ${message.author}

⭐ النقاط: **${amount} نقطة**

استمر في نشاطك للحصول على المزيد! 🚀
`
          )
        ]
      });
    }

    // ==================================================
    // !راتبي
    // ==================================================

    if (command === "راتبي" || command === "راتب") {
      const amount = getPoints(message.author.id);
      const salary = amount * SALARY_PER_POINT;

      return message.reply({
        embeds: [
          embed(
            "💰 راتبك",
            `
👤 العضو: ${message.author}

⭐ النقاط: **${amount}**

💵 الراتب: **${salary}**

📌 قيمة النقطة: **${SALARY_PER_POINT}**
`
          )
        ]
      });
    }

    // ==================================================
    // !كليم
    // ==================================================

    if (
      command === "كليم" ||
      command === "كلايم" ||
      command === "claim"
    ) {
      const amount = getPoints(message.author.id);

      if (amount <= 0) {
        return message.reply({
          embeds: [
            errorEmbed(
              "❌ ليس لديك نقاط لاستلام الراتب."
            )
          ]
        });
      }

      const salary = amount * SALARY_PER_POINT;

      setPoints(message.author.id, 0);

      return message.reply({
        embeds: [
          successEmbed(
            `
💰 **تم استلام راتبك بنجاح!**

👤 العضو: ${message.author}

⭐ النقاط المستخدمة: **${amount}**

💵 المبلغ المستحق: **${salary}**

♻️ نقاطك الآن: **0**
`
          )
        ]
      });
    }

    // ==================================================
    // !رتبتي
    // ==================================================

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

      return message.reply({
        embeds: [
          embed(
            "🏅 رتبتك",
            `
👤 العضو: ${message.author}

🏅 الرتبة: **${rank}**

⭐ النقاط: **${amount}**
`
          )
        ]
      });
    }

    // ==================================================
    // !احصائياتي
    // ==================================================

    if (command === "احصائياتي") {
      const pts = getPoints(message.author.id);
      const warn = getWarnings(message.author.id);
      const status =
        attendance.get(message.author.id) || "غير مسجل";

      return message.reply({
        embeds: [
          embed(
            "📊 إحصائياتك",
            `
👤 العضو: ${message.author}

⭐ النقاط: **${pts}**

⚠️ التحذيرات: **${warn}**

📋 حالة الحضور: **${status}**
`
          )
        ]
      });
    }

    // ==================================================
    // !اعطاء-نقاط
    // ==================================================

    if (
      command === "اعطاء-نقاط" ||
      command === "اعطاءنقاط"
    ) {
      if (!isAdmin(message)) {
        return message.reply({
          embeds: [
            errorEmbed(
              "🔒 هذا الأمر مخصص للإدارة فقط."
            )
          ]
        });
      }

      const user = message.mentions.users.first();
      const amount = Number(args[1]);

      if (
        !user ||
        !Number.isInteger(amount) ||
        amount <= 0
      ) {
        return message.reply({
          embeds: [
            errorEmbed(
              "الاستخدام الصحيح:\n`!اعطاء-نقاط @عضو 10`"
            )
          ]
        });
      }

      const total = getPoints(user.id) + amount;

      setPoints(user.id, total);

      return message.reply({
        embeds: [
          successEmbed(
            `
👤 العضو: ${user}

➕ النقاط المضافة: **${amount}**

⭐ مجموع النقاط: **${total}**
`
          )
        ]
      });
    }

    // ==================================================
    // !خصم-نقاط
    // ==================================================

    if (
      command === "خصم-نقاط" ||
      command === "خصمنقاط"
    ) {
      if (!isAdmin(message)) {
        return message.reply({
          embeds: [
            errorEmbed(
              "🔒 هذا الأمر مخصص للإدارة فقط."
            )
          ]
        });
      }

      const user = message.mentions.users.first();
      const amount = Number(args[1]);

      if (
        !user ||
        !Number.isInteger(amount) ||
        amount <= 0
      ) {
        return message.reply({
          embeds: [
            errorEmbed(
              "الاستخدام الصحيح:\n`!خصم-نقاط @عضو 10`"
            )
          ]
        });
      }

      const total = Math.max(
        0,
        getPoints(user.id) - amount
      );

      setPoints(user.id, total);

      return message.reply({
        embeds: [
          successEmbed(
            `
👤 العضو: ${user}

➖ النقاط المخصومة: **${amount}**

⭐ مجموع النقاط: **${total}**
`
          )
        ]
      });
    }

    // ==================================================
    // !تصفير-نقاط
    // ==================================================

    if (
      command === "تصفير-نقاط" ||
      command === "تصفيرنقاط"
    ) {
      if (!isAdmin(message)) {
        return message.reply({
          embeds: [
            errorEmbed(
              "🔒 هذا الأمر مخصص للإدارة فقط."
            )
          ]
        });
      }

      const user = message.mentions.users.first();

      if (!user) {
        return message.reply({
          embeds: [
            errorEmbed(
              "الاستخدام الصحيح:\n`!تصفير-نقاط @عضو`"
            )
          ]
        });
      }

      setPoints(user.id, 0);

      return message.reply({
        embeds: [
          successEmbed(
            `♻️ تم تصفير نقاط ${user} بنجاح.`
          )
        ]
      });
    }

    // ==================================================
    // !توب
    // ==================================================

    if (command === "توب") {
      if (points.size === 0) {
        return message.reply({
          embeds: [
            errorEmbed(
              "📊 لا توجد نقاط مسجلة حتى الآن."
            )
          ]
        });
      }

      const list = [...points.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      let text = "";

      for (let i = 0; i < list.length; i++) {
        const user = await client.users
          .fetch(list[i][0])
          .catch(() => null);

        const medals = ["🥇", "🥈", "🥉"];

        const medal =
          medals[i] || `**${i + 1}.**`;

        text += `${medal} ${
          user ? user : "عضو"
        } — ⭐ **${list[i][1]}**\n`;
      }

      return message.reply({
        embeds: [
          embed(
            "🏆 أفضل الأعضاء",
            `\n${text}`
          )
        ]
      });
    }

    // ==================================================
    // !تحذير
    // ==================================================

    if (command === "تحذير") {
      if (!isAdmin(message)) {
        return message.reply({
          embeds: [
            errorEmbed(
              "🔒 هذا الأمر مخصص للإدارة فقط."
            )
          ]
        });
      }

      const user = message.mentions.users.first();

      if (!user) {
        return message.reply({
          embeds: [
            errorEmbed(
              "الاستخدام الصحيح:\n`!تحذير @عضو`"
            )
          ]
        });
      }

      const total = getWarnings(user.id) + 1;

      warnings.set(user.id, total);

      return message.reply({
        embeds: [
          successEmbed(
            `
⚠️ تم تسجيل تحذير على ${user}.

📊 عدد التحذيرات: **${total}**
`
          )
        ]
      });
    }

    // ==================================================
    // !ترقية
    // ==================================================

    if (command === "ترقية") {
      if (!isAdmin(message)) {
        return message.reply({
          embeds: [
            errorEmbed(
              "🔒 هذا الأمر مخصص للإدارة فقط."
            )
          ]
        });
      }

      const member =
        message.mentions.members.first();

      if (!member) {
        return message.reply({
          embeds: [
            errorEmbed(
              "الاستخدام الصحيح:\n`!ترقية @عضو`"
            )
          ]
        });
      }

      return message.reply({
        embeds: [
          successEmbed(
            `⬆️ تم تسجيل طلب ترقية ${member} بنجاح.`
          )
        ]
      });
    }

    // ==================================================
    // !تنزيل
    // ==================================================

    if (command === "تنزيل") {
      if (!isAdmin(message)) {
        return message.reply({
          embeds: [
            errorEmbed(
              "🔒 هذا الأمر مخصص للإدارة فقط."
            )
          ]
        });
      }

      const member =
        message.mentions.members.first();

      if (!member) {
        return message.reply({
          embeds: [
            errorEmbed(
              "الاستخدام الصحيح:\n`!تنزيل @عضو`"
            )
          ]
        });
      }

      return message.reply({
        embeds: [
          successEmbed(
            `⬇️ تم تسجيل طلب تنزيل ${member} بنجاح.`
          )
        ]
      });
    }

    // ==================================================
    // !حضور
    // ==================================================

    if (command === "حضور") {
      attendance.set(
        message.author.id,
        "حاضر"
      );

      return message.reply({
        embeds: [
          successEmbed(
            `
🟢 **تم تسجيل حضورك بنجاح!**

👤 العضو: ${message.author}

📋 الحالة: **حاضر**
`
          )
        ]
      });
    }

    // ==================================================
    // !غياب
    // ==================================================

    if (command === "غياب") {
      attendance.set(
        message.author.id,
        "غائب"
      );

      return message.reply({
        embeds: [
          successEmbed(
            `
🔴 **تم تسجيل غيابك.**

👤 العضو: ${message.author}

📋 الحالة: **غائب**
`
          )
        ]
      });
    }

    // ==================================================
    // !الحضور
    // ==================================================

    if (
      command === "الحضور" ||
      command === "قائمة-الحضور"
    ) {
      if (!isAdmin(message)) {
        return message.reply({
          embeds: [
            errorEmbed(
              "🔒 هذا الأمر مخصص للإدارة فقط."
            )
          ]
        });
      }

      const حاضرون = [...attendance.entries()]
        .filter(([_, status]) => status === "حاضر");

      if (حاضرون.length === 0) {
        return message.reply({
          embeds: [
            embed(
              "📋 سجل الحضور",
              "لا يوجد أعضاء مسجلون كحاضرين حاليًا."
            )
          ]
        });
      }

      let text = "";

      for (const [id] of حاضرون) {
        const user = await client.users
          .fetch(id)
          .catch(() => null);

        if (user) {
          text += `🟢 ${user}\n`;
        }
      }

      return message.reply({
        embeds: [
          embed(
            "📋 الحاضرون",
            `
👥 العدد: **${حاضرون.length}**

${text}
`
          )
        ]
      });
    }

    // ==================================================
    // !تذكرة
    // ==================================================

    if (command === "تذكرة") {
      const existing =
        message.guild.channels.cache.find(
          (channel) =>
            channel.type === ChannelType.GuildText &&
            channel.name ===
              `ticket-${message.author.id}`
        );

      if (existing) {
        return message.reply({
          embeds: [
            errorEmbed(
              `🎫 لديك تذكرة مفتوحة بالفعل:\n${existing}`
            )
          ]
        });
      }

      const channel =
        await message.guild.channels.create({
          name: `ticket-${message.author.id}`,
          type: ChannelType.GuildText,
          reason: `تذكرة بواسطة ${message.author.tag}`,

          permissionOverwrites: [
            {
              id: message.guild.roles.everyone.id,
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

      await channel.send({
        embeds: [
          embed(
            "🎫 تذكرة جديدة",
            `
مرحبًا ${message.author} 👋

شكرًا لتواصلك مع الإدارة.

📝 اكتب مشكلتك أو طلبك بالتفصيل هنا.

🔒 لإغلاق التذكرة:
\`!اغلاق\`

━━━━━━━━━━━━━━━━
🤖 **Altra-Bot**
`
          )
        ]
      });

      return message.reply({
        embeds: [
          successEmbed(
            `🎫 تم إنشاء تذكرتك بنجاح!\n\n${channel}`
          )
        ]
      });
    }

    // ==================================================
    // !اغلاق
    // ==================================================

    if (command === "اغلاق") {
      if (
        !message.channel.name.startsWith("ticket-")
      ) {
        return message.reply({
          embeds: [
            errorEmbed(
              "❌ هذا الأمر يعمل داخل التذاكر فقط."
            )
          ]
        });
      }

      await message.reply({
        embeds: [
          embed(
            "🔒 إغلاق التذكرة",
            "سيتم إغلاق التذكرة خلال **5 ثوانٍ**..."
          )
        ]
      });

      setTimeout(() => {
        message.channel.delete().catch(() => {});
      }, 5000);

      return;
    }

    // ==================================================
    // !اضافة
    // ==================================================

    if (command === "اضافة") {
      if (!isAdmin(message)) {
        return message.reply({
          embeds: [
            errorEmbed(
              "🔒 هذا الأمر مخصص للإدارة فقط."
            )
          ]
        });
      }

      if (
        !message.channel.name.startsWith("ticket-")
      ) {
        return message.reply({
          embeds: [
            errorEmbed(
              "❌ هذا الأمر يعمل داخل التذاكر فقط."
            )
          ]
        });
      }

      const member =
        message.mentions.members.first();

      if (!member) {
        return message.reply({
          embeds: [
            errorEmbed(
              "الاستخدام الصحيح:\n`!اضافة @عضو`"
            )
          ]
        });
      }

      await message.channel.permissionOverwrites.edit(
        member.id,
        {
          ViewChannel: true,
          SendMessages: true,
          ReadMessageHistory: true
        }
      );

      return message.reply({
        embeds: [
          successEmbed(
            `➕ تمت إضافة ${member} إلى التذكرة.`
          )
        ]
      });
    }

    // ==================================================
    // !ازالة
    // ==================================================

    if (command === "ازالة") {
      if (!isAdmin(message)) {
        return message.reply({
          embeds: [
            errorEmbed(
              "🔒 هذا الأمر مخصص للإدارة فقط."
            )
          ]
        });
      }

      if (
        !message.channel.name.startsWith("ticket-")
      ) {
        return message.reply({
          embeds: [
            errorEmbed(
              "❌ هذا الأمر يعمل داخل التذاكر فقط."
            )
          ]
        });
      }

      const member =
        message.mentions.members.first();

      if (!member) {
        return message.reply({
          embeds: [
            errorEmbed(
              "الاستخدام الصحيح:\n`!ازالة @عضو`"
            )
          ]
        });
      }

      await message.channel.permissionOverwrites.delete(
        member.id
      );

      return message.reply({
        embeds: [
          successEmbed(
            `➖ تمت إزالة ${member} من التذكرة.`
          )
        ]
      });
    }

    // ==================================================
    // أمر غير معروف
    // ==================================================

    return message.reply({
      embeds: [
        errorEmbed(
          `الأمر **!${command}** غير موجود.\n\nاكتب **!مساعدة** لرؤية جميع الأوامر.`
        )
      ]
    });

  } catch (error) {
    console.error("================================");
    console.error("❌ ERROR:", error);
    console.error("================================");

    return
