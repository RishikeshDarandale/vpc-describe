import {
  DBInstance,
  DescribeDBInstancesCommand,
  RDSClient,
} from "@aws-sdk/client-rds";
import { fromIni } from "@aws-sdk/credential-providers";

export const getRDSInstances = async (
  region: string = "us-east-1",
  profile: string = "default",
  id: string
): Promise<DBInstance[]> => {
  // get the client
  const client = new RDSClient({
    region,
    credentials: fromIni({ profile }),
  });
  let dbInstances: DBInstance[] = [];
  const command = new DescribeDBInstancesCommand({});
  try {
    const response = await client.send(command);
    response.DBInstances?.forEach((db) => {
      // db instances associated with vpc
      if (db.DBSubnetGroup?.VpcId === id) dbInstances.push(db);
    });
  } catch (error) {
    const { requestId, cfId, extendedRequestId } = error.$metadata;
    throw new Error(
      `${requestId}: Error getting the RDS instances of vpc ${id}`
    );
  }
  return dbInstances;
};
