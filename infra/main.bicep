targetScope = 'subscription'

param environmentName string
param location string = 'southindia'

var resourceGroupName = 'rg-veltrik-${environmentName}'

resource rg 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: resourceGroupName
  location: location
  tags: {
    'azd-env-name': environmentName
  }
}

module logAnalytics './modules/log-analytics.bicep' = {
  name: 'log-analytics'
  scope: rg
  params: {
    environmentName: environmentName
    location: location
  }
}

module containerRegistry './modules/container-registry.bicep' = {
  name: 'container-registry'
  scope: rg
  params: {
    environmentName: environmentName
    location: location
  }
}

module keyVault './modules/key-vault.bicep' = {
  name: 'key-vault'
  scope: rg
  params: {
    environmentName: environmentName
    location: location
  }
}

module postgresql './modules/postgresql.bicep' = {
  name: 'postgresql'
  scope: rg
  params: {
    environmentName: environmentName
    location: location
  }
}

module containerApp './modules/container-app.bicep' = {
  name: 'container-app'
  scope: rg
  params: {
    environmentName: environmentName
    location: location
    logAnalyticsWorkspaceId: logAnalytics.outputs.workspaceId
    logAnalyticsSharedKey: logAnalytics.outputs.sharedKey
    containerRegistryServer: containerRegistry.outputs.loginServer
    keyVaultName: keyVault.outputs.name
  }
}

module acrPullRole './modules/acr-pull-role.bicep' = {
  name: 'acr-pull-role'
  scope: rg
  params: {
    acrName: containerRegistry.outputs.name
    principalId: containerApp.outputs.systemAssignedMIPrincipalId
  }
}

output APP_URL string = containerApp.outputs.appUrl
output ACR_LOGIN_SERVER string = containerRegistry.outputs.loginServer
output KEY_VAULT_NAME string = keyVault.outputs.name
output POSTGRESQL_SERVER_NAME string = postgresql.outputs.serverName
output POSTGRESQL_DATABASE_NAME string = postgresql.outputs.databaseName
