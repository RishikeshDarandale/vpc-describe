import {
  DescribeSubnetsCommand,
  DescribeSubnetsCommandOutput,
  EC2Client,
} from '@aws-sdk/client-ec2';
import { fromIni } from '@aws-sdk/credential-providers';

export interface Subnet {
  id: string;
  cidr: string;
  availabilityZone: string;
}

export const getSubnets = async (
  region: string,
  profile: string,
  id: string
): Promise<Subnet[]> => {
  // get the client
  const client: EC2Client = new EC2Client({
    region,
    credentials: fromIni({ profile }),
  });
  // describe the vpc with specified id
  const subnets: Subnet[] = [];
  const command: DescribeSubnetsCommand = new DescribeSubnetsCommand({
    Filters: [{ Name: 'vpc-id', Values: [id] }],
  });
  try {
    const response: DescribeSubnetsCommandOutput = await client.send(command);
    response.Subnets?.forEach((sb) => {
      subnets.push({
        id: sb.SubnetId,
        cidr: sb.CidrBlock,
        availabilityZone: sb.AvailabilityZone,
      });
    });
  } catch (error) {
    throw new Error(`Error getting the subnets of vpc ${id}`);
  }
  return subnets;
};
