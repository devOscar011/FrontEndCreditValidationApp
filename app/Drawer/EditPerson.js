import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import {
  ActivityIndicator,
  Button,
  Card,
  Portal,
  Text,
  TextInput,
} from 'react-native-paper';
import api from '../../Services/Api';
import { toast } from '../../lib/toast';

const opcionesIdentificacion = ['DUI', 'Pasaporte', 'NIT', 'Otro'];
const opcionesEstadoCivil = ['Soltero', 'Casado', 'Divorciado', 'Viudo'];
const opcionesSexo = ['Masculino', 'Femenino', 'Otro'];
const opcionesMoneda = ['Córdoba', 'Dólar'];
const opcionesEstado = ['Aprobado', 'Rechazada', 'En proceso', 'Pendiente'];
const opcionesProposito = [
  'Capital inversión',
  'Mejoramiento Vivienda',
  'Compra Vehículo',
  'Pago Servicios de Salud',
  'Pago de Deudas',
  'Otro',
];

export default function EditPerson() {
  const { personaID } = useLocalSearchParams();
  const router = useRouter();

  const [persona, setPersona] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('personal'); // 'personal', 'solicitud'
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownData, setDropdownData] = useState({
    key: '',
    label: '',
    options: [],
    value: '',
    onSelect: null,
  });

  // Campos Persona
  const [Nombres, setNombres] = useState('');
  const [Apellidos, setApellidos] = useState('');
  const [TipoIdentificacion, setTipoIdentificacion] = useState('');
  const [NumeroIdentificacion, setNumeroIdentificacion] = useState('');
  const [Nacionalidad, setNacionalidad] = useState('');
  const [FechaNacimiento, setFechaNacimiento] = useState('');
  const [EstadoCivil, setEstadoCivil] = useState('');
  const [Sexo, setSexo] = useState('');

  // Campos Solicitud
  const [editingSolicitudId, setEditingSolicitudId] = useState(null);
  const [NumeroSolicitud, setNumeroSolicitud] = useState('');
  const [TipoMoneda, setTipoMoneda] = useState('');
  const [MontoSolicitado, setMontoSolicitado] = useState('');
  const [PlazoFinanciero, setPlazoFinanciero] = useState('');
  const [PropositoPrestamo, setPropositoPrestamo] = useState('');
  const [TasaInteresAnual, setTasaInteresAnual] = useState('');
  const [Estado, setEstado] = useState('');

  useEffect(() => {
    if (!personaID) return;

    const fetchPersona = async () => {
      try {
        const res = await api.get(`/personas/${personaID}/`);
        const p = res.data;
        setPersona(p);

        // Set persona fields
        setNombres(p.Nombres || '');
        setApellidos(p.Apellidos || '');
        setTipoIdentificacion(p.TipoIdentificacion || '');
        setNumeroIdentificacion(p.NumeroIdentificacion || '');
        setNacionalidad(p.Nacionalidad || '');
        setFechaNacimiento(p.FechaNacimiento || '');
        setEstadoCivil(p.EstadoCivil || '');
        setSexo(p.Sexo || '');

        // Cargar última solicitud si existe
        if (p.solicitudes && p.solicitudes.length > 0) {
          const lastSol = p.solicitudes[p.solicitudes.length - 1];
          setEditingSolicitudId(lastSol.IdSolicitud);
          setNumeroSolicitud(lastSol.NumeroSolicitud || '');
          setTipoMoneda(lastSol.TipoMoneda || '');
          setMontoSolicitado(String(lastSol.MontoSolicitado || ''));
          setPlazoFinanciero(String(lastSol.PlazoFinanciero || ''));
          setPropositoPrestamo(lastSol.PropositoPrestamo || '');
          setTasaInteresAnual(String(lastSol.TasaInteresAnual || ''));
          setEstado(lastSol.Estado || '');
        } else {
          setEditingSolicitudId(null);
          setNumeroSolicitud('');
          setTipoMoneda('');
          setMontoSolicitado('');
          setPlazoFinanciero('');
          setPropositoPrestamo('');
          setTasaInteresAnual('');
          setEstado('');
        }

      } catch (e) {
        console.error('Error fetching persona:', e);
        setError('Error al cargar la información');
      } finally {
        setLoading(false);
      }
    };

    fetchPersona();
  }, [personaID]);

  const openDropdown = (key, label, options, currentValue, onSelect) => {
    setDropdownData({
      key,
      label,
      options,
      value: currentValue,
      onSelect,
    });
    setShowDropdown(true);
  };

  const handleSelectOption = (option) => {
    if (dropdownData.onSelect) {
      dropdownData.onSelect(option);
    }
    setShowDropdown(false);
  };

  const formatCurrency = (value) => {
    if (!value) return '';
    const number = parseFloat(value.replace(/[^0-9.-]+/g, ''));
    return isNaN(number) ? '' : new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  };

  const handleCurrencyChange = (value, setter) => {
    const cleanValue = value.replace(/[^0-9.-]+/g, '');
    setter(cleanValue);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      // Validar datos requeridos
      if (!Nombres || !Apellidos || !TipoIdentificacion || !NumeroIdentificacion) {
        throw new Error('Por favor complete todos los campos requeridos');
      }

      // Actualizar persona
      await api.put(`/personas/${personaID}/`, {
        Nombres,
        Apellidos,
        TipoIdentificacion,
        NumeroIdentificacion,
        Nacionalidad,
        FechaNacimiento,
        EstadoCivil,
        Sexo,
      });

      // Payload para solicitud (solo si hay datos)
      if (NumeroSolicitud || MontoSolicitado || TipoMoneda) {
        const solicitudPayload = {
          NumeroSolicitud,
          TipoMoneda,
          MontoSolicitado: parseFloat(MontoSolicitado) || 0,
          PlazoFinanciero: parseInt(PlazoFinanciero, 10) || 0,
          PropositoPrestamo,
          TasaInteresAnual: parseFloat(TasaInteresAnual) || 0,
          Estado,
          IdPersona: personaID,
        };

        if (editingSolicitudId) {
          // Actualizar solicitud existente
          await api.put(`/solicitudes/${editingSolicitudId}/`, solicitudPayload);
        } else {
          // Crear nueva solicitud
          await api.post('/solicitudes/', solicitudPayload);
        }
      }

      toast.show({
        type: 'success',
        text1: 'Actualizado',
        text2: 'La informaci�n fue actualizada correctamente',
      });
      setTimeout(() => router.back(), 800);

    } catch (e) {
      console.error('Save error:', e);
      setError(e.response?.data?.detail || e.message || 'Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const renderDropdownField = (label, value, options, key, onSelect, iconName) => (
    <TouchableOpacity
      onPress={() => openDropdown(key, label, options, value, onSelect)}
      style={styles.dropdownContainer}
    >
      <View style={styles.dropdownLabelContainer}>
        {iconName && (
          <MaterialIcons name={iconName} size={20} color="#6366F1" style={styles.dropdownIcon} />
        )}
        <Text style={styles.dropdownLabel}>{label}</Text>
      </View>
      <View style={styles.dropdownValue}>
        <Text style={value ? styles.dropdownText : styles.dropdownPlaceholder}>
          {value || `Seleccionar ${label.toLowerCase()}`}
        </Text>
        <MaterialIcons name="expand-more" size={24} color="#666" />
      </View>
    </TouchableOpacity>
  );

  const renderInputField = (label, value, onChange, options = {}) => {
    const {
      keyboardType = 'default',
      iconName,
      multiline = false,
      isCurrency = false,
    } = options;

    return (
      <View style={styles.inputContainer}>
        <View style={styles.inputLabelContainer}>
          {iconName && (
            <MaterialIcons name={iconName} size={20} color="#6366F1" style={styles.inputIcon} />
          )}
          <Text style={styles.inputLabel}>{label}</Text>
        </View>
        <TextInput
          value={isCurrency ? formatCurrency(value) : value}
          onChangeText={isCurrency ? (text) => handleCurrencyChange(text, onChange) : onChange}
          style={[styles.input, multiline && styles.multilineInput]}
          keyboardType={keyboardType}
          mode="outlined"
          outlineColor="#e2e8f0"
          activeOutlineColor="#6366F1"
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          theme={{
            colors: {
              placeholder: '#94a3b8',
              text: '#1e293b',
            },
          }}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Cargando información...</Text>
      </View>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <MaterialIcons name="arrow-back" size={24} color="#6366F1" />
              </TouchableOpacity>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Editar Cliente</Text>
                <Text style={styles.headerSubtitle}>ID: {personaID}</Text>
              </View>
            </View>

            {/* Tabs de navegación */}
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'personal' && styles.activeTab]}
                onPress={() => setActiveTab('personal')}
              >
                <MaterialIcons 
                  name="person" 
                  size={20} 
                  color={activeTab === 'personal' ? '#fff' : '#6366F1'} 
                />
                <Text style={[styles.tabText, activeTab === 'personal' && styles.activeTabText]}>
                  Datos Personales
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'solicitud' && styles.activeTab]}
                onPress={() => setActiveTab('solicitud')}
              >
                <MaterialIcons 
                  name="description" 
                  size={20} 
                  color={activeTab === 'solicitud' ? '#fff' : '#6366F1'} 
                />
                <Text style={[styles.tabText, activeTab === 'solicitud' && styles.activeTabText]}>
                  Solicitud
                </Text>
              </TouchableOpacity>
            </View>

            {error && (
              <Card style={styles.errorCard}>
                <Card.Content style={styles.errorContent}>
                  <MaterialIcons name="error-outline" size={24} color="#ef4444" />
                  <Text style={styles.errorText}>{error}</Text>
                </Card.Content>
              </Card>
            )}

            {/* Contenido de la pestaña activa */}
            <Card style={styles.contentCard}>
              <Card.Content>
                {activeTab === 'personal' ? (
                  <>
                    <View style={styles.sectionHeader}>
                      <MaterialIcons name="person-outline" size={24} color="#6366F1" />
                      <Text style={styles.sectionTitle}>Información Personal</Text>
                    </View>

                    <View style={styles.row}>
                      <View style={styles.halfInput}>
                        {renderInputField(
                          'Nombres',
                          Nombres,
                          setNombres,
                          { iconName: 'badge', multiline: false }
                        )}
                      </View>
                      <View style={styles.halfInput}>
                        {renderInputField(
                          'Apellidos',
                          Apellidos,
                          setApellidos,
                          { iconName: 'badge', multiline: false }
                        )}
                      </View>
                    </View>

                    {renderDropdownField(
                      'Tipo de Identificación',
                      TipoIdentificacion,
                      opcionesIdentificacion,
                      'tipoIdentificacion',
                      setTipoIdentificacion,
                      'id-card'
                    )}

                    {renderInputField(
                      'Número de Identificación',
                      NumeroIdentificacion,
                      setNumeroIdentificacion,
                      { iconName: 'numbers', keyboardType: 'numeric' }
                    )}

                    {renderInputField(
                      'Nacionalidad',
                      Nacionalidad,
                      setNacionalidad,
                      { iconName: 'flag' }
                    )}

                    {renderInputField(
                      'Fecha de Nacimiento (YYYY-MM-DD)',
                      FechaNacimiento,
                      setFechaNacimiento,
                      { iconName: 'event' }
                    )}

                    <View style={styles.row}>
                      <View style={styles.halfInput}>
                        {renderDropdownField(
                          'Estado Civil',
                          EstadoCivil,
                          opcionesEstadoCivil,
                          'estadoCivil',
                          setEstadoCivil,
                          'people'
                        )}
                      </View>
                      <View style={styles.halfInput}>
                        {renderDropdownField(
                          'Sexo',
                          Sexo,
                          opcionesSexo,
                          'sexo',
                          setSexo,
                          'person'
                        )}
                      </View>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.sectionHeader}>
                      <MaterialIcons name="request-quote" size={24} color="#6366F1" />
                      <Text style={styles.sectionTitle}>Información de la Solicitud</Text>
                    </View>

                    {renderInputField(
                      'Número de Solicitud',
                      NumeroSolicitud,
                      setNumeroSolicitud,
                      { iconName: 'numbers', keyboardType: 'numeric' }
                    )}

                    <View style={styles.row}>
                      <View style={styles.halfInput}>
                        {renderInputField(
                          'Monto Solicitado',
                          MontoSolicitado,
                          setMontoSolicitado,
                          { iconName: 'attach-money', keyboardType: 'numeric', isCurrency: true }
                        )}
                      </View>
                      <View style={styles.halfInput}>
                        {renderDropdownField(
                          'Moneda',
                          TipoMoneda,
                          opcionesMoneda,
                          'moneda',
                          setTipoMoneda,
                          'monetization-on'
                        )}
                      </View>
                    </View>

                    <View style={styles.row}>
                      <View style={styles.halfInput}>
                        {renderInputField(
                          'Plazo (meses)',
                          PlazoFinanciero,
                          setPlazoFinanciero,
                          { iconName: 'calendar-today', keyboardType: 'numeric' }
                        )}
                      </View>
                      <View style={styles.halfInput}>
                        {renderInputField(
                          'Tasa de Interés (%)',
                          TasaInteresAnual,
                          setTasaInteresAnual,
                          { iconName: 'percent', keyboardType: 'numeric' }
                        )}
                      </View>
                    </View>

                    {renderDropdownField(
                      'Propósito del Préstamo',
                      PropositoPrestamo,
                      opcionesProposito,
                      'proposito',
                      setPropositoPrestamo,
                      'category'
                    )}

                    {renderDropdownField(
                      'Estado',
                      Estado,
                      opcionesEstado,
                      'estado',
                      setEstado,
                      'verified'
                    )}
                  </>
                )}
              </Card.Content>
            </Card>

            {/* Botón Guardar */}
            <Button
              mode="contained"
              onPress={handleSave}
              loading={saving}
              disabled={saving}
              style={styles.saveButton}
              contentStyle={styles.saveButtonContent}
              icon="save"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>

            {editingSolicitudId && (
              <Text style={styles.infoText}>
                Editando solicitud ID: {editingSolicitudId}
              </Text>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Modal para dropdowns */}
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
                        style={[
                          styles.modalItem,
                          dropdownData.value === item && styles.selectedModalItem
                        ]}
                        onPress={() => handleSelectOption(item)}
                      >
                        <Text style={[
                          styles.modalItemText,
                          dropdownData.value === item && styles.selectedModalItemText
                        ]}>
                          {item}
                        </Text>
                        {dropdownData.value === item && (
                          <MaterialIcons name="check" size={20} color="#6366F1" />
                        )}
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
    paddingBottom: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
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
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 24,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#6366F1',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
  activeTabText: {
    color: '#fff',
  },
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginLeft: 12,
  },
  dropdownContainer: {
    marginBottom: 20,
  },
  dropdownLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dropdownIcon: {
    marginRight: 8,
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  dropdownValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 16,
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
    marginBottom: 20,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    backgroundColor: '#fff',
  },
  multilineInput: {
    minHeight: 80,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  errorCard: {
    backgroundColor: '#fee',
    borderColor: '#fecaca',
    borderWidth: 1,
    marginBottom: 16,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 6,
  },
  saveButtonContent: {
    paddingVertical: 8,
  },
  infoText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 12,
    color: '#94a3b8',
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
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  selectedModalItem: {
    backgroundColor: '#f0f9ff',
  },
  modalItemText: {
    fontSize: 16,
    color: '#334155',
  },
  selectedModalItemText: {
    color: '#6366F1',
    fontWeight: '600',
  },
  modalSeparator: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginHorizontal: 16,
  },
});


