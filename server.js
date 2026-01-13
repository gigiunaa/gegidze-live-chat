import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { operatorAuth } from "./middleware/operatorAuth.js";




dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));



const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);



// Health check
app.get("/", (req, res) => {
  res.send("🚀 Gegidze Live Chat API running");
});




/**
* Operator login page (HTML)
*/
app.get("/operator/login.html", (req, res) => {
  res.sendFile(path.resolve("operator/login.html"));
});

/**
 * Operator login
 */
app.post("/operator/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });





  if (error || !data?.session) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.json({
    access_token: data.session.access_token,
    user: {
      id: data.user.id,
      email: data.user.email
    }
  });
});


/**
 * Start chat (create conversation + first message)
 */
app.post("/support/start", async (req, res) => {
  const { message, page, visitor_name, visitor_phone } = req.body;
  if (!message) return res.status(400).json({ error: "message required" });

  // ❌ prevent duplicate open conversation for same visitor
if (visitor_phone) {
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("status", "open")
    .eq("visitor_phone", visitor_phone)
    .limit(1);

  if (existing && existing.length) {
    return res.json({
      conversationId: existing[0].id,
      reused: true
    });
  }
}


  const businessHours = isBusinessHours();

  const { data: convo, error: convoErr } = await supabase
    .from("conversations")
    .insert({
      source_page: page,
      visitor_name: visitor_name || null,
      visitor_phone: visitor_phone || null,
      business_hours: businessHours,
      status: "open",
      last_message_at: new Date().toISOString(),
      last_message_from: "user",
      operator_seen: false
    })

    .select()
    .single();

  if (convoErr) return res.status(500).json(convoErr);

  const { error: userMsgErr } = await supabase.from("messages").insert({
    conversation_id: convo.id,
    sender: "user",
    text: message
  });

  if (userMsgErr) return res.status(500).json(userMsgErr);

  if (!convo.system_message_sent) {
    const systemText = businessHours
      ? "Thanks for reaching out 👋 Our team will reply shortly."
      : "Thanks for your message 👋 We’re currently outside business hours. We’ll get back to you next business day.";

    await supabase.from("messages").insert({
      conversation_id: convo.id,
      sender: "system",
      text: systemText
    });

    await supabase
      .from("conversations")
      .update({ system_message_sent: true })
      .eq("id", convo.id);
  }


  // 🔔 GOOGLE CHAT — ONLY ON FIRST MESSAGE
  await sendGoogleChatOnce({
    
    message,
    conversationId: convo.id,
    page,
    visitor_name,
    visitor_phone
  });



  res.json({
    conversationId: convo.id,
    businessHours
  });
});



/**
 * Send message
 */
app.post("/support/send", async (req, res) => {
  const { conversationId, message, sender = "user" } = req.body;

  if (!conversationId || !message) {
    return res.status(400).json({ error: "conversationId & message required" });
  }

  // 0️⃣ ჯერ შეამოწმე სტატუსი
  const { data: convo } = await supabase
    .from("conversations")
    .select("status")
    .eq("id", conversationId)
    .single();

  if (!convo || convo.status === "closed") {
    return res.status(400).json({ error: "Conversation is closed" });
  }

  // 1️⃣ მერე ჩაწერე მესიჯი
  const { error: msgErr } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender,
    text: message
  });

  if (msgErr) {
    return res.status(500).json(msgErr);
  }

  // 2️⃣ conversation update
  const { error: convoUpdateErr } = await supabase
    .from("conversations")
    .update({
      last_message_at: new Date().toISOString(),
      status: sender === "user" ? "waiting" : "open",
      last_message_from: sender,
      operator_seen: sender === "operator"
    })
    .eq("id", conversationId);

  if (convoUpdateErr) {
    return res.status(500).json(convoUpdateErr);
  }

  res.json({ ok: true });
});


/**
 * Get messages
 */
app.get("/messages/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("messages")
    .select("id, sender, text, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  if (error) return res.status(500).json(error);
  res.json(data);
});


// 👀 Get operator typing state (for user widget)
app.get("/support/typing/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("conversations")
    .select("operator_typing")
    .eq("id", id)
    .single();

  if (error) {
    return res.status(500).json(error);
  }

  res.json({ typing: data.operator_typing });
});

// 👩‍💼 Get operator join status (for widget)
app.get("/support/status/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("conversations")
    .select("operator_joined, operator_name, status")
    .eq("id", id)
    .single();

  if (error || !data) {
    return res.json({ operatorJoined: false });
  }

  res.json({
    operatorJoined: data.operator_joined === true,
    operatorName: data.operator_name || null,
    status: data.status
  });

});



app.get("/operator/conversations", async (req, res) => {
  const { data, error } = await supabase
    .from("conversations")
    .select(`
  id,
  status,
  business_hours,
  source_page,
  visitor_name,
  visitor_phone,
  last_message_at,
  last_message_from,
  operator_seen
`)

    .order("last_message_at", { ascending: false });

  if (error) return res.status(500).json(error);
  res.json(data);
});


// 👁️ Mark conversation as seen by operator
// 👁️ Mark conversation as seen + JOIN operator
app.post("/operator/seen/:id", operatorAuth, async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from("conversations")
    .update({
      operator_seen: true,
    })
    .eq("id", id);

  if (error) {
    return res.status(500).json({ error: "Failed to mark as seen/join" });
  }

  res.json({ success: true });
});

// 👩‍💼 Operator joins conversation
app.post("/operator/join/:id", operatorAuth, async (req, res) => {
  const { id } = req.params;

  const { data: convo } = await supabase
    .from("conversations")
    .select("operator_joined, operator_join_message_sent")
    .eq("id", id)
    .single();

  if (convo?.operator_joined) {
    return res.json({ ok: true, alreadyJoined: true });
  }

  await supabase
    .from("conversations")
    .update({
      operator_joined: true,
      operator_name: "Nini"
    })
    .eq("id", id);

  if (!convo.operator_join_message_sent) {
    await supabase.from("messages").insert({
      conversation_id: id,
      sender: "system",
      text: "👩‍💼 Nini joined the chat"
    });

    await supabase
      .from("conversations")
      .update({ operator_join_message_sent: true })
      .eq("id", id);
  }

  res.json({ ok: true });
});





// ⌨️ Operator typing indicator
app.post("/operator/typing/:id", operatorAuth, async (req, res) => {
  const { id } = req.params;
  const { typing } = req.body;

  const { error } = await supabase
    .from("conversations")
    .update({ operator_typing: typing === true })
    .eq("id", id);

  if (error) {
    return res.status(500).json({ error: "Failed to update typing state" });
  }

  res.json({ ok: true });
});

// 🔒 Resolve / Close conversation
app.post("/operator/resolve/:id", operatorAuth, async (req, res) => {
  const { id } = req.params;

  // 1️⃣ დახურე conversation
  const { error } = await supabase
    .from("conversations")
    .update({
      status: "closed",
      operator_typing: false
    })

    .eq("id", id);

  if (error) {
    return res.status(500).json({ error: "Failed to close conversation" });
  }

  // 2️⃣ system audit message
  await supabase.from("messages").insert({
    conversation_id: id,
    sender: "system",
    text: "🔒 This conversation has been closed by support."
  });

  res.json({ ok: true });
});





app.get("/operator", (req, res) => {
  res.sendFile(path.resolve("operator/operator.html"));
});

// =============================
// 🔔 Google Chat helper (ONCE)
// =============================
async function sendGoogleChatOnce({
  message,
  conversationId,
  page,
  visitor_name,
  visitor_phone
}) {

  if (!process.env.GOOGLE_CHAT_WEBHOOK) return;

  const operatorLink = `https://yourdomain.com/operator/inbox.html#${conversationId}`;

  const displayName =
    visitor_name && visitor_name.trim()
      ? visitor_name
      : `Visitor #${conversationId.slice(0, 8)}`;

  const phoneLine =
    visitor_phone && visitor_phone.trim()
      ? `📞 Phone: ${visitor_phone}\n`
      : "";

  const payload = {
    text: `📩 *New Support Chat Started*

👤 ${displayName}
${phoneLine}
🗨️ Message:
${message}

🌐 Page:
${page}

🔗 Open conversation:
${operatorLink}`
  };


  await fetch(process.env.GOOGLE_CHAT_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}






const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("✅ Server running on port", PORT);
});
// 🔁 run auto-close every 10 minutes
setInterval(autoCloseInactiveConversations, 10 * 60 * 1000);


function isBusinessHours() {
  const now = new Date();

  // Georgia UTC+4
  const utcHour = now.getUTCHours();
  const hour = (utcHour + 4) % 24;
  const day = now.getUTCDay(); // 0=Sun

  const isWeekday = day >= 1 && day <= 5;
  const isWorkingHour = hour >= 10 && hour < 19;

  return isWeekday && isWorkingHour;
}

// 🕒 AUTO-CLOSE conversations after 24h inactivity
async function autoCloseInactiveConversations() {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: staleConvos, error } = await supabase
    .from("conversations")
    .select("id")
    .eq("status", "open")
    .lt("last_message_at", cutoff);

  if (error || !staleConvos?.length) return;

  for (const convo of staleConvos) {
    await supabase
      .from("conversations")
      .update({ status: "closed", operator_typing: false })
      .eq("id", convo.id);

    await supabase.from("messages").insert({
      conversation_id: convo.id,
      sender: "system",
      text: "⏱️ Conversation closed due to inactivity."
    });
  }
}
