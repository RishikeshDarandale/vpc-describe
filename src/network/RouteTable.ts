import {
  DescribeRouteTablesCommand,
  EC2Client,
  RouteTable,
} from "@aws-sdk/client-ec2";
import { fromIni } from "@aws-sdk/credential-providers";

export const getRouteTables = async (
  region: string = "us-east-1",
  profile: string = "default",
  id: string
): Promise<RouteTable[]> => {
  // get the client
  const client = new EC2Client({
    region,
    credentials: fromIni({ profile }),
  });
  // describe the vpc with specified id
  let routeTables: RouteTable[];
  const command = new DescribeRouteTablesCommand({
    Filters: [{ Name: "vpc-id", Values: [id] }],
  });
  try {
    const response = await client.send(command);
    routeTables = response.RouteTables;
  } catch (error) {
    const { requestId, cfId, extendedRequestId } = error.$metadata;
    throw new Error(
      `${requestId}: Error getting the route tables of vpc ${id}`
    );
  }
  return routeTables;
};
