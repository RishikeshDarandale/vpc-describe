import {
  DescribeSecurityGroupsCommand,
  EC2Client,
} from "@aws-sdk/client-ec2";
import { fromIni } from "@aws-sdk/credential-providers";

export interface SecurityGroup {
  id: string,
  name: string,
};

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
  let securityGroups: SecurityGroup[] = [];
  const command = new DescribeSecurityGroupsCommand({
    Filters: [{ Name: "vpc-id", Values: [id] }],
  });
  try {
    const response = await client.send(command);
    response.SecurityGroups?.forEach((sg) => {
      securityGroups.push({
        id: sg.GroupId,
        name: sg.GroupName,
      });
    });
  } catch (error) {
    const { requestId, cfId, extendedRequestId } = error.$metadata;
    throw new Error(
      `${requestId}: Error getting the security groups of vpc ${id}`
    );
  }
  return securityGroups;
};
