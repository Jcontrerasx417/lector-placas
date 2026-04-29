from fastapi import FastAPI, UploadFile, File
from ultralytics import YOLO
import easyocr
import cv2
import shutil
import os
import uuid
import re

app = FastAPI()

model = YOLO("best.pt")
reader = easyocr.Reader(["es", "en"], gpu=False)


@app.get("/")
def home():
    return {
        "message": "API de detección y lectura de placas con YOLOv8"
    }


def corregir_letras(texto):
    """
    Corrige errores comunes del OCR en las primeras 3 letras de la placa.
    Ejemplo: 8US123 -> VUS-123
    """
    texto = re.sub(r"[^A-Za-z0-9]", "", texto).upper()

    # Buscar algo parecido a placa: 3 caracteres + 3 números
    patron = re.search(r"([A-Z0-9]{3})([0-9]{3})", texto)

    if not patron:
        return texto

    letras = patron.group(1)
    numeros = patron.group(2)

    correcciones_letras = {
        "0": "O",
        "1": "I",
        "2": "Z",
        "3": "B",
        "4": "A",
        "5": "S",
        "6": "G",
        "7": "T",
        "8": "V",  # Para casos como 8US123 -> VUS123
        "9": "G"
    }

    letras_corregidas = ""

    for caracter in letras:
        if caracter in correcciones_letras:
            letras_corregidas += correcciones_letras[caracter]
        else:
            letras_corregidas += caracter

    return f"{letras_corregidas}-{numeros}"


def preprocesar_placa(recorte):
    """
    Preprocesamiento moderado para OCR.
    No usamos umbralización fuerte porque puede dañar letras como V, U, S.
    """
    recorte = cv2.resize(
        recorte,
        None,
        fx=3,
        fy=3,
        interpolation=cv2.INTER_CUBIC
    )

    gris = cv2.cvtColor(recorte, cv2.COLOR_BGR2GRAY)

    clahe = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8)
    )
    gris = clahe.apply(gris)

    gris = cv2.bilateralFilter(gris, 9, 75, 75)

    return gris


def leer_placa_con_ocr(recorte):
    """
    Intenta leer la placa usando varias versiones de la imagen.
    Devuelve el texto OCR bruto y la placa corregida.
    """
    textos_detectados = []

    # Versión 1: recorte original agrandado
    recorte_grande = cv2.resize(
        recorte,
        None,
        fx=3,
        fy=3,
        interpolation=cv2.INTER_CUBIC
    )

    # Versión 2: preprocesada
    procesada = preprocesar_placa(recorte)

    versiones = [recorte_grande, procesada]

    for img in versiones:
        resultado = reader.readtext(
            img,
            detail=0,
            paragraph=False,
            allowlist="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        )

        if resultado:
            textos_detectados.append(" ".join(resultado))

    texto_final = " ".join(textos_detectados)
    placa = corregir_letras(texto_final)

    return texto_final, placa


@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    temp_filename = f"temp_{uuid.uuid4().hex}.jpg"

    try:
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        image = cv2.imread(temp_filename)

        if image is None:
            return {
                "error": "No se pudo leer la imagen enviada"
            }

        results = model(temp_filename, conf=0.3)

        detections = []
        placa_detectada = ""

        for result in results:
            for box in result.boxes:
                cls_id = int(box.cls[0])
                confidence = float(box.conf[0])
                class_name = model.names[cls_id]

                x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())

                h, w = image.shape[:2]

                margen = 5
                x1m = max(0, x1 - margen)
                y1m = max(0, y1 - margen)
                x2m = min(w, x2 + margen)
                y2m = min(h, y2 + margen)

                recorte = image[y1m:y2m, x1m:x2m]

                texto_ocr = ""

                if recorte.size > 0:
                    texto_ocr, placa_detectada = leer_placa_con_ocr(recorte)

                detections.append({
                    "class": class_name,
                    "confidence": round(confidence, 2),
                    "box": {
                        "x1": x1,
                        "y1": y1,
                        "x2": x2,
                        "y2": y2
                    },
                    "texto_ocr": texto_ocr,
                    "placa": placa_detectada
                })

        return {
            "placa": placa_detectada,
            "detections": detections
        }

    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8080
    )