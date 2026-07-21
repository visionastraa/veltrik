param environmentName string
param location string

var registryName = replace('crveltrik${environmentName}', '-', '')

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: registryName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: false
  }
  tags: {
    'azd-env-name': environmentName
  }
}

output loginServer string = containerRegistry.properties.loginServer
output name string = containerRegistry.name
