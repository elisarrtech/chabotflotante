const apiUrl = "https://chatboterr-3cbv.onrender.com";

const btn = document.getElementById('chatbotButton');
const chatWindow = document.getElementById('chatbotWindow');
const messagesContainer = document.getElementById('chatbotMessages');
const input = document.getElementById('chatbotInput');
const sendBtn = document.getElementById('chatbotSendBtn');
const closeBtn = document.getElementById('chatbotClose');
const restartBtn = document.getElementById('chatbotRestartBtn');

let questions = [];
let currentIndex = -3;
const answers = {};

// Mostrar u ocultar el chatbot
btn.addEventListener('click', () => {
  chatWindow.style.display = 'flex';
  input.focus();
  if (messagesContainer.innerHTML === '') startChat();
});

closeBtn.addEventListener('click', () => {
  chatWindow.style.display = 'none';
});

restartBtn.addEventListener('click', resetChat);

sendBtn.addEventListener('click', async () => {
  const text = input.value.trim();
  if (!text) return;
  if (input.disabled) {
    addMessage("El chat ha finalizado. Recarga la página para reiniciar.", "bot");
    input.value = "";
    return;
  }
  await sendAnswer(text);
  input.value = "";
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !input.disabled) sendBtn.click();
});

window.addEventListener('load', () => {
  chatWindow.style.display = 'flex';
  input.focus();
  if (messagesContainer.innerHTML === '') startChat();
});

// Agregar mensaje
function addMessage(text, sender = 'bot') {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  if (sender === 'bot') {
    msg.innerHTML = text.replace(/\n/g, '<br>').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  } else {
    msg.textContent = text;
  }
  messagesContainer.appendChild(msg);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Cargar preguntas dinámicamente
async function loadQuestions() {
  try {
    const res = await fetch(`${apiUrl}/get_questions`);
    if (!res.ok) throw new Error('Error al cargar preguntas');
    questions = await res.json();
    questions = questions.filter(q => q.id !== "tiempo_kelloggs" && q.id !== "nombre");
  } catch (e) {
    addMessage('❌ Error al cargar preguntas. Intenta más tarde.', 'bot');
  }
}

// Interpretar tiempo
function parseTime(answer) {
  let lower = answer.toLowerCase();
  let num = answer.match(/\d+/);
  if (!num) return null;
  num = parseInt(num[0]);
  if (lower.includes('km')) num = num * 2;
  return num;
}

// Iniciar chat
async function startChat() {
  addMessage("¡Hola! 👋 Gracias por tu interés en una vacante con MatchStaff.");
  addMessage("Te haré unas preguntas para conocer mejor tu perfil. Comencemos. 😊");
  addMessage("📌 *Nota:* Las vacantes disponibles actualmente son para trabajar cerca de la empresa Kellogg’s Querétaro. Por el momento no contamos con transporte, por lo que es importante saber qué tan lejos te encuentras.");
  addMessage("¿Aproximadamente cuánto tiempo haces desde tu domicilio hasta Kellogg’s? (en minutos)");
  currentIndex = -2;
}

// Procesar respuesta
async function sendAnswer(answer) {
  if (currentIndex === -2) {
    addMessage(answer, "user");
    const time = parseTime(answer);
    if (time === null) {
      addMessage("Por favor, escribe el tiempo aproximado en minutos.", "bot");
      return;
    }
    answers["tiempo_kelloggs"] = answer;
    if (time > 40) {
      addMessage("Lo sentimos, las vacantes son solo para personas que vivan a menos de 40 minutos de Kellogg’s. Gracias por tu interés.", "bot");
      input.disabled = true;
      sendBtn.disabled = true;
      return;
    }
    addMessage("¡Perfecto! ¿Cuál es tu nombre completo?", "bot");
    currentIndex = -1;

  } else if (currentIndex === -1) {
    answers["nombre"] = answer;
    addMessage(answer, "user");
    addMessage("Gracias. Ahora, ¿cuál es tu número de teléfono (10 dígitos)?", "bot");
    currentIndex = -0.5;

  } else if (currentIndex === -0.5) {
    const telefono = answer.trim();
    if (!/^\d{10}$/.test(telefono)) {
      addMessage("El número debe tener exactamente 10 dígitos.", "bot");
      return;
    }
    answers["telefono"] = telefono;
    addMessage(telefono, "user");

    await loadQuestions();
    if (questions.length > 0) {
      currentIndex = 0;
      addMessage(`Gracias ${answers["nombre"]}. ${questions[currentIndex].pregunta}`, "bot");
    } else {
      addMessage("No hay preguntas disponibles.", "bot");
    }

  } else if (currentIndex >= 0 && currentIndex < questions.length) {
    const questionId = questions[currentIndex].id;
    if (questionId === "edad") {
      const edad = parseInt(answer);
      if (isNaN(edad) || edad < 18 || edad > 55) {
        addMessage("Gracias por tu interés. Para esta vacante buscamos personas entre 18 y 55 años.", "bot");
        input.disabled = true;
        sendBtn.disabled = true;
        return;
      }
    }
    answers[questionId] = answer;
    addMessage(answer, "user");
    currentIndex++;
    if (currentIndex < questions.length) {
      addMessage(questions[currentIndex].pregunta, "bot");
    } else {
      mostrarVacantes();
    }

  } else if (currentIndex === questions.length) {
    addMessage(answer, "user");
    if (["1", "2", "3", "4"].includes(answer)) {
      const respuestasVacante = {
        "1": "Sorteador",
        "2": "Ayudante General",
        "3": "Operador de Máquinas",
        "4": "Solo quiere más información"
      };
      addMessage(`Elegiste: ${respuestasVacante[answer]}`, "bot");
      answers["vacante_interes"] = respuestasVacante[answer];
      await submitAnswers();
      addMessage("✅ ¡Gracias! Te contactaremos pronto.", "bot");
      input.disabled = true;
      sendBtn.disabled = true;
    } else {
      addMessage("Por favor, responde con un número entre 1 y 4.", "bot");
    }
  }
}

// Mostrar vacantes al final
function mostrarVacantes() {
  addMessage("📣 Estas son las opciones laborales disponibles cerca de Kellogg’s Querétaro. 🚫 No cuentan con transporte.", "bot");

  addMessage("🔶 <b>1. SORTEADOR@</b><br>💲 $2,550/semana<br>📚 Preparatoria<br>🎁 Bono asistencia $2,040<br>📍 Zona Campo Militar", "bot");

  addMessage("🔹 <b>2. AYUDANTE GENERAL</b><br>💲 $2,232/semana<br>📚 Primaria<br>🎁 Bono asistencia $1,785<br>📍 Zona Campo Militar", "bot");

  addMessage("🔸 <b>3. OPERADOR DE MÁQUINAS</b><br>💲 $2,933/semana<br>📚 Preparatoria<br>🎁 Bono asistencia $2,346<br>📍 Zona Campo Militar", "bot");

  addMessage("¿Te interesa alguna? Responde con:<br>1️⃣ Sorteador@<br>2️⃣ Ayudante General<br>3️⃣ Operador<br>4️⃣ Más info", "bot");

  currentIndex = questions.length;
}

// Guardar respuestas en Sheets
async function submitAnswers() {
  try {
    const res = await fetch(`${apiUrl}/guardar-en-sheets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: Object.values(answers) })
    });
    const result = await res.json();
    console.log('Respuesta del servidor:', result);
  } catch {
    addMessage('❌ Error al enviar respuestas. Intenta más tarde.', 'bot');
  }
}

// Reiniciar todo
function resetChat() {
  messagesContainer.innerHTML = '';
  input.disabled = false;
  sendBtn.disabled = false;
  input.value = '';
  questions = [];
  currentIndex = -3;
  for (const key in answers) delete answers[key];
  startChat();
}
