# PRUEBAS DE DISENO

En las pruebas de diseno para un sistema de validacion crediticia, no se valida si el codigo funciona, sino si la interfaz es intuitiva, coherente y facilita el analisis y la toma de decisiones financieras.

## Ejemplo: Credit Validation App

En las pruebas de diseno para tu app de analisis crediticio, no validamos si el calculo financiero es correcto, sino si el analista encuentra rapido los indicadores clave y completa el flujo sin frustracion.

Aqui tienes los 5 pilares especificos que se validan:

---

## 1. Consistencia Visual (UI)

Se busca que el sistema se vea profesional y uniforme en todas sus pantallas.

- Que validar: Que todos los botones de accion principal (ENTRAR, Guardar, Continuar, Enviar, Descargar PDF) mantengan color, tamano y redondeo consistentes.
- Ejemplo especifico: Si en app/login.js el boton ENTRAR tiene color naranja y texto blanco, no deberia existir un boton primario de igual jerarquia en gris con baja visibilidad en app/Drawer/Home.js o app/Drawer/FormIngresos.js.
- Ejemplo adicional: Las tarjetas de app/Drawer/Personas.js y app/Drawer/Search.js deben mantener una misma familia visual (elevacion, espaciado interno y peso tipografico del nombre).

---

## 2. Usabilidad y Flujo (UX)

Se valida que el camino hacia el analisis crediticio sea corto y sin obstaculos.

- Que validar: Facilidad para registrar una solicitud desde cero y llegar al analisis.
- Ejemplo especifico: Validar que el usuario complete el flujo principal sin salir del contexto.

- Flujo esperado real de tu proyecto:
1. Login en app/login.js.
2. Ir a Nuevo Credito desde drawer en components/DrawerContent.js.
3. Completar datos en app/Drawer/Home.js y guardar.
4. Completar app/Drawer/FormIngresos.js y enviar.
5. Ver resultados en app/Drawer/AmortizacionCalculada.js.

- Criterio recomendado: Completar el flujo en menos de 5 minutos con datos de prueba, sin bloqueos visuales.

---

## 3. Jerarquia de Informacion

Se asegura que el ojo del analista se dirija primero a los datos criticos para la decision crediticia.

- Que validar: Que los indicadores financieros principales resalten sobre detalles secundarios.
- Ejemplo especifico: En app/Drawer/AmortizacionCalculada.js, los bloques KPI (Capacidad de Pago, Endeudamiento, LTV) deben percibirse antes que las secciones expandibles y la tabla completa.
- Ejemplo adicional: En app/Drawer/Personas.js y app/Drawer/Search.js, el nombre del cliente y el estado de solicitud deben verse antes que ID y metadatos.

---

## 4. Adaptabilidad (Responsividad)

Se valida que la experiencia sea igual de buena en celular y tablet.

- Que validar: Que no haya solapamientos ni elementos fuera de pantalla.
- Ejemplo especifico: En app/Drawer/FormIngresos.js, los campos numericos (Ingresos, Deudas, Mensualidad) deben abrir teclado numerico y el boton de envio no debe quedar oculto por teclado.
- Ejemplo adicional: En app/Drawer/AmortizacionCalculada.js, la tabla debe permitir scroll horizontal estable sin provocar movimiento lateral de toda la vista.

---

## 5. Feedback de Usuario

Se valida que el sistema informe claramente lo que ocurre ante cada accion.

- Que validar: Que el usuario vea estados de carga, exito y error en puntos criticos.
- Ejemplo especifico: En app/login.js, cuando faltan campos o falla autenticacion, el mensaje de error debe ser visible, legible y comprensible.
- Ejemplo adicional: En app/Drawer/FormIngresos.js, al enviar debe verse estado de proceso y luego confirmacion de exito o error entendible.

---

# Lista de chequeo (Checklist) para validar especificamente la version movil

Esta lista esta disenada para validar que la experiencia de analisis crediticio en celular sea rapida y sin frustraciones.

## Checklist de Diseno: Credit Validation App (Movil)

| Categoria | Elemento a Validar | Criterio de Aceptacion (Exito) | Cumple |
| :--- | :--- | :--- | :---: |
| Legibilidad | KPIs financieros | Capacidad, Endeudamiento y LTV se leen sin zoom en app/Drawer/AmortizacionCalculada.js. | [ ] |
| Interaccion | Botones (tap targets) | Botones principales tienen area comoda de toque (referencia: 44x44 px). | [ ] |
| Formularios | Teclado numerico | En montos/plazos/tasas se abre teclado numerico automaticamente. | [ ] |
| Navegacion | Filtros por estado | En Personas/Search los filtros son faciles de activar y el estado activo se distingue claramente. | [ ] |
| Carga | Estado de espera | Se muestra indicador de carga en listas y pantallas con datos remotos. | [ ] |
| Espaciado | Tarjetas y formularios | Existe aire visual entre tarjetas/campos y no se percibe saturacion. | [ ] |
| Contraste | Estado de solicitud | Estados como Aprobado/Rechazada/En Proceso tienen contraste suficiente para lectura rapida. | [ ] |
| Scroll | Tabla de amortizacion | El gesto horizontal funciona sin romper el scroll vertical general. | [ ] |

---

## 5 checklists adicionales (con datos reales de la app)

## Checklist 1: Login Movil (app/login.js)

| Categoria | Elemento a Validar | Criterio de Aceptacion (Exito) | Cumple |
| :--- | :--- | :--- | :---: |
| Titulo | Pantalla de acceso | El titulo visible es "Iniciar Sesión". | [ ] |
| Campos | Credenciales | Existen los campos "Usuario" y "Contraseña" con buena legibilidad. | [ ] |
| CTA principal | Acceso | El boton principal muestra el texto "ENTRAR" y destaca visualmente. | [ ] |
| Validacion | Campos vacios | Al enviar sin datos aparece "Por favor, completa todos los campos." | [ ] |
| Error de red | Conexion | Si falla servidor, se muestra "No se pudo conectar con el servidor." | [ ] |

## Checklist 2: Solicitud de Credito - Paso 1 (app/Drawer/Home.js)

| Categoria | Elemento a Validar | Criterio de Aceptacion (Exito) | Cumple |
| :--- | :--- | :--- | :---: |
| Encabezado | Flujo inicial | Se muestra "Solicitud de Crédito" y subtitulo de completar campos requeridos. | [ ] |
| Secciones | Estructura | Existen "Datos Personales" y "Datos de la Solicitud" como bloques separados. | [ ] |
| Condicional | Conyuge | "Datos del Cónyuge" solo aparece cuando Estado Civil = "Casado". | [ ] |
| Entradas numericas | Solicitud | "Plazo (meses)" y "Tasa de Interés Anual (%)" abren teclado numerico. | [ ] |
| CTA y progreso | Avance | El boton muestra "Guardar y Continuar" y se ve "Paso 1 de 3 - Información Personal". | [ ] |

## Checklist 3: Informacion Adicional - Paso 2 (app/Drawer/FormIngresos.js)

| Categoria | Elemento a Validar | Criterio de Aceptacion (Exito) | Cumple |
| :--- | :--- | :--- | :---: |
| Encabezado | Modulo | El titulo visible es "Información Adicional". | [ ] |
| Secciones | Formulario largo | Existen "Información Laboral", "Domicilio", "Gastos Mensuales" y "Referencias Personales". | [ ] |
| Regla de negocio visual | Domicilio | "Monto Mensualidad ($)" solo se muestra si Estado del Domicilio es distinto de "Propio". | [ ] |
| CTA final | Envio | El boton principal muestra "Enviar Formulario" y durante proceso cambia a "Enviando..." | [ ] |
| Errores de validacion | Feedback | Si faltan requeridos, se muestra alerta de "Campos requeridos" con lista de campos faltantes. | [ ] |

## Checklist 4: Listados y Filtros (app/Drawer/Personas.js y app/Drawer/Search.js)

| Categoria | Elemento a Validar | Criterio de Aceptacion (Exito) | Cumple |
| :--- | :--- | :--- | :---: |
| Busqueda | Searchbar | La barra muestra "Buscar persona..." y filtra por nombre/apellido. | [ ] |
| Filtro por estado | Estados reales | Los estados disponibles son "Aprobado", "Rechazada", "En Proceso" y "Pendiente". | [ ] |
| Presentacion | Tarjetas | Cada tarjeta muestra nombre completo, "Nº Solicitud" y estado con color/icono. | [ ] |
| Estado vacio | Sin resultados | Se muestra "No se encontraron resultados." o "No hay solicitudes." segun pantalla. | [ ] |
| Navegacion | Detalle | Al tocar una tarjeta navega a edicion o analisis sin romper el contexto visual. | [ ] |

## Checklist 5: Analisis de Credito (app/Drawer/AmortizacionCalculada.js)

| Categoria | Elemento a Validar | Criterio de Aceptacion (Exito) | Cumple |
| :--- | :--- | :--- | :---: |
| Encabezado | Modulo analitico | El titulo visible es "Análisis de Crédito". | [ ] |
| KPI principales | Jerarquia | Se muestran claramente "Capacidad de Pago", "Endeudamiento" y "LTV". | [ ] |
| Accion de reporte | Exportacion | Existe boton "Descargar PDF" en el header analitico. | [ ] |
| Resiliencia | Reintento | Si falla carga, aparece mensaje de error y boton "Reintentar". | [ ] |
| Tabla | Usabilidad movil | "Tabla de Amortización" permite scroll horizontal sin romper el layout. | [ ] |

---

## Plan de capturas (donde tomar screenshots)

| ID Captura | Pantalla | Evidencia que debes capturar |
| :--- | :--- | :--- |
| CAP-01 | Splash (app/index.js) | Pantalla de carga inicial con indicador visible. |
| CAP-02 | Login limpio (app/login.js) | Inputs vacios + boton ENTRAR visible. |
| CAP-03 | Login con error (app/login.js) | Mensaje por campos vacios o credenciales invalidas. |
| CAP-04 | Drawer abierto (components/DrawerContent.js) | Opciones de menu completas y legibles. |
| CAP-05 | Nuevo Credito (app/Drawer/Home.js) | Seccion de datos personales expandida y usable. |
| CAP-06 | Validacion de identificacion (app/Drawer/Home.js) | Tipo de identificacion + numero con validacion visible. |
| CAP-07 | Formulario laboral (app/Drawer/FormIngresos.js) | Dropdown abierto + campos numericos. |
| CAP-08 | Domicilio (app/Drawer/FormIngresos.js) | Estado de domicilio y comportamiento de mensualidad. |
| CAP-09 | Error por requeridos (app/Drawer/FormIngresos.js) | Alerta/mensaje al enviar formulario incompleto. |
| CAP-10 | Listado de solicitudes (app/Drawer/Personas.js) | Tarjetas con nombre, solicitud y estado. |
| CAP-11 | Filtro por estado (app/Drawer/Personas.js) | Filtro aplicado y resultados acordes. |
| CAP-12 | Busqueda con chips (app/Drawer/Search.js) | Barra de busqueda + chips activos/inactivos. |
| CAP-13 | Sin resultados (app/Drawer/Search.js) | Estado vacio legible al no encontrar coincidencias. |
| CAP-14 | Editar - datos personales (app/Drawer/EditPerson.js) | Tab personal con jerarquia visual correcta. |
| CAP-15 | Editar - solicitud (app/Drawer/EditPerson.js) | Tab solicitud con campos financieros claros. |
| CAP-16 | KPIs analisis (app/Drawer/AmortizacionCalculada.js) | Tarjetas principales (Capacidad, Endeudamiento, LTV). |
| CAP-17 | Detalle expandido (app/Drawer/AmortizacionCalculada.js) | Tarjeta de detalle abierta (capacidad o flujo). |
| CAP-18 | Tabla amortizacion (app/Drawer/AmortizacionCalculada.js) | Scroll horizontal funcional. |
| CAP-19 | Usuarios - lista (app/Drawer/register.js) | Lista con usuario, correo y grupos. |
| CAP-20 | Usuarios - crear (app/Drawer/register.js) | Formulario y validaciones de campos. |
| CAP-21 | Vista tablet | Cualquier pantalla densa sin solapamientos. |
| CAP-22 | Vista escritorio/web | Analisis en ancho amplio, lectura clara de KPIs y tabla. |

Nota: Si encuentras un problema de interaccion (scroll, teclado, solapamiento), agrega video corto de 5 a 10 segundos.

---

## Ejemplo de Error Comun en Movil

- El efecto cascada en formularios: app/Drawer/FormIngresos.js concentra muchas secciones y puede forzar demasiado scroll para llegar a enviar.
- Solucion de diseno sugerida: secciones colapsables o boton fijo de Guardar/Enviar cuando el teclado esta activo.

---

## Prueba de Oro (Stress Test)

Intenta completar una solicitud completa usando una sola mano (pulgar):

1. Login.
2. Nuevo Credito.
3. FormIngresos.
4. Ver analisis.

Criterio de exito:
- Puedes alcanzar acciones clave sin cambiar agarre.
- Puedes usar filtros y tabla de amortizacion sin gestos incomodos.

---

# Formato de reporte de errores para desarrollo

## Reporte de Errores de Diseno (UI/UX) - Credit Validation App

ID de sesion: TEST-UIUX-001
Fecha: 17/04/2026
Tester: [Tu nombre]
Build: [version]

### 1. Resumen de Hallazgos

- Errores Criticos: [n]
- Errores Medios: [n]
- Errores Leves: [n]

### 2. Detalle de Errores Encontrados

| ID Error | Elemento | Descripcion del Problema | Prioridad | Evidencia |
| :--- | :--- | :--- | :--- | :--- |
| ERR-01 | Envio en FormIngresos | El boton de envio queda oculto por teclado o barra inferior y bloquea finalizacion. | CRITICA | CAP-09 |
| ERR-02 | Tabla de Amortizacion | El gesto horizontal no es estable y afecta navegacion. | ALTA | CAP-18 (video) |
| ERR-03 | Estado en tarjetas | Bajo contraste en estados de solicitud en determinadas condiciones. | MEDIA | CAP-11 |
| ERR-04 | Mensajes de error | El texto de error no orienta accion siguiente. | MEDIA | CAP-03 / CAP-09 |

### 3. Pasos para Reproducir (Ejemplo ERR-01)

1. Abrir app en iPhone 13 o Samsung S22.
2. Ir a Nuevo Credito y completar Home.
3. En FormIngresos, tocar un campo numerico para abrir teclado.
4. Resultado observado: boton de envio no visible o dificil de alcanzar.
5. Resultado esperado: boton visible con ajuste de layout y margen seguro.

### 4. Sugerencias de Mejora (UX)

- Sugerencia 1: Ajustar comportamiento de teclado para mantener visible la accion principal.
- Sugerencia 2: En filtros de Search/Personas, agregar accion rapida de limpiar filtros.
- Sugerencia 3: Mostrar indicacion visual de que la tabla de amortizacion tiene scroll horizontal.

### 5. Estado de Revision

- [ ] Pendiente (Enviado a Desarrollo)
- [ ] En Proceso (Corrigiendo UI)
- [ ] Validado (Error solucionado y probado)

---

# Ejemplo de formato de Pruebas de Diseno: Credit Validation App

ID del Proyecto: CREDIT-VALIDATION-UIUX | Fecha: 17/04/2026 | Tester: [Tu nombre]

### 1. Informacion de Entorno

- Navegador / SO: [Chrome / Android / iOS]
- Dispositivo: [Escritorio / Movil / Tablet]
- Build evaluado: [version]

### 2. Check-list de Diseno (UI/UX)

| Categoria | Punto de Control | Estado (P/F) | Observaciones |
| :--- | :--- | :---: | :--- |
| Identidad | El color principal y estilo visual se mantiene en todo el flujo. | [ ] | |
| Navegacion | El drawer es claro y no genera confusion de rutas. | [ ] | |
| Filtros | Busqueda y filtros por estado funcionan con retroalimentacion clara. | [ ] | |
| Formulario | Campos requeridos y mensajes de validacion se entienden rapido. | [ ] | |
| CTAs | Guardar, Enviar y Descargar PDF destacan sobre el fondo. | [ ] | |
| Responsive | La tabla de amortizacion y tarjetas se ven bien en movil. | [ ] | |

### 3. Escenarios de Prueba de Usuario (Casos Criticos)

| Caso de Uso | Pasos del Usuario | Resultado Esperado | Cumple |
| :--- | :--- | :--- | :---: |
| Busqueda Rapida | Buscar cliente por nombre en app/Drawer/Search.js. | Lista filtrada clara con estado visible. | [ ] |
| Analisis de Credito | Abrir app/Drawer/AmortizacionCalculada.js desde una solicitud. | KPIs legibles y tabla navegable. | [ ] |

### 4. Reporte de Hallazgos (Errores de Diseno)

Usa esta seccion para inconsistencias visuales detectadas en pruebas reales.

1. Error: [Descripcion]
- Prioridad: [Alta/Media/Baja]
2. Error: [Descripcion]
- Prioridad: [Alta/Media/Baja]

### 5. Aprobacion Final

- Estado: [ ] Aprobado | [ ] Requiere Ajustes | [ ] Rechazado
- Firma: __________________________

---

## Redaccion de mensajes de error recomendados

No se encontraron resultados:
- No encontramos clientes con esos criterios. Prueba quitar algun filtro.
Boton sugerido: Limpiar filtros

Fallo al cargar analisis:
- No fue posible cargar el analisis en este momento. Intenta nuevamente.
Boton sugerido: Reintentar

Campos incompletos:
- Faltan campos obligatorios. Revisa los marcados y vuelve a intentar.
Boton sugerido: Revisar campos

---

Fin del documento - Pruebas de Diseno UI/UX (Credit Validation App)