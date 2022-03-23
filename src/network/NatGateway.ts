import {
  DescribeNatGatewaysCommand,
  DescribeNatGatewaysCommandOutput,
  EC2Client,
} from '@aws-sdk/client-ec2';
import { fromIni } from '@aws-sdk/credential-providers';

export interface NatGateway {
  id: string;
  state: string;
  subnetId: string;
}

export const getNatGateways = async (
  region: string,
  profile: string,
  id: string
): Promise<NatGateway[]> => {
  // get the client
  const client: EC2Client = new EC2Client({
    region,
    credentials: fromIni({ profile }),
  });
  // describe the vpc with specified id
  const natGateways: NatGateway[] = [];
  const command: DescribeNatGatewaysCommand = new DescribeNatGatewaysCommand({
    Filter: [{ Name: 'vpc-id', Values: [id] }],
  });
  try {
    const response: DescribeNatGatewaysCommandOutput = await client.send(
      command
    );
    response.NatGateways?.forEach((ngw) => {
      natGateways.push({
        id: ngw.NatGatewayId,
        state: ngw.State?.toString(),
        subnetId: ngw.SubnetId,
      });
    });
  } catch (error) {
    throw new Error(`Error getting the NAT gateways of vpc ${id}`);
  }
  return natGateways;
};
