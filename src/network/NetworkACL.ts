import {
  DescribeNetworkAclsCommand,
  EC2Client,
  NetworkAcl,
} from "@aws-sdk/client-ec2";
import { fromIni } from "@aws-sdk/credential-providers";

export const getNetworkACLs = async (
  region: string = "us-east-1",
  profile: string = "default",
  id: string
): Promise<NetworkAcl[]> => {
  // get the client
  const client = new EC2Client({
    region,
    credentials: fromIni({ profile }),
  });
  // describe the vpc with specified id
  let networkACLs: NetworkAcl[];
  const command = new DescribeNetworkAclsCommand({
    Filters: [{ Name: "vpc-id", Values: [id] }],
  });
  try {
    const response = await client.send(command);
    networkACLs = response.NetworkAcls;
  } catch (error) {
    const { requestId, cfId, extendedRequestId } = error.$metadata;
    throw new Error(
      `${requestId}: Error getting the network ACLs of vpc ${id}`
    );
  }
  return networkACLs;
};
