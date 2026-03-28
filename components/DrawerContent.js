import React from 'react';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { View } from 'react-native';
import { Avatar, Title, Caption } from 'react-native-paper';
import { MaterialIcons, FontAwesome5, Entypo, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import api from '../Services/Api';

export default function DrawerContent(props) {
  const router = useRouter();
  const activeRoute = props.state?.routeNames?.[props.state.index];

  const NAV_COLORS = {
    drawerBg: '#4BB2F2',
    drawerGradTop: '#5CC0F5',
    itemActive: '#2F8ED8',
    accent: '#FFFFFF',
    onPrimary: '#FFFFFF',
    onPrimaryMuted: '#E0E7FF',
  };

  const getItemStyle = (routeName) => ({
    backgroundColor: activeRoute === routeName ? NAV_COLORS.itemActive : 'transparent',
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 4,
  });

  const getLabelStyle = (routeName) => ({
    color: activeRoute === routeName ? NAV_COLORS.onPrimary : NAV_COLORS.onPrimaryMuted,
    fontWeight: activeRoute === routeName ? '700' : '600',
  });

  const getIconColor = (routeName) =>
    activeRoute === routeName ? NAV_COLORS.onPrimary : NAV_COLORS.onPrimaryMuted;

  const handleLogout = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/logout/', { refresh: refreshToken });
      }
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('sessionUser');
      await AsyncStorage.removeItem('sessionRole');
      router.replace('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error.response?.data || error.message);
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('sessionUser');
      await AsyncStorage.removeItem('sessionRole');
      router.replace('/login');
    }
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{
        flex: 1,
        backgroundColor: NAV_COLORS.drawerBg,
        paddingTop: 30,
      }}
    >
      <Avatar.Icon
        size={80}
        icon="account"
        style={{
          backgroundColor: '#ffffff',
          alignSelf: 'center',
          marginBottom: 20,
        }}
      />
      <Title
        style={{
          textAlign: 'center',
          marginBottom: 6,
          color: NAV_COLORS.onPrimary,
          fontWeight: '800',
          letterSpacing: 0.3,
        }}
      >
        Credit Validation
      </Title>
      <Caption
        style={{
          textAlign: 'center',
          marginBottom: 18,
          color: NAV_COLORS.onPrimaryMuted,
        }}
      >
        Plataforma de creditos
      </Caption>

      <Caption
        style={{
          marginLeft: 18,
          marginBottom: 6,
          color: NAV_COLORS.onPrimaryMuted,
          letterSpacing: 1.2,
        }}
      >
        OPERACIONES
      </Caption>

      <DrawerItem
        label="Solicitudes"
        labelStyle={getLabelStyle('Personas')}
        style={getItemStyle('Personas')}
        icon={({ size }) => (
          <MaterialIcons name="assignment" color={getIconColor('Personas')} size={size} />
        )}
        onPress={() => props.navigation.navigate('Personas')}
      />

      <DrawerItem
        label="Nuevo Credito"
        labelStyle={getLabelStyle('Home')}
        style={getItemStyle('Home')}
        icon={({ size }) => (
          <FontAwesome5 name="file-invoice-dollar" color={getIconColor('Home')} size={size} />
        )}
        onPress={() => props.navigation.navigate('Home')}
      />

      <DrawerItem
        label="Clientes"
        labelStyle={getLabelStyle('Search')}
        style={getItemStyle('Search')}
        icon={({ size }) => (
          <Entypo name="users" color={getIconColor('Search')} size={size} />
        )}
        onPress={() => props.navigation.navigate('Search')}
      />

      <Caption
        style={{
          marginLeft: 18,
          marginTop: 10,
          marginBottom: 6,
          color: NAV_COLORS.onPrimaryMuted,
          letterSpacing: 1.2,
        }}
      >
        ADMINISTRACION
      </Caption>

      <DrawerItem
        label="Usuarios"
        labelStyle={getLabelStyle('register')}
        style={getItemStyle('register')}
        icon={({ size }) => (
          <Ionicons name="people-circle" color={getIconColor('register')} size={size} />
        )}
        onPress={() => props.navigation.navigate('register')}
      />

      <DrawerItem
        label="Cerrar sesion"
        labelStyle={{ color: NAV_COLORS.onPrimaryMuted, fontWeight: '600' }}
        icon={({ size }) => (
          <MaterialIcons name="logout" color={NAV_COLORS.onPrimaryMuted} size={size} />
        )}
        onPress={handleLogout}
      />

      <Caption
        style={{
          marginTop: 'auto',
          textAlign: 'center',
          padding: 10,
          color: NAV_COLORS.onPrimaryMuted,
        }}
      >
        v1.0.0
      </Caption>
    </DrawerContentScrollView>
  );
}
