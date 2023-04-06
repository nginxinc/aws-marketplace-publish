import * as core from '@actions/core'
import * as aws from '@aws-sdk/client-marketplace-catalog'

async function run(): Promise<void> {
  try {
    const client = new aws.MarketplaceCatalogClient({})

    const productID = core.getInput('product-id', {required: true})
    const version = core.getInput('version', {required: true})
    const releaseNotes = core.getInput('release-notes', {required: true})
    const registry = core.getInput('registry', {required: true})

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
              Description:
                'Best-in-class traffic management solution for services in Amazon EKS. This is the official implementation of NGINX Ingress Controller (based on NGINX Plus) from NGINX.',
              UsageInstructions:
                'This container requires Kubernetes and can be deployed to EKS. Review the installation instructions https://docs.nginx.com/nginx-ingress-controller/installation/ and utilize the deployment resources available https://github.com/nginxinc/kubernetes-ingress/tree/master/deployments  Use this image instead of building your own',
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
    core.debug(JSON.stringify(result))
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
