@description('Nombre de la aplicación web que se desplegará en Azure App Service')
param webAppName string

@description('Nombre del entorno (dev, qa, prod)')
@allowed([
  'dev'
  'qa'
  'prod'
])
param environment string = 'dev'

@description('Ubicación de los recursos en Azure')
param location string = resourceGroup().location

@description('SKU para el App Service Plan (usar F1 para nivel gratuito)')
param appServiceSkuName string = 'F1'

@description('Nivel del App Service Plan')
param appServiceSkuTier string = 'Free'

@description('Capacidad (número de instancias) para el App Service Plan')
param appServiceSkuCapacity int = 1

@description('Indica si se debe crear un slot de staging (no disponible en F1)')
param enableStagingSlot bool = false

@description('Nombre del servidor lógico de base de datos')
param sqlServerName string

@description('Nombre de la base de datos SQL')
param sqlDatabaseName string

@description('Nombre del SKU de la base de datos SQL (por defecto S0 incluido en la oferta gratuita de 12 meses)')
param sqlSkuName string = 'S0'

@description('Tier de la base de datos SQL')
param sqlSkuTier string = 'Standard'

@description('Capacidad del SKU de la base de datos SQL')
param sqlSkuCapacity int = 10

@description('Administrador de la base de datos SQL')
param sqlAdminLogin string

@secure()
@description('Contraseña del administrador de la base de datos SQL')
param sqlAdminPassword string

@description('Versión de Node.js para el App Service')
param nodeVersion string = '~18'

@description('Nombre de la cuenta de almacenamiento para logs y contenido estático')
param storageAccountName string

var tags = {
  environment: environment
  workload: 'api-prueba-errores'
}

resource plan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: '${webAppName}-plan'
  location: location
  sku: {
    name: appServiceSkuName
    tier: appServiceSkuTier
    capacity: appServiceSkuCapacity
  }
  tags: tags
}

resource webApp 'Microsoft.Web/sites@2023-12-01' = {
  name: webAppName
  location: location
  tags: tags
  properties: {
    serverFarmId: plan.id
    siteConfig: {
      appSettings: [
        {
          name: 'ASPNETCORE_ENVIRONMENT'
          value: environment
        }
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1'
        }
        {
          name: 'AzureWebJobsStorage'
          value: storageAccount.listKeys().keys[0].value
        }
        {
          name: 'ConnectionStrings__DefaultConnection'
          value: 'Server=tcp:${sqlServer.name}.database.windows.net,1433;Initial Catalog=${sqlDatabase.name};Persist Security Info=False;User ID=${sqlAdminLogin};Password=${sqlAdminPassword};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;'
        }
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: nodeVersion
        }
      ]
      nodeVersion: nodeVersion
    }
    httpsOnly: true
  }
  identity: {
    type: 'SystemAssigned'
  }
}

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  tags: tags
  properties: {
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
  }
}

resource sqlServer 'Microsoft.Sql/servers@2023-05-01-preview' = {
  name: sqlServerName
  location: location
  tags: tags
  properties: {
    administratorLogin: sqlAdminLogin
    administratorLoginPassword: sqlAdminPassword
    publicNetworkAccess: 'Enabled'
  }
}

resource firewallRule 'Microsoft.Sql/servers/firewallRules@2023-05-01-preview' = {
  name: 'AllowAzureServices'
  parent: sqlServer
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

resource sqlDatabase 'Microsoft.Sql/servers/databases@2023-05-01-preview' = {
  name: '${sqlServer.name}/${sqlDatabaseName}'
  location: location
  sku: {
    name: sqlSkuName
    tier: sqlSkuTier
    capacity: sqlSkuCapacity
  }
  tags: tags
  properties: {
    readScale: 'Disabled'
  }
}

resource webAppSlot 'Microsoft.Web/sites/slots@2023-12-01' = if (enableStagingSlot) {
  name: '${webApp.name}/staging'
  location: location
  tags: tags
  properties: {
    serverFarmId: plan.id
    siteConfig: {
      appSettings: webApp.properties.siteConfig.appSettings
      nodeVersion: nodeVersion
    }
    httpsOnly: true
  }
  identity: {
    type: 'SystemAssigned'
  }
}

resource staticWebsite 'Microsoft.Storage/storageAccounts/staticWebsite@2023-01-01' = {
  name: '${storageAccount.name}/default'
  properties: {
    indexDocument: 'index.html'
    errorDocument404Path: 'index.html'
  }
}

resource slotSwap 'Microsoft.Web/sites/slots/slotsswap@2023-12-01' = if (enableStagingSlot && environment == 'prod') {
  name: '${webApp.name}/production'
  properties: {
    slotSwapStatus: 'Swap'
  }
  dependsOn: [
    webAppSlot
  ]
}

output webAppUrl string = webApp.properties.defaultHostName
output storageAccountId string = storageAccount.id
output sqlDatabaseId string = sqlDatabase.id
output staticWebsitePrimaryEndpoint string = storageAccount.properties.primaryEndpoints.web
