# Sprint 1 - Base de Plantas ✅

## ¿Qué hemos hecho?

### 1. Infraestructura Supabase
- ✅ Instalado `@supabase/supabase-js`
- ✅ Creado `lib/supabase.ts` (cliente)
- ✅ Creado `.env.local` con credenciales
- ✅ Creado `lib/migrations.sql` (tablas)
- ✅ Creado `lib/seed-plants.sql` (25 plantas)

### 2. Funciones de Query
- ✅ Creado `lib/supabase-queries.ts`
  - `getPlantsFromDB()` → lista todas
  - `getPlantBySlug(slug)` → detalle
  - `searchPlants(filters)` → búsqueda

### 3. Componentes actualizados
- ✅ `/app/app/plantas/page.tsx` → lee de Supabase
- ✅ `/app/app/plantas/[slug]/page.tsx` → detalle desde BD
- ✅ Eliminadas copias obsoletas en `app/` root

## Pasos siguientes

### Paso 1: Ejecutar migraciones en Supabase

**Opción A: Vía dashboard (recomendado)**
1. Ve a https://supabase.io
2. Entra a tu proyecto `verdea`
3. Click **SQL Editor**
4. Click **New query**
5. Abre `lib/migrations.sql` localmente
6. Copia TODO y pégalo en Supabase
7. Click **Run**
8. Verifica en **Table Editor** que existen:
   - `plants`
   - `plant_images`
   - `plant_variants`
   - `plant_inventory`
   - `plant_recommendation_profiles`

### Paso 2: Insertar 25 plantas

1. SQL Editor → **New query**
2. Abre `lib/seed-plants.sql` localmente
3. Copia TODO y pégalo
4. Click **Run**
5. Verifica en **Table Editor → plants** que hay 25 filas

### Paso 3: Configurar imágenes (temporal)

Las 25 plantas están sin imágenes. Por ahora:

```sql
UPDATE plants SET plant_images = ARRAY[
  'https://images.unsplash.com/photo-1611211232932-da3113c5b8a3?auto=format&fit=crop&w=800&q=80'
]
WHERE id = 'pothos-golden';
```

(Esto es fea, pero funciona para demo)

**Mejor alternativa (después):**
- Crear bucket en Storage: `plant-images`
- Subir fotos reales
- Actualizar URLs en `plant_images`

### Paso 4: Probar en local

```bash
npm run dev
```

Navega a:
- `http://localhost:3000/app/plantas` → debe cargar 25 plantas desde Supabase
- Click en una planta → debe mostrar detalle

**Si ves errores:**
- Verifica `.env.local` tiene credenciales correctas
- Verifica que las tablas existen en Supabase
- Abre DevTools (F12) → Console → verifica logs
- Recarga (F5)

### Paso 5: Reemplazar hardcoded data

Una vez que `/app/plantas` funciona:

```bash
rm data/plants.ts
# (o renómbralo a plants.ts.bak por seguridad)
```

Elimina imports de `data/plants` en cualquier otro lado que aún lo use.

## Estructura final de BD

```
plants
├── id, slug, commercial_name, scientific_name
├── description, short_description
├── price_q, cost_q
├── light_level, care_difficulty, watering_frequency_days
├── pet_friendly, smart_care_compatible
├── categories, decorative_styles, room_types
├── stock_quantity, available, featured
└── created_at, updated_at

plant_images (FK plants)
├── plant_id, image_url, alt_text, display_order

plant_variants (FK plants)
├── plant_id, size_label, height_cm, price_q, stock_quantity

plant_inventory (FK plants, plant_variants)
├── quantity_available, quantity_reserved, supplier_code

plant_recommendation_profiles (FK plants)
├── minimum_light_score, maximum_light_score
├── suitable_for_bedroom, suitable_for_office, ...
├── maintenance_score, pet_safety_score
```

## Próximo Sprint (cuando Sprint 1 esté listo)

- Flujo completo: subir foto → análisis IA → recomendaciones → guardar propuesta
- Tablas: `spaces`, `space_images`, `space_analyses`, `plant_recommendations`, `proposals`

---

**Pregunta:** ¿Ya subiste las migraciones a Supabase? Si es sí, navega a `/app/plantas` y dame feedback.
