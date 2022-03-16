import {
  LambdaClient,
  paginateListFunctions,
} from "@aws-sdk/client-lambda";
import { fromIni } from "@aws-sdk/credential-providers";

export interface Lambda {
  name: string;
  arn: string;
  runtime: string;
};

export const getLambdas = async (
  region: string = "us-east-1",
  profile: string = "default",
  id: string
): Promise<Lambda[]> => {
  // get the client
  const client: LambdaClient = new LambdaClient({
    region,
    credentials: fromIni({ profile }),
  });
  const paginator = paginateListFunctions(
    {
      client,
      pageSize: 50,
    },
    {}
  );

  const functions: Lambda[] = [];
  for await (const page of paginator) {
    // page contains a single paginated output.
    page.Functions.forEach((fn) => {
      // get the function associated with vpc
      if (fn.VpcConfig?.VpcId === id)
        functions.push({
          name: fn.FunctionName,
          arn: fn.FunctionArn,
          runtime: fn.Runtime?.toString(),
        });
    });
  }
  return functions;
};
