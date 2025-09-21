// Variables globales del juego
let gameState = {
    isPlaying: false,
    score: 0,
    lives: 3,
    year: 1987,
    combo: 1,
    selectedItem: null,
    customers: [],
    powerUps: [],
    currentYear: 1987,
    customersServed: 0,
    difficulty: 1,
    comboCount: 0,
    activePowerUps: {},
    highScore: localStorage.getItem('retroVideoClubHighScore') || 0
};

// Lista de nombres de clientes
const customerNames = [
    'Patricia', 'Ana', 'Euge', 'Masi', 'Pispa', 'Pablin', 'Dami', 'TinMar', 
    'Passe', 'Lugo', 'Rominita', 'Susanita', 'Ale', 'Mario', 'Mery', 'Diego', 
    'Matias', 'Gaspar', 'Santi', 'Franki', 'Pauli', 'Ema', 'Guille', 'Marce'
];

// Productos específicos de los años 80
const products80s = {
    vhs: [
        'E.T. El Extraterrestre', 'Volver al Futuro', 'Flashdance', 'Top Gun',
        'Los Cazafantasmas', 'Karate Kid', 'Ferris Buellers Day Off', 'Dirty Dancing',
        'La Historia Sin Fin', 'Big', 'Los Goonies', 'Blade Runner', 'Terminator',
        'El Imperio Contraataca', 'El Retorno del Jedi', 'Gremlins', 'El Club del Desayuno',
        'Pretty in Pink', 'Say Anything', 'Fast Times at Ridgemont High'
    ],
    vinyl: [
        'Like a Virgin - Madonna', 'Thriller - Michael Jackson', 'Purple Rain - Prince',
        'Born in the USA - Bruce Springsteen', 'Brothers in Arms - Dire Straits',
        'The Joshua Tree - U2', 'Appetite for Destruction - Guns N Roses',
        'Faith - George Michael', 'Hysteria - Def Leppard', 'Slippery When Wet - Bon Jovi',
        'Licensed to Ill - Beastie Boys', 'Rio - Duran Duran', 'Synchronicity - The Police',
        'Pyromania - Def Leppard', 'Back in Black - AC/DC', 'The Wall - Pink Floyd',
        'Remain in Light - Talking Heads', 'New Gold Dream - Simple Minds'
    ],
    cassette: [
        'Now Thats What I Call Music!', 'Flashdance Soundtrack', 'Footloose Soundtrack',
        'Top Gun Soundtrack', 'Dirty Dancing Soundtrack', 'The Breakfast Club Soundtrack',
        'Madonna Greatest Hits', 'Michael Jackson Off the Wall', 'Prince 1999',
        'Duran Duran Rio', 'Depeche Mode Violator', 'New Order Blue Monday',
        'Cyndi Lauper True Colors', 'Blondie Heart of Glass', 'ABBA Gold',
        'Culture Club Colour by Numbers', 'Wham! Make It Big', 'George Michael Faith'
    ]
};

// Configuración del juego
const gameConfig = {
    customerSpawnRate: 3000,
    customerPatience: 8000,
    maxCustomers: 3,
    powerUpSpawnRate: 15000,
    yearEvents: {
        1987: "¡El Blockbuster original abre sus puertas!",
        1988: "Nintendo lanza Super Mario Bros 3",
        1989: "Aparece la Game Boy y cambia todo",
        1990: "Los CD empiezan a competir con los vinilos",
        1991: "Terminator 2 revoluciona el cine",
        1992: "Windows 3.1 llega a las computadoras"
    }
};

// Items disponibles
const items = ['vhs', 'vinyl', 'cassette'];
const itemEmojis = {
    'vhs': '🎥',
    'vinyl': '💿',
    'cassette': '📼'
};

// Power-ups disponibles
const powerUpTypes = {
    'walkman': { emoji: '🎧', effect: 'slowTime', duration: 5000 },
    'madonna': { emoji: '🌟', effect: 'happyCustomers', duration: 8000 },
    'nintendo': { emoji: '🕹️', effect: 'doublePoints', duration: 10000 }
};

// Sistema de Audio Web Audio API
class ChiptuneAudio {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.isPlaying = false;
        this.backgroundMusic = null;
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
    }
    
    playWrongSound() {
        if (!audioEnabled) return;
        this.resumeAudio();
        // Sonido de error: acorde disonante descendente
        const frequencies = [349.23, 293.66, 246.94]; // F4, D4, B3
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.createOscillator(freq, 'sawtooth', 0.3);
            }, index * 100);
        });
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
    
    playComboSound() {
        if (!audioEnabled) return;
        this.resumeAudio();
        // Sonido de combo: arpeggio rápido
        const frequencies = [523.25, 659.25, 783.99, 1046.50];
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.createOscillator(freq, 'triangle', 0.12);
            }, index * 40);
        });
    }
    
    startBackgroundMusic() {
        if (!this.audioContext || this.isPlaying || !audioEnabled) return;
        
        this.isPlaying = true;
        this.playBackgroundLoop();
    }
    
    stopBackgroundMusic() {
        this.isPlaying = false;
        if (this.backgroundMusic) {
            this.backgroundMusic.stop();
            this.backgroundMusic = null;
        }
    }
    
    playBackgroundLoop() {
        if (!this.isPlaying || !this.audioContext) return;
        
        // Melodía simple de fondo estilo chiptune
        const melody = [
            {freq: 261.63, duration: 0.5}, // C4
            {freq: 329.63, duration: 0.5}, // E4
            {freq: 392.00, duration: 0.5}, // G4
            {freq: 329.63, duration: 0.5}, // E4
            {freq: 261.63, duration: 0.5}, // C4
            {freq: 293.66, duration: 0.5}, // D4
            {freq: 329.63, duration: 0.5}, // E4
            {freq: 261.63, duration: 1.0}  // C4
        ];
        
        let totalDuration = 0;
        melody.forEach((note, index) => {
            setTimeout(() => {
                if (this.isPlaying) {
                    const osc = this.createOscillator(note.freq, 'triangle', note.duration);
                    if (index === melody.length - 1) {
                        // Repetir la melodía
                        setTimeout(() => this.playBackgroundLoop(), note.duration * 1000);
                    }
                }
            }, totalDuration * 1000);
            totalDuration += note.duration;
        });
    }
}

// Instancia global del sistema de audio
const audioSystem = new ChiptuneAudio();

// Variables de estado del audio
let audioEnabled = true;

// Función para activar el audio automáticamente
async function enableAudio() {
    try {
        await audioSystem.initAudio();
        await audioSystem.resumeAudio();
        audioEnabled = true;
        
        // Iniciar música de fondo automáticamente
        setTimeout(() => {
            audioSystem.startBackgroundMusic();
        }, 500);
        
        console.log('Audio activado automáticamente');
        
    } catch (error) {
        console.warn('Error al activar audio:', error);
        // Si hay error, permitir activación manual
        audioEnabled = false;
    }
}

// Función para activación manual de audio (fallback)
async function manualEnableAudio() {
    try {
        await audioSystem.initAudio();
        await audioSystem.resumeAudio();
        audioEnabled = true;
        
        // Reproducir sonido de confirmación
        setTimeout(() => {
            audioSystem.playPowerUpSound();
            audioSystem.startBackgroundMusic();
        }, 100);
        
        console.log('Audio activado manualmente');
        alert('🎵 ¡Audio activado! Disfruta la música y efectos de VideoClub Sandy.');
        
    } catch (error) {
        console.warn('Error al activar audio:', error);
        alert('❌ No se pudo activar el audio.');
    }
}

// Inicializar el juego
function initGame() {
    updateDisplay();
    
    // Activar audio automáticamente
    enableAudio();
    
    // Registrar service worker para PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(console.error);
    }
}

// Comenzar el juego
function startGame() {
    document.getElementById('mainMenu').style.display = 'none';
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.lives = 3;
    gameState.year = 1987;
    gameState.combo = 1;
    gameState.customersServed = 0;
    gameState.customers = [];
    gameState.powerUps = [];
    gameState.activePowerUps = {};
    gameState.comboCount = 0;
    
    updateDisplay();
    
    // Iniciar música de fondo
    audioSystem.startBackgroundMusic();
    
    gameLoop();
    
    // Iniciar spawns
    setTimeout(spawnCustomer, 1000);
    setTimeout(spawnPowerUp, gameConfig.powerUpSpawnRate);
}

// Loop principal del juego
function gameLoop() {
    if (!gameState.isPlaying) return;
    
    updateCustomers();
    updatePowerUps();
    checkGameOver();
    checkYearTransition();
    
    requestAnimationFrame(gameLoop);
}

// Actualizar display
function updateDisplay() {
    document.getElementById('score').textContent = gameState.score.toLocaleString();
    document.getElementById('lives').textContent = '❤️'.repeat(gameState.lives);
    document.getElementById('year').textContent = gameState.year;
    document.getElementById('combo').textContent = `x${gameState.combo}`;
}

// Seleccionar item
function selectItem(itemType) {
    if (!gameState.isPlaying) return;
    
    // Deseleccionar todos los items
    document.querySelectorAll('.item-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    
    // Seleccionar el item clickeado
    if (gameState.selectedItem === itemType) {
        gameState.selectedItem = null;
    } else {
        gameState.selectedItem = itemType;
        document.querySelector(`[data-item="${itemType}"]`).classList.add('selected');
        
        // Intentar servir al primer cliente en la fila
        serveCustomer();
    }
}

// Servir cliente
function serveCustomer() {
    if (!gameState.selectedItem || gameState.customers.length === 0) return;
    
    const customer = gameState.customers[0];
    const isCorrect = customer.request === gameState.selectedItem;
    
    if (isCorrect) {
        // Acierto
        const points = 100 * gameState.combo * gameState.difficulty;
        gameState.score += points;
        gameState.comboCount++;
        
        if (gameState.comboCount % 3 === 0) {
            gameState.combo = Math.min(gameState.combo + 1, 5);
            showComboText(customer.element.offsetLeft, customer.element.offsetTop);
            playSound('combo'); // Sonido especial para combos
        }
        
        gameState.customersServed++;
        showScoreDisplay(`+${points}`, customer.element.offsetLeft, customer.element.offsetTop);
        createParticles(customer.element.offsetLeft + 50, customer.element.offsetTop + 60, '#00ff00');
        
        // Aplicar efecto de power-up de doble puntos
        if (gameState.activePowerUps.doublePoints) {
            gameState.score += points;
            showScoreDisplay(`BONUS +${points}`, customer.element.offsetLeft, customer.element.offsetTop - 40);
        }
        
        // Sonido de acierto
        playSound('correct');
        
    } else {
        // Error
        gameState.lives--;
        gameState.combo = 1;
        gameState.comboCount = 0;
        showScoreDisplay('¡ERROR!', customer.element.offsetLeft, customer.element.offsetTop);
        createParticles(customer.element.offsetLeft + 50, customer.element.offsetTop + 60, '#ff0000');
        
        // Sonido de error
        playSound('wrong');
    }
    
    // Remover cliente
    removeCustomer(0);
    gameState.selectedItem = null;
    document.querySelectorAll('.item-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    
    updateDisplay();
}

// Generar cliente
function spawnCustomer() {
    if (!gameState.isPlaying || gameState.customers.length >= gameConfig.maxCustomers) {
        setTimeout(spawnCustomer, 1000);
        return;
    }
    
    const request = items[Math.floor(Math.random() * items.length)];
    const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
    const specificProduct = products80s[request][Math.floor(Math.random() * products80s[request].length)];
    
    const customerElement = createCustomerElement(request, customerName, specificProduct);
    
    const customer = {
        request: request,
        name: customerName,
        specificProduct: specificProduct,
        patience: gameConfig.customerPatience / gameState.difficulty,
        maxPatience: gameConfig.customerPatience / gameState.difficulty,
        element: customerElement,
        id: Date.now()
    };
    
    gameState.customers.push(customer);
    document.getElementById('gameArea').appendChild(customerElement);
    
    // Animar entrada
    animateCustomerEntry(customerElement, gameState.customers.length - 1);
    
    // Programar siguiente cliente
    const spawnDelay = Math.max(1000, gameConfig.customerSpawnRate - (gameState.difficulty * 200));
    setTimeout(spawnCustomer, spawnDelay);
}

// Crear elemento de cliente
function createCustomerElement(request, name, product) {
    const customerDiv = document.createElement('div');
    customerDiv.className = 'customer';
    customerDiv.innerHTML = `
        <div class="customer-sprite">👤</div>
        <div class="customer-name">${name}</div>
        <div class="customer-request">${itemEmojis[request]}</div>
        <div class="customer-product">${product}</div>
        <div class="patience-bar">
            <div class="patience-fill"></div>
        </div>
    `;
    
    return customerDiv;
}

// Animar entrada de cliente
function animateCustomerEntry(element, index) {
    const startX = -120;
    const targetX = 50 + (index * 120);
    const y = 100 + (index * 30);
    
    element.style.left = startX + 'px';
    element.style.top = y + 'px';
    
    element.animate([
        { left: startX + 'px' },
        { left: targetX + 'px' }
    ], {
        duration: 500,
        easing: 'ease-out',
        fill: 'forwards'
    });
}

// Actualizar clientes
function updateCustomers() {
    gameState.customers.forEach((customer, index) => {
        if (gameState.activePowerUps.slowTime) {
            customer.patience -= 8; // Más lento con power-up
        } else if (gameState.activePowerUps.happyCustomers) {
            customer.patience += 5; // Los clientes están contentos
        } else {
            customer.patience -= 16;
        }
        
        // Actualizar barra de paciencia
        const patiencePercent = (customer.patience / customer.maxPatience) * 100;
        const patienceBar = customer.element.querySelector('.patience-fill');
        patienceBar.style.width = Math.max(0, patiencePercent) + '%';
        
        // Cliente se va si se acaba la paciencia
        if (customer.patience <= 0) {
            gameState.lives--;
            gameState.combo = 1;
            gameState.comboCount = 0;
            showScoreDisplay('¡SE FUE!', customer.element.offsetLeft, customer.element.offsetTop);
            playSound('angry');
            removeCustomer(index);
            updateDisplay();
            return;
        }
    });
}

// Remover cliente
function removeCustomer(index) {
    if (index < 0 || index >= gameState.customers.length) return;
    
    const customer = gameState.customers[index];
    
    // Animar salida
    customer.element.animate([
        { left: customer.element.offsetLeft + 'px', opacity: 1 },
        { left: '-120px', opacity: 0 }
    ], {
        duration: 300,
        easing: 'ease-in'
    }).onfinish = () => {
        if (customer.element.parentNode) {
            customer.element.parentNode.removeChild(customer.element);
        }
    };
    
    gameState.customers.splice(index, 1);
    
    // Reposicionar clientes restantes
    gameState.customers.forEach((c, i) => {
        const newX = 50 + (i * 120);
        c.element.animate([
            { left: c.element.offsetLeft + 'px' },
            { left: newX + 'px' }
        ], {
            duration: 300,
            easing: 'ease-out',
            fill: 'forwards'
        });
    });
}

// Generar power-up
function spawnPowerUp() {
    if (!gameState.isPlaying || gameState.powerUps.length > 0) {
        setTimeout(spawnPowerUp, gameConfig.powerUpSpawnRate);
        return;
    }
    
    const types = Object.keys(powerUpTypes);
    const type = types[Math.floor(Math.random() * types.length)];
    const powerUpElement = createPowerUpElement(type);
    
    const powerUp = {
        type: type,
        element: powerUpElement,
        id: Date.now()
    };
    
    gameState.powerUps.push(powerUp);
    document.getElementById('gameArea').appendChild(powerUpElement);
    
    // Posición aleatoria
    const x = Math.random() * (window.innerWidth - 80);
    const y = Math.random() * 200 + 100;
    powerUpElement.style.left = x + 'px';
    powerUpElement.style.top = y + 'px';
    
    // Auto-remover después de un tiempo
    setTimeout(() => {
        removePowerUp(0);
    }, 8000);
    
    // Programar siguiente power-up
    setTimeout(spawnPowerUp, gameConfig.powerUpSpawnRate);
}

// Crear elemento de power-up
function createPowerUpElement(type) {
    const powerUpDiv = document.createElement('div');
    powerUpDiv.className = 'power-up';
    powerUpDiv.innerHTML = powerUpTypes[type].emoji;
    powerUpDiv.onclick = () => activatePowerUp(type);
    
    return powerUpDiv;
}

// Activar power-up
function activatePowerUp(type) {
    const powerUpConfig = powerUpTypes[type];
    gameState.activePowerUps[powerUpConfig.effect] = Date.now() + powerUpConfig.duration;
    
    // Efectos inmediatos
    switch (powerUpConfig.effect) {
        case 'happyCustomers':
            gameState.customers.forEach(customer => {
                customer.patience = customer.maxPatience;
            });
            break;
    }
    
    removePowerUp(0);
    playSound('powerup');
    showScoreDisplay('POWER-UP!', 400, 200);
}

// Remover power-up
function removePowerUp(index) {
    if (index < 0 || index >= gameState.powerUps.length) return;
    
    const powerUp = gameState.powerUps[index];
    if (powerUp.element.parentNode) {
        powerUp.element.parentNode.removeChild(powerUp.element);
    }
    gameState.powerUps.splice(index, 1);
}

// Actualizar power-ups
function updatePowerUps() {
    const now = Date.now();
    Object.keys(gameState.activePowerUps).forEach(effect => {
        if (gameState.activePowerUps[effect] < now) {
            delete gameState.activePowerUps[effect];
        }
    });
}

// Verificar transición de año
function checkYearTransition() {
    if (gameState.customersServed >= 10 && gameState.customersServed % 10 === 0) {
        if (gameState.year < gameState.currentYear + Math.floor(gameState.customersServed / 10)) {
            gameState.year++;
            gameState.difficulty += 0.2;
            showYearTransition();
        }
    }
}

// Mostrar transición de año
function showYearTransition() {
    const yearElement = document.getElementById('yearTransition');
    const yearTitle = document.getElementById('yearTitle');
    const yearEvent = document.getElementById('yearEvent');
    
    yearTitle.textContent = gameState.year;
    yearEvent.textContent = gameConfig.yearEvents[gameState.year] || "¡Un nuevo año lleno de entretenimiento!";
    
    yearElement.style.opacity = '1';
    yearElement.style.pointerEvents = 'all';
    
    setTimeout(() => {
        yearElement.style.opacity = '0';
        yearElement.style.pointerEvents = 'none';
    }, 3000);
    
    updateDisplay();
}

// Verificar game over
function checkGameOver() {
    if (gameState.lives <= 0) {
        gameOver();
    }
}

// Game over
function gameOver() {
    gameState.isPlaying = false;
    
    // Detener música de fondo
    audioSystem.stopBackgroundMusic();
    
    // Guardar high score
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('retroVideoClubHighScore', gameState.highScore);
        showScoreDisplay('¡NUEVO RÉCORD!', 400, 250);
    }
    
    // Limpiar elementos
    gameState.customers.forEach(customer => {
        if (customer.element.parentNode) {
            customer.element.parentNode.removeChild(customer.element);
        }
    });
    
    gameState.powerUps.forEach(powerUp => {
        if (powerUp.element.parentNode) {
            powerUp.element.parentNode.removeChild(powerUp.element);
        }
    });
    
    // Mostrar mensaje de game over
    setTimeout(() => {
        const messages = [
            "¡Los clientes se fueron al Blockbuster! 😢",
            "¡VideoClub Sandy no pudo competir con las cadenas! 📼",
            "¡Los clientes prefirieron Netflix! 💻",
            "¡Sandy no sobrevivió a los 80s! 🎬",
            "¡El VideoClub Sandy cerró sus puertas! 🏪"
        ];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        alert(`${randomMessage}\n\nPuntuación final: ${gameState.score.toLocaleString()}\nAño alcanzado: ${gameState.year}\nClientes atendidos: ${gameState.customersServed}`);
        document.getElementById('mainMenu').style.display = 'flex';
    }, 2000);
}

// Mostrar puntuación flotante
function showScoreDisplay(text, x, y) {
    const scoreElement = document.getElementById('scoreDisplay');
    scoreElement.textContent = text;
    scoreElement.style.left = x + 'px';
    scoreElement.style.top = y + 'px';
    scoreElement.style.opacity = '1';
    
    scoreElement.animate([
        { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
        { opacity: 0, transform: 'translate(-50%, -70px) scale(1.2)' }
    ], {
        duration: 1500,
        easing: 'ease-out'
    });
}

// Mostrar texto de combo
function showComboText(x, y) {
    const comboDiv = document.createElement('div');
    comboDiv.className = 'combo-text';
    comboDiv.textContent = `COMBO x${gameState.combo}!`;
    comboDiv.style.left = x + 'px';
    comboDiv.style.top = (y - 30) + 'px';
    
    document.getElementById('gameArea').appendChild(comboDiv);
    
    comboDiv.animate([
        { opacity: 1, transform: 'scale(1)' },
        { opacity: 0, transform: 'scale(1.5)' }
    ], {
        duration: 1000,
        easing: 'ease-out'
    }).onfinish = () => {
        if (comboDiv.parentNode) {
            comboDiv.parentNode.removeChild(comboDiv);
        }
    };
}

// Crear partículas
function createParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.background = color;
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        
        document.getElementById('gameArea').appendChild(particle);
        
        const angle = (Math.PI * 2 * i) / 8;
        const distance = 50 + Math.random() * 30;
        const targetX = x + Math.cos(angle) * distance;
        const targetY = y + Math.sin(angle) * distance;
        
        particle.animate([
            { left: x + 'px', top: y + 'px', opacity: 1 },
            { left: targetX + 'px', top: targetY + 'px', opacity: 0 }
        ], {
            duration: 800,
            easing: 'ease-out'
        }).onfinish = () => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        };
    }
}

// Reproducir sonido (implementación mejorada)
function playSound(type) {
    if (!audioEnabled || !audioSystem.audioContext) {
        console.log(`Audio not enabled. Would play sound: ${type}`);
        return;
    }
    
    switch(type) {
        case 'correct':
            audioSystem.playCorrectSound();
            break;
        case 'wrong':
            audioSystem.playWrongSound();
            break;
        case 'powerup':
            audioSystem.playPowerUpSound();
            break;
        case 'angry':
            audioSystem.playAngrySound();
            break;
        case 'combo':
            audioSystem.playComboSound();
            break;
        default:
            console.log(`Playing sound: ${type}`);
    }
}

// Mostrar récords
function showHighScores() {
    alert(`🏆 RÉCORD PERSONAL 🏆\n\nMejor puntuación: ${parseInt(gameState.highScore).toLocaleString()}`);
}

// Mostrar instrucciones
function showInstructions() {
    alert(`📖 INSTRUCCIONES - VIDEOCLUB SANDY 📖\n\n🔊 IMPORTANTE: Activa el audio primero para disfrutar de la música y efectos.\n\n🎯 OBJETIVO:\nAtiende a los clientes del videoclub antes de que se impacienten.\n\n🎮 CÓMO JUGAR:\n• Los clientes llegan pidiendo VHS 🎥, vinilos 💿 o cassettes 📼\n• Haz clic en el ítem correcto para servirlos\n• ¡No los hagas esperar mucho!\n\n⚡ POWER-UPS:\n🎧 Walkman - Ralentiza el tiempo\n🌟 Madonna - Clientes contentos\n🕹️ Nintendo - Puntos dobles\n\n🏆 COMBOS:\nSirve 3 clientes seguidos sin fallar para aumentar tu multiplicador.\n\n📅 PROGRESIÓN:\nCada 10 clientes avanzas un año y aumenta la dificultad.`);
}

// Agregar efectos de screen shake
function screenShake(intensity = 5, duration = 200) {
    const gameContainer = document.querySelector('.game-container');
    const originalTransform = gameContainer.style.transform;
    
    let shakeFrames = 0;
    const maxFrames = duration / 16; // ~60fps
    
    function shake() {
        if (shakeFrames < maxFrames) {
            const x = (Math.random() - 0.5) * intensity;
            const y = (Math.random() - 0.5) * intensity;
            gameContainer.style.transform = `translate(${x}px, ${y}px)`;
            shakeFrames++;
            requestAnimationFrame(shake);
        } else {
            gameContainer.style.transform = originalTransform;
        }
    }
    
    shake();
}

// Eventos de teclado para accesibilidad
document.addEventListener('keydown', (e) => {
    if (!gameState.isPlaying) {
        // En el menú principal
        if (e.key === 'Enter' || e.key === ' ') {
            startGame();
            return;
        }
        return;
    }
    
    switch(e.key) {
        case '1':
            selectItem('vhs');
            break;
        case '2':
            selectItem('vinyl');
            break;
        case '3':
            selectItem('cassette');
            break;
        case 'q':
        case 'Q':
            selectItem('vhs');
            break;
        case 'w':
        case 'W':
            selectItem('vinyl');
            break;
        case 'e':
        case 'E':
            selectItem('cassette');
            break;
        case 'Escape':
            if (confirm('¿Pausar juego?')) {
                gameState.isPlaying = false;
                audioSystem.stopBackgroundMusic();
                document.getElementById('mainMenu').style.display = 'flex';
            }
            break;
        case 'm':
        case 'M':
            // Toggle mute
            if (audioSystem.masterGain) {
                const currentGain = audioSystem.masterGain.gain.value;
                audioSystem.masterGain.gain.setValueAtTime(
                    currentGain > 0 ? 0 : 0.3, 
                    audioSystem.audioContext.currentTime
                );
            }
            break;
    }
});

// Controles táctiles mejorados para móviles
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    if (!gameState.isPlaying) return;
    
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    if (!gameState.isPlaying) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    // Detectar swipes horizontales para seleccionar items
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
            // Swipe derecha - siguiente item
            const items = ['vhs', 'vinyl', 'cassette'];
            const currentIndex = items.indexOf(gameState.selectedItem);
            const nextIndex = (currentIndex + 1) % items.length;
            selectItem(items[nextIndex]);
        } else {
            // Swipe izquierda - item anterior
            const items = ['vhs', 'vinyl', 'cassette'];
            const currentIndex = items.indexOf(gameState.selectedItem);
            const prevIndex = currentIndex === -1 ? 0 : (currentIndex - 1 + items.length) % items.length;
            selectItem(items[prevIndex]);
        }
    }
});

// Agregar efecto de screen shake cuando se pierde una vida
const originalServeCustomer = serveCustomer;
window.serveCustomer = function() {
    const beforeLives = gameState.lives;
    originalServeCustomer();
    
    if (gameState.lives < beforeLives) {
        screenShake(8, 300);
    }
};

// Agregar indicador de FPS (solo para desarrollo)
let lastTime = performance.now();
let frameCount = 0;
let fps = 0;

function updateFPS() {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;
        
        // Solo mostrar en consola si está activado el debug
        if (window.DEBUG_MODE) {
            console.log(`FPS: ${fps}`);
        }
    }
    
    requestAnimationFrame(updateFPS);
}

// Iniciar contador de FPS
updateFPS();

// Función para activar modo debug
window.enableDebugMode = function() {
    window.DEBUG_MODE = true;
    console.log('Debug mode enabled. Press F12 to see FPS in console.');
    
    // Agregar indicador visual de debug
    const debugIndicator = document.createElement('div');
    debugIndicator.style.position = 'fixed';
    debugIndicator.style.top = '10px';
    debugIndicator.style.right = '10px';
    debugIndicator.style.background = 'rgba(255, 0, 0, 0.8)';
    debugIndicator.style.color = 'white';
    debugIndicator.style.padding = '5px';
    debugIndicator.style.fontSize = '12px';
    debugIndicator.style.zIndex = '9999';
    debugIndicator.textContent = 'DEBUG';
    document.body.appendChild(debugIndicator);
};

// Inicializar cuando se carga la página
window.addEventListener('load', initGame);