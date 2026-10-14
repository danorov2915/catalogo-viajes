// Configuración Oficial de Beta Azul Viajes Turísticos
const CONFIG = {
  // WhatsApp directo de Verónica Hernández Echeverría
  whatsappNumber: "522444470237",
  agencyName: "Beta Azul Viajes Turísticos",
  responsibleName: "Verónica Hernández Echeverría",
  currencySymbol: "MXN"
};

// Estado global
let todosLosViajes = [];
let categoriaActual = "Todos";
let busquedaActual = "";

// Cargar viajes desde viajes.json
async function cargarViajes() {
  try {
    const res = await fetch('viajes.json');
    if (!res.ok) throw new Error("No se pudo cargar viajes.json");
    const data = await res.json();
    todosLosViajes = data.viajes || [];
    renderizarViajes();
  } catch (err) {
    console.error("Error al cargar viajes:", err);
    document.getElementById('flyersGrid').innerHTML = `
      <div class="empty-state">
        <h3>Hubo un problema al cargar los flyers</h3>
        <p>Asegúrate de que viajes.json existe o sube tu primer viaje desde el panel.</p>
      </div>
    `;
  }
}

// Filtrar viajes
function obtenerViajesFiltrados() {
  return todosLosViajes.filter(viaje => {
    if (!viaje.activo) return false;

    // Filtro por categoría
    const cumpleCategoria = categoriaActual === "Todos" || 
      viaje.categoria.toLowerCase() === categoriaActual.toLowerCase();

    // Filtro por búsqueda de texto
    const termino = busquedaActual.toLowerCase().trim();
    const cumpleBusqueda = !termino || 
      (viaje.titulo && viaje.titulo.toLowerCase().includes(termino)) ||
      (viaje.destino && viaje.destino.toLowerCase().includes(termino)) ||
      (viaje.categoria && viaje.categoria.toLowerCase().includes(termino));

    return cumpleCategoria && cumpleBusqueda;
  });
}

// Renderizar tarjetas de flyers
function renderizarViajes() {
  const grid = document.getElementById('flyersGrid');
  const countEl = document.getElementById('resultsCount');
  const filtrados = obtenerViajesFiltrados();

  countEl.innerText = `Mostrando ${filtrados.length} ${filtrados.length === 1 ? 'viaje' : 'viajes'}`;

  if (filtrados.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3>No encontramos viajes con estos filtros</h3>
        <p>Intenta seleccionar otra categoría o cambiar tu búsqueda.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtrados.map(viaje => {
    // Mensaje directo y personalizado para WhatsApp
    const msg = encodeURIComponent(`¡Hola Verónica! Me interesa información sobre el viaje: "${viaje.titulo}" de Beta Azul Viajes Turísticos que vi en su catálogo web.`);
    const waLink = `https://wa.me/${CONFIG.whatsappNumber}?text=${msg}`;

    return `
      <article class="flyer-card">
        <div class="flyer-img-wrap" onclick="abrirLightbox('${viaje.id}')">
          <img src="${viaje.flyer}" alt="Flyer ${viaje.titulo}" class="flyer-img" loading="lazy">
          <span class="badge-category">${viaje.categoria}</span>
          ${viaje.destacado ? '<span class="badge-featured">★ Destacado</span>' : ''}
          <div class="flyer-zoom-hint">
            <span>🔍 Ver Flyer Completo</span>
          </div>
        </div>

        <div class="flyer-content">
          <div>
            <h3 class="flyer-title">${viaje.titulo}</h3>
            <p class="flyer-location">📍 ${viaje.destino || 'Destino Turístico'}</p>
          </div>

          <div>
            <div class="flyer-price-row">
              <span class="price-label">Tarifa</span>
              <span class="price-value">${viaje.precio}</span>
            </div>

            <div class="card-actions">
              <button class="btn-details" onclick="abrirLightbox('${viaje.id}')">
                🔍 Ver Flyer
              </button>
              <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp">
                💬 WhatsApp
              </a>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// Abrir Modal Lightbox con Zoom
function abrirLightbox(viajeId) {
  const viaje = todosLosViajes.find(v => v.id === viajeId);
  if (!viaje) return;

  const modal = document.getElementById('lightboxModal');
  const imgEl = document.getElementById('lightboxImg');
  const titleEl = document.getElementById('lightboxTitle');
  const catEl = document.getElementById('lightboxCategory');
  const priceEl = document.getElementById('lightboxPrice');
  const descEl = document.getElementById('lightboxDesc');
  const waBtn = document.getElementById('lightboxWaBtn');

  imgEl.src = viaje.flyer;
  titleEl.innerText = viaje.titulo;
  catEl.innerText = viaje.categoria;
  priceEl.innerText = viaje.precio;
  descEl.innerText = viaje.descripcion || "Consulta detalles, fechas e inclusiones completas directamente con Verónica en Beta Azul Viajes Turísticos.";

  const msg = encodeURIComponent(`¡Hola Verónica! Me interesa información detallada del viaje: "${viaje.titulo}" de Beta Azul Viajes Turísticos que vi en su catálogo.`);
  waBtn.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${msg}`;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Cerrar Modal Lightbox
function cerrarLightbox() {
  const modal = document.getElementById('lightboxModal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  cargarViajes();

  // Filtros de categoría
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      categoriaActual = btn.getAttribute('data-category');
      renderizarViajes();
    });
  });

  // Buscador en tiempo real
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      busquedaActual = e.target.value;
      renderizarViajes();
    });
  }

  // Cerrar lightbox con tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarLightbox();
  });
});
