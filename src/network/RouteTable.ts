import {
  DescribeRouteTablesCommand,
  DescribeRouteTablesCommandOutput,
  EC2Client,
} from '@aws-sdk/client-ec2';
import { fromIni } from '@aws-sdk/credential-providers';

export interface RouteTable {
  id: string;
  subnetIds: string;
}

export const getRouteTables = async (
  region: string,
  profile: string,
  id: string
): Promise<RouteTable[]> => {
  // get the client
  const client: EC2Client = new EC2Client({
    region,
    credentials: fromIni({ profile }),
  });
  // describe the vpc with specified id
  let routeTables: RouteTable[] = [];
  const command: DescribeRouteTablesCommand = new DescribeRouteTablesCommand({
    Filters: [{ Name: 'vpc-id', Values: [id] }],
  });
  try {
    const response: DescribeRouteTablesCommandOutput = await client.send(
      command
    );
    response.RouteTables?.forEach((rt) => {
      routeTables.push({
        id: rt.RouteTableId,
        subnetIds: rt.Associations?.map((as) => as.SubnetId).join(','),
      });
    });
  } catch (error) {
    throw new Error(`Error getting the route tables of vpc ${id}`);
  }
  return routeTables;
};
