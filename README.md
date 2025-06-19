# 🤖 Chatbot de Reclutamiento Matchstaff

[![Deploy en GitHub Pages](https://img.shields.io/github/deployments/elisarrtech/chatbot_matchstaff/github-pages?label=GitHub%20Pages&logo=github&style=flat)](https://elisarrtech.github.io/chatbot_matchstaff/)
[![Licencia MIT](https://img.shields.io/badge/Licencia-MIT-green.svg)](LICENSE)
![Hecho con ❤️](https://img.shields.io/badge/hecho%20con-%E2%9D%A4-red)

Este es un chatbot interactivo para **Matchstaff**, diseñado para agilizar la atracción de talento operativo. A través de una interfaz conversacional, recopila datos de candidatos, valida su cercanía a Kellogg’s y les muestra vacantes disponibles, guardando automáticamente la información en Google Sheets.

---

## 📸 Vista previa

![Vista previa del chatbot](https://user-images.githubusercontent.com/your_username/your_screenshot.png) <!-- Reemplaza con tu URL real o sube la imagen al repositorio -->

---

## 🚀 Funcionalidades

- 🧠 Conversación paso a paso con validaciones
- 📍 Filtrado por tiempo de traslado
- 📋 Presentación de vacantes con detalles
- 🧾 Registro automático en Google Sheets
- 💬 Diseño responsivo y amigable
- 🔘 Botón flotante de acceso rápido

---

## 🛠️ Tecnologías

### Frontend:
- HTML + CSS personalizado
- JavaScript puro (sin frameworks)
- GitHub Pages para despliegue

### Backend:
- Python con Flask
- gspread + Google Sheets API
- Render como hosting gratuito del backend

---

## 📁 Estructura del proyecto

chatbot_matchstaff/
├── index.html # Chatbot UI
├── style.css # Estilos del chatbot
├── script.js # Flujo conversacional
└── backend/
├── app.py # Servidor Flask
├── service_account.json # Credenciales de Google
└── requirements.txt # Dependencias backend

---

## ⚙️ Instrucciones para desarrollo local

Crea un entorno virtual:
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

Instala las dependencias:
pip install -r requirements.txt

Agrega tus credenciales de Google:
Crea una cuenta de servicio en Google Cloud
Habilita la API de Google Sheets

Descarga service_account.json y colócalo en /backend
Ejecuta el backend localmente:
python app.py

Prueba el frontend abriendo index.html o visita el enlace en producción.

🌐 Enlace en producción
👉 https://elisarrtech.github.io/chatbot_matchstaff/

✅ Mejoras futuras
Autenticación y control de spam

Dashboard de métricas para reclutadores

Multivacantes y rutas inteligentes

Integración con bases de datos SQL

📬 Contacto
Elisarrtech – Educación, Tecnología y Automatización
📧 elisarrtech@gmail.com
🌐 https://elisarrtech.com.mx

📄 Licencia
Este proyecto está licenciado bajo los términos de la MIT License.


