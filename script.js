let currentIndex = -2; // comenzamos en estado especial "tiempo_kelloggs"
let questions = [];
let answers = {};

// Función para cargar las preguntas desde la API
async function loadQuestions() {
  const res = await fetch("https://chatboterr-3cbv.onrender.com/get_questions");
  questions = await res.json();
  // Filtramos "tiempo_kelloggs" y "nombre" porque las preguntas iniciales las manejamos aparte
  questions = questions.filter(q => q.id !== "tiempo_kelloggs" && q.id !== "nombre");
}

// Función para agregar mensajes a la ventana del chat (ejemplo)
function addMessage(text, sender) {
  // Implementa según tu UI: agrega un mensaje con clase "bot" o "user"
  const chatWindow = document.getElementById("chat-window");
  const msgDiv = document.createElement("div");
  msgDiv.className = sender === "bot" ? "bot-message" : "user-message";
  msgDiv.textContent = text;
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Función para enviar respuestas a la API
async function submitAnswers() {
  await fetch("https://chatboterr-3cbv.onrender.com/submit_answers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(answers)
  });
  addMessage("¡Gracias! Pronto nos pondremos en contacto contigo.", "bot");
  // Aquí puedes deshabilitar el input y botón si quieres
}

// Función para iniciar el chat con mensajes iniciales
function startChat() {
  addMessage("¡Hola! 👋 Gracias por tu interés en una vacante con MatchStaff.", "bot");
  addMessage("Voy a hacerte unas preguntas para conocer mejor tu perfil. Comencemos. 😊", "bot");
  addMessage("*Nota:* Las vacantes disponibles actualmente son para trabajar cerca de la empresa Kellogg’s. Por el momento no contamos con transporte, por lo que es importante saber qué tan lejos te encuentras del lugar para evaluar si es viable para ti.", "bot");
  addMessage("5️⃣ ¿Aproximadamente cuánto tiempo haces desde tu domicilio hasta la empresa Kellogg’s? (Puedes responder en minutos o kilómetros).", "bot");
  currentIndex = -2; // Estado para tiempo_kelloggs
}

// Función para procesar la respuesta del usuario
async function sendAnswer(answer) {
  if (currentIndex === -2) {
    // Validamos el tiempo/distancia, aquí podrías hacer más validaciones para número o texto
    answers["tiempo_kelloggs"] = answer;
    addMessage(answer, "user");

    // Si es mayor a 30 (minutos o km) terminamos encuesta
    let num = parseInt(answer);
    if (isNaN(num)) {
      addMessage("Por favor, escribe un número aproximado en minutos o kilómetros.", "bot");
      return; // no avanzar
    }
    if (num > 30) {
      addMessage("Lo sentimos, por la distancia no es viable esta vacante para ti. Gracias por tu interés.", "bot");
      await submitAnswers();
      return; // terminar chat aquí
    }

    addMessage("Perfecto, gracias. ¿Cuál es tu nombre completo?", "bot");
    currentIndex = -1; // siguiente estado

  } else if (currentIndex === -1) {
    answers["nombre"] = answer;
    addMessage(answer, "user");

    // Cargar preguntas restantes de la API
    await loadQuestions();

    if (questions.length > 0) {
      currentIndex = 0;
      addMessage(`Mucho gusto, ${answers["nombre"]}! Ahora, ${questions[currentIndex].pregunta}`, "bot");
    } else {
      addMessage("No hay más preguntas.", "bot");
      await submitAnswers();
    }

  } else if (currentIndex < questions.length) {
    answers[questions[currentIndex].id] = answer;
    addMessage(answer, "user");
    currentIndex++;

    if (currentIndex < questions.length) {
      addMessage(questions[currentIndex].pregunta, "bot");
    } else {
      addMessage("¡Gracias por compartir! Estoy enviando tus respuestas...", "bot");
      await submitAnswers();
    }
  }
}
