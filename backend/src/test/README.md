# 🧪 Sistema de Tests - Proyecto GPS 2025

## ⚡ Ejecución de Tests

### Comandos Disponibles

```bash
# Ejecutar TODOS los tests con limpieza automática
npm test

# Ejecutar solo tests de usuarios
npm run test:users

# Ejecutar tests en modo watch (desarrollo)
npm run test:watch

# Limpiar manualmente datos de prueba
npm run cleanup
```

## 🛡️ Protecciones Implementadas

### 1. **No Ejecución Automática**

- Los tests **NUNCA** se ejecutan automáticamente al iniciar el servidor
- Protección por `NODE_ENV !== 'test'` en `server.ts`
- Detección de comandos de test para evitar inicio accidental del servidor

### 2. **Limpieza Automática**

- **TODOS** los datos de prueba se eliminan automáticamente al finalizar los tests
- Solo se mantienen usuarios esenciales: admin (11.111.111-1) y RRHH (22.222.222-2)
- Limpieza en orden correcto respetando dependencias de base de datos

### 3. **Configuración Global**

- Configuración centralizada en `.mocharc.json`
- Hooks globales en `setup.ts` para limpieza automática
- Timeouts adecuados y configuración optimizada

## 📋 Datos que se Limpian Automáticamente

Al finalizar los tests se eliminan:

- ✅ Licencias y permisos de prueba  
- ✅ Historial laboral de prueba
- ✅ Fichas de empresa de prueba
- ✅ Usuarios de prueba (excepto admin y RRHH)
- ✅ Trabajadores de prueba (excepto admin y RRHH)

## 🔧 Datos que se Mantienen

Usuarios esenciales que **NUNCA** se eliminan:

- 👤 Admin Principal (RUT: 11.111.111-1, Email: <admin.principal@gmail.com>)
- 👤 Recursos Humanos (RUT: 22.222.222-2, Email: <recursoshumanos@gmail.com>)

## ⚠️ Importante

1. **Solo ejecutar tests manualmente** con `npm test`
2. **No modificar** usuarios admin y RRHH en tests
3. **Los tests limpian automáticamente** - no necesitas limpiar manualmente
4. **Usar RUTs únicos** para datos de prueba para evitar conflictos

## 🎯 Ejemplo de Test Correcto

```typescript
describe("Mi Test", () => {
    let testTrabajador: Trabajador;
    
    before(async () => {
        // Crear datos de prueba con RUT único
        testTrabajador = await crearTrabajadorPrueba("99.888.777-6");
    });
    
    it("debe hacer algo", async () => {
        // Test logic aquí
    });
    
    // NO necesitas after() - la limpieza es automática
});
```

## 🚀 Flujo de Ejecución

1. **Ejecutas**: `npm test`
2. **Sistema**: Configura ambiente de test
3. **Sistema**: Ejecuta todos los tests
4. **Sistema**: Limpia automáticamente TODOS los datos de prueba
5. **Sistema**: Cierra conexión de base de datos
6. **Resultado**: Base de datos limpia, solo con usuarios esenciales

¡Los tests ahora son completamente seguros y no contaminarán tu base de datos de desarrollo! 🎉
