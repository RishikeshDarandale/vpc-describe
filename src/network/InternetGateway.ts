import {
  DescribeInternetGatewaysCommand,
  EC2Client,
  InternetGateway,
} from "@aws-sdk/client-ec2";
import { fromIni } from "@aws-sdk/credential-providers";

export const getInternetGateways = async (
  region: string = "us-east-1",
  profile: string = "default",
  id: string
): Promise<InternetGateway[]> => {
  // get the client
  const client = new EC2Client({
    region,
    credentials: fromIni({ profile }),
  });
  // describe the vpc with specified id
  let internetGateways: InternetGateway[];
  const command = new DescribeInternetGatewaysCommand({
    Filters: [{ Name: "attachment.vpc-id", Values: [id] }],
  });
  try {
    const response = await client.send(command);
    internetGateways = response.InternetGateways;
  } catch (error) {
    const { requestId, cfId, extendedRequestId } = error.$metadata;
    console.error(error);
    throw new Error(
      `${requestId}: Error getting the Internet gateways of vpc ${id}`
    );
  }
  return internetGateways;
};
