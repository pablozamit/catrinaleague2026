/**
 * Script para ocultar todas las partidas existentes
 * Mantiene el ELO, badges y estadísticas
 * Uso: node ocultar_historial_actual.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./elopool-f1e62-firebase-adminsdk-fbsvc-3154d48a46.json');

// Inicializar Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://elopool-f1e62-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.database();

async function ocultarHistorial() {
    try {
        console.log('🔍 Consultando todas las partidas...\n');
        
        // Obtener todas las partidas
        const snapshot = await db.ref('matches').once('value');
        const partidas = snapshot.val();
        
        if (!partidas) {
            console.log('❌ No hay partidas para ocultar.');
            return;
        }
        
        const partidasArray = Object.entries(partidas).map(([key, value]) => ({ id: key, ...value }));
        console.log(`✅ Total de partidas encontradas: ${partidasArray.length}\n`);
        
        console.log('⚠️ AVISO IMPORTANTE:');
        console.log('Esto ocultará TODAS las partidas del historial.');
        console.log('El ELO actual y las badges SE MANTENDRÁN.');
        console.log('Las partidas seguirán en la base de datos pero no aparecerán en el historial.\n');
        
        // Confirmación
        console.log('¿Estás seguro de continuar? (s/N)');
        const respuesta = await leerConsola();
        
        if (respuesta.toLowerCase() !== 's') {
            console.log('❌ Operación cancelada.');
            return;
        }
        
        console.log('\n🔄 Ocultando partidas...\n');
        
        let ocultadas = 0;
        let errores = 0;
        
        for (const partida of partidasArray) {
            try {
                await db.ref(`matches/${partida.id}/hidden`).set(true);
                console.log(`✅ Partida ${partida.id} ocultada`);
                ocultadas++;
            } catch (error) {
                console.log(`❌ Error al ocultar partida ${partida.id}: ${error.message}`);
                errores++;
            }
        }
        
        console.log('\n' + '='.repeat(80));
        console.log('\n📊 RESUMEN:');
        console.log(`- Total de partidas: ${partidasArray.length}`);
        console.log(`- Ocultadas exitosamente: ${ocultadas}`);
        console.log(`- Errores: ${errores}`);
        
        console.log('\n✅ Historial ocultado correctamente.');
        console.log('\nNota: Ahora necesitas actualizar la función getUserHistory en firebase.js');
        console.log('para que ignore las partidas con hidden: true.');
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

function leerConsola() {
    return new Promise((resolve) => {
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        rl.question('', (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

// Ejecutar
ocultarHistorial().then(() => {
    process.exit(0);
}).catch(() => {
    process.exit(1);
});
