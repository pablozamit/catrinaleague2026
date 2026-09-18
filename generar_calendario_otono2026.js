// Genera el calendario de la Liga Otono 2026 (formato Champions):
// 30 jugadores, 5 bombos x 6 por ELO. 5 jornadas, 15 partidos/jornada.
// Cada jugador: 1 vs propio bombo + 1 vs cada uno de los otros 4 = 5 partidos.
// Cada jornada: 1 bombo juega su derbi interno + los otros 4 se cruzan por parejas.
// Salida: js/fixtures-otono2026.js (const FIXTURES_OTONO2026) para las paginas web.
const fs = require('fs');
const path = require('path');

// Parejas que NO pueden enfrentarse en fase de grupos
const PROHIBIDOS = [['manuela', 'damian']];
function prohibida(a, b) {
    return PROHIBIDOS.some(([x, y]) => (a === x && b === y) || (a === y && b === x));
}

const PLAYERS = [
    // username firebase, nombre visible, elo
    ['amauris', 'Amauris', 1659],
    ['pablo', 'Pablo', 1641],
    ['sasa', 'Sasa', 1516],
    ['katee', 'Katee', 1451],
    ['joe', 'Joe', 1432],
    ['johnny', 'Johnny', 1428],
    ['florian', 'Florian', 1400],
    ['wilkins', 'Wilkins', 1400],
    ['connor', 'Conor', 1388],
    ['joel', 'Joël', 1359],
    ['alexf', 'Alex F.', 1354],
    ['charles', 'Charles', 1241],
    ['adri', 'Adri', 1228],
    ['enrique', 'Enrique', 1212],
    ['evodia', 'Evo', 1185],
    ['roman', 'Román', 1163],
    ['lucas', 'Lucas', 1128],
    ['nica', 'Veronika', 1100],
    ['dani', 'Dani', 1100],
    ['nino', 'Nino', 1027],
    ['ponci', 'Ponciano', 1003],
    ['aymar', 'Aymar', 1000],
    ['danilo', 'Danilo', 995],
    ['alexb', 'Alex B.', 987],
    ['sol', 'Sol', 983],
    ['favio', 'Fabio', 963],
    ['rauls', 'Raul S.', 961],
    ['manuela', 'Manuela', 931],
    ['angel', 'Angel', 1143],
    ['damian', 'Damian', 807],
];

// Sustituciones: el entrante hereda el hueco exacto del saliente (mismo calendario).
// (Evo sale sin haber jugado; Sergyo ocupa su slot aunque su ELO sea de otro bombo.)
const SUSTITUCIONES = { evodia: ['sergio', 'Sergio', 1372] };

// Ordenar por ELO desc y repartir en bombos A-E (6 por bombo)
const sorted = [...PLAYERS].sort((a, b) => b[2] - a[2]);
const POT_NAMES = ['A', 'B', 'C', 'D', 'E'];
const pots = { A: [], B: [], C: [], D: [], E: [] };
sorted.forEach((p, i) => pots[POT_NAMES[Math.floor(i / 6)]].push(p[0]));
// Anillo de derbis por bombo (respeta parejas prohibidas)
const anillos = Object.fromEntries(POT_NAMES.map(p => [p, ordenarAnillo(pots[p])]));

// Ordena el anillo del bombo evitando parejas prohibidas en ambas rondas de derbi
// (búsqueda exhaustiva: 6! = 720 permutaciones como máximo, primera válida)
function ordenarAnillo(jugadores) {
    const perms = permutar(jugadores);
    for (const orden of perms) {
        const pares = [
            [orden[0], orden[1]], [orden[2], orden[3]], [orden[4], orden[5]],
            [orden[1], orden[2]], [orden[3], orden[4]], [orden[5], orden[0]],
        ];
        if (!pares.some(([a, b]) => prohibida(a, b))) return orden;
    }
    throw new Error('No se pudo evitar pareja prohibida en bombo: ' + jugadores.join(','));
}

function permutar(arr) {
    if (arr.length <= 1) return [arr];
    const out = [];
    for (let i = 0; i < arr.length; i++) {
        const resto = [...arr.slice(0, i), ...arr.slice(i + 1)];
        for (const p of permutar(resto)) out.push([arr[i], ...p]);
    }
    return out;
}

// Derbis de bombo: anillo de 6 -> J1: (0-1,2-3,4-5), jornada libre: (1-2,3-4,5-0)
function intraMatches(potPlayers, round) {
    const p = potPlayers;
    if (round === 1) return [[p[0], p[1]], [p[2], p[3]], [p[4], p[5]]];
    return [[p[1], p[2]], [p[3], p[4]], [p[5], p[0]]];
}

// Cruce entre dos bombos: emparejamiento 1-a-1 (offset rotado para variar)
function crossMatches(potX, potY, offset) {
    const m = [];
    for (let i = 0; i < 6; i++) m.push([potX[i], potY[(i + offset) % 6]]);
    return m;
}

// Round-robin de bombos J1-J5 (cada pareja una vez; el libre juega su derbi)
const pairSchedule = {
    1: { pairs: [['B', 'C', 1], ['D', 'E', 0]], bye: 'A' },
    2: { pairs: [['A', 'D', 2], ['C', 'E', 1]], bye: 'B' },
    3: { pairs: [['A', 'E', 3], ['B', 'D', 2]], bye: 'C' },
    4: { pairs: [['A', 'B', 0], ['C', 'D', 3]], bye: 'E' },
    5: { pairs: [['A', 'C', 1], ['B', 'E', 0]], bye: 'D' },
};

const DATES = {
    1: '16 – 22 sep 2026',
    2: '23 – 29 sep 2026',
    3: '30 sep – 6 oct 2026',
    4: '7 – 13 oct 2026',
    5: '14 – 20 oct 2026',
};

const jornadas = {};
for (let j = 1; j <= 5; j++) {
    const matches = [];
    const s = pairSchedule[j];
    s.pairs.forEach(([x, y, off]) => {
        crossMatches(pots[x], pots[y], off).forEach(([a, b]) => matches.push({ p1: a, p2: b, tipo: 'cruce', bombos: x + '-' + y }));
    });
    intraMatches(anillos[s.bye], 1).forEach(([a, b]) => matches.push({ p1: a, p2: b, tipo: 'derbi', bombo: s.bye }));
    jornadas[j] = { fecha: DATES[j], partidos: matches };
}

// Verificacion: cada jugador juega exactamente 5 partidos (1 derbi + 4 cruces)
const count = {};
Object.values(jornadas).forEach(j => j.partidos.forEach(m => {
    count[m.p1] = (count[m.p1] || 0) + 1;
    count[m.p2] = (count[m.p2] || 0) + 1;
}));
const bad = Object.entries(count).filter(([, n]) => n !== 5);
if (bad.length) { console.error('ERROR jugadores con != 5 partidos:', bad); process.exit(1); }
console.log('OK: 30 jugadores x 5 partidos =', Object.values(jornadas).reduce((a, j) => a + j.partidos.length, 0), 'partidos en 5 jornadas');

// Aplicar sustituciones (el entrante hereda calendario, bombos y derbis del saliente)
for (const [sale, [entra]] of Object.entries(SUSTITUCIONES)) {
    for (const pot of POT_NAMES) {
        pots[pot] = pots[pot].map(u => u === sale ? entra : u);
        anillos[pot] = anillos[pot].map(u => u === sale ? entra : u);
    }
    Object.values(jornadas).forEach(J => J.partidos.forEach(m => {
        if (m.p1 === sale) m.p1 = entra;
        if (m.p2 === sale) m.p2 = entra;
    }));
}
const JUGADORES = Object.fromEntries(PLAYERS.map(([u, nombre, elo]) => [u, { nombre, elo }]));
for (const [sale, [entra, nombre, elo]] of Object.entries(SUSTITUCIONES)) {
    delete JUGADORES[sale];
    JUGADORES[entra] = { nombre, elo };
}

const meta = {
    temporada: 'Otoño 2026',
    formato: 'Champions: tabla unica, 5 bombos x 6, 5 jornadas',
    bombos: Object.fromEntries(POT_NAMES.map(p => [p, pots[p]])),
    jugadores: JUGADORES,
    jornadas,
    playoffs: {
        preliminar: '21 – 27 oct 2026 · puestos 9-24, sorteo, race to 3',
        octavos: '28 oct – 1 nov 2026 · top 8 + 8 ganadores preliminar, race to 5',
        cuartos: '4 – 8 nov 2026 · race to 5',
        semifinales: '11 – 15 nov 2026 · race to 7',
        final: '18 – 22 nov 2026 · race to 9',
    },
};

const out = '/* Generado por generar_calendario_otono2026.js — NO editar a mano */\nconst FIXTURES_OTONO2026 = ' + JSON.stringify(meta, null, 2) + ';\n';
fs.writeFileSync(path.join(__dirname, 'js', 'fixtures-otono2026.js'), out);
console.log('Escrito js/fixtures-otono2026.js');
