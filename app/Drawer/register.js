import { MaterialIcons } from '@expo/vector-icons'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import api from '../../Services/Api'

export default function UsersScreen() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState('')
  const [errorsFields, setErrorsFields] = useState({})
  
  // Estados para los grupos
  const [groups, setGroups] = useState([])
  const [selectedGroups, setSelectedGroups] = useState([])
  const [showGroupsModal, setShowGroupsModal] = useState(false)
  const [activeTab, setActiveTab] = useState('list') // 'list' o 'create'

  // Cargar usuarios y grupos al iniciar pantalla
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const [usersResponse, groupsResponse] = await Promise.all([
        api.get('/usuarios/'),
        api.get('/api/grupos/')
      ])
      setUsers(usersResponse.data)
      setGroups(groupsResponse.data)
    } catch (err) {
      Alert.alert('Error', 'No se pudieron cargar los datos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Validaciones de campos
  const validateForm = () => {
    const errors = {}

    if (!username.trim()) errors.username = 'El usuario es obligatorio.'
    if (!email.trim()) {
      errors.email = 'El email es obligatorio.'
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      errors.email = 'Email inválido.'
    }
    if (!password) {
      errors.password = 'La contraseña es obligatoria.'
    } else if (password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres.'
    }
    if (!password2) {
      errors.password2 = 'Repetir la contraseña es obligatorio.'
    } else if (password !== password2) {
      errors.password2 = 'Las contraseñas no coinciden.'
    }

    setErrorsFields(errors)
    return Object.keys(errors).length === 0
  }

  // Manejar selección de grupos
  const toggleGroup = (groupId) => {
    setSelectedGroups(prev => {
      if (prev.includes(groupId)) {
        return prev.filter(id => id !== groupId)
      } else {
        return [...prev, groupId]
      }
    })
  }

  // Registrar nuevo usuario
  const handleRegister = async () => {
    setError('')
    if (!validateForm()) return

    const userData = {
      username: username.trim(),
      email: email.trim(),
      password,
      password2,
    }

    // Solo agregar grupos si se seleccionaron
    if (selectedGroups.length > 0) {
      userData.groups = selectedGroups
    }

    try {
      const response = await api.post('/registro/', userData)
      Alert.alert('Éxito', 'Usuario registrado correctamente')
      setUsername('')
      setEmail('')
      setPassword('')
      setPassword2('')
      setSelectedGroups([])
      setErrorsFields({})
      setActiveTab('list')
      fetchUsers() // Actualizar lista con nuevo usuario
    } catch (err) {
      console.error('Error detallado:', err.response?.data)
      if (err.response?.data) {
        const errorData = err.response.data
        if (typeof errorData === 'object') {
          let errorMessage = ''
          for (const key in errorData) {
            if (Array.isArray(errorData[key])) {
              errorMessage += `${key}: ${errorData[key].join(', ')}\n`
            } else {
              errorMessage += `${key}: ${errorData[key]}\n`
            }
          }
          setError(errorMessage)
        } else {
          setError(JSON.stringify(errorData))
        }
      } else {
        setError('Error al registrar el usuario')
      }
    }
  }

  // Función para mostrar grupos de un usuario
  const renderUserGroups = (user) => {
    if (!user.groups || user.groups.length === 0) {
      return <Text style={styles.noGroupsText}>Sin grupos asignados</Text>
    }
    
    return (
      <View style={styles.groupsContainer}>
        {user.groups.map(group => (
          <View key={group.id} style={styles.groupBadge}>
            <MaterialIcons name="groups" size={12} color="#1976d2" />
            <Text style={styles.groupBadgeText}>{group.name}</Text>
          </View>
        ))}
      </View>
    )
  }

  const clearForm = () => {
    setUsername('')
    setEmail('')
    setPassword('')
    setPassword2('')
    setSelectedGroups([])
    setErrorsFields({})
    setError('')
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestión de Usuarios</Text>
        <Text style={styles.headerSubtitle}>Administra usuarios y permisos</Text>
      </View>

      {/* Tabs Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'list' && styles.activeTab]}
          onPress={() => setActiveTab('list')}
        >
          <MaterialIcons 
            name="list" 
            size={24} 
            color={activeTab === 'list' ? '#fff' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'list' && styles.activeTabText]}>
            Lista
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'create' && styles.activeTab]}
          onPress={() => setActiveTab('create')}
        >
          <MaterialIcons 
            name="person-add" 
            size={24} 
            color={activeTab === 'create' ? '#fff' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'create' && styles.activeTabText]}>
            Crear
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        {activeTab === 'list' ? (
          // Lista de usuarios
          <View style={styles.listContainer}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Usuarios Registrados</Text>
              <Text style={styles.listCount}>{users.length} usuarios</Text>
            </View>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={styles.loadingText}>Cargando usuarios...</Text>
              </View>
            ) : (
              <FlatList
                data={users}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => (
                  <View style={[
                    styles.userCard,
                    index === 0 && styles.firstCard
                  ]}>
                    <View style={styles.userAvatar}>
                      <MaterialIcons name="person" size={28} color="#6366F1" />
                    </View>
                    <View style={styles.userInfo}>
                      <View style={styles.userHeader}>
                        <Text style={styles.userName}>{item.username}</Text>
                        <View style={styles.userStatus}>
                          <View style={styles.statusDot} />
                          <Text style={styles.statusText}>Activo</Text>
                        </View>
                      </View>
                      <View style={styles.userDetails}>
                        <MaterialIcons name="email" size={14} color="#666" />
                        <Text style={styles.userEmail}>{item.email}</Text>
                      </View>
                      {renderUserGroups(item)}
                    </View>
                  </View>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <MaterialIcons name="people-outline" size={64} color="#cbd5e1" />
                    <Text style={styles.emptyText}>No hay usuarios registrados</Text>
                  </View>
                }
              />
            )}
          </View>
        ) : (
          // Formulario de creación
          <ScrollView 
            style={styles.formContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Crear Nuevo Usuario</Text>
              <Text style={styles.formSubtitle}>Complete todos los campos requeridos</Text>
            </View>

            {error !== '' && (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={24} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Campo Usuario */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabelContainer}>
                <MaterialIcons name="person-outline" size={18} color="#6366F1" />
                <Text style={styles.inputLabel}>Usuario</Text>
              </View>
              <TextInput
                placeholder="Ingrese nombre de usuario"
                value={username}
                onChangeText={setUsername}
                style={[styles.input, errorsFields.username && styles.inputError]}
                autoCapitalize="none"
                placeholderTextColor="#94a3b8"
              />
              {errorsFields.username && (
                <View style={styles.errorMessage}>
                  <MaterialIcons name="warning" size={14} color="#ef4444" />
                  <Text style={styles.errorField}>{errorsFields.username}</Text>
                </View>
              )}
            </View>

            {/* Campo Email */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabelContainer}>
                <MaterialIcons name="email" size={18} color="#6366F1" />
                <Text style={styles.inputLabel}>Email</Text>
              </View>
              <TextInput
                placeholder="ejemplo@correo.com"
                value={email}
                onChangeText={setEmail}
                style={[styles.input, errorsFields.email && styles.inputError]}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#94a3b8"
              />
              {errorsFields.email && (
                <View style={styles.errorMessage}>
                  <MaterialIcons name="warning" size={14} color="#ef4444" />
                  <Text style={styles.errorField}>{errorsFields.email}</Text>
                </View>
              )}
            </View>

            {/* Campo Contraseña */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabelContainer}>
                <MaterialIcons name="lock-outline" size={18} color="#6366F1" />
                <Text style={styles.inputLabel}>Contraseña</Text>
              </View>
              <TextInput
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChangeText={setPassword}
                style={[styles.input, errorsFields.password && styles.inputError]}
                secureTextEntry
                placeholderTextColor="#94a3b8"
              />
              {errorsFields.password && (
                <View style={styles.errorMessage}>
                  <MaterialIcons name="warning" size={14} color="#ef4444" />
                  <Text style={styles.errorField}>{errorsFields.password}</Text>
                </View>
              )}
            </View>

            {/* Campo Repetir Contraseña */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabelContainer}>
                <MaterialIcons name="lock" size={18} color="#6366F1" />
                <Text style={styles.inputLabel}>Confirmar Contraseña</Text>
              </View>
              <TextInput
                placeholder="Repita la contraseña"
                value={password2}
                onChangeText={setPassword2}
                style={[styles.input, errorsFields.password2 && styles.inputError]}
                secureTextEntry
                placeholderTextColor="#94a3b8"
              />
              {errorsFields.password2 && (
                <View style={styles.errorMessage}>
                  <MaterialIcons name="warning" size={14} color="#ef4444" />
                  <Text style={styles.errorField}>{errorsFields.password2}</Text>
                </View>
              )}
            </View>

            {/* Selector de Grupos */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabelContainer}>
                <MaterialIcons name="groups" size={18} color="#6366F1" />
                <Text style={styles.inputLabel}>Grupos (Opcional)</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setShowGroupsModal(true)}
                style={styles.groupSelector}
              >
                <Text style={styles.groupSelectorPlaceholder}>
                  {selectedGroups.length > 0 
                    ? `${selectedGroups.length} grupo(s) seleccionado(s)`
                    : 'Seleccionar grupos'}
                </Text>
                <MaterialIcons name="expand-more" size={20} color="#64748b" />
              </TouchableOpacity>

              {selectedGroups.length > 0 && (
                <View style={styles.selectedGroupsContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {selectedGroups.map(groupId => {
                      const group = groups.find(g => g.id === groupId)
                      return group ? (
                        <View key={groupId} style={styles.selectedGroupBadge}>
                          <Text style={styles.selectedGroupText}>{group.name}</Text>
                          <TouchableOpacity 
                            onPress={() => toggleGroup(groupId)}
                            style={styles.removeGroupButton}
                          >
                            <MaterialIcons name="close" size={14} color="white" />
                          </TouchableOpacity>
                        </View>
                      ) : null
                    })}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Botones de acción */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                onPress={clearForm}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Limpiar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleRegister}
                style={styles.registerButton}
              >
                <MaterialIcons name="person-add" size={20} color="white" />
                <Text style={styles.registerButtonText}>Crear Usuario</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      {/* Modal para seleccionar grupos */}
      <Modal
        visible={showGroupsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGroupsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Grupos</Text>
              <TouchableOpacity 
                onPress={() => setShowGroupsModal(false)}
                style={styles.modalCloseIcon}
              >
                <MaterialIcons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={groups}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalGroupItem}
                  onPress={() => toggleGroup(item.id)}
                >
                  <View style={[
                    styles.modalCheckbox,
                    selectedGroups.includes(item.id) && styles.modalCheckboxSelected
                  ]}>
                    {selectedGroups.includes(item.id) && (
                      <MaterialIcons name="check" size={16} color="white" />
                    )}
                  </View>
                  <View style={styles.modalGroupInfo}>
                    <Text style={styles.modalGroupName}>{item.name}</Text>
                    <Text style={styles.modalGroupDescription}>
                      Permisos del grupo {item.name.toLowerCase()}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              style={styles.modalList}
            />
            
            <TouchableOpacity
              style={styles.modalConfirmButton}
              onPress={() => setShowGroupsModal(false)}
            >
              <Text style={styles.modalConfirmButtonText}>Confirmar Selección</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#6366F1',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
    marginTop: 16,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  listCount: {
    fontSize: 14,
    color: '#64748b',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  userCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  firstCard: {
    marginTop: 8,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  userStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  statusText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  userDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
  },
  groupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  groupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  groupBadgeText: {
    fontSize: 12,
    color: '#4f46e5',
    fontWeight: '600',
  },
  noGroupsText: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 12,
    fontWeight: '500',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formHeader: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#991b1b',
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    color: '#1e293b',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  errorField: {
    fontSize: 13,
    color: '#dc2626',
  },
  groupSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  groupSelectorPlaceholder: {
    fontSize: 16,
    color: '#64748b',
  },
  selectedGroupsContainer: {
    marginTop: 12,
  },
  selectedGroupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedGroupText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
    marginRight: 8,
  },
  removeGroupButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 30,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  registerButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#6366F1',
  },
  registerButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  modalCloseIcon: {
    padding: 4,
  },
  modalList: {
    maxHeight: 400,
  },
  modalGroupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 16,
  },
  modalCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCheckboxSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  modalGroupInfo: {
    flex: 1,
  },
  modalGroupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  modalGroupDescription: {
    fontSize: 13,
    color: '#64748b',
  },
  modalConfirmButton: {
    backgroundColor: '#6366F1',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
})