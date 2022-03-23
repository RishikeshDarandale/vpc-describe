import {
  DescribeVpcEndpointsCommand,
  DescribeVpcEndpointsCommandOutput,
  EC2Client,
} from '@aws-sdk/client-ec2';
import { fromIni } from '@aws-sdk/credential-providers';

export interface VpcEndpoint {
  id: string;
  type: string;
  serviceName: string;
  state: string;
  subnetIds: string;
}

export const getVpcEndpoints = async (
  region: string,
  profile: string,
  id: string
): Promise<VpcEndpoint[]> => {
  // get the client
  const client: EC2Client = new EC2Client({
    region,
    credentials: fromIni({ profile }),
  });
  // describe the vpc with specified id
  const vpcEndpoints: VpcEndpoint[] = [];
  const command: DescribeVpcEndpointsCommand = new DescribeVpcEndpointsCommand({
    Filters: [{ Name: 'vpc-id', Values: [id] }],
  });
  try {
    const response: DescribeVpcEndpointsCommandOutput = await client.send(
      command
    );
    response.VpcEndpoints?.forEach((endpoint) => {
      vpcEndpoints.push({
        id: endpoint.VpcEndpointId,
        type: endpoint.VpcEndpointType?.toString(),
        serviceName: endpoint.ServiceName,
        state: endpoint.State?.toString(),
        subnetIds: endpoint.SubnetIds?.toString(),
      });
    });
  } catch (error) {
    throw new Error(`Error getting the vpc endpoints of vpc ${id}`);
  }
  return vpcEndpoints;
};
