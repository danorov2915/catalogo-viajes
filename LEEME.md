# Catálogo de Viajes de Verónica Hernández Echeverría

Este proyecto está 100% optimizado para montarse gratis en **Netlify** con **Decap CMS**.

- **Responsable:** Verónica Hernández Echeverría
- **WhatsApp Oficial:** [+52 244 447 0237](https://wa.me/522444470237)
- **Categorías configuradas:** Playa, Aventura, Senderismo, Arqueología, Coloniales, Pueblos Mágicos, Mixtos.

---

## 📂 Archivos en esta carpeta
- `index.html`: Catálogo interactivo para los clientes.
- `styles.css`: Diseño moderno, adaptable a celulares y computadoras.
- `app.js`: Conexión de búsqueda, filtros y botón directo al WhatsApp de Verónica.
- `viajes.json`: Lista de viajes y flyers actuales.
- `admin/index.html`: Panel para que Verónica y tú inicien sesión.
- `admin/config.yml`: Campos para subir flyers fácilmente.
- `images/flyers/`: Almacén de las fotos de los flyers.

---

## 🚀 Pasos para desplegar en Netlify

1. **Subir a GitHub:**
   - Crea un repositorio en tu GitHub (ej: `catalogo-viajes-vero`).
   - Sube todos los archivos de esta carpeta.

2. **Crear sitio en Netlify:**
   - Ve a [netlify.com](https://app.netlify.com).
   - Elige **"Add new site"** > **"Import an existing project"** > **GitHub**.
   - Selecciona el repositorio y dale a **Deploy**.

3. **Activar Identity y Git Gateway (Para que puedan entrar a `/admin`):**
   - En Netlify, entra en **Site configuration** > **Identity** > clic en **Enable Identity**.
   - En **Registration preferences**, pon **Invite only**.
   - En la sección **Services** > **Git Gateway**, dale a **Enable Git Gateway**.

4. **Invitar a Verónica y a ti:**
   - En la pestaña **Identity**, haz clic en **Invite users**.
   - Agrega el correo de Verónica y el tuyo.
   - Les llegará un correo con una liga para elegir su contraseña.

5. **¡Listo!**
   - Los clientes ven la web en: `https://tunegocio.netlify.app`
   - Verónica y tú suben y cambian flyers en: `https://tunegocio.netlify.app/admin/`
