import { mockClient } from 'aws-sdk-client-mock';
import { DescribeSubnetsCommand, EC2Client } from '@aws-sdk/client-ec2';
import { getSubnets, Subnet } from '../../network/Subnet';

// create the mock clients
const ec2ClientMock = mockClient(EC2Client);

describe('Subnet Tests', () => {
  beforeEach(() => {
    // reset mock client
    ec2ClientMock.reset();
  });

  it('should return subnets associated with passed vpc', async () => {
    ec2ClientMock.on(DescribeSubnetsCommand).resolves({
      Subnets: [
        {
          SubnetId: 'subnet1',
          AvailabilityZone: '1a',
        },
        {
          SubnetId: 'subnet2',
          AvailabilityZone: '1c',
        },
        {
          SubnetId: 'subnet3',
          AvailabilityZone: '1a',
        },
        {
          SubnetId: 'subnet4',
          AvailabilityZone: '1c',
        },
      ],
    });
    const subnets: Subnet[] = await getSubnets(
      'us-east-1',
      'default',
      'vpc-12345678'
    );
    expect(subnets.length).toBe(4);
    expect(subnets[0].id).toBe('subnet1');
  });

  it('should not return subnets not associated with passed vpc', async () => {
    ec2ClientMock.on(DescribeSubnetsCommand).resolves({
      Subnets: [],
    });
    const subnets: Subnet[] = await getSubnets(
      'us-east-1',
      'default',
      'vpc-11111111'
    );
    expect(subnets.length).toBe(0);
  });

  it('should not return subnets when subnet fetch fails', async () => {
    ec2ClientMock.on(DescribeSubnetsCommand).rejects({
      message: 'failed',
    });
    await expect(
      getSubnets('us-east-1', 'default', 'vpc-11111111')
    ).rejects.toThrow('Error getting the subnets of vpc vpc-11111111');
  });
});
