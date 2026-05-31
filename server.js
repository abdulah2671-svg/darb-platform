const express = require('express');
const { OpenAI } = require('openai');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.post('/analyze', async (req, res) => {
    try {
        const { message } = req.body;
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // أو gpt-4 إذا حسابك يدعمه
            messages: [
                { role: "system", content: "أنت خبير في الموارد البشرية والتوظيف، ساعد المستخدم في تحسين سيرته الذاتية بذكاء." },
                { role: "user", content: message }
            ],
        });

        res.json({ reply: completion.choices[0].message.content });
    } catch (error) {
        console.error(error);
        res.status(500).send("حدث خطأ في محرك الذكاء الاصطناعي");
    }
});
app.get('/', (req, res) => {
    res.send('السيرفر شغال وذكي وجاهز لتحليل السير الذاتية! 🚀');
});
app.listen(3000, () => console.log('السيرفر الذكي شغال على منفذ 3000'));