import { DescribeVpcsCommand, EC2Client, Vpc } from "@aws-sdk/client-ec2";
import { fromIni } from "@aws-sdk/credential-providers";

export const getVpc = async (
  region: string = "us-east-1",
  profile: string = "default",
  id: string
): Promise<Vpc> => {
  // get the client
  const client = new EC2Client({
    region,
    credentials: fromIni({ profile }),
  });
  // describe the vpc with specified id
  let vpc: Vpc;
  const command = new DescribeVpcsCommand({
    Filters: [{ Name: "vpc-id", Values: [id] }],
  });
  try {
    const response = await client.send(command);
    vpc = response.Vpcs?.[0];
  } catch (error) {
    const { requestId, cfId, extendedRequestId } = error.$metadata;
    throw new Error(`${requestId}: Error getting the vpc `);
  }
  return vpc;
};
