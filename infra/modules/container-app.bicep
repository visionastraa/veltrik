param environmentName string
param location string
param logAnalyticsWorkspaceId string
param logAnalyticsSharedKey string
param containerRegistryServer string
param keyVaultName string

var appName = 'ca-veltrik-${environmentName}'
var envName = 'cae-veltrik-${environmentName}'

resource containerAppsEnvironment 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: envName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalyticsWorkspaceId
        sharedKey: logAnalyticsSharedKey
      }
    }
  }
  tags: {
    'azd-env-name': environmentName
  }
}

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' existing = {
  name: keyVaultName
}

resource containerApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: appName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    environmentId: containerAppsEnvironment.id
    configuration: {
      secrets: [
        {
          name: 'database-url'
          keyVaultUrl: 'https://${keyVaultName}.vault.azure.net/secrets/database-url'
        }
        {
          name: 'nextauth-secret'
          keyVaultUrl: 'https://${keyVaultName}.vault.azure.net/secrets/nextauth-secret'
        }
        {
          name: 'razorpay-key-id'
          keyVaultUrl: 'https://${keyVaultName}.vault.azure.net/secrets/razorpay-key-id'
        }
        {
          name: 'razorpay-key-secret'
          keyVaultUrl: 'https://${keyVaultName}.vault.azure.net/secrets/razorpay-key-secret'
        }
      ]
      ingress: {
        external: true
        targetPort: 3000
        transport: 'http'
      }
    }
    template: {
      containers: [
        {
          name: 'veltrik'
          image: 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
          env: [
            { name: 'NODE_ENV', value: 'production' }
            { name: 'NEXTAUTH_URL', value: 'https://veltrik-${environmentName}.azuresites.net' }
            {
              name: 'DATABASE_URL'
              secretRef: 'database-url'
            }
            {
              name: 'NEXTAUTH_SECRET'
              secretRef: 'nextauth-secret'
            }
            {
              name: 'RAZORPAY_KEY_ID'
              secretRef: 'razorpay-key-id'
            }
            {
              name: 'RAZORPAY_KEY_SECRET'
              secretRef: 'razorpay-key-secret'
            }
          ]
          resources: {
            cpu: json('1.0')
            memory: '2Gi'
          }
          probes: [
            {
              type: 'liveness'
              httpGet: {
                path: '/health'
                port: 3000
              }
              initialDelaySeconds: 10
              periodSeconds: 30
              failureThreshold: 3
            }
            {
              type: 'readiness'
              httpGet: {
                path: '/health'
                port: 3000
              }
              initialDelaySeconds: 5
              periodSeconds: 10
              failureThreshold: 3
            }
            {
              type: 'startup'
              httpGet: {
                path: '/health'
                port: 3000
              }
              initialDelaySeconds: 0
              periodSeconds: 10
              failureThreshold: 30
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 10
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '100'
              }
            }
          }
        ]
      }
    }
  }
  tags: {
    'azd-env-name': environmentName
  }
}

resource keyVaultAccessPolicy 'Microsoft.KeyVault/vaults/accessPolicies@2023-07-01' = {
  parent: keyVault
  name: 'add'
  properties: {
    accessPolicies: [
      {
        tenantId: subscription().tenantId
        objectId: containerApp.identity.principalId
        permissions: {
          secrets: [
            'get'
          ]
        }
      }
    ]
  }
}

output systemAssignedMIPrincipalId string = containerApp.identity.principalId
output appUrl string = 'https://${containerApp.properties.configuration.ingress.fqdn}'
output name string = containerApp.name
