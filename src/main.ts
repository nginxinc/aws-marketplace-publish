import * as core from '@actions/core'
import * as aws from '@aws-sdk/client-marketplace-catalog'

async function run(): Promise<void> {
  try {
    const client = new aws.MarketplaceCatalogClient({region: 'us-east-1'})

    const productID = core.getInput('product-id', {required: true})
    core.setSecret(productID)

    const version = core.getInput('version', {required: true})
    const registry = core.getInput('registry', {required: true})

    const releaseNotes = core.getInput('release-notes')
    const description = core.getInput('description')
    const usageInstructions = core.getInput('usage-instructions')

    const details = {
      Version: {
        VersionTitle: version,
        ReleaseNotes: releaseNotes,
      },
      DeliveryOptions: [
        {
          DeliveryOptionTitle: 'EKSDelivery',
          Details: {
            EcrDeliveryOptionDetails: {
              DeploymentResources: [],
              ContainerImages: [registry],
              CompatibleServices: ['EKS'],
              Description: description,
              UsageInstructions: usageInstructions,
            },
          },
        },
      ],
    }

    const params: aws.StartChangeSetCommandInput = {
      Catalog: 'AWSMarketplace',
      ChangeSet: [
        {
          ChangeType: 'AddDeliveryOptions',
          Entity: {
            Identifier: productID,
            Type: 'ContainerProduct@1.0',
          },
          Details: JSON.stringify(details),
        },
      ],
    }

    const result = await client.send(new aws.StartChangeSetCommand(params))
    core.info(JSON.stringify(result, null, 2))

    if (result.$metadata.httpStatusCode?.toString() !== '200') {
      core.setFailed(`Failed to start change set: ${result.$metadata.httpStatusCode}`)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
