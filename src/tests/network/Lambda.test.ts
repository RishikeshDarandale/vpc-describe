import { mockClient } from 'aws-sdk-client-mock';
import { LambdaClient, ListFunctionsCommand } from '@aws-sdk/client-lambda';
import { getLambdas, Lambda } from '../../network/Lambda';

// create the mock clients
const lambdaClientMock = mockClient(LambdaClient);

describe('Lambda Tests', () => {
  beforeEach(() => {
    // reset mock client
    lambdaClientMock.reset();
  });

  it('should return lambdas associated with passed vpc', async () => {
    lambdaClientMock.on(ListFunctionsCommand).resolves({
      Functions: [
        {
          FunctionName: 'function1',
          VpcConfig: {
            VpcId: 'vpc-12345678',
          },
        },
        {
          FunctionName: 'function2',
          VpcConfig: {
            VpcId: 'vpc-12345678',
          },
        },
        {
          FunctionName: 'function3',
          VpcConfig: {
            VpcId: 'vpc-87654321',
          },
        },
        {
          FunctionName: 'function4',
        },
      ],
    });
    const lambdas: Lambda[] = await getLambdas(
      'us-east-1',
      'default',
      'vpc-12345678'
    );
    expect(lambdas.length).toBe(2);
    expect(lambdas[0].name).toBe('function1');
  });

  it('should not return lambdas not associated with passed vpc', async () => {
    lambdaClientMock.on(ListFunctionsCommand).resolves({
      Functions: [
        {
          FunctionName: 'function3',
          VpcConfig: {
            VpcId: 'vpc-87654321',
          },
        },
        {
          FunctionName: 'function4',
        },
      ],
    });
    const lambdas: Lambda[] = await getLambdas(
      'us-east-1',
      'default',
      'vpc-12345678'
    );
    expect(lambdas.length).toBe(0);
  });
});
