import { mockClient } from "aws-sdk-client-mock";
import { DescribeNatGatewaysCommand, EC2Client } from "@aws-sdk/client-ec2";
import { getNatGateways, NatGateway } from "../../network/NatGateway";

// create the mock clients
const ec2ClientMock = mockClient(EC2Client);

describe("NatGateways Tests", () => {
  beforeEach(() => {
    // reset mock client
    ec2ClientMock.reset();
  });

  it("should return nat gateways associated with passed vpc", async () => {
    ec2ClientMock.on(DescribeNatGatewaysCommand).resolves({
      NatGateways: [
        {
          NatGatewayId: "natgw1",
          State: "associated",
        },
      ],
    });
    const gw: NatGateway[] = await getNatGateways(
      "us-east-1",
      "default",
      "vpc-12345678"
    );
    expect(gw.length).toBe(1);
    expect(gw[0].id).toBe("natgw1");
  });

  it("should not return nat gateways not associated with passed vpc", async () => {
    ec2ClientMock.on(DescribeNatGatewaysCommand).resolves({
      NatGateways: [],
    });
    const gw: NatGateway[] = await getNatGateways(
      "us-east-1",
      "default",
      "vpc-11111111"
    );
    expect(gw.length).toBe(0);
  });

  it("should not return nat gateways when nat gateway fetch fails", async () => {
    ec2ClientMock.on(DescribeNatGatewaysCommand).rejects({
      message: "failed",
    });
    await expect(
      getNatGateways("us-east-1", "default", "vpc-11111111")
    ).rejects.toThrow("Error getting the NAT gateways of vpc vpc-11111111");
  });
});
