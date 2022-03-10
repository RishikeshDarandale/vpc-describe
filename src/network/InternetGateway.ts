import {
  DescribeInternetGatewaysCommand,
  EC2Client,
} from "@aws-sdk/client-ec2";
import { fromIni } from "@aws-sdk/credential-providers";

export interface InternetGateway {
  id: string,
};

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
  let internetGateways: InternetGateway[] = [];
  const command = new DescribeInternetGatewaysCommand({
    Filters: [{ Name: "attachment.vpc-id", Values: [id] }],
  });
  try {
    const response = await client.send(command);
    response.InternetGateways?.forEach((igw) => {
      internetGateways.push({id: igw.InternetGatewayId});
    });
  } catch (error) {
    const { requestId, cfId, extendedRequestId } = error.$metadata;
    throw new Error(
      `${requestId}: Error getting the Internet gateways of vpc ${id}`
    );
  }
  return internetGateways;
};
