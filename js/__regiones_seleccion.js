const todas = document.getElementById("todas-regiones");
const regiones = document.querySelectorAll(".region");

// Marcar / desmarcar TODAS las regiones en pantalla cuando se hace clic en el checkbox "Todas"
todas.addEventListener("change", () => {
    if (todas.checked) {regiones.forEach(r => r.checked = true);} 
    else {regiones.forEach(r => r.checked = false);}
});

// Detectar si el usuario marcó todas las regiones manualmente una por una
// para activar automáticamente el checkbox de "Todas" (o desactivarlo si desmarca alguna)
regiones.forEach(r => {
    r.addEventListener("change", () => {
        const todasMarcadas = Array.from(regiones).every(r => r.checked);
        if (todasMarcadas) {todas.checked = true;} 
        else {todas.checked = false;}
    });
});

function obtenerRegionesSeleccionadas() {
    const seleccionadas = [];

    // Si "Todas" está marcado, extraemos los valores de cada región individual
    if (todas.checked) {regiones.forEach(r => {seleccionadas.push(r.value);});
        return seleccionadas; // Devuelve un Array completo: ["15", "1", "2"]
                       }
    // Si no, extraemos solo las que el usuario marcó manualmente
    regiones.forEach(r => {if (r.checked) {seleccionadas.push(r.value);}});
    return seleccionadas;
}
