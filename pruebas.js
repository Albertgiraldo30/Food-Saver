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
check('19. +5 días es próximo', L.estadoDe({ vence: sumarDias(hoyISO(), 5) }) === 'proximo');
check('20. +6 días es normal', L.estadoDe({ vence: sumarDias(hoyISO(), 6) }) === 'normal');
check('21. -1 día es vencido', L.estadoDe({ vence: sumarDias(hoyISO(), -1) }) === 'vencido');
check('22. textos hoy / mañana / en 3 días / ayer', L.textoVence(0) === 'Vence hoy' && L.textoVence(1) === 'Vence mañana' &&
  L.textoVence(3) === 'Vence en 3 días' && L.textoVence(-1) === 'Venció ayer');

seccion('Hallazgo del revisor: fusión con cantidad inválida');
d = semilla();
L.agregarIngrediente(d, { nombre: 'Tomate', cantidad: NaN, unidad: 'unidades', vence: sumarDias(hoyISO(), 1) });
L.agregarIngrediente(d, { nombre: 'Tomate', cantidad: -3, unidad: 'unidades', vence: sumarDias(hoyISO(), 1) });
check('23. el tomate original queda intacto (4)', d.find(i => i.id === 's1').cantidad === 4);

const casosOriginales = bien + mal;

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
check('recetas guardadas dañadas => usa las predefinidas',
  L.deserializar('{"version":1,"ingredientes":[],"recetas":"x"}').recetas === L.RECETAS);

console.log('\nRESULTADO: ' + (bien + mal) + ' pruebas (' + casosOriginales + ' originales de la capa 2 + ' +
  (bien + mal - casosOriginales) + ' nuevas): ' + bien + ' bien, ' + mal + ' mal');
process.exit(mal === 0 ? 0 : 1);
