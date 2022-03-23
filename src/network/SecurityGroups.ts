import {
  DescribeSecurityGroupsCommand,
  DescribeSecurityGroupsCommandOutput,
  EC2Client,
} from '@aws-sdk/client-ec2';
import { fromIni } from '@aws-sdk/credential-providers';

export interface SecurityGroup {
  id: string;
  name: string;
}

export const getSecurityGroups = async (
  region: string,
  profile: string,
  id: string
): Promise<SecurityGroup[]> => {
  // get the client
  const client: EC2Client = new EC2Client({
    region,
    credentials: fromIni({ profile }),
  });
  // describe the vpc with specified id
  const securityGroups: SecurityGroup[] = [];
  const command: DescribeSecurityGroupsCommand =
    new DescribeSecurityGroupsCommand({
      Filters: [{ Name: 'vpc-id', Values: [id] }],
    });
  try {
    const response: DescribeSecurityGroupsCommandOutput = await client.send(
      command
    );
    response.SecurityGroups?.forEach((sg) => {
      securityGroups.push({
        id: sg.GroupId,
        name: sg.GroupName,
      });
    });
  } catch (error) {
    throw new Error(`Error getting the security groups of vpc ${id}`);
  }
  return securityGroups;
};
