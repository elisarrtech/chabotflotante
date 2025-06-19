const apiUrl = "https://chatboterr-3cbv.onrender.com";

const btn = document.getElementById('chatbotButton');
const chatWindow = document.getElementById('chatbotWindow');
const messagesContainer = document.getElementById('chatbotMessages');
const input = document.getElementById('chatbotInput');
const sendBtn = document.getElementById('chatbotSendBtn');

let questions = [];
let currentIndex = -3;
let chatEnded = false;
const answers = {};

btn.addEventListener('click', () => {
  if (chatWindow.style.display === 'flex') {
    chatWindow.style.display = 'none';
  } else {
    chatWindow.style.display = 'flex';
    input.focus();
    if (messagesContainer.innerHTML === '') {
      startChat();
    }
  }
});

function addMessage(text, sender = 'bot') {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.innerHTML = sender === 'bot'
    ? text.replace(/\n/g, '<br>').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    : text;
  messagesContainer.appendChild(msg);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function loadQuestions() {
  try {
    const res = await fetch(`${apiUrl}/get_questions`);
    if (!res.ok) throw new Error('Error al cargar preguntas');
    questions = await res.json();
    questions = questions.filter(q => q.id !== "tiempo_kelloggs" && q.id !== "nombre");
  } catch {
    addMessage('No se pudieron cargar las preguntas. Intenta más tarde.', 'bot');
  }
}

function parseTime(answer) {
  let num = answer.match(/\d+/);
  if (!num) return null;
  num = parseInt(num[0]);
  if (answer.toLowerCase().includes('km')) num *= 2;
  return num;
}

async function startChat() {
  chatEnded = false;
  input.disabled = false;
  sendBtn.disabled = false;
  messagesContainer.innerHTML = '';
  currentIndex = -2;
  addMessage("¡Hola! 👋 Gracias por tu interés en una vacante con MatchStaff.");
  addMessage("Voy a hacerte unas preguntas para conocer mejor tu perfil. 😊");
  addMessage("📌 *Nota:* Las vacantes actuales son para trabajar cerca de Kellogg’s. No contamos con transporte, así que necesitamos saber si vives cerca.");
  addMessage("⌚¿Cuánto tiempo haces desde tu casa hasta Kellogg’s? (en minutos o kilómetros).");
}

async function sendAnswer(answer) {
  if (currentIndex === -2) {
    addMessage(answer, "user");
    const time = parseTime(answer);
    if (time === null) {
      addMessage("No entendí tu respuesta. Escribe la cantidad de minutos o kilómetros.", "bot");
      return;
    }
    answers["tiempo_kelloggs"] = answer;

    if (time > 30) {
      addMessage("Lo siento, buscamos personas que vivan a menos de 30 minutos de Kellogg’s. ¡Gracias por tu interés!", "bot");
      endChat();
      return;
    }

    addMessage("¡Perfecto! ¿Cuál es tu nombre completo?", "bot");
    currentIndex = -1;
  } else if (currentIndex === -1) {
    answers["nombre"] = answer;
    addMessage(answer, "user");
    await loadQuestions();
    currentIndex = 0;
    addMessage(`Mucho gusto, ${answers["nombre"]}. ${questions[currentIndex].pregunta}`, "bot");
  } else if (currentIndex < questions.length) {
    answers[questions[currentIndex].id] = answer;
    addMessage(answer, "user");
    currentIndex++;
    if (currentIndex < questions.length) {
      addMessage(questions[currentIndex].pregunta, "bot");
    } else {
      showVacancies();
    }
  }
}

function showVacancies() {
  addMessage("📣 Tenemos dos opciones laborales cerca de <b>Kellogg’s</b> (cerca del Campo Militar):", "bot");
  addMessage("🔶 <b>1. PALETIZADOR</b><br>💲 $2,355 semanal<br>📆 Semana desfasada<br>🍽 Comedor 100% pagado<br>🎁 Bono: $2,013<br>📚 Preparatoria<br>🛡 Seguro de vida", "bot");
  addMessage("🔹 <b>2. AYUDANTE GENERAL</b><br>💲 $1,800 semanal aprox<br>📆 Semana desfasada<br>🍽 Comedor 100% pagado<br>🎁 Bono: $1,785<br>📚 Primaria<br>🛡 Seguro de vida", "bot");
  addMessage("📍<b>IMPORTANTE:</b> No contamos con transporte. Es fundamental conocer tu domicilio.", "bot");
  addMessage("¿Te interesa alguna vacante? Responde con:<br>1️⃣ Paletizador<br>2️⃣ Ayudante general<br>3️⃣ Ambas vacantes<br>4️⃣ Solo quiero más información", "bot");
  currentIndex++;
}

async function sendToGoogleSheets(data) {
  const googleSheetsWebhook = 'https://script.google.com/macros/s/AKfycbxo4FZDa9jGdOW01OwYkLDKIRWeDbZcqq9ZcMzyRDPauuYwn-jfr4r7Ydf4TbRRQR8ugQ/exec'; // Pega aquí tu URL real

  try {
    const response = await fetch(googleSheetsWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    console.log('Google Sheets response:', result.message);
    // Aquí puedes mostrar mensaje en tu chatbot:
    addMessage(result.message || 'Respuestas guardadas en Google Sheets.', 'bot');
  } catch (error) {
    console.error('Error enviando a Google Sheets:', error);
    addMessage('Error enviando respuestas a Google Sheets. Intenta más tarde.', 'bot');
  }
}


  try {
    // Enviar a Google Sheets
    const resSheets = await fetch(googleSheetsWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answers)
    });
    const dataSheets = await resSheets.json();
    addMessage(dataSheets.message || '✔️ Respuestas guardadas en Sheets.', 'bot');
  } catch {
    addMessage('❌ Error enviando a Google Sheets. Intenta más tarde.', 'bot');
  }
}

function endChat() {
  chatEnded = true;
  input.disabled = true;
  sendBtn.disabled = true;
  addMessage("✅ Chat finalizado. Si deseas comenzar de nuevo, escribe <b>reiniciar</b> o recarga la página.", "bot");
}

sendBtn.addEventListener('click', async () => {
  const text = input.value.trim();
  if (!text) return;

  if (chatEnded) {
    if (text.toLowerCase() === 'reiniciar') {
      startChat();
    } else {
      addMessage("El chat ha finalizado. Escribe <b>reiniciar</b> para empezar de nuevo.", "bot");
    }
    input.value = '';
    return;
  }

  // Respuesta final de vacantes
  if (currentIndex > questions.length) {
    addMessage(text, "user");

    if (["1", "2", "3", "4"].includes(text)) {
      let respuesta = {
        "1": "¡Genial! Te interesa la vacante de Paletizador.",
        "2": "Perfecto, estás interesado en Ayudante General.",
        "3": "Excelente, te interesan ambas vacantes.",
        "4": "Claro, te enviaremos más información pronto."
      }[text];
      addMessage(respuesta, "bot");
      addMessage("🎉 Gracias por tu interés. Te contactaremos pronto.", "bot");
      await submitAnswers();
      addMessage("Escribe <b>reiniciar</b> si deseas volver a empezar o <b>finalizar</b> para cerrar el chat.", "bot");
      endChat();
    } else {
      addMessage("Por favor responde con un número del 1 al 4.", "bot");
    }

    input.value = '';
    return;
  }

  // Flujo normal de preguntas
  await sendAnswer(text);
  input.value = '';
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !input.disabled && !sendBtn.disabled) {
    e.preventDefault();
    sendBtn.click();
  }
});
