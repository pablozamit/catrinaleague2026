/**
 * Configuración Firebase - La Catrina Pool League
 * 
 * CONFIGURACIÓN: Completa estos datos desde Firebase Console
 * después de crear el proyecto.
 */

// Configuración Firebase - La Catrina Pool League
const firebaseConfig = {
    apiKey: "AIzaSyBgyARlrVo-J1qIhu49Nfvif_p7xVVFW5s",
    authDomain: "elopool-f1e62.firebaseapp.com",
    databaseURL: "https://elopool-f1e62-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "elopool-f1e62",
    storageBucket: "elopool-f1e62.firebasestorage.app",
    messagingSenderId: "125100775441",
    appId: "1:125100775441:web:b61f62a308af5c678db9b0",
    measurementId: "G-BNZEK056MB"
};

// Inicializar Firebase
let auth, database;

function initFirebase() {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    auth = firebase.auth();
    database = firebase.database();
}

// Estado de autenticación
let currentUser = null;
let onAuthStateChangedCallback = null;

// Observador de autenticación
function onAuthStateChanged(callback) {
    onAuthStateChangedCallback = callback;
    
    if (!auth) initFirebase();
    
    auth.onAuthStateChanged((user) => {
        currentUser = user;
        callback(user);
    });
}

// Iniciar sesión con email/password
function signIn(email, password) {
    if (!auth) initFirebase();
    return auth.signInWithEmailAndPassword(email, password);
}

// Cerrar sesión
function signOut() {
    if (!auth) initFirebase();
    return auth.signOut();
}

// Obtener usuario actual
function getCurrentUser() {
    return currentUser;
}

// ===== FUNCIONES DE BASE DE DATOS =====

// Obtener datos del usuario
function getUserData(uid) {
    return database.ref(`users/${uid}`).once('value').then(snap => snap.val());
}

// Actualizar ELO del usuario
function updateUserElo(uid, elo, matchesPlayed, matchesWon) {
    return database.ref(`users/${uid}`).update({
        elo_rating: elo,
        matches_played: matchesPlayed,
        matches_won: matchesWon
    });
}

// Crear partido pendientes
function createMatch(matchData) {
    const newMatchRef = database.ref('matches').push();
    return newMatchRef.set({
        ...matchData,
        id: newMatchRef.key,
        status: 'pending',
        created_at: firebase.database.ServerValue.TIMESTAMP
    });
}

// Obtener partidos pendientes de confirmar para un usuario
function getPendingMatches(uid) {
    return database.ref('matches')
        .orderByChild('player2_id')
        .equalTo(uid)
        .once('value')
        .then(snap => {
            const matches = snap.val();
            if (!matches) return [];
            return Object.entries(matches)
                .filter(([key, match]) => match.status === 'pending')
                .map(([key, match]) => ({ ...match, key }));
        });
}

// Confirmar partido
function confirmMatch(matchId, eloChanges) {
    const updates = {};
    
    // Actualizar partido
    updates[`matches/${matchId}/status`] = 'confirmed';
    updates[`matches/${matchId}/confirmed_at`] = firebase.database.ServerValue.TIMESTAMP;
    
    // Actualizar ELO del ganador
    updates[`users/${eloChanges.winnerId}/elo_rating`] = eloChanges.winnerElo;
    updates[`users/${eloChanges.winnerId}/matches_played`] = eloChanges.winnerMatches;
    updates[`users/${eloChanges.winnerId}/matches_won`] = eloChanges.winnerWins;
    
    // Actualizar ELO del perdedor
    updates[`users/${eloChanges.loserId}/elo_rating`] = eloChanges.loserElo;
    updates[`users/${eloChanges.loserId}/matches_played`] = eloChanges.loserMatches;
    
    return database.ref().update(updates);
}

// Rechazar partido
function declineMatch(matchId) {
    return database.ref(`matches/${matchId}`).update({
        status: 'declined'
    });
}

// Obtener todos los usuarios (para selectores)
function getAllUsers() {
    return database.ref('users').once('value').then(snap => {
        const users = snap.val();
        if (!users) return [];
        return Object.entries(users).map(([key, user]) => ({
            uid: key,
            ...user
        })).sort((a, b) => (b.elo_rating || 1200) - (a.elo_rating || 1200));
    });
}

// ===== EXPORTAR =====

if (typeof window !== 'undefined') {
    window.firebaseConfig = firebaseConfig;
    window.initFirebase = initFirebase;
    window.onAuthStateChanged = onAuthStateChanged;
    window.signIn = signIn;
    window.signOut = signOut;
    window.getCurrentUser = getCurrentUser;
    window.getUserData = getUserData;
    window.updateUserElo = updateUserElo;
    window.createMatch = createMatch;
    window.getPendingMatches = getPendingMatches;
    window.confirmMatch = confirmMatch;
    window.declineMatch = declineMatch;
    window.getAllUsers = getAllUsers;
}
