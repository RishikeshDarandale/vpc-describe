import {
  DescribeLoadBalancersCommand,
  DescribeLoadBalancersCommandOutput,
  ElasticLoadBalancingClient,
} from "@aws-sdk/client-elastic-load-balancing";
import { fromIni } from "@aws-sdk/credential-providers";

export interface LoadBalancer {
  name: string;
  dnsName: string;
  subnets: string;
  instances: string;
  availabilityZones: string;
};

export const getLoadBalancers = async (
  region: string = "us-east-1",
  profile: string = "default",
  id: string
): Promise<LoadBalancer[]> => {
  // get the client
  const client: ElasticLoadBalancingClient = new ElasticLoadBalancingClient({
    region,
    credentials: fromIni({ profile }),
  });
  let lbs: LoadBalancer[] = [];
  const command: DescribeLoadBalancersCommand =
    new DescribeLoadBalancersCommand({});
  try {
    // get all the domains
    const response: DescribeLoadBalancersCommandOutput = await client.send(
      command
    );
    response?.LoadBalancerDescriptions?.forEach((lb) => {
      if (lb.VPCId === id) {
        lbs.push({
          name: lb.LoadBalancerName,
          dnsName: lb.DNSName,
          availabilityZones: lb.AvailabilityZones?.toString(),
          subnets: lb.Subnets?.toString(),
          instances: lb.Instances.toString(),
        });
      }
    });
  } catch (error) {
    const { requestId, cfId, extendedRequestId } = error.$metadata;
    throw new Error(
      `${requestId}: Error getting the classic load balancers of vpc ${id}`
    );
  }
  return lbs;
};
