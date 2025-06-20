const apiUrl = "https://chatboterr-3cbv.onrender.com";

const chatWindow = document.getElementById('chatbotWindow');
const messagesContainer = document.getElementById('chatbotMessages');
const input = document.getElementById('chatbotInput');
const sendBtn = document.getElementById('chatbotSendBtn');
const restartBtn = document.getElementById('chatbotRestartBtn');
const closeBtn = document.getElementById('chatbotClose');


// Crear botón flotante para reabrir el chat
const openChatBtn = document.createElement('button');
openChatBtn.id = 'chatbotOpenBtn';
openChatBtn.innerHTML = '<img src="img/MATCH-STAFF-1.png" alt="Abrir Chat" style="width: 32px; height: 32px;" />';
Object.assign(openChatBtn.style, {
  position: 'fixed',
  bottom: '25px',
  right: '25px',
  width: '60px',
  height: '60px',
  padding: '10px',
  backgroundColor: '#61CE70',
  borderRadius: '50%',
  border: 'none',
  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
  cursor: 'pointer',
  zIndex: '1000',
  display: 'none',
});

document.body.appendChild(openChatBtn);

// Abrir el chat
openChatBtn.addEventListener('click', () => {
  chatWindow.style.display = 'flex';
  openChatBtn.style.display = 'none';



  input.focus();
});

// Cerrar el chat
closeBtn.addEventListener('click', () => {
  chatWindow.style.display = 'none';
  openChatBtn.style.display = 'block';

 
});


let questions = [];
let currentIndex = -3;
const answers = {};

function addMessage(text, sender = 'bot') {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  if (sender === 'bot') {
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
  } catch {
    addMessage('No se pudieron cargar las preguntas. Intenta más tarde.', 'bot');
  }
}

function parseTime(answer) {
  let lower = answer.toLowerCase();
  let num = answer.match(/\d+/);
  if (!num) return null;
  num = parseInt(num[0]);
  if (lower.includes('km')) num = num * 2;
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
      addMessage("📣 Tenemos tres opciones laborales para ti, cerca de la empresa <b>Kellogg’s</b> (ubicada cerca del Campo Militar).<br><br>⚠️ <b>IMPORTANTE:</b> Ninguna vacante cuenta con transporte.", "bot");
      addMessage("¿Te interesa alguna de estas vacantes? Por favor responde con:<br>1️⃣ Sorteador@<br>2️⃣ Ayudante General<br>3️⃣ Operador de Máquinas<br>4️⃣ Solo quiero más información", "bot");
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

window.addEventListener('load', () => {
  chatWindow.style.display = 'flex';
  openChatBtn.style.display = 'none';
  overlay.style.display = 'none';
  input.focus();
  if (messagesContainer.innerHTML === '') {
    startChat();
  }
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !input.disabled && !sendBtn.disabled) {
    e.preventDefault();
    sendBtn.click();
  }
});

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

restartBtn.addEventListener('click', () => {
  resetChat();
});
