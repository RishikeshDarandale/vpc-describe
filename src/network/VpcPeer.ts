import {
  DescribeVpcPeeringConnectionsCommand,
  DescribeVpcPeeringConnectionsCommandOutput,
  EC2Client,
} from "@aws-sdk/client-ec2";
import { fromIni } from "@aws-sdk/credential-providers";

export interface VpcPeer {
  id: string;
  state: string;
  requester: string;
  requesterCidr: string;
  acceptor: string;
  acceptorCidr: string;
}

export const getVpcPeerConnections = async (
  region: string,
  profile: string,
  id: string
): Promise<VpcPeer[]> => {
  // get the client
  const client: EC2Client = new EC2Client({
    region,
    credentials: fromIni({ profile }),
  });
  // describe the vpc with specified id
  let vpcPeers: VpcPeer[] = [];
  const asRequesterCommand: DescribeVpcPeeringConnectionsCommand =
    new DescribeVpcPeeringConnectionsCommand({
      Filters: [{ Name: "requester-vpc-info.vpc-id", Values: [id] }],
    });
  const asAcceptorCommand: DescribeVpcPeeringConnectionsCommand =
    new DescribeVpcPeeringConnectionsCommand({
      Filters: [{ Name: "accepter-vpc-info.vpc-id", Values: [id] }],
    });
  try {
    const requesterResponse: DescribeVpcPeeringConnectionsCommandOutput =
      await client.send(asRequesterCommand);
    requesterResponse.VpcPeeringConnections?.forEach((peer) => {
      vpcPeers.push({
        id: peer.VpcPeeringConnectionId,
        state: peer.Status?.Code,
        requester: peer.RequesterVpcInfo?.VpcId,
        requesterCidr: peer.RequesterVpcInfo?.CidrBlock,
        acceptor: peer.AccepterVpcInfo?.VpcId,
        acceptorCidr: peer.AccepterVpcInfo?.CidrBlock,
      });
    });
    const acceptorResponse: DescribeVpcPeeringConnectionsCommandOutput =
      await client.send(asAcceptorCommand);
    acceptorResponse.VpcPeeringConnections?.forEach((peer) => {
      vpcPeers.push({
        id: peer.VpcPeeringConnectionId,
        state: peer.Status?.Code,
        requester: peer.RequesterVpcInfo?.VpcId,
        requesterCidr: peer.RequesterVpcInfo?.CidrBlock,
        acceptor: peer.AccepterVpcInfo?.VpcId,
        acceptorCidr: peer.AccepterVpcInfo?.CidrBlock,
      });
    });
  } catch (error) {
    throw new Error(`Error getting the vpc peers of vpc ${id}`);
  }
  return vpcPeers;
};
