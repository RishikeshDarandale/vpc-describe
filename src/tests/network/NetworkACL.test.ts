import { mockClient } from 'aws-sdk-client-mock';
import { DescribeNetworkAclsCommand, EC2Client } from '@aws-sdk/client-ec2';
import { getNetworkACLs, NetworkAcl } from '../../network/NetworkACL';

// create the mock clients
const ec2ClientMock = mockClient(EC2Client);

describe('Network ACL Tests', () => {
  beforeEach(() => {
    // reset mock client
    ec2ClientMock.reset();
  });

  it('should return nacl associated with passed vpc', async () => {
    ec2ClientMock.on(DescribeNetworkAclsCommand).resolves({
      NetworkAcls: [
        {
          NetworkAclId: 'default',
          Associations: [
            {
              SubnetId: 'subnet1',
            },
            {
              SubnetId: 'subnet2',
            },
          ],
        },
        {
          NetworkAclId: 'nacl1',
          Associations: [
            {
              SubnetId: 'subnet3',
            },
          ],
        },
        {
          NetworkAclId: 'nacl2',
          Associations: [
            {
              SubnetId: 'subnet4',
            },
          ],
        },
      ],
    });
    const nacls: NetworkAcl[] = await getNetworkACLs(
      'us-east-1',
      'default',
      'vpc-12345678'
    );
    expect(nacls.length).toBe(3);
    expect(nacls[0].id).toBe('default');
  });

  it('should not return nacls not associated with passed vpc', async () => {
    ec2ClientMock.on(DescribeNetworkAclsCommand).resolves({
      NetworkAcls: [],
    });
    const nacls: NetworkAcl[] = await getNetworkACLs(
      'us-east-1',
      'default',
      'vpc-11111111'
    );
    expect(nacls.length).toBe(0);
  });

  it('should not return nacl when nacl fetch fails', async () => {
    ec2ClientMock.on(DescribeNetworkAclsCommand).rejects({
      message: 'failed',
    });
    await expect(
      getNetworkACLs('us-east-1', 'default', 'vpc-11111111')
    ).rejects.toThrow('Error getting the network ACLs of vpc vpc-11111111');
  });
});
