import { mockClient } from 'aws-sdk-client-mock';
import { DescribeSubnetsCommand, EC2Client } from '@aws-sdk/client-ec2';
import {
  DescribeServicesCommand,
  ECSClient,
  ListClustersCommand,
  ListServicesCommand,
} from '@aws-sdk/client-ecs';
import { EcsService, getEcsServices } from '../../network/Ecs';

// create the mock clients
const ec2ClientMock = mockClient(EC2Client);
const ecsClientMock = mockClient(ECSClient);

describe('Auto scaling group Tests', () => {
  beforeEach(() => {
    // reset mock client
    ec2ClientMock.reset();
    ecsClientMock.reset();
  });

  it('should return ecs services associated with passed vpc', async () => {
    setPositiveTestMockData();
    const services: EcsService[] = await getEcsServices(
      'us-east-1',
      'default',
      'vpc-12345678'
    );
    expect(services.length).toBe(1);
    expect(services[0].service).toBe('serviceInVpc');
  });

  it('should not return ecs services associated with passed vpc when no cluster exists', async () => {
    ecsClientMock.on(ListClustersCommand).resolves({
      clusterArns: [],
    });
    const services: EcsService[] = await getEcsServices(
      'us-east-1',
      'default',
      'vpc-12345678'
    );
    expect(services.length).toBe(0);
  });

  it('should not return ecs services associated with passed vpc when no service exists', async () => {
    ecsClientMock.on(ListClustersCommand).resolves({
      clusterArns: ['something/cluster1'],
    });
    ecsClientMock.on(ListServicesCommand).resolves({
      serviceArns: undefined,
    });
    const services: EcsService[] = await getEcsServices(
      'us-east-1',
      'default',
      'vpc-12345678'
    );
    expect(services.length).toBe(0);
  });

  it('should not return ecs services associated with passed vpc when cluster list fails', async () => {
    ecsClientMock.on(ListClustersCommand).rejects({
      message: 'failed',
    });
    await expect(
      getEcsServices('us-east-1', 'default', 'vpc-11111111')
    ).rejects.toThrow('Error getting the ECS services of vpc vpc-11111111');
  });

  it('should not return ecs services associated with passed vpc when subnet list fails', async () => {
    setSubnetFailTestMockData();
    await expect(
      getEcsServices('us-east-1', 'default', 'vpc-11111111')
    ).rejects.toThrow('Error getting the ECS services of vpc vpc-11111111');
  });
});

const setSubnetFailTestMockData = () => {
  setClusterPositiveTestMockData();
  ec2ClientMock.on(DescribeSubnetsCommand).rejects({
    message: 'failed',
  });
};

const setClusterPositiveTestMockData = () => {
  ecsClientMock.on(ListClustersCommand).resolves({
    clusterArns: ['something/cluster1'],
  });
  ecsClientMock.on(ListServicesCommand).resolves({
    serviceArns: ['some/thing/serviceInVpc', 'some/thing/serviceInAnotherVpc'],
  });
  ecsClientMock.on(DescribeServicesCommand).resolves({
    services: [
      {
        serviceName: 'serviceInVpc',
        clusterArn: 'something/cluster1',
        networkConfiguration: {
          awsvpcConfiguration: {
            subnets: ['VpcSubnet1', 'VpcSubnet2'],
          },
        },
      },
      {
        serviceName: 'serviceInAnotherVpc',
        clusterArn: 'something/cluster1',
        networkConfiguration: {
          awsvpcConfiguration: {
            subnets: ['VpcOtherSubnet1', 'VpcOtherSubnet2'],
          },
        },
      },
    ],
  });
};

const setPositiveTestMockData = () => {
  setClusterPositiveTestMockData();
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
