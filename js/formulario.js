// =========================================================================
// 1. CONTROL DE REGIONES (Cobertura)
// =========================================================================
const todas = document.getElementById("todas-regiones");
const regiones = document.querySelectorAll(".region");

if (todas) {
    todas.addEventListener("change", () => {
        if (todas.checked) { regiones.forEach(r => r.checked = true); } 
        else { regiones.forEach(r => r.checked = false); }
    });
}

regiones.forEach(r => {
    r.addEventListener("change", () => {
        const todasMarcadas = Array.from(regiones).every(r => r.checked);
        if (todas) { todas.checked = todasMarcadas; }
    });
});

function obtenerRegionesSeleccionadas() {
    const seleccionadas = [];
    if (todas && todas.checked) {
        regiones.forEach(r => { seleccionadas.push(r.value); });
        return seleccionadas; 
    }
    regiones.forEach(r => { if (r.checked) { seleccionadas.push(r.value); } });
    return seleccionadas;
}

// =========================================================================
// 2. ENVÍO DEL FORMULARIO A GOOGLE SHEETS
// =========================================================================
const URL_SHEETS = "https://script.google.com/macros/s/AKfycbxcLLZF3G_SMuKiqhsvyPkAnhAm7rxbCQmG_h8qRufr0A6H1p6U4fqfL0UqTwzFIBtF/exec";
const form = document.getElementById("clienteForm");

// Función de asistencia para campos normales (valida existencia y visibilidad)
function obtenerValor(id) {
    const el = document.getElementById(id);
    if (!el || el.offsetParent === null) {
        return "";
    }
    return el.value.trim();
}

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        // Validar correos
        const correo = obtenerValor("correo");
        const correo2 = obtenerValor("correo2");
        if (correo && correo2 && correo !== correo2) {
            alert("Los correos no coinciden.");
            return;
        }
        
        // Validar regiones
        const regionesSeleccionadas = obtenerRegionesSeleccionadas();
        if (regionesSeleccionadas.length === 0) {
            alert("Debes seleccionar al menos una región de cobertura.");
            return;
        }

        // =====================================================================
        // PROCESAMIENTO DEL TEXTAREA (Productos/Servicios)
        // =====================================================================
        const txtProductos = obtenerValor("productos-servicios");
        
        // Convertimos el texto en un array por línea, limpiando espacios y líneas vacías
        let listaProductos = txtProductos
            .split("\n")
            .map(linea => linea.trim())
            .filter(linea => linea !== "");

        // Validaciones requeridas
        if (listaProductos.length === 0) {
            alert("Por favor, ingresa al menos un producto o servicio para monitorear.");
            return;
        }
        if (listaProductos.length > 3) {
            alert("La prueba gratuita solo permite monitorear un máximo de 3 productos o servicios.");
            return;
        }

        // Formato seguro para el scraper de Python. Ejemplo: "item 1 | item 2 | item 3"
        const productosFormateados = listaProductos.join(" | ");

        // =====================================================================
        // CONSTRUCCIÓN DE LA FICHA CLEAN
        // =====================================================================
        const ficha = {
            RUT: obtenerValor("rut_empresa"),
            EMPRESA: obtenerValor("empresa"),
            CONTACTO: obtenerValor("contacto"),
            CORREO: correo,
            WHATSAPP: obtenerValor("whatsapp"),
            REGION: obtenerValor("region"), 
            EXPERIENCIA: obtenerValor("experiencia"),
            INSCRITO: obtenerValor("inscrito"),
            COBERTURA: regionesSeleccionadas, // Array que procesa Apps Script
            PRODUCTOS_SERVICIOS: productosFormateados, // Cadena limpia con separador "|"
            PLAN: "GRATUITO",
            ESTADO: "activo",
            
            // FILTRO SPAM (HONEYPOT): Se lee directo del DOM saltándose el filtro de visibilidad.
            // Si tiene texto, un bot cayó en la trampa.
            SEGUNDO_APELLIDO: document.getElementById("segundo_apellido") ? document.getElementById("segundo_apellido").value.trim() : ""
        };
        
        console.log("Enviando datos filtrados:", ficha);
        
        try {
            const respuesta = await fetch(URL_SHEETS, { method: "POST", body: JSON.stringify(ficha) });
            const data = await respuesta.json();
            console.log(data);
            window.location.href = "gracias.html";
        }
        catch (error) {
            console.error(error);
            alert("No fue posible guardar la información.");
        }
    });
}
