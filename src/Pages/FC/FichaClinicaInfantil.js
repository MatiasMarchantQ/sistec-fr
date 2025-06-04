import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const FichaClinicaInfantil = ({ onVolver, onIngresar, institucionId, datosIniciales, ultimaReevaluacion = null, reevaluacionSeleccionada = null, modoEdicion }) => {
  const [datosNino, setDatosNino] = useState({
    fechaNacimiento: '',
    nombres: '',
    apellidos: '',
    rut: '',
    edad: '',
    edadAnios: '',
    edadMeses: '',
    edadDias: '',
    telefonoPrincipal: '',
    telefonoSecundario: ''
  });

  const { user, getToken, handleSessionExpired } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [puntajeDPM, setPuntajeDPM] = useState('');
  const [diagnosticoTEPSI, setdiagnosticoTEPSI] = useState('');
  const [edadMental, setEdadMental] = useState('');
  const [emEc, setEmEc] = useState('');
  const [pe, setPe] = useState('');
  const [coeficienteDesarrollo, setCoeficienteDesarrollo] = useState('');
  const [areaCoordinacion, setAreaCoordinacion] = useState('');
  const [areaSocial, setAreaSocial] = useState('');
  const [areaLenguaje, setAreaLenguaje] = useState('');
  const [areaMotora, setAreaMotora] = useState('');
  const [diagnosticoDSM, setDiagnosticoDSM] = useState('');
  const [padres, setPadres] = useState([{ nombre: '', escolaridad: '', ocupacion: '' }]);
  const [conQuienVive, setConQuienVive] = useState('');
  const [tipoFamilia, setTipoFamilia] = useState('');
  const [cicloVitalFamiliar, setCicloVitalFamiliar] = useState('');
  const [localidad, setLocalidad] = useState('');
  const [factoresRiesgoNinoDisponibles, setFactoresRiesgoNinoDisponibles] = useState([]);
  const [factoresRiesgoFamiliaresDisponibles, setFactoresRiesgoFamiliaresDisponibles] = useState([]);
  const [factoresRiesgoNino, setFactoresRiesgoNino] = useState({});
  const [factoresRiesgoFamiliares, setFactoresRiesgoFamiliares] = useState({
    otras: ''
  });

  const [otraTipoFamilia, setOtraTipoFamilia] = useState('');
  const [nivelesEscolaridad, setNivelesEscolaridad] = useState([]);
  const [ciclosVitalesFamiliares, setCiclosVitalesFamiliares] = useState([]);
  const [tiposFamilia, setTiposFamilia] = useState([]);
  const [errores, setErrores] = useState({});
  const [datosCargados, setDatosCargados] = useState(false);


  const parseEdad = useMemo(() => (edadString, edadAniosDirecto, edadMesesDirecto, edadDiasDirecto) => {
    // Caso 1: Si recibimos valores directos de años/meses/días
    if (edadAniosDirecto !== undefined || edadMesesDirecto !== undefined || edadDiasDirecto !== undefined) {
      return {
        edadAnios: edadAniosDirecto || null,
        edadMeses: edadMesesDirecto || null,
        edadDias: edadDiasDirecto || null
      };
    }

    // Caso 2: Si no hay valor o es null, devolver objeto con null
    if (!edadString) {
      return {
        edadAnios: null,
        edadMeses: null,
        edadDias: null
      };
    }

    // Convertir a string y limpiar espacios
    edadString = String(edadString).trim();

    // Regex para manejar formatos específicos
    const regexPatterns = [
      // "1 años, 10 días"
      /^(\d+)\s*años?,?\s*(\d+)\s*días?$/i,
      // "23 meses, 1 días"
      /^(\d+)\s*meses?,?\s*(\d+)?\s*días?$/i,
      // "1 años, 1 meses"
      /^(\d+)\s*años?,\s*(\d+)\s*meses?$/i,
      // "1 años, 1 meses, 10 días"
      /^(\d+)\s*años?,\s*(\d+)\s*meses?,\s*(\d+)\s*días?$/i,
      // "5 años"
      /^(\d+)\s*años?$/i,
      // "3 meses"
      /^(\d+)\s*meses?$/i,
      // "10 días"
      /^(\d+)\s*días?$/i
    ];

    // Probar cada patrón de regex
    for (let regex of regexPatterns) {
      const match = edadString.match(regex);

      if (match) {
        const result = {
          edadAnios: null,
          edadMeses: null,
          edadDias: null
        };

        // Manejar casos con años y días
        if (regex.source.includes('años') && regex.source.includes('días')) {
          result.edadAnios = match[1];
          result.edadDias = match[2];
        }
        // Manejar caso de meses y días
        else if (regex.source.includes('meses')) {
          result.edadMeses = match[1];
          if (match[2]) {
            result.edadDias = match[2];
          }
        }
        // Manejar casos con años y meses
        else if (regex.source.includes('años') && regex.source.includes('meses')) {
          result.edadAnios = match[1];
          result.edadMeses = match[2];
          if (match[3]) {
            result.edadDias = match[3];
          }
        } else if (regex.source.includes('años')) {
          result.edadAnios = match[1];
        } else if (regex.source.includes('meses')) {
          result.edadMeses = match[1];
        } else if (regex.source.includes('días')) {
          result.edadDias = match[1];
        }

        return result;
      }
    }

    // Extraer números de la cadena
    const numeros = edadString.match(/\d+/g);
    if (numeros) {
      return {
        edadAnios: numeros[0] || null,
        edadMeses: numeros[1] || null,
        edadDias: numeros[2] || null
      };
    }

    return {
      edadAnios: null,
      edadMeses: null,
      edadDias: null
    };
  }, []);

  useEffect(() => {
    const datosBase = reevaluacionSeleccionada || ultimaReevaluacion || datosIniciales;

    if (datosBase) {
      setDatosNino(prev => {
        const tieneValoresIndividuales =
          datosBase.edadAnios !== undefined ||
          datosBase.edadMeses !== undefined ||
          datosBase.edadDias !== undefined;

        let edadParseada;
        if (tieneValoresIndividuales) {
          edadParseada = parseEdad(null,
            datosBase.edadAnios || null,
            datosBase.edadMeses || null,
            datosBase.edadDias || null
          );
        } else {
          const edadString = datosBase.edad || datosBase.paciente?.edad;
          edadParseada = parseEdad(edadString);
        }

        return {
          ...prev,
          ...edadParseada,
          nombres: datosBase.nombres || datosBase.paciente?.nombres || '',
          apellidos: datosBase.apellidos || datosBase.paciente?.apellidos || '',
          rut: datosBase.rut || datosBase.paciente?.rut || '',
          telefonoPrincipal: datosBase.telefonoPrincipal || datosBase.paciente?.telefonoPrincipal || '',
          telefonoSecundario: datosBase.telefonoSecundario || datosBase.paciente?.telefonoSecundario || '',
          fechaNacimiento: datosBase.fechaNacimiento || datosBase.paciente?.fechaNacimiento || ''
        };
      });

      // Evaluación psicomotora
      setPuntajeDPM(
        datosBase.puntajeDPM ||
        datosBase.evaluacionPsicomotora?.puntajeDPM ||
        ''
      );
      setdiagnosticoTEPSI(
        datosBase.diagnosticoTEPSI ||
        datosBase.evaluacionPsicomotora?.diagnosticoTEPSI ||
        ''
      );


      // Campos DSM
      setDiagnosticoDSM(
        datosBase.diagnosticoDSM ||
        datosBase.evaluacionPsicomotora?.diagnosticoDSM ||
        ''
      );
      setEdadMental(
        datosBase.edadMental ||
        datosBase.evaluacionPsicomotora?.edadMental ||
        ''
      );
      setEmEc(
        datosBase.emEc ||
        datosBase.evaluacionPsicomotora?.emEc ||
        ''
      );
      setPe(
        datosBase.pe ||
        datosBase.evaluacionPsicomotora?.pe ||
        ''
      );
      setCoeficienteDesarrollo(
        datosBase.coeficienteDesarrollo ||
        datosBase.evaluacionPsicomotora?.coeficienteDesarrollo ||
        ''
      );

      // Áreas de evaluación
      setAreaCoordinacion(
        datosBase.areaCoordinacion ||
        datosBase.areasEvaluacion?.areaCoordinacion ||
        datosBase.evaluacionPsicomotora?.areasEvaluacion?.areaCoordinacion ||
        ''
      );
      setAreaSocial(
        datosBase.areaSocial ||
        datosBase.areasEvaluacion?.areaSocial ||
        datosBase.evaluacionPsicomotora?.areasEvaluacion?.areaSocial ||
        ''
      );
      setAreaLenguaje(
        datosBase.areaLenguaje ||
        datosBase.areasEvaluacion?.areaLenguaje ||
        datosBase.evaluacionPsicomotora?.areasEvaluacion?.areaLenguaje ||
        ''
      );
      setAreaMotora(
        datosBase.areaMotora ||
        datosBase.areasEvaluacion?.areaMotora ||
        datosBase.evaluacionPsicomotora?.areasEvaluacion?.areaMotora ||
        ''
      );

      // Información familiar
      setConQuienVive(
        datosBase.conQuienVive ||
        datosBase.informacionFamiliar?.conQuienVive ||
        ''
      );
      setLocalidad(
        datosBase.localidad ||
        datosBase.informacionFamiliar?.localidad ||
        ''
      );

      // Tipos de familia
      const tipoFamiliaData =
        datosBase.informacionFamiliar?.tiposFamilia ||
        datosBase.tiposFamilia ||
        [];

      // Determinar el tipo de familia y su variante
      if (tipoFamiliaData.length > 0) {
        const primerTipoFamilia = tipoFamiliaData[0];

        // Si el ID es null o 'Otras', usar el campo tipoFamiliaOtro
        if (primerTipoFamilia.id === null || primerTipoFamilia.id === 'Otras') {
          setTipoFamilia('Otras');
          setOtraTipoFamilia(
            primerTipoFamilia.tipoFamiliaOtro ||
            datosBase.tipoFamiliaOtro ||
            ''
          );
        } else {
          // Establecer el tipo de familia con su ID
          setTipoFamilia(primerTipoFamilia.id.toString());
          setOtraTipoFamilia('');
        }
      } else {
        // Si no hay datos de tipos de familia
        setTipoFamilia('');
        setOtraTipoFamilia('');
      }

      // Ciclo vital familiar
      setCicloVitalFamiliar(
        datosBase.cicloVitalFamiliar ||
        datosBase.informacionFamiliar?.cicloVitalFamiliar?.id ||
        ''
      );

      // Padres/Tutores
      const padresData =
        datosBase.padres ||
        datosBase.informacionFamiliar?.padres ||
        [{ nombre: '', escolaridad: '', ocupacion: '' }];

      setPadres(padresData.map(padre => ({
        nombre: padre.nombre || '',
        escolaridad: padre.escolaridad?.id || padre.escolaridad || '',
        ocupacion: padre.ocupacion || ''
      })));

      // Factores de riesgo del niño
      const factoresNinoData =
        datosBase.factoresRiesgoNino ||
        datosBase.factoresRiesgo?.nino ||
        [];

      const nuevosFactoresNino = {};
      factoresRiesgoNinoDisponibles.forEach(factorDisponible => {
        const factorEncontrado = factoresNinoData.some(
          factor =>
            factor.id === factorDisponible.id ||
            factor.nombre === factorDisponible.nombre ||
            factor === factorDisponible.nombre
        );

        nuevosFactoresNino[factorDisponible.nombre] = factorEncontrado;
      });
      setFactoresRiesgoNino(nuevosFactoresNino);

      // Factores de riesgo familiares
      const factoresFamiliaData =
        datosBase.factoresRiesgoFamiliares ||
        datosBase.factoresRiesgo?.familiares ||
        [];

      const nuevosFactoresFamiliares = { otras: '' };
      factoresRiesgoFamiliaresDisponibles.forEach(factorDisponible => {
        if (factorDisponible.nombre !== 'Otras') {
          const factorEncontrado = factoresFamiliaData.some(
            factor =>
              factor.id === factorDisponible.id ||
              factor.nombre === factorDisponible.nombre ||
              factor === factorDisponible.nombre
          );

          nuevosFactoresFamiliares[factorDisponible.nombre] = factorEncontrado;
        }
      });

      // Manejo de 'otras'
      const otrasFactores = factoresFamiliaData.find(
        factor => factor.nombre === 'Otras' || factor === 'Otras'
      );

      if (otrasFactores) {
        nuevosFactoresFamiliares.otras = otrasFactores.otras || ' ';
      }

      setFactoresRiesgoFamiliares(nuevosFactoresFamiliares);
    }
  }, [
    datosIniciales,
    ultimaReevaluacion,
    reevaluacionSeleccionada,
    factoresRiesgoNinoDisponibles,
    factoresRiesgoFamiliaresDisponibles,
    parseEdad
  ]);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!user) return;
      if (datosCargados) return;
      try {
        const token = getToken();
        const [
          nivelesRes,
          ciclosRes,
          tiposRes,
          factoresNinoRes,
          factoresFamiliarRes
        ] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/obtener/niveles-escolaridad`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/obtener/ciclos-vitales-familiares`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/obtener/tipos-familia`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/obtener/factores-riesgo-nino`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/obtener/factores-riesgo-familiar`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setNivelesEscolaridad(nivelesRes.data);
        setCiclosVitalesFamiliares(ciclosRes.data);
        setTiposFamilia(tiposRes.data);

        //  Factores de riesgo del niño
        const factoresNino = factoresNinoRes.data;
        setFactoresRiesgoNinoDisponibles(factoresNino);
        const inicialFactoresNino = {};
        factoresNino.forEach(factor => {
          inicialFactoresNino[factor.nombre] = false;
        });
        setFactoresRiesgoNino(inicialFactoresNino);

        // Factores de riesgo familiares
        const factoresFamiliar = factoresFamiliarRes.data;
        setFactoresRiesgoFamiliaresDisponibles(factoresFamiliar);
        const inicialFactoresFamiliar = { otras: '' };
        factoresFamiliar.forEach(factor => {
          if (factor.nombre !== 'Otras') {
            inicialFactoresFamiliar[factor.nombre] = false;
          }
        });
        setFactoresRiesgoFamiliares(inicialFactoresFamiliar);
        setDatosCargados(true);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          handleSessionExpired();
        } else {
          console.error(error);
        }
      }
    };

    cargarDatos();
  }, [user, getToken, datosCargados]);

  const calcularEdad = useMemo(() => {
    const edadTotal = (parseInt(datosNino.edadAnios) || 0) + (parseInt(datosNino.edadMeses) || 0) / 12;
    return edadTotal;
  }, [datosNino.edadAnios, datosNino.edadMeses]);
  useEffect(() => {
    // Aquí puedes calcular el diagnóstico TEPSI basado en el puntaje DPM
    switch (puntajeDPM) {
      case "Menor o igual a 29":
        setdiagnosticoTEPSI("Retraso");
        break;
      case "Entre 30 y 39":
        setdiagnosticoTEPSI("Riesgo");
        break;
      case "Mayor o igual a 40":
        setdiagnosticoTEPSI("Normal");
        break;
      default:
        setdiagnosticoTEPSI("");
    }
  }, [puntajeDPM]);

  // Condición para ocultar Información Adicional y Factores de Riesgo
  // Si el diagnóstico activo está en "Normal" se ocultan estas secciones
  // Diagnóstico activo es DSM si edad >= 2 años, TEPSI si edad < 2 años
  const mostrarSeccionesAdicionales = () => {
    if (calcularEdad > 2) {
      // Diagnóstico TEPSI activo
      return diagnosticoTEPSI !== 'Normal';
    } else {
      // Diagnóstico DSM activo
      return diagnosticoDSM !== 'Normal';
    }
  };

  if (!user) {
    return <div>Verificando...</div>;
  }

  const handleAddPadre = () => {
    setPadres([...padres, { nombre: '', escolaridad: '', ocupacion: '' }]);
  };

  const handleRemovePadre = (index) => {
    const newPadres = padres.filter((_, i) => i !== index);
    setPadres(newPadres);
  };

  const validarFormulario = () => {
    const erroresValidacion = {};

    if (!datosNino.fechaNacimiento) erroresValidacion.fechaNacimiento = 'La fecha de nacimiento es requerida';
    if (!datosNino.nombres) erroresValidacion.nombres = 'Los nombres son requeridos';
    if (!datosNino.apellidos) erroresValidacion.apellidos = 'Los apellidos son requeridos';
    if (!datosNino.rut) erroresValidacion.rut = 'El RUT es requerido';
    if (!datosNino.telefonoPrincipal) erroresValidacion.telefonoPrincipal = 'El teléfono principal es requerido';

    setErrores(erroresValidacion);
    return Object.keys(erroresValidacion).length === 0;
  };

  const validarCampo = (nombre, valor) => {
    switch (nombre) {
      case 'nombres':
      case 'apellidos':
        return /^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]{2,50}$/.test(valor) ? '' : `Debe contener solo letras y tener entre 2 y 50 caracteres`;
      case 'rut':
        return /^\d{7,8}[-][0-9kK]{1}$/.test(valor) ? '' : 'RUT inválido. Debe estar en el formato XXXXXXXX-X';
      case 'telefonoPrincipal':
      case 'telefonoSecundario':
        return /^\d{8,9}$/.test(valor) ? '' : 'Formato de teléfono inválido. Debe estar en el formato 9XXXXXXXX';
      default:
        return '';
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;

    // Si el campo es el RUT, eliminar puntos
    const sanitizedValue = name === 'rut'
      ? value.replace(/\./g, '')
      : (name === 'telefonoPrincipal' || name === 'telefonoSecundario')
        ? value.replace(/^\+56\s?/, '') // Eliminar el prefijo +56
        : value;

    const error = validarCampo(name, sanitizedValue);
    setErrores(prev => ({ ...prev, [name]: error }));

    setDatosNino(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
  };

  const handleUpdate = async () => {
    if (!validarFormulario()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSuccessMessage('');

    // Construir la cadena de edad
    let edad = '';
    if (datosNino.edadAnios) {
      edad += `${datosNino.edadAnios} años`;
    }
    if (datosNino.edadMeses) {
      if (edad) edad += ', ';
      edad += `${datosNino.edadMeses} meses`;
    }
    if (datosNino.edadDias) {
      if (edad) edad += ', ';
      edad += `${datosNino.edadDias} días`;
    }

    const datosParaEnviar = {
      tipo: 'infantil',
      fechaNacimiento: datosNino.fechaNacimiento,
      nombres: datosNino.nombres,
      apellidos: datosNino.apellidos,
      rut: datosNino.rut,
      edad,
      telefonoPrincipal: datosNino.telefonoPrincipal,
      telefonoSecundario: datosNino.telefonoSecundario,
      puntajeDPM,
      diagnosticoTEPSI,
      edadMental,
      emEc,
      pe,
      coeficienteDesarrollo,
      areaCoordinacion,
      areaSocial,
      areaLenguaje,
      areaMotora,
      diagnosticoDSM,
      padres,
      conQuienVive,
      tipoFamilia: tipoFamilia === 'Otras' ? null : tipoFamilia,
      tipoFamiliaOtro: tipoFamilia === 'Otras' ? otraTipoFamilia : '',
      cicloVitalFamiliar: cicloVitalFamiliar?.toString().trim() === '' ? null : cicloVitalFamiliar,
      localidad,
      factoresRiesgoNino: Object.keys(factoresRiesgoNino).filter(key => factoresRiesgoNino[key]),
      factoresRiesgoFamiliares: Object.keys(factoresRiesgoFamiliares)
        .filter(key => factoresRiesgoFamiliares[key] && key !== 'otras'),
      otrosFactoresRiesgoFamiliares: factoresRiesgoFamiliares.otras || '',
      estudiante_id: user.estudiante_id,
      usuario_id: user.id,
      institucion_id: institucionId,
      isReevaluacion: true
    };

    try {
      const token = getToken();

      // Determinar el ID correcto de la reevaluación
      const reevaluacionId = reevaluacionSeleccionada?.id ||
        ultimaReevaluacion?.id ||
        datosIniciales?.id;

      if (!reevaluacionId) {
        throw new Error('No se encontró un ID de reevaluación válido');
      }

      const url = `${process.env.REACT_APP_API_URL}/fichas-clinicas/reevaluaciones-infantil/${reevaluacionId}`;

      const response = await axios.put(url, datosParaEnviar, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        onIngresar(response.data.data);

        setDatosNino({
          fechaNacimiento: '',
          nombres: '',
          apellidos: '',
          rut: '',
          edadAnios: '',
          edadMeses: '',
          edadDias: '',
          telefonoPrincipal: '',
          telefonoSecundario: ''
        });

        // toast.success('Reevaluación actualizada exitosamente');

        setPuntajeDPM('');
        setdiagnosticoTEPSI('');
        setEdadMental('');
        setEmEc('');
        setPe('');
        setCoeficienteDesarrollo('');
        setAreaCoordinacion('');
        setAreaLenguaje('');
        setAreaMotora('');
        setAreaSocial('');
        setDiagnosticoDSM('');

        setPadres([{ nombre: '', escolaridad: '', ocupacion: '' }]);

        setConQuienVive('');
        setTipoFamilia('');
        setCicloVitalFamiliar('');
        setLocalidad('');
        setOtraTipoFamilia('');

        // Resetear factores de riesgo
        const resetFactoresNino = {};
        factoresRiesgoNinoDisponibles.forEach(factor => {
          resetFactoresNino[factor.nombre] = false;
        });
        setFactoresRiesgoNino(resetFactoresNino);

        const resetFactoresFamiliares = { otras: '' };
        factoresRiesgoFamiliaresDisponibles.forEach(factor => {
          if (factor.nombre !== 'Otras') {
            resetFactoresFamiliares[factor.nombre] = false;
          }
        });
        setFactoresRiesgoFamiliares(resetFactoresFamiliares);

        setErrores({});
      } else {
        setSubmitError('Error al actualizar la reevaluación');
        toast.error('Error al actualizar la reevaluación');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar la reevaluación');
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSuccessMessage('');

    // Construir la cadena de edad
    let edad = '';
    if (datosNino.edadAnios) {
      edad += `${datosNino.edadAnios} años`;
    }
    if (datosNino.edadMeses) {
      if (edad) edad += ', ';
      edad += `${datosNino.edadMeses} meses`;
    }
    if (datosNino.edadDias) {
      if (edad) edad += ', ';
      edad += `${datosNino.edadDias} días`;
    }

    const datosParaEnviar = {
      fechaNacimiento: datosNino.fechaNacimiento,
      nombres: datosNino.nombres,
      apellidos: datosNino.apellidos,
      rut: datosNino.rut,
      edad,
      telefonoPrincipal: datosNino.telefonoPrincipal,
      telefonoSecundario: datosNino.telefonoSecundario,
      puntajeDPM,
      diagnosticoTEPSI,
      edadMental,
      emEc,
      pe,
      coeficienteDesarrollo,
      areaCoordinacion,
      areaSocial,
      areaLenguaje,
      areaMotora,
      diagnosticoDSM,
      padres,
      conQuienVive,
      tipoFamilia,
      tipoFamiliaOtro: tipoFamilia === 'Otras' ? otraTipoFamilia : '',
      cicloVitalFamiliar,
      localidad,
      factoresRiesgoNino: Object.keys(factoresRiesgoNino).filter(key => factoresRiesgoNino[key]),
      factoresRiesgoFamiliares: Object.keys(factoresRiesgoFamiliares)
        .filter(key => factoresRiesgoFamiliares[key] && key !== 'otras'),
      otrosFactoresRiesgoFamiliares: factoresRiesgoFamiliares.otras || '',
      estudiante_id: user.estudiante_id,
      usuario_id: user.id,
      institucion_id: institucionId,
      isReevaluacion: datosIniciales ? true : false
    };

    try {
      const token = getToken();
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/fichas-clinicas/infantil`,
        datosParaEnviar,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        onIngresar(response.data.data);
        setDatosNino({
          fechaNacimiento: '',
          nombres: '',
          apellidos: '',
          rut: '',
          edadAnios: '',
          edadMeses: '',
          edadDias: '',
          telefonoPrincipal: '',
          telefonoSecundario: ''
        });

        toast.success('Ficha clínica infantil creada exitosamente');

        setPuntajeDPM('');
        setdiagnosticoTEPSI('');
        setEdadMental('');
        setEmEc('');
        setPe('');
        setCoeficienteDesarrollo('');
        setAreaCoordinacion('');
        setAreaLenguaje('');
        setAreaMotora('');
        setAreaSocial('');
        setDiagnosticoDSM('');

        setPadres([{ nombre: '', escolaridad: '', ocupacion: '' }]);

        setConQuienVive('');
        setTipoFamilia('');
        setCicloVitalFamiliar('');
        setLocalidad('');
        setOtraTipoFamilia('');

        // Resetear factores de riesgo
        const resetFactoresNino = {};
        factoresRiesgoNinoDisponibles.forEach(factor => {
          resetFactoresNino[factor.nombre] = false;
        });
        setFactoresRiesgoNino(resetFactoresNino);

        const resetFactoresFamiliares = { otras: '' };
        factoresRiesgoFamiliaresDisponibles.forEach(factor => {
          if (factor.nombre !== 'Otras') {
            resetFactoresFamiliares[factor.nombre] = false;
          }
        });
        setFactoresRiesgoFamiliares(resetFactoresFamiliares);

        setErrores({});
        onIngresar(response.data.data);
      } else {
        toast.error('Error al crear la ficha clínica infantil');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al crear la ficha clínica infantil');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="alert alert-info">
        <strong>Acompañamiento en el Desarrollo Infantil Integral</strong>
        <p>
          El Programa de Telecuidado realiza un acompañamiento remoto a los padres y/o tutores
          legales de infantes en una alianza estratégica con jardines infantiles, donde se
          pretende fomentar conductas promotoras de salud en el marco del desarrollo psicomotor de
          estos niños.
        </p>
      </div>

      <div className="card mb-4">
        <div className="card-header custom-card text-light">Datos del Niño/a</div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <div className="form-group">
                <label>Fecha de Nacimiento</label>
                <input
                  type="date"
                  className="form-control"
                  name="fechaNacimiento"
                  value={datosNino.fechaNacimiento}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label>Nombre</label>
                <input
                  id="nombres"
                  name="nombres"
                  type="text"
                  className={`form-control ${errores.nombres ? 'is-invalid' : ''}`}
                  value={datosNino.nombres}
                  onChange={handleChange}
                  placeholder="Ingrese el nombre"
                />
                {errores.nombres && <div className="invalid-feedback">{errores.nombres}</div>}
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label>Apellidos</label>
                <input
                  id="apellidos"
                  name="apellidos"
                  type="text"
                  className={`form-control ${errores.apellidos ? 'is-invalid' : ''}`}
                  value={datosNino.apellidos}
                  onChange={handleChange}
                  placeholder="Ingrese el/los apellidos"
                />
                {errores.apellidos && <div className="invalid-feedback">{errores.apellidos}</div>}
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label>RUT</label>
                <input
                  type="text"
                  name="rut"
                  className={`form-control ${errores.rut ? 'is-invalid' : ''}`}
                  value={datosNino.rut}
                  onChange={handleChange}
                  placeholder="Ej: 12345678-K"
                />
                {errores.rut && <div className="invalid-feedback">{errores.rut}</div>}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4">
              <div className="form-group">
                <label>Edad</label>
                <span> (Años, meses o días)</span>
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group">
                      <input
                        type="number"
                        name="edadAnios"
                        className={`form-control ${datosNino.edadAnios > 5 ? 'is-invalid' : ''
                          }`}
                        placeholder="Años"
                        value={datosNino.edadAnios || ''}
                        onInput={(e) => {
                          const valor = Math.abs(parseInt(e.target.value) || 0);
                          setDatosNino({
                            ...datosNino,
                            edadAnios: valor > 5 ? 5 : valor
                          });
                        }}
                        min="0"
                        max="5"
                      />
                      {datosNino.edadAnios > 5 && (
                        <div className="invalid-feedback">
                          La edad no puede superar los 5 años
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <input
                        type="number"
                        name="edadMeses"
                        className={`form-control ${datosNino.edadMeses > 23 ? 'is-invalid' : ''
                          }`}
                        placeholder="Meses"
                        value={datosNino.edadMeses || ''}
                        onInput={(e) => {
                          const valor = Math.abs(parseInt(e.target.value) || 0);

                          setDatosNino({
                            ...datosNino,
                            edadMeses: valor > 23 ? 23 : valor
                          });
                        }}
                        min="0"
                        max="23"
                      />
                      {datosNino.edadMeses > 23 && (
                        <div className="invalid-feedback">
                          Los meses no pueden superar 23
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <input
                        type="number"
                        name="edadDias"
                        className={`form-control ${datosNino.edadDias > 31 ? 'is-invalid' : ''
                          }`}
                        placeholder="Días"
                        value={datosNino.edadDias || ''}
                        onInput={(e) => {
                          const valor = Math.abs(parseInt(e.target.value) || 0);

                          setDatosNino({
                            ...datosNino,
                            edadDias: valor > 31 ? 31 : valor
                          });
                        }}
                        min="0"
                        max="31"
                      />
                      {datosNino.edadDias > 31 && (
                        <div className="invalid-feedback">
                          Los días no pueden superar 31
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label>Teléfono Principal</label>
                <input
                  type="text"
                  name="telefonoPrincipal"
                  className={`form-control ${errores.telefonoPrincipal ? 'is-invalid' : ''}`}
                  value={datosNino.telefonoPrincipal}
                  onChange={handleChange}
                  placeholder="Ej: 912345678"
                />
                {errores.telefonoPrincipal && <div className="invalid-feedback">{errores.telefonoPrincipal}</div>}
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label>Teléfono Secundario (Ideal)</label>
                <input
                  type="text"
                  name="telefonoSecundario"
                  className={`form-control ${errores.telefonoSecundario ? 'is-invalid' : ''}`}
                  value={datosNino.telefonoSecundario}
                  onChange={handleChange}
                  placeholder="Ej: 912345678"
                />
                {errores.telefonoSecundario && <div className="invalid-feedback">{errores.telefonoSecundario}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {calcularEdad >= 3 ? (
        <div className="card mb-4">
          <div className="card-header custom-card text-light">Evaluación Psicomotora (TEPSI)</div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label>Puntaje DPM</label>
                  <select
                    className="form-control"
                    value={puntajeDPM}
                    onChange={(e) => setPuntajeDPM(e.target.value)}
                  >
                    <option value="">Seleccione...</option>
                    <option value="Menor o igual a 29">Menor o igual a 29</option>
                    <option value="Entre 30 y 39">Entre 30 y 39</option>
                    <option value="Mayor o igual a 40">Mayor o igual a 40</option>
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label>Diagnóstico TEPSI</label>
                  <input
                    type="text"
                    className="form-control"
                    value={diagnosticoTEPSI}
                    readOnly
                    placeholder="Diagnóstico TEPSI"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card mb-4">
          <div className="card-header custom-card text-light">Evaluación DSM</div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-2">
                <div className="form-group">
                  <label>Edad Mental</label>
                  <input
                    type="text"
                    className="form-control"
                    value={edadMental}
                    onChange={(e) => setEdadMental(e.target.value)}
                    placeholder='Ej: 4 años 6 meses'
                  />
                </div>
              </div>
              <div className="col-md-2">
                <div className="form-group">
                  <label>EM/EC</label>
                  <input
                    type="text"
                    className="form-control"
                    value={emEc}
                    onChange={(e) => setEmEc(e.target.value)}
                    placeholder='Ej: 0.85'
                  />
                </div>
              </div>
              <div className="col-md-2">
                <div className="form-group">
                  <label>PE</label>
                  <input
                    type="text"
                    className="form-control"
                    value={pe}
                    onChange={(e) => setPe(e.target.value)}
                    placeholder='Ej: 85'
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label>Coeficiente de Desarrollo</label>
                  <select
                    className="form-control"
                    value={coeficienteDesarrollo}
                    onChange={(e) => setCoeficienteDesarrollo(e.target.value)}
                  >
                    <option value="">Seleccione...</option>
                    <option value="Normal">Normal</option>
                    <option value="Riesgo">Riesgo</option>
                    <option value="Retraso">Retraso</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-3">
                <div className="form-group">
                  <label>Área Coordinación</label>
                  <select
                    className="form-control"
                    value={areaCoordinacion}
                    onChange={(e) => setAreaCoordinacion(e.target.value)}
                  >
                    <option value="">Seleccione...</option>
                    <option value="Normal">Normal</option>
                    <option value="Déficit">Déficit</option>
                  </select>
                </div>
              </div>
              <div className="col-md-3">
                <div className="form-group">
                  <label>Área Social</label>
                  <select
                    className="form-control"
                    value={areaSocial}
                    onChange={(e) => setAreaSocial(e.target.value)}
                  >
                    <option value="">Seleccione...</option>
                    <option value="Normal">Normal</option>
                    <option value="Déficit">Déficit</option>
                  </select>
                </div>
              </div>
              <div className="col-md-3">
                <div className="form-group">
                  <label>Área Lenguaje</label>
                  <select
                    className="form-control"
                    value={areaLenguaje}
                    onChange={(e) => setAreaLenguaje(e.target.value)}
                  >
                    <option value="">Seleccione...</option>
                    <option value="Normal">Normal</option>
                    <option value="Déficit">Déficit</option>
                  </select>
                </div>
              </div>
              <div className="col-md-3">
                <div className="form-group">
                  <label>Área Motora</label>
                  <select
                    className="form-control"
                    value={areaMotora}
                    onChange={(e) => setAreaMotora(e.target.value)}
                  >
                    <option value="">Seleccione...</option>
                    <option value="Normal">Normal</option>
                    <option value="Déficit">Déficit</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="form-group">
                  <label>Diagnóstico DSM</label>
                  <select
                    className="form-control"
                    value={diagnosticoDSM}
                    onChange={(e) => setDiagnosticoDSM(e.target.value)}
                  >
                    <option value="">Seleccione...</option>
                    <option value="Normal">Normal</option>
                    <option value="Normal con rezago">Normal con rezago</option>
                    <option value="Riesgo">Riesgo</option>
                    <option value="Retraso">Retraso</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {mostrarSeccionesAdicionales() && (
        <>
          <div className="card mb-4">
            <div className="card-header custom-card text-light">Información Familiar (Puede ingresar más de uno)</div>
            <div className="card-body">
              {padres.map((padre, index) => (
                <div key={index} className="border p-3 mb-3">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Nombre Padre/Madre/Tutor</label>
                        <input
                          type="text"
                          className="form-control"
                          value={padre.nombre}
                          onChange={(e) => {
                            const newPadres = [...padres];
                            newPadres[index].nombre = e.target.value;
                            setPadres(newPadres);
                          }}
                          placeholder="Ingrese el nombre y el/los apellido(s)"
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Escolaridad</label>
                        <select
                          className="form-control"
                          value={padre.escolaridad}
                          onChange={(e) => {
                            const newPadres = [...padres];
                            newPadres[index].escolaridad = e.target.value;
                            setPadres(newPadres);
                          }}
                        >
                          <option value="">Seleccione...</option>
                          {nivelesEscolaridad.map(nivel => (
                            <option key={nivel.id} value={nivel.id}>{nivel.nivel}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Ocupación</label>
                        <input
                          type="text"
                          className="form-control"
                          value={padre.ocupacion}
                          onChange={(e) => {
                            const newPadres = [...padres];
                            newPadres[index].ocupacion = e.target.value;
                            setPadres(newPadres);
                          }}
                          placeholder="Ingrese la ocupación"
                        />
                      </div>
                    </div>
                  </div>
                  {index > 0 && (
                    <div className="text-right">
                      <button className="btn btn-danger btn-sm" onClick={() => handleRemovePadre(index)}>
                        Quitar
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <button className="btn btn-primary" onClick={handleAddPadre}>
                Añadir Padre/Tutor
              </button>
            </div>
          </div>
        </>
      )}


      {mostrarSeccionesAdicionales() && (
        <>
          <div className="card mb-4">
            <div className="card-header custom-card text-light">Información Adicional</div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Con quién vive el menor</label>
                    <input
                      type="text"
                      className="form-control"
                      value={conQuienVive}
                      onChange={(e) => setConQuienVive(e.target.value)}
                      placeholder="Ingrese con quién vive el menor. Ejemplo: Padre, madre o tutor legal"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Tipo de familia</label>
                    <select
                      className="form-control"
                      value={tipoFamilia}
                      onChange={(e) => {
                        setTipoFamilia(e.target.value);
                        if (e.target.value !== 'Otra') {
                          setOtraTipoFamilia('');
                        }
                      }}
                    >
                      <option value="">Seleccione...</option>
                      {tiposFamilia.map(tipo => (
                        <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                      ))}
                      <option value="Otras">Otra</option>
                    </select>
                  </div>
                  {tipoFamilia === 'Otras' && (
                    <div className="form-group">
                      <label>Especifique</label>
                      <input
                        type="text"
                        className="form-control"
                        value={otraTipoFamilia}
                        onChange={(e) => setOtraTipoFamilia(e.target.value)}
                        placeholder="Especifique el tipo de familia"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Ciclo vital familiar</label>
                    <select
                      className="form-control"
                      value={cicloVitalFamiliar}
                      onChange={(e) => setCicloVitalFamiliar(e.target.value)}
                    >
                      <option value="">Seleccione...</option>
                      {ciclosVitalesFamiliares.map(ciclo => (
                        <option key={ciclo.id} value={ciclo.id}>{ciclo.ciclo}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Localidad</label>
                    <select
                      className="form-control"
                      value={localidad}
                      onChange={(e) => setLocalidad(e.target.value)}
                    >
                      <option value="">Seleccione...</option>
                      <option value="Urbano">Urbano</option>
                      <option value="Rural">Rural</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {mostrarSeccionesAdicionales() && (
        <>
          <div className="card mb-4">
            <div className="card-header custom-card text-light">Factores de Riesgo</div>
            <div className="card-body">
              <h5>Factores de Riesgo del Niño/a</h5>
              <div className="row mb-3">
                {factoresRiesgoNinoDisponibles.map(factor => (
                  <div className="col-md-3" key={factor.id}>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={`nino-${factor.id}`}
                        checked={factoresRiesgoNino[factor.nombre] || false}
                        onChange={(e) => setFactoresRiesgoNino({ ...factoresRiesgoNino, [factor.nombre]: e.target.checked })}
                      />
                      <label className="form-check-label" htmlFor={`nino-${factor.id}`}>{factor.nombre}</label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <h5>Factores de Riesgo Familiar</h5>
            <div className="row mb-3 pl-2">
              {factoresRiesgoFamiliaresDisponibles.map(factor => (
                factor.nombre !== 'Otras' ? (
                  <div className="col-md-3" key={factor.id}>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={`familiar-${factor.id}`}
                        checked={factoresRiesgoFamiliares[factor.nombre] || false}
                        onChange={(e) => setFactoresRiesgoFamiliares({ ...factoresRiesgoFamiliares, [factor.nombre]: e.target.checked })}
                      />
                      <label className="form-check-label" htmlFor={`familiar-${factor.id}`}>{factor.nombre}</label>
                    </div>
                  </div>
                ) : null
              ))}
              <div className="col-md-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="otrasRiesgos"
                    checked={factoresRiesgoFamiliares.otras !== ''}
                    onChange={(e) => setFactoresRiesgoFamiliares({ ...factoresRiesgoFamiliares, otras: e.target.checked ? ' ' : '' })}
                  />
                  <label className="form-check-label" htmlFor="otrasRiesgos">Otras</label>
                </div>
              </div>
              {factoresRiesgoFamiliares.otras !== '' && (
                <div className="col-md-12 mt-3">
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      id="otrosRiesgosFamiliaresTexto"
                      placeholder="Especifique otros riesgos familiares"
                      value={factoresRiesgoFamiliares.otras}
                      onChange={(e) => setFactoresRiesgoFamiliares({ ...factoresRiesgoFamiliares, otras: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <div className="d-flex justify-content-center mt-5 mb-5">
        {!modoEdicion && (
          <button
            className="btn btn-primary px-4 mx-2"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Ingresando...' : 'Ingresar Ficha Clínica'}
          </button>
        )}
        <button className="btn btn-secondary px-4 mx-2" onClick={onVolver}>
          Volver
        </button>
        {modoEdicion && (
          <button
            className="btn btn-warning px-4 mx-2"
            onClick={handleUpdate}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Actualizando...' : 'Actualizar Reevaluación'}
          </button>
        )}
      </div>
      {submitError && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <strong><i className="icon fas fa-ban"></i> Error:</strong> {submitError}
          <button type="button" className="close" data-dismiss="alert" aria-label="Close" onClick={() => setSubmitError('')}>
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      )}
    </>
  );
};

export default FichaClinicaInfantil;