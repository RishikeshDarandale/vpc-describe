import {
    DescribeVpcEndpointsCommand,
    EC2Client,
    VpcEndpoint,
  } from "@aws-sdk/client-ec2";
  import { fromIni } from "@aws-sdk/credential-providers";
  
  export const getVpcEndpoints = async (
    region: string = "us-east-1",
    profile: string = "default",
    id: string
  ): Promise<VpcEndpoint[]> => {
    // get the client
    const client = new EC2Client({
      region,
      credentials: fromIni({ profile }),
    });
    // describe the vpc with specified id
    let vpcEndpoints: VpcEndpoint[];
    const command = new DescribeVpcEndpointsCommand({
      Filters: [{ Name: "vpc-id", Values: [id] }],
    });
    try {
      const response = await client.send(command);
      vpcEndpoints = response.VpcEndpoints;
    } catch (error) {
      const { requestId, cfId, extendedRequestId } = error.$metadata;
      throw new Error(
        `${requestId}: Error getting the vpc endpoints of vpc ${id}`
      );
    }
    return vpcEndpoints;
  };