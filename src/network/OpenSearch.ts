import {
  DescribeElasticsearchDomainsCommand,
  DescribeElasticsearchDomainsCommandOutput,
  ElasticsearchServiceClient,
  ListDomainNamesCommand,
  ListDomainNamesCommandOutput,
} from "@aws-sdk/client-elasticsearch-service";
import { fromIni } from "@aws-sdk/credential-providers";

export interface ESDomain {
  id: string;
  name: string;
  arn: string;
  subnetIds: string;
};

export const getOpenSearchDomains = async (
  region: string = "us-east-1",
  profile: string = "default",
  id: string
): Promise<ESDomain[]> => {
  // get the client
  const client: ElasticsearchServiceClient = new ElasticsearchServiceClient({
    region,
    credentials: fromIni({ profile }),
  });
  let domains: ESDomain[] = [];
  const command: ListDomainNamesCommand = new ListDomainNamesCommand({});
  try {
    // get all the domains
    const response: ListDomainNamesCommandOutput = await client.send(command);
    const domainNames: string[] = response?.DomainNames?.map(
      (domain) => domain.DomainName
    );
    if (domainNames?.length > 0) {
      // get status of all retrieved domain to check the vpc existence
      const describeDomainsCommand: DescribeElasticsearchDomainsCommand =
        new DescribeElasticsearchDomainsCommand({
          DomainNames: domainNames,
        });
      const describeDomainsResponse: DescribeElasticsearchDomainsCommandOutput =
        await client.send(describeDomainsCommand);
      // filter the open search domains byy vpc id
      describeDomainsResponse?.DomainStatusList.forEach((domain) => {
        if (domain.VPCOptions?.VPCId === id) {
          domains.push({
            id: domain.DomainId,
            name: domain.DomainName,
            arn: domain.DomainName,
            subnetIds: domain.VPCOptions?.SubnetIds?.toString(),
          });
        }
      });
    }
  } catch (error) {
    const { requestId, cfId, extendedRequestId } = error.$metadata;
    throw new Error(
      `${requestId}: Error getting the open search domains of vpc ${id}`
    );
  }
  return domains;
};
