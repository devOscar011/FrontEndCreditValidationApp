import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, ActivityIndicator, View, TouchableOpacity } from 'react-native';
import { Text, DataTable, Card } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import * as Print from 'expo-print'; // Importa expo-print
import * as FileSystem from 'expo-file-system'; 
import api from '../../Services/Api';

export default function AmortizacionCalculada() {
  const { personaID } = useLocalSearchParams();
  const [data, setData] = useState(null);
  const [resumen, setResumen] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [tabRes, capPago, flujoCaja, endeud, ltvRes] = await Promise.all([
          api.get(`/amortizacion/calculada/persona/${personaID}/`),
          api.get(`/evaluar-capacidad-pago/persona/${personaID}/`),
          api.get(`/analizar-flujo-caja/persona/${personaID}/`),
          api.get(`/cacular-indice-endeudamineto/persona/${personaID}/`),
          api.get(`/api/ltv/${personaID}/`),
          api.get(`/reporte-credito/${personaID}/`),
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
      }
    };

    if (personaID) fetchAll();
  }, [personaID]);

  const fmtCurrency = (num) =>
    num !== null && num !== undefined ? `$${Number(num).toFixed(2)}` : 'N/A';

  const fmtPercent = (num) =>
    num !== null && num !== undefined ? `${(Number(num) * 100).toFixed(2)}%` : 'N/A';

  const generatePDF = async () => {
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { color: #6200ee; }
            .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: right; }
            .table th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h2>Resumen de Capacidad de Pago</h2>
          <p><strong>Ingresos Mensuales Totales:</strong> ${fmtCurrency(resumen.capacidad?.IngresosMensualesTotales)}</p>
          <p><strong>Gastos Mensuales Totales:</strong> ${fmtCurrency(resumen.capacidad?.GastosMensualesTotales)}</p>
          <p><strong>Flujo de Caja Libre:</strong> ${fmtCurrency(resumen.capacidad?.FlujoCajaLibre)}</p>
          <p><strong>Cuota Estimada:</strong> ${fmtCurrency(resumen.capacidad?.CuotaMensual)}</p>
          <p><strong>DSCR:</strong> ${resumen.capacidad?.DSCR !== null ? resumen.capacidad.DSCR.toFixed(2) : 'N/A'}</p>
          <p><strong>Estado de Crédito:</strong> ${resumen.capacidad?.EstadoCredito || 'N/A'}</p>

          <h2>Tabla de Amortización</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Mes</th>
                <th>Cuota</th>
                <th>Capital</th>
                <th>Interés</th>
                <th>Capital Vivo</th>
              </tr>
            </thead>
            <tbody>
              ${data.TablaAmortizacion.map(item => `
                <tr>
                  <td>${item.Mes}</td>
                  <td>${fmtCurrency(item.Cuota)}</td>
                  <td>${fmtCurrency(item.Capital)}</td>
                  <td>${fmtCurrency(item.Interes)}</td>
                  <td>${fmtCurrency(item.CapitalVivo)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    // Utilizando expo-print para generar el PDF
    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    console.log('PDF generado en: ', uri);

    // Aquí puedes abrir el archivo o compartirlo
    alert('PDF generado con éxito. Ruta del archivo: ' + uri);
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 30 }} size="large" color="#6200ee" />;
  if (error) return <Text style={styles.errorText}>{error}</Text>;
  if (!data) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Aquí van las tarjetas de Resumen y Análisis (el código ya está en tu componente) */}

      <Animatable.View animation="fadeIn" delay={600} duration={600}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Tabla de Amortización</Text>
            <ScrollView horizontal>
              <DataTable style={{ width: '100%' }}>
                <DataTable.Header style={styles.headerRow}>
                  <DataTable.Title style={styles.colMes}>Mes</DataTable.Title>
                  <DataTable.Title numeric style={styles.col}>Cuota</DataTable.Title>
                  <DataTable.Title numeric style={styles.col}>Capital</DataTable.Title>
                  <DataTable.Title numeric style={styles.col}>Interés</DataTable.Title>
                  <DataTable.Title numeric style={styles.col}>Capital Vivo</DataTable.Title>
                </DataTable.Header>
                {data.TablaAmortizacion.map((item) => (
                  <DataTable.Row key={item.Mes} style={styles.row}>
                    <DataTable.Cell style={styles.colMes}>{item.Mes}</DataTable.Cell>
                    <DataTable.Cell numeric style={styles.col}>{fmtCurrency(item.Cuota)}</DataTable.Cell>
                    <DataTable.Cell numeric style={styles.col}>{fmtCurrency(item.Capital)}</DataTable.Cell>
                    <DataTable.Cell numeric style={styles.col}>{fmtCurrency(item.Interes)}</DataTable.Cell>
                    <DataTable.Cell numeric style={styles.col}>{fmtCurrency(item.CapitalVivo)}</DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </ScrollView>
            <TouchableOpacity onPress={generatePDF} style={styles.button}>
              <Text style={styles.buttonText}>Descargar Reporte PDF</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </Animatable.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 20,
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  container: {
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  cardContainer: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    elevation: 5,
    borderRadius: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#6200ee',
    marginBottom: 16,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 16,
    color: '#555',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  headerRow: {
    backgroundColor: '#e3e3e3',
  },
  row: {
    backgroundColor: '#fff',
    paddingVertical: 4,
  },
  col: {
    minWidth: 120,
    justifyContent: 'flex-end',
  },
  colMes: {
    minWidth: 80,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    margin: 20,
    fontSize: 16,
  },
});
