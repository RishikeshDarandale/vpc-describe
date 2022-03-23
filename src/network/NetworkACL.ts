import {
  DescribeNetworkAclsCommand,
  DescribeNetworkAclsCommandOutput,
  EC2Client,
} from '@aws-sdk/client-ec2';
import { fromIni } from '@aws-sdk/credential-providers';

export interface NetworkAcl {
  id: string;
  default: boolean;
  subnetIds: string;
}

export const getNetworkACLs = async (
  region: string,
  profile: string,
  id: string
): Promise<NetworkAcl[]> => {
  // get the client
  const client: EC2Client = new EC2Client({
    region,
    credentials: fromIni({ profile }),
  });
  // describe the vpc with specified id
  const networkACLs: NetworkAcl[] = [];
  const command: DescribeNetworkAclsCommand = new DescribeNetworkAclsCommand({
    Filters: [{ Name: 'vpc-id', Values: [id] }],
  });
  try {
    const response: DescribeNetworkAclsCommandOutput = await client.send(
      command
    );
    response.NetworkAcls?.forEach((nacl) => {
      networkACLs.push({
        id: nacl.NetworkAclId,
        default: nacl.IsDefault,
        subnetIds: nacl.Associations?.map(
          (association) => association.SubnetId
        ).join(','),
      });
    });
  } catch (error) {
    throw new Error(`Error getting the network ACLs of vpc ${id}`);
  }
  return networkACLs;
};
