import {
  DescribeLoadBalancersCommand,
  DescribeLoadBalancersCommandOutput,
  ElasticLoadBalancingV2Client,
} from '@aws-sdk/client-elastic-load-balancing-v2';
import { fromIni } from '@aws-sdk/credential-providers';

export interface LoadBalancerV2 {
  name: string;
  dnsName: string;
  type: string;
  availabilityZones: string;
}

export const getV2LoadBalancers = async (
  region: string,
  profile: string,
  id: string
): Promise<LoadBalancerV2[]> => {
  // get the client
  const client: ElasticLoadBalancingV2Client = new ElasticLoadBalancingV2Client(
    {
      region,
      credentials: fromIni({ profile }),
    }
  );
  const lbs: LoadBalancerV2[] = [];
  const command: DescribeLoadBalancersCommand =
    new DescribeLoadBalancersCommand({});
  try {
    // get all the domains
    const response: DescribeLoadBalancersCommandOutput = await client.send(
      command
    );
    response?.LoadBalancers?.forEach((lb) => {
      if (lb.VpcId === id) {
        lbs.push({
          name: lb.LoadBalancerName,
          dnsName: lb.DNSName,
          type: lb.Type?.toString(),
          availabilityZones: lb.AvailabilityZones.toString(),
        });
      }
    });
  } catch (error) {
    throw new Error(`Error getting the v2 load balancers of vpc ${id}`);
  }
  return lbs;
};
