// =========================================
// CAMBIAR ESTA URL POR LA DE TU APPS SCRIPT
// =========================================

const URL_SHEETS ="https://script.google.com/macros/s/AKfycbw__uEtOFBZ5HjI0bJb1bbpyMXEyY64t4m4GuC_RkG35LUVC4jmONCcsJDZCMYVUT4i/exec";
const form=document.getElementById("clienteForm");
form.addEventListener
(
    "submit",async(e)=>
    {
        e.preventDefault();
        const correo=document.getElementById("correo").value.trim();
        const correo2=document.getElementById("correo2").value.trim();
        if(correo!==correo2)
        {
            alert("Los correos no coinciden.");
            return;
        }
        if(seleccionados.length===0)
        {
            alert("Debes seleccionar un rubro.");
            return;
        }
        const excluir=document.getElementById("excluir").value.split("\n").map(x=>x.trim()).filter(x=>x!="");
        const ficha=
        {
            rut_empresa:document.getElementById("rut_empresa").value,
            empresa:document.getElementById("empresa").value,
            contacto:document.getElementById("contacto").value,
            correo:correo,
            telefono:document.getElementById("telefono").value,
            region:document.getElementById("region").value,
            experiencia:document.getElementById("experiencia").value,
            inscrito:document.getElementById("inscrito").value,
            cobertura:document.getElementById("cobertura").value,
            plan:"GRATUITO",
            activo: "",
            estado:"activo",
            fecha_inicio:new Date().toISOString().slice(0,10),
            fecha_fin:"", // se calculará después
            ultimo_correo:"",
            rubro:seleccionados[0],
            excluir:excluir,
            tipos:
            {
                licitaciones:document.getElementById("licitaciones").checked,
                compras_agiles:document.getElementById("compras").checked,
                convenio:document.getElementById("convenio").checked,
                trato_directo:document.getElementById("trato").checked
            }
        };
        console.log(ficha);
        try
        {
            const respuesta=await fetch(URL_SHEETS,{method:"POST",body:JSON.stringify(ficha)});
            const data=await respuesta.json();
            console.log(data);
            window.location.href="gracias.html";
        }
        catch(error)
        {
            console.error(error);
            alert("No fue posible guardar la información.");
        }
    }
);
