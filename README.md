# 🛠️ Mis Herramientas

Una aplicación web moderna para organizar y gestionar tus herramientas favoritas con autenticación de Firebase.

## ✨ Características

- 🔐 **Autenticación completa** con Google y Email/Password
- 📁 **Categorías personalizables** con emojis y colores
- 🔧 **Gestión de herramientas** con nombre, URL y descripción
- 👁️ **Tres modos de visualización**: Grid, Lista y Compacta
- 🎨 **Interfaz moderna** con Tailwind CSS y diseño glassmorphism
- 📱 **Totalmente responsive** para móviles, tablets y desktop
- 🔍 **Búsqueda en tiempo real** por nombre y descripción
- 💾 **Almacenamiento en la nube** con Firebase Firestore
- ⚡ **Rendimiento optimizado** con React hooks personalizados

## 🚀 Tecnologías

- **React 18** - Biblioteca de UI
- **Vite** - Build tool ultra rápido
- **Firebase** - Backend (Auth + Firestore)
- **Tailwind CSS** - Framework CSS utility-first
- **Lucide React** - Iconos modernos
- **Sonner** - Notificaciones toast elegantes

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes React reutilizables
│   ├── Header.jsx
│   ├── Toolbar.jsx
│   ├── ToolCard.jsx
│   ├── ToolDetailModal.jsx
│   └── Modal.jsx
├── hooks/              # Custom React Hooks
│   ├── useAuth.js
│   ├── useCategories.js
│   └── useTools.js
├── services/           # Servicios de Firebase
│   ├── authService.js
│   └── firestoreService.js
├── constants/          # Constantes de la app
│   └── index.js
├── utils/              # Utilidades y helpers
│   └── helpers.js
├── firebase.js         # Configuración de Firebase
├── App.jsx            # Componente principal
└── main.jsx           # Punto de entrada
```

## 🏗️ Instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/ikeralvis/MisHerramientas.git
cd MisHerramientas
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar Firebase**

   - Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
   - Habilita Authentication (Google y Email/Password)
   - Crea una base de datos Firestore
   - Copia tus credenciales en `src/firebase.js`

4. **Ejecutar en desarrollo**

```bash
npm run dev
```

5. **Construir para producción**

```bash
npm run build
```

## 🎯 Características Destacadas

### Arquitectura Modular

- **Componentes reutilizables** con PropTypes
- **Custom hooks** para lógica de negocio
- **Servicios** separados para Firebase
- **Separación de responsabilidades** clara

### Buenas Prácticas

- ✅ Componentes funcionales con hooks
- ✅ PropTypes para validación
- ✅ useCallback para optimización
- ✅ Manejo de errores consistente
- ✅ Código limpio y documentado
- ✅ Responsive design

### Experiencia de Usuario

- 🎨 Diseño moderno y atractivo
- ⚡ Carga rápida y fluida
- 📱 Optimizado para móviles
- 🔔 Notificaciones informativas
- 🖱️ Interacciones intuitivas

## 🔧 Comandos Disponibles

```bash
npm run dev          # Inicia servidor de desarrollo
npm run build        # Construye para producción
npm run preview      # Vista previa de producción
npm run lint         # Ejecuta ESLint
```

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 👤 Autor

**Iker Alvis**

- GitHub: [@ikeralvis](https://github.com/ikeralvis)

---

⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub!
