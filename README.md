# Comité App - Sistema de Elecciones y Gestión Estudiantil

Plataforma integral y moderna para elecciones estudiantiles, comité de curso, votación democrática de actividades escolares y balance financiero con transparencia garantizada.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:**
  - **React 19** con **TypeScript**
  - **Vite 6** (Bundler ultrarrápido y servidor de desarrollo)
  - **Tailwind CSS v4** con `@tailwindcss/vite`
  - **Motion (Framer Motion)** para transiciones fluidas
  - **Lucide React** para iconografía moderna
  - **Canvas Confetti** para celebraciones de voto emitido
- **Backend:**
  - **Node.js** con **Express 4**
  - **TypeScript** con ejecución nativa vía **TSX**
  - **Arquitectura Full-Stack:** Servidor Express que integra Vite como middleware en desarrollo y sirve los archivos estáticos optimizados en producción.
- **Base de Datos y Persistencia:**
  - Sistema de almacenamiento local estructurado en JSON (`data/voto_escolar_db.json`).
  - Auto-recuperación y semilla inicial de datos de prueba preconfigurada.
  - Cero dependencias de servicios externos de pago para su funcionamiento inmediato.

---

## 📁 Estructura del Proyecto

```text
comite-app/
├── data/
│   └── voto_escolar_db.json      # Base de datos persistente en formato JSON (se autogenera si no existe)
├── public/                       # Archivos estáticos y logos
├── server/
│   └── db.ts                     # Controlador de base de datos, modelos y lógica de negocio
├── src/
│   ├── components/
│   │   ├── admin/                # Vistas de administración (elecciones, candidatos, alumnos, finanzas, etc.)
│   │   ├── auth/                 # Modal y formularios de autenticación
│   │   ├── home/                 # Pantalla de bienvenida y landing interactiva
│   │   ├── student/              # Vistas de estudiante (cabina de votación, resultados, metas)
│   │   ├── ui/                   # Modales de confirmación y componentes base
│   │   └── Navbar.tsx            # Barra de navegación principal
│   ├── context/
│   │   ├── AuthContext.tsx       # Estado global de sesión y permisos
│   │   ├── ThemeContext.tsx      # Selector de modo claro / oscuro
│   │   └── ToastContext.tsx      # Notificaciones flotantes
│   ├── services/
│   │   └── api.ts                # Cliente HTTP para comunicación con los endpoints REST
│   ├── App.tsx                   # Componente raíz y enrutamiento
│   ├── index.css                 # Estilos globales con Tailwind CSS
│   ├── main.tsx                  # Punto de entrada de React
│   └── types.ts                  # Definición de tipos e interfaces TypeScript
├── .env.example                  # Plantilla de variables de entorno opcionales
├── .gitignore                    # Reglas de exclusión para Git
├── index.html                    # Entrada HTML principal de la aplicación
├── metadata.json                 # Metadatos del proyecto
├── package.json                  # Dependencias y scripts de ejecución
├── README.md                     # Documentación y guía de instalación
├── server.ts                     # Servidor Express y API REST
├── tsconfig.json                 # Configuración de compilación TypeScript
└── vite.config.ts                # Configuración de Vite y plugins
```

---

## 🚀 Requisitos Previos

Para ejecutar la aplicación en tu computadora necesitas tener instalado:
1. **Node.js** (versión 18.0.0 o superior recomendada, Node.js 20 LTS o 22 LTS). Puedes descargarlo desde [nodejs.org](https://nodejs.org/).
2. **NPM** (viene incluido automáticamente con Node.js).
3. **Visual Studio Code** (o tu editor de código preferido).

---

## 💻 Instrucciones de Instalación y Ejecución

### 1. Descargar y Descomprimir
Descarga el proyecto desde Google AI Studio (utilizando el menú de exportación a ZIP o GitHub) y descomprímelo en una carpeta de tu preferencia.

### 2. Abrir en Visual Studio Code
Abre VS Code y selecciona **File > Open Folder...** (o `Archivo > Abrir carpeta...`), eligiendo la carpeta raíz del proyecto.

### 3. Instalar Dependencias
Abre la terminal integrada en VS Code (`Ctrl + ~` en Windows/Linux o `Cmd + ~` en Mac) y ejecuta:

```bash
npm install
```

### 4. Iniciar el Servidor de Desarrollo
Para iniciar la aplicación en modo de desarrollo ejecuta:

```bash
npm run dev
```

El servidor iniciará en:
👉 **`http://localhost:3000`**

Abre esa URL en tu navegador web para utilizar la aplicación completa.

---

## 🔑 Credenciales Demo para Pruebas

El sistema incluye cuentas de prueba precargadas listas para usar:

### Administrador (Profesor / Directiva General):
- **Correo:** `admin@votoescolar.edu`
- **Contraseña:** `Admin123!`
- *Acceso:* Panel de control total, creación de elecciones, candidatos, gestión de alumnos, balance de actividades y auditoría.

### Estudiante 1 (4° Medio A):
- **Correo:** `estudiante1@colegio.edu`
- **Contraseña:** `Estudiante123!`
- *Acceso:* Cabina de votación digital, voto secreto, comprobante anónimo y panel financiero del curso.

### Estudiante 2 (3° Medio B):
- **Correo:** `estudiante2@colegio.edu`
- **Contraseña:** `Estudiante123!`

---

## 📦 Scripts Disponibles en `package.json`

- `npm run dev`: Inicia el servidor de desarrollo en tiempo real con TSX y Vite.
- `npm run build`: Compila el frontend estático en `dist/` y empaqueta el servidor con `esbuild` en `dist/server.cjs`.
- `npm start`: Inicia el servidor optimizado para entornos de producción.
- `npm run lint`: Valida tipos de TypeScript sin emitir archivos (`tsc --noEmit`).

---

## 📱 Preparación y Conversión a Aplicación Android (APK)

La arquitectura de **Comité App** está optimizada para empaquetarse fácilmente como aplicación Android nativa mediante **Capacitor** (la solución moderna oficial recomendada por el equipo de Ionic/Vite).

### Pasos recomendados cuando desees generar el APK:

1. **Compilar el frontend a archivos estáticos:**
   ```bash
   npm run build
   ```
2. **Instalar Capacitor:**
   ```bash
   npm install @capacitor/core
   npm install -D @capacitor/cli @capacitor/android
   ```
3. **Inicializar Capacitor:**
   ```bash
   npx cap init "Comité App" "com.comiteapp.escolar" --web-dir=dist
   ```
4. **Agregar la plataforma Android:**
   ```bash
   npx cap add android
   ```
5. **Sincronizar el proyecto:**
   ```bash
   npx cap sync
   ```
6. **Abrir en Android Studio para generar el APK firmado o de depuración:**
   ```bash
   npx cap open android
   ```
   *En Android Studio, ve a **Build > Build Bundle(s) / APK(s) > Build APK(s)** para obtener tu archivo `.apk` instalable.*
