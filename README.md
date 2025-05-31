# 🗳️ Advanced Telegram Poll Bot

A powerful and multilingual Telegram bot to create professional-looking polls with various formats — including **basic polls**, **quiz polls**, and **multi-format polls**. Built using **Telegraf.js**, this bot supports persistent buttons, inline help, image replies, and rate limiting.

---

## 📌 Features

- 🎯 Basic, Quiz, and Multi-format Polls
- 🌐 Language-ready format (currently English, extensible)
- 🧠 Rate-limiting to avoid spam
- 📸 Welcome Image with Inline Buttons
- 🔄 Smart Message Editing for Help/Back buttons
- 🧩 Modular and easy-to-extend structure

---

## 🚀 Deployment

### 🧱 Prerequisites

- Node.js (v18 or above)
- Telegram Bot Token from [BotFather](https://t.me/BotFather)

---

### 📦 Installation

```bash
git clone https://github.com/SudoR2spr/Quiz-polls-Bot.git
cd Quiz-polls-Bot
npm install```

🔧 Environment Variables

Create a .env file in the root directory:

```
BOT_TOKEN=your_bot_token_here
BASE_URL=https://your-app-url.com
PORT=3000
```

# 🏃‍♂️ Run the Bot

npm start

The bot will start and respond to /start, /help, /poll, /pollquiz, and /pollmult commands.

# 🛠 Available Commands

Command	Description
/start	Sends welcome image and buttons
/help	Shows poll creation guide
/poll	Basic poll: `/poll "Question"
/pollquiz	Quiz poll with explanation
/pollmult	Advanced format: options in A/B/C form
/future	(Planned) Show upcoming features

🖼 Welcome Image & Buttons

The /start command sends an image with:

✅ Inline button: Help

🔗 External button: Join Channel

If message editing fails, the bot deletes the previous one and sends a new reply.



📖 Example Usage

Multi-format Poll:

/pollmult Which country has the largest Bengali-speaking population?
a) India
b) Bangladesh ✅
c) Pakistan
Based on 2023 language census data

Quiz Poll:

/pollquiz What is the capital of France?
Paris ✅ | Berlin | Madrid
Correct answer is Paris.


🔒 Rate Limiting

To avoid abuse, each user can trigger a command once every 3 seconds. If exceeded, the bot replies:

> ❌ দয়া করে একটু অপেক্ষা করুন! খুব দ্রুত কমান্ড পাঠাচ্ছেন।


💡 Planned Features

🔄 Multi-language UI

🕑 Scheduled Polls

📊 Poll Analytics Dashboard

📄 Poll Templates


## 📜 License

MIT License © [SudoR2spr]

See the [LICENSE](./LICENSE) file for more info.
