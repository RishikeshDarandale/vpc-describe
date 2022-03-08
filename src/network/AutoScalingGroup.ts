import {
  AutoScalingClient,
  AutoScalingGroup,
  DescribeAutoScalingGroupsCommand,
} from "@aws-sdk/client-auto-scaling";
import { DescribeSubnetsCommand, EC2Client, Subnet } from "@aws-sdk/client-ec2";
import { fromIni } from "@aws-sdk/credential-providers";

export const getAutoScalingGroups = async (
  region: string = "us-east-1",
  profile: string = "default",
  id: string
): Promise<AutoScalingGroup[]> => {
  // get the client
  const client: AutoScalingClient = new AutoScalingClient({
    region,
    credentials: fromIni({ profile }),
  });
  const ec2client: EC2Client = new EC2Client({
    region,
    credentials: fromIni({ profile }),
  });
  let asgs: AutoScalingGroup[] = [];
  const command = new DescribeAutoScalingGroupsCommand({});
  try {
    const response = await client.send(command);
    await Promise.all(response?.AutoScalingGroups?.map(async (asg) => {
      if (await asgInVpc(asg.VPCZoneIdentifier, ec2client, id)) {
        asgs.push(asg);
      }
    }));
  } catch (error) {
    const { requestId, cfId, extendedRequestId } = error.$metadata;
    throw new Error(
      `${requestId}: Error getting the Auto scaling groups of vpc ${id}`
    );
  }
  return asgs;
};

const asgInVpc = async (
  VPCZoneIdentifier: string,
  client: EC2Client,
  id: String
): Promise<boolean> => {
  const subnets = VPCZoneIdentifier?.split(",");
  let present = false;
  for (const subnet of subnets) {
    const command = new DescribeSubnetsCommand({
      Filters: [{ Name: "subnet-id", Values: [subnet] }],
    });
    try {
      const response = await client.send(command);
      if (response?.Subnets?.[0]?.VpcId === id) {
        present = true;
      }
    } catch (error) {
      const { requestId, cfId, extendedRequestId } = error.$metadata;
      throw new Error(`${requestId}: Error getting the subnets of vpc ${id}`);
    }
  }
  return present;
};
