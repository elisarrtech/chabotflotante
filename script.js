const apiUrl = "https://chatboterr-3cbv.onrender.com";

const btn = document.getElementById('chatbotButton');
const chatWindow = document.getElementById('chatbotWindow');
const messagesContainer = document.getElementById('chatbotMessages');
const input = document.getElementById('chatbotInput');
const sendBtn = document.getElementById('chatbotSendBtn');

let questions = [];
let currentIndex = -3;  // Estados: -3 inicial, -2 tiempo Kellogg’s, -1 nombre, >=0 preguntas API
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
    msg.innerHTML = text.replace(/\n/g, '<br>').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
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
    let allQuestions = await res.json();
    // Filtramos solo las preguntas que NO sean "tiempo_kelloggs" ni "nombre"
    questions = allQuestions.filter(q => q.id !== "tiempo_kelloggs" && q.id !== "nombre");
  } catch (e) {
    console.error("Error cargando preguntas:", e);
    addMessage('No se pudieron cargar las preguntas. Intenta más tarde.', 'bot');
  }
}

async function startChat() {
  addMessage("¡Hola! 👋 Gracias por tu interés en una vacante con MatchStaff.");
  addMessage("📌 Nota: Las vacantes disponibles son para trabajar cerca de Kellogg’s. Por ahora no contamos con transporte, por lo que es importante saber qué tan lejos vives.");
  addMessage("⌚ ¿Cuánto tiempo haces desde tu casa hasta Kellogg’s? (Minutos o kilómetros).");
  currentIndex = -2;
  input.disabled = false;
  sendBtn.disabled = false;
}

function parseTime(answer) {
  let lower = answer.toLowerCase();
  let num = answer.match(/\d+/);
  if (!num) return null;
  num = parseInt(num[0]);
  if (lower.includes('km')) num *= 2;
  return num;
}

async function sendAnswer(answer) {
  if (currentIndex === -2) {
    addMessage(answer, "user");
    const time = parseTime(answer);
    if (time === null) {
      addMessage("No entendí tu respuesta. Por favor escribe la cantidad en minutos o kilómetros.", "bot");
      return;
    }
    answers["tiempo_kelloggs"] = answer;

    if (time > 30) {
      addMessage("Lo siento, las vacantes son solo para personas que vivan a menos de 30 minutos de Kellogg’s. Te agradecemos tu interés.", "bot");
      input.disabled = true;
      sendBtn.disabled = true;
      addMessage("Si quieres, escribe <b>reiniciar</b> para comenzar de nuevo.", "bot");
      currentIndex = -99;  // Chat finalizado
      return;
    }

    addMessage("¡Perfecto! ¿Cuál es tu nombre completo?", "bot");
    currentIndex = -1;

  } else if (currentIndex === -1) {
    addMessage(answer, "user");
    answers["nombre"] = answer;

    await loadQuestions();

    if (questions.length > 0) {
      currentIndex = 0;
      addMessage(`Mucho gusto, ${answers["nombre"]}. ${questions[currentIndex].pregunta}`, "bot");
    } else {
      addMessage("No hay preguntas disponibles en este momento.", "bot");
      input.disabled = true;
      sendBtn.disabled = true;
      currentIndex = -99;
    }
  } else if (currentIndex >= 0 && currentIndex < questions.length) {
    addMessage(answer, "user");
    answers[questions[currentIndex].id] = answer;
    currentIndex++;
    if (currentIndex < questions.length) {
      addMessage(questions[currentIndex].pregunta, "bot");
    } else {
      addMessage("📣 Tenemos dos opciones laborales para ti cerca de Kellogg’s (Campo Militar). Ambas NO cuentan con transporte.", "bot");
      addMessage("🔶 <b>1. PALETIZADOR</b> - $2,355 semanal - PREPARATORIA - Comedor pagado y más...", "bot");
      addMessage("🔹 <b>2. AYUDANTE GENERAL</b> - $1,800 semanal aprox - PRIMARIA - Comedor pagado y más...", "bot");
      addMessage("¿Te interesa alguna vacante? Responde con:<br>1️⃣ Paletizador<br>2️⃣ Ayudante general<br>3️⃣ Ambas vacantes<br>4️⃣ Solo quiero más información", "bot");

      currentIndex = questions.length;  // Esperando respuesta
    }
  }
}

sendBtn.addEventListener('click', async () => {
  const text = input.value.trim();
  if (!text) return;

  if (currentIndex === -99) { // Chat finalizado, esperar reinicio
    if (text.toLowerCase() === 'reiniciar') {
      messagesContainer.innerHTML = '';
      Object.keys(answers).forEach(k => delete answers[k]);
      await startChat();
    } else {
      addMessage("Chat finalizado. Escribe <b>reiniciar</b> para empezar de nuevo.", "bot");
    }
    input.value = "";
    return;
  }

  if (currentIndex >= questions.length) {
    addMessage(text, "user");
    if (["1","2","3","4"].includes(text)) {
      let respuesta = {
        "1": "¡Genial! Te interesa la vacante de Paletizador.",
        "2": "Perfecto, estás interesado en Ayudante General.",
        "3": "Excelente, te interesan ambas vacantes.",
        "4": "Claro, te enviaremos más información pronto."
      }[text];

      addMessage(respuesta, "bot");
      addMessage("Muchas gracias por tu interés. Te contactaremos pronto con más detalles.", "bot");

      answers["vacante_interes"] = respuesta;

      await submitAnswers();
      await saveToSheets();

      input.disabled = true;
      sendBtn.disabled = true;
    } else {
      addMessage("Por favor responde con un número del 1 al 4.", "bot");
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

async function saveToSheets() {
  const orderedData = [
    answers["tiempo_kelloggs"] || "",
    answers["nombre"] || "",
    ...questions.map(q => answers[q.id] || ""),
    answers["vacante_interes"] || ""
  ];

  try {
    const res = await fetch(`${apiUrl}/guardar-en-sheets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: orderedData })
    });
    const data = await res.json();
    addMessage(data.message || "Respuestas guardadas en Sheets.", "bot");
  } catch {
    addMessage("Error guardando respuestas en Sheets.", "bot");
  }
}
