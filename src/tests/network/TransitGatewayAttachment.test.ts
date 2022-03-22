import { mockClient } from "aws-sdk-client-mock";
import {
  DescribeTransitGatewayVpcAttachmentsCommand,
  EC2Client,
} from "@aws-sdk/client-ec2";
import { getRouteTables, RouteTable } from "../../network/RouteTable";
import { getTransitGatewayAttachments, TransitGateway } from "../../network/TransitGatewayAttachment";

// create the mock clients
const ec2ClientMock = mockClient(EC2Client);

describe("Route Table Tests", () => {
  beforeEach(() => {
    // reset mock client
    ec2ClientMock.reset();
  });

  it("should return tgw associated with passed vpc", async () => {
    ec2ClientMock.on(DescribeTransitGatewayVpcAttachmentsCommand).resolves({
      TransitGatewayVpcAttachments: [
        {
          TransitGatewayId: 'id1',
          State: 'associated',
          SubnetIds: [
            "infra1",
            "infra2"
          ],
        },
        {
          TransitGatewayId: 'id2',
          State: 'associated',
          SubnetIds: [
            "infra1",
            "infra2"
          ],
        },
        {
          TransitGatewayId: 'id3',
          State: 'associated',
          SubnetIds: [
            "infra1",
            "infra2"
          ],
        },
      ],
    });
    const tgw: TransitGateway[] = await getTransitGatewayAttachments(
      "us-east-1",
      "default",
      "vpc-12345678"
    );
    expect(tgw.length).toBe(3);
    expect(tgw[0].id).toBe("id1");
  });

  it("should not return tgw not associated with passed vpc", async () => {
    ec2ClientMock.on(DescribeTransitGatewayVpcAttachmentsCommand).resolves({
      TransitGatewayVpcAttachments: [],
    });
    const tgw: TransitGateway[] = await getTransitGatewayAttachments(
      "us-east-1",
      "default",
      "vpc-11111111"
    );
    expect(tgw.length).toBe(0);
  });

  it("should not return tgw when tgw fetch fails", async () => {
    ec2ClientMock.on(DescribeTransitGatewayVpcAttachmentsCommand).rejects({
      message: "failed",
    });
    await expect(
      getTransitGatewayAttachments("us-east-1", "default", "vpc-11111111")
    ).rejects.toThrow("Error getting the transit gateway attachments of vpc vpc-11111111");
  });
});
