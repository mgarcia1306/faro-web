// =========================================
// CAMBIAR ESTA URL POR LA DE TU APPS SCRIPT
// =========================================

const URL_SHEETS ="https://script.google.com/macros/s/AKfycbwQfdJAqddTwkrdc1W1N4SfgaSIRXUIxn2CG0OD_f_5_SulWIQVpyatK2r1ho5Wfx95/exec";
                   
const form=document.getElementById("clienteForm");
form.addEventListener("submit",async(e)=>{
  e.preventDefault();
  const correo=document.getElementById("correo").value.trim();
  const correo2=document.getElementById("correo2").value.trim();
  if(correo!==correo2){alert("Los correos no coinciden.");return;}
  if(seleccionados.length===0){alert("Debes seleccionar un rubro.");return;}
  
  // 1. LLAMAR A FUNCIÓN DE REGIONES
  const regionesSeleccionadas = obtenerRegionesSeleccionadas(); // Devuelve "TODAS" o un Array ["15", "1"]

  // Validar que al menos haya seleccionado una región o "TODAS"
  if (regionesSeleccionadas !== "TODAS" && regionesSeleccionadas.length === 0) {
    alert("Debes seleccionar al menos una región para la cobertura.");
    return;
  }

  // 2. TRANSFORMAR A TEXTO PARA GOOGLE SHEETS
  // Al igual que con 'excluir', si es un array lo unimos con comas. Si es "TODAS", pasa directo.
  // const coberturaTexto = regionesSeleccionadas === "TODAS" ? "TODAS" : regionesSeleccionadas.join(", "); // Ejemplo: "15, 1, 2"
  
  const excluir=document.getElementById("excluir").value.split("\n").map(x=>x.trim()).filter(x=>x!="");

  // 3. ARMAR LA FICHA CON EL TEXTO PROCESADO
  const ficha={
    ID:"FARO-"+Date.now(),
    EMPRESA:document.getElementById("empresa").value,
    CONTACTO:document.getElementById("contacto").value,
    CORREO:correo,
    TELEFONO:document.getElementById("telefono").value,
    REGION:document.getElementById("region").value,
    EXPERIENCIA:document.getElementById("experiencia").value,
    INSCRITO:document.getElementById("inscrito").value,
    COBERTURA: regionesSeleccionadas,
    PLAN:"gratis",
    ACTIVO:"si",
    ESTADO:"activo",
    FECHA_INICIO:new Date().toISOString().slice(0,10),
    FECHA_FIN:"", // se calculará después
    ULTIMO_CORREO:"NULL",
    CODIGO_PRODUCTO:seleccionados[0].CodigoProducto,
    NOMBRE_PRODUCTO:seleccionados[0].NombreProducto,
    NIVEL1:seleccionados[0].Nivel1,
    NIVEL2:seleccionados[0].Nivel2,
    NIVEL3:seleccionados[0].Nivel3,
    EXCLUIR:excluir,    
    LICITACIONES:document.getElementById("licitaciones").checked,
    COMPRAS_AGILES:document.getElementById("compras").checked,
    CONVENIO:document.getElementById("convenio").checked,
    TRATO_DIRECTO:document.getElementById("trato").checked
    }
  console.log("Ficha a enviar: ", ficha);
  try{const respuesta=await fetch(URL_SHEETS,{method:"POST",body:JSON.stringify(ficha)});
    const data=await respuesta.json();
    console.log(data);
    window.location.href="gracias.html";}
  catch(error){console.error(error);
    alert("No fue posible guardar la información.");}
  });
