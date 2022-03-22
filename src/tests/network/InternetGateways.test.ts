import { mockClient } from "aws-sdk-client-mock";
import {
    DescribeInternetGatewaysCommand,
    EC2Client,
  } from "@aws-sdk/client-ec2";
import { getInternetGateways, InternetGateway } from "../../network/InternetGateway";

// create the mock clients
const ec2ClientMock = mockClient(EC2Client);

describe("Internet Gateways Tests", () => {
  beforeEach(() => {
    // reset mock client
    ec2ClientMock.reset();
  });

  it("should return internet gateways associated with passed vpc", async () => {
    ec2ClientMock.on(DescribeInternetGatewaysCommand).resolves({
      InternetGateways: [
        {
          InternetGatewayId: 'igw1'
        }
      ]
    });
    const igw: InternetGateway[] = await getInternetGateways(
      "us-east-1",
      "default",
      "vpc-12345678"
    );
    expect(igw.length).toBe(1);
    expect(igw[0].id).toBe("igw1");
  });

  it("should not return internet gateways not associated with passed vpc", async () => {
    ec2ClientMock.on(DescribeInternetGatewaysCommand).resolves({
      InternetGateways: [],
    });
    const igw: InternetGateway[] = await getInternetGateways(
      "us-east-1",
      "default",
      "vpc-11111111"
    );
    expect(igw.length).toBe(0);
  });

  it("should not return internet gateways when internet gateway fetch fails", async () => {
    ec2ClientMock.on(DescribeInternetGatewaysCommand).rejects({
      message: 'failed',
    });
    await expect(
      getInternetGateways("us-east-1", "default", "vpc-11111111")
    ).rejects.toThrow(
      'Error getting the Internet gateways of vpc vpc-11111111'
    );
  });

});