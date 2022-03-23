import { mockClient } from 'aws-sdk-client-mock';
import {
  DescribeVpcPeeringConnectionsCommand,
  EC2Client,
} from '@aws-sdk/client-ec2';
import { getVpcPeerConnections, VpcPeer } from '../../network/VpcPeer';

// create the mock clients
const ec2ClientMock = mockClient(EC2Client);

describe('Subnet Tests', () => {
  beforeEach(() => {
    // reset mock client
    ec2ClientMock.reset();
  });

  it('should return vpc peers associated with passed vpc', async () => {
    ec2ClientMock
      .on(DescribeVpcPeeringConnectionsCommand, {
        Filters: [
          {
            Name: 'requester-vpc-info.vpc-id',
            Values: ['vpc-12345678'],
          },
        ],
      })
      .resolves({
        VpcPeeringConnections: [
          {
            VpcPeeringConnectionId: 'peer1',
            AccepterVpcInfo: {
              VpcId: 'vpc-acceptor1',
              CidrBlock: '10.0.0.0/24',
            },
            RequesterVpcInfo: {
              VpcId: 'vpc-12345678',
              CidrBlock: '10.1.0.0/24',
            },
          },
        ],
      })
      .on(DescribeVpcPeeringConnectionsCommand, {
        Filters: [
          {
            Name: 'accepter-vpc-info.vpc-id',
            Values: ['vpc-12345678'],
          },
        ],
      })
      .resolves({
        VpcPeeringConnections: [
          {
            VpcPeeringConnectionId: 'peer2',
            AccepterVpcInfo: {
              VpcId: 'vpc-12345678',
              CidrBlock: '10.2.0.0/24',
            },
            RequesterVpcInfo: {
              VpcId: 'vpc-requester1',
              CidrBlock: '10.3.0.0/24',
            },
          },
        ],
      });
    const peers: VpcPeer[] = await getVpcPeerConnections(
      'us-east-1',
      'default',
      'vpc-12345678'
    );
    expect(peers.length).toBe(2);
    expect(peers[0].id).toBe('peer1');
  });

  it('should not return vpc peers not associated with passed vpc', async () => {
    ec2ClientMock.on(DescribeVpcPeeringConnectionsCommand).resolves({
      VpcPeeringConnections: [],
    });
    const peers: VpcPeer[] = await getVpcPeerConnections(
      'us-east-1',
      'default',
      'vpc-11111111'
    );
    expect(peers.length).toBe(0);
  });

  it('should not return vpc peers when vpc peer fetch fails', async () => {
    ec2ClientMock.on(DescribeVpcPeeringConnectionsCommand).rejects({
      message: 'failed',
    });
    await expect(
      getVpcPeerConnections('us-east-1', 'default', 'vpc-11111111')
    ).rejects.toThrow('Error getting the vpc peers of vpc vpc-11111111');
  });
});
