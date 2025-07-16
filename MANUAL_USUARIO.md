## Índice

1. [Introducción](#introducción)
2. [Acceso al Sistema](#acceso-al-sistema)
3. [Navegación General](#navegación-general)
4. [Módulo Dashboard](#módulo-dashboard)
5. [Módulo Reservas](#módulo-reservas)
6. [Módulo Servicios](#módulo-servicios)
7. [Módulo Habitaciones](#módulo-habitaciones)
8. [Gestión de Habitaciones](#gestión-de-habitaciones)
9. [Gestión de Servicios](#gestión-de-servicios)
10. [Características Técnicas](#características-técnicas)
11. [Soporte y Contacto](#soporte-y-contacto)

---

## Introducción

Bienvenido al **Sistema de Gestión Hotel Valquiria**, una aplicación web empresarial diseñada para optimizar la administración hotelera. Este sistema permite gestionar reservas, servicios, habitaciones y obtener insights valiosos a través de dashboards interactivos.

### Características Principales

- ✅ **Dashboard Analítico**: Visualización de datos en tiempo real
- ✅ **Gestión de Reservas**: Control completo del estado de alojamientos
- ✅ **Administración de Servicios**: Seguimiento de solicitudes de huéspedes
- ✅ **Catálogo de Habitaciones**: Vista detallada con galería de imágenes
- ✅ **Interfaz Moderna**: Diseño minimalista y responsivo
- ✅ **Base de Datos en Tiempo Real**: Conectado a Supabase

---

## Acceso al Sistema

### Requisitos del Sistema

- **Navegador Web Moderno**: Chrome, Firefox, Safari, Edge
- **Conexión a Internet**: Para sincronización de datos
- **Resolución Mínima**: 1024x768 px

### URL de Acceso

```
file:///c:/Users/HP/Desktop/INTEGRADOR%20II/HotelBalquiria/index.html
```

### Primera Vez en el Sistema

Al abrir la aplicación por primera vez:

1. El sistema carga automáticamente la **página de inicio**
2. La conexión a la base de datos se establece automáticamente
3. Todos los módulos quedan disponibles en el menú lateral

---

## Navegación General

### Menú Lateral (Sidebar)

El sistema cuenta con un menú lateral fijo que permite navegar entre módulos:

| Icono | Módulo                     | Descripción                         |
| ----- | -------------------------- | ----------------------------------- |
| 🏠    | **Inicio**                 | Página principal de bienvenida      |
| 📊    | **Dashboard**              | Gráficos y análisis de datos        |
| 📅    | **Reservas**               | Gestión de alojamientos             |
| 🔔    | **Servicios**              | Servicios solicitados por huéspedes |
| 🛏️    | **Habitaciones**           | Catálogo de habitaciones            |
| 🔧    | **Gestionar Habitaciones** | CRUD de habitaciones                |
| ⚙️    | **Gestionar Servicios**    | CRUD de servicios                   |

### Características de Navegación

- **Responsive**: Se adapta a dispositivos móviles
- **Hover Effects**: Indicadores visuales al pasar el mouse
- **Estado Activo**: Destacado visual de la sección actual
- **Iconografía**: FontAwesome para mejor experiencia

---

## Módulo Dashboard

### Visión General

El dashboard proporciona una vista ejecutiva con **4 gráficos principales** que muestran métricas clave del hotel.

### Gráficos Disponibles

#### 1. Reservas Realizadas por Día

- **Tipo**: Gráfico de barras
- **Datos**: Cantidad de reservas agrupadas por fecha
- **Utilidad**: Identificar patrones de ocupación

#### 2. Servicios Solicitados Durante la Semana

- **Tipo**: Gráfico circular (pie)
- **Datos**: Distribución de servicios por tipo
- **Utilidad**: Optimizar recursos y personal

#### 3. Ingresos Generados por Día (S/.)

- **Tipo**: Gráfico de barras
- **Datos**: Suma de ingresos por fecha de alojamiento
- **Utilidad**: Análisis financiero diario

#### 4. Reservas por Tipo de Habitación

- **Tipo**: Gráfico de barras horizontales
- **Datos**: Preferencias de huéspedes por tipo
- **Utilidad**: Estrategia de precios y disponibilidad

### Características Técnicas

- **Actualización**: Los datos se cargan automáticamente desde Supabase
- **Interactividad**: Hover para ver valores exactos
- **Responsivo**: Los gráficos se adaptan al tamaño de pantalla
- **Librería**: Chart.js para visualizaciones

---

## Módulo Reservas

### Funcionalidades Principales

#### Visualización de Reservas

- **Tabla Dinámica**: Carga automática desde base de datos
- **Información del Huésped**: Nombre completo y DNI
- **Fechas**: Inicio y fin de alojamiento
- **Estado Visual**: Indicadores de color por estado

#### Estados de Reserva

| Estado        | Color      | Descripción                               |
| ------------- | ---------- | ----------------------------------------- |
| **PENDIENTE** | 🟠 Naranja | Reserva confirmada, pendiente de check-in |
| **ALOJADO**   | 🟢 Verde   | Huésped actualmente en el hotel           |
| **VENCIDO**   | 🔴 Rojo    | Reserva expirada o check-out realizado    |

#### Edición de Estados

1. **Localizar la reserva** en la tabla
2. **Hacer clic** en el dropdown de estado
3. **Seleccionar** el nuevo estado
4. **Confirmación automática**: Se guarda en la base de datos

### Datos Mostrados

- **ID**: Identificador único de la reserva
- **Código de Habitación**: Número de habitación asignada
- **Huésped**: Nombre completo y DNI del cliente
- **Fecha de Inicio**: Check-in programado
- **Fecha de Fin**: Check-out programado
- **Estado**: Selector editable
- **Comentario**: Observaciones adicionales

### Características Especiales

- **Ordenación**: Las reservas más recientes aparecen primero
- **Relación con Clientes**: Join automático para mostrar nombres
- **Animaciones**: Efectos visuales en hover
- **Actualización en Tiempo Real**: Cambios se reflejan inmediatamente

---

## Módulo Servicios

### Vista de Servicios Solicitados

#### Información Mostrada

- **Código de Habitación**: Ubicación del huésped
- **Servicio Solicitado**: Descripción del servicio
- **Cantidad**: Número de unidades solicitadas
- **Prioridad**: Orden de atención (más recientes primero)
- **Estado de Entrega**: Botón para confirmar

#### Proceso de Confirmación de Entrega

1. **Identificar el servicio** pendiente en la tabla
2. **Hacer clic** en el botón "Confirmar"
3. **Estado actualizado**: El botón cambia a "Entregado"
4. **Persistencia**: El cambio se guarda en Supabase

### Características del Módulo

- **Ordenación por Prioridad**: Servicios más recientes primero
- **Estados Visuales**: Botones diferenciados
- **Joins Automáticos**: Información de servicios y habitaciones
- **Interfaz Intuitiva**: Un clic para confirmar entregas

---

## Módulo Habitaciones

### Vista de Catálogo

#### Información por Habitación

- **Número Secuencial**: Orden en la lista
- **Código**: Identificador único (ej: 101, 102)
- **Piso**: Ubicación en el edificio
- **Precio por Día**: Tarifa en soles (S/.)

#### Galería de Imágenes

Cada habitación puede tener múltiples imágenes:

- **Imagen Principal**: Vista previa en la tabla
- **Galería Completa**: Disponible en modal
- **Navegación**: Miniaturas para cambiar imagen principal

### Modal de Detalles

Al hacer clic en cualquier fila de habitación:

#### Información Completa

- **Código de Habitación**
- **Tipo**: Simple, Doble, Suite
- **Piso**: Ubicación
- **Precio**: Tarifa diaria
- **Descripción**: Detalles y amenidades

#### Galería Interactiva

- **Imagen Principal**: Vista ampliada
- **Miniaturas**: Navegación entre imágenes
- **Efectos**: Hover y transiciones suaves

### Características Técnicas

- **Datos Dinámicos**: Cargados desde Supabase
- **Arrays de Imágenes**: Soporte para múltiples fotos
- **Modal Responsivo**: Se adapta a dispositivos móviles
- **Fallback**: Imagen por defecto si no hay fotos

---

## Gestión de Habitaciones

### Vista Administrativa

#### Interfaz Principal

- **Header con Acciones**: Título y botón "Nueva Habitación"
- **Filtros de Búsqueda**: Por código, tipo y piso
- **Vista de Cards**: Diseño visual con información completa

#### Filtros Disponibles

1. **Búsqueda por Código**: Campo de texto libre
2. **Filtro por Tipo**: Simple, Doble, Suite
3. **Filtro por Piso**: Piso 1, 2, 3

### Cards de Habitación

#### Información Visual

- **Imagen**: Foto principal de la habitación
- **Estado**: Badge con color según disponibilidad
- **Código**: Número prominente
- **Detalles**: Tipo, piso y precio con iconos
- **Descripción**: Texto descriptivo

#### Estados de Habitación

| Estado            | Color      | Significado             |
| ----------------- | ---------- | ----------------------- |
| **Disponible**    | 🟢 Verde   | Lista para ocupar       |
| **Ocupada**       | 🟠 Naranja | Actualmente con huésped |
| **Mantenimiento** | 🔴 Rojo    | Fuera de servicio       |

#### Acciones por Card

- **Botón Editar**: Modificar información
- **Botón Eliminar**: Remover habitación

### Modal de Nueva/Editar Habitación

#### Formulario Completo

1. **Código de Habitación**: Campo de texto
2. **Tipo**: Dropdown con opciones
3. **Piso**: Selector de nivel
4. **Precio por Día**: Campo numérico
5. **Descripción**: Área de texto expandible
6. **Imágenes**: Zona de carga drag & drop

#### Área de Carga de Imágenes

- **Drag & Drop**: Arrastra archivos directamente
- **Selector Manual**: Clic para elegir archivos
- **Múltiples Imágenes**: Soporte para varias fotos
- **Formatos**: JPG, PNG, WebP

### Características de Diseño

- **Grid Responsivo**: Se adapta al tamaño de pantalla
- **Animaciones Suaves**: Hover effects y transiciones
- **Modal Elegante**: Diseño moderno con overlay
- **Formularios Validados**: Campos requeridos marcados

---

## Gestión de Servicios

### Vista Administrativa

#### Grid de Servicios

Cada servicio se presenta en un card individual con:

- **Icono Representativo**: Visual identificativo
- **Nombre del Servicio**: Título principal
- **Tipo/Categoría**: Clasificación del servicio
- **Descripción**: Detalle de lo que incluye
- **Estado**: Activo/Inactivo

#### Categorías de Servicios

- **Alimentación**: Comidas, bebidas, room service
- **Limpieza**: Servicios adicionales de limpieza
- **Transporte**: Traslados y movilidad
- **Tecnología**: WiFi, entretenimiento
- **Bienestar**: Spa, masajes, relajación
- **Recreación**: Piscina, gimnasio, actividades

### Acciones por Servicio

#### Botones de Control

1. **Editar** (🔵): Modificar información del servicio
2. **Toggle** (🟠): Activar/desactivar servicio
3. **Eliminar** (🔴): Remover servicio del sistema

### Modal de Nuevo/Editar Servicio

#### Formulario de Servicio

1. **Nombre**: Identificación del servicio
2. **Tipo**: Categoría desde dropdown
3. **Descripción**: Detalle completo
4. **Precio**: Campo opcional para servicios pagos
5. **Icono**: Selector visual interactivo

#### Selector de Iconos

- **Grid Interactivo**: 8 iconos predefinidos
- **Selección Visual**: Clic para elegir
- **Indicador Activo**: Resaltado del icono seleccionado
- **Iconos FontAwesome**: Biblioteca estándar

### Estados Visuales

#### Servicios Activos

- **Badge Verde**: Claramente identificable
- **Totalmente Funcional**: Disponible para huéspedes

#### Servicios Inactivos

- **Badge Rojo**: Indicador visual claro
- **Temporalmente Suspendido**: No disponible

---

## Características Técnicas

### Arquitectura del Sistema

#### Frontend

- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos con variables CSS
- **JavaScript ES6+**: Funcionalidad dinámica
- **Chart.js**: Visualización de datos
- **FontAwesome**: Iconografía profesional

#### Backend y Base de Datos

- **Supabase**: Base de datos PostgreSQL en la nube
- **Tiempo Real**: Sincronización automática
- **API REST**: Comunicación cliente-servidor
- **Autenticación**: Sistema de claves seguras

#### Responsive Design

- **Mobile First**: Diseño desde móviles hacia desktop
- **Breakpoints**: 480px, 768px, 992px
- **Grid System**: CSS Grid y Flexbox
- **Adaptabilidad**: Contenido fluido

### Paleta de Colores

#### Colores Principales

- **Morado Principal**: #6c3eb6
- **Morado Oscuro**: #4a2887
- **Amarillo Acento**: #ffc107
- **Gris Fondo**: #f7f7fa
- **Gris Claro**: #ececf3

#### Estados y Feedback

- **Verde (Éxito)**: #16c093
- **Naranja (Advertencia)**: #ff9900
- **Rojo (Error)**: #c01616
- **Azul (Información)**: #006666

### Performance y Optimización

#### Carga de Datos

- **Lazy Loading**: Carga bajo demanda
- **Caching**: Almacenamiento temporal
- **Optimización de Imágenes**: Formatos eficientes
- **Minificación**: CSS y JS comprimidos

#### Experiencia de Usuario

- **Transiciones Suaves**: 0.3s promedio
- **Feedback Visual**: Estados de hover/active
- **Loading States**: Indicadores de carga
- **Error Handling**: Manejo de errores graceful

---

## Solución de Problemas Comunes

### Problemas de Conexión

#### Error de Base de Datos

**Síntoma**: Mensaje "Supabase no está inicializado"
**Solución**:

1. Verificar conexión a internet
2. Recargar la página (F5)
3. Verificar consola del navegador

#### Datos No Cargan

**Síntoma**: Tablas vacías o gráficos sin datos
**Solución**:

1. Comprobar conexión a Supabase
2. Verificar permisos de acceso a datos
3. Revisar logs en consola del navegador

### Problemas de Interfaz

#### Modal No Abre

**Síntoma**: Botones no responden
**Solución**:

1. Verificar que JavaScript está habilitado
2. Comprobar errores en consola
3. Recargar la página

#### Responsive No Funciona

**Síntoma**: Diseño roto en móviles
**Solución**:

1. Verificar viewport meta tag
2. Probar en modo incógnito
3. Limpiar caché del navegador

### Problemas de Datos

#### Estados No Se Actualizan

**Síntoma**: Cambios no se guardan
**Solución**:

1. Verificar conexión a internet
2. Comprobar permisos de escritura
3. Revisar logs de red en DevTools

---

## Soporte y Contacto

### Información del Sistema

- **Versión**: 1.0.0
- **Fecha de Desarrollo**: Junio 2025
- **Tecnologías**: HTML5, CSS3, JavaScript, Supabase
- **Compatibilidad**: Navegadores modernos

### Contacto Técnico

Para soporte técnico y consultas:

- **Email**: soporte@hotelvalquiria.com
- **Teléfono**: +51 999 888 777
- **Horario**: Lunes a Viernes, 8:00 AM - 6:00 PM

### Actualizaciones del Sistema

- **Frecuencia**: Actualizaciones mensuales
- **Notificaciones**: Via email al administrador
- **Backup**: Copia de seguridad automática diaria
- **Mantenimiento**: Programado para madrugadas

### Capacitación

Ofrecemos sesiones de capacitación para:

- **Personal de Recepción**: Uso básico del sistema
- **Administradores**: Funciones avanzadas
- **Personal Técnico**: Mantenimiento y configuración

---

## Conclusión

El **Sistema de Gestión Hotel Valquiria** representa una solución integral para la administración hotelera moderna. Con su interfaz intuitiva, análisis de datos en tiempo real y gestión completa de operaciones, optimiza significativamente los procesos del hotel.

### Beneficios Clave

- ✅ **Eficiencia Operativa**: Automatización de procesos manuales
- ✅ **Toma de Decisiones**: Dashboards con datos actualizados
- ✅ **Experiencia del Huésped**: Gestión ágil de servicios
- ✅ **Control Administrativo**: Visibilidad completa de operaciones

### Próximas Funcionalidades

- 📅 **Calendario de Reservas**: Vista mensual/semanal
- 📊 **Reportes Avanzados**: Exportación PDF/Excel
- 📱 **App Móvil**: Para personal de servicio
- 🔐 **Sistema de Usuarios**: Roles y permisos

---

_Manual de Usuario v1.0 - Hotel Valquiria Management System_  
_Desarrollado con tecnologías modernas para una gestión hotelera eficiente_
