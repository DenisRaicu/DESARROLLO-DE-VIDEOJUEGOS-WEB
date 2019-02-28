/**
 * MemoryGame es la clase que representa nuestro juego. Contiene un array con la cartas del juego,
 * el número de cartas encontradas (para saber cuándo hemos terminado el juego) y un texto con el mensaje
 * que indica en qué estado se encuentra el juego
 */
var MemoryGame = MemoryGame || {};

/**
 * Constructora de MemoryGame
 */
MemoryGame = function(gs) {
    // Array de mensajes que se monstraran en el juego:
    let mensajes = ["Memory Game", "You Win!!!", "Try again", "Match found!!!"];
    // Array de cartas que se mostraran en el juego:
    let cartas = ["8-ball", "potato", "dinosaur", "kronos", "rocket", "unicorn", "guy", "zeppelin"];

    //------------INFO JUEGO-------------
    // Representa el tablero de cartas: 
    this.tablero = new Array(16);
    // Guarda la puntuacion total:
    this.puntuacion = 0;

    //----------CARTA ANTERIOR-----------
    // Guarda el estado tras voltear la primera carta:
    this.anteriorVolteada = false;
    // Guarda el Id de la carta anterior:
    this.anteriorId = -1;

    //--------MENSAJES JUEGO-------------
    // Guardo estado mensaje inicio:
    this.inicio = true;
    // Guardo estado mensaje fallo: 
    this.fallo = false;
    // Guardo estado mensaje exito:
    this.exito = false;
    
    /**
     * Inicializa el juego creando las cartas (recuerda que son 2 de cada tipo de carta), 
     * desordenándolas y comenzando el bucle de juego.
     */
    this.initGame = () => {
        //Rellena el tablero de cartas en orden, es decir, una al lado de otra:
        for(let i = 0; i < 16; i++) 
            this.tablero[i] = new MemoryGameCard(cartas[Math.trunc(i/2)]);
        
       //Mezclamos las cartas:
       var aux, aux2;
       for(let i = this.tablero.length - 1; i > 0; i--) {
           //Genera un numero aleatorio comprendido en los limites del tablero:
            aux = Math.floor(Math.random() * (i + 1)); 

            //Tras haber obtenido un numero aleatorio, hacemos un interacmbio 
            //con la posicion del tablero actual (donde esta marcando la i):
            aux2 = this.tablero[i];
            this.tablero[i] = this.tablero[aux];
            this.tablero[aux] = aux2;
       }

       //Comenzamos el bucle del juego:
       this.loop();
    }

    /**
     * Es el bucle del juego. En este caso es muy sencillo: llamamos al método 
     * draw cada 16ms (equivalente a unos 60fps). Esto se realizará con la 
     * función setInterval de Javascript.
     */
    this.loop = () => { setInterval(() => { this.draw() }, 16); }

    /**
    * Este método se llama cada vez que el jugador pulsa sobre alguna de las cartas 
    * (identificada por el número que ocupan en el array de cartas del juego). 
    * Es el responsable de voltear la carta y, si haydos volteadas, comprobar si son la misma 
    * (en cuyo caso las marcará como encontradas). En caso de no ser la misma las volverá a poner boca abajo:
    */
   this.onClick = cardId => {
        //Preguntamos si la carta no esta volteada: (en caso de que sea volteada, no hacemos nada)
        if(!this.tablero[cardId].volteada){
            this.tablero[cardId].flip(); //Voltea la carta;

            //CASO 1: Cuando volteamos la segunda carta y es igual que la anterior volteada:
            if((this.anteriorVolteada) && (this.tablero[cardId].compareTo(this.tablero[this.anteriorId]))) {
                this.puntuacion++; //Incremento la puntuación;
                
                //Reinicio los datos de la carta aterior:
                this.anteriorVolteada = false; 

                //Actualizo el estado de los mensajes a mostrar: 
                this.exito = true;
                this.inicio = false;
                this.fallo = false;
            } 

            //CASO 2: Cuando volteamos la segunda carta y no es igual que la anterior volteada:
            else if((this.anteriorVolteada) && (!this.tablero[cardId].compareTo(this.tablero[this.anteriorId]))) {
                //Actualizo el estado de los mensajes a mostrar:
                this.fallo = true;
                this.exito = false;
                this.inicio = false;

                //Reinicio los datos de la carta atenrior:
                this.anteriorVolteada = false; 

                //Me deja ver un tiempo la segunda carta que no coincide y despues la voltea:
                setTimeout(() => {
                    this.tablero[cardId].flip();
                    this.tablero[this.anteriorId].flip();
                }, 400);
            } 

            //CASO 3: Cuando volteamos la primera carta: 
            else {
                //Guardamos el id y el estado de la primera carta:
                this.anteriorVolteada = true;
                this.anteriorId = cardId;
            }
        }
    }

    /**
     * Dibuja el juego, esto es: 
     * (1) escribe el mensaje con el estado actual del juego y 
     * (2) pide a cada una de las cartas del tablero que se dibujen
     */
    this.draw = () => {
        if(this.inicio) gs.drawMessage(mensajes[0]); //Mensaje inicio;
        else if(this.puntuacion === 8) gs.drawMessage(mensajes[1]); //Mensaje ganador;
        else if(this.fallo) gs.drawMessage(mensajes[2]); //Mensaje fallo (pareja fallada);
        else if(this.exito) gs.drawMessage(mensajes[3]); //Mensaje exito (pareja encontrada);

        //Dibuja las cartas del tablero:
        for (let i = 0; i < 16; i++) 
            this.tablero[i].draw(gs, i);
    }
};

/**
 * Constructora de las cartas del juego. Recibe como parámetro el nombre del sprite que representa la carta.
 * Dos cartas serán iguales si tienen el mismo sprite.
 * La carta puede guardar la posición que ocupa dentro del tablero para luego poder dibujarse
 * @param {string} id Nombre del sprite que representa la carta
 */
MemoryGameCard = function(id) {
	this.carta = id; //Representa la carta;
	this.volteada = false; //Estado de la carta (volteada o no)
	this.encontrada = false; //Estado de la carta (encontrada o no)

    //Dibuja la carta de acuerdo al estado en el que se encuentra.
    //Recibe como parámetros el servidor gráfico y la posición en la que 
    //se encuentra en el array de cartas del juego (necesario para dibujar unacarta)
	this.draw = (gs, pos) => {
		if(this.volteada) gs.draw(this.carta, pos); //Dibuja carta
		else gs.draw("back", pos); //Dibuja dorso
    }
    
     //Compara dos cartas, devolviendo true si ambas representan la misma carta:
	this.compareTo = otherCard => {
		if (this.carta === otherCard.carta) return true; //Si son iguales;
		else return false; //Si no son iguales;
	}

    //Marca una carta como encontrada, es decir cambia el estado de la misma:
	this.found = () => {
		this.encontrada = true; //Marca la carta como encontrada;
    }
    
    //Da la vuelta a la carta, cambiando el estado de la misma:
	this.flip = () => {
		if (this.volteada) this.volteada = false; //Tapa la carta;
		else this.volteada = true; //Descubre la carta;
	}
};