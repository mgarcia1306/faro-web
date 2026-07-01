// =========================================
// NO OLVIDAR CAMBIAR ESTA URL CADA VEZ QUE SE CAMBIE ALGO DEL CODIGO EN APPS SCRIPT (CADA IMPLEMENTACIÓN NUEVA)
// =========================================

const URL_SHEETS = "https://script.google.com/macros/s/AKf---numeros-y-letras----/exec";
const form = document.getElementById("clienteForm");

// =========================================
// LOGICA DE SELECCIÓN MÚLTIPLE DE REGIONES
// =========================================
const todas = document.getElementById("todas-regiones");
const regiones = document.querySelectorAll(".region");

// Marcar / desmarcar TODAS las regiones
todas.addEventListener("change", () => {
    if (todas.checked) { regiones.forEach(r => r.checked = true); } 
    else { regiones.forEach(r => r.checked = false); }
});

// Detectar si marcan todas manualmente una por una
regiones.forEach(r => {
    r.addEventListener("change", () => {
        const todasMarcadas = Array.from(regiones).every(r => r.checked);
        if (todasMarcadas) { todas.checked = true; } 
        else { todas.checked = false; }
    });
});

function obtenerRegionesSeleccionadas() {
    const seleccionadas = [];
    if (todas.checked) {
        regiones.forEach(r => { seleccionadas.push(r.value); });
        return seleccionadas; 
    }
    regiones.forEach(r => { if (r.checked) { seleccionadas.push(r.value); } });
    return seleccionadas;
}

// =========================================
// EVENTO SUBMIT DEL FORMULARIO
// =========================================
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const correo = document.getElementById("correo").value.trim();
    const correo2 = document.getElementById("correo2").value.trim();
    
    if (correo !== correo2) {
        alert("Los correos no coinciden.");
        return;
    }
    
    if (seleccionados.length === 0) {
        alert("Debes seleccionar al menos un rubro.");
        return;
    }
    
    // 1. Llamamos a tu función para obtener las regiones seleccionadas
    const regionesArray = obtenerRegionesSeleccionadas();
    
    if (regionesArray.length === 0) {
        alert("Debes seleccionar al menos una región.");
        return;
    }
    
    // 2. Convertimos el Array de regiones a un texto plano separado por " | "
    // Ejemplo: "Región Metropolitana | Región de Valparaíso" o "15 | 1 | 2"
    const regionesTexto = regionesArray.join(" | ");

    const excluir = document.getElementById("excluir").value.split("\n").map(x => x.trim()).filter(x => x != "");
    
    // Combinación de rubros múltiples
    const codigos = seleccionados.map(r => r.CodigoProducto).join(" | ");
    const nombres = seleccionados.map(r => r.NombreProducto).join(" | ");
    const nivel1 = seleccionados.map(r => r.Nivel1).join(" | ");
    const nivel2 = seleccionados.map(r => r.Nivel2).join(" | ");
    const nivel3 = seleccionados.map(r => r.Nivel3).join(" | ");

    // CONSTRUCCIÓN DE LA FICHA
    const ficha = {
        RUT: document.getElementById("rut_empresa").value,
        EMPRESA: document.getElementById("empresa").value,
        CONTACTO: document.getElementById("contacto").value,
        CORREO: correo,
        TELEFONO: document.getElementById("telefono").value,
        REGION: regionesTexto, // <-- Enviamos el string formateado directamente a la columna REGION
        EXPERIENCIA: document.getElementById("experiencia").value,
        INSCRITO: document.getElementById("inscrito").value,
        COBERTURA: document.getElementById("cobertura").value,
        PLAN: "GRATUITO",
        ESTADO: "activo",
        ULTIMO_CORREO: "",
        CODIGO_PRODUCTO: codigos,
        NOMBRE_PRODUCTO: nombres,
        NIVEL1: nivel1,
        NIVEL2: nivel2,
        NIVEL3: nivel3,
        EXCLUIR: excluir, 
        LICITACIONES: document.getElementById("licitaciones").checked,
        COMPRAS_AGILES: document.getElementById("compras").checked,
        CONVENIO: document.getElementById("convenio").checked,
        TRATO_DIRECTO: document.getElementById("trato").checked,
        SEGUNDO_APELLIDO: "" 
    };
    
    console.log(ficha);
    
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
