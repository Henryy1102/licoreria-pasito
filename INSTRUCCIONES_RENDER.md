# Instrucciones para Redesplegar en Render

## Problema
El backend en Render no tiene la funcionalidad de "Recuperar Contraseña" porque el código desplegado está desactualizado.

## Solución

### 1. Configurar Variables de Entorno en Render

1. Ve a: https://dashboard.render.com
2. Selecciona tu servicio: `licoreria-pasito`
3. Ve a la pestaña **Environment**
4. Agrega/verifica estas variables:

```
MONGODB_URI=mongodb+srv://henrybedoya_db_user:hdaniel1102@licoreria.qezc3un.mongodb.net/licoreriapasito?retryWrites=true&w=majority&appName=licoreria
JWT_SECRET=hdaniel1102
PORT=4000
EMAIL_SERVICE=gmail
EMAIL_USER=hdanielzapata13@gmail.com
EMAIL_PASSWORD=agbyhprhlifkdces
FRONTEND_URL=https://licoreria-pasito.vercel.app
```

5. Haz clic en **Save Changes**

### 2. Redesplegar el Backend

1. En tu servicio de Render, ve a la pestaña **Manual Deploy**
2. Haz clic en **"Deploy latest commit"**
3. Espera 3-5 minutos a que termine el despliegue
4. Verifica que el estado sea "Live"

### 3. Verificar que Funcione

Después del despliegue, prueba la función de recuperación de contraseña en:
https://licoreria-pasito.vercel.app/forgot-password

## Notas Importantes

- **Gmail App Password**: La contraseña `agbyhprhlifkdces` es una contraseña de aplicación de Gmail. Si no funciona el envío de emails, necesitas generar una nueva desde:
  - Google Account → Security → 2-Step Verification → App passwords
  
- **Render Free Tier**: El servicio gratuito se "duerme" después de 15 minutos de inactividad. La primera petición puede tardar 50+ segundos.

- **Logs**: Si hay errores, revisa los logs en Render:
  - Dashboard → Tu servicio → Logs

## Verificación Técnica

Para verificar que el endpoint existe, ejecuta:

```powershell
$body = @{ email = "test@test.com" } | ConvertTo-Json
Invoke-WebRequest -Uri "https://licoreria-pasito.onrender.com/api/auth/forgot-password" -Method POST -ContentType "application/json" -Body $body
```

Debería responder con status 404 (usuario no encontrado) en lugar de "Cannot POST".
