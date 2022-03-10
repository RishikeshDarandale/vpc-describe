import { DescribeSubnetsCommand, EC2Client } from "@aws-sdk/client-ec2";
import {
  DescribeServicesCommand,
  ECSClient,
  ListClustersCommand,
  ListServicesCommand,
} from "@aws-sdk/client-ecs";
import { fromIni } from "@aws-sdk/credential-providers";

export interface EcsService {
  cluster: string;
  service: string;
  launchType: string;
}

export const getEcsServices = async (
  region: string = "us-east-1",
  profile: string = "default",
  id: string
): Promise<EcsService[]> => {
  // get the client
  const client: ECSClient = new ECSClient({
    region,
    credentials: fromIni({ profile }),
  });
  const ec2client: EC2Client = new EC2Client({
    region,
    credentials: fromIni({ profile }),
  });
  const command = new ListClustersCommand({});
  const ecsServices: EcsService[] = [];
  try {
    // get all the clusters
    const clusters = await client.send(command);
    for (const cluster of clusters?.clusterArns) {
      const listEcsServicesCommand = new ListServicesCommand({
        cluster: cluster?.split("/")[1],
      });
      const servicesList = await client.send(listEcsServicesCommand);
      if (servicesList?.serviceArns?.length > 0) {
        // get the services running in a cluster
        const describeServiceCommand = new DescribeServicesCommand({
          services: servicesList?.serviceArns?.map(
            (serviceARN) => serviceARN.split("/")[2]
          ),
          cluster: cluster?.split("/")[1],
        });
        const services = await client.send(describeServiceCommand);
        for (const service of services?.services) {
          if (
            await serviceInVpc(
              service.networkConfiguration.awsvpcConfiguration.subnets,
              ec2client,
              id
            )
          ) {
            ecsServices.push({
              service: service.serviceName,
              cluster: service.clusterArn?.split("/")[1],
              launchType: service.launchType,
            });
          }
        }
      }
    }
  } catch (error) {
    const { requestId, cfId, extendedRequestId } = error.$metadata;
    throw new Error(
      `${requestId}: Error getting the ECS services of vpc ${id}`
    );
  }
  return ecsServices;
};

const serviceInVpc = async (
  subnets: string[],
  client: EC2Client,
  id: String
): Promise<boolean> => {
  let present = false;
  const command = new DescribeSubnetsCommand({
    Filters: [{ Name: "subnet-id", Values: subnets }],
  });
  try {
    const response = await client.send(command);
    if (response?.Subnets?.[0]?.VpcId === id) {
      present = true;
    }
  } catch (error) {
    const { requestId, cfId, extendedRequestId } = error.$metadata;
    throw new Error(`${requestId}: Error getting the subnets of vpc ${id}`);
  }
  return present;
};
