import { mockClient } from "aws-sdk-client-mock";
import {
  DescribeLoadBalancersCommand,
  ElasticLoadBalancingClient,
} from "@aws-sdk/client-elastic-load-balancing";
import { getLoadBalancers, LoadBalancer } from "../../network/LoadBalancer";

// create the mock clients
const elbClientMock = mockClient(ElasticLoadBalancingClient);

describe("Load balancer Tests", () => {
  beforeEach(() => {
    // reset mock client
    elbClientMock.reset();
  });

  it("should return Load balancers associated with passed vpc", async () => {
    elbClientMock.on(DescribeLoadBalancersCommand).resolves({
      LoadBalancerDescriptions: [
        {
          VPCId: 'vpc-12345678',
          AvailabilityZones: ['1a', '1c'],
          Instances: [
            {
              InstanceId: 'i1'
            }
          ],
          Subnets: ['subnet1', 'subnet2'],
        },
        {
          VPCId: 'vpc-87654321',
          AvailabilityZones: ['1a', '1c'],
          Instances: [
            {
              InstanceId: 'i1'
            }
          ],
          Subnets: ['subnet1', 'subnet2'],
        },
      ]
    });
    const lbs: LoadBalancer[] = await getLoadBalancers(
      "us-east-1",
      "default",
      "vpc-12345678"
    );
    expect(lbs.length).toBe(1);
  });

  it("should not return load balancers not associated with passed vpc", async () => {
    elbClientMock.on(DescribeLoadBalancersCommand).resolves({
      LoadBalancerDescriptions: [],
    });
    const lbs: LoadBalancer[] = await getLoadBalancers(
      "us-east-1",
      "default",
      "vpc-11111111"
    );
    expect(lbs.length).toBe(0);
  });

  it("should not return load balancers when load balancer fetch fails", async () => {
    elbClientMock.on(DescribeLoadBalancersCommand).rejects({
      message: 'failed',
    });
    await expect(
      getLoadBalancers("us-east-1", "default", "vpc-11111111")
    ).rejects.toThrow(
      'Error getting the classic load balancers of vpc vpc-11111111'
    );
  });
});