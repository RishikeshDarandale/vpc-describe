import {
  DescribeVpnGatewaysCommand,
  DescribeVpnGatewaysCommandOutput,
  EC2Client,
} from '@aws-sdk/client-ec2';
import { fromIni } from '@aws-sdk/credential-providers';

export interface VpnGateway {
  id: string;
  type: string;
  state: string;
}

export const getVPNGateways = async (
  region: string,
  profile: string,
  id: string
): Promise<VpnGateway[]> => {
  // get the client
  const client: EC2Client = new EC2Client({
    region,
    credentials: fromIni({ profile }),
  });
  // describe the vpn gateways with specified vpc id
  let vpnGateways: VpnGateway[] = [];
  const command: DescribeVpnGatewaysCommand = new DescribeVpnGatewaysCommand({
    Filters: [{ Name: 'attachment.vpc-id', Values: [id] }],
  });
  try {
    const response: DescribeVpnGatewaysCommandOutput = await client.send(
      command
    );
    response?.VpnGateways?.forEach((gateway) => {
      vpnGateways.push({
        state: gateway.State,
        id: gateway.VpnGatewayId,
        type: gateway.Type,
      });
    });
  } catch (error) {
    throw new Error(`Error getting the VPN gateways of vpc ${id}`);
  }
  return vpnGateways;
};
