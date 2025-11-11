# API-Prueba-Errores

## Despliegue en Azure

Este repositorio incluye los artefactos necesarios para desplegar la API y sus dependencias principales en Azure empleando Azure DevOps, priorizando recursos en niveles gratuitos o de bajo costo para entornos de desarrollo.

### Arquitectura propuesta

La infraestructura definida en `infra/bicep/main.bicep` provisiona los siguientes recursos administrados:

- **Azure App Service Plan** (por defecto `F1` - nivel gratuito) y **App Service** para alojar la API.
- **Azure App Service Slot** denominado `staging` para despliegues Blue/Green (opcional y solo disponible en planes Standard o superiores).
- **Azure SQL Database** (por defecto `S0`, incluido en la oferta gratuita de 12 meses para cuentas nuevas) y su servidor lógico asociado para persistencia relacional.
- **Azure Storage Account** para almacenamiento de artefactos y logs.
- Variables de configuración y connection strings necesarias para la API.

> Ajusta los parámetros del archivo Bicep según la región, SKU y dependencias específicas de la solución.

### Provisionamiento de infraestructura con Bicep

Ejecuta el siguiente comando desde Azure CLI una vez autenticado (`az login`) y posicionado en el directorio raíz del repo:

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

> Si necesitas un slot de staging, cambia el plan a `S1` o superior (los slots solo están disponibles en planes **Standard** o más altos) y ejecuta el despliegue con `--parameters appServiceSkuName=S1 appServiceSkuTier=Standard enableStagingSlot=true`.

> Para minimizar costos una vez que finalice la oferta gratuita, puedes establecer `--parameters sqlSkuName=Basic sqlSkuTier=Basic sqlSkuCapacity=5`.

### Pipeline de Azure DevOps

El pipeline definido en `azure-pipelines.yml` automatiza las etapas de construcción, pruebas, provisionamiento y despliegue continuo.

1. **Build**: Restaura dependencias .NET, compila, ejecuta pruebas con cobertura y publica el artefacto.
2. **Deploy_Infrastructure**: Despliega/actualiza la infraestructura declarativa utilizando Azure CLI y Bicep.
3. **Deploy_App**: Publica el paquete de la API en el slot `staging` y, si el entorno es `prod`, realiza un swap con producción.

#### Variables requeridas

Configura en la biblioteca de variables de Azure DevOps o en variables secretas los siguientes valores antes de ejecutar el pipeline:

| Variable               | Descripción                                                 |
|------------------------|-------------------------------------------------------------|
| `Environment`          | Entorno objetivo (`dev`, `qa`, `prod`).                     |
| `Location`             | Región de Azure (por defecto `eastus`).                     |
| `AzureServiceConnection` | Nombre del Service Connection con permisos en la suscripción. |
| `SqlAdminLogin`        | Usuario administrador de SQL Server.                        |
| `SqlAdminPassword`     | Contraseña segura (debe configurarse como secreto).         |
| `storageAccountName`   | Debe ser único a nivel global en Azure Storage.             |
| `EnableStagingSlot`    | `true` para crear y usar un slot `staging` (requiere plan Standard o superior). |

#### Integración con Azure Key Vault

Para reforzar la seguridad de secretos sensibles, configura la variable secreta `SqlAdminPassword` en la biblioteca de Azure DevOps (o pásala desde Key Vault). El pipeline valida que el valor exista antes de provisionar la infraestructura, evitando despliegues con credenciales vacías.

Si prefieres recuperar el secreto directamente desde Azure Key Vault, agrega la tarea `AzureKeyVault@2` antes de las etapas de despliegue y asigna el valor obtenido a la variable `SqlAdminPassword`.

```yaml
- task: AzureKeyVault@2
  inputs:
    azureSubscription: '$(AzureServiceConnection)'
    KeyVaultName: 'kv-api-prueba-$(Environment)'
    SecretsFilter: 'sql-admin-password'
```

Posteriormente reemplaza el uso directo de `SqlAdminPassword` por la referencia `$(sql-admin-password)`.

### Flujo de CI/CD sugerido

1. Se crea un commit en `develop` y se dispara la compilación y pruebas automáticas.
2. Al completarse correctamente, la infraestructura del entorno objetivo se alinea con el estado deseado por Bicep.
3. El paquete publicado se despliega en el slot `staging` (si está habilitado) o directamente en producción. Tras validar, puede promoverse a producción mediante swap automático cuando `Environment` = `prod` y existe un slot configurado.

### Requerimientos previos

- Azure CLI 2.47+.
- Acceso a una suscripción de Azure con permisos para crear App Service, SQL Database y Storage Account (la oferta gratuita cubre App Service F1 y una base de datos SQL S0 durante los primeros 12 meses; valida disponibilidad en tu región).
- Service Connection en Azure DevOps con permisos de Contributor sobre el Resource Group.

### Próximos pasos

- Integrar pruebas automatizadas específicas de la API.
- Configurar monitoreo con Azure Application Insights y alertas.
- Incorporar backups automatizados de la base de datos.
