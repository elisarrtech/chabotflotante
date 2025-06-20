const apiUrl = "https://chatboterr-3cbv.onrender.com";

const btn = document.getElementById('chatbotButton');
const chatWindow = document.getElementById('chatbotWindow');
const messagesContainer = document.getElementById('chatbotMessages');
const input = document.getElementById('chatbotInput');
const sendBtn = document.getElementById('chatbotSendBtn');

let questions = [];
let currentIndex = -3;  // Estados: -3: inicio, -2: preguntar tiempo, -1: preguntar nombre, 0+: preguntas API
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
  if(sender === 'bot'){
    let formatted = text
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    msg.innerHTML = formatted;
  } else {
    msg.textContent = text;
  }
  messagesContainer.appendChild(msg);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function loadQuestions() {
  try {
    const res = await fetch(`${apiUrl}/get_questions`);
    if (!res.ok) throw new Error('Error al cargar preguntas');
    questions = await res.json();
    // Removemos preguntas que ya manejamos aparte:
    questions = questions.filter(q => q.id !== "tiempo_kelloggs" && q.id !== "nombre");
  } catch (e) {
    addMessage('No se pudieron cargar las preguntas. Intenta más tarde.', 'bot');
  }
}

function parseTime(answer) {
  let lower = answer.toLowerCase();
  let num = answer.match(/\d+/);
  if (!num) return null;
  num = parseInt(num[0]);
  if (lower.includes('km')) {
    num = num * 2;  // Ejemplo de conversión km->minutos
  }
  return num;
}

async function startChat() {
  addMessage("¡Hola! 👋 Gracias por tu interés en una vacante con MatchStaff.");
  addMessage("Voy a hacerte unas preguntas para conocer mejor tu perfil. Comencemos. 😊");
  addMessage("📌 *Nota:* Las vacantes disponibles actualmente son para trabajar cerca de la empresa Kellogg’s. Por el momento no contamos con transporte, por lo que es importante saber qué tan lejos te encuentras del lugar para evaluar si es viable para ti.");
  addMessage("¿Aproximadamente cuánto tiempo haces desde tu domicilio hasta la empresa Kellogg’s? (Responder en minutos).");
  currentIndex = -2; // Estado para pedir tiempo
}

async function sendAnswer(answer) {
  if (currentIndex === -2) {
    // Validamos tiempo primero
    addMessage(answer, "user");
    const time = parseTime(answer);
    if (time === null) {
      addMessage("No entendí tu respuesta. Por favor escribe la cantidad de minutos.", "bot");
      return;
    }
    answers["tiempo_kelloggs"] = answer;

    if (time > 40) {
      addMessage("Lo siento, las vacantes que tenemos son sólo para personas que vivan a menos de 40 minutos de Kellogg’s. Te agradecemos tu interés y te invitamos a estar pendiente de futuras oportunidades.", "bot");
      input.disabled = true;
      sendBtn.disabled = true;
      return;
    }

    addMessage("¡Perfecto! Ahora, ¿cuál es tu nombre completo?", "bot");
    currentIndex = -1;

  } else if (currentIndex === -1) {
    // Preguntamos nombre después del tiempo
    answers["nombre"] = answer;
    addMessage(answer, "user");

    await loadQuestions();

    if (questions.length > 0) {
      currentIndex = 0;
      addMessage(`Mucho gusto, ${answers["nombre"]}! Ahora, ${questions[currentIndex].pregunta}`, "bot");
    } else {
      addMessage("No hay preguntas para mostrar.", "bot");
    }

  } else if (currentIndex >= 0 && currentIndex < questions.length) {
    // Respondemos preguntas dinámicas
    answers[questions[currentIndex].id] = answer;
    addMessage(answer, "user");
    currentIndex++;
    if (currentIndex < questions.length) {
      addMessage(questions[currentIndex].pregunta, "bot");
    } else {
      // Cuando terminan preguntas, mostramos vacantes
      addMessage("📣 Tenemos dos opciones laborales para ti, cerca de la empresa <b>Kellogg’s</b> (ubicada cerca del Campo Militar). Ambas vacantes NO cuentan con transporte.", "bot");
      addMessage("🔶 <b>1. SORTEADOR@</b><br>💲 Sueldo semanal: $2,355<br>📆 Semana desfasada<br>💼 75% prima vacacional<br>🎄 30 días de aguinaldo<br>💰 Fondo de ahorro: $211 semanal<br>🛍 Vales de despensa: $1,020 mensual<br>📚 Escolaridad requerida: PREPARATORIA<br>🍽 Comedor 100% pagado<br>⏰ Turnos 4x3 (12 horas)<br>💊 Doping obligatorio<br>🎁 Bono de asistencia: $2,013<br>💳 Pago con tarjeta Santander<br>🛡 Seguro de vida", "bot");
      addMessage("🔹 <b>2. AYUDANTE GENERAL</b><br>💲 Sueldo semanal libre: $1,800 aprox<br>📆 Semana desfasada<br>💼 75% prima vacacional<br>🎄 30 días de aguinaldo<br>💰 Fondo de ahorro: $200 semanal<br>🛍 Vales de despensa: $892.70 mensual<br>📚 Escolaridad requerida: PRIMARIA<br>🍽 Comedor 100% pagado<br>⏰ Turnos 4x3 (12 horas)<br>💊 Doping obligatorio<br>🎁 Bono de asistencia: $1,785<br>💳 Pago con tarjeta Santander<br>🛡 Seguro de vida", "bot");
      addMessage("🔸 <b>3. OPERADOR DE MÁQUINAS CNC - PLC</b><br>💲 Sueldo semanal bruto: $2,550<br>📆 Semana desfasada<br>💼 75% prima vacacional<br>🎄 30 días de aguinaldo<br>💰 Fondo de ahorro: $230 semanal<br>🛍 Vales de despensa: $1,020 mensual<br>📚 Escolaridad requerida: PREPARATORIA<br>🍽 Comedor 100% pagado<br>➕ Tiempo extra<br>💳 Pago con tarjeta Santander<br>🛡 Seguro de vida<br>⏰ Turnos 4x3 (12 horas)<br>💊 Doping obligatorio<br>🎁 Bono de asistencia: $2,040<br>📍 Empresa ubicada cerca del Campo Militar", "bot");
      addMessage("📍<b>IMPORTANTE:</b> Por el momento NO contamos con transporte para estas vacantes. Es fundamental saber en dónde vives para valorar tu posible traslado.", "bot");
      addMessage("¿Te interesa alguna de estas vacantes? Por favor responde con:<br>1️⃣ Sorteador@ <br>2️⃣ Ayudante general<br>3️⃣ Operador Máquinas CNC <br>4️⃣ Solo quiero más información", "bot");

      currentIndex = questions.length; // Estado para selección de vacantes
    }
  } else if (currentIndex === questions.length) {
    // Respuesta a selección de vacantes
    addMessage(answer, "user");

    if (["1", "2", "3", "4"].includes(answer)) {
      const respuestasVacante = {
        "1": "¡Genial! Te interesa la vacante de Paletizador.",
        "2": "Perfecto, estás interesado en Ayudante General.",
        "3": "Excelente, te interesa la vacante de Operador CNC.",
        "4": "Claro, te enviaremos más información pronto."
      };
      addMessage(respuestasVacante[answer], "bot");
      addMessage("Muchas gracias por tu interés. Te contactaremos pronto con más detalles.", "bot");

      answers["vacante_interes"] = respuestasVacante[answer];

      await submitAnswers();

      input.disabled = true;
      sendBtn.disabled = true;
    } else {
      addMessage("Por favor responde con un número entre 1 y 4.", "bot");
    }
  }
}

sendBtn.addEventListener('click', async () => {
  const text = input.value.trim();
  if (!text) return;

  if (input.disabled) {
    addMessage("El chat ha finalizado. Por favor recarga la página para iniciar de nuevo.", "bot");
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
    const res = await fetch(`${apiUrl}/guardar-en-sheets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: Object.values(answers) })
    });
    const data = await res.json();
    addMessage(data.message || 'Respuestas guardadas en Google Sheets.', 'bot');
  } catch {
    addMessage('Error enviando respuestas a Google Sheets. Intenta más tarde.', 'bot');
  }
}
