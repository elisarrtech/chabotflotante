const apiUrl = "https://chatboterr-3cbv.onrender.com";

const btn = document.getElementById('chatbotButton');
const chatWindow = document.getElementById('chatbotWindow');
const messagesContainer = document.getElementById('chatbotMessages');
const input = document.getElementById('chatbotInput');
const sendBtn = document.getElementById('chatbotSendBtn');
const closeBtn = document.getElementById('chatbotClose');
const restartBtn = document.getElementById('chatbotRestartBtn'); // Nuevo botón reinicio

let questions = [];
let currentIndex = -3;
const answers = {};

if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    chatWindow.style.display = 'none';
  });
}

btn.addEventListener('click', () => {
  chatWindow.style.display = 'flex';
  input.focus();
  if (messagesContainer.innerHTML === '') {
    startChat();
  }
});

function showTyping() {
  const typing = document.createElement('div');
  typing.classList.add('message', 'bot', 'typing');
  typing.textContent = 'Escribiendo...';
  typing.id = 'typingIndicator';
  messagesContainer.appendChild(typing);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideTyping() {
  const typing = document.getElementById('typingIndicator');
  if (typing) typing.remove();
}

function addMessage(text, sender = 'bot') {
  hideTyping();
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
    questions = (await res.json()).filter(q => q.id !== "tiempo_kelloggs" && q.id !== "nombre");
  } catch {
    addMessage('No se pudieron cargar las preguntas. Intenta más tarde.');
  }
}

function parseTime(answer) {
  let num = answer.match(/\d+/);
  return num ? parseInt(num[0]) * (answer.toLowerCase().includes('km') ? 2 : 1) : null;
}

async function startChat() {
  addMessage("¡Hola! 👋 Gracias por tu interés en una vacante con MatchStaff.");
  addMessage("Voy a hacerte unas preguntas para conocer mejor tu perfil. Comencemos. 😊");
  addMessage("📌 *Nota:* Las vacantes disponibles actualmente son para trabajar cerca de la empresa Kellogg’s Querétaro. Por el momento no contamos con transporte, por lo que es importante saber qué tan lejos te encuentras del lugar para evaluar si es viable para ti.");
  addMessage("¿Aproximadamente cuánto tiempo haces desde tu domicilio hasta la empresa Kellogg’s ubicada en el Campo Militar? (Responder en minutos).");
  currentIndex = -2;
}

async function sendAnswer(answer) {
  addMessage(answer, "user");
  showTyping();

  await new Promise(resolve => setTimeout(resolve, 700)); // Simula "pensar"

  if (currentIndex === -2) {
    const time = parseTime(answer);
    if (time === null) return addMessage("No entendí tu respuesta. Por favor escribe la cantidad de minutos.");

    answers["tiempo_kelloggs"] = answer;

    if (time > 40) {
      addMessage("Lo siento, las vacantes que tenemos son sólo para personas que vivan a menos de 40 minutos de Kellogg’s. Te agradecemos tu interés y te invitamos a estar pendiente de futuras oportunidades.");
      input.disabled = true;
      sendBtn.disabled = true;
      restartBtn.style.display = 'block';
      return;
    }

    addMessage("¡Perfecto! Ahora, ¿cuál es tu nombre completo?");
    currentIndex = -1;

  } else if (currentIndex === -1) {
    answers["nombre"] = answer;
    addMessage("Gracias. Ahora, por favor indícame tu número de teléfono (10 dígitos):");
    currentIndex = -0.5;

  } else if (currentIndex === -0.5) {
    if (!/^\d{10}$/.test(answer.trim())) {
      addMessage("El número debe tener exactamente 10 dígitos. Inténtalo de nuevo, por favor.");
      return;
    }
    answers["telefono"] = answer.trim();

    await loadQuestions();
    if (questions.length > 0) {
      currentIndex = 0;
      addMessage(`Gracias ${answers["nombre"]}. Ahora, ${questions[currentIndex].pregunta}`);
    } else {
      addMessage("No hay preguntas para mostrar.");
    }

  } else if (currentIndex >= 0 && currentIndex < questions.length) {
    const questionId = questions[currentIndex].id;

    if (questionId === "edad") {
      const edad = parseInt(answer);
      if (isNaN(edad) || edad < 18 || edad > 55) {
        addMessage("Gracias por tu interés 😊. Para esta vacante, buscamos personas entre 18 y 55 años. ¡Te invitamos a estar pendiente de futuras oportunidades!");
        input.disabled = true;
        sendBtn.disabled = true;
        restartBtn.style.display = 'block';
        return;
      }
    }

    answers[questionId] = answer;
    currentIndex++;

    if (currentIndex < questions.length) {
      addMessage(questions[currentIndex].pregunta);
    } else {
      showJobOptions();
    }

  } else if (currentIndex === questions.length) {
    if (["1", "2", "3", "4"].includes(answer)) {
      const respuestasVacante = {
        "1": "¡Genial! Te interesa la vacante de Sorteador.",
        "2": "Perfecto, estás interesado en Ayudante General.",
        "3": "Excelente, te interesa la vacante de Operador de Máquinas.",
        "4": "Claro, te enviaremos más información pronto."
      };
      addMessage(respuestasVacante[answer]);
      addMessage("Muchas gracias por tu interés. Te contactaremos pronto con más detalles.");
      answers["vacante_interes"] = respuestasVacante[answer];

      await submitAnswers();

      input.disabled = true;
      sendBtn.disabled = true;
      restartBtn.style.display = 'block';
    } else {
      addMessage("Por favor responde con un número entre 1 y 4.");
    }
  }
}

function showJobOptions() {
  currentIndex = questions.length;
  addMessage("📣 Tenemos tres opciones laborales para ti, cerca de la empresa <b>Kellogg’s</b> (ubicada cerca del Campo Militar).<br><br>⚠️ <b>IMPORTANTE:</b> Ninguna vacante cuenta con transporte.");

  // Aquí puedes acortar los textos si deseas
  addMessage("🔶 <b>1. SORTEADOR@</b><br>💲 $2,550 semanal bruto<br>🎁 Bono: $2,040<br>📚 Requiere PREPARATORIA<br>⏰ Turnos 4x3", "bot");
  addMessage("🔹 <b>2. AYUDANTE GENERAL</b><br>💲 $2,232 semanal<br>🎁 Bono: $1,785<br>📚 Requiere PRIMARIA", "bot");
  addMessage("🔸 <b>3. OPERADOR DE MÁQUINAS</b><br>💲 $2,933 semanal<br>🎁 Bono: $2,346<br>📚 Requiere PREPARATORIA", "bot");
  addMessage("📍<b>IMPORTANTE:</b> Por el momento NO contamos con transporte.", "bot");
  addMessage("¿Te interesa alguna de estas vacantes? Por favor responde con:<br>1️⃣ Sorteador@<br>2️⃣ Ayudante General<br>3️⃣ Operador de Máquinas<br>4️⃣ Solo quiero más información", "bot");
}

sendBtn.addEventListener('click', async () => {
  const text = input.value.trim();
  if (!text) return;

  if (input.disabled) {
    addMessage("El chat ha finalizado. Pulsa el botón de reinicio para comenzar de nuevo.");
    input.value = "";
    return;
  }

  await sendAnswer(text);
  input.value = "";
});

input.addEventListener('keydown', e => {
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
    addMessage('✅ Datos guardados correctamente.');
  } catch {
    addMessage('❌ Error enviando respuestas. Intenta más tarde.');
  }
}

// Cargar chat automáticamente si quieres
window.addEventListener('load', () => {
  chatWindow.style.display = 'flex';
  input.focus();
  if (messagesContainer.innerHTML === '') {
    startChat();
  }
});

