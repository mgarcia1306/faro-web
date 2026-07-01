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
    .catch(error => {
        console.error(error);
    });

buscar.addEventListener("input", () => {
    // Si ya hay 2 o más, no busca nada
    if (seleccionados.length >= 2) { return; }
    
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
    // Corregido: Validar antes de agregar el elemento para que el límite sea estricto
    if (seleccionados.length >= 2) { 
        alert("La prueba gratuita permite monitorear solo 2 rubros."); 
        return; 
    }
    
    seleccionados.push(r);
    actualizar();
    
    buscar.value = "";
    resultados.innerHTML = "";
    
    // Corregido: Bloquear el buscador SOLO si ya se alcanzó el límite de 2
    if (seleccionados.length >= 2) {
        buscar.disabled = true;
    }
}

function actualizar() {
    contSeleccionados.innerHTML = "";
    // Corregido: Usamos el segundo parámetro (index) para identificar cada rubro
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

// Corregido: Ahora recibe el index específico que se quiere borrar
function eliminar(index) {
    // Elimina únicamente el elemento en esa posición
    seleccionados.splice(index, 1); 
    
    // Al haber borrado uno, el buscador siempre se vuelve a habilitar
    buscar.disabled = false; 
    
    actualizar();
    buscar.focus();
}
