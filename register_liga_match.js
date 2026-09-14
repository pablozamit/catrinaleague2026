const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Determine path to service account
let saPath = path.join(__dirname, 'elopool-f1e62-firebase-adminsdk-fbsvc-3154d48a46.json');
if (!fs.existsSync(saPath)) {
    saPath = path.join(__dirname, '..', 'elopool-f1e62-firebase-adminsdk-fbsvc-3154d48a46.json');
}

const serviceAccount = require(saPath);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://elopool-f1e62-default-rtdb.europe-west1.firebasedatabase.app'
});

const database = admin.database();

/**
 * Registra un partido de la liga.
 * 
 * Reglas:
 * - Carrera a 5 juegos (el primero en llegar a 3 gana).
 * - Victoria = 3 pts
 * - Derrota = 0 pts (salvo que sea 3-2, en cuyo caso Perdedor gana 1 punto de mérito).
 */
async function registerLigaMatch(player1, player2, frames1, frames2) {
    if (!player1 || !player2 || frames1 === undefined || frames2 === undefined) {
        console.error("Error: faltan parámetros. Usa: node register_liga_match.js <jugador1> <jugador2> <juegos_j1> <juegos_j2>");
        process.exit(1);
    }

    const f1 = parseInt(frames1, 10);
    const f2 = parseInt(frames2, 10);

    if (isNaN(f1) || isNaN(f2) || (f1 !== 3 && f2 !== 3) || f1 === f2) {
        console.error("Error: Los juegos deben ser números, y al menos un jugador debe haber ganado exactamente 3 juegos.");
        process.exit(1);
    }

    const winner = f1 === 3 ? player1 : player2;
    const loser = f1 === 3 ? player2 : player1;
    const winnerFrames = f1 === 3 ? f1 : f2;
    const loserFrames = f1 === 3 ? f2 : f1;
    
    // Punto de mérito para el perdedor si ganó 2 juegos
    const loserGetsMerit = loserFrames === 2;

    try {
        console.log(`Registrando partido: ${player1} (${f1}) vs ${player2} (${f2})`);
        console.log(`Ganador: ${winner} (3 pts)`);
        console.log(`Perdedor: ${loser} (${loserGetsMerit ? '1 pt de mérito por llegar a 2 juegos' : '0 pts'})`);

        const matchesRef = database.ref('liga/matches');
        const statsRef = database.ref('liga/stats');

        // 1. Guardar el registro del match en /liga/matches
        const newMatchRef = matchesRef.push();
        await newMatchRef.set({
            player1,
            player2,
            frames1: f1,
            frames2: f2,
            winner,
            loser,
            merit_awarded: loserGetsMerit,
            timestamp: admin.database.ServerValue.TIMESTAMP
        });

        console.log(`✅ Partido guardado con ID: ${newMatchRef.key}`);

        // 2. Transacción para actualizar stats de winner
        await statsRef.child(winner).transaction((currentData) => {
            if (currentData === null) {
                return { played: 1, wins: 1, losses: 0, merits: 0, points: 3, framesWon: winnerFrames, framesLost: loserFrames };
            }
            return {
                played: (currentData.played || 0) + 1,
                wins: (currentData.wins || 0) + 1,
                losses: currentData.losses || 0,
                merits: currentData.merits || 0,
                points: (currentData.points || 0) + 3,
                framesWon: (currentData.framesWon || 0) + winnerFrames,
                framesLost: (currentData.framesLost || 0) + loserFrames
            };
        });
        console.log(`✅ Estadísticas actualizadas para el ganador: ${winner}`);

        // 3. Transacción para actualizar stats de loser
        const loserPointsToAdd = loserGetsMerit ? 1 : 0;
        await statsRef.child(loser).transaction((currentData) => {
            if (currentData === null) {
                return { played: 1, wins: 0, losses: 1, merits: loserGetsMerit ? 1 : 0, points: loserPointsToAdd, framesWon: loserFrames, framesLost: winnerFrames };
            }
            return {
                played: (currentData.played || 0) + 1,
                wins: currentData.wins || 0,
                losses: (currentData.losses || 0) + 1,
                merits: (currentData.merits || 0) + (loserGetsMerit ? 1 : 0),
                points: (currentData.points || 0) + loserPointsToAdd,
                framesWon: (currentData.framesWon || 0) + loserFrames,
                framesLost: (currentData.framesLost || 0) + winnerFrames
            };
        });
        console.log(`✅ Estadísticas actualizadas para el perdedor: ${loser}`);

        console.log("\nProceso finalizado con éxito.");
        process.exit(0);

    } catch (error) {
        console.error("Error registrando la partida:", error);
        process.exit(1);
    }
}

// Check args
const args = process.argv.slice(2);
if (args.length >= 4) {
    const p1 = args[0];
    const p2 = args[1];
    const f1 = args[2];
    const f2 = args[3];
    registerLigaMatch(p1, p2, f1, f2);
} else {
    console.log(`
Uso:
  node register_liga_match.js <jugador1> <jugador2> <juegos_j1> <juegos_j2>

Ejemplo (Johnny gana 3-2 a Artur, Artur se lleva 1 pt de mérito):
  node register_liga_match.js johnny artur 3 2

Ejemplo (Erfan gana 3-0 a Sasa, Sasa se lleva 0 pts):
  node register_liga_match.js sasa erfan 0 3
    `);
    process.exit(1);
}
