import { mockClient } from 'aws-sdk-client-mock';
import {
  DescribeNetworkInterfacesCommand,
  EC2Client,
} from '@aws-sdk/client-ec2';
import {
  getNetworkInterfaces,
  NetworkInterface,
} from '../../network/NetworkInterfaces';

// create the mock clients
const ec2ClientMock = mockClient(EC2Client);

describe('Network Interface Tests', () => {
  beforeEach(() => {
    // reset mock client
    ec2ClientMock.reset();
  });

  it('should return network interfaces associated with passed vpc', async () => {
    ec2ClientMock.on(DescribeNetworkInterfacesCommand).resolves({
      NetworkInterfaces: [
        {
          NetworkInterfaceId: 'ni1',
          InterfaceType: 'lambda',
        },
        {
          NetworkInterfaceId: 'ni2',
          InterfaceType: 'nat',
        },
        {
          NetworkInterfaceId: 'ni3',
          InterfaceType: 'ec2',
        },
      ],
    });
    const nis: NetworkInterface[] = await getNetworkInterfaces(
      'us-east-1',
      'default',
      'vpc-12345678'
    );
    expect(nis.length).toBe(3);
    expect(nis[0].id).toBe('ni1');
  });

  it('should not return network interfaces not associated with passed vpc', async () => {
    ec2ClientMock.on(DescribeNetworkInterfacesCommand).resolves({
      NetworkInterfaces: [],
    });
    const nis: NetworkInterface[] = await getNetworkInterfaces(
      'us-east-1',
      'default',
      'vpc-11111111'
    );
    expect(nis.length).toBe(0);
  });

  it('should not return network interfaces when network interface fetch fails', async () => {
    ec2ClientMock.on(DescribeNetworkInterfacesCommand).rejects({
      message: 'failed',
    });
    await expect(
      getNetworkInterfaces('us-east-1', 'default', 'vpc-11111111')
    ).rejects.toThrow(
      'Error getting the network interfaces of vpc vpc-11111111'
    );
  });
});
