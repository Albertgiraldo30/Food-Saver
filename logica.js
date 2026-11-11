/* Food Saver — lógica pura (sin DOM ni localStorage).
   Se usa en el navegador (index.html la carga con <script src="logica.js">)
   y en Node (pruebas.js la carga con require). */

/* ===================== Constantes ===================== */

// Unidad -> tipo y factor para llevarla a la unidad base del tipo (g, ml o unidades)
const UNIDADES = {
  unidades:   { tipo: 'unidad',  factor: 1 },
  g:          { tipo: 'peso',    factor: 1 },
  kg:         { tipo: 'peso',    factor: 1000 },
  libras:     { tipo: 'peso',    factor: 500 },   // libra colombiana
  ml:         { tipo: 'volumen', factor: 1 },
  l:          { tipo: 'volumen', factor: 1000 },
  tazas:      { tipo: 'volumen', factor: 240 },
  cucharadas: { tipo: 'volumen', factor: 15 }
};

// Unidad base de cada tipo (factor 1): se usa cuando un descuento no cabe en 2 decimales.
const UNIDAD_BASE = { peso: 'g', volumen: 'ml', unidad: 'unidades' };

const CLAVE = 'foodsaver.v1';     // clave de localStorage
const CANTIDAD_MAXIMA = 10000;
const DIAS_PROXIMO = 3;           // 0 a 3 días = próximo a vencer (decisión 17)

const RECETAS = [
  { id: 1, nombre: 'Huevos pericos',
    ingredientes: [
      { nombre: 'huevo', cantidad: 3, unidad: 'unidades' },
      { nombre: 'tomate', cantidad: 1, unidad: 'unidades' },
      { nombre: 'cebolla', cantidad: 1, unidad: 'unidades' },
      { nombre: 'aceite', cantidad: 15, unidad: 'ml' }
    ],
    preparacion: 'Picar tomate y cebolla, sofreír, agregar los huevos batidos y revolver.' },
  { id: 2, nombre: 'Arroz con pollo',
    ingredientes: [
      { nombre: 'arroz', cantidad: 250, unidad: 'g' },
      { nombre: 'pechuga de pollo', cantidad: 300, unidad: 'g' },
      { nombre: 'cebolla', cantidad: 1, unidad: 'unidades' },
      { nombre: 'zanahoria', cantidad: 1, unidad: 'unidades' }
    ],
    preparacion: 'Cocinar y desmechar el pollo, sofreír las verduras, agregar arroz y agua, cocinar 20 min.' },
  { id: 3, nombre: 'Pasta con salsa de tomate',
    ingredientes: [
      { nombre: 'pasta', cantidad: 250, unidad: 'g' },
      { nombre: 'tomate', cantidad: 3, unidad: 'unidades' },
      { nombre: 'cebolla', cantidad: 1, unidad: 'unidades' },
      { nombre: 'queso', cantidad: 100, unidad: 'g' }
    ],
    preparacion: 'Cocinar la pasta, hacer la salsa con tomate y cebolla, servir con queso.' },
  { id: 4, nombre: 'Ensalada de aguacate',
    ingredientes: [
      { nombre: 'aguacate', cantidad: 1, unidad: 'unidades' },
      { nombre: 'tomate', cantidad: 2, unidad: 'unidades' },
      { nombre: 'cebolla', cantidad: 1, unidad: 'unidades' },
      { nombre: 'limón', cantidad: 1, unidad: 'unidades' }
    ],
    preparacion: 'Picar todo, mezclar y aliñar con limón.' },
  { id: 5, nombre: 'Sopa de verduras',
    ingredientes: [
      { nombre: 'papa', cantidad: 3, unidad: 'unidades' },
      { nombre: 'zanahoria', cantidad: 2, unidad: 'unidades' },
      { nombre: 'cebolla', cantidad: 1, unidad: 'unidades' },
      { nombre: 'arveja', cantidad: 200, unidad: 'g' }
    ],
    preparacion: 'Picar y hervir 25 min en agua con sal.' },
  { id: 6, nombre: 'Batido de banano',
    ingredientes: [
      { nombre: 'banano', cantidad: 2, unidad: 'unidades' },
      { nombre: 'leche', cantidad: 500, unidad: 'ml' }
    ],
    preparacion: 'Licuar y servir frío.' },
  { id: 7, nombre: 'Arepa con queso',
    ingredientes: [
      { nombre: 'harina de maíz', cantidad: 250, unidad: 'g' },
      { nombre: 'queso', cantidad: 150, unidad: 'g' },
      { nombre: 'mantequilla', cantidad: 20, unidad: 'g' }
    ],
    preparacion: 'Amasar la harina con agua y sal, rellenar con queso y asar.' },
  { id: 8, nombre: 'Papas con huevo',
    ingredientes: [
      { nombre: 'papa', cantidad: 4, unidad: 'unidades' },
      { nombre: 'huevo', cantidad: 2, unidad: 'unidades' },
      { nombre: 'aceite', cantidad: 30, unidad: 'ml' }
    ],
    preparacion: 'Cocinar las papas en cubos, dorarlas y agregar los huevos.' }
];

// Despensa de ejemplo (datos ficticios). "dias" es relativo a hoy.
const SEMILLA = [
  { nombre: 'Queso',            cantidad: 200, unidad: 'g',        dias: -1 },
  { nombre: 'Tomate',           cantidad: 4,   unidad: 'unidades', dias: 1 },
  { nombre: 'Leche',            cantidad: 1,   unidad: 'l',        dias: 2 },
  { nombre: 'Pechuga de pollo', cantidad: 1,   unidad: 'libras',   dias: 2 },
  { nombre: 'Banano',           cantidad: 3,   unidad: 'unidades', dias: 3 },
  { nombre: 'Cebolla',          cantidad: 3,   unidad: 'unidades', dias: 7 },
  { nombre: 'Huevo',            cantidad: 12,  unidad: 'unidades', dias: 10 },
  { nombre: 'Papa',             cantidad: 6,   unidad: 'unidades', dias: 14 },
  { nombre: 'Pasta',            cantidad: 500, unidad: 'g',        dias: 90 },
  { nombre: 'Aceite',           cantidad: 1,   unidad: 'l',        dias: 120 },
  { nombre: 'Arroz',            cantidad: 1,   unidad: 'kg',       dias: 180 }
];

/* ===================== Nombres ===================== */

// Minúsculas, sin tildes (\p{M} = marcas combinantes tras NFD), sin espacios sobrantes.
function limpiarTexto(texto) {
  return String(texto)
    .normalize('NFD').replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

// Nombre normalizado sin la "s" final ("  TomátES " -> "tomate").
function normalizar(texto) {
  return limpiarTexto(texto).replace(/s$/, '');
}

// Formas posibles: quitando "s" final (tomates -> tomate) y "es" final (limones -> limon).
function formasNombre(texto) {
  const base = limpiarTexto(texto);
  return [base.replace(/s$/, ''), base.replace(/es$/, '')];
}

// true si dos nombres son el mismo ingrediente ("Limones" = "limón", "Tomates" = "tomate").
function mismoNombre(a, b) {
  const formasB = formasNombre(b);
  return formasNombre(a).some(f => formasB.includes(f));
}

/* ===================== Fechas ===================== */

function dosDigitos(n) { return String(n).padStart(2, '0'); }

// Fecha local de hoy como 'YYYY-MM-DD' (no usa toISOString para evitar el corrimiento por UTC).
function hoyISO() {
  const d = new Date();
  return d.getFullYear() + '-' + dosDigitos(d.getMonth() + 1) + '-' + dosDigitos(d.getDate());
}

// Suma n días a una fecha 'YYYY-MM-DD' y devuelve otra 'YYYY-MM-DD'.
function sumarDias(iso, n) {
  const [a, m, d] = iso.split('-').map(Number);
  const f = new Date(a, m - 1, d + n);
  return f.getFullYear() + '-' + dosDigitos(f.getMonth() + 1) + '-' + dosDigitos(f.getDate());
}

// Días que faltan desde hoy hasta "vence" (negativo = ya venció).
function diasPara(vence) {
  const [a1, m1, d1] = hoyISO().split('-').map(Number);
  const [a2, m2, d2] = String(vence).split('-').map(Number);
  return Math.round((Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1)) / 86400000);
}

// 'vencido' (antes de hoy), 'proximo' (0 a 3 días) o 'normal'.
function estadoDe(ing) {
  const d = diasPara(ing.vence);
  if (d < 0) return 'vencido';
  if (d <= DIAS_PROXIMO) return 'proximo';
  return 'normal';
}

// Texto legible del vencimiento según los días que faltan.
function textoVence(dias) {
  if (dias < -1) return 'Venció hace ' + (-dias) + ' días';
  if (dias === -1) return 'Venció ayer';
  if (dias === 0) return 'Vence hoy';
  if (dias === 1) return 'Vence mañana';
  return 'Vence en ' + dias + ' días';
}

/* ===================== Cantidades y conversiones ===================== */

function redondear(n) { return Math.round(n * 100) / 100; }

// Nombres completos que se MUESTRAN para cada unidad (los valores internos no cambian).
const NOMBRES_UNIDAD = {
  unidades:   { singular: 'unidad',     plural: 'unidades' },
  g:          { singular: 'gramo',      plural: 'gramos' },
  kg:         { singular: 'kilogramo',  plural: 'kilogramos' },
  libras:     { singular: 'libra',      plural: 'libras' },
  ml:         { singular: 'mililitro',  plural: 'mililitros' },
  l:          { singular: 'litro',      plural: 'litros' },
  tazas:      { singular: 'taza',       plural: 'tazas' },
  cucharadas: { singular: 'cucharada',  plural: 'cucharadas' }
};

// Nombre visible de la unidad: singular si la cantidad es exactamente 1, plural en otro caso.
// Sin cantidad (p. ej. en el selector) devuelve el plural. Si la unidad no existe, la deja igual.
function nombreUnidad(unidad, cantidad) {
  const n = NOMBRES_UNIDAD[unidad];
  if (!n) return String(unidad);
  return cantidad === 1 ? n.singular : n.plural;
}

// "1 unidad", "4 unidades", "1.5 kilogramos", "1 libra", "250 gramos".
function formatoCantidad(cantidad, unidad) {
  return cantidad + ' ' + nombreUnidad(unidad, cantidad);
}

// 'YYYY-MM-DD' -> 'DD/MM/YYYY' (formato de fecha usado en Colombia). Si no es válida, la deja igual.
function formatoFecha(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso));
  return m ? m[3] + '/' + m[2] + '/' + m[1] : String(iso);
}

// Convierte una cantidad a la unidad base de su tipo: { tipo, valor }.
function aBase(cantidad, unidad) {
  const u = UNIDADES[unidad];
  return { tipo: u.tipo, valor: cantidad * u.factor };
}

// Convierte entre unidades del mismo tipo. Devuelve null si no son compatibles.
function convertir(cantidad, de, a) {
  if (!UNIDADES[de] || !UNIDADES[a] || UNIDADES[de].tipo !== UNIDADES[a].tipo) return null;
  return cantidad * UNIDADES[de].factor / UNIDADES[a].factor;
}

// Valida el texto del campo cantidad. Acepta punto o coma decimal.
// Devuelve { ok: true, valor } o { ok: false, error }.
function validarCantidad(texto) {
  const limpio = String(texto == null ? '' : texto).trim().replace(',', '.');
  if (limpio === '') return { ok: false, error: 'Escribe una cantidad.' };
  if (!/^-?\d+(\.\d+)?$/.test(limpio)) return { ok: false, error: 'La cantidad debe ser un número.' };
  const valor = Number(limpio);
  if (valor <= 0) return { ok: false, error: 'La cantidad debe ser mayor que 0.' };
  // Se guarda con 2 decimales: lo que redondeado queda en 0 (p. ej. 0.001) no es válido.
  const redondeado = redondear(valor);
  if (redondeado <= 0) return { ok: false, error: 'La cantidad mínima es 0.01.' };
  if (redondeado > CANTIDAD_MAXIMA) return { ok: false, error: 'La cantidad no puede ser mayor que ' + CANTIDAD_MAXIMA + '.' };
  return { ok: true, valor: redondeado };
}

/* ===================== Validación del formulario ===================== */

const ANOS_MAXIMOS = 5; // la fecha de vencimiento puede ser como máximo hoy + 5 años

// Hoy + 5 años como 'YYYY-MM-DD' (si hoy es 29 de febrero, pasa al 1 de marzo).
function fechaMaxima() {
  const [a, m, d] = hoyISO().split('-').map(Number);
  const f = new Date(a + ANOS_MAXIMOS, m - 1, d);
  return f.getFullYear() + '-' + dosDigitos(f.getMonth() + 1) + '-' + dosDigitos(f.getDate());
}

// true si 'YYYY-MM-DD' es una fecha que existe en el calendario (rechaza 2026-02-30).
function fechaReal(texto) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(texto))) return false;
  const [a, m, d] = texto.split('-').map(Number);
  const f = new Date(a, m - 1, d);
  return f.getFullYear() === a && f.getMonth() === m - 1 && f.getDate() === d;
}

// Valida la fecha de vencimiento. Se permiten fechas pasadas (van a Vencidos).
function validarFecha(texto) {
  if (!texto) return { ok: false, error: 'Elige la fecha de vencimiento.' };
  if (!fechaReal(texto)) return { ok: false, error: 'La fecha no es válida.' };
  if (texto > fechaMaxima()) {
    return { ok: false, error: 'La fecha no puede ser más de ' + ANOS_MAXIMOS + ' años después de hoy.' };
  }
  return { ok: true, valor: texto };
}

// Valida los datos del formulario (crudos, como texto). Una sola función para agregar y editar.
// Al agregar (editando = false) también revisa que el total tras fusionar no pase de 10000.
// Devuelve { ok, errores: { nombre?, cantidad?, unidad?, fecha? }, datos }.
function validarIngrediente(crudos, lista, editando) {
  const errores = {};
  const nombre = String(crudos.nombre == null ? '' : crudos.nombre).trim().replace(/\s+/g, ' ');
  if (nombre === '') errores.nombre = 'Escribe el nombre del ingrediente.';

  const cantidad = validarCantidad(crudos.cantidad);
  if (!cantidad.ok) errores.cantidad = cantidad.error;

  if (!crudos.unidad) errores.unidad = 'Elige una unidad.';
  else if (!UNIDADES[crudos.unidad]) errores.unidad = 'Unidad no permitida.';

  const fecha = validarFecha(crudos.vence);
  if (!fecha.ok) errores.fecha = fecha.error;

  const datos = { nombre, cantidad: cantidad.valor, unidad: crudos.unidad, vence: crudos.vence };

  if (Object.keys(errores).length === 0 && !editando) {
    const existente = buscarFusion(lista, datos);
    if (existente) {
      const total = redondear(existente.cantidad + convertir(datos.cantidad, datos.unidad, existente.unidad));
      if (total > CANTIDAD_MAXIMA) {
        errores.cantidad = 'Ya tienes ' + formatoCantidad(existente.cantidad, existente.unidad) + ' con esa fecha; ' +
          'el total (' + formatoCantidad(total, existente.unidad) + ') pasaría de ' + CANTIDAD_MAXIMA + '.';
      }
    }
  }

  return { ok: Object.keys(errores).length === 0, errores, datos };
}

/* ===================== Despensa ===================== */

function nuevoId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Despensa de ejemplo con fechas fijas a partir de hoy.
function crearSemilla() {
  const hoy = hoyISO();
  return SEMILLA.map(s => ({
    id: nuevoId(), nombre: s.nombre, cantidad: s.cantidad, unidad: s.unidad, vence: sumarDias(hoy, s.dias)
  }));
}

// Una fila sirve para las recetas y la fusión solo si tiene unidad conocida, fecha y cantidad válidas.
function filaValida(ing) {
  return Boolean(ing) && Boolean(UNIDADES[ing.unidad]) &&
    /^\d{4}-\d{2}-\d{2}$/.test(ing.vence) &&
    Number.isFinite(ing.cantidad) && ing.cantidad > 0;
}

// Ordena por fecha de vencimiento (más próxima primero); empate por nombre.
function ordenarPorVencimiento(lista) {
  return [...lista].sort((a, b) =>
    String(a.vence).localeCompare(String(b.vence)) || a.nombre.localeCompare(b.nombre, 'es'));
}

// Agotado: fila con cantidad 0 (quedó así al cocinar). No cuenta para recetas ni para el resumen.
function filaAgotada(ing) {
  return Boolean(ing) && ing.cantidad === 0 && Boolean(UNIDADES[ing.unidad]) && /^\d{4}-\d{2}-\d{2}$/.test(ing.vence);
}

// Separa la despensa ordenada en vigentes, vencidos y agotados (los agotados van aparte aunque estén vencidos).
function separarVencidos(lista) {
  const ordenada = ordenarPorVencimiento(lista);
  const conCantidad = ordenada.filter(ing => !filaAgotada(ing));
  return {
    vigentes: conCantidad.filter(ing => estadoDe(ing) !== 'vencido'),
    vencidos: conCantidad.filter(ing => estadoDe(ing) === 'vencido'),
    agotados: ordenada.filter(filaAgotada)
  };
}

// Fila existente con la que se fusionaría "nuevo" (mismo nombre, tipo de unidad y fecha), o null.
function buscarFusion(lista, nuevo) {
  if (!filaValida(nuevo)) return null;
  return lista.find(ing =>
    filaValida(ing) &&
    mismoNombre(ing.nombre, nuevo.nombre) &&
    UNIDADES[ing.unidad].tipo === UNIDADES[nuevo.unidad].tipo &&
    ing.vence === nuevo.vence) || null;
}

// Agrega "nuevo" a la lista (la modifica). Si existe uno con el mismo nombre, tipo de unidad y
// MISMA fecha, suma la cantidad convertida a la unidad existente. Solo fusiona filas válidas.
function agregarIngrediente(lista, nuevo) {
  const existente = buscarFusion(lista, nuevo);
  if (existente) {
    existente.cantidad = redondear(existente.cantidad + convertir(nuevo.cantidad, nuevo.unidad, existente.unidad));
    return existente;
  }
  const fila = { id: nuevoId(), ...nuevo };
  lista.push(fila);
  return fila;
}

/* ===================== Recetas ===================== */

// Compara una receta con la despensa. Para cada ingrediente suma (convertidas) todas las filas
// NO vencidas del mismo nombre y tipo de unidad.
// - disponible: alcanza.
// - parcial: está pero no alcanza; se usa lo que hay (decisión 13).
// - faltante: no está, solo vencido o unidad no compatible (con motivo).
function evaluarReceta(receta, lista) {
  const disponibles = [];
  const parciales = [];
  const faltantes = [];
  let presentes = 0;
  let diasUrgente = Infinity;
  let urgente = null;

  for (const req of receta.ingredientes) {
    const pedido = aBase(req.cantidad, req.unidad);
    const filas = lista.filter(ing => filaValida(ing) && mismoNombre(ing.nombre, req.nombre));
    const noVencidas = filas.filter(ing => diasPara(ing.vence) >= 0);
    const compatibles = noVencidas.filter(ing => UNIDADES[ing.unidad].tipo === pedido.tipo);

    if (compatibles.length === 0) {
      let motivo = 'no está';
      if (filas.length === 0 && lista.some(ing => filaAgotada(ing) && mismoNombre(ing.nombre, req.nombre))) motivo = 'agotado';
      else if (filas.length > 0 && noVencidas.length === 0) motivo = 'vencido';
      else if (noVencidas.length > 0) motivo = 'unidad no compatible';
      faltantes.push({ nombre: req.nombre, motivo });
      continue;
    }

    presentes++;
    const diasMin = Math.min(...compatibles.map(ing => diasPara(ing.vence)));
    if (diasMin < diasUrgente) { diasUrgente = diasMin; urgente = req.nombre; }

    const total = compatibles.reduce((suma, ing) => suma + aBase(ing.cantidad, ing.unidad).valor, 0);
    if (total + 1e-9 >= pedido.valor) {
      disponibles.push({ nombre: req.nombre, cantidad: req.cantidad, unidad: req.unidad });
    } else {
      const tiene = redondear(total / UNIDADES[req.unidad].factor); // en la unidad de la receta
      parciales.push({ nombre: req.nombre, tiene, pide: req.cantidad, unidad: req.unidad });
    }
  }

  return { receta, disponibles, parciales, faltantes, presentes, diasUrgente, urgente,
           usaProximo: diasUrgente <= DIAS_PROXIMO };
}

// Solo los faltantes de una receta.
function faltantesDe(receta, lista) {
  return evaluarReceta(receta, lista).faltantes;
}

// Recetas con al menos 1 ingrediente presente, ordenadas por: usa algún próximo a vencer,
// menos días del más urgente (solo entre las que usan próximos), menos faltantes, orden original.
function sugerirRecetas(lista, recetas = RECETAS) {
  return recetas
    .map(r => evaluarReceta(r, lista))
    .filter(ev => ev.presentes > 0)
    .sort((a, b) => {
      if (a.usaProximo !== b.usaProximo) return a.usaProximo ? -1 : 1;
      if (a.usaProximo && a.diasUrgente !== b.diasUrgente) return a.diasUrgente - b.diasUrgente;
      if (a.faltantes.length !== b.faltantes.length) return a.faltantes.length - b.faltantes.length;
      return a.receta.id - b.receta.id;
    });
}

// Resumen para la parte de arriba: cuántos vencen pronto (0 a 3 días), cuántos vencidos y
// cuántas recetas posibles (= las sugeridas: usan al menos 1 ingrediente disponible).
function resumen(lista, recetas = RECETAS) {
  const validas = lista.filter(filaValida);
  return {
    pronto: validas.filter(ing => estadoDe(ing) === 'proximo').length,
    vencidos: validas.filter(ing => estadoDe(ing) === 'vencido').length,
    recetas: sugerirRecetas(lista, recetas).length
  };
}

/* ===================== Cocinar receta (R8) ===================== */

// Filas que se pueden gastar para un ingrediente: válidas, no vencidas, mismo nombre y tipo de unidad,
// ordenadas por la que vence primero.
function filasParaUsar(lista, nombre, unidad) {
  const tipo = UNIDADES[unidad].tipo;
  return ordenarPorVencimiento(lista.filter(ing =>
    filaValida(ing) && diasPara(ing.vence) >= 0 &&
    mismoNombre(ing.nombre, nombre) && UNIDADES[ing.unidad].tipo === tipo));
}

// Datos para el modal de cocinar: por cada ingrediente de la receta, la cantidad sugerida, lo que
// hay disponible (en la unidad de la receta) y una cantidad usada inicial (la sugerida, o lo que haya).
// Solo se puede cocinar si la receta no tiene faltantes.
function prepararCocina(receta, lista) {
  const ev = evaluarReceta(receta, lista);
  const items = receta.ingredientes.map(req => {
    const base = filasParaUsar(lista, req.nombre, req.unidad)
      .reduce((s, ing) => s + aBase(ing.cantidad, ing.unidad).valor, 0);
    const disponible = redondear(base / UNIDADES[req.unidad].factor);
    return { nombre: req.nombre, unidad: req.unidad, sugerida: req.cantidad, disponible,
             usadaInicial: Math.min(req.cantidad, disponible) };
  });
  return { receta, items, puedeCocinar: ev.faltantes.length === 0, faltantes: ev.faltantes };
}

// Valida la "Cantidad usada" de un ingrediente: número de 0 a lo disponible (nunca deja negativos).
function validarUso(texto, disponible, unidad) {
  const limpio = String(texto == null ? '' : texto).trim().replace(',', '.');
  if (limpio === '') return { ok: false, error: 'Escribe la cantidad usada (0 si no usaste).' };
  if (!/^\d+(\.\d+)?$/.test(limpio)) return { ok: false, error: 'La cantidad usada debe ser un número de 0 o más.' };
  const valor = redondear(Number(limpio));
  if (valor > disponible + 1e-9) return { ok: false, error: 'Solo tienes ' + formatoCantidad(disponible, unidad) + '.' };
  return { ok: true, valor };
}

// Descuenta de la despensa lo usado (la modifica). usos: [{ nombre, cantidad, unidad }].
// Gasta primero la fila que vence antes, convierte unidades, nunca usa filas vencidas y nunca deja
// cantidades negativas: la fila que llega a 0 queda "Agotada". Devuelve lo que no se pudo descontar.
function cocinarReceta(lista, usos) {
  const sinDescontar = [];
  for (const uso of usos) {
    if (!(uso.cantidad > 0) || !UNIDADES[uso.unidad]) continue;
    let resta = aBase(uso.cantidad, uso.unidad).valor;
    for (const fila of filasParaUsar(lista, uso.nombre, uso.unidad)) {
      if (resta <= 1e-9) break;
      const factor = UNIDADES[fila.unidad].factor;
      const tomado = Math.min(fila.cantidad * factor, resta);
      const quedaBase = fila.cantidad * factor - tomado; // en g, ml o unidades
      const queda = quedaBase / factor;
      if (factor > 1 && Math.abs(redondear(queda) - queda) > 1e-9) {
        // Con 2 decimales no se guardaría exacto (1 l - 15 ml = 0.985 l): se pasa a la unidad base (985 ml).
        fila.unidad = UNIDAD_BASE[UNIDADES[fila.unidad].tipo];
        fila.cantidad = Math.max(0, redondear(quedaBase));
      } else {
        fila.cantidad = Math.max(0, redondear(queda));
      }
      resta -= tomado;
    }
    if (resta > 1e-9) sinDescontar.push({ nombre: uso.nombre, cantidad: redondear(resta / UNIDADES[uso.unidad].factor), unidad: uso.unidad });
  }
  return sinDescontar;
}

/* ===================== Lista de compras ===================== */

// true si hay algo de ese ingrediente que se pueda usar (válido y no vencido), en cualquier unidad.
function hayDisponible(lista, nombre) {
  return lista.some(ing => filaValida(ing) && diasPara(ing.vence) >= 0 && mismoNombre(ing.nombre, nombre));
}

// Genera la lista de compras (sin repetir ingredientes) a partir de:
//  a) agotados (cantidad 0), b) vencidos, c) faltantes de las recetas marcadas "Quiero hacerla"
//     (incluye lo que está pero no alcanza, con la cantidad que falta).
// Un agotado o vencido no entra si todavía hay ese ingrediente disponible.
// Si un ingrediente aparece por varios motivos, queda una sola línea con todos los motivos.
// Devuelve [{ nombre, motivos: [texto, ...] }] en el orden en que aparecen.
function generarListaCompras(lista, recetas = RECETAS, quiero = []) {
  const items = [];
  function sumar(nombre, motivo) {
    let item = items.find(it => mismoNombre(it.nombre, nombre));
    if (!item) { item = { nombre, motivos: [] }; items.push(item); }
    if (!item.motivos.includes(motivo)) item.motivos.push(motivo);
  }
  for (const ing of ordenarPorVencimiento(lista)) {
    if (filaAgotada(ing) && !hayDisponible(lista, ing.nombre)) sumar(ing.nombre, 'agotado');
    else if (filaValida(ing) && diasPara(ing.vence) < 0 && !hayDisponible(lista, ing.nombre)) sumar(ing.nombre, 'vencido');
  }
  for (const id of quiero) {
    const receta = recetas.find(r => r.id === id);
    if (!receta) continue;
    const ev = evaluarReceta(receta, lista);
    for (const f of ev.faltantes) sumar(f.nombre, 'para receta ' + receta.nombre);
    for (const p of ev.parciales) {
      const falta = redondear(p.pide - p.tiene);
      sumar(p.nombre, 'para receta ' + receta.nombre + ' (faltan ' + formatoCantidad(falta, p.unidad) + ')');
    }
  }
  return items;
}

// true si el ingrediente está marcado como comprado (comprados = nombres marcados).
function estaComprado(nombre, comprados) {
  return comprados.some(c => mismoNombre(c, nombre));
}

// Texto plano para copiar: SOLO lo pendiente (no comprado).
function textoListaCompras(items, comprados = []) {
  const pendientes = items.filter(it => !estaComprado(it.nombre, comprados));
  if (pendientes.length === 0) return '';
  return 'Lista de compras (Food Saver)\n' +
    pendientes.map(it => '- ' + it.nombre + ' (' + it.motivos.join('; ') + ')').join('\n');
}

/* ===================== Persistencia (parte pura) ===================== */

// Texto que se guarda en localStorage.
// compras: { quiero: [ids de recetas marcadas], comprados: [nombres marcados como comprados] }.
function serializar(ingredientes, recetas, compras = { quiero: [], comprados: [] }) {
  return JSON.stringify({ version: 1, ingredientes, recetas, quiero: compras.quiero, comprados: compras.comprados });
}

// Fila de despensa leída de localStorage: id y nombre de texto + filaValida (unidad, fecha, cantidad).
function filaGuardadaValida(i) {
  return Boolean(i) && typeof i.id === 'string' && typeof i.nombre === 'string' &&
    i.nombre.trim() !== '' && (filaValida(i) || filaAgotada(i));
}

// Receta leída de localStorage: nombre y preparación de texto, y cada ingrediente con
// nombre de texto, cantidad > 0 y unidad conocida.
function recetaValida(r) {
  return Boolean(r) && Number.isInteger(r.id) && typeof r.nombre === 'string' && typeof r.preparacion === 'string' &&
    Array.isArray(r.ingredientes) && r.ingredientes.length > 0 &&
    r.ingredientes.every(x => x && typeof x.nombre === 'string' &&
      Number.isFinite(x.cantidad) && x.cantidad > 0 && Boolean(UNIDADES[x.unidad]));
}

// Lee el texto guardado. Devuelve null si está dañado, o
// { ingredientes, recetas, descartados, recetasRestablecidas }:
// - descarta filas de despensa inválidas (las cuenta en "descartados");
// - si alguna receta guardada es inválida, usa las RECETAS predefinidas.
function deserializar(texto) {
  try {
    const datos = JSON.parse(texto);
    if (!datos || !Array.isArray(datos.ingredientes)) return null;
    const ingredientes = datos.ingredientes.filter(filaGuardadaValida);
    const recetasOk = Array.isArray(datos.recetas) && datos.recetas.length > 0 &&
      datos.recetas.every(recetaValida) &&
      new Set(datos.recetas.map(r => r.id)).size === datos.recetas.length; // ids únicos
    return {
      ingredientes,
      recetas: recetasOk ? datos.recetas : RECETAS,
      descartados: datos.ingredientes.length - ingredientes.length,
      recetasRestablecidas: !recetasOk,
      // Lista de compras: si faltan o están dañadas, quedan vacías (datos de versiones anteriores).
      quiero: Array.isArray(datos.quiero) ? datos.quiero.filter(id => Number.isInteger(id)) : [],
      comprados: Array.isArray(datos.comprados) ? datos.comprados.filter(n => typeof n === 'string') : []
    };
  } catch (e) {
    return null;
  }
}

/* ===================== Exportar para Node ===================== */

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    UNIDADES, UNIDAD_BASE, CLAVE, CANTIDAD_MAXIMA, DIAS_PROXIMO, RECETAS, SEMILLA,
    limpiarTexto, normalizar, formasNombre, mismoNombre,
    hoyISO, sumarDias, diasPara, estadoDe, textoVence,
    redondear, aBase, convertir, validarCantidad, NOMBRES_UNIDAD, nombreUnidad, formatoCantidad, formatoFecha,
    ANOS_MAXIMOS, fechaMaxima, fechaReal, validarFecha, validarIngrediente,
    nuevoId, crearSemilla, filaValida, filaAgotada, filasParaUsar, prepararCocina, validarUso, cocinarReceta, ordenarPorVencimiento, separarVencidos, buscarFusion, agregarIngrediente,
    evaluarReceta, faltantesDe, sugerirRecetas, resumen,
    hayDisponible, generarListaCompras, estaComprado, textoListaCompras,
    filaGuardadaValida, recetaValida, serializar, deserializar
  };
}
