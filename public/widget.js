let state = "start";
let selectedService = null
const body = document.getElementById("geg-chat-body")
let mode = "menu";
let operatorJoined = false;
let operatorName = "Nini"; // ფიქსირებული სახელით
let conversationId = null;




let userData = {
  name: "",
  email: "",
  phone: ""
};

let inputStep = null;


/* document.getElementById("geg-chat-launcher").onclick = () => {
  document.getElementById("geg-chat-window").classList.add("open");
  document.getElementById("chat-wrapper").style.display = "none";
  document.getElementById("geg-chat-launcher").style.display = "none";
  document.getElementById("side-typing").style.display = "none";

  // 🔁 თუ უკვე არსებობს ჩატი — დავაბრუნოთ
  const savedConversationId =
    localStorage.getItem("active_conversation_id");

  if (savedConversationId) {
    conversationId = savedConversationId;
    mode = "live-chat";
    restoreConversation(savedConversationId);
    return; // ❗️ძალიან მნიშვნელოვანია
  }

  render(); // 👈 მხოლოდ ახალი ჩატისას
}; */

document.getElementById("geg-chat-close").onclick = () => {
    // 📡 notify parent (Wix)
  window.parent.postMessage({ type: "CHAT_CLOSE" }, "*");

  // ✅ მხოლოდ ჩაკეცვა (MINIMIZE)

  // ფანჯრის დამალვა animation-ით
  document.getElementById("geg-chat-window").classList.remove("open");

  // launcher + side ტექსტის დაბრუნება
  document.getElementById("geg-chat-launcher").style.display = "flex";
  document.getElementById("side-typing").style.display = "block";
  document.getElementById("chat-wrapper").style.display = "flex";

  // ❗️არ ვეხებით:
  // conversationId
  // mode
  // polling-ებს
  // localStorage
};


document.getElementById("chat-wrapper").onclick = openChat;

/* document.getElementById("geg-chat-close").onclick = () => {
  document.getElementById("geg-chat-window").classList.remove("live-mode");
  document.getElementById("live-chat").style.display = "none";

  document.getElementById("geg-chat-window").classList.remove("open");

  document.getElementById("geg-chat-launcher").style.display = "flex";
  document.getElementById("side-typing").style.display = "block";
  document.getElementById("chat-wrapper").style.display = "flex";
  if (mode === "closed") {
    localStorage.removeItem("active_conversation_id");
  }

  if (messagePoll) {
    clearInterval(messagePoll);
    messagePoll = null;
  }

  if (typingPoll) {
    clearInterval(typingPoll);
    typingPoll = null;
  }


  state = "start";
  selectedService = null;
  userData = { name: "", email: "", phone: "" };
  inputStep = null;


  // ❌ ესენი აღარ უნდა იყოს
  // conversationId = null;
  // operatorJoined = false;

  mode = "menu";

}; */

function openChat() {
  window.parent.postMessage({ type: "CHAT_OPEN" }, "*");

  document.getElementById("geg-chat-window").classList.add("open");
  document.getElementById("chat-wrapper").style.display = "none";
  document.getElementById("geg-chat-launcher").style.display = "none";
  document.getElementById("side-typing").style.display = "none";

  const savedConversationId =
    localStorage.getItem("active_conversation_id");

  if (savedConversationId) {
    conversationId = savedConversationId;
    mode = "live-chat";
    restoreConversation(savedConversationId);
    return;
  }

  render();
}


function isUserNearBottom() {
  const thread = document.getElementById("lcMessages");
  if (!thread) return true;

  const threshold = 80; // px
  return (
    thread.scrollHeight -
    thread.scrollTop -
    thread.clientHeight
  ) < threshold;
}


function scrollLiveToBottom(force = false) {
  const thread = document.getElementById("lcMessages");
  if (!thread) return;

  if (!force && !isUserNearBottom()) {
    return; // Messenger-ის ქცევა
  }

  requestAnimationFrame(() => {
    thread.scrollTop = thread.scrollHeight;
  });
}





function goHomeSafe() {
  state = "start";
  render();
}

function goServicesSafe() {
  state = "services";
  render();
}


function render() {
  if (state === "start") startView();
  if (state === "services") servicesView();
  if (state === "detail") detailView();
  if (state === "guides") openGuides();
}



function startView() {
  body.innerHTML = `

    <!-- HERO -->
    <div class="home-hero">
      <div class="welcome-title">Hello! 👋 Welcome to Gegidze.</div>
      <div class="welcome-sub">
        A better future for your business starts here.
      </div>
    </div>

    
    <!-- SERVICES -->
    <div class="home-section">
      <div class="home-section-title">Choose your service 👇</div>

      <div class="home-card" onclick="openServiceCards()">
        <strong>🚀 Services</strong>
        <div class="home-meta">
          Company setup, tax optimization, relocation & more
        </div>
      </div>

      <div class="home-card" onclick="startJobs()">
        <strong>💼 Jobs & Careers</strong>
        <div class="home-meta">
          Open positions & hiring support
        </div>
      </div>
    </div>
    
    
    
    <!-- PRIMARY CTAs -->
    <div class="cta-list">

      <div class="cta-row primary" onclick="openPreChatForm()">
        <div class="cta-icon">${chatIcon}</div>
        <div class="cta-text">
          <div class="cta-title">Chat with our team</div>
          <div class="cta-sub">Instant help from our support</div>
        </div>
        <span class="cta-arrow">›</span>
      </div>

      <div class="cta-row" onclick="bookCall()">
        <div class="cta-icon">📅</div>
        <div class="cta-text">
          <div class="cta-title">Book a quick call</div>
          <div class="cta-sub">15-minute consultation</div>
        </div>
        <span class="cta-arrow">›</span>
      </div>

      <div class="cta-row whatsapp" onclick="talkToSalesWhatsapp()">
        <div class="cta-icon">${whatsappIcon}</div>
        <div class="cta-text">
          <div class="cta-title">Talk to sales on WhatsApp</div>
          <div class="cta-sub">Fast response via WhatsApp</div>
        </div>
        <span class="cta-arrow">›</span>
      </div>

    </div>

    

  `;
}



function servicesView() {
  body.innerHTML = `
    <div class="back" onclick="goHomeSafe()">
      ← Back
    </div>

    <div class="message">
      Choose your service 👇
    </div>

    <div class="home-card" onclick="openServiceCards()">
      <strong>🚀 Services</strong>
      <div class="home-meta">
        Company setup, tax optimization, relocation & more
      </div>
    </div>

    <div class="home-card" onclick="startJobs()">
      <strong>💼 Jobs & Careers</strong>
      <div class="home-meta">
        Open positions & hiring support
      </div>
    </div>
  `;
}



function detailView() {
  let content = "";

  if (selectedService === "Special Tax Regimes") {
    content = `
      <div class="message"><strong>Special Tax Regimes</strong></div>

      <div class="message">
        • Full compliance<br>
        • No VAT globally<br>
        • Multicurrency banking<br>
        • No relocation required
      </div>

      <div class="message">
        🧳 Setup: 999 EUR<br>
        📅 Monthly: from 99 EUR<br>
        🗓 Annual option available
      </div>
    `;
  }

  if (selectedService === "Relocation") {
    content = `
      <div class="message"><strong>Relocation</strong></div>

      <div class="message">
        • Visa & residence permits<br>
        • Post-arrival support<br>
        • Property & address assistance<br>
        • Bank account setup<br>
        • Business incorporation support
      </div>

      <div class="message">
        🧳 Packages available<br>
        ▫️ Basic — 500 EUR<br>
        ▫️ Standard — 1,000 EUR<br>
        ▫️ Premium — 2,000 EUR
      </div>
    `;
  }

  if (selectedService === "Crypto → Fiat Conversion") {
    content = `
      <div class="message"><strong>Crypto → Fiat Conversion</strong></div>

      <div class="message">
        • Full compliance<br>
        • No VAT globally<br>
        • Multilingual support<br>
        • 100% remote setup
      </div>
    `;
  }

  if (selectedService === "Company Registration") {
    content = `
      <div class="message"><strong>Company Registration</strong></div>

      <div class="message">
        • LLC setup in under 1 business day<br>
        • Fully remote, no relocation<br>
        • One of the world’s most business-friendly country
      </div>

      <div class="message">
        🧳 Setup: 799 EUR
      </div>
    `;
  }

  if (selectedService === "0% Tax Solution") {
    content = `
      <div class="message"><strong>0% Tax Solution</strong></div>

      <div class="message">
        • 0% corporate tax<br>
        • 0% VAT on exports<br>
        • Fully remote setup
      </div>

      <div class="message">
        🧳 Setup fee: 1,499 EUR
      </div>
    `;
  }

  if (selectedService === "Tax Optimization 1% IE") {
    content = `
      <div class="message"><strong>Tax Optimization 1% IE</strong></div>

      <div class="message">
        • Legal & compliant setup<br>
        • Fully remote, non-resident friendly<br>
        • Registration in 3 business days
      </div>

      <div class="message">
        🧳 Setup: 999 EUR<br>
        📅 Monthly: from 99 EUR<br>
        🗓 Annual option available
      </div>
    `;
  }

  body.innerHTML = `
<div class="back" onclick="goServiceCardsSafe()">← Back</div>




    ${content}

    <div class="message">
      🚀 Don't miss out! A quick call can clear everything up! 📞✨
    </div>

    <div class="btn" onclick="bookCall()">
  📅 Book a quick call
</div>

<div class="btn whatsapp-btn" onclick="talkToSalesWhatsapp()">
  <span class="wa-icon">${whatsappIcon}</span>
  <span>Talk to sales on WhatsApp</span>
</div>

<div class="btn" onclick="startLeadFlow()">
  📞 Leave your number
</div>

  `;
}


function card(title, desc, img) {
  return `
    <div class="card">
      <div class="card-image"><img src="assets/${img}"></div>
      <div class="card-body">
        <div class="card-title">${title}</div>
        <div class="card-desc">${desc}</div>
        <button onclick="selectService('${title}')">Select</button>
      </div>
    </div>
  `
}

function bookCall() {
  const url = "https://book.gegidze.com/#/253580000000051034?utm_source=gegidze_meta&utm_medium=meta_organic&utm_campaign=chatbot_book_call&utm_content=chatbot_message";
  window.open(url, "_blank");
}
function openCareers() {
  window.open(
    "https://team-up.zohorecruit.com/jobs/Careers",
    "_blank"
  );
}
function openHiringChat() {
  window.open(
    "https://m.me/webuildteam?ref=w48485851",
    "_blank"
  );
}

function openBlog(slug) {
  window.open(`https://gegidze.com/blog/${slug}`, "_blank");
}


function talkToSales() {
  if (!selectedService) return;

  const phone = "995591966517";
  const message = `👋 Hi, I would like to learn more about ${selectedService}`;
  const encodedMessage = encodeURIComponent(message);

  const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`;
  window.open(url, "_blank");
}

function openPreChatForm() {
  inputStep = "prechat";

  body.innerHTML = `
    <div class="back" onclick="goHomeSafe()">← Back</div>

    <div class="message">
      👋 Before we connect you with our team,<br>
      please share your details.
    </div>

    <div class="prechat-form">

      <!-- FULL NAME -->
      <div>
        <div class="input-label">Full name</div>
        <input
          id="prechatName"
          class="prechat-input"
          placeholder="full name"
        />
      </div>

      <!-- PHONE -->
      <div>
        <div class="input-label">Mobile number</div>

        <div class="phone-row">
          <select id="prechatCode" class="phone-code">
            ${renderCountryCodes()}
          </select>

          <input
            id="prechatPhone"
            class="phone-number"
            placeholder="5XX XX XX XX"
          />
        </div>
      </div>

      <div
        class="btn btn-primary"
        onclick="submitPreChatCombined()">
        Continue
      </div>

    </div>
  `;
}




function startLeadFlow() {
  inputStep = "name";

  body.innerHTML = `
    <div class="back" onclick="goServicesSafe()">← Back</div>


    <div class="message">
      Please provide your first and last name 👇
    </div>

    <input id="chatInput" placeholder="Your full name"
      style="width:100%;padding:14px;border-radius:14px;border:1px solid #e5e7eb;margin-bottom:10px" />

    <div class="btn btn-primary" onclick="submitInput()">Continue</div>
  `;
}

function startJobs() {
  body.innerHTML = `
    <div class="back" onclick="goHomeSafe()">
      ← Back
    </div>

    <div class="message">
      💼 <strong>Jobs & Careers</strong><br><br>
      To view all job openings and career opportunities,  
      please visit our official careers page using the link below 👇
    </div>

    <div class="btn jobs-link-btn" onclick="openCareers()">
  🌐 View Job Openings
</div>

<div class="btn messenger-btn no-hover" onclick="openHiringChat()">
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2C6.48 2 2 6.07 2 11.1c0 2.87 1.46 5.4 3.74 7.1V22l3.4-1.87c.92.26 1.9.4 2.86.4 5.52 0 10-4.07 10-9.1S17.52 2 12 2zm1.06 11.78l-2.55-2.72-4.97 2.72 5.47-5.78 2.53 2.72 4.99-2.72-5.47 5.78z" fill="currentColor"/>
  </svg>
  <span>Chat with Hiring Team</span>
</div>


  `;
}



function submitInput() {
  const inputEl = document.getElementById("chatInput");
  if (!inputEl) return;

  const input = inputEl.value.trim();
  if (!input) return;

  // NAME
  if (inputStep === "name") {
    userData.name = input;
    inputStep = "email";

    body.innerHTML = `
      <div class="message">Thanks, ${userData.name} 😊</div>
      <div class="message">Please share your email address 📧</div>

      <input id="chatInput" type="email" placeholder="Your email"
        style="width:100%;padding:14px;border-radius:14px;border:1px solid #e5e7eb;margin-bottom:10px" />

      <div class="btn btn-primary" onclick="submitInput()">Continue</div>
    `;
    return;
  }

  // EMAIL
  if (inputStep === "email") {
    if (!isValidEmail(input)) {
      body.insertAdjacentHTML(
        "beforeend",
        `<div class="message" style="color:#b91c1c">
          ❌ Please enter a valid email address
        </div>`
      );
      return;
    }

    userData.email = input;
    inputStep = "phone";

    body.innerHTML = `
      <div class="message">Almost done 👍</div>
      <div class="message">Leave your contact number 📞</div>

      <input id="chatInput" type="tel" placeholder="+49176..."
        style="width:100%;padding:14px;border-radius:14px;border:1px solid #e5e7eb;margin-bottom:10px" />

      <div class="btn btn-primary" onclick="submitInput()">Finish</div>
    `;
    return;
  }

  // PHONE
  if (inputStep === "phone") {
    if (!isValidPhone(input)) {
      body.insertAdjacentHTML(
        "beforeend",
        `<div class="message" style="color:#b91c1c">
          ❌ Please enter a valid phone number (international format allowed)
        </div>`
      );
      return;
    }

    userData.phone = input;
    inputStep = null;
    finishLead();
  }
}





function finishLead() {
  const fullName = userData.name.trim();
  const nameParts = fullName.split(" ");
  const firstName = nameParts.shift();
  const lastName = nameParts.join(" ") || firstName;

  fetch("https://gegidze-chat-api.onrender.com/lead", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      firstName,
      lastName,
      email: userData.email,
      phone: userData.phone,
      service: selectedService,
      page: window.location.href
    })
  }).catch(() => {
    console.error("Lead submit failed");
  });

  body.innerHTML = `
    <div class="message">
      ✅ Thank you! Your details have been received.
    </div>

    <div class="message">
      👤 ${userData.name}<br>
      📧 ${userData.email}<br>
      📞 ${userData.phone}
    </div>

    <div class="message">
      Our team will contact you shortly 🚀
    </div>
  `;
}

function exitLiveChat() {
  // ⛔ polling stop
  if (messagePoll) {
    clearInterval(messagePoll);
    messagePoll = null;
  }

  if (typingPoll) {
    clearInterval(typingPoll);
    typingPoll = null;
  }

  window.parent.postMessage({ type: "CHAT_CLOSE" }, "*");


  // UI reset
  document.getElementById("live-chat").style.display = "none";
  document.getElementById("geg-chat-window").classList.remove("live-mode");

  // რეჟიმი → მენიუ
  mode = "menu";
  state = "start";

  render(); // 👈 დაბრუნება მთავარ view-ზე
}


function startSupport() {
  if (mode === "closed") {
    operatorJoined = false;
    lastRenderedCount = 0;
  }

  mode = "support-form";

  body.innerHTML = `
  <div class="back" onclick="goHomeSafe()">
    ← Back
  </div>

  <!-- HERO -->
  <div class="home-hero">
    <div class="welcome-title">How can we help you?</div>
    <div class="welcome-sub">
      Find quick answers or talk to our team
    </div>
  </div>

  <!-- FAQ -->
  <div class="home-section">
    <div class="home-section-title">Frequently asked questions</div>

    ${faqItem(
    "How much IE tax do I need to pay?",
    "If you register as an Individual Entrepreneur and qualify for Small Business Status, you pay 1% tax on gross turnover (up to the annual limit). Dividends and profit withdrawals are taxed at 0%."
  )}

    ${faqItem(
    "Do I need to relocate?",
    "No. You can fully set up and operate your Individual Entrepreneur remotely without residing in Georgia."
  )}

    ${faqItem(
    "How much does the service cost?",
    "We offer several packages depending on your needs. You can view transparent pricing on our website."
  )}

    ${faqItem(
    "What about VAT?",
    "If your clients are outside Georgia, your income is typically VAT-exempt."
  )}

    ${faqItem(
    "Do I pay taxes in my resident country?",
    "This depends on your country’s tax laws and double taxation agreements. We strongly recommend a professional consultation."
  )}
  </div>

<div class="cta-list">

  <!-- CHAT -->
  <div class="cta-row primary" onclick="openPreChatForm()">
    <div class="cta-icon">
      ${chatIcon}
    </div>
    <div class="cta-text">
      <div class="cta-title">Chat with our team</div>
      <div class="cta-sub">Instant help from our support</div>
    </div>
    <span class="cta-arrow">›</span>
  </div>

  <!-- CALL -->
  <div class="cta-row" onclick="bookCall()">
    <div class="cta-icon">📅</div>
    <div class="cta-text">
      <div class="cta-title">Book a quick call</div>
      <div class="cta-sub">15-minute consultation</div>
    </div>
    <span class="cta-arrow">›</span>
  </div>

  <!-- WHATSAPP -->
  <div class="cta-row whatsapp" onclick="talkToSalesWhatsapp()">
    <div class="cta-icon whatsapp-icon">
      ${whatsappIcon}
    </div>
    <div class="cta-text">
      <div class="cta-title">Talk to sales on WhatsApp</div>
      <div class="cta-sub">Fast response via WhatsApp</div>
    </div>
    <span class="cta-arrow">›</span>
  </div>

</div>



  `;
}

function faqItem(question, answer) {
  return `
    <div class="faq-item" onclick="this.classList.toggle('open')">
      <div class="faq-q">
        <span>${question}</span>
        <span class="faq-arrow">▾</span>
      </div>
      <div class="faq-a">
        ${answer}
      </div>
    </div>
  `;
}


async function startLiveSupport() {
  const win = document.getElementById("geg-chat-window");
  const liveChat = document.getElementById("live-chat");
  const thread = document.getElementById("lcMessages");

  // UI → live mode
  win.classList.add("live-mode");
  body.innerHTML = "";
  liveChat.style.display = "flex";
  mode = "live-chat";

  // =========================================
  // ✅ CASE 1: conversation უკვე არსებობს
  // =========================================
  if (conversationId) {
    // უბრალოდ UI აღდგენა + polling
    thread.scrollTop = thread.scrollHeight;

    startMessagePolling(conversationId);
    startTypingPolling(conversationId);
    startOperatorPolling(conversationId);

    return; // ⛔ აღარ ვიწყებთ ახალ chat-ს
  }

  // =========================================
  // ✅ CASE 2: localStorage-დან restore
  // =========================================
  const savedConversationId =
    localStorage.getItem("active_conversation_id");

  if (savedConversationId) {
    conversationId = savedConversationId;
    await restoreConversation(savedConversationId);
    return; // ⛔ აღარ ვიწყებთ ახალ chat-ს
  }

  // =========================================
  // 🆕 CASE 3: რეალურად ახალი chat
  // =========================================

  thread.innerHTML = "";

  try {
    const res = await fetch("/support/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Support request",
        page: window.location.href,
        visitor_name: userData.name,
        visitor_phone: userData.phone
      })

    });

    if (!res.ok) {
      throw new Error("Failed to start support chat");
    }

    const data = await res.json();

    conversationId = data.conversationId;

    // 💾 შეინახე მხოლოდ ერთხელ
    localStorage.setItem("active_conversation_id", conversationId);

    // 🧠 reset counters
    lastRenderedCount = 0;
    operatorJoined = false;

    // 🔄 polling-ები
    startMessagePolling(conversationId);
    startTypingPolling(conversationId);
    startOperatorPolling(conversationId);

    thread.scrollTop = thread.scrollHeight;

  } catch (e) {
    console.error("❌ Failed to start support chat", e);

    thread.insertAdjacentHTML("beforeend", `
      <div class="chat-system">
        ⚠️ Unable to start live chat. Please try again later.
      </div>
    `);
  }
}


function startOperatorPolling(conversationId) {
  const interval = setInterval(async () => {
    try {
      const res = await fetch(`/support/status/${conversationId}`);
      if (!res.ok) return;

      const data = await res.json();

      if (data.operatorJoined && !operatorJoined) {
        operatorJoined = true;
        operatorJoinedUI(operatorName);
        clearInterval(interval);
      }
    } catch (e) {
      console.error("operator polling error", e);
    }
  }, 2000);
}



async function sendLiveMessage() {
  const input = document.getElementById("lcInput");
  const text = input.value.trim();
  if (!text || mode === "closed") return;
  if (!conversationId) return;

  input.value = "";

  const thread = document.getElementById("lcMessages");

  const bubble = document.createElement("div");
  bubble.className = "lc-bubble user";
  bubble.textContent = text;
  thread.appendChild(bubble);

  requestAnimationFrame(() => {
    scrollLiveToBottom(true);
  });


  try {
    await fetch("/support/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        message: text,
        sender: "user"
      })
    });
  } catch (e) {
    console.error("send failed", e);
  }
}


function openLiveRep() {
  alert("Live representative will join shortly");
}

function learnMore() {
  window.open("https://gegidze.com/about", "_blank");
}




function isBusinessHours() {
  const now = new Date();

  // Georgia time (თუ სერვერზე სხვა timezoneა)
  const georgiaOffset = 4; // UTC+4
  const utcHour = now.getUTCHours();
  const hour = (utcHour + georgiaOffset) % 24;

  const day = now.getUTCDay(); // 0 = Sunday, 6 = Saturday

  // სამუშაო დღეები: ორშ–პარ
  const isWeekday = day >= 1 && day <= 5;

  // სამუშაო საათები: 10:00 – 19:00
  const isWorkingHour = hour >= 10 && hour < 19;

  return isWeekday && isWorkingHour;
}






function selectService(name) {
  selectedService = name;
  state = "detail";
  render();
}

function go(to) { state = to; render() }
function scrollCards(dir) { document.getElementById("cards").scrollLeft += dir * 232 }

/* Side typing */
const sideText = "Hi there 👋"
const sideEl = document.getElementById("side-text")
let i = 0
function typeSide() {
  if (i < sideText.length) {
    sideEl.textContent += sideText[i++]
    setTimeout(typeSide, 55)
  } else {
    document.getElementById("side-typing").classList.add("done")
  }
}
setTimeout(typeSide, 700)

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// საერთაშორისო ნომერი (+, ციფრები, 7–15 სიგრძე)
function isValidPhone(phone) {
  return /^\+?[0-9\s\-]{7,15}$/.test(phone);
}

document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;

  // 🟢 Live chat
  if (mode === "live-chat") {
    const liveInput = document.getElementById("lcInput");
    if (!liveInput) return;
    e.preventDefault();
    sendLiveMessage();
    return;
  }

  // 🟡 Lead Flow
  // 🟡 Pre-chat ან Lead Flow
  // 🟡 Pre-chat
  if (inputStep === "prechat" && mode !== "live-chat") {
    e.preventDefault();
    submitPreChatCombined();
    return;
  }

  // 🟡 Lead Flow
  if (inputStep && mode !== "live-chat") {
    e.preventDefault();
    submitInput();
  }

});

let typingPoll = null;
let messagePoll = null;
let lastRenderedCount = 0;


function startTypingPolling(conversationId) {
  if (typingPoll) return;

  typingPoll = setInterval(async () => {
    try {
      const res = await fetch(`/support/typing/${conversationId}`);

      if (!res.ok) return;

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) return;

      const data = await res.json();

      const el = document.getElementById("operatorTyping");
      if (!el) return;

      el.style.display = data.typing ? "block" : "none";
    } catch (e) {
      console.error("typing poll error", e);
    }
  }, 1200);
} // ✅ აი ეს იყო დაკარგული


function startMessagePolling(conversationId) {
  if (messagePoll) return;

  messagePoll = setInterval(async () => {
    try {
      // 1️⃣ ჯერ სტატუსი
      const statusRes = await fetch(`/support/status/${conversationId}`);
      if (statusRes.ok) {
        const status = await statusRes.json();

        if (status.status === "closed") {
          clearInterval(messagePoll);
          clearInterval(typingPoll);

          messagePoll = null;
          typingPoll = null;

          mode = "closed";
          operatorJoined = false;
          localStorage.removeItem("active_conversation_id");

          const inputWrap = document.getElementById("lcInputWrapper");
          if (inputWrap) {
            inputWrap.style.display = "none";
          }
        }



      }

      // 2️⃣ მერე მესიჯები
      const res = await fetch(`/messages/${conversationId}`);
      const messages = await res.json();

      const thread = document.getElementById("lcMessages");
      if (!thread || !Array.isArray(messages)) return;

      if (messages.length > lastRenderedCount) {
        const newMessages = messages.slice(lastRenderedCount);

        newMessages.forEach(m => {

          // 🟡 SYSTEM MESSAGE (operator joined / closed etc.)
          if (m.sender === "system") {
            const sys = document.createElement("div");
            sys.className = "chat-system";
            sys.textContent = m.text;
            thread.appendChild(sys);
            return;
          }

          // 🟢 AGENT MESSAGE
          if (m.sender === "operator") {
            const bubble = document.createElement("div");
            bubble.className = "lc-bubble agent";
            bubble.textContent = m.text;
            thread.appendChild(bubble);
          }

        });


        lastRenderedCount = messages.length;
        scrollLiveToBottom();
      }
    } catch (e) {
      console.error("message polling error", e);
    }
  }, 2000);
}



async function restoreConversation(id) {
  const win = document.getElementById("geg-chat-window");
  win.classList.add("live-mode");

  mode = "live-chat";
  operatorJoined = false;
  body.innerHTML = "";
  document.getElementById("live-chat").style.display = "flex";



  const res = await fetch(`/messages/${id}`);
  const messages = await res.json();

  const thread = document.getElementById("lcMessages");
  thread.innerHTML = "";

  messages.forEach(m => {
    const bubble = document.createElement("div");
    bubble.className = `lc-bubble ${m.sender === "user" ? "user" : "agent"}`;
    bubble.textContent = m.text;
    thread.appendChild(bubble);
  });


  lastRenderedCount = messages.length;

  try {
    const statusRes = await fetch(`/support/status/${id}`);
    if (statusRes.ok) {
      const status = await statusRes.json();

      if (status.status === "closed") {
        // stop pollers (უსაფრთხოდ)
        if (messagePoll) clearInterval(messagePoll);
        if (typingPoll) clearInterval(typingPoll);
        messagePoll = null;
        typingPoll = null;

        mode = "closed";
        operatorJoined = false;
        localStorage.removeItem("active_conversation_id");

        const inputWrap = document.getElementById("lcInputWrapper");
        if (inputWrap) {
          inputWrap.style.display = "none";
        }


        const t = document.getElementById("lcMessages");
        if (t) {
          t.insertAdjacentHTML("beforeend", `
    <div class="chat-system">
      🔒 This conversation has been closed. Thank you 🙏
    </div>
  `);
        }

        return; // ✅ აუცილებელია
      }

      if (status.operatorJoined) {
        operatorJoined = true;
        operatorJoinedUI(operatorName);
      }
    }
  } catch (e) { }

  startMessagePolling(id);
  startTypingPolling(id);
  startOperatorPolling(id);

  scrollLiveToBottom(true);


}

function operatorJoinedUI() {
  const status = document.querySelector(".lc-status");
  if (status) status.textContent = "Online • Support";
}





function openGuides() {
  body.innerHTML = `
    <div class="back" onclick="goHomeSafe()">← Back</div>

    <div class="message"><strong>Guides & Blog</strong></div>

    <div class="home-link" onclick="openBlog('1-percent-tax')">
      How 1% tax works in Georgia
    </div>
    <div class="home-link" onclick="openBlog('virtual-zone')">
      Virtual Zone & 0% tax explained
    </div>
    <div class="home-link" onclick="openBlog('payroll-georgia')">
      Payroll & employment in Georgia
    </div>
  `;
}

function blogCard() {
  return `
    <div class="blog-card" onclick="openBlogDirect()">
      <img src="assets/blog1.png" alt="Blog">
      <div class="blog-content">
        <div class="blog-title">
          1% Tax in Georgia: Easy Business Setup
        </div>
        <div class="blog-desc">
          A simple guide to starting a business in Georgia with just 1% tax.
        </div>
      </div>
    </div>
  `;
}



function openBlogDirect() {
  window.open(
    "https://www.gegidze.com/post/1-tax-in-georgia-easy-business-setup",
    "_blank"
  );
}

function openMessagesFromHome() {
  startSupport();
}

function goServiceCardsSafe() {
  openServiceCards();
}



function openServiceCards() {
  body.innerHTML = `
<div class="back" onclick="goHomeSafe()">
  ← Back
</div>



    <div class="message">
      Choose the service 👇
    </div>

    <div class="carousel-wrapper">
      <div class="arrow left" onclick="scrollCards(-1)">‹</div>
      <div class="arrow right" onclick="scrollCards(1)">›</div>

      <div class="carousel" id="cards">
        ${card("Tax Optimization 1% IE", "Reduce your global tax legally", "1.png")}
        ${card("0% Tax Solution", "Perfect for IT & export companies", "2.png")}
        ${card("Company Registration", "Remote Georgian LLC", "3.png")}
        ${card("Crypto → Fiat Conversion", "Receive & convert crypto legally", "4.png")}
        ${card("Relocation", "Visa, residence & banking support", "5.png")}
        ${card("Special Tax Regimes", "Virtual Zone & IC regimes", "6.png")}
      </div>
    </div>
  `;
}

function talkToSalesWhatsapp() {
  const phone = "995591966517";
  const message = "Hi, I’d like to talk to your sales team";
  window.open(
    `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`,
    "_blank"
  );
}

function submitPreChatCombined() {
  const nameEl = document.getElementById("prechatName");
  const codeEl = document.getElementById("prechatCode");
  const phoneEl = document.getElementById("prechatPhone");

  if (!nameEl || !codeEl || !phoneEl) return;

  const name = nameEl.value.trim();
  const phone = phoneEl.value.trim();
  const fullPhone = `${codeEl.value} ${phone}`;

  // reset errors
  nameEl.classList.remove("error");
  phoneEl.classList.remove("error");

  if (!name) {
    nameEl.classList.add("error");
    nameEl.focus();
    return;
  }

  if (!isValidPhone(fullPhone)) {
    phoneEl.classList.add("error");
    phoneEl.focus();
    return;
  }

  userData.name = name;
  userData.phone = fullPhone;

  startLiveSupport(); // 🚀 ჩატის დაწყება
}



const whatsappIcon = `
<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
  <path fill="currentColor"
    d="M12 2C6.477 2 2 6.268 2 11.586c0 2.122.735 4.07 1.973 5.64L2 22l4.938-1.93A10.2 10.2 0 0 0 12 21c5.523 0 10-4.268 10-9.414C22 6.268 17.523 2 12 2zm0 17.09a8.53 8.53 0 0 1-4.348-1.18l-.312-.18-2.93 1.147.78-2.97-.203-.303a7.66 7.66 0 0 1-1.32-4.32C3.667 7.06 7.41 3.91 12 3.91s8.333 3.15 8.333 7.475c0 4.325-3.743 7.704-8.333 7.704zm4.57-5.31c-.25-.12-1.47-.71-1.7-.79-.23-.08-.4-.12-.57.12-.17.25-.66.79-.81.95-.15.17-.3.19-.55.06-.25-.12-1.06-.38-2.02-1.2-.75-.63-1.26-1.41-1.41-1.65-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.57-1.32-.78-1.81-.2-.47-.4-.41-.57-.41h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.08 0 1.23.9 2.42 1.03 2.58.12.17 1.78 2.76 4.33 3.87.61.25 1.09.4 1.46.51.61.18 1.16.15 1.6.09.49-.07 1.47-.59 1.68-1.16.21-.56.21-1.04.15-1.16-.06-.12-.23-.19-.48-.31z"/>
</svg>
`;


const chatIcon = `
<svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"
xmlns="http://www.w3.org/2000/svg">
  <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"
    stroke="currentColor"
    stroke-width="1.6"
    fill="none"
    stroke-linejoin="round"
    stroke-linecap="round"/>
</svg>
`;

function renderCountryCodes() {
  const countries = [
    { code: "+995", label: "GE +995" },
    { code: "+1", label: "US +1" },
    { code: "+44", label: "UK +44" },
    { code: "+49", label: "DE +49" },
    { code: "+33", label: "FR +33" },
    { code: "+34", label: "ES +34" },
    { code: "+39", label: "IT +39" },
    { code: "+31", label: "NL +31" },
    { code: "+46", label: "SE +46" },
    { code: "+47", label: "NO +47" },
    { code: "+45", label: "DK +45" },
    { code: "+48", label: "PL +48" },
    { code: "+90", label: "TR +90" },
    { code: "+971", label: "UAE +971" },
    { code: "+61", label: "AU +61" },
    { code: "+81", label: "JP +81" },
    { code: "+82", label: "KR +82" },
    { code: "+91", label: "IN +91" }
  ];

  return countries
    .map(
      c => `<option value="${c.code}" ${c.code === "+995" ? "selected" : ""}>
        ${c.label}
      </option>`
    )
    .join("");
}




