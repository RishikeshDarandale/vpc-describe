import {
  DescribeLoadBalancersCommand,
  ElasticLoadBalancingV2Client,
  LoadBalancer,
} from "@aws-sdk/client-elastic-load-balancing-v2";
import { fromIni } from "@aws-sdk/credential-providers";

export const getV2LoadBalancers = async (
  region: string = "us-east-1",
  profile: string = "default",
  id: string
): Promise<LoadBalancer[]> => {
  // get the client
  const client = new ElasticLoadBalancingV2Client({
    region,
    credentials: fromIni({ profile }),
  });
  let lbs: LoadBalancer[] = [];
  const command = new DescribeLoadBalancersCommand({});
  try {
    // get all the domains
    const response = await client.send(command);
    response?.LoadBalancers?.forEach((lb) => {
      if (lb.VpcId === id) {
        lbs.push(lb);
      }
    });
  } catch (error) {
    const { requestId, cfId, extendedRequestId } = error.$metadata;
    throw new Error(
      `${requestId}: Error getting the v2 load balancers of vpc ${id}`
    );
  }
  return lbs;
};
