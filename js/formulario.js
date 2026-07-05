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
    // EXCEPCIÓN: Si "Todas las regiones" está marcado, devolvemos un array vacío.
    // Esto hará que en Google Sheets la celda quede completamente vacía.
    if (todas && todas.checked) {
        return [];
    }
    
    const seleccionadas = [];
    regiones.forEach(r => { if (r.checked) { seleccionadas.push(r.value); } });
    return seleccionadas;
}

// =========================================================================
// 2. ENVÍO DEL FORMULARIO A GOOGLE SHEETS
// =========================================================================
const URL_SHEETS = "https://script.google.com/macros/s/AKfycbxcLLZF3G_SMuKiqhsvyPkAnhAm7rxbCQmG_h8qRufr0A6H1p6U4fqfL0UqTwzFIBtF/exec";
const form = document.getElementById("clienteForm");

// Función asistente para campos normales
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
        
        // Validar regiones (Modificado para permitir vacío si "Todas las regiones" está marcado)
        const regionesSeleccionadas = obtenerRegionesSeleccionadas();
        if (regionesSeleccionadas.length === 0 && (!todas || !todas.checked)) {
            alert("Debes seleccionar al menos una región de cobertura.");
            return;
        }

        // PROCESAMIENTO DEL TEXTAREA (Productos/Servicios)
        const txtProductos = obtenerValor("productos-servicios");
        let listaProductos = txtProductos
            .split("\n")
            .map(linea => linea.trim())
            .filter(linea => linea !== "");

        if (listaProductos.length === 0) {
            alert("Por favor, ingresa al menos un producto o servicio para monitorear.");
            return;
        }
        if (listaProductos.length > 3) {
            alert("La prueba gratuita solo permite monitorear un máximo de 3 productos o servicios.");
            return;
        }

        const productosFormateados = listaProductos.join(" | ");

        // CONSTRUCCIÓN DE LA FICHA CLEAN
        const ficha = {
            RUT: obtenerValor("rut_empresa"),
            EMPRESA: obtenerValor("empresa"),
            CONTACTO: obtenerValor("contacto"),
            CORREO: correo,
            WHATSAPP: obtenerValor("whatsapp"), // Sincronizado con el nombre exacto de tu columna
            REGION: obtenerValor("region"), 
            EXPERIENCIA: obtenerValor("experiencia"),
            INSCRITO: obtenerValor("inscrito"),
            COBERTURA: regionesSeleccionadas, // Enviará [] si seleccionó todas
            PRODUCTOS_SERVICIOS: productosFormateados, 
            PLAN: "GRATUITO",
            ESTADO: "activo",
            ULTIMO_CORREO: "",
            
            // FILTRO SPAM (HONEYPOT): Selector correcto apuntando al input dentro del div
            SEGUNDO_APELLIDO: document.querySelector("#segundo_apellido input") ? document.querySelector("#segundo_apellido input").value.trim() : ""
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
