// Variables globales
let currentIndex = -2; // Estado inicial para validar tiempo
let questions = [];
let answers = {};

const input = document.getElementById("chatbotInput");
const sendBtn = document.getElementById("chatbotSendBtn");
const chatbotMessages = document.getElementById("chatbotMessages");

// Función para añadir mensajes al chat
function addMessage(text, sender) {
  const div = document.createElement("div");
  div.classList.add("message", sender);
  div.innerHTML = text;
  chatbotMessages.appendChild(div);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight; // scroll abajo
}

// Simula parseo de tiempo en minutos desde texto
function parseTime(text) {
  const match = text.match(/\d+/);
  if (match) {
    return parseInt(match[0], 10);
  }
  return null;
}

// Simula cargar preguntas desde backend (o estáticas)
async function loadQuestions() {
  // Aquí puedes hacer un fetch si tienes backend
  // Para demo usaré preguntas estáticas (menos las excluidas)
  questions = [
    { id: "edad", pregunta: "¿Qué edad tienes?" },
    { id: "correo", pregunta: "¿Cuál es tu correo electrónico?" },
    { id: "escolaridad", pregunta: "¿Cuál es tu escolaridad?" },
    { id: "colonia", pregunta: "¿En qué colonia vives?" },
    { id: "experiencia", pregunta: "Cuéntame sobre tu experiencia laboral." },
    { id: "ultimo_trabajo", pregunta: "¿Dónde fue tu último trabajo y por qué se terminó?" },
    { id: "sueldo_anterior", pregunta: "¿Cuánto ganabas en tu último trabajo?" },
    { id: "mayor_experiencia", pregunta: "¿Cuál consideras que es tu mayor experiencia en la industria?" }
  ];
}

// Simula enviar respuestas a backend
async function submitAnswers() {
  try {
    // Aquí enviarías con fetch a tu backend
    console.log("Respuestas enviadas:", answers);
  } catch (error) {
    console.error("Error al enviar respuestas:", error);
  }
}

// Lógica principal para procesar la respuesta
async function sendAnswer(answer) {
  answer = answer.trim();
  if (!answer) return; // no procesar texto vacío

  if (currentIndex === -2) {
    addMessage(answer, "user");
    const time = parseTime(answer);
    if (time === null) {
      addMessage("No entendí tu respuesta. Por favor escribe la cantidad de minutos o kilómetros.", "bot");
      return;
    }
    answers["tiempo_kelloggs"] = answer;

    if (time > 30) {
      addMessage(
        "Lo siento, las vacantes que tenemos son sólo para personas que vivan a menos de 30 minutos de Kellogg’s. Te agradecemos tu interés y te invitamos a estar pendiente de futuras oportunidades.",
        "bot"
      );
      input.disabled = true;
      sendBtn.disabled = true;
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

  } else if (currentIndex >= 0 && currentIndex < questions.length) {
    if (questions[currentIndex].id === "correo") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(answer.toLowerCase())) {
        addMessage("Por favor, escribe un correo electrónico válido.", "bot");
        return;
      }
    }

    answers[questions[currentIndex].id] = answer;
    addMessage(answer, "user");
    currentIndex++;

    if (currentIndex < questions.length) {
      addMessage(questions[currentIndex].pregunta, "bot");
    } else {
      addMessage(
        "📣 Tenemos dos opciones laborales para ti, cerca de la empresa <b>Kellogg’s</b> (ubicada cerca del Campo Militar). Ambas vacantes NO cuentan con transporte.",
        "bot"
      );
      addMessage(
        "🔶 <b>1. PALETIZADOR</b><br>💲 Sueldo semanal: $2,355<br>📆 Semana desfasada<br>💼 75% prima vacacional<br>🎄 30 días de aguinaldo<br>💰 Fondo de ahorro: $211 semanal<br>🛍 Vales de despensa: $1,020 mensual<br>📚 Escolaridad requerida: PREPARATORIA<br>🍽 Comedor 100% pagado<br>⏰ Turnos 4x3 (12 horas)<br>💊 Doping obligatorio<br>🎁 Bono de asistencia: $2,013<br>💳 Pago con tarjeta Santander<br>🛡 Seguro de vida",
        "bot"
      );
      addMessage(
        "🔹 <b>2. AYUDANTE GENERAL</b><br>💲 Sueldo semanal libre: $1,800 aprox<br>📆 Semana desfasada<br>💼 75% prima vacacional<br>🎄 30 días de aguinaldo<br>💰 Fondo de ahorro: $200 semanal<br>🛍 Vales de despensa: $892.70 mensual<br>📚 Escolaridad requerida: PRIMARIA<br>🍽 Comedor 100% pagado<br>⏰ Turnos 4x3 (12 horas)<br>💊 Doping obligatorio<br>🎁 Bono de asistencia: $1,785<br>💳 Pago con tarjeta Santander<br>🛡 Seguro de vida",
        "bot"
      );
      addMessage(
        "📍<b>IMPORTANTE:</b> Por el momento NO contamos con transporte para estas vacantes. Es fundamental saber en dónde vives para valorar tu posible traslado.",
        "bot"
      );
      addMessage(
        "¿Te interesa alguna de estas vacantes? Por favor responde con:<br>1️⃣ Paletizador<br>2️⃣ Ayudante general<br>3️⃣ Ambas vacantes<br>4️⃣ Solo quiero más información",
        "bot"
      );

      currentIndex = questions.length;
    }

  } else if (currentIndex === questions.length) {
    addMessage(answer, "user");

    if (["1", "2", "3", "4"].includes(answer)) {
      const respuestasVacante = {
        "1": "¡Genial! Te interesa la vacante de Paletizador.",
        "2": "Perfecto, estás interesado en Ayudante General.",
        "3": "Excelente, te interesan ambas vacantes.",
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

// Eventos para abrir/cerrar ventana y enviar mensaje
document.addEventListener("DOMContentLoaded", () => {
  const chatbotButton = document.getElementById("chatbotButton");
  const chatbotWindow = document.getElementById("chatbotWindow");

  chatbotButton.addEventListener("click", () => {
    if (chatbotWindow.style.display === "flex") {
      chatbotWindow.style.display = "none";
    } else {
      chatbotWindow.style.display = "flex";
      input.focus();
    }
  });

  sendBtn.addEventListener("click", () => {
    const answer = input.value;
    if (answer.trim() !== "") {
      sendAnswer(answer);
      input.value = "";
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      sendBtn.click();
    }
  });

  // Mensaje inicial para comenzar el flujo
  addMessage("Hola! ¿A cuánto tiempo está la empresa Kellogg’s desde tu casa? Por el momento no contamos con transporte.", "bot");
});
