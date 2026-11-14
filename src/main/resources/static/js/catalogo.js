/* =====================================================
   Motor Bikes Medellín — motor de filtros reutilizable
   Lo usan repuestos.html y servicios.html.
   Cuando llegue el backend, solo hay que cambiar `items`
   por los datos que devuelva fetch('/api/...').
   ===================================================== */

const WHATSAPP = '573193276849';

// Formato de pesos colombianos: 85000 -> "$ 85.000"
const dinero = n => n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

// Enlace de WhatsApp con mensaje prellenado
const whatsapp = mensaje => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`;

// Minúsculas y sin tildes, para que "bujia" encuentre "Bujía"
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/**
 * items : lista de objetos (cada uno con al menos `nombre` y `precio`)
 * card  : función que recibe un item y devuelve su HTML
 * match : función (item, filtros) => true/false
 */
function initCatalogo({ items, card, match }) {
    const form  = document.getElementById('filtros');
    const grid  = document.getElementById('resultados');
    const conteo = document.getElementById('conteo');
    const vacio = document.getElementById('sinResultados');
    const precioTxt = document.getElementById('precioVal');

    // Llena los <select data-fill="campo"> con los valores que existen en los datos
    form.querySelectorAll('select[data-fill]').forEach(select => {
        const valores = [...new Set(items.flatMap(i => i[select.dataset.fill]))].sort();
        valores.forEach(v => select.add(new Option(v, v)));
    });

    const orden = {
        'precio-asc':  (a, b) => a.precio - b.precio,
        'precio-desc': (a, b) => b.precio - a.precio,
        'nombre':      (a, b) => a.nombre.localeCompare(b.nombre, 'es')
    };

    function mostrar() {
        const f = Object.fromEntries(new FormData(form));
        f.q = norm(f.q || '').trim();
        f.precio = Number(f.precio);
        f.disponible = 'disponible' in f;          // casilla marcada o no

        const lista = items.filter(i => match(i, f));
        if (orden[f.orden]) lista.sort(orden[f.orden]);

        grid.innerHTML = lista.map(card).join('');
        conteo.textContent = `${lista.length} resultado${lista.length === 1 ? '' : 's'}`;
        vacio.classList.toggle('d-none', lista.length > 0);
        if (precioTxt) precioTxt.textContent = dinero(f.precio);
    }

    form.addEventListener('input', mostrar);
    form.addEventListener('submit', e => e.preventDefault());
    form.addEventListener('reset', () => setTimeout(mostrar));   // esperar a que el formulario se limpie
    mostrar();
}
