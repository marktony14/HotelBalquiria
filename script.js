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
    });
}

function cargarGraficosDashboard() {
  const ctxBar = document.getElementById("graficoReservas").getContext("2d");
  new Chart(ctxBar, {
    type: "bar",
    data: {
      labels: ["10/06", "11/06", "12/06", "13/06", "14/06"],
      datasets: [
        {
          label: "Reservas",
          data: [12, 19, 14, 23, 28],
          backgroundColor: "#9316c0",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });

  const ctxPie = document.getElementById("graficoServicios").getContext("2d");
  new Chart(ctxPie, {
    type: "pie",
    data: {
      labels: ["Limpieza", "Room Service", "Lavandería"],
      datasets: [
        {
          data: [10, 20, 15],
          backgroundColor: ["#9316c0", "#16c093", "#ff9900"],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });

  const ctxIngresos = document
    .getElementById("graficoIngresos")
    .getContext("2d");
  new Chart(ctxIngresos, {
    type: "bar",
    data: {
      labels: ["10/06", "11/06", "12/06", "13/06", "14/06"],
      datasets: [
        {
          label: "Ingresos (S/.)",
          data: [300, 450, 380, 500, 620],
          backgroundColor: "#9316c0",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });

  const ctxHabitaciones = document
    .getElementById("graficoHabitaciones")
    .getContext("2d");
  new Chart(ctxHabitaciones, {
    type: "bar",
    data: {
      labels: ["Individual", "Doble", "Matrimonial", "Suite"],
      datasets: [
        {
          label: "Reservas",
          data: [15, 25, 10, 5],
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
        <td><span class="estado ${a.estado_reserva}">${
        a.estado_reserva || ""
      }</span></td>
        <td class="comentario">${a.comentario || ""}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Error mostrando alojamientos:", err);
    const tbody = document.querySelector(".tabla-reservas tbody");
    if (tbody)
      tbody.innerHTML = `<tr><td colspan="7" style="color:red">Error cargando datos: ${
        err.message || err
      }</td></tr>`;
  }
}
