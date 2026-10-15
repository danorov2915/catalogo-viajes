// Configuracion Oficial de Beta Azul Viajes Turisticos
const CONFIG = {
  whatsappNumber: "522444470237",
  agencyName: "Beta Azul Viajes Turisticos",
  responsibleName: "Veronica Hernandez Echeverria"
};

let todosLosViajes = [];
let todaLaGaleria = [];
let galeriaFiltrada = [];
let indexFotoGaleriaActual = 0;
let categoriaActual = "Todos";
let busquedaActual = "";

// Datos de respaldo para la galería si el JSON local no tuviera aún la clave 'galeria'
const GALERIA_DEFAULT = [
  {
    id: "gal-01",
    titulo: "Excursión en Autobús Turístico",
    destino: "Zacatlán de las Manzanas",
    categoria: "Pueblos Magicos",
    foto: "images/viajeros/autobus-turistico.jpg",
    testimonio: "Excelente viaje en autobús de lujo, súper cómodo, seguro y con un ambiente familiar inmejorable.",
    autor: "Familia Sánchez"
  },
  {
    id: "gal-02",
    titulo: "Diversión y Sol en la Playa",
    destino: "Playa Acapulco / Costa",
    categoria: "Playa",
    foto: "images/viajeros/amigos-playa.jpg",
    testimonio: "El mejor fin de semana con amigos. Todo organizado a la perfección por Beta Azul.",
    autor: "Amigos de Viaje"
  },
  {
    id: "gal-03",
    titulo: "Cosecha en Huertos Tradicionales",
    destino: "Zacatlán de las Manzanas",
    categoria: "Familiar",
    foto: "images/viajeros/familia-manzanas.jpg",
    testimonio: "Nuestros hijos quedaron maravillados recolectando manzanas y conociendo la sierra.",
    autor: "Familia Morales"
  },
  {
    id: "gal-04",
    titulo: "Tirolesa en Bosque de Niebla",
    destino: "Zacatlán, Puebla",
    categoria: "Aventura",
    foto: "images/viajeros/aventura-tirolesa.jpg",
    testimonio: "Una descarga de adrenalina total a 2000 msnm con guías certificados y equipo seguro.",
    autor: "Carlos M."
  },
  {
    id: "gal-05",
    titulo: "Mirador de Cristal en la Sierra",
    destino: "Sierra Norte de Puebla",
    categoria: "Pueblos Magicos",
    foto: "images/viajeros/mirador-cristal.jpg",
    testimonio: "Vistas panorámicas increíbles entre la niebla. ¡Una experiencia que jamás olvidaremos!",
    autor: "Mariana y Amigas"
  },
  {
    id: "gal-06",
    titulo: "Aventura Salvaje en Africam Safari",
    destino: "Puebla",
    categoria: "Familiar",
    foto: "images/viajeros/africam-safari.jpg",
    testimonio: "Increíble recorrido viendo animales de cerca y conviviendo en pareja con un clima excelente.",
    autor: "Andrea y Roberto"
  },
  {
    id: "gal-07",
    titulo: "Senderismo y Cascadas Naturales",
    destino: "Cuetzalan / Sierra de Puebla",
    categoria: "Aventura",
    foto: "images/viajeros/cascada-aventura.jpg",
    testimonio: "Agua cristalina, naturaleza pura y la atención de Verónica siempre al pendiente de nuestra seguridad.",
    autor: "Viajeros Aventureros"
  },
  {
    id: "gal-08",
    titulo: "Paseo Nocturno en Calles Coloniales",
    destino: "Val'Quirico / Puebla",
    categoria: "Coloniales",
    foto: "images/viajeros/noche-colonial.jpg",
    testimonio: "Noche mágica con luces, arquitectura colonial y una cena espectacular.",
    autor: "Pareja Viajera"
  },
  {
    id: "gal-09",
    titulo: "Mural Vitromosaico Monumental",
    destino: "Zacatlán de las Manzanas",
    categoria: "Pueblos Magicos",
    foto: "images/viajeros/mural-zacatlan.jpg",
    testimonio: "Arte, tradición y colores hermosos. Una parada obligatoria en este gran Pueblo Mágico.",
    autor: "Viajeros Beta Azul"
  },
  {
    id: "gal-10",
    titulo: "Ruta 4x4 Cuatrimotos Nocturna",
    destino: "Chipilo / Atlixco",
    categoria: "Aventura",
    foto: "images/viajeros/cuatrimoto-nocturna.png",
    testimonio: "Aventura nocturna en cuatrimoto con luces led y casco de protección. ¡Adrenalina pura garantizada!",
    autor: "Clientes Felices"
  }
];

async function cargarViajes() {
  const countEl = document.getElementById("resultsCount");
  if (countEl) countEl.innerText = "Cargando catalogo...";

  try {
    const res = await fetch("viajes.json?v=" + Date.now());
    if (!res.ok) throw new Error("No cargo viajes.json local");
    const data = await res.json();
    todosLosViajes = data.viajes || [];
    todaLaGaleria = (data.galeria && data.galeria.length > 0) ? data.galeria : GALERIA_DEFAULT;
    renderizarViajes();
  } catch (err) {
    console.warn("Fallo local, usando respaldo remoto:", err);
    try {
      const resRaw = await fetch("https://raw.githubusercontent.com/danorov2915/catalogo-viajes/main/viajes.json");
      if (!resRaw.ok) throw new Error("Fallback remoto no respondio");
      const dataRaw = await resRaw.json();
      todosLosViajes = dataRaw.viajes || [];
      todaLaGaleria = (dataRaw.galeria && dataRaw.galeria.length > 0) ? dataRaw.galeria : GALERIA_DEFAULT;
      renderizarViajes();
    } catch (err2) {
      console.error("Error definitivo al cargar:", err2);
      const grid = document.getElementById("flyersGrid");
      if (grid) {
        grid.innerHTML = '<div class="empty-state"><h3>Hubo un problema al cargar los flyers</h3><p>Intenta recargar la pagina.</p></div>';
      }
      if (countEl) countEl.innerText = "Error al cargar";
      todaLaGaleria = GALERIA_DEFAULT;
    }
  }
}

// Estado de Favoritos persistente en LocalStorage
let favoritos = [];
try {
  favoritos = JSON.parse(localStorage.getItem('betaazul_favoritos') || '[]');
} catch(e) {
  favoritos = [];
}

function esViajePetFriendly(v) {
  if (!v) return false;
  const texto = [
    v.categoria,
    v.titulo,
    v.tipoServicio,
    v.descripcion,
    v.incluye,
    v.lugaresVisita
  ].join(" ").toLowerCase();
  return texto.includes("pet") || texto.includes("mascota") || texto.includes("peludo") || texto.includes("kraken") || texto.includes("kaizer");
}

function esFechaAbierta(v) {
  if (!v) return false;
  const texto = [
    v.tipoServicio,
    v.titulo,
    v.descripcion
  ].join(" ").toLowerCase();
  return texto.includes("privado") || texto.includes("abierta") || texto.includes("personaliz") || texto.includes("a tu medida");
}

function formatearPrecio(precio) {
  if (!precio) return "Consultar tarifa";
  const p = precio.trim();
  if (p.toLowerCase().includes("consultar")) return "Consultar tarifa";
  if (p.toLowerCase().startsWith("desde")) return p;
  return "Desde " + p;
}

function toggleFavorito(viajeId, e) {
  if (e) e.stopPropagation();
  const idx = favoritos.indexOf(viajeId);
  if (idx > -1) {
    favoritos.splice(idx, 1);
  } else {
    favoritos.push(viajeId);
  }
  try {
    localStorage.setItem('betaazul_favoritos', JSON.stringify(favoritos));
  } catch(e) {}
  actualizarContadorFavoritos();
  renderizarViajes();
}

function actualizarContadorFavoritos() {
  const el = document.getElementById('favCount');
  if (el) el.innerText = favoritos.length;
}

function cotizarFavoritosPorWhatsApp() {
  if (favoritos.length === 0) return;
  const seleccionados = todosLosViajes.filter(v => favoritos.includes(v.id));
  if (seleccionados.length === 0) return;

  let msg = `¡Hola Verónica! Guardé estos ${seleccionados.length} viajes en su catálogo web de Beta Azul y me gustaría cotizarlos:\n\n`;
  seleccionados.forEach((v, i) => {
    msg += `${i + 1}. *${v.titulo}* (${formatearPrecio(v.precio)})\n`;
  });
  msg += `\n¿Me podrías brindar más detalles de fechas y disponibilidad?`;

  const waUrl = "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(msg);
  window.open(waUrl, '_blank');
}

function compartirViaje(viajeId, e) {
  if (e) e.stopPropagation();
  let v = null;
  for (let i = 0; i < todosLosViajes.length; i++) {
    if (todosLosViajes[i].id === viajeId) {
      v = todosLosViajes[i];
      break;
    }
  }
  if (!v) return;

  const precioStr = formatearPrecio(v.precio);
  const texto = `¡Hola! Mira este viaje que encontré en Beta Azul Viajes Turísticos:\n\n🌟 *${v.titulo}*\n📍 *Destino:* ${v.lugaresVisita || v.destino || 'Destino Turístico'}\n💰 *Tarifa:* ${precioStr}\n\n¿Vamos juntos? Puedes ver más detalles en su catálogo oficial.`;

  if (navigator.share) {
    navigator.share({
      title: v.titulo,
      text: texto,
      url: window.location.href.split('#')[0]
    }).catch(() => {});
  } else {
    const waUrl = "https://wa.me/?text=" + encodeURIComponent(texto);
    window.open(waUrl, '_blank');
  }
}

let viajeActualId = null;
function compartirViajeActual() {
  if (viajeActualId) {
    compartirViaje(viajeActualId);
  }
}

function obtenerViajesFiltrados() {
  return todosLosViajes.filter(function(viaje) {
    if (!viaje.activo) return false;

    // Filtro seguro por categoria
    let cumpleCat = false;
    if (!categoriaActual || categoriaActual === "Todos") {
      cumpleCat = true;
    } else if (categoriaActual === "Favoritos") {
      cumpleCat = favoritos.includes(viaje.id);
    } else if (categoriaActual === "Pet Friendly") {
      cumpleCat = esViajePetFriendly(viaje);
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

function fallbackFlyer(img) {
  if (!img) return;
  const original = img.getAttribute("src") || "";
  const filename = original.split("/").pop().split("?")[0];
  if (!filename) return;

  if (!img.dataset.retryLevel) {
    img.dataset.retryLevel = "1";
    img.src = "_Flyers/" + filename;
  } else if (img.dataset.retryLevel === "1") {
    img.dataset.retryLevel = "2";
    img.src = "images/flyers/" + filename;
  } else if (img.dataset.retryLevel === "2") {
    img.dataset.retryLevel = "3";
    img.src = filename;
  } else {
    img.onerror = null;
    img.src = "logo.jpg";
  }
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
    if (categoriaActual === "Favoritos") {
      grid.innerHTML = '<div class="empty-state"><h3>❤️ Aún no tienes viajes guardados</h3><p>Toca el corazón en cualquier flyer para armar tu lista de favoritos y cotizarlos todos juntos por WhatsApp.</p></div>';
    } else {
      grid.innerHTML = '<div class="empty-state"><h3>No encontramos viajes con estos filtros</h3><p>Intenta con otra categoria o termino.</p></div>';
    }
    return;
  }

  let html = "";

  // Si estamos en Favoritos, mostrar barra para cotizar todos juntos
  if (categoriaActual === "Favoritos") {
    html += '<div class="fav-action-bar">';
    html += '  <div>';
    html += '    <div class="fav-action-title">❤️ Tu Lista de Favoritos (' + filtrados.length + (filtrados.length === 1 ? ' viaje' : ' viajes') + ')</div>';
    html += '    <div class="fav-action-desc">Puedes cotizar todos tus viajes seleccionados en un solo mensaje directo con Verónica.</div>';
    html += '  </div>';
    html += '  <button type="button" class="btn-whatsapp" onclick="cotizarFavoritosPorWhatsApp()" style="padding: 0.75rem 1.3rem; border-radius: var(--radius-full);">💬 Cotizar mis favoritos por WhatsApp</button>';
    html += '</div>';
  }

  for (let i = 0; i < filtrados.length; i++) {
    const v = filtrados[i];
    const msg = encodeURIComponent("¡Hola Veronica! Me interesa informacion sobre el viaje: \"" + v.titulo + "\" de Beta Azul Viajes Turisticos que vi en su catalogo web.");
    const waLink = "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + msg;

    const esPet = esViajePetFriendly(v);
    const abierta = esFechaAbierta(v);
    const esFav = favoritos.includes(v.id);
    const precioTxt = formatearPrecio(v.precio);

    html += '<article class="flyer-card">';
    html += '  <div class="flyer-img-wrap" onclick="abrirLightbox(\'' + v.id + '\')">';
    html += '    <img src="' + v.flyer + '" alt="Flyer ' + v.titulo + '" class="flyer-img" loading="lazy" onerror="fallbackFlyer(this)">';
    html += '    <span class="badge-category">' + (v.categoria || "Viaje") + '</span>';
    html += '    <button type="button" class="btn-fav-card ' + (esFav ? 'active' : '') + '" onclick="toggleFavorito(\'' + v.id + '\', event)" title="' + (esFav ? 'Quitar de Favoritos' : 'Guardar en Favoritos') + '">' + (esFav ? '❤️' : '🤍') + '</button>';
    if (v.destacado) {
      html += '    <span class="badge-featured" style="right: 3.3rem;">★ Destacado</span>';
    }
    html += '    <div class="flyer-zoom-hint"><span>🔍 Ver Flyer Completo</span></div>';
    html += '  </div>';
    html += '  <div class="flyer-content">';
    html += '    <div>';
    html += '      <h3 class="flyer-title">' + v.titulo + '</h3>';
    
    if (esPet) {
      html += '      <span class="pill-pet">🐾 Con Mascota / Pet Friendly</span>';
    }

    // Si tiene ruta o lugares que visita, mostrarlo destacado
    if (v.lugaresVisita) {
      html += '      <p class="flyer-location" style="color: #38bdf8; font-weight: 600;">📍 Visita: ' + v.lugaresVisita + '</p>';
    } else {
      html += '      <p class="flyer-location">📍 ' + (v.destino || "Destino Turistico") + '</p>';
    }

    // Si tiene tipo o modalidad (ej. Tour de 1 día, Pet Friendly)
    if (v.tipoServicio) {
      html += '      <p style="font-size: 0.78rem; color: #a7f3d0; margin-top: 0.2rem;">⏱️ ' + v.tipoServicio + '</p>';
    } else if (abierta) {
      html += '      <p style="font-size: 0.78rem; color: #38bdf8; margin-top: 0.2rem;">🟢 Tour Privado / Fechas Abiertas</p>';
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
    html += '        <span class="price-value">' + precioTxt + '</span>';
    html += '      </div>';
    html += '      <div class="card-actions">';
    html += '        <button class="btn-details" onclick="abrirLightbox(\'' + v.id + '\')">🔍 Ver Flyer</button>';
    html += '        <a href="' + waLink + '" target="_blank" rel="noopener noreferrer" class="btn-whatsapp">💬 WhatsApp</a>';
    html += '        <button type="button" class="btn-share" onclick="compartirViaje(\'' + v.id + '\', event)" title="Compartir este viaje con amigos o familia">📤</button>';
    html += '      </div>';
    html += '    </div>';
    html += '  </div>';
    html += '</article>';
  }

  grid.innerHTML = html;
}

function abrirLightbox(viajeId) {
  viajeActualId = viajeId;
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

  if (imgEl) {
    imgEl.dataset.retryLevel = "";
    imgEl.onerror = function() { fallbackFlyer(this); };
    imgEl.src = viaje.flyer;
  }
  if (titleEl) titleEl.innerText = viaje.titulo;
  if (catEl) catEl.innerText = viaje.categoria;
  if (priceEl) priceEl.innerText = formatearPrecio(viaje.precio);
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

function abrirModalCertificados(tab) {
  const modal = document.getElementById("certificadosModal");
  if (!modal) return;
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
  if (tab) {
    cambiarTabCertificado(tab);
  }
}

function cerrarModalCertificados() {
  const modal = document.getElementById("certificadosModal");
  if (!modal) return;
  modal.classList.remove("active");
  document.body.style.overflow = "";
}

function cambiarTabCertificado(tabId) {
  const btnRnt = document.getElementById("tabBtnRnt");
  const btnSectur = document.getElementById("tabBtnSectur");
  const panelRnt = document.getElementById("tabPanelRnt");
  const panelSectur = document.getElementById("tabPanelSectur");

  if (tabId === "rnt") {
    if (btnRnt) btnRnt.classList.add("active");
    if (btnSectur) btnSectur.classList.remove("active");
    if (panelRnt) panelRnt.style.display = "block";
    if (panelSectur) panelSectur.style.display = "none";
  } else {
    if (btnSectur) btnSectur.classList.add("active");
    if (btnRnt) btnRnt.classList.remove("active");
    if (panelRnt) panelRnt.style.display = "none";
    if (panelSectur) panelSectur.style.display = "block";
  }
}

/* =========================================================
   CONTROLADOR DE LA GALERÍA DE VIAJEROS & TESTIMONIOS
   ========================================================= */

function abrirModalGaleria() {
  const modal = document.getElementById("galeriaModal");
  if (!modal) return;
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
  
  // Resetear filtro a 'Todos'
  const tabs = document.querySelectorAll(".galeria-tab");
  tabs.forEach(function(t, idx) {
    if (idx === 0) t.classList.add("active");
    else t.classList.remove("active");
  });
  
  filtrarGaleria('Todos');
}

function cerrarModalGaleria() {
  const modal = document.getElementById("galeriaModal");
  if (!modal) return;
  modal.classList.remove("active");
  document.body.style.overflow = "";
}

function filtrarGaleria(categoria, btnEl) {
  if (btnEl) {
    const tabs = document.querySelectorAll(".galeria-tab");
    tabs.forEach(function(t) { t.classList.remove("active"); });
    btnEl.classList.add("active");
  }

  if (!categoria || categoria === "Todos") {
    galeriaFiltrada = [...todaLaGaleria];
  } else {
    galeriaFiltrada = todaLaGaleria.filter(function(item) {
      if (!item) return false;
      const cat = (item.categoria || "").toLowerCase();
      const tit = (item.titulo || "").toLowerCase();
      const dest = (item.destino || "").toLowerCase();
      const q = categoria.toLowerCase();
      return cat.includes(q) || tit.includes(q) || dest.includes(q);
    });
  }

  renderizarGaleriaGrid();
}

function renderizarGaleriaGrid() {
  const grid = document.getElementById("galeriaGrid");
  if (!grid) return;

  if (galeriaFiltrada.length === 0) {
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #94a3b8;"><p style="font-size: 1.1rem;">No se encontraron fotos en esta categoría.</p></div>';
    return;
  }

  grid.innerHTML = "";

  galeriaFiltrada.forEach(function(item, idx) {
    const card = document.createElement("div");
    card.className = "galeria-card";
    card.onclick = function() { abrirFotoGaleria(idx); };

    // Contenedor de Imagen
    const imgWrap = document.createElement("div");
    imgWrap.className = "galeria-card-img-wrap";

    const img = document.createElement("img");
    img.className = "galeria-card-img";
    img.alt = item.titulo || "Foto de viajero Beta Azul";
    img.loading = "lazy";
    
    // Normalizar ruta y fallbacks
    let fotoSrc = item.foto || "logo.jpg";
    img.onerror = function() {
      const filename = (item.foto || "").split("/").pop().split("?")[0];
      if (!this.dataset.triedViajerosRoot) {
        this.dataset.triedViajerosRoot = "true";
        this.src = "viajeros/" + filename;
      } else if (!this.dataset.triedSubfolder) {
        this.dataset.triedSubfolder = "true";
        this.src = "images/" + filename;
      } else if (!this.dataset.triedImagesViajeros) {
        this.dataset.triedImagesViajeros = "true";
        this.src = "images/viajeros/" + filename;
      } else if (!this.dataset.triedRoot) {
        this.dataset.triedRoot = "true";
        this.src = filename;
      } else {
        this.onerror = null;
        this.src = "logo.jpg";
      }
    };
    img.src = fotoSrc;

    const badge = document.createElement("span");
    badge.className = "galeria-card-badge";
    badge.textContent = item.categoria || "Experiencia";

    imgWrap.appendChild(img);
    imgWrap.appendChild(badge);

    // Cuerpo de la tarjeta
    const body = document.createElement("div");
    body.className = "galeria-card-body";

    const title = document.createElement("h4");
    title.className = "galeria-card-title";
    title.textContent = item.titulo || "Experiencia Grupal";

    const dest = document.createElement("div");
    dest.className = "galeria-card-dest";
    dest.textContent = "📍 " + (item.destino || "Destino Turístico");

    const stars = document.createElement("div");
    stars.className = "galeria-card-stars";
    stars.textContent = "⭐⭐⭐⭐⭐";

    const quote = document.createElement("blockquote");
    quote.className = "galeria-card-quote";
    quote.textContent = '“' + (item.testimonio || "Un viaje extraordinario con el equipo de Beta Azul.") + '”';

    const author = document.createElement("div");
    author.className = "galeria-card-author";
    author.textContent = "— " + (item.autor || "Viajeros Beta Azul");

    body.appendChild(title);
    body.appendChild(dest);
    body.appendChild(stars);
    body.appendChild(quote);
    body.appendChild(author);

    card.appendChild(imgWrap);
    card.appendChild(body);
    grid.appendChild(card);
  });
}

function abrirFotoGaleria(idx) {
  if (idx < 0 || idx >= galeriaFiltrada.length) return;
  indexFotoGaleriaActual = idx;
  const item = galeriaFiltrada[idx];

  const modal = document.getElementById("galeriaLightboxModal");
  const img = document.getElementById("galeriaLightboxImg");
  const badge = document.getElementById("galeriaLightboxBadge");
  const title = document.getElementById("galeriaLightboxTitle");
  const dest = document.getElementById("galeriaLightboxDest");
  const quote = document.getElementById("galeriaLightboxQuote");
  const author = document.getElementById("galeriaLightboxAuthor");

  if (!modal || !item) return;

  if (img) {
    img.onerror = function() {
      const filename = (item.foto || "").split("/").pop().split("?")[0];
      if (!this.dataset.triedViajerosRoot) {
        this.dataset.triedViajerosRoot = "true";
        this.src = "viajeros/" + filename;
      } else if (!this.dataset.triedSubfolder) {
        this.dataset.triedSubfolder = "true";
        this.src = "images/" + filename;
      } else if (!this.dataset.triedImagesViajeros) {
        this.dataset.triedImagesViajeros = "true";
        this.src = "images/viajeros/" + filename;
      } else if (!this.dataset.triedRoot) {
        this.dataset.triedRoot = "true";
        this.src = filename;
      } else {
        this.onerror = null;
        this.src = "logo.jpg";
      }
    };
    img.src = item.foto || "logo.jpg";
  }

  if (badge) badge.textContent = item.categoria || "Experiencia";
  if (title) title.textContent = item.titulo || "Experiencia con Beta Azul";
  if (dest) dest.textContent = "📍 " + (item.destino || "Destino Turístico");
  if (quote) quote.textContent = '“' + (item.testimonio || "Experiencia inolvidable con Beta Azul.") + '”';
  if (author) author.textContent = "— " + (item.autor || "Viajeros Beta Azul");

  modal.classList.add("active");
}

function cerrarFotoGaleria() {
  const modal = document.getElementById("galeriaLightboxModal");
  if (modal) modal.classList.remove("active");
}

function cambiarFotoGaleria(step) {
  if (galeriaFiltrada.length <= 1) return;
  indexFotoGaleriaActual = (indexFotoGaleriaActual + step + galeriaFiltrada.length) % galeriaFiltrada.length;
  abrirFotoGaleria(indexFotoGaleriaActual);
}

document.addEventListener("DOMContentLoaded", function() {
  cargarViajes();
  actualizarContadorFavoritos();

  // Seleccionar SOLO botones que tengan data-category (ignorar el enlace <a> de Administrar y botón de Galería)
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
    const galLightbox = document.getElementById("galeriaLightboxModal");
    const esGalLightboxActivo = galLightbox && galLightbox.classList.contains("active");

    if (e.key === "Escape") {
      if (esGalLightboxActivo) {
        cerrarFotoGaleria();
      } else {
        cerrarLightbox();
        cerrarModalGaleria();
        cerrarModalCertificados();
      }
    } else if (e.key === "ArrowLeft" && esGalLightboxActivo) {
      cambiarFotoGaleria(-1);
    } else if (e.key === "ArrowRight" && esGalLightboxActivo) {
      cambiarFotoGaleria(1);
    }
  });
});
