function cargarPagina(pagina) {
  fetch(`paginas/${pagina}.html`)
    .then(res => res.text())
    .then(html => {
      document.getElementById("contenido-principal").innerHTML = html;

      if (pagina === "dashboard") {
        cargarGraficosDashboard();
      }
    });
}

function cargarGraficosDashboard() {
  const ctxBar = document.getElementById('graficoReservas').getContext('2d');
  new Chart(ctxBar, {
    type: 'bar',
    data: {
      labels: ['10/06', '11/06', '12/06', '13/06', '14/06'],
      datasets: [{
        label: 'Reservas',
        data: [12, 19, 14, 23, 28],
        backgroundColor: '#9316c0'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });

  const ctxPie = document.getElementById('graficoServicios').getContext('2d');
  new Chart(ctxPie, {
    type: 'pie',
    data: {
      labels: ['Limpieza', 'Room Service', 'Lavandería'],
      datasets: [{
        data: [10, 20, 15],
        backgroundColor: ['#9316c0', '#16c093', '#ff9900']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}
