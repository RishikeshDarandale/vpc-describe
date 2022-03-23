import { mockClient } from 'aws-sdk-client-mock';
import {
  AutoScalingClient,
  DescribeAutoScalingGroupsCommand,
} from '@aws-sdk/client-auto-scaling';
import { DescribeSubnetsCommand, EC2Client } from '@aws-sdk/client-ec2';
import {
  AutoScalingGroup,
  getAutoScalingGroups,
} from '../../network/AutoScalingGroup';

// create the mock clients
const ec2ClientMock = mockClient(EC2Client);
const autoScalingClientMock = mockClient(AutoScalingClient);

describe('Auto scaling group Tests', () => {
  beforeEach(() => {
    // reset mock client
    ec2ClientMock.reset();
    autoScalingClientMock.reset();
  });

  it('should return auto scaling groups associated with passed vpc', async () => {
    setPositiveTestMockData();
    const groups: AutoScalingGroup[] = await getAutoScalingGroups(
      'us-east-1',
      'default',
      'vpc-12345678'
    );
    expect(groups.length).toBe(1);
    expect(groups[0].name).toBe('testGroupInVpc');
  });

  it('should not return auto scaling groups not associated with passed vpc', async () => {
    setPositiveTestMockData();
    const groups: AutoScalingGroup[] = await getAutoScalingGroups(
      'us-east-1',
      'default',
      'vpc-11111111'
    );
    expect(groups.length).toBe(0);
  });

  it('should not return auto scaling groups when there are no ASGs at all', async () => {
    autoScalingClientMock.on(DescribeAutoScalingGroupsCommand).resolves({
      AutoScalingGroups: [],
    });
    const groups: AutoScalingGroup[] = await getAutoScalingGroups(
      'us-east-1',
      'default',
      'vpc-11111111'
    );
    expect(groups.length).toBe(0);
  });

  it('should not return auto scaling groups when autoscaling group fetch fails', async () => {
    autoScalingGroupFetchFails();
    await expect(
      getAutoScalingGroups('us-east-1', 'default', 'vpc-11111111')
    ).rejects.toThrow(
      'Error getting the Auto scaling groups of vpc vpc-11111111'
    );
  });

  it('should not return auto scaling groups when subnets related to asg fetch fails', async () => {
    subnetGroupFetchFails();
    await expect(
      getAutoScalingGroups('us-east-1', 'default', 'vpc-11111111')
    ).rejects.toThrow(
      'Error getting the Auto scaling groups of vpc vpc-11111111'
    );
  });
});

const setPositiveTestMockData = () => {
  // set the mock data
  autoScalingClientMock.on(DescribeAutoScalingGroupsCommand).resolves({
    AutoScalingGroups: [
      {
        AutoScalingGroupName: 'testGroupInVpc',
        AutoScalingGroupARN: 'testGroupInVpcARN',
        MinSize: 1,
        MaxSize: 4,
        DesiredCapacity: 2,
        VPCZoneIdentifier: 'VpcSubnet1,VpcSubnet2',
        DefaultCooldown: 1,
        AvailabilityZones: ['1b', '1d'],
        CreatedTime: new Date(),
        HealthCheckType: 'url',
      },
      {
        AutoScalingGroupName: 'testGroupInOtherVpc',
        AutoScalingGroupARN: 'testGroupInOtherVpcARN',
        MinSize: 1,
        MaxSize: 4,
        DesiredCapacity: 2,
        VPCZoneIdentifier: 'VpcOtherSubnet1,VpcOtherSubnet2',
        DefaultCooldown: 1,
        AvailabilityZones: ['1a', '1c'],
        CreatedTime: new Date(),
        HealthCheckType: 'url',
      },
    ],
  });
  ec2ClientMock
    .on(DescribeSubnetsCommand, {
      Filters: [{ Name: 'subnet-id', Values: ['VpcSubnet1', 'VpcSubnet2'] }],
    })
    .resolves({
      Subnets: [
        {
          VpcId: 'vpc-12345678',
        },
      ],
    })
    .on(DescribeSubnetsCommand, {
      Filters: [
        { Name: 'subnet-id', Values: ['VpcOtherSubnet1', 'VpcOtherSubnet2'] },
      ],
    })
    .resolves({
      Subnets: [
        {
          VpcId: 'vpc-87654321',
        },
      ],
    });
};

const autoScalingGroupFetchFails = () => {
  autoScalingClientMock.on(DescribeAutoScalingGroupsCommand).rejects({
    message: 'failed',
  });
};

const subnetGroupFetchFails = () => {
  autoScalingClientMock.on(DescribeAutoScalingGroupsCommand).resolves({
    AutoScalingGroups: [
      {
        AutoScalingGroupName: 'testGroupInVpc',
        AutoScalingGroupARN: 'testGroupInVpcARN',
        MinSize: 1,
        MaxSize: 4,
        DesiredCapacity: 2,
        VPCZoneIdentifier: 'VpcSubnet1,VpcSubnet2',
        DefaultCooldown: 1,
        AvailabilityZones: ['1b', '1d'],
        CreatedTime: new Date(),
        HealthCheckType: 'url',
      },
      {
        AutoScalingGroupName: 'testGroupInOtherVpc',
        AutoScalingGroupARN: 'testGroupInOtherVpcARN',
        MinSize: 1,
        MaxSize: 4,
        DesiredCapacity: 2,
        VPCZoneIdentifier: 'VpcOtherSubnet1,VpcOtherSubnet2',
        DefaultCooldown: 1,
        AvailabilityZones: ['1a', '1c'],
        CreatedTime: new Date(),
        HealthCheckType: 'url',
      },
    ],
  });
  ec2ClientMock.on(DescribeSubnetsCommand).rejects({
    message: 'failed',
  });
};
