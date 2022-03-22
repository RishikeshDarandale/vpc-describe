import {
  AutoScalingClient,
  DescribeAutoScalingGroupsCommand,
  DescribeAutoScalingGroupsCommandOutput,
} from "@aws-sdk/client-auto-scaling";
import {
  DescribeSubnetsCommand,
  DescribeSubnetsCommandOutput,
  EC2Client,
} from "@aws-sdk/client-ec2";
import { fromIni } from "@aws-sdk/credential-providers";

export interface AutoScalingGroup {
  name: string;
  arn: string;
  minSize: number;
  maxSize: number;
  desiredCapacity: number;
}

export const getAutoScalingGroups = async (
  region: string ,
  profile: string,
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
  const command: DescribeAutoScalingGroupsCommand =
    new DescribeAutoScalingGroupsCommand({});
  try {
    const response: DescribeAutoScalingGroupsCommandOutput = await client.send(
      command
    );
    await Promise.all(
      response.AutoScalingGroups.map(async (asg) => {
        if (await asgInVpc(asg.VPCZoneIdentifier, ec2client, id)) {
          asgs.push({
            name: asg.AutoScalingGroupName,
            arn: asg.AutoScalingGroupARN,
            maxSize: asg.MaxSize,
            minSize: asg.MinSize,
            desiredCapacity: asg.DesiredCapacity,
          });
        }
      })
    );
  } catch (error) {
    throw new Error(
      `Error getting the Auto scaling groups of vpc ${id}`
    );
  }
  return asgs;
};

const asgInVpc = async (
  VPCZoneIdentifier: string,
  client: EC2Client,
  id: String
): Promise<boolean> => {
  const subnets = VPCZoneIdentifier.split(",");
  let present = false;
  const command: DescribeSubnetsCommand = new DescribeSubnetsCommand({
    Filters: [{ Name: "subnet-id", Values: subnets }],
  });
  try {
    const response: DescribeSubnetsCommandOutput = await client.send(command);
    if (response?.Subnets?.[0]?.VpcId === id) {
      present = true;
    }
  } catch (error) {
    throw new Error(`Error getting the subnets of vpc ${id}`);
  }
  return present;
};
