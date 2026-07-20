param environmentName string
param location string

var serverName = 'psql-veltrik-${environmentName}'
var databaseName = 'veltrik'

resource postgresqlServer 'Microsoft.DBforPostgreSQL/flexibleServers@2024-08-01' = {
  name: serverName
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    administratorLogin: 'veltrik_admin'
    administratorLoginPassword: guid(subscription().id, environmentName, 'postgres-admin')
    version: '15'
    storage: {
      storageSizeGB: 32
    }
    highAvailability: {
      mode: 'Disabled'
    }
    backup: {
      backupRetentionDays: 7
    }
  }
  tags: {
    'azd-env-name': environmentName
  }
}

resource postgresqlDb 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2024-08-01' = {
  parent: postgresqlServer
  name: databaseName
}

resource firewallAllowAzure 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2024-08-01' = {
  parent: postgresqlServer
  name: 'AllowAllAzure'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

output serverName string = postgresqlServer.name
output databaseName string = postgresqlDb.name
output serverFqdn string = postgresqlServer.properties.fullyQualifiedDomainName
