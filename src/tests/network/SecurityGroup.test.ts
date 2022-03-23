import { mockClient } from 'aws-sdk-client-mock';
import { DescribeSecurityGroupsCommand, EC2Client } from '@aws-sdk/client-ec2';
import { getSecurityGroups, SecurityGroup } from '../../network/SecurityGroups';

// create the mock clients
const ec2ClientMock = mockClient(EC2Client);

describe('Security Group Tests', () => {
  beforeEach(() => {
    // reset mock client
    ec2ClientMock.reset();
  });

  it('should return security groups associated with passed vpc', async () => {
    ec2ClientMock.on(DescribeSecurityGroupsCommand).resolves({
      SecurityGroups: [
        {
          GroupId: 'default',
          GroupName: 'name1',
        },
        {
          GroupId: 'sg1',
          GroupName: 'name2',
        },
        {
          GroupId: 'sg2',
          GroupName: 'name3',
        },
      ],
    });
    const groups: SecurityGroup[] = await getSecurityGroups(
      'us-east-1',
      'default',
      'vpc-12345678'
    );
    expect(groups.length).toBe(3);
    expect(groups[0].id).toBe('default');
  });

  it('should not return security groups not associated with passed vpc', async () => {
    ec2ClientMock.on(DescribeSecurityGroupsCommand).resolves({
      SecurityGroups: [],
    });
    const groups: SecurityGroup[] = await getSecurityGroups(
      'us-east-1',
      'default',
      'vpc-11111111'
    );
    expect(groups.length).toBe(0);
  });

  it('should not return security groups when security group fetch fails', async () => {
    ec2ClientMock.on(DescribeSecurityGroupsCommand).rejects({
      message: 'failed',
    });
    await expect(
      getSecurityGroups('us-east-1', 'default', 'vpc-11111111')
    ).rejects.toThrow('Error getting the security groups of vpc vpc-11111111');
  });
});
