import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export class PushNotificationService {
  
  /**
   * Obtener el token de Expo
   */
  static async getExpoToken(): Promise<string | null> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('⚠️ Permisos de notificaciones denegados');
        return null;
      }

      // Obtener token de Expo
      const projectId = '1b88fa29-0ad7-4035-8c50-50400f4978a5'; // Del app.json
      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('🔥 Expo Push Token obtenido:', token.substring(0, 30) + '...');
      
      // Guardar en AsyncStorage
      await AsyncStorage.setItem('expo_push_token', token);
      
      return token;
    } catch (error) {
      console.error('❌ Error obteniendo Expo token:', error);
      return null;
    }
  }

  /**
   * Manejar navegación desde notificaciones
   */
  private static handleNotificationNavigation(data: any) {
    const { type, incendio_id, deeplink } = data;

    console.log('🧭 Navegando desde notificación:', { type, incendio_id, deeplink });

    // Opción 1: Usar deeplink si existe
    if (deeplink) {
      router.push(deeplink);
      return;
    }

    // Opción 2: Navegar según el tipo
    switch (type) {
      case 'incendio_aprobado':
      case 'incendio_actualizado':
      case 'incendio_cerrado':
      case 'incendio_nuevo_municipio':
      case 'incendio_nuevo_departamento':
        if (incendio_id) {
          router.push(`/incendios/${incendio_id}` as any);
        }
        break;

      case 'cierre_iniciado':
      case 'cierre_actualizado':
      case 'cierre_finalizado':
      case 'cierre_reabierto':
        if (incendio_id) {
          router.push(`/incendios/${incendio_id}` as any);
        }
        break;

      default:
        router.push('/notificaciones');
    }
  }

  /**
   * Configurar el listener de notificaciones en primer plano (para Expo)
   */
  static configureForegroundListener() {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Listener cuando el usuario toca una notificación local o remota en background/foreground
    Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      console.log('👆 Usuario tocó notificación:', data);
      this.handleNotificationNavigation(data);
    });

    // Listener de cuando llega una notificación (y la app está abierta)
    Notifications.addNotificationReceivedListener((notification) => {
      console.log('📨 Notificación recibida en foreground:', notification.request.content);
    });
  }

  /**
   * Configurar canal de Android
   */
  static async configureAndroidChannel() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Notificaciones de Incendios',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B35',
        sound: 'default',
      });
    }
  }

  /**
   * Registrar token en el backend
   */
  static async registerToken(
    userId: string,
    expoPushToken: string,
    municipiosSuscritos: string[] = [],
    departamentosSuscritos: string[] = []
  ) {
    try {
      const { api } = await import('./client');
      
      const response = await api.post('/push/register', {
        userId,
        expoPushToken, 
        municipiosSuscritos,
        departamentosSuscritos,
        avisarmeAprobado: true,
        avisarmeActualizaciones: true,
        avisarmeCierres: true,
      });

      console.log('✅ Token Expo registrado en backend');
      return response.data;
    } catch (error) {
      console.error('❌ Error registrando Expo token:', error);
      throw error;
    }
  }

  /**
   * Actualizar preferencias de notificaciones
   */
  static async updatePreferences(
    userId: string,
    municipiosSuscritos: string[] = [],
    departamentosSuscritos: string[] = [],
    avisarmeAprobado: boolean = true,
    avisarmeActualizaciones: boolean = true,
    avisarmeCierres: boolean = true
  ) {
    try {
      const { api } = await import('./client');
      
      const response = await api.post('/push/prefs', {
        userId,
        municipiosSuscritos,
        departamentosSuscritos,
        avisarmeAprobado,
        avisarmeActualizaciones,
        avisarmeCierres,
      });

      console.log('✅ Preferencias actualizadas');
      return response.data;
    } catch (error) {
      console.error('❌ Error actualizando preferencias:', error);
      throw error;
    }
  }

  /**
   * Desregistrar token del backend
   */
  static async unregisterToken(userId: string, expoPushToken: string) {
    try {
      const { api } = await import('./client');
      
      const response = await api.post('/push/unregister', {
        userId,
        expoPushToken,
      });

      console.log('✅ Token desregistrado del backend');
      return response.data;
    } catch (error) {
      console.error('❌ Error desregistrando token:', error);
      throw error;
    }
  }

  /**
   * Inicializar servicio completo
   */
  static async initialize() {
    try {
      console.log('🚀 Inicializando servicio de notificaciones Expo...');
      
      // Configurar canal de Android
      await this.configureAndroidChannel();
      
      // Configurar handlers
      this.configureForegroundListener();
      
      // Obtener token
      const expoToken = await this.getExpoToken();
      
      if (expoToken) {
        console.log('✅ Servicio de notificaciones inicializado');
        return expoToken;
      } else {
        console.log('⚠️ No se pudo obtener el token Expo');
        return null;
      }
    } catch (error) {
      console.error('❌ Error inicializando notificaciones:', error);
      return null;
    }
  }

  /**
   * Mock para compatibilidad anterior (Expo no tiene refresh listener directo como FCM)
   */
  static setupTokenRefreshListener() {
    return () => {};
  }
}