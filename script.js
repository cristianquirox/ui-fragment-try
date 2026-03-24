const estadosTicket = [
  {
    estado: "CREADO",
    desde: "2026-03-24T15:42:49.541Z",
    hasta: "2026-03-24T16:30:00.000Z"
  },
  {
    estado: "EN ATENCIÓN",
    desde: "2026-03-24T16:30:00.000Z",
    hasta: "2026-03-24T18:30:00.000Z"
  },
  {
    estado: "EN QA USUARIO",
    desde: "2026-03-24T18:30:00.000Z",
    // Si sigue en este estado, puedes poner hasta null
    // y usar la fecha de actualización actual:
    hasta: "2026-03-24T19:49:58.758Z"
  }
];

// ==========================
// 2. Utilidades de fechas
// ==========================
function formatearFechaISO(isoStr) {
  if (!isoStr) return "-";
  const d = new Date(isoStr);
  // Simple: YYYY-MM-DD HH:mm
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

function diffEnMinutos(desdeIso, hastaIso) {
  const desde = new Date(desdeIso);
  const hasta = new Date(hastaIso);
  return (hasta - desde) / 1000 / 60;
}

function minutosAHorasYMinutos(minTotal) {
  const horas = Math.floor(minTotal / 60);
  const minutos = Math.round(minTotal % 60);
  return { horas, minutos };
}

function formatearDuracion(minTotal) {
  const { horas, minutos } = minutosAHorasYMinutos(minTotal);
  const h = String(horas).padStart(2, "0");
  const m = String(minutos).padStart(2, "0");
  return `${h}:${m}`;
}

// ==========================
// 3. Pintar la tabla de estados
// ==========================
function renderTablaEstados() {
  const tbody = document.querySelector("#tabla-estados tbody");
  tbody.innerHTML = "";

  estadosTicket.forEach(e => {
    const tr = document.createElement("tr");

    const tdEstado = document.createElement("td");
    tdEstado.textContent = e.estado;

    const tdDesde = document.createElement("td");
    tdDesde.textContent = formatearFechaISO(e.desde);

    const tdHasta = document.createElement("td");
    tdHasta.textContent = formatearFechaISO(e.hasta);

    const tdDuracion = document.createElement("td");
    if (e.desde && e.hasta) {
      const minutos = diffEnMinutos(e.desde, e.hasta);
      tdDuracion.textContent = formatearDuracion(minutos);
    } else {
      tdDuracion.textContent = "-";
    }

    tr.appendChild(tdEstado);
    tr.appendChild(tdDesde);
    tr.appendChild(tdHasta);
    tr.appendChild(tdDuracion);

    tbody.appendChild(tr);
  });
}

// ==========================
// 4. Pintar la barra / línea de tiempo
// ==========================
function renderTimeline() {
  const container = document.getElementById("timeline-container");
  container.innerHTML = "";

  // Calculamos la duración total en minutos
  let totalMin = 0;
  const segmentos = estadosTicket.map(e => {
    if (!e.desde || !e.hasta) return { ...e, minutos: 0 };
    const min = diffEnMinutos(e.desde, e.hasta);
    totalMin += min;
    return { ...e, minutos: min };
  });

  const timelineBar = document.createElement("div");
  timelineBar.className = "timeline-bar";

  // Creamos cada segmento con ancho proporcional
  segmentos.forEach(seg => {
    const ancho = totalMin === 0 ? 0 : (seg.minutos / totalMin) * 100;

    const div = document.createElement("div");
    div.className = "segment";
    // Clase adicional sin espacios para poder estilizar si quieres en CSS
    const claseEstado = "estado-" + seg.estado.replace(/\s+/g, "-").toUpperCase();
    div.classList.add(claseEstado);

    div.style.width = ancho + "%";

    const label = document.createElement("span");
    label.className = "segment-label";
    if (seg.minutos > 0) {
      label.textContent = `${seg.estado} (${formatearDuracion(seg.minutos)})`;
    } else {
      label.textContent = seg.estado;
    }

    div.appendChild(label);
    timelineBar.appendChild(div);
  });

  container.appendChild(timelineBar);

  // Texto con el total
  const totalDiv = document.createElement("div");
  totalDiv.className = "total-tiempo";

  const totalStr = formatearDuracion(totalMin);
  totalDiv.textContent = `Tiempo total desde el primer estado hasta el último: ${totalStr} (hh:mm)`;

  container.appendChild(totalDiv);
}

function jiraResizeToContent() {
  // Si estás en Jira (iframe con AP disponible)
  if (window.AP && typeof AP.resize === "function") {
    const height = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );
    AP.resize("100%", `${height}px`);
  }
}

// Inicializar
renderTablaEstados();
renderTimeline();

// Forzar resize luego de pintar el DOM
setTimeout(jiraResizeToContent, 50);
setTimeout(jiraResizeToContent, 250);