import {
  DescribeSecurityGroupsCommand,
  EC2Client,
  SecurityGroup,
} from "@aws-sdk/client-ec2";
import { fromIni } from "@aws-sdk/credential-providers";

export const getSecurityGroups = async (
  region: string = "us-east-1",
  profile: string = "default",
  id: string
): Promise<SecurityGroup[]> => {
  // get the client
  const client = new EC2Client({
    region,
    credentials: fromIni({ profile }),
  });
  // describe the vpc with specified id
  let securityTables: SecurityGroup[];
  const command = new DescribeSecurityGroupsCommand({
    Filters: [{ Name: "vpc-id", Values: [id] }],
  });
  try {
    const response = await client.send(command);
    securityTables = response.SecurityGroups;
  } catch (error) {
    const { requestId, cfId, extendedRequestId } = error.$metadata;
    throw new Error(
      `${requestId}: Error getting the security groups of vpc ${id}`
    );
  }
  return securityTables;
};
