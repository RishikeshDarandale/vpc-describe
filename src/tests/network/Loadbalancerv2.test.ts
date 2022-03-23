import { mockClient } from 'aws-sdk-client-mock';
import {
  DescribeLoadBalancersCommand,
  ElasticLoadBalancingV2Client,
} from '@aws-sdk/client-elastic-load-balancing-v2';
import {
  getV2LoadBalancers,
  LoadBalancerV2,
} from '../../network/LoadBalancersv2';

// create the mock clients
const elbClientMock = mockClient(ElasticLoadBalancingV2Client);

describe('Load balancer V2 Tests', () => {
  beforeEach(() => {
    // reset mock client
    elbClientMock.reset();
  });

  it('should return Load balancers associated with passed vpc', async () => {
    elbClientMock.on(DescribeLoadBalancersCommand).resolves({
      LoadBalancers: [
        {
          VpcId: 'vpc-12345678',
          Type: 'application',
          AvailabilityZones: [
            {
              ZoneName: '1a',
            },
            {
              ZoneName: '1c',
            },
          ],
        },
        {
          VpcId: 'vpc-87654321',
          Type: 'application',
          AvailabilityZones: [
            {
              ZoneName: '1a',
            },
            {
              ZoneName: '1c',
            },
          ],
        },
      ],
    });
    const lbs: LoadBalancerV2[] = await getV2LoadBalancers(
      'us-east-1',
      'default',
      'vpc-12345678'
    );
    expect(lbs.length).toBe(1);
  });

  it('should not return load balancers not associated with passed vpc', async () => {
    elbClientMock.on(DescribeLoadBalancersCommand).resolves({
      LoadBalancers: [],
    });
    const lbs: LoadBalancerV2[] = await getV2LoadBalancers(
      'us-east-1',
      'default',
      'vpc-11111111'
    );
    expect(lbs.length).toBe(0);
  });

  it('should not return load balancers when load balancer fetch fails', async () => {
    elbClientMock.on(DescribeLoadBalancersCommand).rejects({
      message: 'failed',
    });
    await expect(
      getV2LoadBalancers('us-east-1', 'default', 'vpc-11111111')
    ).rejects.toThrow(
      'Error getting the v2 load balancers of vpc vpc-11111111'
    );
  });
});
