import { mockClient } from 'aws-sdk-client-mock';
import { DescribeRouteTablesCommand, EC2Client } from '@aws-sdk/client-ec2';
import { getRouteTables, RouteTable } from '../../network/RouteTable';

// create the mock clients
const ec2ClientMock = mockClient(EC2Client);

describe('Route Table Tests', () => {
  beforeEach(() => {
    // reset mock client
    ec2ClientMock.reset();
  });

  it('should return route tables associated with passed vpc', async () => {
    ec2ClientMock.on(DescribeRouteTablesCommand).resolves({
      RouteTables: [
        {
          RouteTableId: 'default',
          Associations: [
            {
              SubnetId: 'subnet1',
            },
          ],
        },
        {
          RouteTableId: 'routetable1',
          Associations: [
            {
              SubnetId: 'subnet2',
            },
            {
              SubnetId: 'subnet3',
            },
          ],
        },
        {
          RouteTableId: 'routetable2',
          Associations: [
            {
              SubnetId: 'subnet4',
            },
          ],
        },
      ],
    });
    const tables: RouteTable[] = await getRouteTables(
      'us-east-1',
      'default',
      'vpc-12345678'
    );
    expect(tables.length).toBe(3);
    expect(tables[0].id).toBe('default');
  });

  it('should not return route tables not associated with passed vpc', async () => {
    ec2ClientMock.on(DescribeRouteTablesCommand).resolves({
      RouteTables: [],
    });
    const tables: RouteTable[] = await getRouteTables(
      'us-east-1',
      'default',
      'vpc-11111111'
    );
    expect(tables.length).toBe(0);
  });

  it('should not return route tables when route table fetch fails', async () => {
    ec2ClientMock.on(DescribeRouteTablesCommand).rejects({
      message: 'failed',
    });
    await expect(
      getRouteTables('us-east-1', 'default', 'vpc-11111111')
    ).rejects.toThrow('Error getting the route tables of vpc vpc-11111111');
  });
});
