import {
  DescribeCacheClustersCommand,
  DescribeCacheClustersCommandOutput,
  DescribeCacheSubnetGroupsCommand,
  DescribeCacheSubnetGroupsCommandOutput,
  ElastiCacheClient,
} from '@aws-sdk/client-elasticache';
import { fromIni } from '@aws-sdk/credential-providers';

export interface CacheCluster {
  id: string;
  replicationGroupId?: string;
  type: string;
  engine: string;
  engineVersion: string;
  status: string;
}

export const getCacheClusters = async (
  region: string,
  profile: string,
  id: string
): Promise<CacheCluster[]> => {
  // get the client
  const client: ElastiCacheClient = new ElastiCacheClient({
    region,
    credentials: fromIni({ profile }),
  });
  const ccs: CacheCluster[] = [];
  const command: DescribeCacheClustersCommand =
    new DescribeCacheClustersCommand({});
  try {
    const response: DescribeCacheClustersCommandOutput = await client.send(
      command
    );
    await Promise.all(
      response?.CacheClusters?.map(async (cc) => {
        if (await ccSubnetInVpc(cc.CacheSubnetGroupName, client, id)) {
          ccs.push({
            id: cc.CacheClusterId,
            type: cc.CacheNodeType,
            replicationGroupId: cc.ReplicationGroupId,
            engine: cc.Engine,
            engineVersion: cc.EngineVersion,
            status: cc.CacheClusterStatus,
          });
        }
      })
    );
  } catch (error) {
    throw new Error(`Error getting the Cache Clusters of vpc ${id}`);
  }
  return ccs;
};

const ccSubnetInVpc = async (
  cacheSubnetGroupName: string,
  client: ElastiCacheClient,
  id: string
): Promise<boolean> => {
  let present = false;
  const command: DescribeCacheSubnetGroupsCommand =
    new DescribeCacheSubnetGroupsCommand({
      CacheSubnetGroupName: cacheSubnetGroupName,
    });
  try {
    const response: DescribeCacheSubnetGroupsCommandOutput = await client.send(
      command
    );
    if (response?.CacheSubnetGroups?.[0]?.VpcId === id) {
      present = true;
    }
  } catch (error) {
    throw new Error(`Error getting the cache subnets`);
  }
  return present;
};
