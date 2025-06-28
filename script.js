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
