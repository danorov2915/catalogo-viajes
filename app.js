// Configuracion Oficial de Beta Azul Viajes Turisticos
const CONFIG = {
  whatsappNumber: "522444470237",
  agencyName: "Beta Azul Viajes Turisticos",
  responsibleName: "Veronica Hernandez Echeverria"
};

let todosLosViajes = [];
let categoriaActual = "Todos";
let busquedaActual = "";

async function cargarViajes() {
  const countEl = document.getElementById("resultsCount");
  if (countEl) countEl.innerText = "Cargando catalogo...";

  try {
    const res = await fetch("viajes.json?v=" + Date.now());
    if (!res.ok) throw new Error("No cargo viajes.json local");
    const data = await res.json();
    todosLosViajes = data.viajes || [];
    renderizarViajes();
  } catch (err) {
    console.warn("Fallo local, usando respaldo remoto:", err);
    try {
      const resRaw = await fetch("https://raw.githubusercontent.com/danorov2915/catalogo-viajes/main/viajes.json");
      if (!resRaw.ok) throw new Error("Fallback remoto no respondio");
      const dataRaw = await resRaw.json();
      todosLosViajes = dataRaw.viajes || [];
      renderizarViajes();
    } catch (err2) {
      console.error("Error definitivo al cargar:", err2);
      const grid = document.getElementById("flyersGrid");
      if (grid) {
        grid.innerHTML = '<div class="empty-state"><h3>Hubo un problema al cargar los flyers</h3><p>Intenta recargar la pagina.</p></div>';
      }
      if (countEl) countEl.innerText = "Error al cargar";
    }
  }
}

function obtenerViajesFiltrados() {
  return todosLosViajes.filter(function(viaje) {
    if (!viaje.activo) return false;

    // Filtro seguro por categoria
    let cumpleCat = false;
    if (!categoriaActual || categoriaActual === "Todos") {
      cumpleCat = true;
    } else if (viaje.categoria && typeof viaje.categoria === "string") {
      cumpleCat = (viaje.categoria.toLowerCase() === categoriaActual.toLowerCase());
    }

    // Filtro seguro por termino de busqueda
    const term = (busquedaActual || "").toLowerCase().trim();
    const cumpleTerm = !term ||
      (viaje.titulo && viaje.titulo.toLowerCase().includes(term)) ||
      (viaje.destino && viaje.destino.toLowerCase().includes(term)) ||
      (viaje.categoria && viaje.categoria.toLowerCase().includes(term));

    return cumpleCat && cumpleTerm;
  });
}

function renderizarViajes() {
  const grid = document.getElementById("flyersGrid");
  const countEl = document.getElementById("resultsCount");
  const filtrados = obtenerViajesFiltrados();

  if (countEl) {
    countEl.innerText = "Mostrando " + filtrados.length + (filtrados.length === 1 ? " viaje" : " viajes");
  }

  if (!grid) return;

  if (filtrados.length === 0) {
    grid.innerHTML = '<div class="empty-state"><h3>No encontramos viajes con estos filtros</h3><p>Intenta con otra categoria o termino.</p></div>';
    return;
  }

  let html = "";
  for (let i = 0; i < filtrados.length; i++) {
    const v = filtrados[i];
    const msg = encodeURIComponent("¡Hola Veronica! Me interesa informacion sobre el viaje: \"" + v.titulo + "\" de Beta Azul Viajes Turisticos que vi en su catalogo web.");
    const waLink = "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + msg;

    html += '<article class="flyer-card">';
    html += '  <div class="flyer-img-wrap" onclick="abrirLightbox(\'' + v.id + '\')">';
    html += '    <img src="' + v.flyer + '" alt="Flyer ' + v.titulo + '" class="flyer-img" loading="lazy">';
    html += '    <span class="badge-category">' + (v.categoria || "Viaje") + '</span>';
    if (v.destacado) {
      html += '    <span class="badge-featured">★ Destacado</span>';
    }
    html += '    <div class="flyer-zoom-hint"><span>🔍 Ver Flyer Completo</span></div>';
    html += '  </div>';
    html += '  <div class="flyer-content">';
    html += '    <div>';
    html += '      <h3 class="flyer-title">' + v.titulo + '</h3>';
    html += '      <p class="flyer-location">📍 ' + (v.destino || "Destino Turistico") + '</p>';
    html += '    </div>';
    html += '    <div>';
    html += '      <div class="flyer-price-row">';
    html += '        <span class="price-label">Tarifa</span>';
    html += '        <span class="price-value">' + (v.precio || "Consultar tarifa") + '</span>';
    html += '      </div>';
    html += '      <div class="card-actions">';
    html += '        <button class="btn-details" onclick="abrirLightbox(\'' + v.id + '\')">🔍 Ver Flyer</button>';
    html += '        <a href="' + waLink + '" target="_blank" rel="noopener noreferrer" class="btn-whatsapp">💬 WhatsApp</a>';
    html += '      </div>';
    html += '    </div>';
    html += '  </div>';
    html += '</article>';
  }

  grid.innerHTML = html;
}

function abrirLightbox(viajeId) {
  let viaje = null;
  for (let i = 0; i < todosLosViajes.length; i++) {
    if (todosLosViajes[i].id === viajeId) {
      viaje = todosLosViajes[i];
      break;
    }
  }
  if (!viaje) return;

  const modal = document.getElementById("lightboxModal");
  const imgEl = document.getElementById("lightboxImg");
  const titleEl = document.getElementById("lightboxTitle");
  const catEl = document.getElementById("lightboxCategory");
  const priceEl = document.getElementById("lightboxPrice");
  const descEl = document.getElementById("lightboxDesc");
  const waBtn = document.getElementById("lightboxWaBtn");

  if (imgEl) imgEl.src = viaje.flyer;
  if (titleEl) titleEl.innerText = viaje.titulo;
  if (catEl) catEl.innerText = viaje.categoria;
  if (priceEl) priceEl.innerText = viaje.precio || "Consultar tarifa";
  if (descEl) descEl.innerText = viaje.descripcion || "Consulta detalles, fechas e itinerario directamente con Veronica en Beta Azul Viajes Turisticos.";

  if (waBtn) {
    const msg = encodeURIComponent("¡Hola Veronica! Me interesa informacion detallada del viaje: \"" + viaje.titulo + "\" de Beta Azul Viajes Turisticos que vi en su catalogo.");
    waBtn.href = "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + msg;
  }

  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function cerrarLightbox() {
  const modal = document.getElementById("lightboxModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

document.addEventListener("DOMContentLoaded", function() {
  cargarViajes();

  // Seleccionar SOLO botones que tengan data-category (ignorar el enlace <a> de Administrar)
  const filterBtns = document.querySelectorAll("button.filter-btn[data-category]");
  filterBtns.forEach(function(btn) {
    btn.addEventListener("click", function() {
      filterBtns.forEach(function(b) { b.classList.remove("active"); });
      btn.classList.add("active");
      categoriaActual = btn.getAttribute("data-category") || "Todos";
      renderizarViajes();
    });
  });

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", function(e) {
      busquedaActual = e.target.value;
      renderizarViajes();
    });
  }

  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") cerrarLightbox();
  });
});
