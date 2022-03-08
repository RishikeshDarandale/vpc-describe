import {
  DescribeNatGatewaysCommand,
  EC2Client,
  NatGateway,
} from "@aws-sdk/client-ec2";
import { fromIni } from "@aws-sdk/credential-providers";

export const getNatGateways = async (
  region: string = "us-east-1",
  profile: string = "default",
  id: string
): Promise<NatGateway[]> => {
  // get the client
  const client = new EC2Client({
    region,
    credentials: fromIni({ profile }),
  });
  // describe the vpc with specified id
  let natGateways: NatGateway[];
  const command = new DescribeNatGatewaysCommand({
    Filter: [{ Name: "vpc-id", Values: [id] }],
  });
  try {
    const response = await client.send(command);
    natGateways = response.NatGateways;
  } catch (error) {
    const { requestId, cfId, extendedRequestId } = error.$metadata;
    throw new Error(
      `${requestId}: Error getting the NAT gateways of vpc ${id}`
    );
  }
  return natGateways;
};
