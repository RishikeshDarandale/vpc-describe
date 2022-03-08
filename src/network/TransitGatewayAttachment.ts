import {
  DescribeTransitGatewayVpcAttachmentsCommand,
  EC2Client,
  TransitGatewayVpcAttachment,
} from "@aws-sdk/client-ec2";
import { fromIni } from "@aws-sdk/credential-providers";

export const getTransitGatewayAttachments = async (
  region: string = "us-east-1",
  profile: string = "default",
  id: string
): Promise<TransitGatewayVpcAttachment[]> => {
  // get the client
  const client = new EC2Client({
    region,
    credentials: fromIni({ profile }),
  });
  // describe the vpc with specified id
  let transitGatewayAttachments: TransitGatewayVpcAttachment[];
  const command = new DescribeTransitGatewayVpcAttachmentsCommand({
    Filters: [{ Name: "vpc-id", Values: [id] }],
  });
  try {
    const response = await client.send(command);
    transitGatewayAttachments = response.TransitGatewayVpcAttachments;
  } catch (error) {
    const { requestId, cfId, extendedRequestId } = error.$metadata;
    throw new Error(
      `${requestId}: Error getting the transit gateway attachments of vpc ${id}`
    );
  }
  return transitGatewayAttachments;
};
