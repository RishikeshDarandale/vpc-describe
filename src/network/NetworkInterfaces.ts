import {
  DescribeNetworkInterfacesCommand,
  DescribeNetworkInterfacesCommandOutput,
  EC2Client,
} from '@aws-sdk/client-ec2';
import { fromIni } from '@aws-sdk/credential-providers';

export interface NetworkInterface {
  id: string;
  type: string;
  subnetId: string;
}

export const getNetworkInterfaces = async (
  region: string,
  profile: string,
  id: string
): Promise<NetworkInterface[]> => {
  // get the client
  const client: EC2Client = new EC2Client({
    region,
    credentials: fromIni({ profile }),
  });
  // describe the vpc with specified id
  let networkInterfaces: NetworkInterface[] = [];
  const command: DescribeNetworkInterfacesCommand =
    new DescribeNetworkInterfacesCommand({
      Filters: [{ Name: 'vpc-id', Values: [id] }],
    });
  try {
    const response: DescribeNetworkInterfacesCommandOutput = await client.send(
      command
    );
    response.NetworkInterfaces?.forEach((ni) => {
      networkInterfaces.push({
        id: ni.NetworkInterfaceId,
        type: ni.InterfaceType?.toString(),
        subnetId: ni.SubnetId,
      });
    });
  } catch (error) {
    throw new Error(`Error getting the network interfaces of vpc ${id}`);
  }
  return networkInterfaces;
};
