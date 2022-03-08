import {
  DescribeLoadBalancersCommand,
  ElasticLoadBalancingClient,
  LoadBalancerDescription,
} from "@aws-sdk/client-elastic-load-balancing";
import { fromIni } from "@aws-sdk/credential-providers";

export const getLoadBalancers = async (
  region: string = "us-east-1",
  profile: string = "default",
  id: string
): Promise<LoadBalancerDescription[]> => {
  // get the client
  const client = new ElasticLoadBalancingClient({
    region,
    credentials: fromIni({ profile }),
  });
  let lbs: LoadBalancerDescription[] = [];
  const command = new DescribeLoadBalancersCommand({});
  try {
    // get all the domains
    const response = await client.send(command);
    response?.LoadBalancerDescriptions?.forEach((lb) => {
      if (lb.VPCId === id) {
        lbs.push(lb);
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
