import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {
  Card,
  Chip,
  DataTable,
  Divider,
  Text
} from 'react-native-paper';
import api from '../../Services/Api';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isTablet = width >= 768;

export default function AmortizacionCalculada() {
  const { personaID } = useLocalSearchParams();
  const [data, setData] = useState(null);
  const [resumen, setResumen] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);

  const loadData = async () => {
    try {
      const [tabRes, capPago, flujoCaja, endeud, ltvRes] = await Promise.all([
        api.get(`/amortizacion/calculada/persona/${personaID}/`),
        api.get(`/evaluar-capacidad-pago/persona/${personaID}/`),
        api.get(`/analizar-flujo-caja/persona/${personaID}/`),
        api.get(`/cacular-indice-endeudamineto/persona/${personaID}/`),
        api.get(`/api/ltv/${personaID}/`)
      ]);

      setData(tabRes.data);
      setResumen({
        capacidad: capPago.data,
        flujoCaja: flujoCaja.data,
        endeudamiento: endeud.data,
        ltv: ltvRes.data,
      });
    } catch (err) {
      console.error(err.response?.data || err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (personaID) loadData();
  }, [personaID]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const generatePDF = async () => {
  try {
    // profesional
    const response = await api.get(`/reporte-credito-pdf/${personaID}/`, {
      responseType: 'blob'
    });

    if (isWeb) {
      // Para web
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Reporte_Credito_${personaID}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      // Para móvil - versión simple
      const responseSimple = await api.get(`/reporte-credito-simple/${personaID}/`, {
        responseType: 'blob'
      });
      //   expo-sharing para abrir el PDF
      alert('El PDF se ha generado correctamente. Consulte la versión web para un formato más completo.');
    }
  } catch (err) {
    console.error('Error generando PDF:', err);
    alert('Error al generar el PDF. Por favor, intente nuevamente.');
  }
};

  const fmtCurrency = (num) =>
    num !== null && num !== undefined ? `$${Number(num).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A';

  const fmtPercent = (num) =>
    num !== null && num !== undefined ? `${(Number(num) * 100).toFixed(2)}%` : 'N/A';

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'aprobado':
      case 'favorable':
      case 'bueno':
        return '#10B981';
      case 'pendiente':
      case 'moderado':
        return '#F59E0B';
      case 'rechazado':
      case 'alto':
      case 'desfavorable':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const toggleCard = (cardId) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Cargando datos de análisis...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={64} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header con título y acciones */}
      <Animatable.View animation="fadeInDown" duration={600}>
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Análisis de Crédito</Text>
              <Text style={styles.headerSubtitle}>Resumen completo de indicadores financieros</Text>
            </View>
            <TouchableOpacity style={styles.downloadButton} onPress={generatePDF}>
              <MaterialIcons name="picture-as-pdf" size={24} color="#fff" />
              <Text style={styles.downloadButtonText}>Descargar PDF</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animatable.View>

      {/* Indicadores Principales */}
      <View style={styles.indicatorsGrid}>
        <Animatable.View 
          animation="fadeInUp" 
          duration={600} 
          delay={100}
          style={[styles.indicatorCard, { backgroundColor: '#F0F9FF' }]}
        >
          <View style={styles.indicatorHeader}>
            <View style={[styles.iconContainer, { backgroundColor: '#3B82F6' }]}>
              <FontAwesome5 name="money-check-alt" size={20} color="#fff" />
            </View>
            <Text style={styles.indicatorTitle}>Capacidad de Pago</Text>
          </View>
          <View style={styles.indicatorContent}>
            <IndicatorItem 
              label="DSCR" 
              value={resumen.capacidad?.DSCR?.toFixed(2) || 'N/A'}
              color={getStatusColor(resumen.capacidad?.EstadoCredito)}
            />
            <IndicatorItem 
              label="Flujo Libre" 
              value={fmtCurrency(resumen.capacidad?.FlujoCajaLibre)}
            />
            <IndicatorItem 
              label="Estado" 
              value={resumen.capacidad?.EstadoCredito || 'N/A'}
              isBadge={true}
              color={getStatusColor(resumen.capacidad?.EstadoCredito)}
            />
          </View>
        </Animatable.View>

        <Animatable.View 
          animation="fadeInUp" 
          duration={600} 
          delay={200}
          style={[styles.indicatorCard, { backgroundColor: '#F0FDF4' }]}
        >
          <View style={styles.indicatorHeader}>
            <View style={[styles.iconContainer, { backgroundColor: '#10B981' }]}>
              <FontAwesome5 name="chart-line" size={20} color="#fff" />
            </View>
            <Text style={styles.indicatorTitle}>Endeudamiento</Text>
          </View>
          <View style={styles.indicatorContent}>
            <IndicatorItem 
              label="Índice" 
              value={fmtPercent(resumen.endeudamiento?.IndiceEndeudamiento)}
              color={getStatusColor(resumen.endeudamiento?.EvaluacionEndeudamiento)}
            />
            <IndicatorItem 
              label="Evaluación" 
              value={resumen.endeudamiento?.EvaluacionEndeudamiento || 'N/A'}
              isBadge={true}
              color={getStatusColor(resumen.endeudamiento?.EvaluacionEndeudamiento)}
            />
          </View>
        </Animatable.View>

        <Animatable.View 
          animation="fadeInUp" 
          duration={600} 
          delay={300}
          style={[styles.indicatorCard, { backgroundColor: '#FEF3F2' }]}
        >
          <View style={styles.indicatorHeader}>
            <View style={[styles.iconContainer, { backgroundColor: '#EF4444' }]}>
              <FontAwesome5 name="home" size={20} color="#fff" />
            </View>
            <Text style={styles.indicatorTitle}>LTV</Text>
          </View>
          <View style={styles.indicatorContent}>
            <IndicatorItem 
              label="Porcentaje" 
              value={resumen.ltv?.LTV ? `${resumen.ltv.LTV.toFixed(2)}%` : 'N/A'}
              color={getStatusColor(resumen.ltv?.Interpretacion)}
            />
            <IndicatorItem 
              label="Interpretación" 
              value={resumen.ltv?.Interpretacion || 'N/A'}
              isBadge={true}
              color={getStatusColor(resumen.ltv?.Interpretacion)}
            />
          </View>
        </Animatable.View>
      </View>

      {/* Tarjetas de Detalle */}
      <Animatable.View animation="fadeInUp" duration={600} delay={400}>
        <TouchableOpacity onPress={() => toggleCard('capacidad')}>
          <Card style={styles.detailCard}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleContainer}>
                  <MaterialIcons name="assessment" size={24} color="#6366F1" />
                  <Text style={styles.detailCardTitle}>Detalle de Capacidad de Pago</Text>
                </View>
                <MaterialIcons 
                  name={expandedCard === 'capacidad' ? 'expand-less' : 'expand-more'} 
                  size={24} 
                  color="#6B7280" 
                />
              </View>
              {expandedCard === 'capacidad' && (
                <Animatable.View animation="fadeIn" duration={300}>
                  <Divider style={styles.divider} />
                  <View style={styles.detailContent}>
                    <DetailItem label="Ingresos Totales" value={fmtCurrency(resumen.capacidad?.IngresosMensualesTotales)} />
                    <DetailItem label="Gastos Totales" value={fmtCurrency(resumen.capacidad?.GastosMensualesTotales)} />
                    <DetailItem label="Flujo de Caja Libre" value={fmtCurrency(resumen.capacidad?.FlujoCajaLibre)} />
                    <DetailItem label="Cuota Estimada" value={fmtCurrency(resumen.capacidad?.CuotaMensual)} />
                  </View>
                </Animatable.View>
              )}
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" duration={600} delay={500}>
        <TouchableOpacity onPress={() => toggleCard('flujo')}>
          <Card style={styles.detailCard}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleContainer}>
                  <MaterialIcons name="trending-up" size={24} color="#10B981" />
                  <Text style={styles.detailCardTitle}>Análisis de Flujo de Caja</Text>
                </View>
                <MaterialIcons 
                  name={expandedCard === 'flujo' ? 'expand-less' : 'expand-more'} 
                  size={24} 
                  color="#6B7280" 
                />
              </View>
              {expandedCard === 'flujo' && (
                <Animatable.View animation="fadeIn" duration={300}>
                  <Divider style={styles.divider} />
                  <View style={styles.detailContent}>
                    <DetailItem label="Ingreso Mensual" value={fmtCurrency(resumen.flujoCaja?.IngresoMensual)} />
                    <DetailItem label="Gastos Mensuales" value={fmtCurrency(resumen.flujoCaja?.GastosMensuales)} />
                    <DetailItem label="Flujo de Caja Libre" value={fmtCurrency(resumen.flujoCaja?.FlujoCajaLibre)} />
                  </View>
                </Animatable.View>
              )}
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </Animatable.View>

      {/* Tabla de Amortización */}
      <Animatable.View animation="fadeInUp" duration={600} delay={600}>
        <Card style={styles.tableCard}>
          <Card.Content>
            <View style={styles.tableHeader}>
              <View style={styles.cardTitleContainer}>
                <MaterialIcons name="table-chart" size={24} color="#8B5CF6" />
                <Text style={styles.tableTitle}>Tabla de Amortización</Text>
              </View>
              <Chip 
                icon="format-list-numbered" 
                mode="outlined"
                style={styles.tableChip}
              >
                {data?.TablaAmortizacion?.length || 0} Meses
              </Chip>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.tableScrollView}
            >
              <DataTable style={styles.dataTable}>
                <DataTable.Header style={styles.tableHeaderRow}>
                  <DataTable.Title style={styles.tableCell}>Mes</DataTable.Title>
                  <DataTable.Title numeric style={styles.tableCell}>Cuota</DataTable.Title>
                  <DataTable.Title numeric style={styles.tableCell}>Capital</DataTable.Title>
                  <DataTable.Title numeric style={styles.tableCell}>Interés</DataTable.Title>
                  <DataTable.Title numeric style={styles.tableCell}>Capital Vivo</DataTable.Title>
                  <DataTable.Title numeric style={styles.tableCell}>Saldo</DataTable.Title>
                </DataTable.Header>

                {data?.TablaAmortizacion?.map((item, index) => (
                  <DataTable.Row 
                    key={item.Mes} 
                    style={[
                      styles.tableRow,
                      index % 2 === 0 && styles.evenRow
                    ]}
                  >
                    <DataTable.Cell style={styles.tableCell}>
                      <Text style={styles.monthText}>Mes {item.Mes}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric style={styles.tableCell}>
                      <Text style={styles.amountText}>{fmtCurrency(item.Cuota)}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric style={styles.tableCell}>
                      <Text style={styles.amountText}>{fmtCurrency(item.Capital)}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric style={styles.tableCell}>
                      <Text style={[styles.amountText, styles.interestText]}>
                        {fmtCurrency(item.Interes)}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric style={styles.tableCell}>
                      <Text style={styles.amountText}>{fmtCurrency(item.CapitalVivo)}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric style={styles.tableCell}>
                      <View style={styles.progressContainer}>
                        <View 
                          style={[
                            styles.progressBar,
                            { 
                              width: `${Math.min(100, (item.CapitalVivo / (data?.TablaAmortizacion?.[0]?.CapitalVivo || 1)) * 100)}%` 
                            }
                          ]} 
                        />
                        <Text style={styles.progressText}>
                          {Math.round((item.CapitalVivo / (data?.TablaAmortizacion?.[0]?.CapitalVivo || 1)) * 100)}%
                        </Text>
                      </View>
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </ScrollView>

            <View style={styles.tableFooter}>
              <View style={styles.summaryContainer}>
                <Text style={styles.summaryText}>
                  Total Pagado: {fmtCurrency(data?.TablaAmortizacion?.reduce((sum, item) => sum + (item.Cuota || 0), 0))}
                </Text>
                <Text style={styles.summaryText}>
                  Interés Total: {fmtCurrency(data?.TablaAmortizacion?.reduce((sum, item) => sum + (item.Interes || 0), 0))}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </Animatable.View>

      {/* Botón de acción */}
      <Animatable.View animation="fadeInUp" duration={600} delay={700}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={generatePDF}
        >
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            style={styles.actionButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <MaterialIcons name="download" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Descargar Reporte Completo</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animatable.View>
    </ScrollView>
  );
}

// Componentes auxiliares
function IndicatorItem({ label, value, color = '#374151', isBadge = false }) {
  return (
    <View style={styles.indicatorItem}>
      <Text style={styles.indicatorLabel}>{label}</Text>
      {isBadge ? (
        <View style={[styles.badge, { backgroundColor: color + '20' }]}>
          <Text style={[styles.badgeText, { color }]}>{value}</Text>
        </View>
      ) : (
        <Text style={[styles.indicatorValue, { color }]}>{value}</Text>
      )}
    </View>
  );
}

function DetailItem({ label, value }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F9FAFB',
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
    marginTop: 4,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  indicatorsGrid: {
    flexDirection: isTablet ? 'row' : 'column',
    gap: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  indicatorCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  indicatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  indicatorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  indicatorContent: {
    gap: 12,
  },
  indicatorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  indicatorLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  indicatorValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  divider: {
    marginVertical: 12,
  },
  detailContent: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 15,
    color: '#4B5563',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  tableCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tableTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  tableChip: {
    backgroundColor: '#F3F4F6',
  },
  tableScrollView: {
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  dataTable: {
    minWidth: isTablet ? width - 32 : width * 1.5,
  },
  tableHeaderRow: {
    backgroundColor: '#F3F4F6',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableRow: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  evenRow: {
    backgroundColor: '#F9FAFB',
  },
  tableCell: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 120,
  },
  monthText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  amountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  interestText: {
    color: '#DC2626',
  },
  progressContainer: {
    width: 80,
    height: 24,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  progressText: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 11,
    fontWeight: '600',
    color: '#111827',
  },
  tableFooter: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  actionButton: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});