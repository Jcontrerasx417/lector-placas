import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

const API_URL = "http://3.87.31.145:8080/predict/";

export default function App() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const tomarFoto = async () => {
    try {
      const permiso = await ImagePicker.requestCameraPermissionsAsync();

      if (!permiso.granted) {
        Alert.alert("Permiso requerido", "Debes permitir el acceso a la cámara.");
        return;
      }

      const foto = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.7,
      });

      if (!foto.canceled && foto.assets.length > 0) {
        setImageUri(foto.assets[0].uri);
        setResultado(null);
      }
    } catch (error) {
      console.log("Error al tomar foto:", error);
      Alert.alert("Error", "No se pudo abrir la cámara.");
    }
  };

  const analizarPlaca = async () => {
    if (!imageUri) {
      Alert.alert("Sin imagen", "Primero toma una foto de la placa.");
      return;
    }

    try {
      setLoading(true);
      setResultado(null);

      const imagenProcesada = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 600 } }],
        {
          compress: 0.6,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      const formData = new FormData();

      formData.append("file", {
        uri: imagenProcesada.uri,
        name: "placa.jpg",
        type: "image/jpeg",
      } as any);

      console.log("Enviando imagen a:", API_URL);
      console.log("Imagen enviada:", imagenProcesada.uri);

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const textoRespuesta = await response.text();

      console.log("STATUS:", response.status);
      console.log("RESPUESTA RAW:", textoRespuesta);

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }

      let data;

      try {
        data = JSON.parse(textoRespuesta);
      } catch (error) {
        throw new Error("La API no devolvió un JSON válido.");
      }

      setResultado(data);
    } catch (error: any) {
      console.log("ERROR COMPLETO:", error);

      Alert.alert(
        "Error de conexión",
        "No se pudo enviar la imagen a la API. Verifica que AWS esté encendido, que el puerto 8080 esté abierto y que la URL sea correcta."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Lector de Placas Vehiculares</Text>

        <Text style={styles.subtitle}>
          Toma una foto de la placa del vehículo. La imagen será enviada al
          servidor en AWS para detectar y leer la placa.
        </Text>

        <TouchableOpacity style={styles.button} onPress={tomarFoto}>
          <Text style={styles.buttonText}>Tomar foto</Text>
        </TouchableOpacity>

        {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

        <TouchableOpacity
          style={[
            styles.button,
            styles.secondaryButton,
            loading ? styles.disabledButton : null,
          ]}
          onPress={analizarPlaca}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Analizando..." : "Analizar placa"}
          </Text>
        </TouchableOpacity>

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Procesando imagen...</Text>
          </View>
        )}

        {resultado && (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>Resultado</Text>

            <Text style={styles.plate}>
              {resultado.placa ? resultado.placa : "Sin placa detectada"}
            </Text>

            {resultado.detections && resultado.detections.length > 0 ? (
              <View style={styles.details}>
                <Text style={styles.detailText}>
                  Clase: {resultado.detections[0].class}
                </Text>

                <Text style={styles.detailText}>
                  Confianza: {resultado.detections[0].confidence}
                </Text>

                <Text style={styles.detailText}>
                  OCR: {resultado.detections[0].texto_ocr}
                </Text>
              </View>
            ) : (
              <Text style={styles.detailText}>
                No se encontraron detecciones.
              </Text>
            )}

            <View style={styles.rawBox}>
              <Text style={styles.rawTitle}>Respuesta completa</Text>
              <Text style={styles.rawText}>
                {JSON.stringify(resultado, null, 2)}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },
  container: {
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 30,
    marginBottom: 12,
    color: "#111827",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    color: "#4b5563",
    marginBottom: 25,
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#111827",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  secondaryButton: {
    backgroundColor: "#2563eb",
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  image: {
    width: "100%",
    height: 260,
    borderRadius: 14,
    marginVertical: 16,
    resizeMode: "cover",
  },
  loadingBox: {
    alignItems: "center",
    marginTop: 18,
  },
  loadingText: {
    marginTop: 8,
    color: "#4b5563",
  },
  resultBox: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 20,
    marginTop: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#111827",
  },
  plate: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#16a34a",
    textAlign: "center",
    marginBottom: 16,
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 12,
  },
  detailText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 6,
  },
  rawBox: {
    marginTop: 16,
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 10,
  },
  rawTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 6,
  },
  rawText: {
    fontSize: 11,
    color: "#374151",
  },
});