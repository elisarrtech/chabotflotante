async function sendAnswer(answer) {
  if (currentIndex === -2) {
    // Validamos tiempo primero
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
    // Validar correo si la pregunta actual es 'correo'
    if (questions[currentIndex].id === "correo") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(answer.trim())) {
        addMessage("Por favor, escribe un correo electrónico válido.", "bot");
        return; // No avanzar si no es válido
      }
    }

    // Guardar respuesta y avanzar normalmente
    answers[questions[currentIndex].id] = answer;
    addMessage(answer, "user");
    currentIndex++;
    if (currentIndex < questions.length) {
      addMessage(questions[currentIndex].pregunta, "bot");
    } else {
      // Cuando terminan preguntas, mostramos vacantes
      addMessage("📣 Tenemos dos opciones laborales para ti, cerca de la empresa <b>Kellogg’s</b> (ubicada cerca del Campo Militar). Ambas vacantes NO cuentan con transporte.", "bot");
      addMessage("🔶 <b>1. PALETIZADOR</b><br>💲 Sueldo semanal: $2,355<br>📆 Semana desfasada<br>💼 75% prima vacacional<br>🎄 30 días de aguinaldo<br>💰 Fondo de ahorro: $211 semanal<br>🛍 Vales de despensa: $1,020 mensual<br>📚 Escolaridad requerida: PREPARATORIA<br>🍽 Comedor 100% pagado<br>⏰ Turnos 4x3 (12 horas)<br>💊 Doping obligatorio<br>🎁 Bono de asistencia: $2,013<br>💳 Pago con tarjeta Santander<br>🛡 Seguro de vida", "bot");
      addMessage("🔹 <b>2. AYUDANTE GENERAL</b><br>💲 Sueldo semanal libre: $1,800 aprox<br>📆 Semana desfasada<br>💼 75% prima vacacional<br>🎄 30 días de aguinaldo<br>💰 Fondo de ahorro: $200 semanal<br>🛍 Vales de despensa: $892.70 mensual<br>📚 Escolaridad requerida: PRIMARIA<br>🍽 Comedor 100% pagado<br>⏰ Turnos 4x3 (12 horas)<br>💊 Doping obligatorio<br>🎁 Bono de asistencia: $1,785<br>💳 Pago con tarjeta Santander<br>🛡 Seguro de vida", "bot");
      addMessage("📍<b>IMPORTANTE:</b> Por el momento NO contamos con transporte para estas vacantes. Es fundamental saber en dónde vives para valorar tu posible traslado.", "bot");
      addMessage("¿Te interesa alguna de estas vacantes? Por favor responde con:<br>1️⃣ Paletizador<br>2️⃣ Ayudante general<br>3️⃣ Ambas vacantes<br>4️⃣ Solo quiero más información", "bot");

      currentIndex = questions.length; // Estado para selección de vacantes
    }

  } else if (currentIndex === questions.length) {
    // Respuesta a selección de vacantes
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
