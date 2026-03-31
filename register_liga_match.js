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
 * - Victoria = 3 pts
 * - Derrota = 0 pts
 * - Punto de mérito = 1 pt (opcional para el perdedor)
 */
async function registerLigaMatch(player1, player2, winner, loserGetsMerit = false) {
    if (!player1 || !player2 || !winner) {
        console.error("Error: faltan parámetros. Usa: node register_liga_match.js <jugador1> <jugador2> <ganador> [true/false para punto de mérito del perdedor]");
        process.exit(1);
    }

    if (winner !== player1 && winner !== player2) {
        console.error("Error: El ganador debe ser el jugador 1 o el jugador 2.");
        process.exit(1);
    }

    const loser = winner === player1 ? player2 : player1;

    try {
        console.log(`Registrando partido: ${player1} vs ${player2} | Ganador: ${winner} | Mérito: ${loserGetsMerit ? 'Sí (' + loser + ')' : 'No'}`);

        const matchesRef = database.ref('liga/matches');
        const statsRef = database.ref('liga/stats');

        // 1. Guardar el registro del match en /liga/matches
        const newMatchRef = matchesRef.push();
        await newMatchRef.set({
            player1,
            player2,
            winner,
            loser,
            merit_awarded: loserGetsMerit,
            timestamp: admin.database.ServerValue.TIMESTAMP
        });

        console.log(`✅ Partido guardado con ID: ${newMatchRef.key}`);

        // 2. Transacción para actualizar stats de winner
        await statsRef.child(winner).transaction((currentData) => {
            if (currentData === null) {
                return { played: 1, wins: 1, losses: 0, merits: 0, points: 3 };
            }
            return {
                played: (currentData.played || 0) + 1,
                wins: (currentData.wins || 0) + 1,
                losses: currentData.losses || 0,
                merits: currentData.merits || 0,
                points: (currentData.points || 0) + 3
            };
        });
        console.log(`✅ Estadísticas actualizadas para el ganador: ${winner} (+3 pts)`);

        // 3. Transacción para actualizar stats de loser
        const loserPointsToAdd = loserGetsMerit ? 1 : 0;
        await statsRef.child(loser).transaction((currentData) => {
            if (currentData === null) {
                return { played: 1, wins: 0, losses: 1, merits: loserGetsMerit ? 1 : 0, points: loserPointsToAdd };
            }
            return {
                played: (currentData.played || 0) + 1,
                wins: currentData.wins || 0,
                losses: (currentData.losses || 0) + 1,
                merits: (currentData.merits || 0) + (loserGetsMerit ? 1 : 0),
                points: (currentData.points || 0) + loserPointsToAdd
            };
        });
        console.log(`✅ Estadísticas actualizadas para el perdedor: ${loser} (+${loserPointsToAdd} pts)`);

        console.log("\nProceso finalizado con éxito.");
        process.exit(0);

    } catch (error) {
        console.error("Error registrando la partida:", error);
        process.exit(1);
    }
}

// Check args
const args = process.argv.slice(2);
if (args.length >= 3) {
    const p1 = args[0];
    const p2 = args[1];
    const win = args[2];
    const merit = args[3] === 'true';
    registerLigaMatch(p1, p2, win, merit);
} else {
    console.log(`
Uso:
  node register_liga_match.js <jugador1> <jugador2> <ganador> [true/false (merit point)]

Ejemplo:
  node register_liga_match.js johnny artur johnny false
  node register_liga_match.js sasa erfan erfan true
    `);
    process.exit(1);
}
