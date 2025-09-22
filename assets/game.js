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

// Gestión de timers para poder limpiarlos
let gameTimers = {
    customerSpawn: null,
    powerUpSpawn: null,
    gameOverMessage: null,
    buttonShuffle: null
};

// Variables para PWA y funcionalidades nuevas
let deferredPrompt = null;
let buttonShuffleCount = 0;
let shuffleSound = null;

// Función para limpiar todos los timers del juego
function clearAllGameTimers() {
    Object.values(gameTimers).forEach(timer => {
        if (timer) {
            clearTimeout(timer);
        }
    });
    gameTimers = {
        customerSpawn: null,
        powerUpSpawn: null,
        gameOverMessage: null,
        buttonShuffle: null
    };
}

// Lista de nombres de clientes
const customerNames = [
    'Patricia', 'Ani',  'Masi', 'Pispa', 'Pablin', 'Dami', 'TinMar', 
    'Passe', 'Lugo', 'Rominita', 'Susanita', 'Ale', 'Mario', 'Mery', 'Diego', 'Sergio','Betito',
    'Matias', 'Gaspar', 'Santi', 'Franki', 'Pauli', 'Ema', 'Guille', 'Marce', 'Sergio', 'Euge', 'Javi'];

// Productos específicos de los años 80
const products80s = {
    vhs: [
        'E.T. El Extraterrestre', 'Volver al Futuro', 'Flashdance', 'Top Gun',
        'Los Cazafantasmas', 'Karate Kid', 'Ferris Buellers Day Off', 'Dirty Dancing',
        'La Historia Sin Fin', 'Big', 'Los Goonies', 'Blade Runner', 'Terminator',
        'El Imperio Contraataca', 'El Retorno del Jedi', 'Gremlins', 'El Club del Desayuno',
        'Pretty in Pink', 'Say Anything', 'Fast Times at Ridgemont High', 'Top Gun','Robocop','Tortugas Ninja'
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
    yearEvents: [
        // 1987
        [
            "¡El Blockbuster original abre sus puertas! ♪ Take On Me - A-ha",
            "¡Dirty Dancing arrasa en los cines! ♪ She's Like the Wind",
            "¡Maradona conquista el mundo! ♪ Living on a Prayer - Bon Jovi",
            "¡Los videoclubes llegan a Argentina! ♪ Here I Go Again - Whitesnake",
            "¡Charly García lanza Piano Bar! ♪ I Want Your Sex - George Michael",
            "¡Nace la MTV en español! ♪ Walk Like an Egyptian - Bangles"
        ],
        // 1988
        [
            "Nintendo lanza Super Mario Bros 3 ♪ Sweet Dreams - Eurythmics",
            "¡Big con Tom Hanks emociona! ♪ Sweet Child O' Mine - Guns N' Roses",
            "¡Los Fabulosos Cadillacs explotan! ♪ Don't Worry Be Happy - Bobby McFerrin",
            "¡Xuxa llega a la TV argentina! ♪ Kokomo - Beach Boys", 
            "¡Roger Rabbit revoluciona el cine! ♪ Roll with It - Steve Winwood",
            "¡Soda Stereo en su apogeo! ♪ Desire - U2"
        ],
        // 1989
        [
            "Aparece la Game Boy y cambia todo ♪ Blue Monday - New Order",
            "¡Batman de Tim Burton impacta! ♪ Like a Prayer - Madonna",
            "¡Cae el Muro de Berlín! ♪ Wind of Change - Scorpions",
            "¡Los Virus con Wadu Wadu! ♪ Love Shack - B-52's",
            "¡Menem asume la presidencia! ♪ We Didn't Start the Fire - Billy Joel",
            "¡La hiperinflación se desata! ♪ Eternal Flame - Bangles"
        ],
        // 1990
        [
            "Los CD empiezan a competir con los vinilos ♪ Don't You Forget About Me - Simple Minds",
            "¡Pretty Woman con Julia Roberts! ♪ Vogue - Madonna",
            "¡Argentina va al Mundial de Italia! ♪ Un'estate italiana - Edoardo Bennato",
            "¡Los Redondos en Obras! ♪ Nothing Compares 2 U - Sinéad O'Connor",
            "¡Llegan las primeras computadoras! ♪ Ice Ice Baby - Vanilla Ice",
            "¡Plan de Convertibilidad 1 a 1! ♪ Close to You - Maxi Priest"
        ],
        // 1991
        [
            "Terminator 2 revoluciona el cine ♪ Girls Just Want to Have Fun - Cyndi Lauper",
            "¡Beauty and the Beast de Disney! ♪ Everything I Do - Bryan Adams",
            "¡Nirvana cambia la música! ♪ Smells Like Teen Spirit",
            "¡Llegan los primeros McDonald's! ♪ Losing My Religion - R.E.M.",
            "¡Super Nintendo en Argentina! ♪ More Than Words - Extreme",
            "¡Videomatch empieza a brillar! ♪ I Wanna Sex You Up - Color Me Badd"
        ],
        // 1992
        [
            "Windows 3.1 llega a las computadoras ♪ Time After Time - Cyndi Lauper",
            "¡Aladdin de Disney conquista! ♪ I Will Always Love You - Whitney Houston",
            "¡Juegos Olímpicos de Barcelona! ♪ Amigos Para Siempre",
            "¡Los primeros shoppings centers! ♪ Tears in Heaven - Eric Clapton",
            "¡La estabilidad económica llega! ♪ November Rain - Guns N' Roses",
            "¡Los cyber cafés aparecen! ♪ Under the Bridge - Red Hot Chili Peppers"
        ]
    ],
    nostalgicPhrases: {
        1987: [
            "¡Cuando las películas eran en VHS!",
            "¡El año de Dirty Dancing!",
            "¡Madonna reinaba en MTV!",
            "¡Los Walkman estaban de moda!",
            "¡Susana Giménez empezaba en TV!",
            "¡Los videoclubes en cada barrio!",
            "¡Maradona era el rey del mundo!",
            "¡Llegaban las primeras Nintendos a Argentina!",
            "¡Charly García con 'Piano Bar'!",
            "¡Los cassettes se grababan de la radio!",
            "¡Tinelli era solo un conductor de radio!",
            "¡Las revistas Billiken y Anteojito!"
        ],
        1988: [
            "¡El año de Big y Tom Hanks!",
            "¡Quien mató a Roger Rabbit triunfaba!",
            "¡Los videos musicales eran arte!",
            "¡Todos querían un Nintendo!",
            "¡Los Fabulosos Cadillacs arrasaban!",
            "¡Xuxa conquistaba la TV argentina!",
            "¡Las zapatillas Flecha eran furor!",
            "¡Los chicles Bazooka con figuritas!",
            "¡Mirtha Legrand ya era un clásico!",
            "¡Los primeros videocassetes piratas!",
            "¡Soda Stereo llenaba estadios!",
            "¡Los recreos con pelota de fútbol!"
        ],
        1989: [
            "¡Batman con Michael Keaton!",
            "¡La caída del Muro de Berlín!",
            "¡Game Boy cambió los videojuegos!",
            "¡Los videos de MTV eran épicos!",
            "¡La hiperinflación y los precios locos!",
            "¡Menem llegaba al poder!",
            "¡Los Virus con 'Wadu Wadu'!",
            "¡Las máquinas del millón en los bares!",
            "¡Los helados Frigor con palito de madera!",
            "¡Las historietas de Mafalda se reeditaban!",
            "¡Los chiclets Menthoplus!",
            "¡Las primeras computadoras Commodore!"
        ],
        1990: [
            "¡Pretty Woman con Julia Roberts!",
            "¡Los CD empezaban a llegar!",
            "¡Home Alone era la sensación!",
            "¡Las hombreras estaban de moda!",
            "¡El 1 a 1 de Cavallo!",
            "¡Argentina en el Mundial de Italia!",
            "¡Los Redondos en el Estadio Obras!",
            "¡Las máquinas tragamonedas llegaban!",
            "¡Los primeros celulares gigantes!",
            "¡Los locutorios para llamar!",
            "¡Las golosinas Arcor dominaban!",
            "¡Los recreativos de Pacman en los bares!"
        ],
        1991: [
            "¡Terminator 2 volaba mentes!",
            "¡Beauty and the Beast de Disney!",
            "¡Nirvana cambiaba la música!",
            "¡Los Super Nintendo llegaron!",
            "¡El peso convertible arrancaba!",
            "¡Tevez y sus sketches en TV!",
            "¡Los primeros McDonald's en Argentina!",
            "¡Las Tortugas Ninja eran furor!",
            "¡Los chicles Flynn Paff!",
            "¡Las cartas de Dragon Ball comenzaban!",
            "¡Los walkmans con radio AM/FM!",
            "¡Las pilchas de los patovicas de moda!"
        ],
        1992: [
            "¡Aladdin de Disney triunfaba!",
            "¡Los Juegos Olímpicos de Barcelona!",
            "¡Wayne's World era genial!",
            "¡Las computadoras llegaban a casa!",
            "¡La estabilidad económica al fin!",
            "¡Los primeros shoppings centers!",
            "¡Videomatch revolucionaba la TV!",
            "¡Las Spice Girls llegaban a Argentina!",
            "¡Los tamagotchis como mascotas!",
            "¡Las primeras películas en DVD!",
            "¡Los cyber cafés para navegar!",
            "¡Los pagers para los importantes!"
        ]
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
    'nintendo': { emoji: '🕹️', effect: 'doublePoints', duration: 10000 },
    'cafe': { emoji: '☕', effect: 'calmCustomers', duration: 12000 },
    'mate': { emoji: '🧉', effect: 'calmCustomers', duration: 15000 }
};

// ========== SISTEMA DE FRASES NOSTÁLGICAS Y CHISMES ==========

// Frases del EMPLEADO del videoclub (profesionales, informativas)
const frasesEmpleado = [
    "👨‍💼 EMPLEADO: che te olvidaste de rebobinar la peli anterior",
    "👨‍💼 EMPLEADO: las multas por no rebobinar son caras eh!",
    "👨‍💼 EMPLEADO: acordate que Volver al Futuro 2 sale la semana que viene",
    "👨‍💼 EMPLEADO: los VHS originales cuestan $50, los truchos $20",
    "👨‍💼 EMPLEADO: cuidado con las cintas que se cortan",
    "👨‍💼 EMPLEADO: el lunes traemos más copias de Dirty Dancing",
    "👨‍💼 EMPLEADO: no olvides devolver la cinta en 3 días",
    "👨‍💼 EMPLEADO: tenemos descuento por 3 películas",
    "👨‍💼 EMPLEADO: esta semana llegan los estrenos de Hollywood",
    "👨‍💼 EMPLEADO: si querés reservar algo, avisame",
    "👨‍💼 EMPLEADO: ¿querés un cafecito mientras elegís?",
    "👨‍💼 EMPLEADO: preparé mate, ¿te sirvo?",
    "👨‍💼 EMPLEADO: el café está recién hecho",
    "👨‍💼 EMPLEADO: este mate está bárbaro, probalo"
];

// Frases de CLIENTES que entran (comentarios casuales, chismes)
const frasesClientes = [
    "👥 CLIENTE: ¿ya viste Top Gun? está buenísima",
    "👥 CLIENTE: dicen que Madonna va a venir a Argentina",
    "👥 CLIENTE: mi hermano dice que Maradona alquila pelis acá cerca",
    "👥 CLIENTE: en el Blockbuster de Palermo están más caras",
    "👥 CLIENTE: ¿sabés si llega pronto la nueva de Tom Cruise?",
    "👥 CLIENTE: mi vieja dice que antes las pelis duraban más",
    "👥 CLIENTE: ¿viste que pusieron otro videoclub en la esquina?",
    "👥 CLIENTE: dicen que van a cerrar el cine del barrio",
    "👥 CLIENTE: mi primo labura en un videoclub de Flores",
    "👥 CLIENTE: ¿viste que ahora alquilan también Nintendo?"
];

// CHISMES DE BARRIO (lo que se comenta en el barrio)
const chismesBarrio = [
    "🏘️ CHISME: che viste que a {cliente} le compraron una Family Game?",
    "🏘️ CHISME: che viste que {cliente} se fue de vacaciones a Miami?",
    "🏘️ CHISME: che viste que {cliente} se compró zapatillas importadas?",
    "🏘️ CHISME: che viste que a {cliente} la vieron en el cumple de Xuxa?",
    "🏘️ CHISME: che viste que {cliente} tiene todos los cassettes de Madonna?",
    "🏘️ CHISME: che viste que {cliente} se anotó en Video Match?",
    "🏘️ CHISME: che viste que a {cliente} le tocó el 1 a 1?",
    "🏘️ CHISME: che viste que {cliente} tiene una bicicleta BMX como la de E.T.?",
    "🏘️ CHISME: che viste que a {cliente} la llevaron al Luna Park?",
    "🏘️ CHISME: che viste que {cliente} se compró un auto 0km?",
    "🏘️ CHISME: che viste que a {cliente} le instalaron cable y tiene MTV?",
    "🏘️ CHISME: che viste que {cliente} colecciona cassettes de los Fabulosos?",
    "🏘️ CHISME: che viste que a {cliente} la invitaron al programa de Mirtha?",
    "🏘️ CHISME: che viste que {cliente} se fue a Punta del Este?"
];

// CURIOSIDADES DE LOS 90 (datos culturales/históricos)
const curiosidades90s = [
    "📰 CURIOSIDAD: sabías que Menem decía que íbamos a ser como Japón?",
    "📰 CURIOSIDAD: sabías que las zapatillas importadas costaban una fortuna?",
    "📰 CURIOSIDAD: sabías que Xuxa era más famosa que el presidente?",
    "📰 CURIOSIDAD: sabías que los chicles Bazooka venían con figuritas?",
    "📰 CURIOSIDAD: sabías que las hamburguesas de McDonald's costaban $2?",
    "📰 CURIOSIDAD: sabías que el peso valía lo mismo que el dólar?",
    "📰 CURIOSIDAD: sabías que Tinelli empezó en la radio con Pergolini?",
    "📰 CURIOSIDAD: sabías que los videojuegos de Family costaban $80?",
    "📰 CURIOSIDAD: sabías que comprarse una Nintendo era el sueño del pibe?",
    "📰 CURIOSIDAD: sabías que los cassettes se grababan de la radio?",
    "📰 CURIOSIDAD: sabías que Video Match era lo más visto de la tele?",
    "📰 CURIOSIDAD: sabías que las máquinas del millón estaban en todos lados?",
    "📰 CURIOSIDAD: sabías que Mafalda seguía siendo más popular que Batman?",
    "📰 CURIOSIDAD: sabías que los locutorios eran el único lugar para llamar?",
    "📰 CURIOSIDAD: sabías que las revistas Billiken las leía todo el mundo?",
    "📰 CURIOSIDAD: sabías que los helados Frigor eran furor?",
    "📰 CURIOSIDAD: sabías que tener cable era de millonario?",
    "📰 CURIOSIDAD: sabías que los Redondos llenaban Obras sin radio?"
];

// Variable para controlar el sistema de frases
let fraseTimer = null;
let ultimaFrase = Date.now();

// Función para mostrar frases aleatorias desde el videoclub
function mostrarFraseAleatoria() {
    if (!gameState.isPlaying) return;
    
    const ahora = Date.now();
    
    // Solo mostrar una frase cada 8-15 segundos
    if (ahora - ultimaFrase < 8000) return;
    
    // Elegir tipo de frase con sistema de pesos
    const tiposFrase = [
        { tipo: 'empleado', frases: frasesEmpleado, peso: 25 },
        { tipo: 'cliente', frases: frasesClientes, peso: 30 },
        { tipo: 'chisme', frases: chismesBarrio, peso: 25 },
        { tipo: 'curiosidad', frases: curiosidades90s, peso: 20 }
    ];
    
    // Sistema de pesos: crear array expandido según peso
    let frasesExpandidas = [];
    tiposFrase.forEach(categoria => {
        for(let i = 0; i < categoria.peso; i++) {
            frasesExpandidas.push(categoria);
        }
    });
    
    // Seleccionar categoría aleatoria respetando pesos
    const categoriaElegida = frasesExpandidas[Math.floor(Math.random() * frasesExpandidas.length)];
    let fraseElegida = categoriaElegida.frases[Math.floor(Math.random() * categoriaElegida.frases.length)];
    
    // Para chismes, reemplazar {cliente} con nombre de cliente atendido
    if (categoriaElegida.tipo === 'chisme' && fraseElegida.includes('{cliente}')) {
        const clientesAtendidos = ['la Marta', 'el Jorge', 'la Susana', 'el Carlos', 'la Rosa', 'el Néstor', 'la Carmen', 'el Roberto'];
        const clienteRandom = clientesAtendidos[Math.floor(Math.random() * clientesAtendidos.length)];
        fraseElegida = fraseElegida.replace('{cliente}', clienteRandom);
    }
    
    // Mostrar la frase con clase CSS específica según el tipo
    mostrarFraseEnVideoclub(fraseElegida, categoriaElegida.tipo);
    ultimaFrase = ahora;
    
    // Programar la siguiente frase (8-15 segundos)
    const siguienteFrase = 8000 + Math.random() * 7000;
    fraseTimer = setTimeout(mostrarFraseAleatoria, siguienteFrase);
}

// Función específica para diálogos del juego (cliente/empleado)
function mostrarDialogoJuego(texto, tipo = 'empleado') {
    console.log('Mostrando diálogo en chat:', tipo, texto);
    
    const chatContainer = document.getElementById('chatContainer');
    if (!chatContainer) {
        console.error('No se encontró el contenedor de chat');
        return;
    }
    
    // Limpiar mensajes muy antiguos (mantener máximo 4 mensajes)
    const mensajesExistentes = chatContainer.querySelectorAll('.chat-message');
    if (mensajesExistentes.length >= 4) {
        // Remover los mensajes más antiguos (que están arriba en el flexbox column-reverse)
        const mensajesARemover = Array.from(mensajesExistentes).slice(4);
        mensajesARemover.forEach(mensaje => {
            mensaje.classList.add('removing');
            setTimeout(() => {
                if (mensaje.parentNode) {
                    mensaje.parentNode.removeChild(mensaje);
                }
            }, 300);
        });
    }
    
    // Crear nuevo mensaje de chat
    const chatMessage = document.createElement('div');
    chatMessage.className = `chat-message ${tipo}`;
    
    // Configurar speaker según el tipo
    let speaker = '';
    switch(tipo) {
        case 'empleado':
            speaker = 'EMPLEADO';
            break;
        case 'cliente':
            // Extraer el nombre del cliente del texto (formato: "Nombre: mensaje")
            const colonIndex = texto.indexOf(':');
            if (colonIndex > 0) {
                speaker = texto.substring(0, colonIndex).toUpperCase();
            } else {
                speaker = 'CLIENTE';
            }
            break;
        default:
            speaker = 'VIDEOCLUB';
    }
    
    // Limpiar el texto para clientes (remover el nombre del inicio)
    let textoLimpio = texto;
    if (tipo === 'cliente') {
        const colonIndex = texto.indexOf(':');
        if (colonIndex > 0) {
            textoLimpio = texto.substring(colonIndex + 1).trim();
        }
    }
    
    chatMessage.innerHTML = `
        <div class="chat-speaker">${speaker}</div>
        <div class="chat-text">${textoLimpio}</div>
    `;
    
    // Agregar al contenedor (aparece abajo debido a column-reverse)
    chatContainer.appendChild(chatMessage);
    
    // Auto-eliminar después de 6 segundos
    setTimeout(() => {
        if (chatMessage.parentNode) {
            chatMessage.classList.add('removing');
            setTimeout(() => {
                if (chatMessage.parentNode) {
                    chatMessage.parentNode.removeChild(chatMessage);
                }
            }, 300);
        }
    }, 6000);
    
    console.log('Mensaje agregado al chat:', chatMessage);
}

// Función para mostrar frases en el área del videoclub (ahora usando el chat)
function mostrarFraseEnVideoclub(texto, tipo = 'default') {
    // Usar el contenedor de chat para todas las frases
    const chatContainer = document.getElementById('chatContainer');
    
    // Crear mensaje de chat
    const chatMessage = document.createElement('div');
    chatMessage.className = 'chat-message';
    
    // Determinar el tipo de mensaje para styling
    let messageClass = '';
    let speaker = '';
    
    switch(tipo) {
        case 'empleado':
            messageClass = 'empleado';
            speaker = 'EMPLEADO';
            break;
        case 'cliente':
            messageClass = 'cliente';
            speaker = 'CLIENTE';
            break;
        case 'chisme':
            messageClass = 'chisme';
            speaker = 'CHISME';
            break;
        case 'curiosidad':
            messageClass = 'curiosidad';
            speaker = 'CURIOSIDAD';
            break;
        default:
            messageClass = 'videoclub';
            speaker = 'VIDEOCLUB';
    }
    
    chatMessage.classList.add(messageClass);
    
    // Crear estructura del mensaje
    chatMessage.innerHTML = `
        <div class="chat-speaker">${speaker}</div>
        <div class="chat-text">${texto}</div>
    `;
    
    // Agregar animación de entrada
    chatMessage.style.animation = 'chatSlideIn 0.3s ease-out';
    
    // Agregar al contenedor de chat
    chatContainer.appendChild(chatMessage);
    
    // Mantener máximo 6 mensajes en el chat
    const allMessages = chatContainer.querySelectorAll('.chat-message');
    if (allMessages.length > 6) {
        // Remover los mensajes más antiguos (los de arriba)
        for (let i = 0; i < allMessages.length - 6; i++) {
            chatContainer.removeChild(allMessages[i]);
        }
    }
    
    // Remover mensaje después de 8 segundos
    setTimeout(() => {
        if (chatMessage.parentNode) {
            chatMessage.parentNode.removeChild(chatMessage);
        }
    }, 8000);
}

// Función para iniciar el sistema de frases
function iniciarSistemaFrases() {
    // Limpiar timer anterior si existe
    if (fraseTimer) {
        clearTimeout(fraseTimer);
    }
    
    // Comenzar después de 5 segundos del inicio del juego
    fraseTimer = setTimeout(mostrarFraseAleatoria, 5000);
}

// Función para detener el sistema de frases
function detenerSistemaFrases() {
    if (fraseTimer) {
        clearTimeout(fraseTimer);
        fraseTimer = null;
    }
    
    // Remover frases existentes
    const frasesExistentes = document.querySelectorAll('.phrase-overlay');
    frasesExistentes.forEach(frase => {
        if (frase.parentNode) {
            frase.parentNode.removeChild(frase);
        }
    });
}

// Función para limpiar todos los mensajes del chat
function limpiarChat() {
    const chatContainer = document.getElementById('chatContainer');
    if (chatContainer) {
        // Obtener todos los mensajes del chat
        const mensajes = chatContainer.querySelectorAll('.chat-message');
        
        // Agregar animación de salida y luego remover
        mensajes.forEach((mensaje, index) => {
            setTimeout(() => {
                mensaje.style.animation = 'chatSlideOut 0.3s ease-in forwards';
                setTimeout(() => {
                    if (mensaje.parentNode) {
                        mensaje.parentNode.removeChild(mensaje);
                    }
                }, 300); // Esperar que termine la animación
            }, index * 50); // Escalonar las animaciones
        });
    }
}

// Sistema de Audio Web Audio API
class ChiptuneAudio {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.isPlaying = false;
        this.wasPlaying = false; // Para manejar pausa
        this.backgroundMusic = null;
        this.backgroundTimeouts = []; // Array para gestionar timeouts
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
    
    // Melodías inspiradas en éxitos de los 80s
    get80sMelodies() {
        return [
            // 1987 - Melodías del año
            [
                // "Take On Me" - A-ha
                [
                    {freq: 659.25, duration: 0.3}, {freq: 659.25, duration: 0.3},
                    {freq: 698.46, duration: 0.3}, {freq: 698.46, duration: 0.3},
                    {freq: 659.25, duration: 0.3}, {freq: 587.33, duration: 0.3},
                    {freq: 523.25, duration: 0.6}, {freq: 0, duration: 0.3},
                    {freq: 523.25, duration: 0.3}, {freq: 587.33, duration: 0.3},
                    {freq: 659.25, duration: 0.6}, {freq: 587.33, duration: 0.6},
                    {freq: 523.25, duration: 0.6}
                ],
                // "Living on a Prayer" - Bon Jovi
                [
                    {freq: 293.66, duration: 0.4}, {freq: 369.99, duration: 0.4},
                    {freq: 440.00, duration: 0.4}, {freq: 369.99, duration: 0.4},
                    {freq: 293.66, duration: 0.8}, {freq: 261.63, duration: 0.4},
                    {freq: 293.66, duration: 0.4}, {freq: 369.99, duration: 0.8},
                    {freq: 440.00, duration: 1.2}
                ],
                // "Here I Go Again" - Whitesnake
                [
                    {freq: 392.00, duration: 0.5}, {freq: 329.63, duration: 0.5},
                    {freq: 261.63, duration: 0.5}, {freq: 329.63, duration: 0.5},
                    {freq: 392.00, duration: 1.0}, {freq: 523.25, duration: 0.5},
                    {freq: 440.00, duration: 0.5}, {freq: 392.00, duration: 1.0}
                ]
            ],
            
            // 1988 - Melodías del año
            [
                // "Sweet Dreams" - Eurythmics
                [
                    {freq: 293.66, duration: 0.4}, {freq: 329.63, duration: 0.4},
                    {freq: 369.99, duration: 0.4}, {freq: 293.66, duration: 0.4},
                    {freq: 329.63, duration: 0.4}, {freq: 369.99, duration: 0.4},
                    {freq: 440.00, duration: 0.8}, {freq: 392.00, duration: 0.4},
                    {freq: 369.99, duration: 0.4}, {freq: 329.63, duration: 0.8},
                    {freq: 293.66, duration: 1.2}
                ],
                // "Sweet Child O' Mine" - Guns N' Roses
                [
                    {freq: 587.33, duration: 0.3}, {freq: 659.25, duration: 0.3},
                    {freq: 587.33, duration: 0.3}, {freq: 523.25, duration: 0.3},
                    {freq: 440.00, duration: 0.6}, {freq: 523.25, duration: 0.3},
                    {freq: 587.33, duration: 0.6}, {freq: 659.25, duration: 0.9}
                ],
                // "Don't Worry Be Happy" - Bobby McFerrin
                [
                    {freq: 523.25, duration: 0.4}, {freq: 587.33, duration: 0.4},
                    {freq: 523.25, duration: 0.4}, {freq: 440.00, duration: 0.4},
                    {freq: 392.00, duration: 0.8}, {freq: 440.00, duration: 0.4},
                    {freq: 523.25, duration: 1.2}
                ]
            ],
            
            // 1989 - Melodías del año
            [
                // "Blue Monday" - New Order
                [
                    {freq: 261.63, duration: 0.5}, {freq: 293.66, duration: 0.5},
                    {freq: 329.63, duration: 0.5}, {freq: 293.66, duration: 0.5},
                    {freq: 261.63, duration: 0.5}, {freq: 220.00, duration: 0.5},
                    {freq: 246.94, duration: 0.5}, {freq: 261.63, duration: 0.5},
                    {freq: 329.63, duration: 1.0}, {freq: 293.66, duration: 1.0}
                ],
                // "Like a Prayer" - Madonna
                [
                    {freq: 392.00, duration: 0.6}, {freq: 440.00, duration: 0.3},
                    {freq: 493.88, duration: 0.6}, {freq: 440.00, duration: 0.3},
                    {freq: 392.00, duration: 0.6}, {freq: 329.63, duration: 0.6},
                    {freq: 392.00, duration: 1.2}
                ],
                // "Love Shack" - B-52's
                [
                    {freq: 329.63, duration: 0.4}, {freq: 369.99, duration: 0.4},
                    {freq: 329.63, duration: 0.4}, {freq: 293.66, duration: 0.4},
                    {freq: 329.63, duration: 0.8}, {freq: 440.00, duration: 0.8},
                    {freq: 329.63, duration: 0.8}
                ]
            ],
            
            // 1990 - Melodías del año
            [
                // "Don't You Forget About Me" - Simple Minds
                [
                    {freq: 392.00, duration: 0.6}, {freq: 440.00, duration: 0.6},
                    {freq: 493.88, duration: 0.6}, {freq: 523.25, duration: 0.6},
                    {freq: 493.88, duration: 0.6}, {freq: 440.00, duration: 0.6},
                    {freq: 392.00, duration: 1.2}, {freq: 329.63, duration: 0.6},
                    {freq: 392.00, duration: 0.6}, {freq: 440.00, duration: 1.2}
                ],
                // "Vogue" - Madonna
                [
                    {freq: 523.25, duration: 0.4}, {freq: 523.25, duration: 0.4},
                    {freq: 587.33, duration: 0.4}, {freq: 523.25, duration: 0.4},
                    {freq: 440.00, duration: 0.8}, {freq: 523.25, duration: 0.8},
                    {freq: 587.33, duration: 1.2}
                ],
                // "Nothing Compares 2 U" - Sinéad O'Connor
                [
                    {freq: 659.25, duration: 0.8}, {freq: 587.33, duration: 0.4},
                    {freq: 523.25, duration: 0.8}, {freq: 587.33, duration: 0.4},
                    {freq: 659.25, duration: 0.8}, {freq: 523.25, duration: 1.2}
                ]
            ],
            
            // 1991 - Melodías del año
            [
                // "Girls Just Want to Have Fun" - Cyndi Lauper
                [
                    {freq: 523.25, duration: 0.4}, {freq: 587.33, duration: 0.4},
                    {freq: 659.25, duration: 0.4}, {freq: 698.46, duration: 0.4},
                    {freq: 783.99, duration: 0.8}, {freq: 659.25, duration: 0.4},
                    {freq: 587.33, duration: 0.4}, {freq: 523.25, duration: 0.8},
                    {freq: 440.00, duration: 0.4}, {freq: 493.88, duration: 0.4},
                    {freq: 523.25, duration: 1.2}
                ],
                // "Everything I Do" - Bryan Adams
                [
                    {freq: 440.00, duration: 0.8}, {freq: 493.88, duration: 0.4},
                    {freq: 523.25, duration: 0.8}, {freq: 493.88, duration: 0.4},
                    {freq: 440.00, duration: 1.2}, {freq: 392.00, duration: 0.8}
                ],
                // "Smells Like Teen Spirit" - Nirvana
                [
                    {freq: 329.63, duration: 0.4}, {freq: 329.63, duration: 0.4},
                    {freq: 369.99, duration: 0.4}, {freq: 329.63, duration: 0.4},
                    {freq: 293.66, duration: 0.8}, {freq: 329.63, duration: 0.8}
                ]
            ],
            
            // 1992 - Melodías del año
            [
                // "Time After Time" - Cyndi Lauper
                [
                    {freq: 659.25, duration: 0.8}, {freq: 587.33, duration: 0.4},
                    {freq: 523.25, duration: 0.8}, {freq: 440.00, duration: 0.4},
                    {freq: 493.88, duration: 0.8}, {freq: 523.25, duration: 0.8},
                    {freq: 587.33, duration: 0.8}, {freq: 659.25, duration: 1.2},
                    {freq: 523.25, duration: 1.2}
                ],
                // "I Will Always Love You" - Whitney Houston
                [
                    {freq: 523.25, duration: 1.0}, {freq: 587.33, duration: 0.5},
                    {freq: 659.25, duration: 1.0}, {freq: 783.99, duration: 0.5},
                    {freq: 659.25, duration: 1.0}, {freq: 523.25, duration: 1.5}
                ],
                // "November Rain" - Guns N' Roses
                [
                    {freq: 392.00, duration: 0.6}, {freq: 440.00, duration: 0.6},
                    {freq: 523.25, duration: 0.6}, {freq: 587.33, duration: 0.6},
                    {freq: 523.25, duration: 1.2}, {freq: 440.00, duration: 1.2}
                ]
            ]
        ];
    }
    
    getCurrentMelody() {
        const melodiesByYear = this.get80sMelodies();
        const year = gameState.currentYear;
        const yearIndex = Math.max(0, Math.min(5, year - 1987)); // Clamp entre 0-5
        
        const melodiesForYear = melodiesByYear[yearIndex];
        if (melodiesForYear && melodiesForYear.length > 0) {
            // Seleccionar melodía aleatoria para el año
            const randomIndex = Math.floor(Math.random() * melodiesForYear.length);
            return melodiesForYear[randomIndex];
        }
        
        // Fallback a la primera melodía del primer año
        return melodiesByYear[0][0];
    }
    
    playBackgroundLoop() {
        if (!this.isPlaying || !this.audioContext) return;
        
        const melody = this.getCurrentMelody();
        const baseVolume = 0.15; // Más suave para ambiente
        
        let totalDuration = 0;
        melody.forEach((note, index) => {
            const timeoutId = setTimeout(() => {
                if (this.isPlaying) {
                    if (note.freq > 0) {
                        // Usar synth wave con filtros
                        this.playSynthNote(note.freq, note.duration, baseVolume);
                    }
                    if (index === melody.length - 1) {
                        // Añadir pausa entre repeticiones
                        const loopTimeoutId = setTimeout(() => this.playBackgroundLoop(), (note.duration + 0.5) * 1000);
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
    // Asegurar que solo el menú sea visible al inicio
    document.getElementById('mainMenu').style.display = 'flex';
    document.querySelector('.header').style.display = 'none';
    document.getElementById('gameArea').style.display = 'none';
    document.getElementById('videoclubSlots').style.display = 'none';
    
    // Mostrar botón PWA en navegadores compatibles
    const installButton = document.getElementById('installButton');
    if (installButton && (navigator.userAgent.includes('Chrome') || navigator.userAgent.includes('Edg'))) {
        installButton.classList.add('show');
    }
    
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
    // Asegurar que cualquier juego anterior esté completamente detenido
    if (gameState.isPlaying) {
        gameOver();
        // Esperar un momento para que se complete la limpieza
        setTimeout(() => startGame(), 100);
        return;
    }
    
    // Limpiar todos los timers previos
    clearAllGameTimers();
    
    // Limpiar el chat al iniciar nuevo juego
    limpiarChat();
    
    // Ocultar menú y mostrar elementos del juego
    document.getElementById('mainMenu').style.display = 'none';
    document.querySelector('.header').style.display = 'flex';
    document.getElementById('gameArea').style.display = 'block';
    document.getElementById('videoclubSlots').style.display = 'flex';
    
    // Resetear completamente el estado del juego
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.lives = 3;
    gameState.year = 1987;
    gameState.currentYear = 1987; 
    gameState.combo = 1;
    gameState.customersServed = 0;
    gameState.customers = [];
    gameState.powerUps = [];
    gameState.activePowerUps = {};
    gameState.comboCount = 0;
    gameState.difficulty = 1;
    gameState.selectedItem = null;
    
    // Limpiar cualquier elemento residual en el DOM
    const gameArea = document.getElementById('gameArea');
    const existingCustomers = gameArea.querySelectorAll('.customer');
    const existingPowerUps = gameArea.querySelectorAll('.power-up');
    const existingParticles = gameArea.querySelectorAll('.particle');
    const existingComboTexts = gameArea.querySelectorAll('.combo-text');
    
    [...existingCustomers, ...existingPowerUps, ...existingParticles, ...existingComboTexts].forEach(element => {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    });
    
    updateDisplay();
    
    // Iniciar música de fondo
    audioSystem.startBackgroundMusic();
    
    gameLoop();
    
    // Iniciar sistema de cambio aleatorio de botones
    startButtonShuffle();
    
    // Iniciar sistema de frases nostálgicas
    iniciarSistemaFrases();
    
    // Iniciar spawns con gestión de timers
    gameTimers.customerSpawn = setTimeout(spawnCustomer, 1000);
    gameTimers.powerUpSpawn = setTimeout(spawnPowerUp, gameConfig.powerUpSpawnRate);
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
    
    // Actualizar display prominente del año
    const yearDisplay = document.getElementById('yearDisplay');
    const yearNostalgia = document.getElementById('yearNostalgia');
    
    if (yearDisplay) {
        yearDisplay.textContent = gameState.year;
    }
    
    if (yearNostalgia && gameConfig.nostalgicPhrases[gameState.year]) {
        const phrases = gameConfig.nostalgicPhrases[gameState.year];
        const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
        yearNostalgia.textContent = randomPhrase;
    }
}

// Función de vibración táctil
function triggerVibration(pattern = [50]) {
    // Verificar si el dispositivo soporta vibración
    if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
    }
}

// Seleccionar item
function selectItem(itemType) {
    if (!gameState.isPlaying) return;
    
    // Vibración táctil al hacer click
    triggerVibration([30]);
    
    // Deseleccionar todos los items
    document.querySelectorAll('.item-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    
    // Seleccionar el item clickeado
    if (gameState.selectedItem === itemType) {
        gameState.selectedItem = null;
        // Vibración suave para deseleccionar
        triggerVibration([20]);
    } else {
        gameState.selectedItem = itemType;
        document.querySelector(`[data-item="${itemType}"]`).classList.add('selected');
        
        // Mostrar frase del empleado
        const itemNames = {
            'vhs': 'VHS',
            'vinyl': 'Vinilo', 
            'cassette': 'Cassette'
        };
        mostrarDialogoJuego(`Hola, claro, tomá: ${itemNames[itemType]}`, 'empleado');
        
        // Vibración más fuerte para selección exitosa
        triggerVibration([50]);
        
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
        
        // Mostrar frase de confirmación
        const itemNames = {
            'vhs': 'VHS',
            'vinyl': 'Vinilo', 
            'cassette': 'Cassette'
        };
        mostrarDialogoJuego(`Perfecto, aquí tenés tu ${itemNames[gameState.selectedItem]}`, 'empleado');
        
        // Vibración de éxito
        triggerVibration([60, 30, 60]);
        
    } else {
        // Error
        gameState.lives--;
        gameState.combo = 1;
        gameState.comboCount = 0;
        // Mostrar mensaje centrado en la pantalla
        const gameArea = document.getElementById('gameArea');
        const centerX = gameArea.offsetWidth / 2;
        const centerY = gameArea.offsetHeight / 2;
        showScoreDisplay('¡ERROR!', centerX, centerY);
        createParticles(customer.element.offsetLeft + 50, customer.element.offsetTop + 60, '#ff0000');
        
        // Sonido de error
        playSound('wrong');
        
        // Mostrar frase de error
        mostrarDialogoJuego('¡Ups! Eso no era lo que pedí...', 'cliente');
        
        // Vibración de error (más intensa)
        triggerVibration([100, 50, 100, 50, 100]);
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
        gameTimers.customerSpawn = setTimeout(spawnCustomer, 1000);
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
    
    // Mostrar frase del cliente
    setTimeout(() => {
        mostrarDialogoJuego(`${customerName}: Hola quiero: ${specificProduct}`, 'cliente');
    }, 500); // Esperar un poco para que aparezca el cliente
    
    // Programar siguiente cliente
    const spawnDelay = Math.max(1000, gameConfig.customerSpawnRate - (gameState.difficulty * 200));
    gameTimers.customerSpawn = setTimeout(spawnCustomer, spawnDelay);
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
        <div class="patience-label">Nivel de paciencia</div>
        <div class="patience-bar">
            <div class="patience-fill"></div>
        </div>
    `;
    
    return customerDiv;
}

// Animar entrada de cliente
function animateCustomerEntry(element, index) {
    const startX = -120;
    let targetX, y;
    
    // Detectar pantalla pequeña (360px o menos)
    const isSmallScreen = window.innerWidth <= 360;
    
    if (isSmallScreen) {
        // Layout compacto para pantallas pequeñas - espaciado ajustado para customers más grandes (100px)
        if (index === 0) {
            targetX = 5;   // Primer cliente más pegado al borde izquierdo
            y = 70;        // Un poco más arriba
        } else if (index === 1) {
            targetX = 110; // Segundo cliente al centro
            y = 70;
        } else if (index === 2) {
            targetX = 215; // Tercer cliente más pegado al borde derecho
            y = 70;
        } else {
            // Clientes adicionales en fila inferior
            targetX = 5 + ((index - 3) * 105);
            y = 220;       // Más espacio vertical para customers más altos
        }
    } else {
        // Layout normal para pantallas grandes
        targetX = 50 + (index * 120);
        y = 100 + (index * 30);
    }
    
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
        } else if (gameState.activePowerUps.calmCustomers) {
            customer.patience -= 6; // Café/mate los calma, pierden paciencia muy lento
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
            // Mostrar mensaje centrado en la pantalla
            const gameArea = document.getElementById('gameArea');
            const centerX = gameArea.offsetWidth / 2;
            const centerY = gameArea.offsetHeight / 2;
            showScoreDisplay('¡SE FUE!', centerX, centerY);
            playSound('angry');
            
            // Vibración cuando el cliente se va (patrón de frustración)
            triggerVibration([150, 75, 150]);
            
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
        const isSmallScreen = window.innerWidth <= 360;
        let newX, newY;
        
        if (isSmallScreen) {
            // Layout compacto para pantallas pequeñas - espaciado ajustado para customers más grandes
            if (i === 0) {
                newX = 5;
                newY = 70;
            } else if (i === 1) {
                newX = 110;
                newY = 70;
            } else if (i === 2) {
                newX = 215;
                newY = 70;
            } else {
                newX = 5 + ((i - 3) * 105);
                newY = 220;
            }
            
            // Animar posición X e Y
            c.element.animate([
                { 
                    left: c.element.offsetLeft + 'px',
                    top: c.element.offsetTop + 'px'
                },
                { 
                    left: newX + 'px',
                    top: newY + 'px'
                }
            ], {
                duration: 300,
                easing: 'ease-out',
                fill: 'forwards'
            });
        } else {
            // Layout normal para pantallas grandes
            newX = 50 + (i * 120);
            c.element.animate([
                { left: c.element.offsetLeft + 'px' },
                { left: newX + 'px' }
            ], {
                duration: 300,
                easing: 'ease-out',
                fill: 'forwards'
            });
        }
    });
}

// Generar power-up
function spawnPowerUp() {
    if (!gameState.isPlaying || gameState.powerUps.length > 0) {
        gameTimers.powerUpSpawn = setTimeout(spawnPowerUp, gameConfig.powerUpSpawnRate);
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
    gameTimers.powerUpSpawn = setTimeout(spawnPowerUp, gameConfig.powerUpSpawnRate);
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
        case 'calmCustomers':
            gameState.customers.forEach(customer => {
                customer.patience = Math.min(customer.patience + 200, customer.maxPatience);
            });
            // Mensaje específico según el tipo
            if (type === 'cafe') {
                showScoreDisplay('☕ CAFÉ PARA TODOS!', 400, 200);
                mostrarFraseEnVideoclub('👨‍💼 EMPLEADO: che, ¿querés un cafecito mientras esperás?', 'empleado');
            } else if (type === 'mate') {
                showScoreDisplay('🧉 MATE ARGENTINO!', 400, 200);
                mostrarFraseEnVideoclub('👨‍💼 EMPLEADO: dale, probá este mate que está buenísimo', 'empleado');
            }
            break;
    }
    
    removePowerUp(0);
    playSound('powerup');
    
    // Mostrar mensaje general solo si no es café/mate (que ya tienen mensaje específico)
    if (type !== 'cafe' && type !== 'mate') {
        showScoreDisplay('POWER-UP!', 400, 200);
    }
    
    // Vibración especial para power-ups
    triggerVibration([80, 40, 80, 40, 120]);
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
    // Avanzar año cada 15 clientes servidos, máximo hasta 1992
    const clientesParaAvance = 15;
    const añoObjetivo = 1987 + Math.floor(gameState.customersServed / clientesParaAvance);
    
    if (gameState.year < añoObjetivo && gameState.year < 1992) {
        gameState.year++;
        gameState.currentYear = gameState.year; // Actualizar currentYear para la música
        gameState.difficulty += 0.1; // Incremento más suave de dificultad
        
        // Cambiar música si es necesario
        if (audioEnabled && audioSystem.isPlaying) {
            // Reiniciar música con nueva melodía
            audioSystem.stopBackgroundMusic();
            setTimeout(() => {
                audioSystem.startBackgroundMusic();
            }, 500);
        }
        
        showYearTransition();
    }
}

// Mostrar transición de año
function showYearTransition() {
    const yearElement = document.getElementById('yearTransition');
    const yearTitle = document.getElementById('yearTitle');
    const yearEvent = document.getElementById('yearEvent');
    
    yearTitle.textContent = gameState.year;
    
    // Seleccionar evento aleatorio para el año
    const yearIndex = gameState.year - 1987; // Convertir año a índice (0-5)
    const eventsForYear = gameConfig.yearEvents[yearIndex];
    
    if (eventsForYear && eventsForYear.length > 0) {
        const randomEvent = eventsForYear[Math.floor(Math.random() * eventsForYear.length)];
        yearEvent.textContent = randomEvent;
    } else {
        yearEvent.textContent = "¡Un nuevo año lleno de entretenimiento!";
    }
    
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
    
    // Limpiar todos los timers del juego
    clearAllGameTimers();
    
    // Detener sistema de cambio aleatorio de botones
    stopButtonShuffle();
    
    // Detener sistema de frases nostálgicas
    detenerSistemaFrases();
    
    // Limpiar todos los mensajes del chat
    limpiarChat();
    
    // Detener música de fondo completamente
    audioSystem.stopBackgroundMusic();
    
    // Limpiar arrays de estado
    gameState.customers.forEach(customer => {
        if (customer.element && customer.element.parentNode) {
            customer.element.parentNode.removeChild(customer.element);
        }
    });
    
    gameState.powerUps.forEach(powerUp => {
        if (powerUp.element && powerUp.element.parentNode) {
            powerUp.element.parentNode.removeChild(powerUp.element);
        }
    });
    
    // Limpiar completamente los arrays
    gameState.customers = [];
    gameState.powerUps = [];
    gameState.activePowerUps = {};
    
    // Limpiar elementos residuales del DOM
    const gameArea = document.getElementById('gameArea');
    if (gameArea) {
        const residualElements = gameArea.querySelectorAll('.customer, .power-up, .particle, .combo-text');
        residualElements.forEach(element => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
    }
    
    // Guardar high score
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('retroVideoClubHighScore', gameState.highScore);
        showScoreDisplay('¡NUEVO RÉCORD!', 400, 250);
    }
    
    // Mostrar mensaje de game over
    gameTimers.gameOverMessage = setTimeout(() => {
        const messages = [
            "¡Los clientes se fueron al Blockbuster! 😢",
            "¡VideoClub Sandy no pudo competir con las cadenas! 📼",
            "¡Los clientes prefirieron Netflix! 💻",
            "¡Sandy no sobrevivió a los 80s! 🎬",
            "¡El VideoClub Sandy cerró sus puertas! 🏪",
            "¡E.T. se llevó todas las cintas a casa! 🛸",
            "¡Los Cazafantasmas eliminaron tu inventario! 👻",
            "¡Marty McFly volvió al futuro sin sus películas! ⏰",
            "¡Madonna se robó todos los vinilos! 👑",
            "¡A-ha se llevó 'Take On Me' y todo lo demás! 🎵",
            "¡Los clientes eligieron Atari en vez de videos! 🕹️",
            "¡MTV mató a la radio star y a tu videoclub! 📺",
            "¡El DeLorean se llevó todas las ganancias! 🚗",
            "¡Pac-Man se comió todos tus cassettes! 🟡",
            "¡Los Gremlins sabotearon tu negocio! 👹",
            "¡Flash Gordon derrotó a tu videoclub! ⚡",
            "¡Top Gun voló lejos con tus clientes! ✈️",
            "¡Terminator eliminó tu futuro! 🤖",
            "¡Los clientes fueron por el desayuno! 🥞",
            "¡Ferris Bueller se saltó tu videoclub! 🏫",
            "¡Dirty Dancing bailó lejos de aquí! 💃",
            "¡Los Goonies encontraron un tesoro mejor! 🏴‍☠️",
            "¡Karate Kid pateó tu negocio! 🥋",
            "¡Blade Runner cortó tus conexiones! 🗺️",
            "¡La Historia Sin Fin terminó mal! 📚"
        ];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        showCRTModal(randomMessage);
    }, 2000);
}

// Mostrar puntuación flotante
function showScoreDisplay(text, x, y) {
    const scoreElement = document.getElementById('scoreDisplay');
    scoreElement.textContent = text;
    
    // Asegurar que las coordenadas estén dentro de la pantalla
    const gameArea = document.getElementById('gameArea');
    const rect = gameArea.getBoundingClientRect();
    
    // Limitar las coordenadas para que el texto sea visible
    const clampedX = Math.max(100, Math.min(x, rect.width - 100));
    const clampedY = Math.max(100, Math.min(y, rect.height - 100));
    
    scoreElement.style.left = clampedX + 'px';
    scoreElement.style.top = clampedY + 'px';
    scoreElement.style.opacity = '1';
    scoreElement.style.zIndex = '1000';
    
    // Animación mejorada
    const animation = scoreElement.animate([
        { 
            opacity: 1, 
            transform: 'translate(-50%, -50%) scale(1)', 
            filter: 'drop-shadow(0 0 10px currentColor)'
        },
        { 
            opacity: 0, 
            transform: 'translate(-50%, -90px) scale(1.3)', 
            filter: 'drop-shadow(0 0 20px currentColor)'
        }
    ], {
        duration: 2000,
        easing: 'ease-out'
    });
    
    // Asegurar que el elemento se oculte después de la animación
    animation.onfinish = () => {
        scoreElement.style.opacity = '0';
    };
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
    console.log('showInstructions called');
    const modal = document.getElementById('instructionsModal');
    console.log('Modal element:', modal);
    
    if (modal) {
        modal.style.display = 'flex';
        modal.style.opacity = '0';
        
        // Añadir clase show después de un pequeño delay para la animación
        setTimeout(() => {
            modal.classList.add('show');
            modal.style.opacity = '1';
        }, 10);
        
        // Efecto de vibración retro (con try-catch para evitar errores)
        try {
            triggerVibration([50, 50, 50]);
        } catch (e) {
            console.log('Vibration not supported');
        }
    } else {
        console.error('Modal instructionsModal not found');
        // Fallback al alert si no se encuentra el modal
        alert(`📖 INSTRUCCIONES - VIDEOCLUB SANDY 📖\n\n🔊 IMPORTANTE: Activa el audio primero para disfrutar de la música y efectos.\n\n🎯 OBJETIVO:\nAtiende a los clientes del videoclub antes de que se impacienten.\n\n🎮 CÓMO JUGAR:\n• Los clientes llegan pidiendo VHS 🎥, vinilos 💿 o cassettes 📼\n• Haz clic en el ítem correcto para servirlos\n• ¡No los hagas esperar mucho!\n\n⚡ POWER-UPS:\n🎧 Walkman - Ralentiza el tiempo\n🌟 Madonna - Clientes contentos\n🕹️ Nintendo - Puntos dobles\n\n🏆 COMBOS:\nSirve 3 clientes seguidos sin fallar para aumentar tu multiplicador.\n\n📅 PROGRESIÓN:\nCada 15 clientes avanzas un año y aumenta la dificultad.`);
    }
}

function closeInstructions() {
    console.log('closeInstructions called');
    const modal = document.getElementById('instructionsModal');
    
    if (modal) {
        modal.classList.remove('show');
        modal.style.opacity = '0';
        
        setTimeout(() => {
            modal.style.display = 'none';
        }, 500);
        
        // Vibración suave al cerrar
        try {
            triggerVibration([30]);
        } catch (e) {
            console.log('Vibration not supported');
        }
    }
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

// Modal CRT para Game Over
function showCRTModal(message) {
    // Crear modal si no existe
    let modal = document.getElementById('crtModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'crtModal';
        modal.className = 'crt-modal';
        modal.innerHTML = `
            <div class="crt-screen">
                <div class="scanlines"></div>
                <div class="crt-content">
                    <div class="crt-title">📺 GAME OVER 📺</div>
                    <div class="crt-message" id="crtMessage"></div>
                    <div class="crt-stats" id="crtStats"></div>
                    <button class="crt-button" onclick="closeCRTModal()">CONTINUAR</button>
                </div>
                <div class="crt-noise"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Actualizar contenido
    document.getElementById('crtMessage').textContent = message;
    document.getElementById('crtStats').innerHTML = `
        <div>PUNTUACIÓN: ${gameState.score.toLocaleString()}</div>
        <div>AÑO ALCANZADO: ${gameState.year}</div>
        <div>CLIENTES ATENDIDOS: ${gameState.customersServed}</div>
    `;
    
    // Mostrar modal con efecto
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 100);
    
    // Efecto de sonido retro
    if (audioEnabled) {
        playGameOverSound();
    }
}

function closeCRTModal() {
    const modal = document.getElementById('crtModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            
            // Ocultar elementos del juego y mostrar menú
            document.querySelector('.header').style.display = 'none';
            document.getElementById('gameArea').style.display = 'none';
            document.getElementById('videoclubSlots').style.display = 'none';
            document.getElementById('mainMenu').style.display = 'flex';
        }, 500);
    }
}

function playGameOverSound() {
    // Sonido de TV apagándose de los 80s
    const frequencies = [800, 400, 200, 100, 50];
    frequencies.forEach((freq, index) => {
        setTimeout(() => {
            audioSystem.createOscillator(freq, 'sawtooth', 0.3);
        }, index * 100);
    });
}

// Sistema de chispas ochentosas
function createSparkEffect(x, y) {
    const sparkContainer = document.createElement('div');
    sparkContainer.className = 'spark-container';
    sparkContainer.style.position = 'fixed';
    sparkContainer.style.left = x + 'px';
    sparkContainer.style.top = y + 'px';
    sparkContainer.style.pointerEvents = 'none';
    sparkContainer.style.zIndex = '9999';
    
    // Crear múltiples chispas
    for (let i = 0; i < 15; i++) {
        const spark = document.createElement('div');
        spark.className = 'spark-particle';
        
        // Colores neón de los 80s
        const colors = ['#ff00ff', '#00ffff', '#ffff00', '#ff0080', '#8000ff', '#00ff80'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        spark.style.background = color;
        spark.style.boxShadow = `0 0 10px ${color}`;
        
        // Posición y dirección aleatoria
        const angle = (Math.PI * 2 * i) / 15;
        const velocity = 50 + Math.random() * 50;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        spark.style.setProperty('--vx', vx + 'px');
        spark.style.setProperty('--vy', vy + 'px');
        
        sparkContainer.appendChild(spark);
    }
    
    document.body.appendChild(sparkContainer);
    
    // Eliminar después de la animación
    setTimeout(() => {
        if (sparkContainer.parentNode) {
            sparkContainer.parentNode.removeChild(sparkContainer);
        }
    }, 1000);
    
    // Sonido de chispa
    if (audioEnabled) {
        audioSystem.createOscillator(2000 + Math.random() * 1000, 'square', 0.1);
    }
}

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

// ========== FUNCIONALIDADES PWA ==========

// Detectar la disponibilidad de instalación PWA
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Mostrar el botón de instalación
    const installButton = document.getElementById('installButton');
    if (installButton) {
        installButton.classList.add('show');
    }
});

// Función para instalar la PWA
function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('PWA instalada exitosamente');
                triggerVibration([100, 50, 100]);
            }
            deferredPrompt = null;
            
            // Ocultar el botón después del prompt
            const installButton = document.getElementById('installButton');
            if (installButton) {
                installButton.classList.remove('show');
            }
        });
    }
}

// ========== CAMBIO ALEATORIO DE BOTONES ==========

// Crear sonido para cambio de botones
function createShuffleSound() {
    if (!audioSystem.audioContext) return null;
    
    const oscillator = audioSystem.audioContext.createOscillator();
    const gainNode = audioSystem.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioSystem.audioContext.destination);
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(800, audioSystem.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioSystem.audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioSystem.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioSystem.audioContext.currentTime + 0.15);
    
    oscillator.start(audioSystem.audioContext.currentTime);
    oscillator.stop(audioSystem.audioContext.currentTime + 0.15);
    
    return oscillator;
}

// Función para cambiar aleatoriamente las posiciones de los botones
function shuffleButtons() {
    if (!gameState.isPlaying) return;
    
    const slots = document.querySelectorAll('.item-slot');
    if (slots.length < 3) return;
    
    // Crear array con los contenidos actuales
    const buttonData = Array.from(slots).map(slot => ({
        emoji: slot.textContent,
        dataItem: slot.getAttribute('data-item'),
        onclick: slot.getAttribute('onclick')
    }));
    
    // Mezclar el array usando Fisher-Yates
    for (let i = buttonData.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [buttonData[i], buttonData[j]] = [buttonData[j], buttonData[i]];
    }
    
    // Aplicar efecto visual de cambio
    slots.forEach(slot => {
        slot.style.transform = 'scale(0.8) rotate(10deg)';
        slot.style.filter = 'blur(2px)';
    });
    
    // Reproducir sonido
    createShuffleSound();
    triggerVibration([80, 30, 80, 30, 80]);
    
    // Después de 200ms, aplicar los nuevos datos
    setTimeout(() => {
        buttonData.forEach((data, index) => {
            slots[index].textContent = data.emoji;
            slots[index].setAttribute('data-item', data.dataItem);
            slots[index].setAttribute('onclick', data.onclick);
        });
        
        // Restaurar el estilo
        slots.forEach(slot => {
            slot.style.transform = 'scale(1) rotate(0deg)';
            slot.style.filter = 'none';
        });
        
        buttonShuffleCount++;
        
        // Programar el siguiente cambio (cada 8-15 segundos)
        if (gameState.isPlaying) {
            const nextShuffleTime = 8000 + Math.random() * 7000;
            gameTimers.buttonShuffle = setTimeout(shuffleButtons, nextShuffleTime);
        }
        
    }, 200);
}

// Función para iniciar el sistema de cambio aleatorio
function startButtonShuffle() {
    if (gameState.isPlaying) {
        // Primer cambio después de 10-20 segundos
        const firstShuffleTime = 10000 + Math.random() * 10000;
        gameTimers.buttonShuffle = setTimeout(shuffleButtons, firstShuffleTime);
    }
}

// Función para detener el cambio aleatorio
function stopButtonShuffle() {
    if (gameTimers.buttonShuffle) {
        clearTimeout(gameTimers.buttonShuffle);
        gameTimers.buttonShuffle = null;
    }
}

// ========== INICIALIZACIÓN ==========

// Inicializar cuando se carga la página
window.addEventListener('load', () => {
    initGame();
    
    // Agregar event listeners para los posters
    document.querySelectorAll('.movie-poster').forEach(poster => {
        poster.addEventListener('click', (e) => {
            // Vibración suave para posters
            triggerVibration([40]);
            createSparkEffect(e.clientX, e.clientY);
        });
    });
});

// Agregar efectos de chispas al hacer click en cualquier parte
document.addEventListener('click', (e) => {
    // Solo durante el juego y no en botones/elementos interactivos
    if (gameState.isPlaying && !e.target.closest('button, .item-slot, .customer, .power-up, .movie-poster')) {
        createSparkEffect(e.clientX, e.clientY);
    }
});

// Reposicionar customers cuando cambie el tamaño de pantalla
window.addEventListener('resize', () => {
    if (gameState.isPlaying && gameState.customers.length > 0) {
        gameState.customers.forEach((customer, index) => {
            const isSmallScreen = window.innerWidth <= 360;
            let newX, newY;
            
            if (isSmallScreen) {
                if (index === 0) {
                    newX = 5;
                    newY = 70;
                } else if (index === 1) {
                    newX = 110;
                    newY = 70;
                } else if (index === 2) {
                    newX = 215;
                    newY = 70;
                } else {
                    newX = 5 + ((index - 3) * 105);
                    newY = 220;
                }
            } else {
                newX = 50 + (index * 120);
                newY = 100 + (index * 30);
            }
            
            customer.element.style.left = newX + 'px';
            customer.element.style.top = newY + 'px';
        });
    }
});

// Sistema de pausa del juego
let gamePaused = false;
let pausedTimers = [];

// Event listener para tecla Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && gameState.isPlaying && !gamePaused) {
        showPauseModal();
    }
});

// Mostrar modal de pausa
function showPauseModal() {
    if (!gameState.isPlaying) return;
    
    gamePaused = true;
    
    // Pausar todos los timers del juego
    pauseAllGameTimers();
    
    // Actualizar estadísticas en el modal
    updatePauseStats();
    
    // Mostrar modal
    const pauseModal = document.getElementById('pauseModal');
    pauseModal.style.display = 'flex';
    setTimeout(() => {
        pauseModal.classList.add('show');
    }, 10);
    
    // Pausar música
    if (audioSystem && audioSystem.isPlaying) {
        audioSystem.pauseBackgroundMusic();
    }
}

// Cerrar modal de pausa y continuar juego
function closePauseModal() {
    if (!gamePaused) return;
    
    const pauseModal = document.getElementById('pauseModal');
    pauseModal.classList.remove('show');
    
    setTimeout(() => {
        pauseModal.style.display = 'none';
        gamePaused = false;
        
        // Reanudar timers
        resumeAllGameTimers();
        
        // Reanudar música
        if (audioSystem) {
            audioSystem.resumeBackgroundMusic();
        }
    }, 300);
}

// Salir al menú principal
function exitToMenu() {
    const pauseModal = document.getElementById('pauseModal');
    pauseModal.classList.remove('show');
    
    setTimeout(() => {
        pauseModal.style.display = 'none';
        gamePaused = false;
        
        // Terminar juego y volver al menú
        gameOver();
        setTimeout(() => {
            // Ocultar cualquier modal de game over
            const crtModal = document.querySelector('.crt-modal');
            if (crtModal) {
                crtModal.style.display = 'none';
            }
            
            // Mostrar menú principal
            document.getElementById('gameArea').style.display = 'none';
            document.querySelector('.header').style.display = 'none';
            document.getElementById('mainMenu').style.display = 'flex';
        }, 500);
    }, 300);
}

// Actualizar estadísticas en modal de pausa
function updatePauseStats() {
    document.getElementById('pauseScore').textContent = gameState.score;
    document.getElementById('pauseLives').textContent = '❤️'.repeat(gameState.lives);
    document.getElementById('pauseYear').textContent = gameState.year;
    document.getElementById('pauseCombo').textContent = 'x' + gameState.combo;
}

// Pausar todos los timers del juego
function pauseAllGameTimers() {
    // Guardar y limpiar timers de spawn
    if (gameTimers.customerSpawn) {
        clearTimeout(gameTimers.customerSpawn);
        gameTimers.customerSpawn = null;
    }
    
    if (gameTimers.powerUpSpawn) {
        clearTimeout(gameTimers.powerUpSpawn);
        gameTimers.powerUpSpawn = null;
    }
    
    // Pausar timers de clientes individuales
    gameState.customers.forEach(customer => {
        if (customer.patienceTimer) {
            clearTimeout(customer.patienceTimer);
        }
    });
    
    // Pausar timers de power-ups
    Object.keys(gameState.activePowerUps).forEach(powerUpType => {
        const powerUp = gameState.activePowerUps[powerUpType];
        if (powerUp.timer) {
            clearTimeout(powerUp.timer);
        }
    });
}

// Reanudar todos los timers del juego
function resumeAllGameTimers() {
    // Reanudar spawn de clientes y power-ups
    scheduleCustomerSpawn();
    schedulePowerUpSpawn();
    
    // Reanudar timers de clientes (recalculando tiempo restante)
    gameState.customers.forEach(customer => {
        if (customer.patience > 0) {
            const remainingTime = (customer.patience / customer.maxPatience) * customer.originalTimeout;
            customer.patienceTimer = setTimeout(() => {
                removeCustomer(customer);
            }, remainingTime);
        }
    });
    
    // Reanudar power-ups activos
    Object.keys(gameState.activePowerUps).forEach(powerUpType => {
        const powerUp = gameState.activePowerUps[powerUpType];
        if (powerUp.duration > 0) {
            powerUp.timer = setTimeout(() => {
                deactivatePowerUp(powerUpType);
            }, powerUp.duration);
        }
    });
}