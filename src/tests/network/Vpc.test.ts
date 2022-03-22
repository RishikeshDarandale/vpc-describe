import { mockClient } from "aws-sdk-client-mock";
import {
  DescribeVpcsCommand,
  EC2Client,
} from "@aws-sdk/client-ec2";
import { getSubnets, Subnet } from "../../network/Subnet";
import { getVpc, Vpc } from "../../network/Vpc";

// create the mock clients
const ec2ClientMock = mockClient(EC2Client);

describe("VPC Tests", () => {
  beforeEach(() => {
    // reset mock client
    ec2ClientMock.reset();
  });

  it("should return selected vpc", async () => {
    ec2ClientMock.on(DescribeVpcsCommand).resolves({
      Vpcs: [
        {
          VpcId: 'vpc-12345678'
        },
        {
          VpcId: 'vpc-87654321'
        },
        {
          VpcId: 'vpc-11111111'
        },
        {
          VpcId: 'vpc-22222222'
        },
      ],
    });
    const vpc: Vpc = await getVpc(
      "us-east-1",
      "default",
      "vpc-12345678"
    );
    expect(vpc.id).toBe('vpc-12345678');
  });

  it("should not return vpc if not exists", async () => {
    ec2ClientMock.on(DescribeVpcsCommand).resolves({
      Vpcs: [],
    });
    const vpc: Vpc = await getVpc(
      "us-east-1",
      "default",
      "vpc-11111111"
    );
    expect(vpc.id).toBe(undefined);
  });

  it("should not return vpc when vpc fetch fails", async () => {
    ec2ClientMock.on(DescribeVpcsCommand).rejects({
      message: "failed",
    });
    await expect(
      getVpc("us-east-1", "default", "vpc-11111111")
    ).rejects.toThrow("Error getting the vpc");
  });
});
