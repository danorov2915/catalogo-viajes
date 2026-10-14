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
    
    // Si tiene ruta o lugares que visita, mostrarlo destacado
    if (v.lugaresVisita) {
      html += '      <p class="flyer-location" style="color: #38bdf8; font-weight: 600;">📍 Visita: ' + v.lugaresVisita + '</p>';
    } else {
      html += '      <p class="flyer-location">📍 ' + (v.destino || "Destino Turistico") + '</p>';
    }

    // Si tiene tipo o modalidad (ej. Tour de 1 día, Pet Friendly)
    if (v.tipoServicio) {
      html += '      <p style="font-size: 0.78rem; color: #a7f3d0; margin-top: 0.2rem;">⏱️ ' + v.tipoServicio + '</p>';
    }

    // Mini resumen de inclusiones si existen
    if (v.incluye) {
      let miniInc = v.incluye.length > 80 ? (v.incluye.substring(0, 80) + '...') : v.incluye;
      html += '      <p style="font-size: 0.76rem; color: #94a3b8; margin-top: 0.25rem;">✅ ' + miniInc + '</p>';
    }

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
  if (descEl) descEl.innerText = viaje.descripcion || "";

  // Ficha técnica estructurada
  const lbTipo = document.getElementById("lbTipo");
  const lbTipoWrap = document.getElementById("lbTipoWrap");
  if (lbTipo && lbTipoWrap) {
    if (viaje.tipoServicio) {
      lbTipo.innerText = viaje.tipoServicio;
      lbTipoWrap.style.display = "block";
    } else {
      lbTipoWrap.style.display = "none";
    }
  }

  const lbRuta = document.getElementById("lbRuta");
  const lbRutaWrap = document.getElementById("lbRutaWrap");
  if (lbRuta && lbRutaWrap) {
    if (viaje.lugaresVisita) {
      lbRuta.innerText = viaje.lugaresVisita;
      lbRutaWrap.style.display = "block";
    } else {
      lbRutaWrap.style.display = "none";
    }
  }

  const lbIncluye = document.getElementById("lbIncluye");
  const lbIncluyeWrap = document.getElementById("lbIncluyeWrap");
  if (lbIncluye && lbIncluyeWrap) {
    if (viaje.incluye) {
      lbIncluye.innerText = viaje.incluye;
      lbIncluyeWrap.style.display = "block";
    } else {
      lbIncluyeWrap.style.display = "none";
    }
  }

  const lbNoIncluye = document.getElementById("lbNoIncluye");
  const lbNoIncluyeWrap = document.getElementById("lbNoIncluyeWrap");
  if (lbNoIncluye && lbNoIncluyeWrap) {
    if (viaje.noIncluye) {
      lbNoIncluye.innerText = viaje.noIncluye;
      lbNoIncluyeWrap.style.display = "block";
    } else {
      lbNoIncluyeWrap.style.display = "none";
    }
  }

  // Ocultar la caja de ficha si no hay ningún campo especial
  const fichaBox = document.getElementById("lightboxFicha");
  if (fichaBox) {
    const hayDatos = viaje.tipoServicio || viaje.lugaresVisita || viaje.incluye || viaje.noIncluye;
    fichaBox.style.display = hayDatos ? "block" : "none";
  }

  if (waBtn) {
    let msgTxt = "¡Hola Verónica! Me interesa información sobre el viaje: \"" + viaje.titulo + "\"";
    if (viaje.lugaresVisita) {
      msgTxt += " (visitando " + viaje.lugaresVisita + ")";
    }
    msgTxt += " que vi en el catálogo de Beta Azul Viajes Turísticos.";
    const msg = encodeURIComponent(msgTxt);
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
