const apiUrl = "https://chatboterr-3cbv.onrender.com";

const btn = document.getElementById('chatbotButton');
const chatWindow = document.getElementById('chatbotWindow');
const messagesContainer = document.getElementById('chatbotMessages');
const input = document.getElementById('chatbotInput');
const sendBtn = document.getElementById('chatbotSendBtn');

let questions = [];
let currentIndex = -3;  // Estados: -3: inicial, -2: tiempo Kellogg's, -1: nombre, 0+ preguntas API
let answers = {};
let finalized = false;

btn.addEventListener('click', () => {
  if (chatWindow.style.display === 'flex') {
    chatWindow.style.display = 'none';
  } else {
    chatWindow.style.display = 'flex';
    input.focus();
    if (finalized || messagesContainer.innerHTML === '') {
      resetChat();
      startChat();
    }
  }
});

// Agrega mensaje al chat
function addMessage(text, sender = 'bot') {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.innerHTML = sender === 'bot'
    ? text.replace(/\n/g, '<br>').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    : text;
  messagesContainer.appendChild(msg);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Cargar preguntas desde backend
async function loadQuestions() {
  try {
    const res = await fetch(`${apiUrl}/get_questions`);
    if (!res.ok) throw new Error('Error al cargar preguntas');
    questions = await res.json();
    questions = questions.filter(q => q.id !== "tiempo_kelloggs" && q.id !== "nombre");
  } catch (e) {
    addMessage('No se pudieron cargar las preguntas. Intenta más tarde.', 'bot');
  }
}

// Iniciar conversación
function startChat() {
  addMessage("¡Hola! 👋 Gracias por tu interés en una vacante con MatchStaff.");
  addMessage("Voy a hacerte unas preguntas para conocer mejor tu perfil. Comencemos. 😊");
  addMessage("📌 *Nota:* Las vacantes disponibles actualmente son para trabajar cerca de la empresa Kellogg’s. Por el momento no contamos con transporte, por lo que es importante saber qué tan lejos te encuentras del lugar para evaluar si es viable para ti.");
  addMessage("5️⃣ ¿Aproximadamente cuánto tiempo haces desde tu domicilio hasta la empresa Kellogg’s? (Puedes responder en minutos o kilómetros).");
  currentIndex = -2;
}

// Parsear tiempo o distancia
function parseTime(answer) {
  let lower = answer.toLowerCase();
  let num = answer.match(/\d+/);
  if (!num) return null;
  num = parseInt(num[0]);
  if (lower.includes('km')) {
    num = num * 2;
  }
  return num;
}

// Lógica principal de respuestas
async function sendAnswer(answer) {
  if (currentIndex === -2) {
    addMessage(answer, "user");
    const time = parseTime(answer);
    if (time === null) {
      addMessage("No entendí tu respuesta. Por favor escribe la cantidad de minutos o kilómetros.", "bot");
      return;
    }
    answers["tiempo_kelloggs"] = answer;

    if (time > 30) {
      addMessage("Lo siento, las vacantes que tenemos son sólo para personas que vivan a menos de 30 minutos de Kellogg’s. Te agradecemos tu interés y te invitamos a estar pendiente de futuras oportunidades.", "bot");
      input.disabled = true;
      sendBtn.disabled = true;
      finalized = true;
      return;
    }

    addMessage("¡Perfecto! Ahora, ¿cuál es tu nombre completo?", "bot");
    currentIndex = -1;

  } else if (currentIndex === -1) {
    answers["nombre"] = answer;
    addMessage(answer, "user");

    await loadQuestions();

    if (questions.length > 0) {
      currentIndex = 0;
      addMessage(`Mucho gusto, ${answers["nombre"]}! Ahora, ${questions[currentIndex].pregunta}`, "bot");
    } else {
      addMessage("No hay preguntas para mostrar.", "bot");
    }

  } else if (currentIndex < questions.length) {
    answers[questions[currentIndex].id] = answer;
    addMessage(answer, "user");
    currentIndex++;
    if (currentIndex < questions.length) {
      addMessage(questions[currentIndex].pregunta, "bot");
    } else {
      mostrarVacantes();
    }
  }
}

// Mostrar vacantes y opciones al final
function mostrarVacantes() {
  addMessage("📣 Tenemos dos opciones laborales para ti, cerca de la empresa <b>Kellogg’s</b> (ubicada cerca del Campo Militar). Ambas vacantes NO cuentan con transporte.", "bot");
  addMessage("🔶 <b>1. PALETIZADOR</b><br>💲 Sueldo semanal: $2,355<br>📆 Semana desfasada<br>💼 75% prima vacacional<br>🎄 30 días de aguinaldo<br>💰 Fondo de ahorro: $211 semanal<br>🛍 Vales de despensa: $1,020 mensual<br>📚 Escolaridad requerida: PREPARATORIA<br>🍽 Comedor 100% pagado<br>⏰ Turnos 4x3 (12 horas)<br>💊 Doping obligatorio<br>🎁 Bono de asistencia: $2,013<br>💳 Pago con tarjeta Santander<br>🛡 Seguro de vida", "bot");
  addMessage("🔹 <b>2. AYUDANTE GENERAL</b><br>💲 Sueldo semanal libre: $1,800 aprox<br>📆 Semana desfasada<br>💼 75% prima vacacional<br>🎄 30 días de aguinaldo<br>💰 Fondo de ahorro: $200 semanal<br>🛍 Vales de despensa: $892.70 mensual<br>📚 Escolaridad requerida: PRIMARIA<br>🍽 Comedor 100% pagado<br>⏰ Turnos 4x3 (12 horas)<br>💊 Doping obligatorio<br>🎁 Bono de asistencia: $1,785<br>💳 Pago con tarjeta Santander<br>🛡 Seguro de vida", "bot");
  addMessage("📍<b>IMPORTANTE:</b> Por el momento NO contamos con transporte para estas vacantes. Es fundamental saber en dónde vives para valorar tu posible traslado.", "bot");
  addMessage("¿Te interesa alguna de estas vacantes? Por favor responde con:<br>1️⃣ Paletizador<br>2️⃣ Ayudante general<br>3️⃣ Ambas vacantes<br>4️⃣ Solo quiero más información", "bot");
  currentIndex = questions.length;
}

sendBtn.addEventListener('click', async () => {
  const text = input.value.trim();
  if (!text) return;
  
  if (text.toLowerCase() === "reiniciar") {
    resetChat();
    startChat();
    return;
  }

  if (text.toLowerCase() === "finalizar") {
    addMessage("✅ Chat finalizado. ¡Gracias por tu tiempo!", "bot");
    input.disabled = true;
    sendBtn.disabled = true;
    finalized = true;
    setTimeout(() => {
      chatWindow.style.display = 'none';
    }, 2000);
    return;
  }

  if (currentIndex >= questions.length) {
    addMessage(text, "user");
    if (["1", "2", "3", "4"].includes(text)) {
      let respuesta = "";
      switch(text) {
        case "1": respuesta = "¡Genial! Te interesa la vacante de Paletizador."; break;
        case "2": respuesta = "Perfecto, estás interesado en Ayudante General."; break;
        case "3": respuesta = "Excelente, te interesan ambas vacantes."; break;
        case "4": respuesta = "Claro, te enviaremos más información pronto."; break;
      }
      addMessage(respuesta, "bot");
      addMessage("Muchas gracias por tu interés. Te contactaremos pronto con más detalles.", "bot");
      addMessage("✅ Si ya terminaste, escribe <b>finalizar</b> para cerrar el chatbot.", "bot");
      await submitAnswers();
    } else {
      addMessage("Por favor responde con un número entre 1 y 4.", "bot");
    }
    input.value = "";
    return;
  }

  await sendAnswer(text);
  input.value = "";
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !input.disabled && !sendBtn.disabled) {
    e.preventDefault();
    sendBtn.click();
  }
});

async function submitAnswers() {
  try {
    const res = await fetch(`${apiUrl}/submit_answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answers)
    });
    const data = await res.json();
    addMessage(data.message, 'bot');
  } catch {
    addMessage('Error enviando respuestas. Intenta más tarde.', 'bot');
  }
}

// Resetear el estado del chatbot
function resetChat() {
  messagesContainer.innerHTML = "";
  currentIndex = -3;
  answers = {};
  input.disabled = false;
  sendBtn.disabled = false;
  finalized = false;
}
