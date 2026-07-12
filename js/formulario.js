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
    if (todas && todas.checked) {
        return [];
    }
    
    const seleccionadas = [];
    regiones.forEach(r => { if (r.checked) { seleccionadas.push(r.value); } });
    return seleccionadas;
}

// Function asistente para capturar textos limpios
function obtenerValor(id) {
    const el = document.getElementById(id);
    if (!el || el.offsetParent === null) {
        return "";
    }
    return el.value.trim();
}


// =========================================================================
// 2. PROCESAMIENTO Y ENVÍO CENTRALIZADO
// =========================================================================
const URL_SHEETS = "https://script.google.com/macros/s/AKfycbxcLLZF3G_SMuKiqhsvyPkAnhAm7rxbCQmG_h8qRufr0A6H1p6U4fqfL0UqTwzFIBtF/exec";
const form = document.getElementById("clienteForm");

if (form) {
    form.addEventListener("submit", async (e) => {
        // Siempre frenamos el envío nativo al inicio para manejarlo con fetch/validaciones
        e.preventDefault(); 

        // 1. Buscamos el botón de envío dentro del formulario
        const botonEnvio = form.querySelector('.btn') || form.querySelector('button[type="submit"]');






        
        
        // JUGADA MAESTRA ANTI-SPAM (HONEYPOT)
        const campoTrampa = document.querySelector("#segundo_apellido input") ? document.querySelector("#segundo_apellido input").value.trim() : "";
        if (campoTrampa !== "") {
            console.warn("Spam detectado. Bloqueando envío silenciosamente.");
            return; // Muere la ejecución aquí
        }
        
        // VALIDACIÓN DE CORREOS
        const correo = obtenerValor("correo");
        const correo2 = obtenerValor("correo2");
        if (correo && correo2 && correo !== correo2) {
            alert("Los correos no coinciden.");
            return;
        }
        
        // VALIDACIÓN DE REGIONES
        const regionesSeleccionadas = obtenerRegionesSeleccionadas();
        if (regionesSeleccionadas.length === 0 && (!todas || !todas.checked)) {
            alert("Debes seleccionar al menos una región de cobertura.");
            return;
        }

        // VALIDACIÓN ANTIPILOS: 3 PRODUCTOS/SERVICIOS (Al menos uno obligatorio)
        const input1 = document.getElementById('prod_1');
        if (input1) input1.setCustomValidity(""); // Limpieza previa

        const p1 = obtenerValor('prod_1');
        const p2 = obtenerValor('prod_2');
        const p3 = obtenerValor('prod_3');
        const listaProductos = [p1, p2, p3].filter(producto => producto !== "");

        if (listaProductos.length === 0) {
            if (input1) {
                input1.setCustomValidity("Por favor, escribe al menos un producto o servicio para tu radar.");
                input1.reportValidity();
            } else {
                alert("Por favor, ingresa al menos un producto o servicio.");
            }
            return;
        }
        const productosFormateados = listaProductos.join("|");

        // PROCESAMIENTO DE EXCLUSIONES (Opcionales, unidos por Pipe)
        const e1 = obtenerValor('exc_1');
        const e2 = obtenerValor('exc_2');
        const e3 = obtenerValor('exc_3');
        const listaExclusiones = [e1, e2, e3].filter(exc => exc !== "");
        const exclusionesUnidas = listaExclusiones.join('|');

        // CAPTURA DE NUEVOS FILTROS (Montos y Sello)
        const montoMinimo = obtenerValor("monto_min");
        const montoMaximo = obtenerValor("monto_max");
        
        // Rescatamos Sello Mujer (Funciona si es Select o Radio Buttons con name="Sello_Mujer")
        const elSelloRadio = document.querySelector('input[name="Sello_Mujer"]:checked');
        const elSelloSelect = document.getElementById("sello_mujer");
        const selloMujerValor = elSelloRadio ? elSelloRadio.value : (elSelloSelect ? elSelloSelect.value : "NO");

        // 🚀 LA JUGADA DE FEEDBACK: Activamos el estado "Enviando" justo antes del fetch
        if (botonEnvio) {
            botonEnvio.disabled = true; // Bloquea nuevos clicks accidentales
            botonEnvio.innerText = "Conectando con el Radar..."; // Cambia el texto
            botonEnvio.style.opacity = "0.7";
            botonEnvio.style.cursor = "not-allowed";
        }
        
        
        // 🏢 CONSTRUCCIÓN DE LA FICHA CLEAN PARA EL BACKEND
        const ficha = {
            RUT: obtenerValor("rut_empresa"),
            EMPRESA: obtenerValor("empresa"),
            CONTACTO: obtenerValor("contacto"),
            CORREO: correo,
            WHATSAPP: obtenerValor("whatsapp"), 
            REGION: obtenerValor("region"), 
            EXPERIENCIA: obtenerValor("experiencia"),
            INSCRITO: obtenerValor("inscrito"),
            COBERTURA: regionesSeleccionadas, // Enviará [] si seleccionó "Todas"
            PRODUCTOS_SERVICIOS: productosFormateados, 
            EXCLUSIONES: exclusionesUnidas,
            MONTO_MIN: montoMinimo,
            MONTO_MAX: montoMaximo,
            SELLO_MUJER: selloMujerValor,
            PLAN: "GRATUITO",
            ESTADO: "activo",
            ULTIMO_CORREO: ""
        };
        
        console.log("Enviando datos estructurados al radar:", ficha);
        
        try {
            const respuesta = await fetch(URL_SHEETS, {method: "POST", body: JSON.stringify(ficha)});
            const data = await respuesta.json();
            console.log("Respuesta del servidor:", data);
            window.location.href = "gracias.html";
        }
        catch (error) {
            console.error("Error al enviar a la base de datos:", error);
            alert("No fue posible guardar la información.");
                // 🔄 Si falla, devolvemos el botón a su estado original para que puedan reintentar
        if (botonEnvio) {
                botonEnvio.disabled = false;
                botonEnvio.innerText = "🚀 ACTIVA TU PRUEBA GRATUITA"; // O el texto original que tenga tu botón
                botonEnvio.style.opacity = "1";
                botonEnvio.style.cursor = "pointer";
            }
        }
    });
}
