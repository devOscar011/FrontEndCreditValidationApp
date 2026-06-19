import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import {
  Searchbar,
  Card,
  ActivityIndicator,
  Text,
  Menu,
  IconButton,
  Avatar,
  TextInput,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import api from '../../Services/Api';

export default function PersonasScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isNarrow = width < 480;
  const [personas, setPersonas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [pageSizeInput, setPageSizeInput] = useState('12');

  const [menuVisible, setMenuVisible] = useState(false);
  const [pageSizeMenuVisible, setPageSizeMenuVisible] = useState(false);
  const [estadoFilter, setEstadoFilter] = useState('Todos'); // Todos | Aprobada | Rechazada | En proceso

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const res = await api.get('/personas/');
        setPersonas(res.data);
        setFiltered(res.data);
      } catch (e) {
        setError('Error al cargar personas');
      } finally {
        setLoading(false);
      }
    };
    fetchPersonas();
  }, []);

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();

    let data = personas.filter(p =>
      `${p.Nombres} ${p.Apellidos}`.toLowerCase().includes(q)
    );

    // Filtro por estado si no es "Todos"
    if (estadoFilter !== 'Todos') {
      data = data.filter(p => {
        const lastSol = p.solicitudes?.slice(-1)[0];
        if (!lastSol?.Estado) return false;
        return lastSol.Estado.toLowerCase() === estadoFilter.toLowerCase();
      });
    }

    setFiltered(data);
    setPage(1);
  }, [searchQuery, personas, estadoFilter]);

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'Aprobado':
        return { icon: 'check-circle', color: '#4caf50' };
      case 'Rechazada':
        return { icon: 'close-circle', color: '#f44336' };
      case 'En Proceso':
        return { icon: 'progress-clock', color: '#ff9800' };
      case 'Pendiente':
        return { icon: 'clock-outline', color: '#2196f3' };
      default:
        return { icon: 'help-circle-outline', color: '#757575' };
    }
  };

  const renderItem = ({ item: p }) => {
    const lastSol = p.solicitudes?.slice(-1)[0] || {};
    const estado = lastSol.Estado || '';

    const { icon, color } = getEstadoIcon(estado);

    return (
      <Card
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: '/Drawer/AmortizacionCalculada',
            params: { personaID: p.id },
          })
        }
      >
        <Card.Title
          title={`${p.Nombres} ${p.Apellidos}`}
          subtitle={`ID: ${p.NumeroIdentificacion}`}
          titleStyle={{ fontWeight: 'bold', fontSize: 18 }}
          left={() => <Avatar.Icon size={42} icon="account" style={{ backgroundColor: '#e0f7fa' }} />}
        />
        <Card.Content>
          {lastSol.NumeroSolicitud ? (
            <>
              <Text style={styles.solInfo}>Nº Solicitud: {lastSol.NumeroSolicitud}</Text>
              <View style={styles.estadoContainer}>
                <Avatar.Icon
                  icon={icon}
                  size={28}
                  style={{ backgroundColor: 'transparent', marginRight: 8 }}
                  color={color}
                />
                <Text style={[styles.estado, { color }]}>
                  {estado || 'Estado desconocido'}
                </Text>
              </View>
            </>
          ) : (
            <Text style={styles.noSolicitud}>No hay solicitudes registradas.</Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  if (loading) return <ActivityIndicator style={styles.loader} size="large" />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pagedData = filtered.slice(startIndex, startIndex + pageSize);
  const totalCount = filtered.length;
  const from = totalCount === 0 ? 0 : startIndex + 1;
  const to = Math.min(startIndex + pageSize, totalCount);

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, isNarrow && styles.topBarMobile]}>
        <Searchbar
          placeholder="Buscar persona..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[styles.search, isNarrow && styles.searchMobile]}
        />

        <View style={[styles.controlsRow, isNarrow && styles.controlsRowMobile]}>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="filter-variant"
              size={28}
              onPress={() => setMenuVisible(true)}
              style={styles.filterIcon}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              setEstadoFilter('Todos');
              setMenuVisible(false);
            }}
            title="Todos los estados"
          />
          <Menu.Item
            onPress={() => {
              setEstadoFilter('Aprobado');
              setMenuVisible(false);
            }}
            title="Aprobadas"
          />
          <Menu.Item
            onPress={() => {
              setEstadoFilter('Rechazada');
              setMenuVisible(false);
            }}
            title="Rechazadas"
          />
          <Menu.Item
            onPress={() => {
              setEstadoFilter('En Proceso');
              setMenuVisible(false);
            }}
            title="En proceso"
          />
          <Menu.Item
            onPress={() => {
              setEstadoFilter('Pendiente');
              setMenuVisible(false);
            }}
            title="Pendientes"
          />
        </Menu>

        <View style={styles.pageSizeWrapper}>
          <Text style={styles.pageSizeLabel}>{pageSize}/pag</Text>
          <Menu
            visible={pageSizeMenuVisible}
            onDismiss={() => setPageSizeMenuVisible(false)}
            anchor={
              <IconButton
                icon="chevron-down"
                size={24}
                onPress={() => setPageSizeMenuVisible(true)}
                style={styles.pageSizeIcon}
              />
            }
          >
            {[12, 24, 48].map((size) => (
              <Menu.Item
                key={size}
                onPress={() => {
                  setPageSize(size);
                  setPage(1);
                  setPageSizeMenuVisible(false);
                }}
                title={`${size} por pagina`}
              />
            ))}
          </Menu>
        </View>

        <View style={styles.pageSizeInputWrapper}>
          <TextInput
            mode="outlined"
            dense
            keyboardType="number-pad"
            value={pageSizeInput}
            onChangeText={(text) => setPageSizeInput(text.replace(/[^0-9]/g, ''))}
            onBlur={() => {
              const num = Number(pageSizeInput);
              const next = Number.isFinite(num) && num > 0 ? Math.min(num, 200) : 12;
              setPageSize(next);
              setPageSizeInput(String(next));
              setPage(1);
            }}
            style={styles.pageSizeInput}
            outlineStyle={styles.pageSizeInputOutline}
            placeholder="Reg."
          />
        </View>
        </View>
      </View>

      <FlatList
        data={pagedData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <Text style={styles.noSolicitud}>No se encontraron resultados.</Text>
        )}
        ListFooterComponent={() => (
          <View style={styles.pagination}>
            <IconButton
              icon="chevron-double-left"
              size={26}
              onPress={() => setPage(1)}
              disabled={safePage <= 1}
              style={[styles.pageButton, safePage <= 1 && styles.pageButtonDisabled]}
            />
            <IconButton
              icon="chevron-left"
              size={26}
              onPress={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              style={[styles.pageButton, safePage <= 1 && styles.pageButtonDisabled]}
            />
            <View style={styles.pageInfoBlock}>
              <Text style={styles.pageInfo}>
                pagina {safePage} de {totalPages}
              </Text>
              <Text style={styles.rangeInfo}>
                {from}-{to} de {totalCount}
              </Text>
            </View>
            <IconButton
              icon="chevron-right"
              size={26}
              onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              style={[styles.pageButton, safePage >= totalPages && styles.pageButtonDisabled]}
            />
            <IconButton
              icon="chevron-double-right"
              size={26}
              onPress={() => setPage(totalPages)}
              disabled={safePage >= totalPages}
              style={[styles.pageButton, safePage >= totalPages && styles.pageButtonDisabled]}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f4f6f8' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  topBarMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  search: {
    flex: 1,
    marginRight: 8,
    borderRadius: 12,
  },
  searchMobile: {
    marginRight: 0,
    marginBottom: 8,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    gap: 6,
  },
  controlsRowMobile: {
    flexWrap: 'wrap',
  },
  filterIcon: {
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  pageSizeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  pageSizeLabel: {
    fontSize: 12,
    color: '#555',
    fontWeight: '600',
    marginRight: -2,
  },
  pageSizeIcon: {
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  pageSizeInputWrapper: {
    marginLeft: 6,
    width: 70,
  },
  pageSizeInput: {
    height: 36,
    backgroundColor: '#fff',
  },
  pageSizeInputOutline: {
    borderRadius: 10,
  },
  card: {
    borderRadius: 12,
    elevation: 3,
    backgroundColor: '#fff',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  solInfo: {
    marginTop: 4,
    fontSize: 14,
    color: '#444',
  },
  estadoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  estado: {
    fontSize: 15,
    fontWeight: '600',
  },
  noSolicitud: {
    fontStyle: 'italic',
    color: '#777',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  loader: { marginTop: 50 },
  error: { color: 'red', textAlign: 'center', marginTop: 20 },
  pagination: {
    marginTop: 4,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  pageInfoBlock: {
    alignItems: 'center',
  },
  pageInfo: {
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
  },
  rangeInfo: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  pageButton: {
    backgroundColor: '#e8eaed',
    borderRadius: 10,
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
});

