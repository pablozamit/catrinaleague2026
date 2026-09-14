// Actualizar ELO de Firebase con el ranking FINAL del PDF (tras TEMPORADA 1)
const admin = require('firebase-admin');
const serviceAccount = require('./elopool-f1e62-firebase-adminsdk-fbsvc-3154d48a46.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://elopool-f1e62-default-rtdb.europe-west1.firebasedatabase.app'
});

const db = admin.database();

// ELO FINAL del PDF (Ranking con boost tras fase de grupos TEMPORADA 1)
const eloFinal = {
    artur: 1914,
    amauris: 1659,
    pablo: 1641,
    jack: 1620,
    jonathan: 1587,
    sasa: 1516,
    katee: 1451,
    fer: 1447,
    joe: 1432,
    johnny: 1428,
    connor: 1388,
    sergio: 1372,
    joel: 1359,
    alexf: 1354,
    mo: 1332,
    lucasc: 1258,
    erfan: 1245,
    charles: 1241,
    enrique: 1212,
    jorge: 1200,
    david: 1198,
    roman: 1163,
    mina: 1156,
    angel: 1143,
    lucas: 1128,
    andres: 1117,
    nino: 1027,
    ponci: 1003,
    danilo: 995,
    alexb: 987,
    sol: 983,
    favio: 963,
    rauls: 961,
    manuela: 931,
    ruth: 902,
    damian: 807
};

async function main() {
    const snapshot = await db.ref('users').once('value');
    const users = snapshot.val();

    let updates = {};
    let found = [];
    let notFound = [];

    Object.entries(users).forEach(([uid, u]) => {
        const uname = (u.username || '').toLowerCase().trim();
        if (eloFinal.hasOwnProperty(uname)) {
            updates[`users/${uid}/elo_rating`] = eloFinal[uname];
            found.push(`${u.username}: ${u.elo_rating} -> ${eloFinal[uname]}`);
        }
    });

    // Comprobar si algún jugador del PDF no está en Firebase
    const fbNames = new Set(Object.values(users).map(u => (u.username || '').toLowerCase().trim()));
    Object.keys(eloFinal).forEach(name => {
        if (!fbNames.has(name)) notFound.push(name);
    });

    console.log(`=== ACTUALIZANDO ${Object.keys(updates).length} USUARIOS ===`);
    found.forEach(f => console.log(f));

    if (notFound.length) {
        console.log('\n=== NO ENCONTRADOS EN FIREBASE ===');
        notFound.forEach(n => console.log(n));
    }

    if (process.argv.includes('--dry-run')) {
        console.log('\n(DRY RUN - no se aplicaron cambios)');
        process.exit(0);
    }

    await db.ref().update(updates);
    console.log('\n✅ ELOs actualizados correctamente en Firebase');
    process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
