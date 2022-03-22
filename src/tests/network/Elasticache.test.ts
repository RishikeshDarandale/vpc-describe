import { mockClient } from "aws-sdk-client-mock";
import {
  DescribeCacheClustersCommand,
  DescribeCacheSubnetGroupsCommand,
  ElastiCacheClient,
} from "@aws-sdk/client-elasticache";
import { CacheCluster, getCacheClusters } from "../../network/Elasticache";

const elasticacheClientMock = mockClient(ElastiCacheClient);

describe("Elasticache Cluster Tests", () => {
  beforeEach(() => {
    // reset mock client
    elasticacheClientMock.reset();
  });

  it("should return elasticache clusters associated with passed vpc", async () => {
    setPositiveTestMockData();
    const groups: CacheCluster[] = await getCacheClusters(
      "us-east-1",
      "default",
      "vpc-12345678"
    );
    expect(groups.length).toBe(1);
    expect(groups[0].id).toBe("cluster1");
  });

  it("should not return elasticache clusters not associated with passed vpc", async () => {
    setPositiveTestMockData();
    const groups: CacheCluster[] = await getCacheClusters(
      "us-east-1",
      "default",
      "vpc-11111111"
    );
    expect(groups.length).toBe(0);
  });

  it("should not return elasticache clusters when there are no clusters at all", async () => {
    elasticacheClientMock.on(DescribeCacheClustersCommand).resolves({
      CacheClusters: [
      ],
    });
    const groups: CacheCluster[] = await getCacheClusters(
      "us-east-1",
      "default",
      "vpc-11111111"
    );
    expect(groups.length).toBe(0);
  });

  it("should not return elasticache clusters when cluster fetch fails", async () => {
    clusterFetchFails();
    await expect(
      getCacheClusters("us-east-1", "default", "vpc-11111111")
    ).rejects.toThrow(
      'Error getting the Cache Clusters of vpc vpc-11111111'
    );
  });

  it("should not return elasticache clusters when subnets related to asg fetch fails", async () => {
    subnetGroupFetchFails();
    await expect(
      getCacheClusters("us-east-1", "default", "vpc-11111111")
    ).rejects.toThrow(
      'Error getting the Cache Clusters of vpc vpc-11111111'
    );
  });
});

const setPositiveTestMockData = () => {
  // set the mock data
  elasticacheClientMock.on(DescribeCacheClustersCommand).resolves({
    CacheClusters: [
      {
        CacheClusterId: 'cluster1',
        CacheNodeType: 't2.small',
        CacheSubnetGroupName: 'VpcGroup1',
      },
      {
        CacheClusterId: 'cluster2',
        CacheNodeType: 't2.small',
        CacheSubnetGroupName: 'VpcGroup2',
      },
    ],
  });
  elasticacheClientMock
    .on(DescribeCacheSubnetGroupsCommand, {
      CacheSubnetGroupName: 'VpcGroup1',
    })
    .resolves({
      CacheSubnetGroups: [
        {
          VpcId: 'vpc-12345678',
        }
      ]
    })
    .on(DescribeCacheSubnetGroupsCommand, {
      CacheSubnetGroupName: 'VpcGroup2',
    })
    .resolves({
      CacheSubnetGroups: [
        {
          VpcId: 'vpc-87654321',
        }
      ]
    });
};

const clusterFetchFails = () => {
  elasticacheClientMock.on(DescribeCacheClustersCommand).rejects({
    message: "failed",
  });
};

const subnetGroupFetchFails = () => {
  elasticacheClientMock.on(DescribeCacheClustersCommand).resolves({
    CacheClusters: [
      {
        CacheClusterId: 'cluster1',
        CacheNodeType: 't2.small',
        CacheSubnetGroupName: 'VpcGroup1',
      },
      {
        CacheClusterId: 'cluster2',
        CacheNodeType: 't2.small',
        CacheSubnetGroupName: 'VpcGroup2',
      },
    ],
  });
  elasticacheClientMock
    .on(DescribeCacheSubnetGroupsCommand).rejects({
      message: 'failed',
    })
};
