import {
  DescribeInternetGatewaysCommand,
  DescribeInternetGatewaysCommandOutput,
  EC2Client,
} from '@aws-sdk/client-ec2';
import { fromIni } from '@aws-sdk/credential-providers';

export interface InternetGateway {
  id: string;
}

export const getInternetGateways = async (
  region: string,
  profile: string,
  id: string
): Promise<InternetGateway[]> => {
  // get the client
  const client: EC2Client = new EC2Client({
    region,
    credentials: fromIni({ profile }),
  });
  // describe the vpc with specified id
  let internetGateways: InternetGateway[] = [];
  const command: DescribeInternetGatewaysCommand =
    new DescribeInternetGatewaysCommand({
      Filters: [{ Name: 'attachment.vpc-id', Values: [id] }],
    });
  try {
    const response: DescribeInternetGatewaysCommandOutput = await client.send(
      command
    );
    response.InternetGateways?.forEach((igw) => {
      internetGateways.push({ id: igw.InternetGatewayId });
    });
  } catch (error) {
    throw new Error(`Error getting the Internet gateways of vpc ${id}`);
  }
  return internetGateways;
};
