import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Form, Button, Table, Card, 
  Accordion, Modal, Alert 
} from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

// Importar datos completos de hitos de desarrollo
const HITOS_DESARROLLO = {
  '4-5 meses': {
    motorGrueso: [
      { descripcion: 'Si coloca a su hijo de güata ¿levanta la cabeza y tronco, apoyándose en antebrazos? ¿Gira de boca abajo a boca arriba? (desde los 4 meses)' }
    ],
    motorFino: [
      { descripcion: 'Si le acerca a su hijo un objetos colgante (un juguete o sonajero) ¿lo quiere tomar? ¿se lleva objetos a la boca (4 meses)?' }
    ],
    cognoscitivo: [
      { descripcion: 'Su hijo ¿sigue con su mirada un objeto o persona que se mueven delante de sus ojos?' }
    ],
    comunicacion: [
      { descripcion: 'Cuando hace sonar un sonajero o cascabel, se gira hacia el cascabel y hacia la voz y/o Dice «agú», gorgojeo (4 meses) y hace sonidos con «rrr» (5 meses) de manera más expresiva y variada' }
    ],
    socioemocional: [
      { descripcion: '¿Su hijo tiene sonrisa espontánea y se ríe a carcajadas (risa sonora)?' }
    ]
  },
  '6-7 meses': {
    motorGrueso: [
      { descripcion: 'Al colocar a su hijo en un lugar blando en el piso (una alfombra) gira sobre su propio cuerpo (de boca abajo a boca arriba o al revés). Boca arriba, ¿lleva los pies a la boca?' }
    ],
    motorFino: [
      { descripcion: 'Su hijo, ¿toma objetos con la palma de la mano? O ¿pasa objetos de una mano a la otra?' }
    ],
    cognoscitivo: [
      { descripcion: '¿A su hijo le gusta mirar a sus alrededor? Ejemplo: Explora el mundo a través de la vista y llevándose los objetos a la boca' }
    ],
    comunicacion: [
      { descripcion: 'Su hijo, ¿Reconoce su nombre, se gira a la voz al llamarlo?' }
    ],
    socioemocional: [
      { descripcion: 'Su hijo ¿reconoce rostros familiares? ¿Llora si ve a una persona extraña?' }
    ]
  },
  '8-9 meses': {
    motorGrueso: [
      { descripcion: '¿Su hijo se sienta con ayuda (7-8 meses)? Al colocar a su hijo sobre una alfombra y/o cama, ¿éste tiende a arrastrarse para moverse? ¿Su hijo gatea?' }
    ],
    motorFino: [
      { descripcion: 'Si le da a su hijo unos cubos, ¿éste toma 2 cubos con los dedos índice y pulgar? Como una pinza ¿Golpea objetos entre sí?' }
    ],
    comunicacion: [
      { descripcion: 'Su hijo ¿dice disílabos (da-da, pa-pa, mama) inespecíficos o imita sonidos? ¿Hace adiós con la mano y aplaude? (9 meses)' }
    ],
    socioemocional: [
      { descripcion: 'Cuando su hijo llora ante una caída, ¿ustedes como padres pueden consolarlo y se calma con facilidad? Ansiedad de separación: ¿Su hijo llora ante la ausencia de su madre-padre? Por ejemplo cuando lo dejan en el jardín' }
    ]
  },
  '10-11 meses': {
    motorGrueso: [
      { descripcion: '¿Su hijo ya dio sus primeros pasos con apoyo (10 meses) con apoyo? (en posición bípeda, afirmado de algo se desplaza lateralmente)' }
    ],
    motorFino: [
      { descripcion: '¿Su hijo lanza objetos con intención? ¿Revuelve con cuchara?' }
    ],
    comunicacion: [
      { descripcion: '¿Su hijo dice papá o mamá para llamarlo? (palabra con intención 11 meses) Su hijo entiende concepto del "no" Al colocar música, ¿su hijo baila con rebote al son de la música?' }
    ]
  },
  '12 a 14 meses': {
    motorGrueso: [
      { descripcion: '¿Su hijo se sostiene de pie sin apoyo? ¿Camina solo, pero inestable?' }
    ],
    motorFino: [
      { descripcion: '¿Su hijo pone objetos dentro de una taza? ¿Su hijo da vuelta varias hojas juntas de un libro? Como si estuviera leyendo' }
    ],
    comunicacion: [
      { descripcion: '¿Su hijo obedece órdenes con gestos? (por ejemplo: «pásame esa pelota», señalando la pelota con el dedo). Su hijo ¿imita y emite gestos frecuentemente?' }
    ],
    cognoscitivo: [
      { descripcion: '¿Su hijo dice palabras? (Dice una a dos palabras con sentido distintas a mamá y papá). Su hijo ¿muestra y pide cosas apuntando con su dedo índice?' }
    ]
  },
  '15 a 17 meses': {
    motorGrueso: [
      { descripcion: '¿Su hijo camina estable, se agacha y endereza? ¿Su hijo da pasos hacia atrás? ¿Su hijo comienza a correr descoordinadamente?' }
    ],
    motorFino: [
      { descripcion: '¿Su hijo bebe de un vaso? ¿Su hijo hace rayas con un lápiz?' }
    ],
    comunicacion: [
      { descripcion: '¿Su hijo obedece órdenes simples? Por ejemplo, me pasas mis zapatos ¿Su hijo reconoce una partes del cuerpo?' }
    ],
    cognoscitivo: [
      { descripcion: '¿Su hijo dice de 3 a 5 palabras con sentido?' }
    ],
    socioemocional: [
      { descripcion: '¿Su hijo demuestra emociones: da besos, siente vergüenza?' }
    ]
  },
  '18 a 23 meses': {
    motorGrueso: [
      { descripcion: '¿Su hijo lanza una pelota estando de pie? ¿Su hijo sube escalones afirmado de la mano de un adulto? ¿Su hijo corre bien?' }
    ],
    motorFino: [
      { descripcion: '¿Se hijo levanta una torre 3 a 5 cubos?' }
    ],
    comunicacion: [
      { descripcion: '¿Su hijo entiende el concepto «mío»? Cuando le lee a su hijo éste ¿disfruta, escuchar cuentos y poesías cortas y sencillas? ¿Su hijo tiene libros para observar y manipula libros con imágenes?' }
    ],
    socioemocional: [
      { descripcion: '¿Su hijo participa en juego de imitación con otros? Por ejemplo juega a la mamá/papá. Besa con ruido' }
    ]
  },
  '2 años': {
    motorGrueso: [
      { descripcion: '¿Su hijo lanza la pelota? ¿Su hijo salta con dos pies? ¿su hijo patea una pelota?' }
    ],
    motorFino: [
      { descripcion: '¿ha visto que su hijo levante una torre de seis cubos? Si le realiza en una hoja una línea, ¿su hijo la copia? ¿Su hijo come con cuchara y tenedor?' }
    ],
    cognoscitivo: [
      { descripcion: '¿Su hijo juega a clasificar en dos categorías (por ejemplo, todos los autos y las muñecas)? ¿Su hijo completa un rompecabezas sencillo?' }
    ],
    comunicacion: [
      { descripcion: '¿Su hijo nombra y apunta a cinco partes del cuerpo? ¿Su hijo sabe su nombre?' }
    ],
    socioemocional: [
      { descripcion: '¿Su hijo copia las acciones de los adultos (por ejemplo, aplaudir)?' }
    ]
  },
  '3 años': {
    motorGrueso: [
      { descripcion: '¿Su hijo se para en un pie durante dos o tres segundos? ¿Su hijo sube escaleras alternando pies sin apoyo? Si le tira una pelota a su hijo, éste ¿atrapa la pelota con los brazos tiesos?' }
    ],
    motorFino: [
      { descripcion: '¿Su hijo corta con tijeras (mal)?' }
    ],
    cognoscitivo: [
      { descripcion: 'Si le da a su hijo dos vasos, uno vacío y uno lleno, ¿vacía el líquido de un recipiente a otro? ¿Su hijo identifica su sexo? ¿Su hijo nombra a un amigo? ¿Su hijo se viste con ayuda? ¿Su hijo usa pañales? De ser así, ¿todo el día o sólo en la noche?' }
    ],
    comunicacion: [
      { descripcion: '¿Su hijo puede tener una conversación usando dos a tres frases seguidas?' }
    ],
    socioemocional: [
      { descripcion: '¿Su hijo a comenzado a compartir? ¿Su hijo le teme a cosas imaginarias? Por ejemplo, mounstros/ o ruidos extraños.' }
    ]
  },
  '4 años': {
    motorGrueso: [
      { descripcion: '¿Su hijo salta en un pie dos o tres veces? ¿Su hijo se para en un pie durante cuatro a ocho segundos?' }
    ],
    motorFino: [
      { descripcion: 'Si usted dibuja una cruz en una hoja, ¿su hijo copia una cruz? Si usted dibuja un cuadrado en una hoja, ¿su hijo copia un cuadrado?' }
    ],
    cognoscitivo: [
      { descripcion: '¿Su hijo Sabe qué hacer en caso de frío, hambre o cansancio? Por ejemplo, decirle que tiene hambre o frío. ¿Su hijo se viste solo (incluye botones)?' }
    ],
    comunicacion: [
      { descripcion: '¿Su hijo habla de una forma que usted comprende todo lo que dice?' }
    ],
    socioemocional: [
      { descripcion: '¿Su hijo dice que tiene un mejor amigo? Y lo nombra ¿Su hijo puede reconocer sus sentimientos y nombrarlos? Por ejemplo decir que está enojado. ¿Su hijo juega con otros niños siguiendo reglas?' }
    ]
  }
};

const RECOMENDACIONES = {
  '4-5 meses': {
    areaMotora: `Poner al niño o a la niña por tiempos equivalentes boca arriba, boca abajo o de lado sobre el suelo para que se mueva libremente, con el sentido de movimiento desarrolla balance y control. Mostrarle al niño o la niña su imagen frente a un espejo.`,
    areaLenguaje: `Imitar los sonidos que el niño o la niña emite. Fomentar que el adulto se ponga cerca de su hijo/a y haga sonidos con la boca (moviendo lengua, emitiendo sonidos silbantes, guturales, gruñidos, etc), siempre mirándolo a los ojos (cara a cara). Ir describiéndole las actividades que se van realizando con el niño o niña.`,
    areaSocioemocional: `Fomentar el uso de música y canto de canciones con movimientos corporales frente al niño o niña. Aprovechar instancias como el baño, alimentación y juego para conversarle y cantarle.`,
    areaCognitiva: `Mostrarle al niño o la niña objetos que llamen su atención (cascabeles, tazas de plástico sin contenido, cucharas de madera o paños de colores) a una distancia dentro del alcance de la niña o niño y motivarlo para que los tome.`
  },
  '6-7 meses': {
    areaMotora: `Utilizar ropa cómoda, suelta acorde al tamaño del niño o niña, que permita el libre movimiento. Permitirle al niño o niña estar boca abajo sobre una superficie firme, como la goma eva, dejando juguetes a su alcance para que pueda tomarlos y explorarlos. Permitirle girar, ya que desde este hito irá progresivamente sentándose (no se le debe sentar, si el niño o niña, aún no ha lo logra de manera espontánea).`,
    areaLenguaje: `Permitirle que explore visualmente el ambiente e interactúe con otros miembros de la familia. Aprovechar las actividades rutinarias para leer, cantar, tocar música e imitar vocalizaciones. Mostrarle libros con figuras de animales nombrándolos, mostrarle fotos de familiares cercanos llamándolos por su nombre.`,
    areaSocioemocional: `Mostrarle el entorno sin forzar y aproveche especialmente aquellos momentos en los que el niño o niña ha mostrado interés por un objeto en específico, para describirlo y conversar entorno a este. Jugar a «¿dónde está?, ¡ahí está!» Taparse parte de la cara, esconderse detrás de un mueble, esconder un objeto bajo una frazada o colocar un objeto bajo una taza invertida, para que el niño o la niña lo encuentre. Desaconsejar el uso de televisión y computador hasta los dos años.`,
    areaCognitiva: `Educar a los padres que alrededor de los 6 meses los niños y niñas pueden reconocer y responder a expresiones emocionales de los padres u otras personas. Se recomienda conectar con emociones a través de gestos, contacto físico y visual. Indicar hacer de las rutinas diarias una instancia de intercambio afectivo, por ejemplo, que, durante el baño, muda, alimentación, al hacerlo dormir, hablarle con palabras simples y si bien no responde a esta edad, comprenderá que los adultos se intentan comunicar y que es una instancia de cariño. Que lo hagan con contacto físico visual y verbal. Ofrecerle una cuchara con comidas blandas como puré para que comience a alimentarse solo o sola.`
  },
  '8-11 meses': {
    areaMotora: `Darle la libertad para que se desplace y explore de manera segura (ejemplo: sobre goma Eva). Estimular el desplazamiento arrastre y gateo, estimular que pase de sedente a prono, para luego lograr el arrastre en 4 puntos de apoyo. En lo posible crear circuitos motores para que el niño pueda arrastrarse o gatear entre ellos.`,
    areaLenguaje: `Enseñarle a decir «adiós» al despedirse. Se pueden enseñar señas para las palabras de uso común para facilitar la comunicación con el niño o la niña y fomentar el lenguaje. Esta práctica no desincentiva el lenguaje, sino todo lo contrario, pues fomenta el desarrollo del lenguaje preverbal.`,
    areaSocioemocional: `Recomendar a la madre o el padre preguntar al niño o la niña sobre lo que necesita y lo que le pasa. Indicar hacer de las rutinas diarias una instancia de intercambio afectivo, por ejemplo, que, durante el baño, muda, alimentación, al hacerlo dormir, hablarle con palabras simples y si bien no responde a esta edad, comprenderá que los adultos se intentan comunicar y que es una instancia de cariño. Que lo hagan con contacto físico visual y verbal. Desaconsejar el uso de televisión y computador hasta los dos años.`,
    areaCognitiva: `Cuando el niño o la niña tenga un juguete en cada mano, ofrecerle un tercer juguete; aprenderá a intercambiar uno por otro. Durante la comida, colocando pequeños trozos de comida en la mesa (ejemplo: migas).`
  },
  '12-18 meses': {
    areaMotora: `Brindar elementos interesantes y seguros para exploración colocar ropa que permita el movimiento experimentar con varios materiales, de diferentes texturas, dar experiencias en posturas variadas estimules diferentes destrezas sobre la marcha, subir, iniciar el trepar. Realizar una pista de obstáculos: colocar cajas/ objetos en el piso y pedirle que salte o pase por sobre los objetos. Pasarle distintos envases con tapas y tamaños diversos: pedirle que los abra y cierre (para que sea más interesante, se puede colocar un premio adentro). Promover a través del juego que el niño o niña logre lanzar y agarrar distintos objetos. Promover a través del juego que el niño o niña logre cortar con las manos tiras largas o cuadrados de papel de diario, ensartar el tenedor en comidas blandas (por ejemplo, un plátano).`,
    areaLenguaje: `Al darle instrucciones usar frases claras y simples. Al leerle cuentos, describir los sentimientos de los personajes para que entienda concepto de emociones. Constantemente preguntarle: ¿Qué es esto? ¿Quién es él? Completar las frases incompletas del niño/a (por ejemplo, si él dice “agua” completar con “mamá quiero agua”). Evitar corregirle. Estimularlo a pedir las cosas con palabras y no con gestos. Al dormir leerle cuentos y cantarle canciones.`,
    areaSocioemocional: `Orientar y apoyar a la familia y en especial a la madre o al cuidador principal en la importancia del vínculo que se forma en los primeros años de vida. Ser afectuosos, reforzar sus logros, darle opciones, respetar sus momentos de juego. Fomentar o buscar situaciones para que interactúe con otros niños y niñas de su edad. Apoyar la iniciativa infantil poner atención y dar señales de interés en estas comunicaciones se asocia al desarrollo de un buen autoconcepto, mayor motivación de logro y mejor tolerancia a la frustración. Frente a situación de malestar, el adulto debe intentar interpretar el estado afectivo en el que se encuentra el niño o niño, asimismo debe intentar averiguar qué siente él frente al estado emocional de su hijo/hija. Para luego conectar emocionalmente con el niño o niña. El adulto debe tratar de comprender que causa el malestar, más que centrarse en la conducta o consecuencia. El adulto puede intentar poner nombre a los sentimiento y acciones que el niño o niña manifiesta. Debe hablar con voz calmada pero lo suficientemente fuerte para que el niño o niña lo escuche, si es que está llorando. Ponerse a la altura del niño o la niña, e intentar mirarlo a los ojos al momento de hablarle. Evitar usar frases incomprensibles para menores, como “córtala” o “¿por qué hiciste eso?”. Reforzar y estimular los esfuerzos del niño o niña, con sonrisas o con una conducta cariñosa o de satisfacción. También se deben repetir varias veces en forma consistente qué conductas se espera que el niño o la niña evite y no realice, para que puedan ser internalizadas.`,
    areaCognitiva: `Recordar que el castigo físico (ejemplo: palmadas) y/o verbal tiene efectos emocionales negativos (frustración asociada a la interacción con los padres, temor confuso, desorientación) y no logra generar las conductas esperadas, sino solo frenar momentáneamente una conducta inadecuada. Por lo demás deteriora el vínculo afectivo con los padres y crea un modelo violento de cómo resolver problemas. Evitar celebrar o dar señales positivas ante conductas desadaptativas o inadecuadas que no se desean en el niño o en la niña. Evitar contradicciones entre las reglas, explicaciones e instrucciones entre padre y madre, o padres y abuelos u otros cuidadores/as. No es recomendable dejar al niño solo o la niña sola cuando tiene una rabieta intensa o decirle que los padres se irán. Es más efectivo que los padres lo acompañen e intenten pedirle que diga lo que quiere, hablarle, sacarle del lugar en donde está, distraer activamente su atención, proponer otra actividad o ayudarle a calmarse. Autoayuda: Enseñarle a sonarse, a lavarse la cara y las manos, que se vista y desvista con prendas fáciles. Permitir que haga la mayor cantidad de tareas solo, aunque se demore. Entregándole instrucciones fáciles y directas de comprender. Concepto de números: contar diversos objetos cotidianos (escalones, zapatos, botones, cubos, etc.). Clasificación: Ofrecer distintos objetos para que el niño o la niña los separe por color, tamaño, etc. (por ejemplo, cajas de fósforos, tapas de botellas, pelotas). Tener distintas cajas para que el niño/a agrupe y guarde sus juguetes. Secuencias: Utilizar actividades familiares para enseñarle el concepto de secuencia (por ejemplo, comer cereal. Primero necesito un plato, luego el cereal va dentro del plato, luego va la leche y finalmente se come). Concepto de espacio: Introducir concepto de “arriba” y “abajo” (usando un juguete que le guste y mostrar su relación con la mesa).`
  },
  '2-4 años': {
    areaSocioemocional: `Sugerir a los padres y cuidadores estimular, motivar y enseñar a su hijo o hija a tener conductas de autonomía y autocuidado, otorgar espacios y oportunidades para practicar tales como: Enseñarle a sonarse, lavarse los dientes, vestirse, orinar, comer solo, etc. (aun cuando tome tiempo). Hacerlo participar de decisiones simples que lo afectan, como qué ropa quiere ponerse, a dónde quiere ir a pasear, qué tipo de juego quiere llevar a cabo o qué cuento quiere leer. Recomendar a los padres no transmitir inseguridad cuando intenta hacer algo, es importante transmitir confianza en el niño o la niña. Se sugiere no transmitir ansiedad al niño o niña cuando quede a cargo de otra persona de confianza. Fomentar actividades sociales en la casa o en el barrio con otros niños y niñas de su edad (jugar en la plaza con otros niños).`,
    areaSocioComunicativa: `Recomendar estimular la conversación espontánea con preguntas abiertas: ¿cómo te fue hoy?; ¿cómo te sientes?; ¿qué fue lo que más te gustó?, no corregirlos demasiado; aprovechar cada oportunidad para enseñarles nuevas palabras; enseñarles nuevas canciones y hablarles claramente, modulando las letras. Recordar que se debe fomentar la conversación y no un cuestionario o interrogatorio, en las conversaciones ambos interlocutores preguntan y responden. Se ha comprobado que, en esta etapa, la lectura en voz alta con el niño o niña (leer frente a los hijos) estimula el hábito lector y las habilidades verbales generales.`,
    areaMotora: `Promover los juegos que son historias, con personajes y roles; juegos de pintar y dibujar, juegos con uso de la fantasía y la imaginación. Promover juegos con reglas simples, cooperativas, ojalá con otros niños o niñas y estimulantes como: correpasillos, triciclo, con caballito, cajas con arena, burbujas, disfraces, puzle de 3 a 4 piezas, cuentos, mostrar figuras, pelotas, autos, muñecas, cantar, etc. Enseñar a lanzar, atrapar y chutear la pelota, saltar como conejo, caminar en punta de pies como pajarito, bambolearse como pato, deslizarse como serpiente, etc. Permitir inclusión en los juegos, no identificación de género en ellos y que permita que los juegos sean espontáneos.`
  }
};

const SeguimientoInfantil = () => {
  const { getToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { fichaId, pacienteId } = location.state || {};

  const [seguimiento, setSeguimiento] = useState({
    fecha: new Date().toISOString().split('T')[0],
    pacienteId: pacienteId,
    edadMeses: 4,
    grupoEdad: '4-5 meses',
    areaDPM: {
      motorGrueso: [],
      motorFino: [],
      comunicacion: [],
      cognoscitivo: [],
      socioemocional: []
    },
    recomendaciones: {
      areaMotora: '',
      areaLenguaje: '',
      areaSocioemocional: '',
      areaCognitiva: ''
    }
  });

  const [seguimientosAnteriores, setSeguimientosAnteriores] = useState([]);
  const [selectedSeguimiento, setSelectedSeguimiento] = useState(null);

  const generarRecomendaciones = (grupoEdad) => {
    // Mapeo de rangos de edad para encontrar las recomendaciones correctas
    const mapeoRangos = {
      '4-5 meses': '4-5 meses',
      '6-7 meses': '6-7 meses',
      '8-9 meses': '8-11 meses',
      '10-11 meses': '8-11 meses',
      '12-14 meses': '12-18 meses',
      '15-17 meses': '12-18 meses',
      '18-23 meses': '12-18 meses',
      '2 años': '2-4 años',
      '3 años': '2-4 años',
      '4 años': '2-4 años'
    };
  
    // Obtener el rango correcto de recomendaciones
    const rangoRecomendaciones = mapeoRangos[grupoEdad] || grupoEdad;
    
    // Buscar recomendaciones
    const recomendacionesEdad = RECOMENDACIONES[rangoRecomendaciones] || {};
  
    setSeguimiento(prev => ({
      ...prev,
      recomendaciones: {
        // Usar recomendaciones del rango o dejar vacío si no hay
        areaMotora: recomendacionesEdad.areaMotora || '',
        areaLenguaje: recomendacionesEdad.areaLenguaje || '',
        areaSocioemocional: recomendacionesEdad.areaSocioemocional || '',
        areaCognitiva: recomendacionesEdad.areaCognitiva || ''
      }
    }));
  };

  // Cargar seguimientos anteriores y generar recomendaciones
  useEffect(() => {
    if (pacienteId) {
      cargarSeguimientosAnteriores();
      generarRecomendaciones(seguimiento.grupoEdad);
    }
  }, [pacienteId, seguimiento.grupoEdad]);


  const cargarSeguimientosAnteriores = async () => {
    try {
      const token = getToken();
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/seguimiento-infantil/paciente/${pacienteId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSeguimientosAnteriores(response.data);
    } catch (error) {
      console.error('Error al cargar seguimientos anteriores', error);
    }
  };

  const ModalSeguimientoAnterior = () => {
    return (
      <Modal 
        show={!!selectedSeguimiento} 
        onHide={() => setSelectedSeguimiento(null)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Seguimiento - {selectedSeguimiento?.fecha}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Mostrar detalles del seguimiento */}
          {selectedSeguimiento && (
            <div>
              <p><strong>Edad:</strong> {selectedSeguimiento.edad_meses} meses</p>
              {/* Agregar más detalles */}
            </div>
          )}
        </Modal.Body>
      </Modal>
    );
  };

  const handleHitoCumplido = (e, area, index) => {
    const { checked } = e.target;
    setSeguimiento(prev => {
      const newAreaDPM = { ...prev.areaDPM };
      if (!newAreaDPM[area]) newAreaDPM[area] = [];
      newAreaDPM[area][index] = checked;
      return { ...prev, areaDPM: newAreaDPM };
    });
  };

  const guardarSeguimiento = async () => {
    try {
      const token = getToken();
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/seguimiento-infantil`,
        seguimiento,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Seguimiento guardado correctamente');
      setSeguimientosAnteriores(prev => [...prev, response.data]);
    } catch (error) {
      console.error('Error al guardar seguimiento', error);
      alert('Error al guardar el seguimiento');
    }
  };

  const handleEdadChange = (e) => {
    const grupoEdad = e.target.value;
    
    // Mapeo de rangos para la edad
    const mapeoRangos = {
      '4-5 meses': '4-5 meses',
      '6-7 meses': '6-7 meses',
      '8-9 meses': '8-11 meses',
      '10-11 meses': '8-11 meses',
      '12-14 meses': '12-18 meses',
      '15-17 meses': '12-18 meses',
      '18-23 meses': '12-18 meses',
      '2 años': '2-4 años',
      '3 años': '2-4 años',
      '4 años': '2-4 años'
    };
  
    // Obtener el rango de recomendaciones
    const rangoRecomendaciones = mapeoRangos[grupoEdad] || grupoEdad;
  
    setSeguimiento(prev => ({
      ...prev,
      grupoEdad,
      // Extraer los primeros números como edad en meses
      edadMeses: parseInt(grupoEdad.split('-')[0] || grupoEdad.split(' ')[0]),
      // Reiniciar los hitos de desarrollo
      areaDPM: {
        motorGrueso: [],
        motorFino: [],
        comunicacion: [],
        cognoscitivo: [],
        socioemocional: []
      }
    }));
  
    // Generar recomendaciones con el rango correcto
    generarRecomendaciones(rangoRecomendaciones);
  };

  const renderHitosDesarrollo = (grupoEdad) => {
    // Mapeo de rangos similar al anterior
    const mapeoRangos = {
      '8-9 meses': '8-11 meses',
      '10-11 meses': '8-11 meses',
      '12-14 meses': '12-18 meses',
      '15-17 meses': '12-18 meses',
      '18-23 meses': '12-18 meses',
      '2 años': '2 años',
      '3 años': '3 años',
      '4 años': '4 años'
    };
  
    // Obtener el rango correcto de hitos
    const rangoHitos = mapeoRangos[grupoEdad] || grupoEdad;
    
    // Buscar hitos
    const hitosGrupo = HITOS_DESARROLLO[rangoHitos];
    
    // Verificación de seguridad
    if (!hitosGrupo) {
      return <div>No hay hitos disponibles para este grupo de edad</div>;
    }
    
    return (
      <Accordion>
        {Object.entries(hitosGrupo).map(([area, hitos], index) => (
          <Accordion.Item key={index} eventKey={index.toString()}>
            <Accordion.Header>{area}</Accordion.Header>
            <Accordion.Body>
              <Table striped bordered>
                <tbody>
                  {hitos.map((hito, hitoIndex) => (
                    <tr key={hitoIndex}>
                      <td>
                        <Form.Check 
                          type="checkbox"
                          label={hito.descripcion}
                          onChange={(e) => handleHitoCumplido(e, area, hitoIndex)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    );
  };

  return (
    <Container fluid className="p-4">
      <h2 className="mb-4">Seguimiento de Desarrollo Psicomotor</h2>
            
      {/* Sección de Hitos de Desarrollo */}
      <Card className="mb-4">
        <Card.Header>Hitos de Desarrollo</Card.Header>
        <Card.Body>
          <Form.Group>
            <Form.Label>Grupo de Edad</Form.Label>
            <Form.Control 
              as="select"
              value={seguimiento.grupoEdad}
              onChange={handleEdadChange}
            >
              <option value="4-5 meses">4-5 meses</option>
              <option value="6-7 meses">6-7 meses</option>
              <option value="8-9 meses">8-9 meses</option>
              <option value="10-11 meses">10-11 meses</option>
              <option value="12-14 meses">12-14 meses</option>
              <option value="15-17 meses">15-17 meses</option>
              <option value="18-23 meses">18-23 meses</option>
              <option value="2 años">2 años</option>
              <option value="3 años">3 años</option>
              <option value="4 años">4 años</option>
            </Form.Control>
          </Form.Group>
          {renderHitosDesarrollo(seguimiento.grupoEdad)}
        </Card.Body>
      </Card>

      {/* Sección de Recomendaciones */}
      <Card className="mb-4">
        <Card.Header>Recomendaciones</Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>Área Motora</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              value={seguimiento.recomendaciones.areaMotora}
              onChange={(e) => setSeguimiento(prev => ({
                ...prev,
                recomendaciones: {
                  ...prev.recomendaciones,
                  areaMotora: e.target.value
                }
              }))}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Área de Lenguaje</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              value={seguimiento.recomendaciones.areaLenguaje}
              onChange={(e) => setSeguimiento(prev => ({
                ...prev,
                recomendaciones: {
                  ...prev.recomendaciones,
                  areaLenguaje: e.target.value
                }
              }))}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Área Socioemocional</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              value={seguimiento.recomendaciones.areaSocioemocional}
              onChange={(e) => setSeguimiento(prev => ({
                ...prev,
                recomendaciones: {
                  ...prev.recomendaciones,
                  areaSocioemocional: e.target.value
                }
              }))}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Área Cognitiva</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              value={seguimiento.recomendaciones.areaCognitiva}
              onChange={(e) => setSeguimiento(prev => ({
                ...prev,
                recomendaciones: {
                  ...prev.recomendaciones,
                  areaCognitiva: e.target.value
                }
              }))}
            />
          </Form.Group>
        </Card.Body>
      </Card>

      {/* Botón para guardar seguimiento */}
      <Button variant="primary" onClick={guardarSeguimiento}>
        Guardar Seguimiento
      </Button>

      {/* Listado de seguimientos anteriores */}
      <Card className="mt-4">
        <Card.Header>Seguimientos Anteriores</Card.Header>
        <Card.Body>
          <Table striped bordered>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Edad (meses)</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {seguimientosAnteriores.map((seguimiento, index) => (
                <tr key={index}>
                  <td>{seguimiento.fecha}</td>
                  <td>{seguimiento.edad_meses}</td>
                  <td>
                    <Button 
                      variant="info" 
                      onClick={() => setSelectedSeguimiento(seguimiento)}
                    >
                      Ver Detalles
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal para ver detalles de seguimiento anterior */}
      <Modal 
        show={!!selectedSeguimiento} 
        onHide={() => setSelectedSeguimiento(null)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Seguimiento - {selectedSeguimiento?.fecha}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSeguimiento && (
            <div>
              <p><strong>Edad:</strong> {selectedSeguimiento.edad_meses} meses</p>
              
              <h5>Hitos Cumplidos</h5>
              {Object.entries(selectedSeguimiento.areaDPM || {}).map(([area, hitos]) => (
                <div key={area}>
                  <strong>{area}:</strong>
                  <ul>
                    {hitos.map((cumplido, index) => cumplido && (
                      <li key={index}>
                        {HITOS_DESARROLLO[selectedSeguimiento.grupoEdad][area][index]?.descripcion}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <h5>Recomendaciones</h5>
              <p><strong>Área Motora:</strong> {selectedSeguimiento.recomendaciones?.areaMotora}</p>
              <p><strong>Área de Lenguaje:</strong> {selectedSeguimiento.recomendaciones?.areaLenguaje}</p>
              <p><strong>Área Socioemocional:</strong> {selectedSeguimiento.recomendaciones?.areaSocioemocional}</p>
              <p><strong>Área Cognitiva:</strong> {selectedSeguimiento.recomendaciones?.areaCognitiva}</p>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default SeguimientoInfantil;