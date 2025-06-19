# 🤖 Chatbot de Reclutamiento Matchstaff

[![Deploy en GitHub Pages](https://img.shields.io/github/deployments/elisarrtech/chatbot_matchstaff/github-pages?label=GitHub%20Pages&logo=github&style=flat)](https://elisarrtech.github.io/chatbot_matchstaff/)
[![Licencia MIT](https://img.shields.io/badge/Licencia-MIT-green.svg)](LICENSE)
![Hecho con ❤️](https://img.shields.io/badge/hecho%20con-%E2%9D%A4-red)

Este es un chatbot interactivo para **Matchstaff**, diseñado para agilizar la atracción de talento operativo. A través de una interfaz conversacional, recopila datos de candidatos, valida su cercanía a Kellogg’s y les muestra vacantes disponibles, guardando automáticamente la información en Google Sheets.

---

## 📸 Vista previa

![Vista previa del chatbot](https://elisarrtech.github.io/chatbot_matchstaff/)) <!-- Reemplaza con tu URL real o sube la imagen al repositorio -->

---

## 🚀 Funcionalidades

- 🧠 Conversación paso a paso con validaciones
- 📍 Filtrado por tiempo de traslado
- 📋 Presentación de vacantes con detalles
- 🧾 Registro automático en Google Sheets
- 💬 Diseño responsivo y amigable
- 🔘 Botón flotante de acceso rápido


---

## 🛠️ Tecnologías utilizadas

### Frontend

- HTML, CSS y JavaScript puro
- Chatbox personalizado con botón flotante
- Desplegado en [GitHub Pages](https://elisarrtech.github.io/chatbot_matchstaff/)

### Backend

- [Flask](https://flask.palletsprojects.com/) (API REST en Python)
- [gspread](https://github.com/burnash/gspread) para conexión con Google Sheets
- [Render](https://render.com/) para hosting gratuito

---

## 📁 Estructura del proyecto

chatbot_matchstaff/
├── index.html # Interfaz del chatbot
├── style.css # Estilos del chatbot y botón flotante
├── script.js # Lógica del flujo conversacional
└── backend/
├── app.py # Servidor Flask
├── service_account.json # Claves de Google Sheets
└── requirements.txt # Dependencias del backend


---

## ⚙️ Cómo correr el proyecto localmente

### Requisitos:

- Python 3.8+
- Cuenta de Google y acceso a Google Sheets API
- Node.js (opcional para pruebas frontend locales)

### 1. Clona el repositorio

git clone https://github.com/elisarrtech/chatbot_matchstaff.git
cd chatbot_matchstaff/backend

2. Crea un entorno virtual
bash
Copiar
Editar
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

3. Instala dependencias
bash
Copiar
Editar
pip install -r requirements.txt

4. Configura las credenciales
Crea un proyecto en Google Cloud.

Activa la API de Google Sheets.

Descarga el archivo service_account.json y colócalo en la carpeta backend/.

5. Ejecuta el servidor localmente
bash
Copiar
Editar
python app.py
🌐 Enlace en producción
👉 https://elisarrtech.github.io/chatbot_matchstaff/

✅ Pendientes por mejorar
Autenticación para el backend

Manejo de errores con logs

Conexión con base de datos más robusta que Google Sheets (opcional)

Estadísticas y panel de visualización de postulantes

📩 Contacto
Elisarrtech — Desarrollo y automatización educativa y empresarial
📧 elisarrtech@gmail.com

Licencia
Este proyecto es de código abierto bajo la licencia MIT.




