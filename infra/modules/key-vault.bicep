param environmentName string
param location string

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: 'kv-veltrik-${environmentName}'
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableSoftDelete: true
    enablePurgeProtection: true
    enableRbacAuthorization: true
  }
  tags: {
    'azd-env-name': environmentName
  }
}

output name string = keyVault.name
