// Pruebas de logica.js. Ejecutar con:  node pruebas.js
const L = require('./logica.js');
const { hoyISO, sumarDias, mismoNombre } = L;

let bien = 0;
let mal = 0;
let grupo = '';

function seccion(nombre) { grupo = nombre; console.log('\n--- ' + nombre + ' ---'); }
function check(nombre, condicion) {
  if (condicion) { bien++; console.log('  OK    ' + nombre); }
  else { mal++; console.log('  FALLA ' + nombre); }
}

// Despensa de ejemplo con ids fijos para poder buscarlos.
function semilla() {
  return L.SEMILLA.map((s, i) => ({
    id: 's' + i, nombre: s.nombre, cantidad: s.cantidad, unidad: s.unidad, vence: sumarDias(hoyISO(), s.dias)
  }));
}
const filasDe = (lista, nombre) => lista.filter(i => mismoNombre(i.nombre, nombre));
const nombres = evs => evs.map(e => e.receta.nombre);

/* ============ Los 23 casos de la capa 2 ============ */

seccion('Orden de recetas con la despensa de ejemplo (tabla del PLAN)');
check('1. orden exacto de la tabla', JSON.stringify(nombres(L.sugerirRecetas(semilla()))) === JSON.stringify([
  'Huevos pericos', 'Pasta con salsa de tomate', 'Ensalada de aguacate', 'Batido de banano',
  'Arroz con pollo', 'Papas con huevo', 'Sopa de verduras']));

seccion('Flujo de la demo: aguacate hoy + limón ayer');
let d = semilla();
L.agregarIngrediente(d, { nombre: 'aguacate', cantidad: 1, unidad: 'unidades', vence: hoyISO() });
L.agregarIngrediente(d, { nombre: 'limón', cantidad: 2, unidad: 'unidades', vence: sumarDias(hoyISO(), -1) });
const primera = L.sugerirRecetas(d)[0];
check('2. la primera es Ensalada de aguacate', primera.receta.nombre === 'Ensalada de aguacate');
check('3. solo falta limón (vencido)', primera.faltantes.length === 1 &&
  primera.faltantes[0].nombre === 'limón' && primera.faltantes[0].motivo === 'vencido');

seccion('Fusión al agregar');
d = semilla();
L.agregarIngrediente(d, { nombre: 'Tomates', cantidad: 2, unidad: 'unidades', vence: sumarDias(hoyISO(), 1) });
check('4. "Tomates" misma fecha => una fila de 6', filasDe(d, 'tomate').length === 1 && d.find(i => i.id === 's1').cantidad === 6);
L.agregarIngrediente(d, { nombre: 'arroz', cantidad: 500, unidad: 'g', vence: sumarDias(hoyISO(), 180) });
check('5. arroz 500 g => 1.5 kg', d.find(i => i.nombre === 'Arroz').cantidad === 1.5);
L.agregarIngrediente(d, { nombre: 'tomate', cantidad: 2, unidad: 'unidades', vence: sumarDias(hoyISO(), 10) });
check('6. tomate con otra fecha => fila nueva', filasDe(d, 'tomate').length === 2);
const antes = JSON.stringify(nombres(L.sugerirRecetas(d)));
L.agregarIngrediente(d, { nombre: 'tomate', cantidad: 200, unidad: 'g', vence: sumarDias(hoyISO(), 1) });
check('7. tomate en gramos => fila aparte', filasDe(d, 'tomate').length === 3);
check('8. tomate en gramos no cambia las recetas', JSON.stringify(nombres(L.sugerirRecetas(d))) === antes);
L.agregarIngrediente(d, { nombre: 'Queso', cantidad: 100, unidad: 'g', vence: hoyISO() });
check('9. queso fresco no se fusiona con el vencido', filasDe(d, 'queso').length === 2);
L.agregarIngrediente(d, { nombre: 'Limones', cantidad: 1, unidad: 'unidades', vence: hoyISO() });
L.agregarIngrediente(d, { nombre: 'limón', cantidad: 1, unidad: 'unidades', vence: hoyISO() });
check('10. "Limones" + "limón" misma fecha => una fila', filasDe(d, 'limon').length === 1);

seccion('Ingrediente que no alcanza: se usa lo que hay (decisión 13)');
d = [{ id: 'x', nombre: 'Tomate', cantidad: 1, unidad: 'unidades', vence: sumarDias(hoyISO(), 1) }];
const pasta = L.sugerirRecetas(d).find(e => e.receta.nombre === 'Pasta con salsa de tomate');
check('11. la pasta se muestra', Boolean(pasta));
check('12. tomate parcial "1 de 3", no faltante', pasta && !pasta.faltantes.some(f => f.nombre === 'tomate') &&
  pasta.parciales.length === 1 && pasta.parciales[0].tiene === 1 && pasta.parciales[0].pide === 3);
check('13. cuenta para la urgencia (1 día)', pasta && pasta.usaProximo && pasta.diasUrgente === 1);

seccion('Conversiones en recetas');
const leche = n => [
  { id: 'l', nombre: 'leche', cantidad: n, unidad: 'tazas', vence: sumarDias(hoyISO(), 3) },
  { id: 'b', nombre: 'banano', cantidad: 2, unidad: 'unidades', vence: sumarDias(hoyISO(), 3) }];
const batido = lista => L.sugerirRecetas(lista).find(e => e.receta.nombre === 'Batido de banano');
const p = batido(leche(1)).parciales[0];
check('14. 1 taza frente a 500 ml => "240 de 500 ml"', p && p.nombre === 'leche' && p.tiene === 240 && p.pide === 500 && p.unidad === 'ml');
check('15. 3 tazas alcanzan para 500 ml', batido(leche(3)).faltantes.length === 0 && batido(leche(3)).parciales.length === 0);
const aceite = [
  { id: 'a', nombre: 'aceite', cantidad: 2, unidad: 'cucharadas', vence: sumarDias(hoyISO(), 30) },
  { id: 'p', nombre: 'papa', cantidad: 4, unidad: 'unidades', vence: sumarDias(hoyISO(), 30) },
  { id: 'h', nombre: 'huevo', cantidad: 2, unidad: 'unidades', vence: sumarDias(hoyISO(), 30) }];
check('16. 2 cucharadas alcanzan para 30 ml', L.sugerirRecetas(aceite).find(e => e.receta.nombre === 'Papas con huevo').faltantes.length === 0);

seccion('Fila incompleta no rompe las recetas');
d = semilla().concat([{ id: 'v', nombre: '', cantidad: 0, unidad: '', vence: '' }]);
let rompio = false;
try { L.sugerirRecetas(d); } catch (e) { rompio = true; }
check('17. una fila vacía no lanza error', !rompio);

seccion('Estados y textos de vencimiento');
check('18. hoy es próximo', L.estadoDe({ vence: hoyISO() }) === 'proximo');
check('19. +3 días es próximo (límite, decisión 17)', L.estadoDe({ vence: sumarDias(hoyISO(), 3) }) === 'proximo');
check('20. +4 días es normal (verde)', L.estadoDe({ vence: sumarDias(hoyISO(), 4) }) === 'normal');
check('21. -1 día es vencido', L.estadoDe({ vence: sumarDias(hoyISO(), -1) }) === 'vencido');
check('22. textos hoy / mañana / en 3 días / ayer', L.textoVence(0) === 'Vence hoy' && L.textoVence(1) === 'Vence mañana' &&
  L.textoVence(3) === 'Vence en 3 días' && L.textoVence(-1) === 'Venció ayer');

seccion('Hallazgo del revisor: fusión con cantidad inválida');
d = semilla();
L.agregarIngrediente(d, { nombre: 'Tomate', cantidad: NaN, unidad: 'unidades', vence: sumarDias(hoyISO(), 1) });
L.agregarIngrediente(d, { nombre: 'Tomate', cantidad: -3, unidad: 'unidades', vence: sumarDias(hoyISO(), 1) });
check('23. el tomate original queda intacto (4)', d.find(i => i.id === 's1').cantidad === 4);

const casosOriginales = bien + mal;

seccion('Decisión 17: próximo = 0 a 3 días');
check('decisión 17: receta con ingrediente a 4 días no es urgente', (() => {
  const ev = L.evaluarReceta(L.RECETAS[5], [
    { id: 'b', nombre: 'banano', cantidad: 2, unidad: 'unidades', vence: sumarDias(hoyISO(), 4) },
    { id: 'l', nombre: 'leche', cantidad: 1, unidad: 'l', vence: sumarDias(hoyISO(), 4) }]);
  return !ev.usaProximo; })());

/* ============ Casos nuevos de logica.js ============ */

seccion('Nombres');
check('normalizar("  TomátES ") = "tomate"', L.normalizar('  TomátES ') === 'tomate');
check('mismoNombre: tomate / papa = false', !mismoNombre('tomate', 'papa'));

seccion('validarCantidad (regla de CLAUDE.md)');
const v = t => L.validarCantidad(t);
check('vacío => error', !v('').ok);
check('0 => error', !v('0').ok);
check('-3 => error', !v('-3').ok);
check('abc => error', !v('abc').ok);
check('1e3 => error', !v('1e3').ok);
check('10001 => error', !v('10001').ok);
check('10000 => válido', v('10000').ok && v('10000').valor === 10000);
check('0.5 => válido', v('0.5').ok && v('0.5').valor === 0.5);
check('"1,5" => 1.5', v('1,5').ok && v('1,5').valor === 1.5);
check('revisor 4: 0.001 => error (redondeado sería 0)', !v('0.001').ok && v('0.001').error === 'La cantidad mínima es 0.01.');
check('revisor 4: 0.004 => error', !v('0.004').ok);
check('revisor 4: 0.005 => 0.01 (válido)', v('0.005').ok && v('0.005').valor === 0.01);
check('revisor 4: 0.01 => válido', v('0.01').ok && v('0.01').valor === 0.01);

seccion('Capa 4: validarIngrediente y validarFecha');
const ok = { nombre: 'Yogur', cantidad: '2', unidad: 'unidades', vence: sumarDias(hoyISO(), 3) };
const vi = (cambios, lista = [], editando = false) => L.validarIngrediente({ ...ok, ...cambios }, lista, editando);
check('datos correctos => ok', vi({}).ok);
const vacio = L.validarIngrediente({ nombre: '', cantidad: '', unidad: '', vence: '' }, [], false);
check('formulario vacío => 4 errores', !vacio.ok && Object.keys(vacio.errores).length === 4);
check('nombre solo con espacios => error de nombre', vi({ nombre: '   ' }).errores.nombre !== undefined);
check('nombre se guarda sin espacios sobrantes', vi({ nombre: '  Pan   de  yuca ' }).datos.nombre === 'Pan de yuca');
check('cantidad "-2" => error de cantidad', vi({ cantidad: '-2' }).errores.cantidad !== undefined);
check('cantidad "1,5" => 1.5', vi({ cantidad: '1,5' }).datos.cantidad === 1.5);
check('unidad "zz" => error de unidad', vi({ unidad: 'zz' }).errores.unidad !== undefined);
check('fecha pasada => válida (va a Vencidos)', vi({ vence: sumarDias(hoyISO(), -1) }).ok);
check('fecha = hoy + 5 años => válida', vi({ vence: L.fechaMaxima() }).ok);
check('fecha = hoy + 5 años + 1 día => error', vi({ vence: sumarDias(L.fechaMaxima(), 1) }).errores.fecha !== undefined);
check('fecha 2026-02-30 => error (no existe)', !L.validarFecha('2026-02-30').ok);
check('fecha vacía => error', !L.validarFecha('').ok);
check('nombre <b> se acepta como texto', vi({ nombre: '<b>Pan</b>' }).ok);
const conArroz = [{ id: 'r', nombre: 'Arroz', cantidad: 1, unidad: 'kg', vence: sumarDias(hoyISO(), 180) }];
check('tope tras fusionar: arroz 9999.5 kg + 1 kg => error',
  vi({ nombre: 'arroz', cantidad: '9999.5', unidad: 'kg', vence: sumarDias(hoyISO(), 180) }, conArroz).errores.cantidad !== undefined);
check('tope tras fusionar: arroz 9999 kg + 1 kg = 10000 => válido',
  vi({ nombre: 'arroz', cantidad: '9999', unidad: 'kg', vence: sumarDias(hoyISO(), 180) }, conArroz).ok);
check('al editar no se revisa el tope de fusión',
  vi({ nombre: 'arroz', cantidad: '9999.5', unidad: 'kg', vence: sumarDias(hoyISO(), 180) }, conArroz, true).ok);
check('con otra fecha no hay fusión ni tope',
  vi({ nombre: 'arroz', cantidad: '9999.5', unidad: 'kg', vence: sumarDias(hoyISO(), 10) }, conArroz).ok);

seccion('Capa 5: formato para la pantalla');
check('1 unidades => "1 unidad"', L.formatoCantidad(1, 'unidades') === '1 unidad');
check('4 unidades se queda en plural', L.formatoCantidad(4, 'unidades') === '4 unidades');
check('1 tazas => "1 taza", 1 cucharadas => "1 cucharada", 1 libras => "1 libra"',
  L.formatoCantidad(1, 'tazas') === '1 taza' && L.formatoCantidad(1, 'cucharadas') === '1 cucharada' &&
  L.formatoCantidad(1, 'libras') === '1 libra');
check('nombres completos: 1.5 kg => "1.5 kilogramos", 1 l => "1 litro"', L.formatoCantidad(1.5, 'kg') === '1.5 kilogramos' && L.formatoCantidad(1, 'l') === '1 litro');
check('NOMBRES_UNIDAD: "1 libra", "250 gramos", "1 mililitro", "2 cucharadas"',
  L.formatoCantidad(1, 'libras') === '1 libra' && L.formatoCantidad(250, 'g') === '250 gramos' &&
  L.formatoCantidad(1, 'ml') === '1 mililitro' && L.formatoCantidad(2, 'cucharadas') === '2 cucharadas');
check('NOMBRES_UNIDAD cubre todas las unidades y no cambia los valores internos',
  Object.keys(L.NOMBRES_UNIDAD).join() === Object.keys(L.UNIDADES).join() &&
  Object.keys(L.UNIDADES).join() === 'unidades,g,kg,libras,ml,l,tazas,cucharadas');
check('fecha 2026-11-12 => 12/11/2026', L.formatoFecha('2026-11-12') === '12/11/2026');

seccion('Restaurar datos de ejemplo (crearSemilla)');
const restaurada = L.crearSemilla();
check('restaurar => 11 ingredientes con ids distintos', restaurada.length === 11 &&
  new Set(restaurada.map(i => i.id)).size === 11);
check('restaurar => fechas relativas a hoy (Tomate mañana, Queso ayer)',
  restaurada.find(i => i.nombre === 'Tomate').vence === sumarDias(hoyISO(), 1) &&
  restaurada.find(i => i.nombre === 'Queso').vence === sumarDias(hoyISO(), -1));
check('restaurar => todas las filas son válidas al guardar y leer',
  L.deserializar(L.serializar(restaurada, L.RECETAS)).descartados === 0);

seccion('Resumen de arriba');
const rs = L.resumen(semilla());
check('ejemplo => 4 vencen pronto, 1 vencido, 7 recetas', rs.pronto === 4 && rs.vencidos === 1 && rs.recetas === 7);
const r0 = L.resumen([]);
check('despensa vacía => 0, 0, 0', r0.pronto === 0 && r0.vencidos === 0 && r0.recetas === 0);
const rDemo = semilla(); L.agregarIngrediente(rDemo, { nombre: 'aguacate', cantidad: 1, unidad: 'unidades', vence: hoyISO() });
L.agregarIngrediente(rDemo, { nombre: 'limón', cantidad: 2, unidad: 'unidades', vence: sumarDias(hoyISO(), -1) });
const rd = L.resumen(rDemo);
check('demo (aguacate hoy, limón ayer) => 5 pronto, 2 vencidos, 7 recetas', rd.pronto === 5 && rd.vencidos === 2 && rd.recetas === 7);

seccion('convertir');
check('1 kg = 1000 g', L.convertir(1, 'kg', 'g') === 1000);
check('1 libra = 500 g', L.convertir(1, 'libras', 'g') === 500);
check('2 tazas = 480 ml', L.convertir(2, 'tazas', 'ml') === 480);
check('g a ml => null (no compatibles)', L.convertir(1, 'g', 'ml') === null);

seccion('Ordenar y separar vencidos');
const sep = L.separarVencidos(semilla());
check('vencidos = solo Queso', sep.vencidos.length === 1 && sep.vencidos[0].nombre === 'Queso');
check('vigentes = 10, primero Tomate y último Arroz', sep.vigentes.length === 10 &&
  sep.vigentes[0].nombre === 'Tomate' && sep.vigentes[9].nombre === 'Arroz');
check('empate de fecha se ordena por nombre (Leche antes que Pechuga)',
  sep.vigentes[1].nombre === 'Leche' && sep.vigentes[2].nombre === 'Pechuga de pollo');

seccion('faltantesDe');
check('Sopa de verduras: faltan zanahoria y arveja',
  JSON.stringify(L.faltantesDe(L.RECETAS[4], semilla()).map(f => f.nombre)) === JSON.stringify(['zanahoria', 'arveja']));

seccion('Persistencia (parte pura)');
const guardado = L.serializar(semilla(), L.RECETAS);
const leido = L.deserializar(guardado);
check('serializar + deserializar conserva la despensa', leido && JSON.stringify(leido.ingredientes) === JSON.stringify(semilla()));
check('serializar + deserializar conserva las recetas', leido && JSON.stringify(leido.recetas) === JSON.stringify(L.RECETAS));
check('despensa vacía guardada sigue vacía', L.deserializar(L.serializar([], L.RECETAS)).ingredientes.length === 0);
check('JSON dañado "{" => null', L.deserializar('{') === null);
check('JSON sin ingredientes => null', L.deserializar('{"version":1}') === null);
check('filas sin id o sin nombre se descartan al leer',
  L.deserializar('{"version":1,"ingredientes":[null,{"nombre":"x"},{"id":"a"},' +
    '{"id":"b","nombre":"Tomate","cantidad":1,"unidad":"unidades","vence":"2026-01-01"}]}').ingredientes.length === 1);
const conInvalidas = L.deserializar(JSON.stringify({ version: 1, ingredientes: [
  { id: 'a', nombre: 'X', cantidad: null, unidad: 'g', vence: '2026-01-01' },
  { id: 'b', nombre: 'Y', cantidad: 1, unidad: 'zz', vence: '2026-01-01' },
  { id: 'c', nombre: 'Z', cantidad: 1, unidad: 'g', vence: '' },
  { id: 'd', nombre: 'Ok', cantidad: 1, unidad: 'g', vence: '2026-01-01' }] }));
check('revisor 3: filas con cantidad/unidad/fecha inválidas se descartan y se cuentan',
  conInvalidas.ingredientes.length === 1 && conInvalidas.descartados === 3);
const recetaRota = '{"version":1,"ingredientes":[],"recetas":[{"nombre":"r","preparacion":"p",' +
  '"ingredientes":[{"nombre":"x","cantidad":1,"unidad":"zz"}]}]}';
check('revisor 3: receta guardada con unidad desconocida => predefinidas',
  L.deserializar(recetaRota).recetas === L.RECETAS && L.deserializar(recetaRota).recetasRestablecidas);
check('revisor 3: receta guardada sin preparación => predefinidas',
  L.deserializar('{"version":1,"ingredientes":[],"recetas":[{"nombre":"r","ingredientes":[{"nombre":"x","cantidad":1,"unidad":"g"}]}]}')
    .recetas === L.RECETAS);
check('recetas guardadas válidas se respetan',
  L.deserializar(L.serializar([], [L.RECETAS[0]])).recetas.length === 1);
check('recetas guardadas dañadas => usa las predefinidas',
  L.deserializar('{"version":1,"ingredientes":[],"recetas":"x"}').recetas === L.RECETAS);

console.log('\nRESULTADO: ' + (bien + mal) + ' pruebas (' + casosOriginales + ' originales de la capa 2 + ' +
  (bien + mal - casosOriginales) + ' nuevas): ' + bien + ' bien, ' + mal + ' mal');
process.exit(mal === 0 ? 0 : 1);
