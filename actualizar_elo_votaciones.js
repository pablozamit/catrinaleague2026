/**
 * Actualización de ELO basada en votaciones
 * 
 * Categorías:
 * A: Jugadores habituales → ELO sin cambios
 * B: Jugadores poco habituales → 80% ELO Lab + 20% ELO Clásico
 * C: Jugadores sin partidos → 100% ELO Lab
 */

const admin = require('firebase-admin');
const serviceAccount = require('./elopool-f1e62-firebase-adminsdk-fbsvc-3154d48a46.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://elopool-f1e62-default-rtdb.europe-west1.firebasedatabase.app'
});

// ELO Lab Normalizado (del análisis de votaciones)
const eloLabData = {
    'johnny': 1729,
    'artur': 1705,
    'amauris': 1653,
    'fer': 1568,
    'jack': 1526,
    'pablo': 1521,
    'connor': 1509,
    'joel': 1495,
    'danilo': 1448,
    'sasa': 1443,
    'mina': 1429,
    'mo': 1424,
    'sergio': 1382,
    'alejandro b.': 1372,
    'carlos': 1363,
    'paul f.': 926,
    'sol': 912,
    'ruth': 879,
    'favio': 850,
    'manuela': 751
};

// Mapeo de nombres de Firebase a ELO Lab
const eloLabMap = {
    'johnny': 1729,
    'artur': 1705,
    'amauris': 1653,
    'fer': 1568,
    'jack': 1526,
    'pablo': 1521,
    'connor': 1509,
    'joel': 1495,
    'danilo': 1448,
    'sasa': 1443,
    'mina': 1429,
    'mo': 1424,
    'sergio': 1382,
    'alexb': 1372,      // Alejandro B.
    'charles': 1363,     // Carlos
    'paul': 926,
    'sol': 912,
    'ruth': 879,
    'favio': 850,
    'manuela': 751
};

// Clasificaciones: A, B o C
// A = 100% ELO actual (sin cambios)
// B = 80% ELO Lab + 20% ELO actual
// C = 100% ELO Lab

const clasificaciones = {
    // Categoría A (sin cambios)
    'artur': 'A',
    'johnny': 'A',
    'connor': 'A',
    'amauris': 'A',
    'fer': 'A',
    'jack': 'A',
    'pablo': 'A',
    'luke': 'A',
    'alvaro': 'A',
    'andres': 'A',
    'angels': 'A',
    'rauls': 'A',       // raul c.
    'charles': 'A',     // carlos
    'david': 'A',
    'oli': 'A',
    'jorge': 'A',
    'ed': 'A',
    'clint': 'A',
    'paddy': 'A',
    'pavlo': 'A',
    'ruairi': 'A',
    'maxim': 'A',
    'raul': 'A',
    'luis': 'A',
    'damian': 'A',
    'alexandre': 'A',
    
    // Categoría B (80% Lab + 20% Clásico)
    'angel': 'B',
    'mina': 'B',
    'roman': 'B',
    'evodia': 'B',
    
    // Categoría C (100% ELO Lab)
    'sergio': 'C',
    'joe': 'C',
    'joel': 'C',
    'danilo': 'C',
    'sasa': 'C',
    'jonathan': 'C',
    'erfan': 'C',
    'alexf': 'C',
    'katee': 'C',
    'nica': 'C',
    'adri': 'C',
    'paul': 'C',
    'josh': 'C',
    'melina': 'C',
    'karim': 'C',
    'mo': 'C',
    'manuela': 'C',
    'lucasc': 'C',
    'dennis': 'C',
    'andrea': 'C',
    'fede': 'C',
    'juanma': 'C',
    'nino': 'C',
    'vicent': 'C',
    'favio': 'C',
    'lucas': 'C',
    'sol': 'C',
    'ruth': 'C',
    'lydia': 'C'
};

// Calcular nuevo ELO
function calcularNuevoElo(username, eloActual, eloLab) {
    const categoria = clasificaciones[username.toLowerCase()];
    
    if (!categoria) {
        console.log(`⚠️ ${username}: Sin clasificación, se mantiene ELO`);
        return eloActual;
    }
    
    if (categoria === 'A') {
        console.log(`✓ ${username}: A → Sin cambios (${eloActual})`);
        return eloActual;
    }
    
    if (categoria === 'C') {
        const nuevoElo = eloLab || eloActual;
        console.log(`🔄 ${username}: C → 100% Lab (${nuevoElo})`);
        return nuevoElo;
    }
    
    if (categoria === 'B') {
        if (!eloLab) {
            console.log(`⚠️ ${username}: B → Sin ELO Lab, se mantiene ELO (${eloActual})`);
            return eloActual;
        }
        const nuevoElo = Math.round(eloLab * 0.8 + eloActual * 0.2);
        console.log(`🔄 ${username}: B → 80% Lab (${eloLab}) + 20% Actual (${eloActual}) = ${nuevoElo}`);
        return nuevoElo;
    }
    
    return eloActual;
}

async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('   ACTUALIZACIÓN DE ELO BASADA EN VOTACIONES');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    const snapshot = await admin.database().ref('users').once('value');
    const users = snapshot.val();
    
    if (!users) {
        console.log('❌ No se encontraron usuarios');
        process.exit(1);
    }
    
    console.log(`📊 Total usuarios: ${Object.keys(users).length}\n`);
    
    const updates = {};
    let countA = 0, countB = 0, countC = 0, countNoChange = 0;
    
    for (const [uid, userData] of Object.entries(users)) {
        const username = (userData.username || '').toLowerCase();
        const eloActual = userData.elo_rating || 1200;
        const eloLab = eloLabMap[username];
        const categoria = clasificaciones[username];
        
        if (!categoria) {
            console.log(`⚠️ ${userData.username}: Sin clasificación definida`);
            countNoChange++;
            continue;
        }
        
        const nuevoElo = calcularNuevoElo(username, eloActual, eloLab);
        
        if (nuevoElo !== eloActual) {
            updates[`users/${uid}/elo_rating`] = nuevoElo;
            updates[`users/${uid}/elo_source`] = categoria === 'A' ? 'real' : (categoria === 'B' ? 'mixed' : 'lab');
        }
        
        if (categoria === 'A') countA++;
        else if (categoria === 'B') countB++;
        else if (categoria === 'C') countC++;
    }
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('   RESUMEN');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📌 Categoría A (ELO real): ${countA}`);
    console.log(`📌 Categoría B (80% Lab + 20% Real): ${countB}`);
    console.log(`📌 Categoría C (100% ELO Lab): ${countC}`);
    console.log(`⚠️ Sin clasificación: ${countNoChange}`);
    console.log(`\n📝 Total actualizaciones: ${Object.keys(updates).length / 2}`);
    
    if (Object.keys(updates).length > 0) {
        console.log('\n¿Aplicar cambios a Firebase? (Escribe "si" para confirmar)');
        
        // Aplicar cambios directamente para automatización
        await admin.database().ref().update(updates);
        console.log('\n✅ Cambios aplicados correctamente a Firebase');
    }
    
    process.exit(0);
}

main().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
