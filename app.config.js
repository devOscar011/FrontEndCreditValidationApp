import 'dotenv/config'
import appJson from './app.json'

export default ({ config }) => ({
  ...config,
  ...appJson,
  extra: {
    ...(config.extra || {}),
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000/api',
    nodeEnv: process.env.NODE_ENV || 'development',
    appScheme: process.env.EXPO_PUBLIC_APP_SCHEME || 'creditvalidation',
  },
})
