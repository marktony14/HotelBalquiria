function cargarPagina(pagina) {
  fetch(`paginas/${pagina}.html`)
    .then((res) => res.text())
    .then((html) => {
      document.getElementById("contenido-principal").innerHTML = html;

      if (pagina === "dashboard") {
        cargarGraficosDashboard();
      }
      if (pagina === "reservas") {
        mostrarAlojamientosEnReservas();
      }
      if (pagina === "habitaciones") {
        mostrarHabitaciones();
      }
      if (pagina === "servicios") {
        mostrarServiciosSolicitados();
      }
      if (pagina === "gestion-habitaciones") {
        inicializarGestionHabitaciones();
      }
      if (pagina === "gestion-servicios") {
        inicializarGestionServicios();
      }
    });
}

async function cargarGraficosDashboard() {
  // 1. Gráfico de reservas por día
  const { data: alojamientos } = await supabase
    .from("alojamientos")
    .select("fecha_alojamiento");
  const reservasPorDia = {};
  (alojamientos || []).forEach((a) => {
    reservasPorDia[a.fecha_alojamiento] =
      (reservasPorDia[a.fecha_alojamiento] || 0) + 1;
  });
  const labelsReservas = Object.keys(reservasPorDia);
  const dataReservas = Object.values(reservasPorDia);
  const ctxBar = document.getElementById("graficoReservas").getContext("2d");
  new Chart(ctxBar, {
    type: "bar",
    data: {
      labels: labelsReservas,
      datasets: [
        {
          label: "Reservas",
          data: dataReservas,
          backgroundColor: "#9316c0",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });

  // 2. Gráfico de servicios solicitados (torta)
  const { data: serviciosSolicitados } = await supabase
    .from("servicios_solicitados")
    .select("id_servicio, cantidad, servicios:servicios(descripcion)");
  const serviciosCount = {};
  (serviciosSolicitados || []).forEach((s) => {
    const nombre = s.servicios?.descripcion || "Otro";
    serviciosCount[nombre] = (serviciosCount[nombre] || 0) + (s.cantidad || 1);
  });
  const labelsServicios = Object.keys(serviciosCount);
  const dataServicios = Object.values(serviciosCount);
  const ctxPie = document.getElementById("graficoServicios").getContext("2d");
  new Chart(ctxPie, {
    type: "pie",
    data: {
      labels: labelsServicios,
      datasets: [
        {
          data: dataServicios,
          backgroundColor: [
            "#9316c0",
            "#16c093",
            "#ff9900",
            "#004d4d",
            "#006666",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });

  // 3. Gráfico de ingresos por día
  const { data: alojamientosIngresos } = await supabase
    .from("alojamientos")
    .select(
      "fecha_alojamiento, id_habitacion, habitaciones:habitaciones(precio_dia)"
    );
  const ingresosPorDia = {};
  (alojamientosIngresos || []).forEach((a) => {
    const fecha = a.fecha_alojamiento;
    const precio = a.habitaciones?.precio_dia || 0;
    ingresosPorDia[fecha] = (ingresosPorDia[fecha] || 0) + precio;
  });
  const labelsIngresos = Object.keys(ingresosPorDia);
  const dataIngresos = Object.values(ingresosPorDia);
  const ctxIngresos = document
    .getElementById("graficoIngresos")
    .getContext("2d");
  new Chart(ctxIngresos, {
    type: "bar",
    data: {
      labels: labelsIngresos,
      datasets: [
        {
          label: "Ingresos (S/.)",
          data: dataIngresos,
          backgroundColor: "#9316c0",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });

  // 4. Gráfico reservas por tipo de habitación
  const { data: habitacionesAloj } = await supabase
    .from("alojamientos")
    .select("id_habitacion, habitaciones:habitaciones(tipo)");
  const reservasPorTipo = {};
  (habitacionesAloj || []).forEach((a) => {
    const tipo = a.habitaciones?.tipo || "Otro";
    reservasPorTipo[tipo] = (reservasPorTipo[tipo] || 0) + 1;
  });
  const labelsTipos = Object.keys(reservasPorTipo);
  const dataTipos = Object.values(reservasPorTipo);
  const ctxHabitaciones = document
    .getElementById("graficoHabitaciones")
    .getContext("2d");
  new Chart(ctxHabitaciones, {
    type: "bar",
    data: {
      labels: labelsTipos,
      datasets: [
        {
          label: "Reservas",
          data: dataTipos,
          backgroundColor: "#ff9900",
        },
      ],
    },
    options: {
      indexAxis: "y", // Barras horizontales
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

// Inicializar Supabase desde CDN correctamente
const { createClient } = window.supabase || {};
const supabaseUrl = "https://gnlapnjiwuwwvisqcmao.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdubGFwbmppd3V3d3Zpc3FjbWFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTM1MjgyNSwiZXhwIjoyMDY0OTI4ODI1fQ.B2ip75DTkU6djUt2lJpHgbGA-ed53mUJaRH5YVH80yU";
let supabase;
if (typeof createClient === "function") {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log("Supabase inicializado correctamente:", supabase);
} else {
  console.error(
    "No se encontró createClient en window.supabase. ¿Está bien cargado el CDN?"
  );
}

async function mostrarAlojamientosEnReservas() {
  if (!supabase) {
    console.error("Supabase no está inicializado");
    return;
  }
  try {
    // Traer alojamientos
    const { data: alojamientos, error: errorAloj } = await supabase
      .from("alojamientos")
      .select("*");
    console.log("Alojamientos:", alojamientos, "Error:", errorAloj);
    if (errorAloj) throw errorAloj;
    if (!alojamientos || alojamientos.length === 0) {
      console.warn("No hay alojamientos para mostrar");
    }
    // Obtener todos los nro_doc únicos
    const nroDocs = [...new Set(alojamientos.map((a) => a.id_cliente))];
    console.log("Nros de documento de clientes:", nroDocs);
    // Traer datos de clientes
    let clientes = [];
    if (nroDocs.length > 0) {
      const { data, error: errorCli } = await supabase
        .from("clientes")
        .select("nro_doc, nombre, apellido")
        .in("nro_doc", nroDocs);
      console.log("Clientes:", data, "Error:", errorCli);
      if (errorCli) throw errorCli;
      clientes = data || [];
    }
    // Mapear nro_doc a cliente
    const mapaClientes = {};
    clientes.forEach((c) => {
      mapaClientes[c.nro_doc] = c;
    });

    // Mostrar alojamientos con ids de manera descendente
    alojamientos.sort((a, b) => (b.id || 0) - (a.id || 0));

    const tbody = document.querySelector(".tabla-reservas tbody");
    tbody.innerHTML = "";
    alojamientos.forEach((a) => {
      const cliente = mapaClientes[a.id_cliente] || {};
      const nombreDni = cliente.nombre
        ? `${cliente.nombre} ${cliente.apellido} <br><span class='dni'>DNI: ${cliente.nro_doc}</span>`
        : a.id_cliente;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${a.id || ""}</td>
        <td> ${a.id_habitacion || ""}</td>
        <td>${nombreDni || ""}</td>
        <td>${a.fecha_alojamiento || ""}</td>
        <td>${a.fecha_alojamiento_vencimiento || ""}</td>
        <td>
          <select class="select-estado" data-id="${a.id}">
            <option value="PENDIENTE" ${
              a.estado_reserva === "PENDIENTE" ? "selected" : ""
            }>PENDIENTE</option>
            <option value="ALOJADO" ${
              a.estado_reserva === "ALOJADO" ? "selected" : ""
            }>ALOJADO</option>
            <option value="VENCIDO" ${
              a.estado_reserva === "VENCIDO" ? "selected" : ""
            }>VENCIDO</option>
          </select>
        </td>
        <td class="comentario">${a.comentario || ""}</td>
      `;
      tbody.appendChild(tr);
    });
    // Evento para actualizar estado
    setTimeout(() => {
      document.querySelectorAll(".select-estado").forEach((sel) => {
        sel.addEventListener("change", async function () {
          const id = this.getAttribute("data-id");
          const nuevoEstado = this.value;
          await supabase
            .from("alojamientos")
            .update({ estado_reserva: nuevoEstado })
            .eq("id", id);
          this.className = "select-estado " + nuevoEstado;
        });
      });
    }, 100);
  } catch (err) {
    console.error("Error mostrando alojamientos:", err);
    const tbody = document.querySelector(".tabla-reservas tbody");
    if (tbody)
      tbody.innerHTML = `<tr><td colspan="7" style="color:red">Error cargando datos: ${
        err.message || err
      }</td></tr>`;
  }
}

// Modal para mostrar detalles de la habitación
function crearModalHabitacion() {
  if (document.getElementById("modal-habitacion")) return;
  const modal = document.createElement("div");
  modal.id = "modal-habitacion";
  modal.innerHTML = `
    <div class="modal-bg"></div>
    <div class="modal-content">
      <span class="modal-close">&times;</span>
      <div id="modal-hab-body"></div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector(".modal-close").onclick = () =>
    (modal.style.display = "none");
  modal.querySelector(".modal-bg").onclick = () =>
    (modal.style.display = "none");
}

function mostrarHabitaciones() {
  crearModalHabitacion();
  if (!supabase) {
    console.error("Supabase no está inicializado");
    return;
  }
  supabase
    .from("habitaciones")
    .select("codigo_habitacion, piso, precio_dia, tipo, imagenes, description")
    .then(({ data, error }) => {
      if (error) {
        console.error("Error obteniendo habitaciones:", error);
        return;
      }
      const tbody = document.querySelector(".tabla-habitaciones tbody");
      tbody.innerHTML = "";
      data.forEach((h, idx) => {
        tbody.innerHTML += `
          <tr class="fila-hab" data-idx="${idx}">
            <td>${idx + 1}</td>
            <td>${h.codigo_habitacion || ""}</td>
            <td>PISO ${h.piso || ""}</td>
            <td>S/.${h.precio_dia?.toFixed(2) || ""}</td>
          </tr>
        `;
      });
      // Evento para mostrar modal al hacer click
      document.querySelectorAll(".fila-hab").forEach((tr, i) => {
        tr.addEventListener("click", function () {
          const h = data[i];
          let imgHtml = "";
          if (h.imagenes && h.imagenes.length > 0) {
            imgHtml = `<div class='galeria-img'>
              <img src='${h.imagenes[0]}' alt='Habitación' class='img-habitacion-principal' id='img-principal-modal'>`;
            if (h.imagenes.length > 1) {
              imgHtml += `<div class='miniaturas'>`;
              h.imagenes.forEach((img) => {
                imgHtml += `<img src='${img}' alt='Miniatura' class='img-miniatura' onclick='document.getElementById("img-principal-modal").src = this.src'>`;
              });
              imgHtml += `</div>`;
            }
            imgHtml += `</div>`;
          } else {
            imgHtml = `<img src='img/hotel-icono.png' alt='Sin imagen' class='img-habitacion-principal'>`;
          }
          const body = `
            <h2>Habitación ${h.codigo_habitacion || ""}</h2>
            <div><b>Tipo:</b> ${h.tipo || ""}</div>
            <div><b>Piso:</b> ${h.piso || ""}</div>
            <div><b>Precio por día:</b> S/.${
              h.precio_dia?.toFixed(2) || ""
            }</div>
            <div class='desc-hab'>${h.description || ""}</div>
            ${imgHtml}
          `;
          document.getElementById("modal-hab-body").innerHTML = body;
          document.getElementById("modal-habitacion").style.display = "flex";
        });
      });
    });
}

function mostrarServiciosSolicitados() {
  if (!supabase) {
    console.error("Supabase no está inicializado");
    return;
  }
  // Traer servicios solicitados + info de servicio + habitación
  supabase
    .from("servicios_solicitados")
    .select(
      "id, id_servicio, id_alojamiento, cantidad, estado, servicios:servicios(id, descripcion, tipo_servicio), alojamiento:alojamientos(id_habitacion)"
    )
    .then(({ data, error }) => {
      if (error) {
        console.error("Error obteniendo servicios solicitados:", error);
        return;
      }
      // Ordenar por id descendente (mayor prioridad primero)
      data.sort((a, b) => b.id - a.id);
      const tbody = document.querySelector(".tabla-servicios tbody");
      tbody.innerHTML = "";
      data.forEach((s, idx) => {
        const entregado = s.estado;
        tbody.innerHTML += `
          <tr>
            <td>${s.alojamiento?.id_habitacion || ""}</td>
            <td>${s.servicios?.descripcion || ""}</td>
            <td>${s.cantidad || 1}</td>
            <td>${idx + 1}</td>
            <td>
              <button class="btn-entrega" data-id="${s.id}" ${
          entregado ? "disabled" : ""
        }>
                ${entregado ? "Entregado" : "Confirmar"}
              </button>
            </td>
          </tr>
        `;
      });
      // Evento para confirmar entrega
      document.querySelectorAll(".btn-entrega").forEach((btn) => {
        btn.addEventListener("click", async function () {
          const id = this.getAttribute("data-id");
          this.disabled = true;
          this.textContent = "Entregado";
          await supabase
            .from("servicios_solicitados")
            .update({ estado: true })
            .eq("id", id);
        });
      });
    });
}

document.addEventListener("DOMContentLoaded", function () {
  cargarPagina("inicio");
});

// Funciones para gestión de habitaciones (solo visual)
function inicializarGestionHabitaciones() {
  console.log("Gestión de habitaciones inicializada");
}

function abrirModalHabitacion() {
  document.getElementById("modalHabitacion").style.display = "flex";
}

function cerrarModalHabitacion() {
  document.getElementById("modalHabitacion").style.display = "none";
}

// Funciones para gestión de servicios
function inicializarGestionServicios() {
  console.log("Gestión de servicios inicializada");
  cargarTiposServicio();

  // Agregar eventos a los iconos
  document.querySelectorAll(".icono-option").forEach((btn) => {
    btn.addEventListener("click", function () {
      document
        .querySelectorAll(".icono-option")
        .forEach((b) => b.classList.remove("selected"));
      this.classList.add("selected");

      // Guardar el icono seleccionado
      const iconoSeleccionado = this.getAttribute("data-icon");
      document.getElementById("tipo-icono").value = iconoSeleccionado;
    });
  });

  // Establecer fecha actual como valor por defecto
  const fechaHoy = new Date().toISOString().split("T")[0];
  if (document.getElementById("fecha-desde")) {
    document.getElementById("fecha-desde").value = fechaHoy;
    document.getElementById("fecha-hasta").value = fechaHoy;
  }

  // Agregar filtro de tabs
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", function () {
      const tipoFiltro = this.getAttribute("data-tipo");
      document
        .querySelectorAll(".tab")
        .forEach((t) => t.classList.remove("active"));
      this.classList.add("active");
      filtrarServicios(tipoFiltro);
    });
  });
}

// Cargar tipos de servicio desde Supabase y mostrarlos como cards
async function cargarTiposServicio() {
  try {
    // Cargar desde la tabla servicios_tipos que existe
    const { data, error } = await supabase
      .from("servicios_tipos")
      .select("*")
      .order("tipo");

    if (error) {
      throw error;
    }

    // Ocultar filtros de chips ya que ahora mostramos cards
    const filtrosTipos = document.querySelector(".filtros-tipos");
    if (filtrosTipos) {
      filtrosTipos.style.display = "none";
    }

    // Ocultar spinner
    const spinner = document.getElementById("spinner-tipos");
    if (spinner) spinner.style.display = "none";

    // Mostrar tipos de servicios como cards en el grid
    const serviciosGrid = document.querySelector(".servicios-grid");
    if (serviciosGrid && data && data.length > 0) {
      serviciosGrid.innerHTML = "";

      data.forEach((tipoServicio) => {
        const estado = tipoServicio.activo !== false ? "activo" : "inactivo";
        const estadoTexto =
          tipoServicio.activo !== false ? "Activo" : "Inactivo";
        const icono = obtenerIconoPorTipo(tipoServicio.tipo);

        const card = document.createElement("div");
        card.className = "servicio-card tipo-servicio-card";
        card.setAttribute("data-tipo", tipoServicio.tipo);
        card.setAttribute("data-es-tipo", "true");

        card.innerHTML = `
          <div class="card-icono">
            ${
              tipoServicio.imagen
                ? `<img src="${tipoServicio.imagen}" alt="${tipoServicio.tipo}" style="width: 40px; height: 40px; object-fit: contain;">`
                : `<i class="fa-solid ${icono}"></i>`
            }
          </div>
          <div class="card-info">
            <h3>${tipoServicio.tipo}</h3>
            <p class="servicio-tipo">Tipo de Servicio</p>
            <p class="servicio-descripcion">
              Categoría: ${tipoServicio.tipo}
            </p>
            <div class="servicio-estado ${estado}">${estadoTexto}</div>
          </div>
          <div class="card-acciones">
            <button class="btn-editar-servicio" onclick="editarTipoServicio('${
              tipoServicio.tipo
            }')" title="Editar tipo">
              <i class="fa-solid fa-edit"></i>
            </button>
            <button class="btn-toggle-servicio" onclick="cambiarEstadoTipoServicio('${
              tipoServicio.tipo
            }', ${!tipoServicio.activo})" title="${
          tipoServicio.activo ? "Desactivar" : "Activar"
        }">
              <i class="fa-solid fa-power-off"></i>
            </button>
            <button class="btn-eliminar-servicio" onclick="eliminarTipoServicio('${
              tipoServicio.tipo
            }')" title="Eliminar tipo">
              <i class="fa-solid fa-trash"></i>
            </button>
            <button class="btn-ver-servicios" onclick="mostrarServiciosDelTipo('${
              tipoServicio.tipo
            }')" title="Ver servicios" style="background: #16c093; margin-top: 8px; width: 100%;">
              <i class="fa-solid fa-list"></i> Ver Servicios
            </button>
          </div>
        `;

        serviciosGrid.appendChild(card);
      });
    } else if (serviciosGrid) {
      serviciosGrid.innerHTML = `
        <div class="mensaje-vacio" style="grid-column: 1 / -1; text-align: center; padding: 48px 24px; color: #666;">
          <i class="fa-solid fa-inbox" style="font-size: 3rem; color: var(--gris-claro); margin-bottom: 16px;"></i>
          <h3 style="color: var(--negro); margin-bottom: 8px;">No hay tipos de servicio</h3>
          <p>Comience agregando un nuevo tipo de servicio</p>
          <button class="btn-nuevo" onclick="abrirModalTipoServicio()" style="margin-top: 16px; background: var(--morado); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">
            <i class="fa-solid fa-plus"></i> Nuevo Tipo de Servicio
          </button>
        </div>
      `;
    }
  } catch (error) {
    console.error("Error al cargar tipos de servicio:", error);
    // Ocultar spinner en caso de error
    const spinner = document.getElementById("spinner-tipos");
    if (spinner) spinner.style.display = "none";

    const serviciosGrid = document.querySelector(".servicios-grid");
    if (serviciosGrid) {
      serviciosGrid.innerHTML = `
        <div class="mensaje-error" style="grid-column: 1 / -1; text-align: center; padding: 48px 24px; background: rgba(255, 0, 0, 0.05); border: 1px solid rgba(255, 0, 0, 0.1); border-radius: 12px; color: #666;">
          <i class="fa-solid fa-exclamation-triangle" style="font-size: 3rem; color: #ff6b6b; margin-bottom: 16px;"></i>
          <h3 style="color: var(--negro); margin-bottom: 8px;">Error al cargar tipos de servicio</h3>
          <p>${error.message}</p>
          <button class="btn-recargar" onclick="cargarTiposServicio()" style="margin-top: 16px; background: #ff6b6b; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">
            <i class="fa-solid fa-refresh"></i> Reintentar
          </button>
        </div>
      `;
    }
  }
}

// Función para mostrar servicios de un tipo específico
function mostrarServiciosDelTipo(tipoServicio) {
  // Mostrar botón de regreso a tipos
  const filtrosTipos = document.querySelector(".filtros-tipos");
  if (filtrosTipos) {
    filtrosTipos.style.display = "block";
    filtrosTipos.innerHTML = `
      <button class="tipo-chip activo" onclick="volverATiposServicio()">
        <i class="fa-solid fa-arrow-left"></i> Volver a Tipos de Servicio
      </button>
      <button class="tipo-chip" style="background: var(--morado); color: white;">
        <i class="fa-solid ${obtenerIconoPorTipo(
          tipoServicio
        )}"></i> Servicios de ${tipoServicio}
      </button>
    `;
  }

  // Cargar servicios del tipo
  cargarServiciosPorTipo(tipoServicio);
}

// Función para volver a mostrar tipos de servicio
function volverATiposServicio() {
  const filtrosTipos = document.querySelector(".filtros-tipos");
  if (filtrosTipos) {
    filtrosTipos.style.display = "none";
  }
  cargarTiposServicio();
}

// Función para obtener icono Font Awesome basado en el tipo
function obtenerIconoPorTipo(tipo) {
  const tipoLower = tipo.toLowerCase();

  if (tipoLower.includes("comida") || tipoLower.includes("alimenta")) {
    return "fa-utensils";
  } else if (tipoLower.includes("bebida")) {
    return "fa-glass-water";
  } else if (tipoLower.includes("limpieza")) {
    return "fa-broom";
  } else if (tipoLower.includes("transporte")) {
    return "fa-car";
  } else if (tipoLower.includes("tecnologia") || tipoLower.includes("wifi")) {
    return "fa-wifi";
  } else if (tipoLower.includes("bienestar") || tipoLower.includes("spa")) {
    return "fa-spa";
  } else if (
    tipoLower.includes("recreacion") ||
    tipoLower.includes("piscina")
  ) {
    return "fa-swimming-pool";
  } else {
    return "fa-cube"; // Icono por defecto
  }
}

// Cargar servicios filtrados por tipo específico
async function cargarServiciosPorTipo(tipoSeleccionado) {
  try {
    // Cargar servicios básicos filtrados por tipo
    const { data, error } = await supabase
      .from("servicios")
      .select("*")
      .eq("tipo_servicio", tipoSeleccionado)
      .order("id", { ascending: false });

    if (error) throw error;

    // También obtener conteo de servicios solicitados por cada servicio
    const { data: solicitudesData } = await supabase
      .from("servicios_solicitados")
      .select("id_servicio, id");

    // Contar solicitudes por servicio
    const conteoSolicitudes = {};
    if (solicitudesData) {
      solicitudesData.forEach((solicitud) => {
        const idServicio = solicitud.id_servicio;
        conteoSolicitudes[idServicio] =
          (conteoSolicitudes[idServicio] || 0) + 1;
      });
    }

    // Limpiar el grid y cargar servicios dinámicamente
    const serviciosGrid = document.querySelector(".servicios-grid");
    if (serviciosGrid) {
      serviciosGrid.innerHTML = "";

      if (data && data.length > 0) {
        data.forEach((servicio) => {
          const veces_solicitado = conteoSolicitudes[servicio.id] || 0;
          const estado = servicio.activo !== false ? "activo" : "inactivo";
          const estadoTexto = servicio.activo !== false ? "Activo" : "Inactivo";

          // Determinar icono basado en el tipo usando la función
          const tipo = servicio.tipo_servicio || "";
          const icono = obtenerIconoPorTipo(tipo);

          const card = document.createElement("div");
          card.className = "servicio-card";
          card.setAttribute("data-id", servicio.id);
          card.setAttribute("data-tipo", tipo);

          card.innerHTML = `
            <div class="card-icono">
              ${
                servicio.imagen && Array.isArray(servicio.imagen) && servicio.imagen.length > 0
                  ? `<img src="${servicio.imagen[0]}" alt="${servicio.descripcion}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 8px;">`
                  : servicio.imagen && typeof servicio.imagen === 'string'
                  ? `<img src="${servicio.imagen}" alt="${servicio.descripcion}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 8px;">`
                  : `<i class="fa-solid ${icono}"></i>`
              }
            </div>
            <div class="card-info">
              <h3>${servicio.descripcion || "Sin nombre"}</h3>
              <p class="servicio-tipo">${tipo || "Sin categoría"}</p>
              <p class="servicio-precio">
                ${
                  servicio.precio
                    ? `S/. ${servicio.precio.toFixed(2)}`
                    : "Precio no definido"
                }
              </p>
              <p class="servicio-solicitudes">
                Solicitado ${veces_solicitado} veces
              </p>
              <div class="servicio-estado ${estado}">${estadoTexto}</div>
            </div>
            <div class="card-acciones">
              <button class="btn-editar-servicio" onclick="editarServicio(${
                servicio.id
              })" title="Editar">
                <i class="fa-solid fa-edit"></i>
              </button>
              <button class="btn-toggle-servicio" onclick="cambiarEstadoServicio(${
                servicio.id
              }, ${!servicio.activo})" title="${
            servicio.activo ? "Desactivar" : "Activar"
          }">
                <i class="fa-solid fa-power-off"></i>
              </button>
              <button class="btn-eliminar-servicio" onclick="eliminarServicio(${
                servicio.id
              })" title="Eliminar">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          `;

          serviciosGrid.appendChild(card);
        });
      } else {
        const tipoNombre = tipoSeleccionado
          ? tipoSeleccionado.charAt(0).toUpperCase() + tipoSeleccionado.slice(1)
          : "este tipo";
        serviciosGrid.innerHTML = `
          <div class="mensaje-vacio" style="grid-column: 1 / -1; text-align: center; padding: 48px 24px; color: #666;">
            <i class="fa-solid fa-inbox" style="font-size: 3rem; color: var(--gris-claro); margin-bottom: 16px;"></i>
            <h3 style="color: var(--negro); margin-bottom: 8px;">No hay servicios de ${tipoNombre}</h3>
            <p>No se encontraron servicios para este tipo. Puede agregar uno nuevo.</p>
            <button class="btn-nuevo" onclick="abrirModalServicio('${
              tipoSeleccionado || ""
            }')" style="margin-top: 16px; background: var(--morado); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">
              <i class="fa-solid fa-plus"></i> Nuevo Servicio de ${tipoNombre}
            </button>
          </div>
        `;
      }
    }
  } catch (error) {
    console.error("Error al cargar servicios por tipo:", error);
    const serviciosGrid = document.querySelector(".servicios-grid");
    if (serviciosGrid) {
      serviciosGrid.innerHTML = `
        <div class="mensaje-error" style="grid-column: 1 / -1; text-align: center; padding: 48px 24px; background: rgba(255, 0, 0, 0.05); border: 1px solid rgba(255, 0, 0, 0.1); border-radius: 12px; color: #666;">
          <i class="fa-solid fa-exclamation-triangle" style="font-size: 3rem; color: #ff6b6b; margin-bottom: 16px;"></i>
          <h3 style="color: var(--negro); margin-bottom: 8px;">Error al cargar servicios</h3>
          <p>${error.message}</p>
          <button class="btn-recargar" onclick="cargarServiciosPorTipo('${tipoSeleccionado}')" style="margin-top: 16px; background: #ff6b6b; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">
            <i class="fa-solid fa-refresh"></i> Reintentar
          </button>
        </div>
      `;
    }
  }
}

// Cargar servicios desde Supabase (función original mantenida para compatibilidad)
async function cargarServicios() {
  try {
    // Cargar servicios básicos sin relación con servicios_tipos
    const { data, error } = await supabase
      .from("servicios")
      .select("*")
      .order("id", { ascending: false });

    if (error) throw error;

    // También obtener conteo de servicios solicitados por cada servicio
    const { data: solicitudesData } = await supabase
      .from("servicios_solicitados")
      .select("id_servicio, id");

    // Contar solicitudes por servicio
    const conteoSolicitudes = {};
    if (solicitudesData) {
      solicitudesData.forEach((solicitud) => {
        const idServicio = solicitud.id_servicio;
        conteoSolicitudes[idServicio] =
          (conteoSolicitudes[idServicio] || 0) + 1;
      });
    }

    // Limpiar el grid y cargar servicios dinámicamente
    const serviciosGrid = document.querySelector(".servicios-grid");
    if (serviciosGrid) {
      serviciosGrid.innerHTML = "";

      if (data && data.length > 0) {
        data.forEach((servicio) => {
          const veces_solicitado = conteoSolicitudes[servicio.id] || 0;
          const estado = servicio.activo !== false ? "activo" : "inactivo";
          const estadoTexto = servicio.activo !== false ? "Activo" : "Inactivo";

          // Determinar icono basado en el tipo usando la función
          const tipo = servicio.tipo_servicio || "";
          const icono = obtenerIconoPorTipo(tipo);

          const card = document.createElement("div");
          card.className = "servicio-card";
          card.setAttribute("data-id", servicio.id);
          card.setAttribute("data-tipo", tipo);

          card.innerHTML = `
            <div class="card-icono">
              <i class="fa-solid ${icono}"></i>
            </div>
            <div class="card-info">
              <h3>${servicio.descripcion || "Sin nombre"}</h3>
              <p class="servicio-tipo">${tipo || "Sin categoría"}</p>
              <p class="servicio-precio">
                ${
                  servicio.precio
                    ? `S/. ${servicio.precio.toFixed(2)}`
                    : "Precio no definido"
                }
              </p>
              <p class="servicio-solicitudes">
                Solicitado ${veces_solicitado} veces
              </p>
              <div class="servicio-estado ${estado}">${estadoTexto}</div>
            </div>
            <div class="card-acciones">
              <button class="btn-editar-servicio" onclick="editarServicio(${
                servicio.id
              })" title="Editar">
                <i class="fa-solid fa-edit"></i>
              </button>
              <button class="btn-toggle-servicio" onclick="cambiarEstadoServicio(${
                servicio.id
              }, ${!servicio.activo})" title="${
            servicio.activo ? "Desactivar" : "Activar"
          }">
                <i class="fa-solid fa-power-off"></i>
              </button>
              <button class="btn-eliminar-servicio" onclick="eliminarServicio(${
                servicio.id
              })" title="Eliminar">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          `;

          serviciosGrid.appendChild(card);
        });
      } else {
        serviciosGrid.innerHTML = `
          <div class="mensaje-vacio">
            <i class="fa-solid fa-inbox"></i>
            <h3>No hay servicios registrados</h3>
            <p>Comience agregando un nuevo servicio</p>
            <button class="btn-nuevo" onclick="abrirModalServicio()">
              <i class="fa-solid fa-plus"></i> Nuevo Servicio
            </button>
          </div>
        `;
      }
    }
  } catch (error) {
    console.error("Error al cargar servicios:", error);
    const serviciosGrid = document.querySelector(".servicios-grid");
    if (serviciosGrid) {
      serviciosGrid.innerHTML = `
        <div class="mensaje-error">
          <i class="fa-solid fa-exclamation-triangle"></i>
          <h3>Error al cargar servicios</h3>
          <p>${error.message}</p>
          <button class="btn-recargar" onclick="cargarServicios()">
            <i class="fa-solid fa-refresh"></i> Reintentar
          </button>
        </div>
      `;
    }
  }
}

// Filtrar servicios por tipo
function filtrarServicios(tipo) {
  const cards = document.querySelectorAll(".servicio-card");

  if (tipo === "todos") {
    cards.forEach((card) => (card.style.display = ""));
    return;
  }

  cards.forEach((card) => {
    const tipoCard = card.getAttribute("data-tipo") || "";
    const estadoEl = card.querySelector(".servicio-estado");
    const esActivo = estadoEl && estadoEl.classList.contains("activo");

    let mostrar = false;

    if (tipo === "activos") {
      mostrar = esActivo;
    } else if (tipo === "inactivos") {
      mostrar = !esActivo;
    } else {
      // Filtrar por tipo específico
      mostrar = tipoCard.includes(tipo) || tipoCard === tipo;
    }

    card.style.display = mostrar ? "" : "none";
  });
}

// Aplicar filtros avanzados
function aplicarFiltros() {
  const tipo = document.getElementById("filtro-tipo").value;
  const nombre = document.getElementById("filtro-nombre").value.toLowerCase();

  const filas = document.querySelectorAll(".tabla-servicios tbody tr");

  filas.forEach((fila) => {
    const tipoId = fila.getAttribute("data-tipo");
    const descripcion = fila
      .querySelector("td:nth-child(2)")
      .textContent.toLowerCase();

    const coincideTipo = !tipo || tipoId === tipo;
    const coincideNombre = !nombre || descripcion.includes(nombre);

    fila.style.display = coincideTipo && coincideNombre ? "" : "none";
  });
}

// Funciones para gestionar servicios
function abrirModalServicio(tipoPreselec = null, id = null) {
  document.getElementById("modalServicio").style.display = "flex";
  console.log(
    "Abriendo modal de servicio - tipoPreselec:",
    tipoPreselec,
    "id:",
    id
  );

  if (id) {
    console.log("Modo edición - configurando modal para ID:", id);
    document.getElementById("servicio-id").value = id;
    document.querySelector("#modalServicio .modal-header h3").textContent =
      "Editar Servicio";
    console.log("Llamando a cargarDatosServicio con ID:", id);

    // Pequeño delay para asegurar que el modal esté visible
    setTimeout(() => {
      cargarDatosServicio(id);
    }, 100);
  } else {
    console.log("Modo creación - configurando modal nuevo");
    limpiarFormularioServicio();
    document.querySelector("#modalServicio .modal-header h3").textContent =
      "Nuevo Servicio";
    // Si se pasó un tipo preseleccionado, guardarlo para usarlo al guardar
    if (tipoPreselec) {
      console.log("Tipo preseleccionado:", tipoPreselec);
      document.getElementById("servicio-tipo-hidden").value = tipoPreselec;
    }
  }

  console.log("Mostrando modal");
  document.getElementById("modalServicio").style.display = "flex";
}

function editarServicio(id) {
  console.log("Abriendo modal de servicio - ID:", id);
  abrirModalServicio(null, id);
}

function cerrarModalServicio() {
  document.getElementById("modalServicio").style.display = "none";
}

function limpiarFormularioServicio() {
  document.getElementById("servicio-id").value = "";
  document.getElementById("servicio-descripcion").value = "";
  document.getElementById("servicio-precio").value = "";
  document.getElementById("servicio-activo").checked = true;

  // Limpiar detalle si existe el campo
  const detalleField = document.getElementById("servicio-detalle");
  if (detalleField) {
    detalleField.value = "";
  }

  // Limpiar imagen si existe el campo
  const imagenField = document.getElementById("servicio-imagen");
  if (imagenField) {
    imagenField.value = "";
  }

  if (document.getElementById("servicio-tipo-hidden")) {
    document.getElementById("servicio-tipo-hidden").value = "";
  }
}

async function cargarDatosServicio(id) {
  try {
    console.log("Cargando datos del servicio con ID:", id);

    const { data, error } = await supabase
      .from("servicios")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error en consulta Supabase:", error);
      throw error;
    }

    console.log("Datos del servicio obtenidos:", data);

    // Verificar que los elementos existen antes de asignar valores
    const descripcionField = document.getElementById("servicio-descripcion");
    const precioField = document.getElementById("servicio-precio");
    const activoField = document.getElementById("servicio-activo");
    const detalleField = document.getElementById("servicio-detalle");
    const imagenField = document.getElementById("servicio-imagen");
    const tipoHiddenField = document.getElementById("servicio-tipo-hidden");

    if (descripcionField) {
      descripcionField.value = data.descripcion || "";
      console.log("Descripción asignada:", data.descripcion);
    } else {
      console.error("Campo servicio-descripcion no encontrado");
    }

    if (precioField) {
      precioField.value = data.precio || "";
      console.log("Precio asignado:", data.precio);
    } else {
      console.error("Campo servicio-precio no encontrado");
    }

    if (activoField) {
      activoField.checked = data.activo !== false;
      console.log("Estado activo asignado:", data.activo);
    } else {
      console.error("Campo servicio-activo no encontrado");
    }

    // Cargar detalle si existe el campo (solo en la interfaz, no en BD)
    if (detalleField) {
      detalleField.value = data.descripcion || ""; // Usar descripción como detalle
      console.log("Detalle asignado (usando descripción):", data.descripcion);
    } else {
      console.log("Campo servicio-detalle no encontrado (opcional)");
    }

    // Cargar imagen si existe el campo
    if (imagenField) {
      // Si imagen es un array, tomar el primer elemento, si es string usar directamente
      const imagenValue = Array.isArray(data.imagen) ? data.imagen[0] : data.imagen;
      imagenField.value = imagenValue || "";
      console.log("Imagen asignada:", imagenValue);
    } else {
      console.log("Campo servicio-imagen no encontrado (opcional)");
    }

    // Guardar el tipo actual para mantenerlo al actualizar
    if (tipoHiddenField) {
      tipoHiddenField.value = data.tipo_servicio || "";
      console.log("Tipo de servicio asignado:", data.tipo_servicio);
    } else {
      console.error("Campo servicio-tipo-hidden no encontrado");
    }
  } catch (error) {
    console.error("Error al cargar datos del servicio:", error);
    alert("Error al cargar los datos del servicio: " + error.message);
  }
}

async function guardarServicio() {
  try {
    const id = document.getElementById("servicio-id").value;
    const descripcion = document.getElementById("servicio-descripcion").value;
    const precio = document.getElementById("servicio-precio").value;
    const activo = document.getElementById("servicio-activo").checked;

    // Obtener imagen si existe el campo
    let imagen = "";
    const imagenField = document.getElementById("servicio-imagen");
    if (imagenField) {
      imagen = imagenField.value;
    }

    // Obtener el tipo del campo oculto o del chip activo
    let tipo = "";
    if (document.getElementById("servicio-tipo-hidden")) {
      tipo = document.getElementById("servicio-tipo-hidden").value;
    }

    // Si no hay tipo en el campo oculto, obtenerlo del chip activo
    if (!tipo) {
      const chipActivo = document.querySelector(".tipo-chip.activo");
      if (chipActivo) {
        tipo = chipActivo.getAttribute("data-tipo");
      }
    }

    if (!descripcion) {
      alert("El nombre del servicio es obligatorio");
      return;
    }

    if (!tipo) {
      alert(
        "Debe seleccionar un tipo de servicio antes de agregar un servicio"
      );
      return;
    }

    const servicio = {
      descripcion,
      tipo_servicio: tipo,
      precio: precio ? parseFloat(precio) : null,
      imagen: imagen ? [imagen] : null, // Convertir string a array
      activo,
    };

    let result;

    if (id) {
      // Actualizar servicio existente
      result = await supabase.from("servicios").update(servicio).eq("id", id);
    } else {
      // Crear nuevo servicio
      result = await supabase.from("servicios").insert(servicio);
    }

    if (result.error) throw result.error;

    cerrarModalServicio();
    // Recargar los servicios del tipo actual
    cargarServiciosPorTipo(tipo);
    alert("Servicio guardado correctamente");
  } catch (error) {
    console.error("Error al guardar servicio:", error);
    alert("Error al guardar el servicio: " + error.message);
  }
}

async function cambiarEstadoServicio(id, nuevoEstado) {
  try {
    const { error } = await supabase
      .from("servicios")
      .update({ activo: nuevoEstado })
      .eq("id", id);

    if (error) throw error;

    // Buscar el tipo del servicio que se está modificando
    const { data: servicioData } = await supabase
      .from("servicios")
      .select("tipo_servicio")
      .eq("id", id)
      .single();

    // Recargar servicios del tipo correspondiente
    if (servicioData && servicioData.tipo_servicio) {
      cargarServiciosPorTipo(servicioData.tipo_servicio);
    } else {
      // Si no se encuentra el tipo, recargar la vista actual
      const filtrosTipos = document.querySelector(".filtros-tipos");
      if (filtrosTipos && filtrosTipos.style.display !== "none") {
        // Si hay filtros visibles, estamos en vista de servicios de un tipo
        const botonTipo = filtrosTipos.querySelector(
          ".tipo-chip:not([onclick*='volver'])"
        );
        if (botonTipo) {
          const textoBoton = botonTipo.textContent;
          const match = textoBoton.match(/Servicios de (.+)/);
          if (match) {
            cargarServiciosPorTipo(match[1]);
          }
        }
      } else {
        // Si no hay filtros, estamos en vista de tipos
        cargarTiposServicio();
      }
    }

    const estadoTexto = nuevoEstado ? "activado" : "desactivado";
    alert(`Servicio ${estadoTexto} correctamente`);
  } catch (error) {
    console.error("Error al cambiar estado del servicio:", error);
    alert("Error al cambiar el estado del servicio: " + error.message);
  }
}

async function eliminarServicio(id) {
  if (
    !confirm(
      "¿Está seguro de eliminar este servicio? Esta acción no se puede deshacer."
    )
  ) {
    return;
  }

  try {
    // Primero obtener los datos del servicio para saber su tipo
    const { data: servicioData } = await supabase
      .from("servicios")
      .select("tipo_servicio")
      .eq("id", id)
      .single();

    // Verificar si el servicio tiene solicitudes asociadas
    const { data, error: errorCheck } = await supabase
      .from("servicios_solicitados")
      .select("id")
      .eq("id_servicio", id);

    if (errorCheck) throw errorCheck;

    if (data && data.length > 0) {
      // Tiene solicitudes, solo desactivarlo
      await cambiarEstadoServicio(id, false);
      alert(
        "El servicio tiene solicitudes asociadas. Se ha desactivado en lugar de eliminarse."
      );
      return;
    }

    // Si no tiene solicitudes, eliminarlo completamente
    const { error } = await supabase.from("servicios").delete().eq("id", id);

    if (error) throw error;

    // Recargar servicios del tipo correspondiente
    if (servicioData && servicioData.tipo_servicio) {
      cargarServiciosPorTipo(servicioData.tipo_servicio);
    } else {
      // Si no se encuentra el tipo, recargar la vista actual
      const filtrosTipos = document.querySelector(".filtros-tipos");
      if (filtrosTipos && filtrosTipos.style.display !== "none") {
        // Si hay filtros visibles, estamos en vista de servicios de un tipo
        const botonTipo = filtrosTipos.querySelector(
          ".tipo-chip:not([onclick*='volver'])"
        );
        if (botonTipo) {
          const textoBoton = botonTipo.textContent;
          const match = textoBoton.match(/Servicios de (.+)/);
          if (match) {
            cargarServiciosPorTipo(match[1]);
          }
        }
      } else {
        // Si no hay filtros, estamos en vista de tipos
        cargarTiposServicio();
      }
    }

    alert("Servicio eliminado correctamente");
  } catch (error) {
    console.error("Error al eliminar servicio:", error);
    alert("Error al eliminar el servicio: " + error.message);
  }
}

// Funciones para modal de reporte
function abrirModalReporte(tipo = "todos") {
  document.getElementById("reporte-tipo").value = tipo;
  document.getElementById("modalReporte").style.display = "flex";
}

function cerrarModalReporte() {
  document.getElementById("modalReporte").style.display = "none";
}

async function generarReporte() {
  try {
    const fechaDesde = document.getElementById("fecha-desde").value;
    const fechaHasta = document.getElementById("fecha-hasta").value;
    const formato = document.querySelector(
      'input[name="formato"]:checked'
    ).value;
    const incluirCliente = document.getElementById("incluir-cliente").checked;
    const incluirHabitacion =
      document.getElementById("incluir-habitacion").checked;
    const incluirEmpleado = document.getElementById("incluir-empleado").checked;

    if (!fechaDesde || !fechaHasta) {
      alert("Por favor seleccione un rango de fechas");
      return;
    }

    if (new Date(fechaDesde) > new Date(fechaHasta)) {
      alert("La fecha desde no puede ser mayor que la fecha hasta");
      return;
    }

    // Obtener datos de servicios solicitados en el rango de fechas
    const { data: serviciosSolicitados, error } = await supabase
      .from("servicios_solicitados")
      .select(
        `
        id,
        cantidad,
        estado,
        created_at,
        servicios:servicios(descripcion, tipo_servicio, precio),
        alojamiento:alojamientos(id_habitacion, fecha_alojamiento, id_cliente)
      `
      )
      .gte("created_at", fechaDesde)
      .lte("created_at", fechaHasta + "T23:59:59")
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (!serviciosSolicitados || serviciosSolicitados.length === 0) {
      alert(
        "No se encontraron servicios solicitados en el rango de fechas seleccionado"
      );
      return;
    }

    // Obtener datos adicionales si están seleccionados
    let datosClientes = {};
    if (incluirCliente) {
      const clientesIds = [
        ...new Set(
          serviciosSolicitados
            .map((s) => s.alojamiento?.id_cliente)
            .filter(Boolean)
        ),
      ];
      if (clientesIds.length > 0) {
        const { data: clientes } = await supabase
          .from("clientes")
          .select("nro_doc, nombre, apellido, telefono")
          .in("nro_doc", clientesIds);

        if (clientes) {
          clientes.forEach((cliente) => {
            datosClientes[cliente.nro_doc] = cliente;
          });
        }
      }
    }

    // Generar contenido del reporte
    let contenidoReporte = "";
    let titulo = `Reporte de Servicios Solicitados - ${fechaDesde} al ${fechaHasta}`;

    if (formato === "excel") {
      // Generar CSV para Excel
      let csv = "data:text/csv;charset=utf-8,";
      csv += "ID,Servicio,Tipo,Cantidad,Estado,Fecha Solicitud";

      if (incluirHabitacion) csv += ",Habitación,Fecha Alojamiento";
      if (incluirCliente) csv += ",Cliente,Teléfono";
      csv += "\n";

      serviciosSolicitados.forEach((servicio) => {
        const fecha = new Date(servicio.created_at).toLocaleDateString();
        const estado = servicio.estado ? "Entregado" : "Pendiente";

        csv += `${servicio.id},`;
        csv += `"${servicio.servicios?.descripcion || "N/A"}",`;
        csv += `"${servicio.servicios?.tipo_servicio || "N/A"}",`;
        csv += `${servicio.cantidad || 0},`;
        csv += `"${estado}",`;
        csv += `"${fecha}"`;

        if (incluirHabitacion) {
          csv += `,"${servicio.alojamiento?.id_habitacion || "N/A"}"`;
          csv += `,"${servicio.alojamiento?.fecha_alojamiento || "N/A"}"`;
        }

        if (incluirCliente) {
          const cliente = datosClientes[servicio.alojamiento?.id_cliente];
          const nombreCompleto = cliente
            ? `${cliente.nombre} ${cliente.apellido}`
            : "N/A";
          csv += `,"${nombreCompleto}"`;
          csv += `,"${cliente?.telefono || "N/A"}"`;
        }

        csv += "\n";
      });

      // Descargar archivo CSV
      const encodedUri = encodeURI(csv);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `reporte_servicios_${fechaDesde}_${fechaHasta}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Generar reporte HTML para vista previa (simulando PDF)
      let html = `
        <html>
        <head>
          <title>${titulo}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #9316c0; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .estado-entregado { color: #16c093; font-weight: bold; }
            .estado-pendiente { color: #ff9900; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>${titulo}</h1>
          <p><strong>Total de servicios:</strong> ${
            serviciosSolicitados.length
          }</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Servicio</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Estado</th>
                <th>Fecha</th>
                ${incluirHabitacion ? "<th>Habitación</th>" : ""}
                ${incluirCliente ? "<th>Cliente</th>" : ""}
              </tr>
            </thead>
            <tbody>
      `;

      serviciosSolicitados.forEach((servicio) => {
        const fecha = new Date(servicio.created_at).toLocaleDateString();
        const estado = servicio.estado ? "Entregado" : "Pendiente";
        const estadoClass = servicio.estado
          ? "estado-entregado"
          : "estado-pendiente";

        html += `
          <tr>
            <td>${servicio.id}</td>
            <td>${servicio.servicios?.descripcion || "N/A"}</td>
            <td>${servicio.servicios?.tipo_servicio || "N/A"}</td>
            <td>${servicio.cantidad || 0}</td>
            <td class="${estadoClass}">${estado}</td>
            <td>${fecha}</td>
        `;

        if (incluirHabitacion) {
          html += `<td>${servicio.alojamiento?.id_habitacion || "N/A"}</td>`;
        }

        if (incluirCliente) {
          const cliente = datosClientes[servicio.alojamiento?.id_cliente];
          const nombreCompleto = cliente
            ? `${cliente.nombre} ${cliente.apellido}`
            : "N/A";
          html += `<td>${nombreCompleto}</td>`;
        }

        html += "</tr>";
      });

      html += `
            </tbody>
          </table>
        </body>
        </html>
      `;

      // Abrir en nueva ventana para vista previa
      const newWindow = window.open("", "_blank");
      newWindow.document.write(html);
      newWindow.document.close();
    }

    cerrarModalReporte();
    alert(`Reporte generado exitosamente en formato ${formato.toUpperCase()}`);
  } catch (error) {
    console.error("Error al generar reporte:", error);
    alert("Error al generar el reporte: " + error.message);
  }
}

// Funciones para gestión de tipos de servicios
function editarTipoServicio(tipo) {
  abrirModalTipoServicio(tipo);
}

async function cambiarEstadoTipoServicio(tipo, nuevoEstado) {
  try {
    const { error } = await supabase
      .from("servicios_tipos")
      .update({ activo: nuevoEstado })
      .eq("tipo", tipo);

    if (error) throw error;

    // Recargar tipos de servicios
    cargarTiposServicio();
  } catch (error) {
    console.error("Error al cambiar estado del tipo de servicio:", error);
    alert("Error al cambiar el estado del tipo de servicio: " + error.message);
  }
}

async function eliminarTipoServicio(tipo) {
  if (
    !confirm(
      "¿Está seguro de eliminar este tipo de servicio? Esta acción no se puede deshacer."
    )
  ) {
    return;
  }

  try {
    // Verificar si el tipo tiene servicios asociados
    const { data, error: errorCheck } = await supabase
      .from("servicios")
      .select("id")
      .eq("tipo_servicio", tipo);

    if (errorCheck) throw errorCheck;

    if (data && data.length > 0) {
      // Tiene servicios, solo desactivarlo
      await cambiarEstadoTipoServicio(tipo, false);
      alert(
        "El tipo de servicio tiene servicios asociados. Se ha desactivado en lugar de eliminarse."
      );
      return;
    }

    // Si no tiene servicios, eliminarlo completamente
    const { error } = await supabase
      .from("servicios_tipos")
      .delete()
      .eq("tipo", tipo);

    if (error) throw error;

    // Recargar tipos de servicios
    cargarTiposServicio();
  } catch (error) {
    console.error("Error al eliminar tipo de servicio:", error);
    alert("Error al eliminar el tipo de servicio: " + error.message);
  }
}

// Funciones para modal de tipo de servicio
function abrirModalTipoServicio(tipo = null) {
  limpiarFormularioTipoServicio();

  if (tipo) {
    document.getElementById("tipo-id").value = tipo;
    document.querySelector("#modalTipoServicio .modal-header h3").textContent =
      "Editar Tipo de Servicio";
    cargarDatosTipoServicio(tipo);
  } else {
    document.querySelector("#modalTipoServicio .modal-header h3").textContent =
      "Nuevo Tipo de Servicio";
  }

  document.getElementById("modalTipoServicio").style.display = "flex";
}

function cerrarModalTipoServicio() {
  document.getElementById("modalTipoServicio").style.display = "none";
}

function limpiarFormularioTipoServicio() {
  document.getElementById("tipo-id").value = "";
  document.getElementById("tipo-nombre").value = "";
  document.getElementById("tipo-imagen").value = "";
}

async function cargarDatosTipoServicio(tipo) {
  try {
    const { data, error } = await supabase
      .from("servicios_tipos")
      .select("*")
      .eq("tipo", tipo)
      .single();

    if (error) throw error;

    document.getElementById("tipo-nombre").value = data.tipo || "";
    document.getElementById("tipo-imagen").value = data.imagen || "";
  } catch (error) {
    console.error("Error al cargar datos del tipo de servicio:", error);
    alert("Error al cargar los datos del tipo de servicio: " + error.message);
  }
}

async function guardarTipoServicio() {
  try {
    const tipoId = document.getElementById("tipo-id").value;
    const nombre = document.getElementById("tipo-nombre").value;
    const imagen = document.getElementById("tipo-imagen").value;

    if (!nombre) {
      alert("El nombre del tipo de servicio es obligatorio");
      return;
    }

    if (!imagen) {
      alert("La URL de la imagen es obligatoria");
      return;
    }

    const tipoServicio = {
      tipo: nombre.toUpperCase(),
      imagen: imagen,
      activo: true,
    };

    let result;

    if (tipoId) {
      // Actualizar tipo existente
      result = await supabase
        .from("servicios_tipos")
        .update(tipoServicio)
        .eq("tipo", tipoId);
    } else {
      // Crear nuevo tipo
      result = await supabase.from("servicios_tipos").insert(tipoServicio);
    }

    if (result.error) throw result.error;

    cerrarModalTipoServicio();
    cargarTiposServicio();
    alert("Tipo de servicio guardado correctamente");
  } catch (error) {
    console.error("Error al guardar tipo de servicio:", error);
    alert("Error al guardar el tipo de servicio: " + error.message);
  }
}


function cerrarModalServicio() {
  document.getElementById("modalServicio").style.display = "none";
}
