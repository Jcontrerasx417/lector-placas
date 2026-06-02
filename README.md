# 🚗 Lector de Placas Vehiculares con YOLOv8

## 📖 Descripción

Lector de Placas Vehiculares es un sistema basado en Inteligencia Artificial y Visión por Computador que permite detectar automáticamente placas de vehículos a partir de imágenes capturadas por una cámara o seleccionadas por el usuario.

El proyecto utiliza un modelo YOLOv8 entrenado para la detección de placas vehiculares y un sistema OCR para reconocer los caracteres presentes en la placa detectada. Además, cuenta con una API desarrollada en FastAPI y una aplicación móvil que permite enviar imágenes para su procesamiento.

La solución puede aplicarse en sistemas de control de acceso, parqueaderos inteligentes, monitoreo vehicular, peajes electrónicos y proyectos de ciudades inteligentes.

---

# 🎯 Objetivos

## Objetivo General

Desarrollar un sistema inteligente capaz de detectar y reconocer placas vehiculares mediante técnicas de visión artificial e inteligencia artificial.

## Objetivos Específicos

- Detectar placas de vehículos en imágenes.
- Identificar la ubicación exacta de la placa dentro de la imagen.
- Aplicar OCR para reconocer los caracteres de la placa.
- Implementar una API para el procesamiento de imágenes.
- Integrar una aplicación móvil para facilitar el uso del sistema.
- Desplegar la solución en la nube para acceso remoto.

---

# 🛠️ Tecnologías Utilizadas

| Tecnología | Uso |
|------------|-----|
| Python | Lenguaje principal del proyecto |
| YOLOv8 | Detección de placas vehiculares |
| Ultralytics | Framework para entrenamiento e inferencia |
| OpenCV | Procesamiento de imágenes |
| EasyOCR | Reconocimiento óptico de caracteres |
| FastAPI | Desarrollo de la API REST |
| React Native / Expo | Aplicación móvil |
| Roboflow | Gestión y anotación del dataset |
| Google Colab | Entrenamiento del modelo |
| AWS EC2 | Despliegue y hospedaje del backend |
| GitHub | Control de versiones |

---

# 📂 Estructura del Proyecto

```bash
lector-placas/
│
├── backend-yolo8/
│   ├── app.py
│   ├── requirements.txt
│   ├── best.pt
│   └── utils/
│
├── dataset/
│
├── mobile-app/
│
├── model/
│   └── notebooks/
│
└── README.md
```

---

# 🧠 Dataset

El modelo fue entrenado utilizando un conjunto de imágenes de placas vehiculares anotadas mediante Roboflow.

### Características del Dataset

- Clase detectada: Placa vehicular.
- Imágenes etiquetadas manualmente.
- División en:
  - Entrenamiento.
  - Validación.
  - Pruebas.

El dataset fue preparado para mejorar la precisión de detección en diferentes condiciones de iluminación, distancia y ángulo.


# ☁️ Despliegue en AWS

El backend del sistema fue desplegado en una instancia de Amazon EC2 para permitir el acceso remoto desde la aplicación móvil.

### Servicios Utilizados

- Amazon EC2
  - Hospedaje del backend FastAPI.
  - Ejecución del modelo YOLOv8.
  - Procesamiento de imágenes enviadas por los usuarios.

### Beneficios

- Acceso remoto al sistema.
- Procesamiento centralizado.
- Escalabilidad para futuras mejoras.
- Disponibilidad desde dispositivos móviles.

---

# 🏗️ Arquitectura del Sistema

```text
Aplicación Móvil
        │
        ▼
    FastAPI
 (AWS EC2 Ubuntu)
        │
        ▼
 Modelo YOLOv8
        │
        ▼
 Detección de Placa
        │
        ▼
     EasyOCR
        │
        ▼
 Texto Detectado
        │
        ▼
    Resultado
```

---

# 🚀 Instalación

## 1. Clonar el repositorio

```bash
git clone https://github.com/Jcontrerasx417/lector-placas.git

cd lector-placas
```

## 2. Instalar dependencias

```bash
pip install -r requirements.txt
```

---

# ▶️ Ejecución del Backend

Iniciar el servidor FastAPI:

```bash
uvicorn app:app --reload
```

La API estará disponible en:

```bash
http://localhost:8000
```

Documentación automática:

```bash
http://localhost:8000/docs
```

---

# 📱 Aplicación Móvil

La aplicación móvil desarrollada con React Native y Expo permite:

- Capturar fotografías desde la cámara.
- Seleccionar imágenes desde la galería.
- Enviar imágenes al backend.
- Visualizar las detecciones realizadas.
- Mostrar el texto identificado mediante OCR.

---

# 🔍 Flujo de Funcionamiento

1. El usuario captura o selecciona una imagen.
2. La imagen es enviada al backend.
3. YOLOv8 detecta la ubicación de la placa.
4. Se extrae la región detectada.
5. EasyOCR procesa la imagen recortada.
6. Se identifican los caracteres presentes.
7. El resultado es retornado a la aplicación móvil.

---

# 📊 Resultados Esperados

✅ Detección automática de placas vehiculares.

✅ Identificación de la ubicación de la placa.

✅ Extracción de la región de interés.

✅ Reconocimiento de caracteres mediante OCR.

✅ Integración entre backend y aplicación móvil.

✅ Acceso remoto mediante infraestructura en AWS.

---

# 🔮 Mejoras Futuras

- Detección en tiempo real mediante video.
- Mayor precisión en OCR.
- Almacenamiento histórico de registros.
- Integración con bases de datos.
- Sistema de autenticación de usuarios.
- Dashboard web para monitoreo.
- Integración con sistemas de control de acceso.

---

# 👨‍💻 Autor

**Juan Contreras**
