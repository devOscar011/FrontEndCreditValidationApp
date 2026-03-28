import React, { useEffect, useState } from 'react';
import { Drawer } from 'expo-router/drawer';
import { Slot, usePathname } from 'expo-router';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import DrawerContent from '../../components/DrawerContent';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../Services/Api';

const NAV_COLORS = {
  primary: '#4BB2F2',
  primaryDark: '#2F8ED8',
  accent: '#4BB2F2',
  onPrimary: '#FFFFFF',
  inactive: '#444444',
};

const customTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: NAV_COLORS.primary,
    background: '#ffffff',
    surface: NAV_COLORS.primary,
    text: '#000000',
    placeholder: '#666666',
    outline: '#cccccc',
  },
};

export default function RootLayout() {
  const pathname = usePathname();
  const [sessionUser, setSessionUser] = useState('');
  const [sessionRole, setSessionRole] = useState('');

  const isIndex = pathname === '/' || pathname === '/index';

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('sessionUser');
        const storedRole = await AsyncStorage.getItem('sessionRole');
        if (storedUser) setSessionUser(storedUser);
        if (storedRole) setSessionRole(storedRole);

        if (!storedRole) {
          const res = await api.get('api/usuario-rol/');
          const role =
            res.data?.roles?.[0] ||
            res.data?.rol ||
            res.data?.role ||
            res.data?.grupo ||
            res.data?.group ||
            res.data?.groups?.[0]?.name ||
            'Usuario';
          if (role) {
            setSessionRole(role);
            await AsyncStorage.setItem('sessionRole', role);
          }
        }
      } catch {
        // Fallback silencioso
      }
    };
    loadSession();
  }, []);

  return (
    <PaperProvider theme={customTheme}>
      {isIndex ? (
        <Slot /> 
      ) : (
        <Drawer
          drawerContent={(props) => <DrawerContent {...props} />}
          screenOptions={{
            headerStyle: {
              backgroundColor: NAV_COLORS.primary,
            },
            headerTintColor: NAV_COLORS.onPrimary,
            drawerActiveTintColor: NAV_COLORS.primaryDark,
            drawerInactiveTintColor: NAV_COLORS.inactive,
            drawerLabelStyle: { fontSize: 16, fontWeight: '600' },
            headerRight: () => (
              <View style={{ alignItems: 'flex-end', marginRight: 12 }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
                  {sessionUser || 'Usuario'}
                </Text>
                <Text style={{ color: '#E6F3FF', fontSize: 12 }}>
                  {sessionRole || 'Rol'}
                </Text>
              </View>
            ),
          }}
        >
          <Drawer.Screen name="Personas" options={{ title: 'Solicitudes' }} />
          <Drawer.Screen name="Home" options={{ title: 'Nuevo Credito' }} />
          <Drawer.Screen name="Search" options={{ title: 'Clientes' }} />
          <Drawer.Screen name="register" options={{ title: 'Usuarios' }} />
          <Drawer.Screen name="AmortizacionCalculada" options={{ title: 'Detalle del Credito' }} />
          <Drawer.Screen name="EditPerson" options={{ title: 'Editar Persona' }} />
          <Drawer.Screen name="FormIngresos" options={{ title: 'Ingresos' }} />
        </Drawer>
      )}
    </PaperProvider>
  );
}
