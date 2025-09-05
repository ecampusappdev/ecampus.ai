const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const mongoose = require("mongoose");
const path = require("path");
const Lead = require("./models/Lead");

dotenv.config();
const app = express();

// ✅ CORS Setup (Allow both frontend & backend on Vercel + localhost)
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "https://ecampusai-azure.vercel.app", // ✅ Your frontend
        "https://ecampusai.vercel.app"        // ✅ Your backend
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Parse JSON requests
app.use(express.json());

// ✅ MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ecampus-ai";
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ OpenAI Setup
const openaiApiKey = process.env.OPENAI_API_KEY;
const modelFromEnv = process.env.OPENAI_MODEL || "gpt-4o-mini";

if (!openaiApiKey) {
  console.warn("⚠️ Warning: OPENAI_API_KEY is missing!");
}

const openaiClient = new OpenAI({ apiKey: openaiApiKey });

// ✅ Health Check Route
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ✅ Serve Admin Page
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// ✅ Save Lead API
app.post("/api/leads", async (req, res) => {
  try {
    const { name, email, phone, action, conversationHistory, lastQuestion } = req.body;

    if (!name || !email || !phone || !action || !lastQuestion) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const lead = new Lead({
      name,
      email,
      phone,
      action,
      conversationHistory: conversationHistory || [],
      lastQuestion,
    });

    await lead.save();
    console.log("✅ Lead saved:", { name, email, action, lastQuestion });

    res.json({ success: true, message: "Lead saved successfully", leadId: lead._id });
  } catch (error) {
    console.error("❌ Error saving lead:", error);
    res.status(500).json({ error: "Failed to save lead" });
  }
});

// ✅ Fetch All Leads API
app.get("/api/leads", async (req, res) => {
  try {
    const leads = await Lead.find({}).sort({ createdAt: -1 });
    res.json({ leads });
  } catch (error) {
    console.error("❌ Error fetching leads:", error);
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

// ✅ OpenAI Query API
app.post("/api/query", async (req, res) => {
  try {
    const { question, conversationHistory = [] } = req.body || {};

    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Invalid request: question is required" });
    }

    if (!openaiApiKey) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

    const systemPrompt = `You are an expert assistant for online university discovery in India.
Provide details about online courses, universities, and educational platforms in India, including:
- Specific program names
- Approximate fees
- Duration of programs
- Eligibility criteria
- Website links
- Features & benefits
- Government and private institutions`;

    const userPrompt = `User question: ${question}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-6),
      { role: "user", content: userPrompt },
    ];

    const completion = await openaiClient.chat.completions.create({
      model: modelFromEnv,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
      stream: true,
    });

    // ✅ Streaming response
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";

    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content, full: false })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ content: "", full: true, fullResponse })}\n\n`);
    res.end();
  } catch (error) {
    console.error("❌ Error in /api/query:", error);
    res.status(500).json({ error: "Failed to get response from AI" });
  }
});

// ✅ Export app for Vercel
module.exports = app;
