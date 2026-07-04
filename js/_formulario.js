// =========================================================================
// 1. CONTROL DE RUBROS (Hasta 2 rubros)
// =========================================================================

const MAX_RUBROS = 5; // <--- Acá se cambia el límite de rubros

let rubros = [];
let seleccionados = [];

const buscar = document.getElementById("buscar");
const resultados = document.getElementById("resultados");
const contSeleccionados = document.getElementById("seleccionados");

fetch("data/Listado_rubros_ONU.json")
    .then(r => r.json())
    .then(data => {
        rubros = data;
        console.log("Rubros cargados:", rubros.length);
    })
    .catch(error => { console.error(error); });

buscar.addEventListener("input", () => {
    if (seleccionados.length >= MAX_RUBROS) { return; }
    const texto = buscar.value.toLowerCase().trim();
    if (texto.length < 1) { resultados.innerHTML = ""; return; }    
    
    const encontrados = rubros.filter(r =>
        (r.NombreProducto || "").toLowerCase().includes(texto) ||
        String(r.CodigoProducto || "").includes(texto) ||
        (r.Nivel1 || "").toLowerCase().includes(texto) ||
        (r.Nivel2 || "").toLowerCase().includes(texto) ||
        (r.Nivel3 || "").toLowerCase().includes(texto)
    ).slice(0, 100);
    mostrar(encontrados);
});

function mostrar(lista) {
    resultados.innerHTML = "";
    lista.forEach(r => {
        const div = document.createElement("div");
        div.className = "item";
        div.innerHTML = `
            <b>${r.CodigoProducto}</b>
            <br>${r.NombreProducto}<br>
            <small>${r.Nivel1} > ${r.Nivel2} > ${r.Nivel3}</small>
            `;
        div.onclick = () => agregar(r);
        resultados.appendChild(div);
    });
}

function agregar(r) {
    if (seleccionados.length >= MAX_RUBROS) { 
        alert("La prueba gratuita permite monitorear solo ${MAX_RUBROS} rubros."); 
        return; 
    }
    seleccionados.push(r);
    actualizar();
    buscar.value = "";
    resultados.innerHTML = "";
    if (seleccionados.length >= MAX_RUBROS) { buscar.disabled = true; }
}

function actualizar() {
    contSeleccionados.innerHTML = "";
    seleccionados.forEach((r, index) => {
        const div = document.createElement("div");
        div.className = "seleccionado";
        div.innerHTML = `
            <strong>${r.NombreProducto}</strong>
            <br>
            Código: ${r.CodigoProducto}
            <br>
            <small>${r.Nivel1} > ${r.Nivel2} > ${r.Nivel3}</small>
            <br><br>
            <button onclick="eliminar(${index})">Cambiar rubro</button>
            `;
        contSeleccionados.appendChild(div);
    });
}

function eliminar(index) {
    seleccionados.splice(index, 1); 
    buscar.disabled = false; 
    actualizar();
    buscar.focus();
}

// =========================================================================
// 2. CONTROL DE REGIONES (Cobertura)
// =========================================================================
const todas = document.getElementById("todas-regiones");
const regiones = document.querySelectorAll(".region");

todas.addEventListener("change", () => {
    if (todas.checked) { regiones.forEach(r => r.checked = true); } 
    else { regiones.forEach(r => r.checked = false); }
});

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

// =========================================================================
// 3. ENVÍO DEL FORMULARIO A GOOGLE SHEETS
// =========================================================================

// NO OLVIDAR CAMBIAR ESTA URL CADA VEZ QUE SE CAMBIE ALGO DEL CODIGO EN APPS SCRIPT (cada implementación nueva)

const URL_SHEETS ="https://script.google.com/macros/s/AKfycbw__uEtOFBZ5HjI0bJb1bbpyMXEyY64t4m4GuC_RkG35LUVC4jmONCcsJDZCMYVUT4i/exec";
const form = document.getElementById("clienteForm");

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

    const regionesSeleccionadas = obtenerRegionesSeleccionadas();
    if (regionesSeleccionadas.length === 0) {
        alert("Debes seleccionar al menos una región de cobertura.");
        return;
    }
    
    const excluir = document.getElementById("excluir").value.split("\n").map(x => x.trim()).filter(x => x != "");
    
    // Mapeo de rubros múltiples separados por " | "
    const codigos = seleccionados.map(r => r.CodigoProducto).join(" | ");
    const nombres = seleccionados.map(r => r.NombreProducto).join(" | ");
    const nivel1 = seleccionados.map(r => r.Nivel1).join(" | ");
    const nivel2 = seleccionados.map(r => r.Nivel2).join(" | ");
    const nivel3 = seleccionados.map(r => r.Nivel3).join(" | ");

    // Objeto FICHA plano en MAYÚSCULAS para emparejar con los encabezados de Sheets
    const ficha = {
        RUT: document.getElementById("rut_empresa").value,
        EMPRESA: document.getElementById("empresa").value,
        CONTACTO: document.getElementById("contacto").value,
        CORREO: correo,
        TELEFONO: document.getElementById("telefono").value,
        REGION: document.getElementById("region").value, // Región de origen/comercial del cliente
        EXPERIENCIA: document.getElementById("experiencia").value,
        INSCRITO: document.getElementById("inscrito").value,
        COBERTURA: regionesSeleccionadas, // Mandamos el Array. Apps Script lo transformará en texto "1|2|15"
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
