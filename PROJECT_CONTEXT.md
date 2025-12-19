# 🔐 Configuración y Contexto del Proyecto - Directorio Zona

## 📋 Información General

**Nombre del Proyecto:** Directorio Zona  
**Tipo:** PWA (Progressive Web App)  
**Framework:** React + TypeScript + Vite  
**Base de Datos:** Supabase (PostgreSQL)  
**Autenticación:** Supabase Auth

---

## 🗄️ Configuración de Supabase

### Credenciales de Conexión

**URL de Supabase:**
```
https://kiaualzhazhdwlojqyjq.supabase.co
```

**Anon Key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpYXVhbHpoYXpoZHdsb2pxeWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MjkzNDUsImV4cCI6MjA3OTQwNTM0NX0.bDEjn09u5zNCVxJbDp4QCspss0FbNSkLipL1xGptTrU
```

### Archivo de Configuración

**Ubicación:** `.env`

```env
VITE_SUPABASE_URL=https://kiaualzhazhdwlojqyjq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Cliente Supabase

**Archivo:** `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(
    supabaseUrl || '',
    supabaseAnonKey || ''
);
```

---

## 👤 Sistema de Autenticación de Super Admin

### Página de Login

**Ruta:** `/admin/login`  
**Archivo:** `src/pages/AdminLoginPage.tsx`

### Proceso de Login

1. **Autenticación con Supabase Auth**
   - Usa email y contraseña
   - Valida credenciales contra `auth.users`

2. **Verificación de Rol de Admin**
   ```typescript
   const { data: profile } = await supabase
       .from("profiles")
       .select("role")
       .eq("id", user.id)
       .single();
   
   if (profile?.role !== 'admin') {
       // Acceso denegado
   }
   ```

3. **Redirección al Dashboard**
   - Si es admin: redirige a `/admin`
   - Si no es admin: cierra sesión y muestra error

### Credenciales de Ejemplo

**Placeholder en UI:**
- Email: `admin@directoriozona.com`
- Password: `••••••••••••`

> ⚠️ **IMPORTANTE:** Las credenciales reales deben estar configuradas en Supabase Auth y en la tabla `profiles`.

---

## 🛡️ Promoción de Usuario a Super Admin

### Script SQL para Promover Admin

**Archivo:** `promote_admin.sql`

```sql
-- Reemplaza 'TU_EMAIL_AQUI' con el email del usuario
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'TU_EMAIL_AQUI' -- <--- PON EL EMAIL AQUÍ
);

-- Verificación
SELECT * FROM public.profiles WHERE role = 'admin';
```

### Pasos para Crear un Super Admin

1. Ir al **SQL Editor** en el dashboard de Supabase
2. Copiar el contenido de `promote_admin.sql`
3. Reemplazar `'TU_EMAIL_AQUI'` con el email del usuario
4. Ejecutar el script
5. Verificar que el rol se actualizó correctamente

---

## 🗃️ Estructura de Base de Datos

### Tablas Principales

#### 1. `profiles`
```sql
- id (UUID) - PK, referencia a auth.users
- email (TEXT)
- full_name (TEXT)
- role (TEXT) - valores: 'admin', 'user', etc.
- created_at (TIMESTAMP)
```

#### 2. `businesses`
```sql
- id (INTEGER) - PK
- name (TEXT)
- description (TEXT)
- category (TEXT)
- address (TEXT)
- lat (NUMERIC)
- lng (NUMERIC)
- image_url (TEXT)
- owner_id (UUID) - FK a profiles.id
- plan_id (TEXT) - valores: 'free', 'launch', 'featured'
- is_premium (BOOLEAN)
- is_hidden (BOOLEAN) - default: false
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 3. `leads`
```sql
- id (UUID) - PK
- business_name (TEXT)
- contact_name (TEXT)
- email (TEXT)
- phone (TEXT)
- notes (TEXT)
- status (TEXT)
- created_at (TIMESTAMP)
```

#### 4. `reviews`
```sql
- id (UUID) - PK
- business_id (INTEGER) - FK a businesses.id
- user_id (UUID) - FK a profiles.id
- rating (INTEGER) - 1-5
- comment (TEXT)
- created_at (TIMESTAMP)
```

---

## 🔐 Políticas RLS (Row Level Security)

### Script Principal de Políticas Admin

**Archivo:** `admin_crud_policies.sql`

#### Políticas Implementadas:

1. **Admins pueden eliminar negocios**
```sql
CREATE POLICY "Admins can delete businesses" ON public.businesses
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

2. **Admins pueden eliminar leads**
```sql
CREATE POLICY "Admins can delete leads" ON public.leads
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

3. **Admins pueden actualizar cualquier negocio**
```sql
CREATE POLICY "Admins can update all businesses" ON public.businesses
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

4. **Admins pueden actualizar leads**
```sql
CREATE POLICY "Admins can update leads" ON public.leads
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

---

## 📁 Archivos SQL Disponibles

El proyecto incluye los siguientes scripts SQL para gestión de la base de datos:

### Scripts de Configuración de Admin
- `admin_crud_policies.sql` - Políticas RLS para CRUD de admin
- `admin_policies.sql` - Políticas generales de admin
- `promote_admin.sql` - Promoción de usuario a admin
- `setup_admin_complete.sql` - Configuración completa de admin
- `setup_admin_final.sql` - Configuración final de admin

### Scripts de Gestión de Negocios
- `check_businesses_schema.sql` - Verificar esquema de tabla businesses
- `ensure_businesses_columns.sql` - Asegurar columnas de businesses
- `fix_businesses_missing_columns.sql` - Reparar columnas faltantes
- `owner_link.sql` - Vincular negocios con dueños

### Scripts de Features
- `leads.sql` - Configuración de tabla de leads
- `plans.sql` - Configuración de planes de suscripción
- `setup_rating_system.sql` - Sistema de ratings
- `setup_reviews_and_privacy.sql` - Reviews y privacidad
- `setup_reviews_v2.sql` - Reviews versión 2
- `setup_profiles_with_email.sql` - Perfiles con email

### Scripts de Supabase
- `supabase/schema.sql` - Esquema completo
- `supabase/fix_warnings.sql` - Corrección de warnings
- `supabase_schema.sql` - Esquema base
- `supabase_add_image_url.sql` - Agregar campo imagen

---

## 🎯 Flujo de Acceso al Admin Dashboard

### 1. Usuario Normal
```
1. Navega a /admin o /admin/login
2. Ingresa email y contraseña
3. Sistema verifica credenciales en auth.users
4. Sistema verifica role en profiles
5. Si role !== 'admin' → Acceso denegado
6. Cierra sesión automáticamente
```

### 2. Usuario Admin
```
1. Navega a /admin o /admin/login
2. Ingresa email y contraseña
3. Sistema verifica credenciales ✅
4. Sistema verifica role = 'admin' ✅
5. Redirige a /admin (AdminDashboard)
6. Acceso completo a todas las funciones
```

### 3. Dashboard Principal
**Ruta:** `/admin`  
**Archivo:** `src/pages/AdminDashboard.tsx`

**Funcionalidades:**
- ✅ Ver todos los negocios
- ✅ CRUD completo de negocios
- ✅ Cambiar planes (free, launch, featured)
- ✅ Asignar dueños (owner_id)
- ✅ Ocultar/mostrar negocios (is_hidden)
- ✅ Gestión de leads
- ✅ Conversión de leads a negocios

---

## 🔧 Comandos Importantes

### Desarrollo
```bash
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Construir para producción
npm run preview      # Vista previa de build
```

### SQL en Supabase
1. Ir a: [Supabase Dashboard](https://supabase.com/dashboard/project/kiaualzhazhdwlojqyjq)
2. SQL Editor → New Query
3. Copiar contenido del archivo .sql
4. Ejecutar

---

## 🚨 Troubleshooting

### Error: "Acceso Denegado"
**Causa:** Usuario no tiene `role = 'admin'` en tabla `profiles`  
**Solución:** Ejecutar `promote_admin.sql` en SQL Editor

### Error: "Unable to read file implementation_plan.md.resolved"
**Causa:** Archivo de conversación anterior no existe después de reinicio  
**Solución:** Documentos antiguos no se transfieren entre sesiones

### Error: Conexión a Supabase
**Causa:** Variables de entorno no configuradas  
**Solución:** Verificar archivo `.env` con credenciales correctas

### Error: RLS Policies
**Causa:** Políticas no ejecutadas en Supabase  
**Solución:** Ejecutar `admin_crud_policies.sql` en SQL Editor

---

## 📊 Estado Actual del Proyecto

### ✅ Implementado
- Sistema de autenticación completo
- Login de super admin
- Dashboard administrativo
- CRUD de negocios
- Sistema de leads
- Sistema de reviews
- Políticas RLS configuradas
- PWA funcional

### 🔄 En Progreso
- Mejoras en filtros avanzados
- Dashboard de estadísticas
- Gestión de usuarios desde admin

### 📋 Pendiente
- Exportación de datos (CSV/Excel)
- Sistema de notificaciones
- Logs de actividad
- Moderación de reviews

---

## 🔗 Enlaces Importantes

- **Localhost Dev:** http://localhost:5173
- **Admin Login:** http://localhost:5173/admin/login
- **Admin Dashboard:** http://localhost:5173/admin
- **Supabase Project:** https://supabase.com/dashboard/project/kiaualzhazhdwlojqyjq

---

## 📝 Notas Importantes

> ⚠️ **SEGURIDAD:** Las credenciales de Supabase en `.env` son para el cliente (Anon Key). NUNCA expongas el Service Role Key en el frontend.

> 💡 **TIP:** Para crear un nuevo admin, primero el usuario debe registrarse normalmente en la app, luego ejecutar el script `promote_admin.sql` con su email.

> 🔄 **ACTUALIZACIÓN:** Después de cambios en políticas RLS, puede ser necesario cerrar sesión y volver a iniciar para que los cambios se reflejen.

---

*Última actualización: 2025-12-10*
