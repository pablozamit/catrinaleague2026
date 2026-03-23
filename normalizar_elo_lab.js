/**
 * Normalización de ELO Laboratorio
 * 
 * Convierte los valores de ELO Lab para que el máximo sea igual al ELO Real máximo (1729)
 * Fórmula: ELO_Lab_Normalizado = 1729 × (ELO_Lab - 1200) / (ELO_Lab_Máximo - 1200) + 1200
 */

// Datos originales del ELO Laboratorio (del análisis de 2,510 votos)
const eloLabData = [
    { nombre: "Johnny", eloActual: 1672, eloLab: 4784 },
    { nombre: "ARTUR", eloActual: 1729, eloLab: 4624 },
    { nombre: "Amauris", eloActual: 1587, eloLab: 4272 },
    { nombre: "Fer", eloActual: 1507, eloLab: 3696 },
    { nombre: "Jack", eloActual: 1452, eloLab: 3408 },
    { nombre: "Pablo", eloActual: 1415, eloLab: 3376 },
    { nombre: "Conor", eloActual: 1599, eloLab: 3296 },
    { nombre: "Joël", eloActual: 1200, eloLab: 3200 },
    { nombre: "Danilo", eloActual: 1200, eloLab: 2880 },
    { nombre: "Sasa", eloActual: 1374, eloLab: 2848 },
    { nombre: "Mina", eloActual: 1200, eloLab: 2752 },
    { nombre: "Mo", eloActual: 1321, eloLab: 2720 },
    { nombre: "Manuel", eloActual: 1200, eloLab: 2624 },
    { nombre: "Jose", eloActual: 1200, eloLab: 2560 },
    { nombre: "Alejandro M.", eloActual: 1200, eloLab: 2496 },
    { nombre: "Sergio L.", eloActual: 1360, eloLab: 2432 },
    { nombre: "Alejandro B.", eloActual: 1354, eloLab: 2368 },
    { nombre: "Manuela", eloActual: 1200, eloLab: -1840 },
    { nombre: "Favius", eloActual: 949, eloLab: -1168 },
    { nombre: "Paul F.", eloActual: 1228, eloLab: -656 },
    { nombre: "Ruth", eloActual: 813, eloLab: -976 },
    { nombre: "Sol", eloActual: 897, eloLab: -752 },
    { nombre: "Carlos", eloActual: 1294, eloLab: 2304 },
    { nombre: "Pau", eloActual: 1200, eloLab: 2208 },
    { nombre: "Javi", eloActual: 1200, eloLab: 2144 },
    { nombre: "Sergio", eloActual: 1200, eloLab: 2080 },
    { nombre: "Victor", eloActual: 1200, eloLab: 1920 },
    { nombre: "Tono", eloActual: 1200, eloLab: 1856 },
    { nombre: "Jorge", eloActual: 1200, eloLab: 1792 },
    { nombre: "Dani", eloActual: 1200, eloLab: 1728 },
];

// Constantes de normalización
const ELO_REAL_MAXIMO = 1729; // ELO máximo real (ARTUR)
const ELO_LAB_MAXIMO_ACTUAL = 4784; // ELO Lab máximo actual (Johnny)
const ELO_BASE = 1200;

// Factor de normalización
const factor = (ELO_REAL_MAXIMO - ELO_BASE) / (ELO_LAB_MAXIMO_ACTUAL - ELO_BASE);

console.log("═══════════════════════════════════════════════════════════");
console.log("   NORMALIZACIÓN DE ELO LABORATORIO");
console.log("═══════════════════════════════════════════════════════════\n");

console.log(`ELO Real Máximo (referencia): ${ELO_REAL_MAXIMO}`);
console.log(`ELO Lab Máximo Actual: ${ELO_LAB_MAXIMO_ACTUAL}`);
console.log(`Factor de Normalización: ${factor.toFixed(4)} (${(factor * 100).toFixed(2)}%)\n`);

// Función de normalización
function normalizarEloLab(eloLab) {
    if (eloLab < ELO_BASE) {
        // Para valores negativos, calcular cómo se distribuyen bajo la base
        const rangoNegativo = ELO_LAB_MAXIMO_ACTUAL - ELO_BASE;
        const proporcionNegativa = (ELO_BASE - eloLab) / rangoNegativo;
        return Math.round(ELO_BASE - (proporcionNegativa * (ELO_REAL_MAXIMO - ELO_BASE)));
    }
    return Math.round(ELO_BASE + (eloLab - ELO_BASE) * factor);
}

// Calcular ELOs normalizados
const datosNormalizados = eloLabData.map(d => ({
    ...d,
    eloLabNormalizado: normalizarEloLab(d.eloLab)
}));

// Ordenar por ELO Lab normalizado descendente
datosNormalizados.sort((a, b) => b.eloLabNormalizado - a.eloLabNormalizado);

// Mostrar tabla
console.log("╔══════════════════════════════════════════════════════════════════╗");
console.log("║                    RANKING ELO LAB NORMALIZADO                    ║");
console.log("╠════╦══════════════════╦══════════╦══════════╦════════════════════╣");
console.log("║ #  ║ Jugador           ║ ELO Real ║ ELO Lab  ║ ELO Lab Normalizado║");
console.log("╠════╬══════════════════╬══════════╬══════════╬════════════════════╣");

datosNormalizados.forEach((d, i) => {
    const pos = String(i + 1).padStart(2, ' ');
    const nombre = d.nombre.padEnd(17, ' ');
    const eloReal = String(d.eloActual).padStart(8, ' ');
    const eloLab = String(d.eloLab).padStart(8, ' ');
    const eloLabNorm = String(d.eloLabNormalizado).padStart(18, ' ');
    
    console.log(`║${pos} ║ ${nombre} ║${eloReal} ║${eloLab} ║${eloLabNorm} ║`);
});

console.log("╚════╩══════════════════╩══════════╩══════════╩════════════════════╝\n");

// Verificar que el máximo sea correcto
const maxLabNormalizado = Math.max(...datosNormalizados.map(d => d.eloLabNormalizado));
console.log(`✓ Máximo ELO Lab Normalizado: ${maxLabNormalizado}`);
console.log(`✓ Mínimo ELO Lab Normalizado: ${Math.min(...datosNormalizados.map(d => d.eloLabNormalizado))}`);

// Top 5 comparativa
console.log("\n═══════════════════════════════════════════════════════════");
console.log("   TOP 5 COMPARATIVA");
console.log("═══════════════════════════════════════════════════════════\n");

console.log("╔════╦══════════════════╦══════════╦════════════════════╗");
console.log("║ #  ║ Jugador           ║ ELO Real ║ ELO Lab Normalizado║");
console.log("╠════╬══════════════════╬══════════╬════════════════════╣");

datosNormalizados.slice(0, 5).forEach((d, i) => {
    const pos = String(i + 1).padStart(2, ' ');
    const nombre = d.nombre.padEnd(17, ' ');
    const eloReal = String(d.eloActual).padStart(8, ' ');
    const eloLabNorm = String(d.eloLabNormalizado).padStart(18, ' ');
    
    console.log(`║${pos} ║ ${nombre} ║${eloReal} ║${eloLabNorm} ║`);
});

console.log("╚════╩══════════════════╩══════════╩════════════════════╝\n");

// Generar datos para Firebase
console.log("═══════════════════════════════════════════════════════════");
console.log("   DATOS PARA FIREBASE");
console.log("═══════════════════════════════════════════════════════════\n");

const firebaseData = {};
datosNormalizados.forEach(d => {
    firebaseData[d.nombre] = {
        elo_lab: d.eloLab,
        elo_lab_normalizado: d.eloLabNormalizado,
        elo_real: d.eloActual,
        diferencia: d.eloLabNormalizado - d.eloActual
    };
});

console.log("JSON para copiar a Firebase:");
console.log(JSON.stringify(firebaseData, null, 2));

// Exportar para uso posterior
module.exports = {
    datosNormalizados,
    firebaseData,
    factor,
    normalizarEloLab
};
