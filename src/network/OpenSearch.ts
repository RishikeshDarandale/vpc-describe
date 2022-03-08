import {
  DescribeElasticsearchDomainsCommand,
  ElasticsearchDomainStatus,
  ElasticsearchServiceClient,
  ListDomainNamesCommand,
} from "@aws-sdk/client-elasticsearch-service";
import { fromIni } from "@aws-sdk/credential-providers";

export const getOpenSearchDomains = async (
  region: string = "us-east-1",
  profile: string = "default",
  id: string
): Promise<ElasticsearchDomainStatus[]> => {
  // get the client
  const client = new ElasticsearchServiceClient({
    region,
    credentials: fromIni({ profile }),
  });
  let domains: ElasticsearchDomainStatus[];
  const command = new ListDomainNamesCommand({});
  try {
    // get all the domains
    const response = await client.send(command);
    const domainNames: string[] = response?.DomainNames?.map(
      (domain) => domain.DomainName
    );
    if (domainNames?.length > 0) {
      // get status of all retrieved domain to check the vpc existence
      const describeDomainsCommand = new DescribeElasticsearchDomainsCommand({
        DomainNames: domainNames,
      });
      const describeDomainsResponse = await client.send(describeDomainsCommand);
      // filter the open search domains byy vpc id
      domains = describeDomainsResponse?.DomainStatusList.filter(
        (domain) => domain.VPCOptions?.VPCId === id
      );
    }
  } catch (error) {
    const { requestId, cfId, extendedRequestId } = error.$metadata;
    throw new Error(
      `${requestId}: Error getting the open search domains of vpc ${id}`
    );
  }
  return domains;
};
