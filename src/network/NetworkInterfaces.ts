import {
    DescribeNetworkInterfacesCommand,
    EC2Client,
    NetworkInterface,
  } from "@aws-sdk/client-ec2";
  import { fromIni } from "@aws-sdk/credential-providers";
  
  export const getNetworkInterfaces = async (
    region: string = "us-east-1",
    profile: string = "default",
    id: string
  ): Promise<NetworkInterface[]> => {
    // get the client
    const client = new EC2Client({
      region,
      credentials: fromIni({ profile }),
    });
    // describe the vpc with specified id
    let networkInterfaces: NetworkInterface[];
    const command = new DescribeNetworkInterfacesCommand({
      Filters: [{ Name: "vpc-id", Values: [id] }],
    });
    try {
      const response = await client.send(command);
      networkInterfaces = response.NetworkInterfaces;
    } catch (error) {
      const { requestId, cfId, extendedRequestId } = error.$metadata;
      console.error(error);
      throw new Error(
        `${requestId}: Error getting the network interfaces of vpc ${id}`
      );
    }
    return networkInterfaces;
  };