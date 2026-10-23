
const NOTA_MINIMA = 3.0;
const PORC_PARCIAL_1_2 = 0.20;
const PORC_PARCIAL_3 = 0.30;
const PORC_QUIZ = 0.05;
const PORC_TRABAJO = 0.05;
const PESO_CORTE_1_2 = 0.30;
const PESO_CORTE_3 = 0.40;


const MARGEN = 0.000001;


const ids = ["parcial1", "quiz1", "trabajo1",
    "parcial2", "quiz2", "trabajo2",
    "parcial3", "quiz3", "trabajo3"];

let listaErrores = [];


function redondearAbajo(numero) {
    return Math.floor(numero * 100 + MARGEN) / 100;
}


function redondearArriba(numero) {
    return Math.ceil(numero * 100 - MARGEN) / 100;
}


function leerNota(id, nombre) {
    const caja = document.getElementById(id);
    let texto = caja.value.trim();     
    texto = texto.replace(",", ".");    
    caja.className = "caja";         

    if (texto === "") {
        return "vacio";
    }

    const nota = Number(texto);
    if (isNaN(nota) || nota < 0 || nota > 5) {
        caja.className = "caja error"; 
        listaErrores.push(nombre);
        return "error";
    }
    return nota;
}


function calcularCorte(corte, porcParcial) {
    const parcial = leerNota("parcial" + corte, "Parcial " + corte);
    const quiz = leerNota("quiz" + corte, "Quiz " + corte);
    const trabajo = leerNota("trabajo" + corte, "Trabajo " + corte);

    if (parcial === "error" || quiz === "error" || trabajo === "error") {
        return "error";
    }
    if (parcial === "vacio" || quiz === "vacio" || trabajo === "vacio") {
        return "falta";
    }
    return parcial * porcParcial + quiz * PORC_QUIZ + trabajo * PORC_TRABAJO;
}


function mostrarNotaCorte(numero, aporte, pesoCorte) {
    const etiqueta = document.getElementById("nota" + numero);
    if (aporte === "error" || aporte === "falta") {
        etiqueta.textContent = "--";
    } else {
        etiqueta.textContent = redondearAbajo(aporte / pesoCorte).toFixed(2);
    }
}


function mostrarEstado(estilo, titulo, mensaje) {
    document.getElementById("resultado").className = "tarjeta " + estilo;
    document.getElementById("titulo").textContent = titulo;
    document.getElementById("mensaje").textContent = mensaje;
}


function mostrarExtra(estilo, numero, explicacion) {
    document.getElementById("extra").className = "tarjeta " + estilo;
    document.getElementById("necesito").textContent = numero;
    document.getElementById("explicacion").textContent = explicacion;
}




function calcular() {
    listaErrores = [];

    // Cada corte devuelve un número, "falta" o "error"
    const aporte1 = calcularCorte(1, PORC_PARCIAL_1_2);
    const aporte2 = calcularCorte(2, PORC_PARCIAL_1_2);
    const aporte3 = calcularCorte(3, PORC_PARCIAL_3);

    mostrarNotaCorte(1, aporte1, PESO_CORTE_1_2);
    mostrarNotaCorte(2, aporte2, PESO_CORTE_1_2);
    mostrarNotaCorte(3, aporte3, PESO_CORTE_3);

    
    if (listaErrores.length > 0) {
        document.getElementById("definitiva").textContent = "--";
        mostrarEstado("mal", "Hay notas con error",
            "Revisa: " + listaErrores.join(", ") + ". Cada nota debe ser un número entre 0 y 5.");
        mostrarExtra("neutro", "--", "Corrige las notas con error para ver este cálculo.");
        return;
    }

    const corte1Listo = (aporte1 !== "falta");
    const corte2Listo = (aporte2 !== "falta");
    const corte3Listo = (aporte3 !== "falta");

   
    if (corte1Listo && corte2Listo && corte3Listo) {
        const definitiva = aporte1 + aporte2 + aporte3;
        const texto = redondearAbajo(definitiva).toFixed(2);
        document.getElementById("definitiva").textContent = texto;

        if (definitiva >= NOTA_MINIMA - MARGEN) {
            let comentario;
            if (definitiva >= 4.5) {
                comentario = "Excelente resultado.";
            } else if (definitiva >= 4.0) {
                comentario = "Muy buen resultado.";
            } else if (definitiva >= 3.5) {
                comentario = "Pasaste con buen margen.";
            } else {
                comentario = "Pasaste, aunque con poco margen.";
            }
            mostrarEstado("bien", "Aprobaste", "Tu nota definitiva es " + texto + ". " + comentario);
        } else {
            const falto = redondearArriba(NOTA_MINIMA - definitiva).toFixed(2);
            mostrarEstado("mal", "No alcanzaste el 3.0",
                "Tu nota definitiva es " + texto + ". Te faltaron " + falto + " para llegar a 3.0.");
        }
        mostrarExtra("neutro", "--", "Ya tienes las notas de los tres cortes, por eso no hace falta este cálculo.");
        return;
    }

    document.getElementById("definitiva").textContent = "--";

    if (corte1Listo && corte2Listo) {
        const acumulado = aporte1 + aporte2;                       
        const necesito = (NOTA_MINIMA - acumulado) / PESO_CORTE_3; 

        if (necesito <= MARGEN) {
           
            mostrarEstado("bien", "El 3.0 ya está asegurado",
                "Con los cortes 1 y 2 ya llegas a 3.0, saques lo que saques en el corte 3. " +
                "Completa el corte 3 para ver tu definitiva.");
            mostrarExtra("bien", "Cualquiera",
                "Con cualquier nota en el corte 3 terminas con 3.0 o más.");

        } else if (necesito > 5 + MARGEN) {
          
            const maxima = redondearAbajo(acumulado + 5 * PESO_CORTE_3).toFixed(2);
            mostrarEstado("mal", "Ya no se alcanza el 3.0",
                "Aunque saques 5.0 en el corte 3, tu definitiva máxima sería " + maxima + ".");
            mostrarExtra("mal", "No alcanza",
                "Necesitarías " + redondearArriba(necesito).toFixed(2) + " en el corte 3 y la nota máxima es 5.0.");

        } else {
           
            const textoNecesito = redondearArriba(necesito).toFixed(2);
            let estilo;
            let titulo;
            if (necesito <= 3.5) {
                estilo = "bien";
                titulo = "Vas bien";
            } else {
                estilo = "alerta";
                titulo = "Queda ajustado";
            }
            mostrarEstado(estilo, titulo,
                "Con los cortes 1 y 2 todavía puedes llegar al 3.0. Mira abajo qué necesitas en el corte 3.");
            mostrarExtra(estilo, textoNecesito,
                "Es la nota que debes sacar en el corte 3 para terminar con 3.0. " +
                "Se calcula con el parcial (30%), el quiz (5%) y el trabajo (5%) de ese corte.");
        }
        return;
    }

    mostrarEstado("neutro", "Faltan notas",
        "Completa las tres notas del corte 1 y del corte 2 para saber cuánto necesitas en el corte 3.");
    mostrarExtra("neutro", "--", "Completa las tres notas del corte 1 y del corte 2 y presiona Calcular.");
}


function limpiar() {
  
    if (!confirm("¿Seguro que quieres borrar todas las notas?")) {
        return;
    }

    for (let id of ids) {
        const caja = document.getElementById(id);
        caja.value = "";
        caja.className = "caja";
    }
    for (let corte = 1; corte <= 3; corte++) {
        document.getElementById("nota" + corte).textContent = "--";
    }
    document.getElementById("definitiva").textContent = "--";
    mostrarEstado("neutro", "Aún no hay notas", "Escribe tus notas y presiona Calcular.");
    mostrarExtra("neutro", "--", "Completa las tres notas del corte 1 y del corte 2 y presiona Calcular.");
}



for (let id of ids) {
    document.getElementById(id).addEventListener("keydown", function (evento) {
        if (evento.key === "Enter") {
            calcular();
        }
    });
}
