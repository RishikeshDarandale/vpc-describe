import {
  EC2Client,
  paginateDescribeInstances,
} from "@aws-sdk/client-ec2";
import { fromIni } from "@aws-sdk/credential-providers";

export interface EC2Instance {
  id: string,
  privateDnsName: string,
  privateIpAddress: string,
  subnetId: string,
  launchTime: Date,
};

export const getEC2s = async (
  region: string = "us-east-1",
  profile: string = "default",
  id: string
): Promise<EC2Instance[]> => {
  // get the client
  const client = new EC2Client({
    region,
    credentials: fromIni({ profile }),
  });
  const paginator = paginateDescribeInstances(
    {
      client,
      pageSize: 25,
    },
    {
      Filters: [{ Name: "vpc-id", Values: [id] }],
    }
  );

  const ec2s: EC2Instance[] = [];
  for await (const page of paginator) {
    // page contains a single paginated output.
    page.Reservations.forEach((reservation) => {
      // get the instances from reservation
      reservation.Instances?.forEach((instance) => {
        ec2s.push({
          id: instance.InstanceId,
          privateDnsName: instance.PrivateDnsName,
          privateIpAddress: instance.PrivateIpAddress,
          subnetId: instance.SubnetId,
          launchTime: instance.LaunchTime,
        });
      })
    });
  }
  return ec2s;
};
