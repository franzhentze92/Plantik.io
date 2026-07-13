# Setup Supabase - Sprint 1

## Paso 1: Crear proyecto Supabase

1. Ve a https://supabase.com
2. Sign in o crea cuenta (gratuita)
3. Click en **New project**
4. Configura:
   - **Name**: `verdea` (o lo que prefieras)
   - **Database Password**: Genera una fuerte (guárdala)
   - **Region**: Elige la más cercana (p. ej. `us-east-1` para América)
5. Click **Create new project**
6. Espera a que se inicialice (2-3 min)

## Paso 2: Obtener credenciales

Una vez dentro del proyecto:

1. Click en **Settings** (abajo a la izquierda)
2. Click en **API**
3. Copia:
   - **Project URL** (p. ej. `https://xxxxx.supabase.co`)
   - **anon public** (bajo "Project API keys")
4. NO copies el `service_role` key (eso va en backend seguro después)

## Paso 3: Configurar .env.local

En la raíz del proyecto (`/verdea/.env.local`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Reemplaza con TUS valores.

## Paso 4: Crear tablas

En Supabase Dashboard:

1. Click en **SQL Editor** (izquierda)
2. Click en **New query**
3. Copia TODO el contenido de `lib/migrations.sql` y pégalo aquí
4. Click en **Run** (botón azul)
5. Verifica en **Table Editor** que se crearon las tablas:
   - `plants`
   - `plant_images`
   - `plant_variants`
   - `plant_inventory`
   - `plant_recommendation_profiles`

## Paso 5: Insertar 25 plantas

1. **SQL Editor** → **New query**
2. Copia TODO de `lib/seed-plants.sql`
3. Click **Run**
4. Verifica en **Table Editor → plants** que ves 25 filas

## Paso 6: Verificar en la app

```bash
npm run dev
```

La app debería estar en http://localhost:3000 (o el puerto que Next.js asigne).

Navega a `/app/plantas` y debería:
- ✅ Cargar 25 plantas desde Supabase
- ✅ Mostrar nombres, descripciones, precios
- ✅ Permitir click en cada planta para ver detalle

**Si ves errores en consola:**
- Verifica que `.env.local` tiene las credenciales correctas
- Verifica que las tablas existen en Supabase (SQL Editor)
- Recarga la página (F5)

## Paso 7: Subir imágenes (opcional por ahora)

Las plantas están sin imágenes reales. Puedes:

**A) Usar URLs de Unsplash temporales** (lo que está hardcodeado ahora)
```
→ Funciona para demo, pero no es ideal

**B) Subir a Supabase Storage**
1. Click en **Storage** (izquierda)
2. Click **Create new bucket** → `plant-images`
3. Sube .jpg de cada planta
4. Actualiza `plant_images` table con URLs públicas de Storage

**C) Por ahora, saltate esto**
→ Continuamos con URLs de placeholder reales en la proxima iteración

## Siguiente: Conectar /app/plantas a Supabase

Una vez todo arriba esté listo:
- Reemplazar `data/plants.ts` por llamadas a `supabase-queries.ts`
- Actualizar componentes para leer de Supabase
- Eliminar hardcoded data

¿Necesitas ayuda en algún paso?
