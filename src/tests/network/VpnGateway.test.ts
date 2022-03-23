import { mockClient } from 'aws-sdk-client-mock';
import { DescribeVpnGatewaysCommand, EC2Client } from '@aws-sdk/client-ec2';
import { getVPNGateways, VpnGateway } from '../../network/VpnGateway';
// create the mock clients
const ec2ClientMock = mockClient(EC2Client);

describe('VPN Gateway Tests', () => {
  beforeEach(() => {
    // reset mock client
    ec2ClientMock.reset();
  });

  it('should return vpn gateways associated with passed vpc', async () => {
    ec2ClientMock.on(DescribeVpnGatewaysCommand).resolves({
      VpnGateways: [
        {
          VpnGatewayId: 'id1',
        },
      ],
    });
    const gw: VpnGateway[] = await getVPNGateways(
      'us-east-1',
      'default',
      'vpc-12345678'
    );
    expect(gw.length).toBe(1);
    expect(gw[0].id).toBe('id1');
  });

  it('should not return vpn gateways not associated with passed vpc', async () => {
    ec2ClientMock.on(DescribeVpnGatewaysCommand).resolves({
      VpnGateways: [],
    });
    const gw: VpnGateway[] = await getVPNGateways(
      'us-east-1',
      'default',
      'vpc-11111111'
    );
    expect(gw.length).toBe(0);
  });

  it('should not return vpn gateways when vpn gateway fetch fails', async () => {
    ec2ClientMock.on(DescribeVpnGatewaysCommand).rejects({
      message: 'failed',
    });
    await expect(
      getVPNGateways('us-east-1', 'default', 'vpc-11111111')
    ).rejects.toThrow('Error getting the VPN gateways of vpc vpc-11111111');
  });
});
