import {
  CacheCluster,
  DescribeCacheClustersCommand,
  DescribeCacheSubnetGroupsCommand,
  ElastiCacheClient,
} from "@aws-sdk/client-elasticache";
import { fromIni } from "@aws-sdk/credential-providers";

export const getCacheClusters = async (
  region: string = "us-east-1",
  profile: string = "default",
  id: string
): Promise<CacheCluster[]> => {
  // get the client
  const client = new ElastiCacheClient({
    region,
    credentials: fromIni({ profile }),
  });
  let ccs: CacheCluster[] = [];
  const command = new DescribeCacheClustersCommand({});
  try {
    const response = await client.send(command);
    await Promise.all(
      response?.CacheClusters?.map(async (cc) => {
        if (await ccSubnetInVpc(cc.CacheSubnetGroupName, client, id)) {
          ccs.push(cc);
        }
      })
    );
  } catch (error) {
    const { requestId, cfId, extendedRequestId } = error.$metadata;
    throw new Error(
      `${requestId}: Error getting the Cache Clusters of vpc ${id}`
    );
  }
  return ccs;
};

const ccSubnetInVpc = async (
  cacheSubnetGroupName: string,
  client: ElastiCacheClient,
  id: String
): Promise<boolean> => {
  let present = false;
  const command = new DescribeCacheSubnetGroupsCommand({
    CacheSubnetGroupName: cacheSubnetGroupName,
  });
  try {
    const response = await client.send(command);
    if (response?.CacheSubnetGroups?.[0]?.VpcId === id) {
      present = true;
    }
  } catch (error) {
    const { requestId, cfId, extendedRequestId } = error.$metadata;
    throw new Error(`${requestId}: Error getting the cache subnets`);
  }
  return present;
};
