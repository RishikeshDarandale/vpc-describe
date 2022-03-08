import { DescribeSubnetsCommand, EC2Client, Subnet } from "@aws-sdk/client-ec2";
import { fromIni } from "@aws-sdk/credential-providers";

export const getSubnets = async (
  region: string = "us-east-1",
  profile: string = "default",
  id: string
): Promise<Subnet[]> => {
  // get the client
  const client = new EC2Client({
    region,
    credentials: fromIni({ profile }),
  });
  // describe the vpc with specified id
  let subnets: Subnet[];
  const command = new DescribeSubnetsCommand({
    Filters: [{ Name: "vpc-id", Values: [id] }],
  });
  try {
    const response = await client.send(command);
    subnets = response.Subnets;
  } catch (error) {
    const { requestId, cfId, extendedRequestId } = error.$metadata;
    throw new Error(`${requestId}: Error getting the subnets of vpc ${id}`);
  }
  return subnets;
};
