import { mockClient } from "aws-sdk-client-mock";
import {
  DescribeVpcEndpointsCommand,
  EC2Client,
} from "@aws-sdk/client-ec2";
import { getVpcEndpoints, VpcEndpoint } from "../../network/VpcEndpoint";

// create the mock clients
const ec2ClientMock = mockClient(EC2Client);

describe("VPC Endpoint Tests", () => {
  beforeEach(() => {
    // reset mock client
    ec2ClientMock.reset();
  });

  it("should return vpc endpoints associated with passed vpc", async () => {
    ec2ClientMock.on(DescribeVpcEndpointsCommand).resolves({
      VpcEndpoints: [
        {
          VpcEndpointId: 'id1',
          VpcEndpointType: 'dynamodb',
          ServiceName: 'DynamoDb',
          State: 'open',
          SubnetIds: [
            'subnet1',
            'subnet2',
          ]
        }
      ],
    });
    const endpoints: VpcEndpoint[] = await getVpcEndpoints(
      "us-east-1",
      "default",
      "vpc-12345678"
    );
    expect(endpoints.length).toBe(1);
    expect(endpoints[0].id).toBe("id1");
  });

  it("should not return vpc endpoints not associated with passed vpc", async () => {
    ec2ClientMock.on(DescribeVpcEndpointsCommand).resolves({
      VpcEndpoints: [],
    });
    const endpoints: VpcEndpoint[] = await getVpcEndpoints(
      "us-east-1",
      "default",
      "vpc-11111111"
    );
    expect(endpoints.length).toBe(0);
  });

  it("should not return vpc endpoints when vpc endpoint fetch fails", async () => {
    ec2ClientMock.on(DescribeVpcEndpointsCommand).rejects({
      message: "failed",
    });
    await expect(
      getVpcEndpoints("us-east-1", "default", "vpc-11111111")
    ).rejects.toThrow("Error getting the vpc endpoints of vpc vpc-11111111");
  });
});
