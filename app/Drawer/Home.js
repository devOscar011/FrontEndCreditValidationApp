import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
} from 'react-native';
import {
  Button,
  Text,
  TextInput,
  Card,
  Portal,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../Services/Api';

const dropdownOptions = {
  EstadoCivil: ['Soltero', 'Casado', 'Divorciado', 'Viudo'],
  Sexo: ['Masculino', 'Femenino', 'Otro'],
  TipoIdentificacion: ['DUI', 'Pasaporte', 'NIT', 'Otro'],
  TipoMoneda: ['Córdoba', 'Dólar'],
  PropositoPrestamo: [
    'Capital inversión',
    'Mejoramiento Vivienda',
    'Compra Vehículo',
    'Pago Servicios de Salud',
    'Pago de Deudas',
    'Otro',
  ],
  Estado: ['En Proceso', 'Aprobado', 'Rechazada'],
};

// Valida fecha YYYY-MM-DD y que no sea futura
const esFechaValida = (fechaStr) => {
  const fecha = new Date(fechaStr);
  if (isNaN(fecha)) return false;
  const hoy = new Date();
  return fecha <= hoy;
};

// Validar cédula nicaragüense (DUI)
const esCedulaValida = (cedula) => {
  const regex = /^\d{3}-\d{6}-\d{4}[A-Z]?$/i;
  if (!regex.test(cedula.trim())) return false;

  const partes = cedula.split('-');
  if (partes.length !== 3) return false;

  const fechaStr = partes[1]; // DDMMYY
  const dia = fechaStr.substring(0, 2);
  const mes = fechaStr.substring(2, 4);
  const anio = fechaStr.substring(4, 6);

  const anioCompleto = (parseInt(anio) <= 25) ? `20${anio}` : `19${anio}`;
  const fechaFormateada = `${anioCompleto}-${mes}-${dia}`;

  if (!esFechaValida(fechaFormateada)) return false;

  return true;
};

// Validar pasaporte (letras y números, 5-10 caracteres)
const esPasaporteValido = (numero) => {
  const regex = /^[a-zA-Z0-9]{5,10}$/;
  return regex.test(numero.trim());
};

// Validar NIT (ejemplo típico: 4-6-3-1 dígitos con guiones)
const esNITValido = (numero) => {
  const regex = /^\d{4}-\d{6}-\d{3}-\d{1}$/;
  return regex.test(numero.trim());
};

// Validación general según tipo de identificación
const validarIdentificacion = (tipo, numero) => {
  if (!numero) return false;

  switch (tipo) {
    case 'DUI':
      return esCedulaValida(numero);
    case 'Pasaporte':
      return esPasaporteValido(numero);
    case 'NIT':
      return esNITValido(numero);
    case 'Otro':
      return true; 
    default:
      return false;
  }
};

export default function HomeScreen() {
  const router = useRouter();

  const [persona, setPersona] = useState({
    Nombres: '',
    Apellidos: '',
    TipoIdentificacion: '',
    NumeroIdentificacion: '',
    Nacionalidad: '',
    FechaNacimiento: '',
    EstadoCivil: '',
    Sexo: '',
  });

  const [solicitud, setSolicitud] = useState({
    NumeroSolicitud: '',
    TipoMoneda: '',
    MontoSolicitado: '',
    PlazoFinanciero: '',
    PropositoPrestamo: '',
    TasaInteresAnual: '',
    Estado: '',
  });

  const [conyuge, setConyuge] = useState({
    NombreApellidos: '',
    NumeroCedula: '',
    NumeroPersonasACargo: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownData, setDropdownData] = useState({
    key: '',
    label: '',
    options: [],
    section: '',
    field: '',
  });
  const [activeDateField, setActiveDateField] = useState('');
  const [activeSection, setActiveSection] = useState(0);

  const handleInput = (section, field, value) => {
    if (section === 'persona') {
      let updatedPersona = { ...persona, [field]: value };

      // Extraer fecha desde DUI para FechaNacimiento si aplica
      if (field === 'NumeroIdentificacion' && persona.TipoIdentificacion === 'DUI' && value.length >= 14) {
        const parts = value.split('-');
        if (parts.length === 3 && parts[1].length === 6) {
          const day = parts[1].substring(0, 2);
          const month = parts[1].substring(2, 4);
          const year = parts[1].substring(4, 6);
          const fullYear = parseInt(year) <= 25 ? `20${year}` : `19${year}`;
          const fechaFormateada = `${fullYear}-${month}-${day}`;
          if (esFechaValida(fechaFormateada)) {
            updatedPersona.FechaNacimiento = fechaFormateada;
          }
        }
      }

      setPersona(updatedPersona);
    }

    if (section === 'solicitud') setSolicitud(prev => ({ ...prev, [field]: value }));
    if (section === 'conyuge') setConyuge(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (!selectedDate) return;
    const formatted = selectedDate.toISOString().split('T')[0];
    handleInput('persona', activeDateField, formatted);
    setActiveDateField('');
  };

  const openDropdown = (key, label, options, section, field) => {
    setDropdownData({ key, label, options, section, field });
    setShowDropdown(true);
  };

  const handleSelectOption = (option) => {
    handleInput(dropdownData.section, dropdownData.field, option);
    setShowDropdown(false);
  };

  const handleGuardar = async () => {
    // Validar identificación según tipo
    if (!validarIdentificacion(persona.TipoIdentificacion, persona.NumeroIdentificacion)) {
      alert('Número de identificación no válido para el tipo seleccionado.');
      return;
    }

    try {
      // Crear persona
      const resPersona = await api.post('/personas/', {
        ...persona,
        FechaNacimiento: persona.FechaNacimiento || null,
      });

      const idPersona = resPersona.data.id;

      await api.post('/solicitudes/', {
        ...solicitud,
        IdPersona: idPersona,
      });

      if (persona.EstadoCivil === 'Casado') {
        await api.post('/conyuges/', {
          ...conyuge,
          IdPersona: idPersona,
        });
      }

      router.push({
        pathname: '/Drawer/FormIngresos',
        params: { personaID: idPersona },
      });

    } catch (err) {
      console.error('Error al guardar información:', err);
      alert('Error al guardar. Verifica los datos o la conexión.');
    }
  };

  const renderDropdown = (key, label, options, section, field) => {
    const value = section === 'persona' ? persona[field] : 
                  section === 'solicitud' ? solicitud[field] : 
                  conyuge[field];

    return (
      <View key={key} style={styles.inputContainer}>
        <TouchableOpacity onPress={() => openDropdown(key, label, options, section, field)}>
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>{label}</Text>
            <View style={styles.dropdownValueContainer}>
              <Text style={[
                styles.dropdownValue,
                !value && styles.placeholder
              ]}>
                {value || 'Seleccionar'}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSectionHeader = (title, icon, sectionIndex) => (
    <TouchableOpacity 
      style={[
        styles.sectionHeader,
        activeSection === sectionIndex && styles.activeSectionHeader
      ]}
      onPress={() => setActiveSection(sectionIndex)}
    >
      <View style={styles.sectionHeaderContent}>
        <MaterialIcons name={icon} size={24} color={activeSection === sectionIndex ? "#fff" : "#2196F3"} />
        <Text style={[
          styles.sectionHeaderText,
          activeSection === sectionIndex && styles.activeSectionHeaderText
        ]}>
          {title}
        </Text>
      </View>
      <MaterialIcons 
        name={activeSection === sectionIndex ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
        size={24} 
        color={activeSection === sectionIndex ? "#fff" : "#666"} 
      />
    </TouchableOpacity>
  );

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.headerTitle}>Solicitud de Crédito</Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>Complete todos los campos requeridos</Text>
        </View>

        <Card style={styles.card}>
          {renderSectionHeader("Datos Personales", "person", 0)}
          
          {activeSection === 0 && (
            <View style={styles.sectionContent}>
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <TextInput
                    label="Nombres"
                    mode="outlined"
                    value={persona.Nombres}
                    onChangeText={text => handleInput('persona', 'Nombres', text)}
                    style={styles.input}
                    left={<TextInput.Icon icon="account" />}
                  />
                </View>
                <View style={styles.halfInput}>
                  <TextInput
                    label="Apellidos"
                    mode="outlined"
                    value={persona.Apellidos}
                    onChangeText={text => handleInput('persona', 'Apellidos', text)}
                    style={styles.input}
                    left={<TextInput.Icon icon="account" />}
                  />
                </View>
              </View>

              {renderDropdown('tipo-id', 'Tipo de Identificación', dropdownOptions.TipoIdentificacion, 'persona', 'TipoIdentificacion')}

              <TextInput
                label="Número de Identificación"
                mode="outlined"
                value={persona.NumeroIdentificacion}
                onChangeText={text => handleInput('persona', 'NumeroIdentificacion', text)}
                style={styles.input}
                left={<TextInput.Icon icon="card-account-details" />}
                placeholder={persona.TipoIdentificacion === 'DUI' ? '000-000000-0000A' : 'Ingrese número'}
              />

              {renderDropdown('sexo', 'Sexo', dropdownOptions.Sexo, 'persona', 'Sexo')}
              {renderDropdown('estado-civil', 'Estado Civil', dropdownOptions.EstadoCivil, 'persona', 'EstadoCivil')}

              <TextInput
                label="Nacionalidad"
                mode="outlined"
                value={persona.Nacionalidad}
                onChangeText={text => handleInput('persona', 'Nacionalidad', text)}
                style={styles.input}
                left={<TextInput.Icon icon="earth" />}
              />

              <TouchableOpacity onPress={() => {
                setActiveDateField('FechaNacimiento');
                setShowDatePicker(true);
              }}>
                <View style={styles.datePickerContainer}>
                  <Text style={styles.datePickerLabel}>Fecha de Nacimiento</Text>
                  <View style={styles.datePickerValue}>
                    <Text style={styles.datePickerText}>
                      {persona.FechaNacimiento || 'Seleccionar fecha'}
                    </Text>
                    <MaterialIcons name="calendar-today" size={20} color="#666" />
                  </View>
                </View>
              </TouchableOpacity>

              {showDatePicker && Platform.OS !== 'web' && (
                <DateTimePicker
                  value={persona.FechaNacimiento ? new Date(persona.FechaNacimiento) : new Date()}
                  mode="date"
                  display="default"
                  maximumDate={new Date()}
                  onChange={handleDateChange}
                />
              )}

              {/* DatePicker para web */}
              {showDatePicker && Platform.OS === 'web' && (
                <View style={styles.webDatePicker}>
                  <input
                    type="date"
                    value={persona.FechaNacimiento || ''}
                    onChange={(e) => {
                      handleInput('persona', 'FechaNacimiento', e.target.value);
                      setShowDatePicker(false);
                    }}
                    max={new Date().toISOString().split('T')[0]}
                    style={styles.webDateInput}
                  />
                  <Button 
                    onPress={() => setShowDatePicker(false)}
                    style={styles.webDateClose}
                  >
                    Cerrar
                  </Button>
                </View>
              )}
            </View>
          )}
        </Card>

        {persona.EstadoCivil === 'Casado' && (
          <Card style={styles.card}>
            {renderSectionHeader("Datos del Cónyuge", "people", 1)}
            
            {activeSection === 1 && (
              <View style={styles.sectionContent}>
                <TextInput
                  label="Nombre Completo"
                  mode="outlined"
                  value={conyuge.NombreApellidos}
                  onChangeText={text => handleInput('conyuge', 'NombreApellidos', text)}
                  style={styles.input}
                  left={<TextInput.Icon icon="account" />}
                />

                <TextInput
                  label="Número de Cédula"
                  mode="outlined"
                  value={conyuge.NumeroCedula}
                  onChangeText={text => handleInput('conyuge', 'NumeroCedula', text)}
                  style={styles.input}
                  left={<TextInput.Icon icon="card-account-details" />}
                  keyboardType="numeric"
                />

                <TextInput
                  label="Número de Personas a Cargo"
                  mode="outlined"
                  value={conyuge.NumeroPersonasACargo}
                  onChangeText={text => handleInput('conyuge', 'NumeroPersonasACargo', text)}
                  style={styles.input}
                  left={<TextInput.Icon icon="account-group" />}
                  keyboardType="numeric"
                />
              </View>
            )}
          </Card>
        )}

        <Card style={styles.card}>
          {renderSectionHeader("Datos de la Solicitud", "file-document", 2)}
          
          {activeSection === 2 && (
            <View style={styles.sectionContent}>
              <TextInput
                label="Número de Solicitud"
                mode="outlined"
                value={solicitud.NumeroSolicitud}
                onChangeText={text => handleInput('solicitud', 'NumeroSolicitud', text)}
                style={styles.input}
                left={<TextInput.Icon icon="numeric" />}
              />

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <TextInput
                    label="Monto Solicitado"
                    mode="outlined"
                    value={solicitud.MontoSolicitado}
                    onChangeText={text => handleInput('solicitud', 'MontoSolicitado', text)}
                    style={styles.input}
                    left={<TextInput.Icon icon="currency-usd" />}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfInput}>
                  {renderDropdown('moneda', 'Moneda', dropdownOptions.TipoMoneda, 'solicitud', 'TipoMoneda')}
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <TextInput
                    label="Plazo (meses)"
                    mode="outlined"
                    value={solicitud.PlazoFinanciero}
                    onChangeText={text => handleInput('solicitud', 'PlazoFinanciero', text)}
                    style={styles.input}
                    left={<TextInput.Icon icon="calendar" />}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfInput}>
                  <TextInput
                    label="Tasa de Interés Anual (%)"
                    mode="outlined"
                    value={solicitud.TasaInteresAnual}
                    onChangeText={text => handleInput('solicitud', 'TasaInteresAnual', text)}
                    style={styles.input}
                    left={<TextInput.Icon icon="percent" />}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {renderDropdown('proposito', 'Propósito del Préstamo', dropdownOptions.PropositoPrestamo, 'solicitud', 'PropositoPrestamo')}
              {renderDropdown('estado-solicitud', 'Estado de Solicitud', dropdownOptions.Estado, 'solicitud', 'Estado')}
            </View>
          )}
        </Card>

        <Button 
          mode="contained" 
          onPress={handleGuardar} 
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
          icon="check-circle"
        >
          Guardar y Continuar
        </Button>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Paso 1 de 3 - Información Personal</Text>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
        </View>
      </ScrollView>

      {/* Modal para dropdowns (funciona en web y móvil) */}
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
                    <Text style={styles.modalTitle}>{dropdownData.label}</Text>
                    <TouchableOpacity onPress={() => setShowDropdown(false)}>
                      <MaterialIcons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={dropdownData.options}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity 
                        style={styles.modalItem}
                        onPress={() => handleSelectOption(item)}
                      >
                        <Text style={styles.modalItemText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    flexGrow: 1,
    backgroundColor: '#f5f7fa',
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 16,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#666',
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f4ff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  activeSectionHeader: {
    backgroundColor: '#2196F3',
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  activeSectionHeaderText: {
    color: '#fff',
  },
  sectionContent: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
  },
  dropdownContainer: {
    marginBottom: 8,
  },
  dropdownLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    marginLeft: 4,
  },
  dropdownValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  dropdownValue: {
    fontSize: 16,
    color: '#333',
  },
  placeholder: {
    color: '#999',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  datePickerContainer: {
    marginBottom: 16,
  },
  datePickerLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    marginLeft: 4,
  },
  datePickerValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  webDatePicker: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  webDateInput: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    fontSize: 16,
    marginBottom: 12,
  },
  webDateClose: {
    marginTop: 8,
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
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginHorizontal: 16,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    paddingVertical: 8,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    width: '33%',
    height: '100%',
    backgroundColor: '#2196F3',
  },
});