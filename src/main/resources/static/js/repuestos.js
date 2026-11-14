const API_URL     = '/api/sparePart';        // GET lista · POST crear/actualizar · DELETE /{id}
const API_INFORME = '/api/informes/stock';   // cambiar por la ruta real del PDF
 
const MARCAS     = ['Athena', 'Bosch', 'Brembo', 'Castrol', 'DID', 'Hiflofiltro', 'K&N', 'Michelin', 'Motul', 'NGK', 'Pirelli', 'Wiseco'];
const CATEGORIAS = ['Eléctrico', 'Filtros', 'Frenos', 'Llantas', 'Lubricantes', 'Motor', 'Transmisión'];
 
let inventario = [];
 
/* ---------- Utilidades ---------- */
const $ = id => document.getElementById(id);
const dinero = n => Number(n).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
const soloFecha = v => v ? String(v).slice(0, 10) : '';   // acepta "2028-06-30" o "2028-06-30T00:00:00..."
const fecha = v => v ? new Date(soloFecha(v) + 'T00:00').toLocaleDateString('es-CO') : '—';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const irA = tab => bootstrap.Tab.getOrCreateInstance($('btn-' + tab)).show();
 
// Verde = disponible, amarillo = pocas unidades, rojo = agotado
function estado(r) {
    if (r.stock <= 0)          return { texto: 'Agotado',        clase: 'danger'  };
    if (r.stock <= r.minStock) return { texto: 'Pocas unidades', clase: 'warning' };
    return                            { texto: 'Disponible',     clase: 'success' };
}
 
function aviso(texto, tipo = 'success') {
    $('avisos').innerHTML = `<div class="alert alert-${tipo} alert-dismissible fade show">${esc(texto)}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
}
 
/* ---------- Listas del formulario ---------- */
const listas = { marcas: MARCAS, categorias: CATEGORIAS };
document.querySelectorAll('select[data-lista]').forEach(sel =>
    listas[sel.dataset.lista].forEach(v => sel.add(new Option(v, v))));
 
// Si un repuesto trae una marca o categoría que no está en la lista, se agrega para poder editarlo
function asegurarOpcion(select, valor) {
    if (valor && ![...select.options].some(o => o.value === valor)) select.add(new Option(valor, valor));
}
 
/* ---------- Leer ---------- */
// Los filtros se llenan con las marcas y categorías que hay en la base de datos
function llenarFiltro(select, valores) {
    const actual = select.value;
    const unicos = [...new Set(valores.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
    select.length = 1;                                    // deja solo "Todas"
    unicos.forEach(v => select.add(new Option(v, v)));
    select.value = unicos.includes(actual) ? actual : '';
}
 
async function cargar() {
    try {
        const resp = await fetch(API_URL);
        if (!resp.ok) throw new Error();
        inventario = (await resp.json()).sort((a, b) => a.id - b.id);
        llenarFiltro($('fMarca'), inventario.map(r => r.brand));
        llenarFiltro($('fCategoria'), inventario.map(r => r.category));
        pintarTabla();
    } catch {
        aviso('No se pudo cargar el inventario. Revisa que el servidor esté encendido.', 'danger');
    }
}
 
function pintarTabla() {
    const f = Object.fromEntries(new FormData($('filtros')));
    const lista = inventario.filter(r =>
        (!f.marca     || r.brand === f.marca) &&
        (!f.categoria || r.category === f.categoria));
 
    $('tablaBody').innerHTML = lista.map(r => {
        const e = estado(r);
        return `<tr>
            <td class="fw-bold">${esc(r.id)}</td>
            <td>${esc(r.name)}</td>
            <td>${esc(r.brand)}</td>
            <td>${esc(r.category)}</td>
            <td class="text-end">${esc(r.stock)}</td>
            <td class="text-end">${esc(r.minStock)}</td>
            <td class="text-end">${esc(r.maxStock)}</td>
            <td class="text-end">${dinero(r.salePrice)}</td>
            <td class="text-end">${dinero(r.purchasePrice)}</td>
            <td>${fecha(r.expirationDate)}</td>
            <td><span class="badge text-bg-${e.clase}">${e.texto}</span></td>
            <td>
                <button type="button" class="btn btn-sm btn-primary" data-accion="editar" data-id="${esc(r.id)}">Editar</button>
                <button type="button" class="btn btn-sm btn-outline-danger" data-accion="eliminar" data-id="${esc(r.id)}">Eliminar</button>
            </td>
        </tr>`;
    }).join('');
 
    $('conteo').textContent = `${lista.length} de ${inventario.length} repuestos`;
    $('tablaVacia').classList.toggle('d-none', lista.length > 0);
}
 
$('filtros').addEventListener('input', pintarTabla);
$('filtros').addEventListener('reset', () => setTimeout(pintarTabla));
 
$('tablaBody').addEventListener('click', e => {
    const boton = e.target.closest('[data-accion]');
    if (!boton) return;
    const id = Number(boton.dataset.id);
    boton.dataset.accion === 'editar' ? editar(id) : eliminar(id);
});
 
/* ---------- Registrar y editar (mismo formulario) ---------- */
function modoFormulario(editando, id) {
    $('tituloForm').textContent  = editando ? `Editar repuesto (ID ${id})` : 'Registrar repuesto';
    $('btnGuardar').textContent  = editando ? 'Guardar cambios'            : 'Guardar repuesto';
    $('btnCancelar').textContent = editando ? 'Cancelar edición'           : 'Limpiar';
}
 
function limpiarFormulario() {
    $('formRepuesto').reset();
    $('repId').value = '';          // reset() no borra el campo oculto
    modoFormulario(false);
}
 
function editar(id) {
    const r = inventario.find(x => x.id === id);
    if (!r) return;
    const campos = $('formRepuesto').elements;
 
    asegurarOpcion(campos.brand, r.brand);
    asegurarOpcion(campos.category, r.category);
    ['id', 'name', 'brand', 'category', 'stock', 'minStock', 'maxStock', 'salePrice', 'purchasePrice']
        .forEach(c => campos[c].value = r[c] ?? '');
    campos.expirationDate.value = soloFecha(r.expirationDate);
 
    modoFormulario(true, id);
    irA('registrar');
}
 
$('btnCancelar').addEventListener('click', () => {
    const editaba = $('repId').value !== '';
    limpiarFormulario();
    if (editaba) irA('inventario');
});
 
// El backend usa POST para crear y para actualizar (si el objeto trae id, actualiza)
$('formRepuesto').addEventListener('submit', async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const repuesto = {
        name: d.name.trim(), brand: d.brand, category: d.category,
        stock: Number(d.stock), minStock: Number(d.minStock), maxStock: Number(d.maxStock),
        salePrice: Number(d.salePrice), purchasePrice: Number(d.purchasePrice),
        expirationDate: d.expirationDate || null
    };
    if (d.id) repuesto.id = Number(d.id);
 
    if (repuesto.minStock > repuesto.maxStock)
        return aviso('El stock mínimo no puede ser mayor que el stock máximo.', 'danger');
 
    try {
        const resp = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(repuesto)
        });
        if (!resp.ok) throw new Error();
 
        limpiarFormulario();
        await cargar();
        irA('inventario');
        aviso(d.id ? 'Repuesto actualizado.' : 'Repuesto registrado.');
    } catch {
        aviso('No se pudo guardar el repuesto.', 'danger');
    }
});
 
/* ---------- Eliminar ---------- */
async function eliminar(id) {
    const r = inventario.find(x => x.id === id);
    if (!r || !confirm(`¿Eliminar "${r.name}" (ID ${id})? Esta acción no se puede deshacer.`)) return;
 
    try {
        const resp = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!resp.ok) throw new Error();
        await cargar();
        aviso('Repuesto eliminado.');
    } catch {
        aviso('No se pudo eliminar el repuesto.', 'danger');
    }
}
 
/* ---------- Informe de stock (PDF generado por el backend) ---------- */
$('btnInforme').addEventListener('click', async () => {
    try {
        const resp = await fetch(API_INFORME);
        if (resp.status === 204) return aviso('No hay datos para este informe.', 'info');
        if (!resp.ok) throw new Error();
 
        const enlace = document.createElement('a');
        enlace.href = URL.createObjectURL(await resp.blob());
        enlace.download = 'informe-de-stock.pdf';
        enlace.click();
        URL.revokeObjectURL(enlace.href);
    } catch {
        aviso('No se pudo generar el informe. Intenta de nuevo.', 'danger');
    }
});
 
cargar();
 