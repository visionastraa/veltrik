param environmentName string
param location string

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: 'log-veltrik-${environmentName}'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
  tags: {
    'azd-env-name': environmentName
  }
}

output workspaceId string = logAnalytics.properties.customerId
output sharedKey string = logAnalytics.listKeys().primarySharedKey
output name string = logAnalytics.name
