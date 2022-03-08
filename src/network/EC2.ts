import {
  EC2Client,
  Instance,
  paginateDescribeInstances,
  Reservation,
} from "@aws-sdk/client-ec2";
import { fromIni } from "@aws-sdk/credential-providers";

export const getEC2s = async (
  region: string = "us-east-1",
  profile: string = "default",
  id: string
): Promise<Instance[]> => {
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

  const ec2s: Instance[] = [];
  for await (const page of paginator) {
    // page contains a single paginated output.
    page.Reservations.forEach((reservation) => {
      // get the instances from reservation
      ec2s.push(...reservation.Instances)
    });
  }
  return ec2s;
};
