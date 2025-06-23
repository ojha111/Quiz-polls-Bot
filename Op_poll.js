import 'dotenv/config';
import express from 'express';
import { Telegraf, Markup } from 'telegraf';
import rateLimitPkg from 'telegraf-ratelimit';
const rateLimit = rateLimitPkg.default || rateLimitPkg;

const app = express();
const BOT_TOKEN = process.env.BOT_TOKEN || "7287949215:AAGjbchRm2wFRKngvScGL3f1lHAHkhw31N4";
const BASE_URL = process.env.BASE_URL || "https://quiz-polls-bot.onrender.com";
const PORT = process.env.PORT || 3000;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN is missing!');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// রেট লিমিট মিডলওয়্যার
const limitConfig = {
  window: 3000,
  limit: 1,
  onLimitExceeded: (ctx) => ctx.reply('দয়া করে একটু অপেক্ষা করুন! খুব দ্রুত কমান্ড পাঠাচ্ছেন। ❌')
};
bot.use(rateLimit(limitConfig));

// Store user language and message states
const userLang = {};
const chatStates = {};

const langText = {
  en: {
    start: `<b>👋 Welcome to Advanced Poll Bot!</b>\n\nCreate professional polls in any language with flexible formatting.\n\n<b>🛠 Main Commands:</b>\n/poll - Basic polls\n/pollquiz - Quiz polls\n/pollmult - Multi-format polls\n/help - Detailed guide`,
    help: `<b>📖 Poll Bot Command Guide</b>\n\n` +
          `<b>Basic Poll:</b>\n<code>/poll "Question" | "Option 1" | "Option 2"</code>\n\n` +
          `<b>Quiz Poll:</b>\n<code>/pollquiz "Question"\n"Option 1" | "Option 2 ✅"\n"Explanation"</code>\n\n` +
          `<b>Multi-Format Poll:</b>\n<code>/pollmult "Question"\nA) "Option 1"\nB) "Option 2 ✅"\n[Explanation]</code>\n\n` +
          `<b>OR Alternative Format:</b>\n<code>/pollmult "Question" | "Option 1" | "Option 2 ✅" | [Explanation]</code>`,
    futureFeatures: `<b>🔮 Coming Soon</b>\n\n` +
                   `• Multi-language interface\n` +
                   `• Scheduled polls\n` +
                   `• Poll statistics dashboard\n` +
                   `• Template system for quick polls`,
    examples: {
      pollmult: [
        "<b>English Example:</b>",
        "<code>/pollmult Which country has the largest Bengali-speaking population?",
        "a) India",
        "b) Bangladesh ✅", 
        "c) Pakistan",
        "Based on 2023 language census data</code>",
        "",
        "<b>Hindi Example:</b>",
        "<code>/pollmult 2025 के वैश्विक आतंकवाद सूचकांक में सबसे ऊपर कौन सा देश है?",
        "a) अफ़ग़ानिस्तान",
        "b) बुर्किना फासो ✅",
        "c) सीरिया",
        "2025 ग्लोबल टेररिज्म इंडेक्स रिपोर्ट</code>"
      ].join('\n')
    }
  }
};

// Health Check
app.get('/', (req, res) => res.status(200).send('Poll Bot Healthy ✅'));

// Image URL
const WELCOME_IMAGE = 'https://i.ibb.co/j9n6nZxD/Op-log.png';

// /start command with image and persistent buttons
bot.start(async (ctx) => {
  try {
    // Initialize chat state if not exists
    if (!chatStates[ctx.chat.id]) {
      chatStates[ctx.chat.id] = {};
    }

    // Delete previous message if exists
    if (chatStates[ctx.chat.id].currentMessageId) {
      try {
        await ctx.deleteMessage(chatStates[ctx.chat.id].currentMessageId);
      } catch (error) {
        console.error('Error deleting previous message:', error);
      }
    }

    const message = await ctx.replyWithPhoto(WELCOME_IMAGE, {
      caption: langText.en.start,
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('Help', 'show_help')],
        [Markup.button.url('Join Channel', 'https://t.me/Opleech_WD')]
      ])
    });
    
    // Store message ID for later editing
    chatStates[ctx.chat.id].currentMessageId = message.message_id;
    
  } catch (error) {
    console.error('Error sending welcome image:', error);
    const message = await ctx.reply(langText.en.start, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('Help', 'show_help')],
        [Markup.button.url('Join Channel', 'https://t.me/Opleech_WD')]
      ])
    });
    // Ensure chat state exists before setting message ID
    if (!chatStates[ctx.chat.id]) {
      chatStates[ctx.chat.id] = {};
    }
    chatStates[ctx.chat.id].currentMessageId = message.message_id;
  }
});

// Improved button handlers with message editing
bot.action('show_help', async (ctx) => {
  try {
    // Answer the callback query to remove loading state
    await ctx.answerCbQuery();
    
    // Ensure chat state exists
    if (!chatStates[ctx.chat.id]) {
      chatStates[ctx.chat.id] = {};
    }

    // First try to edit the existing message to text
    try {
      await ctx.editMessageText(
        langText.en.help,
        {
          parse_mode: 'HTML',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('Back', 'show_start')],
            [Markup.button.url('Support', 'https://t.me/WD_Request_Bot')]
          ])
        }
      );
    } catch (editError) {
      console.log('Could not edit message directly, trying alternative approach');
      // If editing fails, delete the old message and send a new one
      try {
        await ctx.deleteMessage();
      } catch (deleteError) {
        console.error('Error deleting message:', deleteError);
      }
      const message = await ctx.reply(langText.en.help, {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('Back', 'show_start')],
          [Markup.button.url('Support', 'https://t.me/WD_Request_Bot')]
        ])
      });
      chatStates[ctx.chat.id].currentMessageId = message.message_id;
    }
  } catch (error) {
    console.error('Error in show_help:', error);
    // Final fallback - send new message
    const message = await ctx.reply(langText.en.help, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('Back', 'show_start')],
        [Markup.button.url('Support', 'https://t.me/WD_Request_Bot')]
      ])
    });
    // Ensure chat state exists
    if (!chatStates[ctx.chat.id]) {
      chatStates[ctx.chat.id] = {};
    }
    chatStates[ctx.chat.id].currentMessageId = message.message_id;
  }
});

bot.action('show_start', async (ctx) => {
  try {
    // Answer the callback query to remove loading state
    await ctx.answerCbQuery();
    
    // Ensure chat state exists
    if (!chatStates[ctx.chat.id]) {
      chatStates[ctx.chat.id] = {};
    }

    // First try to edit back to photo message
    try {
      await ctx.editMessageMedia(
        {
          type: 'photo',
          media: WELCOME_IMAGE,
          caption: langText.en.start,
          parse_mode: 'HTML'
        },
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Help', callback_data: 'show_help' }],
              [{ text: 'Join Channel', url: 'https://t.me/Opleech_WD' }]
            ]
          }
        }
      );
    } catch (mediaEditError) {
      console.log('Could not edit to photo, trying text version');
      // If photo edit fails, try editing to text version
      try {
        await ctx.editMessageText(langText.en.start, {
          parse_mode: 'HTML',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('Help', 'show_help')],
            [Markup.button.url('Join Channel', 'https://t.me/Opleech_WD')]
          ])
        });
      } catch (textEditError) {
        console.log('Could not edit message at all, sending new one');
        // If all editing fails, delete and send new message
        try {
          await ctx.deleteMessage();
        } catch (deleteError) {
          console.error('Error deleting message:', deleteError);
        }
        const message = await ctx.replyWithPhoto(WELCOME_IMAGE, {
          caption: langText.en.start,
          parse_mode: 'HTML',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('Help', 'show_help')],
            [Markup.button.url('Join Channel', 'https://t.me/Opleech_WD')]
          ])
        });
        chatStates[ctx.chat.id].currentMessageId = message.message_id;
      }
    }
  } catch (error) {
    console.error('Error in show_start:', error);
    // Final fallback - send new message
    const message = await ctx.replyWithPhoto(WELCOME_IMAGE, {
      caption: langText.en.start,
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('Help', 'show_help')],
        [Markup.button.url('Join Channel', 'https://t.me/Opleech_WD')]
      ])
    });
    // Ensure chat state exists
    if (!chatStates[ctx.chat.id]) {
      chatStates[ctx.chat.id] = {};
    }
    chatStates[ctx.chat.id].currentMessageId = message.message_id;
  }
});

// /help command
bot.command('help', async (ctx) => {
  try {
    // Initialize chat state if not exists
    if (!chatStates[ctx.chat.id]) {
      chatStates[ctx.chat.id] = {};
    }

    // Delete previous message if exists
    if (chatStates[ctx.chat.id].currentMessageId) {
      try {
        await ctx.deleteMessage(chatStates[ctx.chat.id].currentMessageId);
      } catch (error) {
        console.error('Error deleting previous message:', error);
      }
    }

    const message = await ctx.reply(langText.en.help, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('Back to Start', 'show_start')],
        [Markup.button.url('Support', 'https://t.me/WD_Request_Bot')]
      ])
    });
    chatStates[ctx.chat.id].currentMessageId = message.message_id;
  } catch (error) {
    console.error('Error sending help:', error);
  }
});

// /future command
bot.command('future', async (ctx) => {
  try {
    // Initialize chat state if not exists
    if (!chatStates[ctx.chat.id]) {
      chatStates[ctx.chat.id] = {};
    }

    // Delete previous message if exists
    if (chatStates[ctx.chat.id].currentMessageId) {
      try {
        await ctx.deleteMessage(chatStates[ctx.chat.id].currentMessageId);
      } catch (error) {
        console.error('Error deleting previous message:', error);
      }
    }

    const message = await ctx.reply(langText.en.futureFeatures, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('Main Menu', 'show_start')]
      ])
    });
    chatStates[ctx.chat.id].currentMessageId = message.message_id;
  } catch (error) {
    console.error('Error sending future features:', error);
  }
});

// /language command
bot.command('language', async (ctx) => {
  try {
    const current = userLang[ctx.from.id] || 'en';
    const newLang = current === 'bn' ? 'en' : 'bn';
    userLang[ctx.from.id] = newLang;
    await ctx.reply(`✅ Language changed to: ${newLang === 'bn' ? 'Bengali' : 'English'}`);
  } catch (error) {
    console.error('Error changing language:', error);
    await ctx.reply('❌ Failed to change language. Please try again.');
  }
});

// /poll command (basic poll)
bot.command('poll', async (ctx) => {
  try {
    const text = ctx.message.text;
    const parts = text.split('|').map(p => p.trim());
    
    if (parts.length < 3) {
      return await ctx.reply('❌ Format: /poll Question | Option1 | Option2');
    }

    let is_anonymous = true;
    let allows_multiple_answers = false;

    parts.filter(p => p.includes('=')).forEach(conf => {
      const [key, val] = conf.toLowerCase().split('=');
      if (key === 'anon') is_anonymous = val === 'true';
      if (key === 'multi') allows_multiple_answers = val === 'true';
    });

    const question = parts[0].replace('/poll', '').trim();
    const options = parts.slice(1).filter(opt => !opt.includes('='));
    
    if (options.length < 2) {
      return await ctx.reply('❌ Minimum 2 options required.');
    }

    await ctx.telegram.sendPoll(ctx.chat.id, question, options, {
      is_anonymous,
      allows_multiple_answers
    });
  } catch (error) {
    console.error('Error creating poll:', error);
    await ctx.reply('❌ Failed to create poll. Please use format: /poll Question | Option1 | Option2');
  }
});

// /pollmult command with multiple polls support
bot.command('pollmult', async (ctx) => {
  try {
    const text = ctx.message.text.replace('/pollmult', '').trim();

    // Split the input into multiple blocks (each block = one poll)
    const pollBlocks = text.split(/\n{2,}/).map(block => block.trim()).filter(Boolean);

    if (!pollBlocks.length) {
      return await ctx.reply('❌ Please provide at least one poll block.');
    }

    for (const block of pollBlocks) {
      let question, options = [], explanation = '';

      // Check for multiline format
      if (block.includes('\n')) {
        const lines = block.split('\n').map(l => l.trim()).filter(l => l);
        question = lines[0];

        for (let i = 1; i < lines.length; i++) {
          if (lines[i].startsWith('[')) {
            explanation = lines[i].replace(/^|$/g, '');
            break;
          }
          options.push(lines[i]);
        }
      } 
      // Fallback to inline format (pipe-separated) if needed
      else {
        const parts = block.split('|').map(p => p.trim());
        question = parts[0];

        for (let i = 1; i < parts.length; i++) {
          if (parts[i].startsWith('[')) {
            explanation = parts[i].replace(/^|$/g, '');
            break;
          }
          options.push(parts[i]);
        }
      }

      // Validate input
      if (!question || options.length < 2) {
        await ctx.reply(`❌ Invalid poll block:\n${block}`);
        continue;
      }

      // Process options and detect correct answer
      const cleanOptions = [];
      let correctIndex = -1;

      options.forEach((opt, idx) => {
        const cleanOpt = opt.replace(/^[a-z]\s*/i, '').replace('✅', '').trim();
        cleanOptions.push(cleanOpt);

        if (opt.includes('✅')) {
          correctIndex = idx;
        }
      });

      if (correctIndex === -1) {
        await ctx.reply(`❌ Missing correct answer (✅) in:\n${question}`);
        continue;
      }

      // Send poll
      await ctx.telegram.sendPoll(
        ctx.chat.id,
        question,
        cleanOptions,
        {
          type: 'quiz',
          is_anonymous: false,
          correct_option_id: correctIndex,
          explanation: explanation ? `ℹ️ ${explanation}` : undefined
        }
      );
    }

  } catch (error) {
    console.error('Poll creation error:', error);
    await ctx.reply(
      `❌ Error: ${error.message}\n\n` +
      'Correct formats:\n' +
      '<code>/pollmult Question\nA) Option1\nB) Option2 ✅\n[Explanation]</code>\n\n' +
      'Multiple polls:\n' +
      '<code>/pollmult\nQuestion 1\nOption 1\nOption 2 ✅\n[Explanation]\n\nQuestion 2\nOption 1\nOption 2 ✅\n[Explanation]</code>',
      { parse_mode: 'HTML' }
    );
  }
});

// /pollquiz command (quiz poll)
bot.command('pollquiz', async (ctx) => {
  try {
    const text = ctx.message.text.replace('/pollquiz', '').trim();
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    if (lines.length < 3 || lines.length % 3 !== 0) {
      return await ctx.reply('❌ Format:\nQuestion\nOption1 | Option2 ✅ | Option3\nExplanation');
    }

    for (let i = 0; i < lines.length; i += 3) {
      try {
        const question = lines[i];
        const optionsRaw = lines[i+1].split('|').map(o => o.trim());
        const explanation = lines[i+2];

        let correctOptionIndex = -1;
        const options = optionsRaw.map((opt, idx) => {
          if (opt.includes('✅')) {
            correctOptionIndex = idx;
            return opt.replace('✅', '').trim();
          }
          return opt;
        });

        if (correctOptionIndex === -1) {
          await ctx.reply(`❌ No correct answer marked with ✅ in: ${question}`);
          continue;
        }

        await ctx.telegram.sendPoll(ctx.chat.id, question, options, {
          type: 'quiz',
          correct_option_id: correctOptionIndex,
          is_anonymous: false,
          explanation: `ℹ️ ${explanation}`
        });
      } catch (error) {
        console.error(`Error in question ${i/3 + 1}:`, error);
        await ctx.reply(`❌ Error in question ${i/3 + 1}:\n${error.message}`);
      }
    }
  } catch (error) {
    console.error('Error in pollquiz:', error);
    await ctx.reply('❌ Failed to process pollquiz command. Please check the format and try again.');
  }
});

// Start bot
(async () => {
  try {
    console.log('🟡 Initializing bot...');
    console.log('⚙️ Configuration:', {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT,
      BASE_URL
    });

    const webhookPath = `/telegraf/${bot.secretPathComponent()}`;
    app.use(bot.webhookCallback(webhookPath));
    
    await bot.telegram.setWebhook(`${BASE_URL}${webhookPath}`, {
      drop_pending_updates: true
    });

    const server = app.listen(PORT, () => {
      console.log('✅ Bot started successfully');
      console.log(`🌐 Server running on port ${PORT}`);
      console.log(`🤖 Webhook URL: ${BASE_URL}${webhookPath}`);
      console.log(`🕒 Started at: ${new Date().toISOString()}`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
      try {
        await bot.stop(signal);
        server.close(() => {
          console.log('🔴 Server closed');
          process.exit(0);
        });
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));

  } catch (error) {
    console.error('❌ Fatal error during startup:', {
      message: error.message,
      stack: error.stack.split('\n')
    });
    process.exit(1);
  }
})();
