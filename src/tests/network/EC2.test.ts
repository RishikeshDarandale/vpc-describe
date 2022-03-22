import { mockClient } from "aws-sdk-client-mock";
import {
  DescribeInstancesCommand,
  EC2Client,
} from "@aws-sdk/client-ec2";
import { EC2Instance, getEC2s } from "../../network/EC2";

// create the mock clients
const ec2ClientMock = mockClient(EC2Client);

describe("Lambda Tests", () => {
  beforeEach(() => {
    // reset mock client
    ec2ClientMock.reset();
  });

  it("should return lambdas associated with passed vpc", async () => {
    ec2ClientMock.on(DescribeInstancesCommand).resolves({
      Reservations:[
        {
          Instances: [
            {
              InstanceId: 'i1',
            },
            {
              InstanceId: 'i2',
            },
            {
              InstanceId: 'i3',
            },
          ]
        }
      ]
    });
    const instances: EC2Instance[] = await getEC2s(
      "us-east-1",
      "default",
      "vpc-12345678"
    );
    expect(instances.length).toBe(3);
    expect(instances[0].id).toBe("i1");
  });

  it("should not return lambdas not associated with passed vpc", async () => {
    ec2ClientMock.on(DescribeInstancesCommand).resolves({
      Reservations: [
        {
          Instances: [
          ]
        }
      ],
    });
    const instances: EC2Instance[] = await getEC2s(
      "us-east-1",
      "default",
      "vpc-12345678"
    );
    expect(instances.length).toBe(0);
  });
});
