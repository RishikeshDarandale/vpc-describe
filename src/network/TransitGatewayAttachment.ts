import {
  DescribeTransitGatewayVpcAttachmentsCommand,
  DescribeTransitGatewayVpcAttachmentsCommandOutput,
  EC2Client,
} from "@aws-sdk/client-ec2";
import { fromIni } from "@aws-sdk/credential-providers";

export interface TransitGateway {
  id: string;
  state: string;
  subnetIds: string;
};

export const getTransitGatewayAttachments = async (
  region: string = "us-east-1",
  profile: string = "default",
  id: string
): Promise<TransitGateway[]> => {
  // get the client
  const client: EC2Client = new EC2Client({
    region,
    credentials: fromIni({ profile }),
  });
  // describe the vpc with specified id
  let transitGatewayAttachments: TransitGateway[] = [];
  const command: DescribeTransitGatewayVpcAttachmentsCommand =
    new DescribeTransitGatewayVpcAttachmentsCommand({
      Filters: [{ Name: "vpc-id", Values: [id] }],
    });
  try {
    const response: DescribeTransitGatewayVpcAttachmentsCommandOutput =
      await client.send(command);
    response.TransitGatewayVpcAttachments?.forEach((tgw) => {
      transitGatewayAttachments.push({
        id: tgw.TransitGatewayId,
        state: tgw.State,
        subnetIds: tgw.SubnetIds?.toString(),
      });
    });
  } catch (error) {
    const { requestId, cfId, extendedRequestId } = error.$metadata;
    throw new Error(
      `${requestId}: Error getting the transit gateway attachments of vpc ${id}`
    );
  }
  return transitGatewayAttachments;
};
