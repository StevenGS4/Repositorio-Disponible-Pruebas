# API-Prueba-Errores

## Arquitectura de la solución

El proyecto implementa un CRUD completo de formularios combinando FrontEnd PWA con BackEnd en Node.js y herramientas de Azure:

- **BackEnd (`backend/`)**: API REST con Express que gestiona formularios y categorías en colecciones en memoria (`Map`,
  `Set`, `Array`). La capa de servicios expone operaciones CRUD y validaciones reutilizables listas para conectarse a SAP CDS o a
  una base de datos relacional.
- **FrontEnd (`frontend/`)**: Aplicación React creada con Vite y convertida en PWA mediante `vite-plugin-pwa`. Utiliza Redux
  Toolkit, hooks (`useEffect`, `useMemo`, `useState`) y reducers para orquestar estados, disparar peticiones asíncronas y
  renderizar tablas con pestañas (TabPages) que se sincronizan con la API.
- **Infraestructura (`infra/bicep/`)**: Plantilla Bicep que provisiona Azure App Service para la API, Azure SQL Database,
  Azure Storage con sitio estático habilitado (para desplegar la build del FrontEnd) y un slot opcional de *staging*.
- **CI/CD (`azure-pipelines.yml`)**: Pipeline de Azure DevOps que construye FrontEnd + BackEnd, publica artefactos y automatiza
  el despliegue completo en Azure.

## Ejecución local

1. **API (BackEnd)**

   ```bash
   cd backend
   npm install
   npm run dev
   ```

   La API queda disponible en `http://localhost:4000/api` con los endpoints:

   - `GET /forms` (admite filtro `?category=`)
   - `GET /forms/:id`
   - `POST /forms`
   - `PUT /forms/:id`
   - `DELETE /forms/:id`
   - `GET /forms/metadata/categories`

2. **PWA (FrontEnd)**

   ```bash
   cd frontend
   cp .env.example .env.local # opcional
   npm install
   npm run dev
   ```

   Accede a `http://localhost:5173` para interactuar con la PWA. Desde las pestañas puedes filtrar por categoría, crear,
   actualizar y eliminar formularios. El estado global se sincroniza con el BackEnd mediante `createAsyncThunk` y los cambios se
   reflejan en las tablas (CRUD completo).

## Despliegue en Azure

### Provisionamiento de infraestructura con Bicep

Ejecuta los siguientes comandos autenticado en Azure CLI (`az login`) y ubicado en la raíz del repositorio:

```bash
az group create --name rg-api-prueba-errores-dev --location eastus
az deployment group create \
  --resource-group rg-api-prueba-errores-dev \
  --template-file infra/bicep/main.bicep \
  --parameters \
    webAppName=api-prueba-errores-dev \
    environment=dev \
    location=eastus \
    sqlServerName=sql-api-prueba-dev \
    sqlDatabaseName=db-api-prueba-dev \
    sqlAdminLogin=sqladminapi \
    sqlAdminPassword='ContraseñaSegura!123' \
    enableStagingSlot=false \
    storageAccountName=stapipruebadev
```

> Ajusta `appServiceSkuName`, `appServiceSkuTier` y `enableStagingSlot` si necesitas ambientes dedicados o slots adicionales. El
> parámetro `nodeVersion` define la versión de Node.js utilizada por el App Service (por defecto `~18`). La plantilla habilita el
> sitio estático (`$web`) de la cuenta de almacenamiento para hospedar el FrontEnd.

### Pipeline de Azure DevOps

El pipeline `azure-pipelines.yml` realiza tres etapas:

1. **Build**
   - Instala Node.js 18 y ejecuta `npm ci` + `npm run lint` tanto en BackEnd como en FrontEnd.
   - Empaqueta el BackEnd como `backend.zip` (preparado para App Service) y publica la carpeta `dist` del FrontEnd.
2. **Deploy_Infrastructure**
   - Valida la presencia de `SqlAdminPassword`.
   - Ejecuta la plantilla Bicep para alinear infraestructura.
3. **Deploy_App**
   - Despliega la API en App Service (slot `staging` opcional) utilizando el paquete ZIP generado.
   - Publica el FrontEnd en el contenedor `$web` de Azure Storage mediante `az storage blob upload-batch`.
   - Realiza swap `staging` → `production` si corresponde al entorno `prod`.

#### Variables requeridas

Configura en la biblioteca de Azure DevOps (o como variables secretas) las siguientes claves antes de ejecutar el pipeline:

| Variable                 | Descripción                                                                  |
|--------------------------|------------------------------------------------------------------------------|
| `Environment`            | Entorno objetivo (`dev`, `qa`, `prod`).                                      |
| `Location`               | Región de Azure (por defecto `eastus`).                                      |
| `AzureServiceConnection` | Nombre del Service Connection con permisos en la suscripción.                |
| `SqlAdminLogin`          | Usuario administrador de SQL Server.                                         |
| `SqlAdminPassword`       | Contraseña segura (configúrala como secreto).                                |
| `storageAccountName`     | Debe ser único globalmente en Azure Storage.                                 |
| `EnableStagingSlot`      | `true` para crear/usar slot `staging` (requiere plan Standard o superior).   |

#### Integración con Azure Key Vault

Para manejar secretos desde Key Vault, añade una tarea `AzureKeyVault@2` antes de los despliegues y asigna el valor recuperado
al parámetro `SqlAdminPassword`.

```yaml
- task: AzureKeyVault@2
  inputs:
    azureSubscription: '$(AzureServiceConnection)'
    KeyVaultName: 'kv-api-prueba-$(Environment)'
    SecretsFilter: 'sql-admin-password'
```

Sustituye posteriormente el uso directo de `SqlAdminPassword` por `$(sql-admin-password)`.

### Flujo de CI/CD sugerido

1. Se realiza un commit en `develop`, desencadenando la etapa de *build* que valida código con linters y genera artefactos.
2. La infraestructura del entorno objetivo se aprovisiona/actualiza con Bicep.
3. Se despliega la API en App Service y el FrontEnd en Azure Storage. En `prod`, con slot activo, se realiza swap automático tras
   la validación en `staging`.

### Requerimientos previos

- Node.js 18 y npm 9+ para ejecución local.
- Azure CLI 2.47+.
- Suscripción de Azure con permisos para App Service, Azure SQL Database y Storage Account.
- Service Connection en Azure DevOps con permisos de *Contributor* sobre el Resource Group.

### Próximos pasos sugeridos

- Añadir pruebas automatizadas (Jest/Vitest) para FrontEnd y BackEnd.
- Conectar la API a Azure SQL u orígenes SAP CDS reales.
- Integrar Application Insights y alertas.
- Automatizar respaldos para SQL Database y Storage.
