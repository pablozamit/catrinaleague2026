// Audio.js - Sistema de audio con Tone.js sintetizado

const Audio = {
    initialized: false,
    synth: null,
    radioLoop: null,
    
    // Notas para melodía de radio estilo jazz
    radioNotes: [
        { note: 'A3', duration: '4n', time: 0 },
        { note: 'C4', duration: '8n', time: 0.5 },
        { note: 'E4', duration: '4n', time: 0.75 },
        { note: 'G3', duration: '8n', time: 1.25 },
        { note: 'B3', duration: '4n', time: 1.5 },
        { note: 'D4', duration: '8n', time: 2 },
        { note: 'F3', duration: '4n', time: 2.25 },
        { note: 'A3', duration: '2n', time: 2.75 }
    ],
    
    init() {
        // Esperar interacción del usuario para inicializar audio
        const initAudio = async () => {
            if (this.initialized) return;
            
            try {
                await Tone.start();
                this.initialized = true;
                console.log('🎵 Audio inicializado');
            } catch (e) {
                console.warn('Audio no disponible:', e);
            }
        };
        
        document.addEventListener('click', initAudio, { once: true });
        document.addEventListener('touchstart', initAudio, { once: true });
    },
    
    playRadio() {
        if (!this.initialized) {
            console.log('Audio aún no inicializado');
            return;
        }
        
        // Crear sintetizador con efecto de radio antigua
        const radioSynth = new Tone.PolySynth(Tone.Synth, {
            oscillator: {
                type: 'sawtooth'
            },
            envelope: {
                attack: 0.05,
                decay: 0.1,
                sustain: 0.3,
                release: 1
            }
        }).toDestination();
        
        // Efecto de distorsión (radio antigua)
        const distortion = new Tone.Distortion(0.1).toDestination();
        radioSynth.connect(distortion);
        
        // Efecto de reverb
        const reverb = new Tone.Reverb({
            decay: 2,
            wet: 0.3
        }).toDestination();
        radioSynth.connect(reverb);
        
        // Efecto de vibrato
        const vibrato = new Tone.Vibrato(5, 0.1).toDestination();
        radioSynth.connect(vibrato);
        
        // Loop de melodía
        let noteIndex = 0;
        const totalDuration = 3.5; // segundos por loop
        
        this.radioLoop = new Tone.Loop((time) => {
            const noteData = this.radioNotes[noteIndex];
            if (noteData) {
                radioSynth.triggerAttackRelease(
                    noteData.note,
                    noteData.duration,
                    time
                );
            }
            
            noteIndex = (noteIndex + 1) % this.radioNotes.length;
        }, '8n');
        
        this.radioLoop.start(0);
        Tone.Transport.start();
        
        // Fade in
        radioSynth.volume.value = -20;
        radioSynth.volume.rampTo(-10, 1);
        
        console.log('📻 Radio encendida');
    },
    
    stopRadio() {
        if (this.radioLoop) {
            this.radioLoop.stop();
            Tone.Transport.stop();
            this.radioLoop.dispose();
            this.radioLoop = null;
        }
        
        console.log('📻 Radio apagada');
    },
    
    // Efectos de sonido
    playSnore() {
        if (!this.initialized) return;
        
        const snoreSynth = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 4,
            oscillator: { type: 'sine' },
            envelope: {
                attack: 0.001,
                decay: 0.4,
                sustain: 0.01,
                release: 1.4
            }
        }).toDestination();
        
        snoreSynth.volume.value = -20;
        snoreSynth.triggerAttackRelease('C1', '2n');
    },
    
    playYawn() {
        if (!this.initialized) return;
        
        const yawnSynth = new Tone.Synth({
            oscillator: { type: 'triangle' },
            envelope: {
                attack: 1,
                decay: 0.5,
                sustain: 0.5,
                release: 1
            }
        }).toDestination();
        
        yawnSynth.volume.value = -15;
        yawnSynth.triggerAttackRelease('G3', '1n');
    },
    
    playStep() {
        if (!this.initialized) return;
        
        const stepSynth = new Tone.MembraneSynth({
            pitchDecay: 0.01,
            octaves: 2,
            oscillator: { type: 'sine' },
            envelope: {
                attack: 0.001,
                decay: 0.1,
                sustain: 0,
                release: 0.1
            }
        }).toDestination();
        
        stepSynth.volume.value = -30;
        stepSynth.triggerAttackRelease('F1', '32n');
    }
};

// Cargar Tone.js desde CDN
const toneScript = document.createElement('script');
toneScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js';
toneScript.onload = () => {
    console.log('Tone.js cargado');
};
document.head.appendChild(toneScript);
