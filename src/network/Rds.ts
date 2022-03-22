import {
  DescribeDBInstancesCommand,
  DescribeDBInstancesCommandOutput,
  RDSClient,
} from "@aws-sdk/client-rds";
import { fromIni } from "@aws-sdk/credential-providers";

export interface DBInstance {
  id: string;
  name: string;
  arn: string;
  class: string;
  engine: string;
  status: string;
};

export const getRDSInstances = async (
  region: string,
  profile: string,
  id: string
): Promise<DBInstance[]> => {
  // get the client
  const client: RDSClient = new RDSClient({
    region,
    credentials: fromIni({ profile }),
  });
  let dbInstances: DBInstance[] = [];
  const command: DescribeDBInstancesCommand = new DescribeDBInstancesCommand(
    {}
  );
  try {
    const response: DescribeDBInstancesCommandOutput = await client.send(
      command
    );
    response.DBInstances?.forEach((db) => {
      // db instances associated with vpc
      if (db.DBSubnetGroup?.VpcId === id)
        dbInstances.push({
          id: db.DBInstanceIdentifier,
          name: db.DBName,
          arn: db.DBInstanceArn,
          class: db.DBInstanceClass,
          engine: db.Engine,
          status: db.DBInstanceStatus?.toString(),
        });
    });
  } catch (error) {
    throw new Error(
      `Error getting the RDS instances of vpc ${id}`
    );
  }
  return dbInstances;
};
