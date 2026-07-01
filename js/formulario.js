// =========================================
// NO OLVIDAR CAMBIAR ESTA URL CADA VEZ QUE SE CAMBIE ALGO DEL CODIGO EN APPS SCRIPT (CADA IMPLEMENTACIÓN NUEVA)
// =========================================

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
    
    const excluir = document.getElementById("excluir").value.split("\n").map(x => x.trim()).filter(x => x != "");
    
    // Como ahora se pueden elegir hasta 2 rubros, combinamos sus datos usando " | " 
    // para que quepan en las mismas columnas de la fila
    const codigos = seleccionados.map(r => r.CodigoProducto).join(" | ");
    const nombres = seleccionados.map(r => r.NombreProducto).join(" | ");
    const nivel1 = seleccionados.map(r => r.Nivel1).join(" | ");
    const nivel2 = seleccionados.map(r => r.Nivel2).join(" | ");
    const nivel3 = seleccionados.map(r => r.Nivel3).join(" | ");

    // CONSTRUCCIÓN DE LA FICHA: Ahora las llaves coinciden EXACTAMENTE con los encabezados de tu Sheets
    const ficha = {
        RUT: document.getElementById("rut_empresa").value,
        EMPRESA: document.getElementById("empresa").value,
        CONTACTO: document.getElementById("contacto").value,
        CORREO: correo,
        TELEFONO: document.getElementById("telefono").value,
        REGION: document.getElementById("region").value,
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
        EXCLUIR: excluir, // Va como Array, Apps Script se encarga de transformarlo a texto con saltos de línea
        LICITACIONES: document.getElementById("licitaciones").checked,
        COMPRAS_AGILES: document.getElementById("compras").checked,
        CONVENIO: document.getElementById("convenio").checked,
        TRATO_DIRECTO: document.getElementById("trato").checked,
        SEGUNDO_APELLIDO: "" // Lo dejamos vacío si no existe en el formulario para evitar errores de mapeo
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
