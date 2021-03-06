import {
  DescribeVpcsCommand,
  DescribeVpcsCommandOutput,
  EC2Client,
} from '@aws-sdk/client-ec2';
import { fromIni } from '@aws-sdk/credential-providers';

export interface Vpc {
  id: string;
  cidr: string;
  default: boolean;
  state: string;
}

export const getVpc = async (
  region = 'us-east-1',
  profile = 'default',
  id: string
): Promise<Vpc> => {
  // get the client
  const client: EC2Client = new EC2Client({
    region,
    credentials: fromIni({ profile }),
  });
  // describe the vpc with specified id
  let vpc: Vpc;
  const command: DescribeVpcsCommand = new DescribeVpcsCommand({
    Filters: [{ Name: 'vpc-id', Values: [id] }],
  });
  try {
    const response: DescribeVpcsCommandOutput = await client.send(command);
    vpc = {
      id: response.Vpcs?.[0]?.VpcId,
      cidr: response.Vpcs?.[0]?.CidrBlock,
      default: response.Vpcs?.[0]?.IsDefault,
      state: response.Vpcs?.[0]?.State?.toString(),
    };
  } catch (error) {
    throw new Error(`Error getting the vpc`);
  }
  return vpc;
};
