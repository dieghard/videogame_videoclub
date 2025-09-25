// ===================================================
// 🎵 SISTEMA DE AUDIO - VIDEOCLUB SANDY 🎵
// Sistema completo de música y efectos sonoros
// ===================================================

// Sistema de Audio Web Audio API
class ChiptuneAudio {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.wasPlaying = false; // Para manejar pausa
        this.backgroundMusic = null;
        this.backgroundTimeouts = []; // Array para gestionar timeouts
        this.currentMelodyIndex = 0; // Para rotar melodías
        this.melodyChangeCount = 0; // Contador para cambiar melodía
        this.initAudio();
    }
    
    async initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            console.log('Audio system initialized');
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }
    }
    
    async resumeAudio() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }
    
    createOscillator(frequency, type = 'square', duration = 0.2) {
        if (!this.audioContext) return null;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.1, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        oscillator.start(now);
        oscillator.stop(now + duration);
        
        return oscillator;
    }
    
    // 🎵 SONIDOS DE ARCADE CLÁSICOS
    
    playArcadeCoin() {
        if (!audioEnabled) return;
        this.resumeAudio();
        // Sonido clásico de moneda de arcade
        const frequencies = [800, 1200, 1600, 2000];
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                osc.connect(gain);
                gain.connect(this.audioContext.destination);
                osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                osc.type = 'square';
                gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
                osc.start();
                osc.stop(this.audioContext.currentTime + 0.1);
            }, index * 25);
        });
    }
    
    playArcadeBlip() {
        if (!audioEnabled) return;
        this.resumeAudio();
        // Blip de arcade clásico
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.frequency.setValueAtTime(1200, this.audioContext.currentTime);
        osc.type = 'square';
        gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05);
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.05);
    }
    
    playCorrectSound() {
        if (!audioEnabled) return;
        this.resumeAudio();
        // Sonido de acierto: acorde mayor ascendente
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.createOscillator(freq, 'square', 0.15);
            }, index * 50);
        });
        // Agregar blip de arcade
        setTimeout(() => this.playArcadeBlip(), 200);
    }
    
    playWrongSound() {
        if (!audioEnabled) return;
        this.resumeAudio();
        // Sonido de error estilo arcade: buzzer descendente
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.frequency.setValueAtTime(150, this.audioContext.currentTime);
        osc.frequency.linearRampToValueAtTime(50, this.audioContext.currentTime + 0.3);
        osc.type = 'square';
        gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.3);
    }
    
    playPowerUpSound() {
        if (!audioEnabled) return;
        this.resumeAudio();
        // Sonido de power-up: escala ascendente rápida
        const frequencies = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.createOscillator(freq, 'triangle', 0.1);
            }, index * 30);
        });
    }
    
    playAngrySound() {
        if (!audioEnabled) return;
        this.resumeAudio();
        // Sonido de cliente enojado: ruido descendente
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createOscillator(200 - i * 20, 'sawtooth', 0.2);
            }, i * 50);
        }
    }
    
    
    // 🎵 MÚSICA DE FONDO
    
    startBackgroundMusic() {
        if (!this.audioContext || this.isPlaying || !audioEnabled) return;
        
        this.isPlaying = true;
        this.currentMelodyIndex = 0;
        this.playBackgroundLoop();
    }
    
    stopBackgroundMusic() {
        this.isPlaying = false;
        if (this.backgroundMusic) {
            try {
                this.backgroundMusic.stop();
                this.backgroundMusic.disconnect();
            } catch(e) {
                // Ignorar errores si ya está desconectado
            }
            this.backgroundMusic = null;
        }
        // Limpiar todos los timeouts pendientes
        this.backgroundTimeouts.forEach(timeout => clearTimeout(timeout));
        this.backgroundTimeouts = [];
    }
    
    pauseBackgroundMusic() {
        if (!this.isPlaying || !this.audioContext) return;
        
        this.wasPlaying = true;
        this.isPlaying = false;
        
        if (this.backgroundMusic) {
            try {
                this.backgroundMusic.stop();
                this.backgroundMusic.disconnect();
            } catch(e) {
                // Ignorar errores si ya está desconectado
            }
            this.backgroundMusic = null;
        }
        
        // Pausar todos los timeouts pendientes
        this.backgroundTimeouts.forEach(timeout => clearTimeout(timeout));
        this.backgroundTimeouts = [];
    }
    
    resumeBackgroundMusic() {
        if (!this.wasPlaying || this.isPlaying || !this.audioContext || !audioEnabled) return;
        
        this.wasPlaying = false;
        this.isPlaying = true;
        this.playBackgroundLoop();
    }
    
    // 🎼 MELODÍAS ARCADE + HITS NOSTÁLGICOS 80s-90s (VERSIONES MEJORADAS)
    get80sMelodies() {
        return [
            // ARCADE CLÁSICOS - Sonidos auténticos de máquinas recreativas
            
            // Pac-Man Theme (1980) - La melodía más icónica de arcade
            [
                {note: 523, duration: 0.15},  // C5
                {note: 659, duration: 0.15},  // E5
                {note: 784, duration: 0.15},  // G5
                {note: 1047, duration: 0.2},  // C6 - pico arcade
                {note: 784, duration: 0.15},  // G5
                {note: 659, duration: 0.15},  // E5
                {note: 523, duration: 0.2},   // C5
                {note: 392, duration: 0.25}   // G4 - final clásico
            ],
            
            // Super Mario Bros Theme (1985) - Nintendo 8-bit
            [
                 // Frase icónica inicial "da da da dum da da DUM"
            {note: 659, duration: 0.125},  // E5
            {note: 659, duration: 0.125},  // E5  
            {note: 0, duration: 0.125},    // pausa
            {note: 659, duration: 0.125},  // E5
            {note: 0, duration: 0.125},    // pausa
            {note: 523, duration: 0.125},  // C5
            {note: 659, duration: 0.25},   // E5
            {note: 784, duration: 0.5},    // G5 - salto icónico
            {note: 0, duration: 0.25},     // pausa
            {note: 392, duration: 0.5},    // G4 - nota baja
            
            // Continuación melódica
            {note: 523, duration: 0.375},  // C5
            {note: 0, duration: 0.125},    // pausa
            {note: 392, duration: 0.25},   // G4
            {note: 0, duration: 0.125},    // pausa
            {note: 330, duration: 0.375},  // E4
            {note: 0, duration: 0.125},    // pausa
            {note: 440, duration: 0.25},   // A4
            {note: 494, duration: 0.25},   // B4
            {note: 466, duration: 0.125},  // Bb4
            {note: 440, duration: 0.25},   // A4
            
            // Frase melódica adicional
            {note: 392, duration: 0.2},    // G4
            {note: 659, duration: 0.2},    // E5
            {note: 784, duration: 0.2},    // G5
            {note: 880, duration: 0.25},   // A5
            {note: 698, duration: 0.25},   // F5
            {note: 784, duration: 0.125},  // G5
            {note: 0, duration: 0.125},    // pausa
            {note: 659, duration: 0.25},   // E5
            {note: 523, duration: 0.25},   // C5
            {note: 587, duration: 0.25},   // D5
            {note: 494, duration: 0.5}     // B4 - final
            ],
            
            // Tetris Theme (Korobeiniki) - Melodía adictiva de puzzle
            [
                {note: 659, duration: 0.2},   // E5
                {note: 494, duration: 0.15},  // B4
                {note: 523, duration: 0.15},  // C5
                {note: 587, duration: 0.2},   // D5
                {note: 523, duration: 0.15},  // C5
                {note: 494, duration: 0.15},  // B4
                {note: 440, duration: 0.3},   // A4
                {note: 523, duration: 0.25}   // C5
            ],
            
            // Space Invaders - Sonido retro marciano
            [
                {note: 200, duration: 0.1},   // Graves pesados
                {note: 250, duration: 0.1},
                {note: 300, duration: 0.1},
                {note: 350, duration: 0.1},
                {note: 400, duration: 0.2},   // Aceleración
                {note: 500, duration: 0.15},
                {note: 600, duration: 0.15},
                {note: 800, duration: 0.25}   // Explosión final
            ],
            
            // HITS DE LOS 80s MEJORADOS - Más fieles a los originales
            
            // Frase inicial icónica "Da da da DUM, da da DUMM" INDIANA JONES
            [
            {note: 659, duration: 0.4},    // E5 - primera nota fuerte
            {note: 698, duration: 0.2},    // F5
            {note: 784, duration: 0.2},    // G5
            {note: 1047, duration: 1.2},   // C6 - nota larga y alta característica
            
            // Segunda parte de la frase
            {note: 587, duration: 0.3},    // D5
            {note: 659, duration: 0.3},    // E5
            {note: 698, duration: 1.0},    // F5 - nota sostenida
            
            // Pausa dramática
            {note: 0, duration: 0.2},
            
            // Repetición con variación
            {note: 659, duration: 0.4},    // E5
            {note: 698, duration: 0.2},    // F5  
            {note: 784, duration: 0.2},    // G5
            {note: 1047, duration: 0.8},   // C6
            {note: 1175, duration: 0.4},   // D6 - pico alto
            {note: 1047, duration: 0.4},   // C6
            {note: 784, duration: 0.6},    // G5
            
            // Frase melódica descendente
            {note: 659, duration: 0.3},    // E5
            {note: 698, duration: 0.3},    // F5
            {note: 659, duration: 0.3},    // E5
            {note: 587, duration: 0.3},    // D5
            {note: 523, duration: 0.8},    // C5
            
            // Final heroico
            {note: 659, duration: 0.4},    // E5
            {note: 698, duration: 0.4},    // F5
            {note: 784, duration: 0.4},    // G5
            {note: 880, duration: 0.6},    // A5
            {note: 1047, duration: 1.5}    // C6 - final épico
            ],
            
            // Living on a Prayer - Bon Jovi (1986) - Riff completo más potente
            [
                // Intro de guitarra icónico
                {note: 293, duration: 0.2},    // D4 - inicio poderoso
                {note: 293, duration: 0.15},   // D4
                {note: 330, duration: 0.25},   // E4
                {note: 370, duration: 0.3},    // F#4 - subida dramática
                {note: 440, duration: 0.4},    // A4 - climax del riff
                {note: 370, duration: 0.2},    // F#4
                {note: 330, duration: 0.2},    // E4
                {note: 293, duration: 0.4},    // D4
                
                // Segundo ciclo más intenso
                {note: 293, duration: 0.15},   // D4
                {note: 330, duration: 0.2},    // E4
                {note: 370, duration: 0.25},   // F#4
                {note: 440, duration: 0.5},    // A4 - más sostenido
                {note: 494, duration: 0.3},    // B4 - nota alta
                {note: 440, duration: 0.3},    // A4
                {note: 370, duration: 0.25},   // F#4
                {note: 293, duration: 0.6}     // D4 - resolución rockera
            ],
            
            // Sweet Dreams - Eurythmics (1983) - Bass sintetizador hipnótico
            [
                {note: 147, duration: 0.4},   // D3 - bajo profundo y oscuro
                {note: 165, duration: 0.3},   // E3
                {note: 175, duration: 0.3},   // F3
                {note: 165, duration: 0.3},   // E3 - patrón repetitivo
                {note: 147, duration: 0.5},   // D3 - vuelta al tema
                {note: 131, duration: 0.4},   // C3
                {note: 147, duration: 0.6}    // D3 - final hipnótico
            ],
            
            // Final Countdown - Europe (1986) - Sintetizador épico
            [
                {note: 523, duration: 0.3},   // C5 - intro épico
                {note: 494, duration: 0.2},   // B4
                {note: 440, duration: 0.25},  // A4
                {note: 494, duration: 0.35},  // B4 - construcción dramática
                {note: 523, duration: 0.2},   // C5
                {note: 587, duration: 0.3},   // D5
                {note: 659, duration: 0.4},   // E5 - climax
                {note: 587, duration: 0.45}   // D5 - resolución épica
            ],
            
            // Girls Just Want to Have Fun - Cyndi Lauper (1983) - Pop alegre
            [
                {note: 523, duration: 0.2},   // C5
                {note: 587, duration: 0.15},  // D5
                {note: 659, duration: 0.25},  // E5 - alegría pura
                {note: 698, duration: 0.2},   // F5
                {note: 659, duration: 0.15},  // E5
                {note: 587, duration: 0.2},   // D5
                {note: 523, duration: 0.3},   // C5
                {note: 440, duration: 0.35}   // A4 - final feliz
            ],
            
            // Don't Stop Believin' - Journey (1981) - Piano emblemático
            [
                {note: 659, duration: 0.25},  // E5
                {note: 587, duration: 0.2},   // D5
                {note: 523, duration: 0.25},  // C5
                {note: 440, duration: 0.3},   // A4
                {note: 523, duration: 0.25},  // C5
                {note: 587, duration: 0.2},   // D5
                {note: 659, duration: 0.35},  // E5
                {note: 523, duration: 0.4}    // C5 - esperanza
            ],
            
            // Eye of the Tiger - Survivor (1982) - Riff motivacional
            [
                {note: 293, duration: 0.2},   // D4
                {note: 293, duration: 0.15},  // D4
                {note: 330, duration: 0.2},   // E4
                {note: 293, duration: 0.25},  // D4
                {note: 262, duration: 0.3},   // C4
                {note: 293, duration: 0.2},   // D4
                {note: 330, duration: 0.25},  // E4
                {note: 392, duration: 0.4}    // G4 - fuerza
            ],
            
            // HITS DE LOS 90s
            
            // Smells Like Teen Spirit - Nirvana (1991) - Grunge power chords
            [
                {note: 330, duration: 0.25},  // E4
                {note: 330, duration: 0.15},  // E4
                {note: 330, duration: 0.15},  // E4
                {note: 330, duration: 0.2},   // E4 - repetición grunge
                {note: 392, duration: 0.25},  // G4
                {note: 370, duration: 0.2},   // F#4
                {note: 330, duration: 0.3},   // E4
                {note: 294, duration: 0.35}   // D4 - distorsión
            ],
            
            // I Will Always Love You - Whitney Houston (1992) - Vocal poderoso
            [
                {note: 523, duration: 0.4},   // C5 - emoción pura
                {note: 587, duration: 0.3},   // D5
                {note: 659, duration: 0.35},  // E5
                {note: 698, duration: 0.4},   // F5 - climax vocal
                {note: 659, duration: 0.3},   // E5
                {note: 587, duration: 0.25},  // D5
                {note: 523, duration: 0.45},  // C5 - emotivo
                {note: 440, duration: 0.5}    // A4 - final desgarrador
            ],
            
            // Black or White - Michael Jackson (1991) - Pop perfecto
            [
                {note: 440, duration: 0.2},   // A4
                {note: 523, duration: 0.15},  // C5
                {note: 587, duration: 0.2},   // D5
                {note: 523, duration: 0.15},  // C5
                {note: 440, duration: 0.25},  // A4
                {note: 523, duration: 0.2},   // C5
                {note: 587, duration: 0.3},   // D5
                {note: 659, duration: 0.35}   // E5 - groove de MJ
            ],
            
            // Under Pressure - Queen & David Bowie (1981) - Bajo icónico
            [
                {note: 220, duration: 0.2},   // A3
                {note: 220, duration: 0.15},  // A3
                {note: 247, duration: 0.2},   // B3
                {note: 220, duration: 0.25},  // A3
                {note: 196, duration: 0.3},   // G3
                {note: 220, duration: 0.2},   // A3
                {note: 247, duration: 0.25},  // B3
                {note: 294, duration: 0.4}    // D4 - presión
            ],
            
            // MÁS ARCADE SOUNDS
            
            // Asteroids - Sonido espacial retro
            [
                {note: 100, duration: 0.1},   // Graves espaciales
                {note: 150, duration: 0.1},
                {note: 200, duration: 0.15},
                {note: 300, duration: 0.1},
                {note: 400, duration: 0.2},
                {note: 600, duration: 0.15},
                {note: 800, duration: 0.1},
                {note: 1000, duration: 0.15}  // Explosion
            ],
            
            // Galaga - Melodía de nave espacial
            [
                {note: 784, duration: 0.1},   // Agudos espaciales
                {note: 880, duration: 0.1},
                {note: 988, duration: 0.15},
                {note: 880, duration: 0.1},
                {note: 784, duration: 0.2},
                {note: 659, duration: 0.15},
                {note: 523, duration: 0.2}
            ]
        ];
    }
    
    getCurrentMelody() {
        const allMelodies = this.get80sMelodies();
        
        // Cambiar melodía cada 2 repeticiones para más variedad
        if (this.melodyChangeCount >= 2) {
            // Selección completamente aleatoria de todas las melodías
            this.currentMelodyIndex = Math.floor(Math.random() * allMelodies.length);
            this.melodyChangeCount = 0;
            console.log(`🎵 Nueva melodía aleatoria: ${this.currentMelodyIndex + 1}/${allMelodies.length}`);
        }
        
        this.melodyChangeCount++;
        return allMelodies[this.currentMelodyIndex] || allMelodies[0];
    }
    
    playBackgroundLoop() {
        if (!this.isPlaying || !this.audioContext) return;
        
        const melody = this.getCurrentMelody();
        const baseVolume = 0.12; // Volumen suave para ambiente
        
        let totalDuration = 0;
        melody.forEach((note, index) => {
            const timeoutId = setTimeout(() => {
                if (this.isPlaying) {
                    if (note.note > 0) {
                        // Usar synth wave con filtros - corregido para usar note.note
                        this.playSynthNote(note.note, note.duration, baseVolume);
                    }
                    if (index === melody.length - 1) {
                        // Pausa más larga entre repeticiones
                        const loopTimeoutId = setTimeout(() => this.playBackgroundLoop(), (note.duration + 1.5) * 1000);
                        this.backgroundTimeouts.push(loopTimeoutId);
                    }
                }
            }, totalDuration * 1000);
            this.backgroundTimeouts.push(timeoutId);
            totalDuration += note.duration;
        });
    }
    
    playSynthNote(frequency, duration, volume = 0.15) {
        if (!this.audioContext) return;
        
        // Crear oscilador principal (synth lead)
        const mainOsc = this.audioContext.createOscillator();
        const mainGain = this.audioContext.createGain();
        
        // Crear oscilador de armonía (octava baja)
        const harmonyOsc = this.audioContext.createOscillator();
        const harmonyGain = this.audioContext.createGain();
        
        // Filtro pasa-bajos para sonido synth
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
        filter.Q.setValueAtTime(1, this.audioContext.currentTime);
        
        // Configurar osciladores
        mainOsc.type = 'sawtooth'; // Sonido synth característico
        mainOsc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        harmonyOsc.type = 'triangle';
        harmonyOsc.frequency.setValueAtTime(frequency / 2, this.audioContext.currentTime); // Octava baja
        
        // Conectar audio graph
        mainOsc.connect(mainGain);
        mainGain.connect(filter);
        filter.connect(this.masterGain);
        
        harmonyOsc.connect(harmonyGain);
        harmonyGain.connect(this.masterGain);
        
        // Configurar envolventes ADSR (Attack, Decay, Sustain, Release)
        const now = this.audioContext.currentTime;
        const attackTime = 0.05;
        const decayTime = 0.1;
        const sustainLevel = volume * 0.7;
        const releaseTime = 0.2;
        
        // Envolvente principal
        mainGain.gain.setValueAtTime(0, now);
        mainGain.gain.linearRampToValueAtTime(volume, now + attackTime);
        mainGain.gain.exponentialRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
        mainGain.gain.setValueAtTime(sustainLevel, now + duration - releaseTime);
        mainGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        // Envolvente armonía (más suave)
        harmonyGain.gain.setValueAtTime(0, now);
        harmonyGain.gain.linearRampToValueAtTime(volume * 0.3, now + attackTime);
        harmonyGain.gain.exponentialRampToValueAtTime(sustainLevel * 0.3, now + attackTime + decayTime);
        harmonyGain.gain.setValueAtTime(sustainLevel * 0.3, now + duration - releaseTime);
        harmonyGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        // Modular el filtro para efecto synth
        filter.frequency.exponentialRampToValueAtTime(800, now + duration);
        
        mainOsc.start(now);
        mainOsc.stop(now + duration);
        harmonyOsc.start(now);
        harmonyOsc.stop(now + duration);
    }
}

// ===================================================
// 🎵 VARIABLES GLOBALES DE AUDIO 🎵
// ===================================================

// Instancia global del sistema de audio
const audioSystem = new ChiptuneAudio();

// Variables de estado del audio
let audioEnabled = true;