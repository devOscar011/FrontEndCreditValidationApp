import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Button, Card, Portal, Text, TextInput } from 'react-native-paper';
import api from '../../Services/Api';
import { toast } from '../../lib/toast';

const opcionesEmpleo = ['Empleado', 'Desempleado', 'Independiente', 'Jubilado'];
const opcionesEstadoDomicilio = ['Propio', 'Alquilado', 'Familiar'];

export default function FormularioIngresos() {
  const router = useRouter();
  const { personaID } = useLocalSearchParams();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeDateField, setActiveDateField] = useState('');
  const [activeDropdown, setActiveDropdown] = useState({
    key: '',
    label: '',
    options: [],
    field: '',
    setState: null,
  });
  const [loading, setLoading] = useState(false);

  const [laboral, setLaboral] = useState({
    TipoEmpleo: '',
    LugarTrabajo: '',
    FechaContratacion: '',
    FechaAlCorriente: '',
    IngresosMensuales: '',
    MontoGarantia: '',
    MontoDeudas: '',
  });

  const [domicilio, setDomicilio] = useState({
    Direccion: '',
    EstadoDomicilio: '',
    MontoMensualidad: '',
    Departamento: '',
    Municipio: '',
    Barrio: '',
  });

  const [gastosMensuales, setGastosMensuales] = useState({
    Alimentacion: '',
    VestimentaCalzado: '',
    Transporte: '',
    Colegiatura: '',
    OtrosGastos: '',
    GastosSalud: '',
    Telecomunicaciones: '',
    ServiciosAguaLuz: '',
    ServiciosCableInternet: '',
  });

  const [referenciasPersonales, setReferenciasPersonales] = useState({
    NombreApellido: '',
    NumeroContacto: '',
  });

  const openDropdown = (key, label, options, field, setState) => {
    setActiveDropdown({ key, label, options, field, setState });
    setShowDropdown(true);
  };

  const handleSelectOption = (option) => {
    if (activeDropdown.setState && activeDropdown.field) {
      if (activeDropdown.key === 'EstadoDomicilio') {
        activeDropdown.setState(prev => ({
          ...prev,
          [activeDropdown.field]: option,
          MontoMensualidad: option === 'Propio' ? '0' : '',
        }));
      } else {
        activeDropdown.setState(prev => ({
          ...prev,
          [activeDropdown.field]: option,
        }));
      }
    }
    setShowDropdown(false);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (!selectedDate) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (activeDateField === 'FechaContratacion') {
      const chosen = new Date(selectedDate);
      chosen.setHours(0, 0, 0, 0);
      if (chosen >= today) {
        toast.show({
          type: 'error',
          text1: 'Fecha inv�lida',
          text2: 'La fecha de contrataci�n debe ser anterior a hoy.',
        });
        setActiveDateField('');
        return;
      }
    }

    const dateString = selectedDate.toISOString().split('T')[0];

    if (activeDateField === 'FechaContratacion') {
      setLaboral((prev) => ({ ...prev, FechaContratacion: dateString }));
    } else if (activeDateField === 'FechaAlCorriente') {
      setLaboral((prev) => ({ ...prev, FechaAlCorriente: dateString }));
    }

    setActiveDateField('');
  };

  // VALIDACIÓN MEJORADA
  const validateForm = () => {
    const errors = [];

    // Validar campos requeridos laborales
    if (!laboral.TipoEmpleo) errors.push('Tipo de empleo es requerido');
    if (!laboral.LugarTrabajo) errors.push('Lugar de trabajo es requerido');
    if (!laboral.IngresosMensuales) errors.push('Ingresos mensuales son requeridos');
    if (!laboral.FechaContratacion) {
      errors.push('Fecha de contrataci�n es requerida');
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const fc = new Date(laboral.FechaContratacion);
      fc.setHours(0, 0, 0, 0);
      if (fc >= today) errors.push('La fecha de contrataci�n debe ser anterior a hoy');
    }

    // Validar domicilio
    if (!domicilio.Direccion) errors.push('Direccion es requerida');
    if (!domicilio.EstadoDomicilio) errors.push('Estado del domicilio es requerido');
    if (!domicilio.Departamento) errors.push('Departamento es requerido');
    if (!domicilio.Municipio) errors.push('Municipio es requerido');
    if (!domicilio.Barrio) errors.push('Barrio es requerido');

    // Validar referencias
    if (!referenciasPersonales.NombreApellido) errors.push('Nombre de referencia es requerido');
    if (!referenciasPersonales.NumeroContacto) errors.push('Número de contacto es requerido');

    return errors;
  };

  const handleEnviarFormulario = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      toast.show({
        type: 'error',
        text1: 'Campos requeridos',
        text2: errors.join(' � '),
      });
      return;
    }

    setLoading(true);
    try {
      // Si no se seleccionó fecha, usar fecha actual
      const today = new Date().toISOString().split('T')[0];

      // 1. Preparar datos laborales - Asegurar que todos los campos tengan valor
      const datosLaboral = {
        TipoEmpleo: laboral.TipoEmpleo || '',
        LugarTrabajo: laboral.LugarTrabajo || '',
        FechaContratacion: laboral.FechaContratacion || today,
        FechaAlCorriente: laboral.FechaAlCorriente || today,
        IngresosMensuales: laboral.IngresosMensuales || '0',
        MontoGarantia: laboral.MontoGarantia || '0',
        MontoDeudas: laboral.MontoDeudas || '0',
        IdPersona: personaID, // Mantener como está
      };

      console.log('Enviando datos laborales:', datosLaboral);

      // 2. Enviar todos los datos en orden
      const gastosSanitizados = Object.fromEntries(
        Object.entries(gastosMensuales).map(([k, v]) => [k, v === '' || v === null || v === undefined ? '0' : v])
      );
      const respuestas = await Promise.all([
        api.post('/laborales/', datosLaboral),
        api.post('/domicilios/', {
          ...domicilio,
          MontoMensualidad: domicilio.EstadoDomicilio === 'Propio' ? '0' : (domicilio.MontoMensualidad || '0'),
          IdPersona: personaID,
        }),
        api.post('/gastos/', {
          ...gastosSanitizados,
          IdPersona: personaID,
        }),
        api.post('/referencias/', {
          ...referenciasPersonales,
          IdPersona: personaID,
        }),
      ]);

      console.log('Todas las respuestas:', respuestas.map(r => r.status));

      toast.show({
        type: 'success',
        text1: 'Enviado',
        text2: 'Formulario enviado correctamente',
      });
      setTimeout(() => router.push({
        pathname: '/Drawer/AmortizacionCalculada',
        params: { personaID: personaID },
      }), 800);

    } catch (error) {
      console.error('Error completo:', error);
      console.error('Respuesta del error:', error.response?.data);
      
      let mensajeError = 'Error al enviar formulario.';
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          mensajeError = Object.entries(error.response.data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('\n');
        } else {
          mensajeError = error.response.data;
        }
      }

      toast.show({
        type: 'error',
        text1: 'Error',
        text2: mensajeError,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderDropdownField = (label, value, options, key, state, setState, fieldName) => (
    <TouchableOpacity
      onPress={() => openDropdown(key, label, options, fieldName, setState)}
      style={styles.dropdownContainer}
    >
      <Text style={styles.dropdownLabel}>{label}</Text>
      <View style={styles.dropdownValue}>
        <Text style={value ? styles.dropdownText : styles.dropdownPlaceholder}>
          {value || `Seleccionar ${label.toLowerCase()}`}
        </Text>
        <MaterialIcons name="expand-more" size={24} color="#666" />
      </View>
    </TouchableOpacity>
  );

  const renderDateField = (label, value, fieldName) => (
    <TouchableOpacity
      onPress={() => {
        setActiveDateField(fieldName);
        setShowDatePicker(true);
      }}
      style={styles.dateContainer}
    >
      <Text style={styles.dateLabel}>{label}</Text>
      <View style={styles.dateValue}>
        <MaterialIcons name="calendar-today" size={20} color="#6366F1" style={styles.dateIcon} />
        <Text style={value ? styles.dateText : styles.datePlaceholder}>
          {value || `Seleccionar ${label.toLowerCase()}`}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderInputField = (label, value, onChange, keyboardType = 'default', multiline = false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        style={[styles.input, multiline && styles.multilineInput]}
        keyboardType={keyboardType}
        mode="outlined"
        outlineColor="#e0e0e0"
        activeOutlineColor="#6366F1"
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
      />
    </View>
  );

  return (
    <>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <MaterialIcons name="arrow-back" size={24} color="#6366F1" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Información Adicional</Text>
            </View>

            {/* SECCIÓN LABORAL */}
            <Card style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="work" size={24} color="#6366F1" />
                <Text style={styles.sectionTitle}>Información Laboral</Text>
              </View>
              <Card.Content>
                {renderDropdownField(
                  'Tipo de Empleo',
                  laboral.TipoEmpleo,
                  opcionesEmpleo,
                  'TipoEmpleo',
                  laboral,
                  setLaboral,
                  'TipoEmpleo'
                )}

                {renderInputField(
                  'Lugar de Trabajo',
                  laboral.LugarTrabajo,
                  (text) => setLaboral(prev => ({ ...prev, LugarTrabajo: text }))
                )}

                <View style={styles.dateRow}>
                  {renderDateField('Fecha de Contratación', laboral.FechaContratacion, 'FechaContratacion')}
                  {renderDateField('Fecha al Corriente', laboral.FechaAlCorriente, 'FechaAlCorriente')}
                </View>

                {renderInputField(
                  'Ingresos Mensuales ($)',
                  laboral.IngresosMensuales,
                  (text) => setLaboral(prev => ({ ...prev, IngresosMensuales: text })),
                  'numeric'
                )}

                {renderInputField(
                  'Monto Garantía ($)',
                  laboral.MontoGarantia,
                  (text) => setLaboral(prev => ({ ...prev, MontoGarantia: text })),
                  'numeric'
                )}

                {renderInputField(
                  'Monto Deudas ($)',
                  laboral.MontoDeudas,
                  (text) => setLaboral(prev => ({ ...prev, MontoDeudas: text })),
                  'numeric'
                )}
              </Card.Content>
            </Card>

            {/* SECCIÓN DOMICILIO */}
            <Card style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="home" size={24} color="#6366F1" />
                <Text style={styles.sectionTitle}>Domicilio</Text>
              </View>
              <Card.Content>
                {renderInputField(
                  'Dirección',
                  domicilio.Direccion,
                  (text) => setDomicilio(prev => ({ ...prev, Direccion: text })),
                  'default',
                  true
                )}

                {renderDropdownField(
                  'Estado del Domicilio',
                  domicilio.EstadoDomicilio,
                  opcionesEstadoDomicilio,
                  'EstadoDomicilio',
                  domicilio,
                  setDomicilio,
                  'EstadoDomicilio'
                )}

                {domicilio.EstadoDomicilio && domicilio.EstadoDomicilio !== 'Propio' && (
                  renderInputField(
                    'Monto Mensualidad ($)',
                    domicilio.MontoMensualidad,
                    (text) => setDomicilio(prev => ({ ...prev, MontoMensualidad: text })),
                    'numeric'
                  )
                )}

                <View style={styles.row}>
                  <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                    {renderInputField(
                      'Departamento',
                      domicilio.Departamento,
                      (text) => setDomicilio(prev => ({ ...prev, Departamento: text }))
                    )}
                  </View>
                  <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                    {renderInputField(
                      'Municipio',
                      domicilio.Municipio,
                      (text) => setDomicilio(prev => ({ ...prev, Municipio: text }))
                    )}
                  </View>
                </View>

                {renderInputField(
                  'Barrio',
                  domicilio.Barrio,
                  (text) => setDomicilio(prev => ({ ...prev, Barrio: text }))
                )}
              </Card.Content>
            </Card>

            {/* SECCIÓN GASTOS */}
            <Card style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="attach-money" size={24} color="#6366F1" />
                <Text style={styles.sectionTitle}>Gastos Mensuales</Text>
              </View>
              <Card.Content>
                <View style={styles.gridContainer}>
                  {Object.entries(gastosMensuales).map(([key, value]) => (
                    <View key={key} style={styles.gridItem}>
                      {renderInputField(
                        key.replace(/([A-Z])/g, ' $1').trim(),
                        value,
                        (text) => setGastosMensuales(prev => ({ ...prev, [key]: text })),
                        'numeric'
                      )}
                    </View>
                  ))}
                </View>
              </Card.Content>
            </Card>

            {/* SECCIÓN REFERENCIAS */}
            <Card style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="people" size={24} color="#6366F1" />
                <Text style={styles.sectionTitle}>Referencias Personales</Text>
              </View>
              <Card.Content>
                {renderInputField(
                  'Nombre y Apellido',
                  referenciasPersonales.NombreApellido,
                  (text) => setReferenciasPersonales(prev => ({ ...prev, NombreApellido: text }))
                )}

                {renderInputField(
                  'Número de Contacto',
                  referenciasPersonales.NumeroContacto,
                  (text) => setReferenciasPersonales(prev => ({ ...prev, NumeroContacto: text })),
                  'phone-pad'
                )}
              </Card.Content>
            </Card>

            {/* BOTÓN ENVIAR */}
            <Button
              mode="contained"
              onPress={handleEnviarFormulario}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
              contentStyle={styles.submitButtonContent}
              icon="send"
            >
              {loading ? 'Enviando...' : 'Enviar Formulario'}
            </Button>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* DATE PICKER */}
      {showDatePicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* DATE PICKER PARA WEB */}
      {showDatePicker && Platform.OS === 'web' && (
        <View style={styles.webDatePicker}>
          <input
            type="date"
            value={activeDateField === 'FechaContratacion' 
              ? laboral.FechaContratacion 
              : laboral.FechaAlCorriente || ''}
            onChange={(e) => {
              const dateString = e.target.value;
              if (activeDateField === 'FechaContratacion') {
                const chosen = new Date(dateString);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (chosen >= today) {
                  toast.show({
                    type: 'error',
                    text1: 'Fecha inv�lida',
                    text2: 'La fecha de contrataci�n debe ser anterior a hoy.',
                  });
                  return;
                }
                setLaboral(prev => ({ ...prev, FechaContratacion: dateString }));
              } else if (activeDateField === 'FechaAlCorriente') {
                setLaboral(prev => ({ ...prev, FechaAlCorriente: dateString }));
              }
              setShowDatePicker(false);
            }}
            style={styles.webDateInput}
          />
          <Button onPress={() => setShowDatePicker(false)} style={styles.webDateButton}>
            Cerrar
          </Button>
        </View>
      )}

      {/* DROPDOWN MODAL */}
      <Portal>
        <Modal
          visible={showDropdown}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDropdown(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{activeDropdown.label}</Text>
                    <TouchableOpacity onPress={() => setShowDropdown(false)}>
                      <MaterialIcons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={activeDropdown.options}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.modalItem}
                        onPress={() => handleSelectOption(item)}
                      >
                        <Text style={styles.modalItemText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                    ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 12,
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 4,
  },
  dropdownValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  dropdownText: {
    fontSize: 16,
    color: '#1e293b',
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: '#94a3b8',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#fff',
  },
  multilineInput: {
    minHeight: 80,
  },
  dateContainer: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 4,
  },
  dateValue: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  dateIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#1e293b',
  },
  datePlaceholder: {
    fontSize: 16,
    color: '#94a3b8',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 24,
    backgroundColor: '#6366F1',
    borderRadius: 8,
    paddingVertical: 8,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalItem: {
    padding: 16,
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  modalSeparator: {
    height: 1,
    backgroundColor: '#eee',
    marginHorizontal: 16,
  },
  webDatePicker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -150 }, { translateY: -100 }],
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  webDateInput: {
    width: 250,
    padding: 10,
    fontSize: 16,
    border: '1px solid #ccc',
    borderRadius: 4,
  },
  webDateButton: {
    marginTop: 10,
  },
});















