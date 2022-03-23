import { mockClient } from 'aws-sdk-client-mock';
import { DescribeDBInstancesCommand, RDSClient } from '@aws-sdk/client-rds';
import { DBInstance, getRDSInstances } from '../../network/Rds';

// create the mock clients
const rdsClientMock = mockClient(RDSClient);

describe('RDS Tests', () => {
  beforeEach(() => {
    // reset mock client
    rdsClientMock.reset();
  });

  it('should return rds associated with passed vpc', async () => {
    rdsClientMock.on(DescribeDBInstancesCommand).resolves({
      DBInstances: [
        {
          DBInstanceIdentifier: 'id1',
          DBInstanceArn: 'arn1',
          DBName: 'name1',
          DBSubnetGroup: {
            VpcId: 'vpc-12345678',
          },
        },
        {
          DBInstanceIdentifier: 'id2',
          DBInstanceArn: 'arn2',
          DBName: 'name2',
          DBSubnetGroup: {
            VpcId: 'vpc-87654321',
          },
        },
        {
          DBInstanceIdentifier: 'id3',
          DBInstanceArn: 'arn3',
          DBName: 'name3',
        },
        {
          DBInstanceIdentifier: 'id4',
          DBInstanceArn: 'arn4',
          DBName: 'name4',
        },
      ],
    });
    const instances: DBInstance[] = await getRDSInstances(
      'us-east-1',
      'default',
      'vpc-12345678'
    );
    expect(instances.length).toBe(1);
    expect(instances[0].id).toBe('id1');
  });

  it('should not return rds associated with passed vpc', async () => {
    rdsClientMock.on(DescribeDBInstancesCommand).resolves({
      DBInstances: [
        {
          DBClusterIdentifier: 'id2',
          DBInstanceArn: 'arn2',
          DBName: 'name2',
          DBSubnetGroup: {
            VpcId: 'vpc-87654321',
          },
        },
        {
          DBClusterIdentifier: 'id3',
          DBInstanceArn: 'arn3',
          DBName: 'name3',
        },
        {
          DBClusterIdentifier: 'id4',
          DBInstanceArn: 'arn4',
          DBName: 'name4',
        },
      ],
    });
    const instances: DBInstance[] = await getRDSInstances(
      'us-east-1',
      'default',
      'vpc-12345678'
    );
    expect(instances.length).toBe(0);
  });
  it('should not return rds instances when rds instance fetch fails', async () => {
    rdsClientMock.on(DescribeDBInstancesCommand).rejects({
      message: 'failed',
    });
    await expect(
      getRDSInstances('us-east-1', 'default', 'vpc-11111111')
    ).rejects.toThrow('Error getting the RDS instances of vpc vpc-11111111');
  });
});
