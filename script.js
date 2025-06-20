const apiUrl = "https://chatboterr-3cbv.onrender.com";

const btn = document.getElementById('chatbotButton');
const chatWindow = document.getElementById('chatbotWindow');
const messagesContainer = document.getElementById('chatbotMessages');
const input = document.getElementById('chatbotInput');
const sendBtn = document.getElementById('chatbotSendBtn');

let questions = [];
let currentIndex = -3;
const answers = {};

btn.addEventListener('click', () => {
  chatWindow.style.display = 'flex';
  input.focus();
  if (messagesContainer.innerHTML === '') {
    startChat();
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
    num = num * 2;
  }
  return num;
}

async function startChat() {
  addMessage("¡Hola! 👋 Gracias por tu interés en una vacante con MatchStaff.");
  addMessage("Voy a hacerte unas preguntas para conocer mejor tu perfil. Comencemos. 😊");
  addMessage("📌 *Nota:* Las vacantes disponibles actualmente son para trabajar cerca de la empresa Kellogg’s Querétaro. Por el momento no contamos con transporte, por lo que es importante saber qué tan lejos te encuentras del lugar para evaluar si es viable para ti.");
  addMessage("¿Aproximadamente cuánto tiempo haces desde tu domicilio hasta la empresa Kellogg’s ubicada en el Campo Militar? (Responder en minutos).");
  currentIndex = -2;
}

async function sendAnswer(answer) {
  if (currentIndex === -2) {
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
    answers["nombre"] = answer;
    addMessage(answer, "user");

    addMessage("Gracias. Ahora, por favor indícame tu número de teléfono (10 dígitos):", "bot");
    currentIndex = -0.5;

  } else if (currentIndex === -0.5) {
    const telefono = answer.trim();
    if (!/^\d{10}$/.test(telefono)) {
      addMessage("El número debe tener exactamente 10 dígitos. Inténtalo de nuevo, por favor.", "bot");
      return;
    }

    answers["telefono"] = telefono;
    addMessage(telefono, "user");

    await loadQuestions();

    if (questions.length > 0) {
      currentIndex = 0;
      addMessage(`Gracias ${answers["nombre"]}. Ahora, ${questions[currentIndex].pregunta}`, "bot");
    } else {
      addMessage("No hay preguntas para mostrar.", "bot");
    }

  } else if (currentIndex >= 0 && currentIndex < questions.length) {
    const questionId = questions[currentIndex].id;

    if (questionId === "edad") {
      const edad = parseInt(answer);
      if (isNaN(edad) || edad < 18 || edad > 55) {
        addMessage("Gracias por tu interés 😊. Para esta vacante, buscamos personas entre 18 y 55 años. ¡Te invitamos a estar pendiente de futuras oportunidades!", "bot");
        return;
      }
    }

    answers[questionId] = answer;
    addMessage(answer, "user");
    currentIndex++;

    if (currentIndex < questions.length) {
      addMessage(questions[currentIndex].pregunta, "bot");
    } else {
      addMessage("📣 Tenemos tres opciones laborales para ti, cerca de la empresa <b>Kellogg’s</b> (ubicada cerca del Campo Militar).<br><br>⚠️ <b>IMPORTANTE:</b> Ninguna vacante cuenta con transporte.", "bot");

      addMessage(
        "🔶 <b>1. SORTEADOR@</b><br>" +
        "💲 Sueldo semanal bruto: $2,550<br>" +
        "📆 Semana desfasada<br>" +
        "💼 75% prima vacacional<br>" +
        "🎄 30 días de aguinaldo<br>" +
        "💰 Fondo de ahorro: $229.50 semanal<br>" +
        "🎁 Bono de asistencia mensual: $2,040<br>" +
        "🛍 Vales de despensa: $1,020 mensual<br>" +
        "📚 Escolaridad requerida: PREPARATORIA<br>" +
        "🍽 Comedor 100% pagado<br>" +
        "➕ Tiempo extra<br>" +
        "⏰ Turnos 4x3 (12 horas)<br>" +
        "💊 Doping obligatorio<br>" +
        "💳 Pago con tarjeta Santander<br>" +
        "🛡 Seguro de vida<br>" +
        "📍 Empresa ubicada cerca del Campo Militar",
        "bot"
      );

      addMessage(
        "🔹 <b>2. AYUDANTE GENERAL</b><br>" +
        "💲 Sueldo semanal bruto: $2,232<br>" +
        "📆 Semana desfasada<br>" +
        "💼 75% prima vacacional<br>" +
        "🎄 30 días de aguinaldo<br>" +
        "💰 Fondo de ahorro: $201 semanal<br>" +
        "🛍 Vales de despensa: $892.59 mensual<br>" +
        "📚 Escolaridad requerida: PRIMARIA<br>" +
        "🍽 Comedor 100% pagado<br>" +
        "➕ Tiempo extra<br>" +
        "⏰ Turnos 4x3 (12 horas)<br>" +
        "💊 Doping obligatorio<br>" +
        "🎁 Bono de asistencia: $1,785<br>" +
        "💳 Pago con tarjeta Santander<br>" +
        "🛡 Seguro de vida<br>" +
        "📍 Empresa ubicada cerca del Campo Militar",
        "bot"
      );

      addMessage(
        "🔸 <b>3. OPERADOR DE MÁQUINAS</b><br>" +
        "💲 Sueldo semanal bruto: $2,933<br>" +
        "📆 Semana desfasada<br>" +
        "💼 75% prima vacacional<br>" +
        "🎄 30 días de aguinaldo<br>" +
        "💰 Fondo de ahorro: $264 semanal<br>" +
        "🛍 Vales de despensa: $1,173 mensual<br>" +
        "📚 Escolaridad requerida: PREPARATORIA<br>" +
        "🍽 Comedor 100% pagado<br>" +
        "➕ Tiempo extra<br>" +
        "⏰ Turnos 4x3 (12 horas)<br>" +
        "💊 Doping obligatorio<br>" +
        "🎁 Bono de asistencia: $2,346<br>" +
        "💳 Pago con tarjeta Santander<br>" +
        "🛡 Seguro de vida<br>" +
        "📍 Empresa ubicada cerca del Campo Militar",
        "bot"
      );

      addMessage(
        "📍<b>IMPORTANTE:</b> Por el momento NO contamos con transporte para estas vacantes. Es fundamental saber en dónde vives para valorar tu posible traslado.",
        "bot"
      );

      addMessage(
        "¿Te interesa alguna de estas vacantes? Por favor responde con:<br>" +
        "1️⃣ Sorteador@<br>" +
        "2️⃣ Ayudante General<br>" +
        "3️⃣ Operador de Máquinas<br>" +
        "4️⃣ Solo quiero más información",
        "bot"
      );

      currentIndex = questions.length;
    }
  } else if (currentIndex === questions.length) {
    addMessage(answer, "user");

    if (["1", "2", "3", "4"].includes(answer)) {
      const respuestasVacante = {
        "1": "¡Genial! Te interesa la vacante de Sorteador.",
        "2": "Perfecto, estás interesado en Ayudante General.",
        "3": "Excelente, te interesa la vacante de Operador de Máquinas.",
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
    await res.json();
    addMessage('✅ Datos guardados correctamente.', 'bot');
  } catch {
    addMessage('❌ Error enviando respuestas. Intenta más tarde.', 'bot');
  }
}
// Hacer que el chat se abra automáticamente al cargar la página
window.addEventListener('load', () => {
  chatWindow.style.display = 'flex';
  input.focus();
  if (messagesContainer.innerHTML === '') {
    startChat();
  }
});
