import { mockClient } from "aws-sdk-client-mock";
import {
  DescribeElasticsearchDomainsCommand,
  ElasticsearchServiceClient,
  ListDomainNamesCommand,
} from "@aws-sdk/client-elasticsearch-service";
import { ESDomain, getOpenSearchDomains } from "../../network/OpenSearch";

// create the mock clients
const elasticsearchClientMock = mockClient(ElasticsearchServiceClient);

describe("Open search Tests", () => {
  beforeEach(() => {
    // reset mock client
    elasticsearchClientMock.reset();
  });

  it("should return elasticsearch clusters associated with passed vpc", async () => {
    setPositiveTestMockData();
    const domains: ESDomain[] = await getOpenSearchDomains(
      "us-east-1",
      "default",
      "vpc-12345678"
    );
    expect(domains.length).toBe(1);
    expect(domains[0].id).toBe("es-vpc-cluster1");
  });

  it("should not return elasticsearch clusters when no domain is associated with passed vpc", async () => {
    setNoClusterInVPCMockData();
    const domains: ESDomain[] = await getOpenSearchDomains(
      "us-east-1",
      "default",
      "vpc-11111111"
    );
    expect(domains.length).toBe(0);
  });

  it("should not return elasticsearch clusters when no domain is present", async () => {
    elasticsearchClientMock.on(ListDomainNamesCommand).resolves({
      DomainNames: [],
    });
    const domains: ESDomain[] = await getOpenSearchDomains(
      "us-east-1",
      "default",
      "vpc-11111111"
    );
    expect(domains.length).toBe(0);
  });

  it("should not return elasticsearch clusters when cluster fetch fails", async () => {
    clusterFetchFails();
    await expect(
      getOpenSearchDomains("us-east-1", "default", "vpc-11111111")
    ).rejects.toThrow("Error getting the open search domains of vpc vpc-11111111");
  });

  it("should not return elasticsearch clusters when describe cluster fails", async () => {
    clusterDescribeFails();
    await expect(
      getOpenSearchDomains("us-east-1", "default", "vpc-11111111")
    ).rejects.toThrow("Error getting the open search domains of vpc vpc-11111111");
  });
});

const setPositiveTestMockData = () => {
  elasticsearchClientMock.on(ListDomainNamesCommand).resolves({
    DomainNames: [
      {
        DomainName: "es-vpc-cluster1",
      },
      {
        DomainName: "es-cluster2",
      },
      {
        DomainName: "es-another-vpc-cluster3",
      },
    ],
  });
  elasticsearchClientMock.on(DescribeElasticsearchDomainsCommand).resolves({
    DomainStatusList: [
      {
        DomainName: "es-vpc-cluster1",
        ARN: "ARN1",
        DomainId: "es-vpc-cluster1",
        ElasticsearchClusterConfig: {},
        VPCOptions: {
          VPCId: "vpc-12345678",
        },
      },
      {
        DomainName: "es-cluster2",
        ARN: "ARN2",
        DomainId: "es-cluster2",
        ElasticsearchClusterConfig: {},
      },
      {
        DomainName: "es-another-vpc-cluster3",
        ARN: "ARN3",
        DomainId: "es-another-vpc-cluster3",
        ElasticsearchClusterConfig: {},
        VPCOptions: {
          VPCId: "vpc-87654321",
        },
      },
    ],
  });
};

const setNoClusterInVPCMockData = () => {
  elasticsearchClientMock.on(ListDomainNamesCommand).resolves({
    DomainNames: [
      {
        DomainName: "es-another-vpc-cluster1",
      },
      {
        DomainName: "es-cluster2",
      },
      {
        DomainName: "es-another-vpc-cluster3",
      },
    ],
  });
  elasticsearchClientMock.on(DescribeElasticsearchDomainsCommand).resolves({
    DomainStatusList: [
      {
        DomainName: "es-vpc-cluster1",
        ARN: "ARN1",
        DomainId: "es-vpc-cluster1",
        ElasticsearchClusterConfig: {},
        VPCOptions: {
          VPCId: "vpc-12345678",
        },
      },
      {
        DomainName: "es-cluster2",
        ARN: "ARN2",
        DomainId: "es-cluster2",
        ElasticsearchClusterConfig: {},
      },
      {
        DomainName: "es-another-vpc-cluster3",
        ARN: "ARN3",
        DomainId: "es-another-vpc-cluster3",
        ElasticsearchClusterConfig: {},
        VPCOptions: {
          VPCId: "vpc-87654321",
        },
      },
    ],
  });
};

const clusterFetchFails = () => {
  elasticsearchClientMock.on(ListDomainNamesCommand).rejects({
    message: "failed",
  });
};

const clusterDescribeFails = () => {
  elasticsearchClientMock.on(ListDomainNamesCommand).resolves({
    DomainNames: [
      {
        DomainName: "es-another-vpc-cluster1",
      },
      {
        DomainName: "es-cluster2",
      },
      {
        DomainName: "es-another-vpc-cluster3",
      },
    ],
  });
  elasticsearchClientMock.on(DescribeElasticsearchDomainsCommand).rejects({
    message: "failed",
  });
};
