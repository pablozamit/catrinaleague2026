# Contraseñas de Jugadores - La Catrina Pool League

**IMPORTANTE**: Guarda este archivo en un lugar seguro. Las contraseñas son únicas para cada jugador.

| # | Jugador | Contraseña |
|---|---------|------------|
| 1 | Artur | artur123 |
| 2 | Amauris | ama123 |
| 3 | Johnny | johnny123 |
| 4 | Fer | fer123 |
| 5 | Pablo | pablo123 |
| 6 | Jack | jack123 |
| 7 | Connor | connor123 |
| 8 | Joe | joe123 |
| 9 | Sergio | sergio123 |
| 10 | Luke | luke123 |
| 11 | Álvaro | alvaro123 |
| 12 | Jonathan | jonathan123 |
| 13 | Erfan | erfan123 |
| 14 | Alex F. | alexf123 |
| 15 | Angel | angel123 |
| 16 | David | david123 |
| 17 | Ángel S. | angels123 |
| 18 | Katee | katee123 |
| 19 | Paul | paul123 |
| 20 | Adri | adri123 |
| 21 | Oli | oli123 |
| 22 | Melina | melina123 |
| 23 | Sasa | sasa123 |
| 24 | Dennis | dennis123 |
| 25 | Andrea | andrea123 |
| 26 | Jorge | jorge123 |
| 27 | Ed | ed123 |
| 28 | Clint | clint123 |
| 29 | Paddy | paddy123 |
| 30 | Pavlo | pavlo123 |
| 31 | Charles | charles123 |
| 32 | Nica | nica123 |
| 33 | Juanma | juanma123 |
| 34 | Nino | nino123 |
| 35 | Roman | roman123 |
| 36 | Vicent | vicent123 |
| 37 | Mina | mina123 |
| 38 | Ruairi | ruairi123 |
| 39 | Maxim | maxim123 |
| 40 | Favio | favio123 |
| 41 | Lucas | lucas123 |
| 42 | Raul | raul123 |
| 43 | Luis | luis123 |
| 44 | Damian | damian123 |
| 45 | Alexandre | alexandre123 |
| 46 | Sol | sol123 |
| 47 | Danilo | Danilo123 |
| 48 | Ruth | ruth123 |
| 49 | Lydia | lydia123 |
| 50 | (reservado) | - |

---

## Cómo configurar Firebase (PASO A PASO)

### 1. Instalar Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Inicia sesión en Firebase
```bash
firebase login
```

### 3. Crea el proyecto
```bash
firebase create catrina-pool-league
cd catrina-pool-league
```

### 4. Inicializa Firebase Auth y Realtime Database
```bash
firebase init auth
firebase init database
```

### 5. Configura las reglas de Realtime Database
Edita `database.rules.json`:
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "matches": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

### 6. Despliega
```bash
firebase deploy
```

### 7. Obtén la configuración
Ve a Firebase Console → Configuración del proyecto → Tus apps → Web (</>) 
Copia la configuración y reemplázala en `js/firebase.js`

### 8. Importar usuarios (OPCIONAL - solo una vez)
Instala firebase-admin:
```bash
npm install firebase-admin
```

Copia tu service account key a `service-account-key.json`

Ejecuta el script:
```bash
node import-users.js
```

---

## Archivos del sistema

| Archivo | Función |
|---------|---------|
| `index.html` | Mesa 3D (punto de entrada) |
| `login.html` | Página de login |
| `resultados/index.html` | Introducir resultado (requiere login) |
| `confirmar/index.html` | Confirmar/rechazar resultados (requiere login) |
| `elo/index.html` | Ranking ELO |
| `js/firebase.js` | Conexión Firebase |
| `js/elo.js` | Cálculo de ELO |

---

*Generado automáticamente - La Catrina Pool League 2026*
