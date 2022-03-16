#!/usr/bin/env node

import { Command, Option } from "commander";
import { Listr } from "listr2";
import {
  AutoScalingGroup,
  getAutoScalingGroups,
} from "./network/AutoScalingGroup";
import { EC2Instance, getEC2s } from "./network/EC2";
import { EcsService, getEcsServices } from "./network/Ecs";
import { CacheCluster, getCacheClusters } from "./network/Elasticache";
import { getInternetGateways, InternetGateway } from "./network/InternetGateway";
import { getLambdas, Lambda } from "./network/Lambda";
import { getLoadBalancers, LoadBalancer } from "./network/LoadBalancer";
import { getV2LoadBalancers, LoadBalancerV2 } from "./network/LoadBalancersv2";
import { getNatGateways, NatGateway } from "./network/NatGateway";
import { getNetworkACLs, NetworkAcl } from "./network/NetworkACL";
import { getNetworkInterfaces, NetworkInterface } from "./network/NetworkInterfaces";
import { ESDomain, getOpenSearchDomains } from "./network/OpenSearch";
import { DBInstance, getRDSInstances } from "./network/Rds";
import { getRouteTables, RouteTable } from "./network/RouteTable";
import { getSecurityGroups, SecurityGroup } from "./network/SecurityGroups";
import { getSubnets, Subnet } from "./network/Subnet";
import { getTransitGatewayAttachments, TransitGateway } from "./network/TransitGatewayAttachment";

import { getVpc, Vpc } from "./network/Vpc";
import { getVpcEndpoints, VpcEndpoint } from "./network/VpcEndpoint";
import { getVPNGateways, VpnGateway } from "./network/VpnGateway";
import { output } from "./output/Console";

(async () => {
  const program: Command = new Command();

  program
    .version("1.0.0", "-v, --version", "output the current version")
    .description("describe the provided aws vpc resources")
    .requiredOption(
      "-n, --network <vpc>",
      "provide the vpc id describe the resources"
    )
    .option("-r, --region <region>", "provide the region", "us-east-1")
    .option("-p, --profile <profile>", "aws credential profile", "default")
    .addOption(new Option('-o, --output <output>', 'tabular').choices(['tabular', 'json']))
    .action(
      await Promise.resolve(
        async () =>
          await describe(
            program.opts().region,
            program.opts().profile,
            program.opts().output,
            program.opts().network
          )
      )
    );

  await program.parseAsync();
})();

interface Ctx {
  region: string,
  profile: string,
  id: string,
  vpc: VpcOutput,
};

export interface VpcOutput {
  vpc?: Output,
  internetGateways?: Output,
  natGateways?: Output,
  nACLs?: Output,
  routeTables?: Output,
  securityGroups?: Output,
  subnets?: Output,
  transitGatewayAttachments? :Output,
  vpcEndpoints?: Output,
  ec2s?: Output,
  asgs?: Output,
  networkInterfaces?: Output,
  functions?: Output,
  dbs?: Output,
  ccs?: Output,
  esDomains?: Output,
  lbs?: Output,
  lbsv2?: Output,
  ecs?: Output,
  vpnGateways?: Output,
};

interface Output {
  msg: string,
  data: Vpc | InternetGateway [] | NatGateway[] | NetworkAcl [] | RouteTable []
   | SecurityGroup [] | Subnet [] | TransitGateway[] | VpcEndpoint []
   | EC2Instance [] | AutoScalingGroup[] | NetworkInterface[] | Lambda []
   | DBInstance [] | CacheCluster [] | ESDomain [] | LoadBalancer[]
   | LoadBalancerV2 [] | EcsService [] | VpnGateway []
};

const tasks: Listr<Ctx, "default", "verbose"> = new Listr<Ctx>([
  {
    title: "Finding vpc",
    task: async (ctx: Ctx) => {
      try {
        const vpc: Vpc = await getVpc(ctx.region, ctx.profile, ctx.id);
        ctx.vpc.vpc = {
          msg: 'Your VPC',
          data: vpc,
        };
      } catch (error) {
        throw new Error(
          "Could not describe the vpc, please check the vpc id / credentials provided"
        );
      }
    },
  },
  {
    title: "Describing vpc",
    task: () => {
      return new Listr(
        [
          {
            title: "Checking for Internet Gateways",
            task: async (ctx: Ctx) => {
              try {
                const internetGateways: InternetGateway[] =
                  await getInternetGateways(ctx.region, ctx.profile, ctx.id);
                ctx.vpc.internetGateways = {
                  msg: 'Internet Gateway associated with VPC',
                  data: internetGateways,
                }
              } catch (error) {
                throw new Error(
                  "Could not describe the internet gateways, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for NAT Gateways",
            task: async (ctx: Ctx) => {
              try {
                const natGateways: NatGateway[] = await getNatGateways(
                  ctx.region,
                  ctx.profile,
                  ctx.id
                );
                ctx.vpc.natGateways = {
                  msg: 'NAT Gateway associated with VPC',
                  data: natGateways,
                }
              } catch (error) {
                throw new Error(
                  "Could not describe the nat gateways, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for Network ACLs",
            task: async (ctx: Ctx) => {
              try {
                const nACLs: NetworkAcl[] = await getNetworkACLs(
                  ctx.region,
                  ctx.profile,
                  ctx.id
                );
                ctx.vpc.nACLs = {
                  msg: 'Network ACL associated with VPC',
                  data: nACLs
                };
              } catch (error) {
                throw new Error(
                  "Could not describe the network ACLs, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for Route tables",
            task: async (ctx: Ctx) => {
              try {
                const routeTables: RouteTable[] = await getRouteTables(
                  ctx.region,
                  ctx.profile,
                  ctx.id
                );
                ctx.vpc.routeTables = {
                  msg: 'Route Tables associated with VPC',
                  data: routeTables,
                };
              } catch (error) {
                throw new Error(
                  "Could not describe the route tables, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for Security Groups",
            task: async (ctx: Ctx) => {
              try {
                const securityGroups: SecurityGroup[] = await getSecurityGroups(
                  ctx.region,
                  ctx.profile,
                  ctx.id
                );
                ctx.vpc.securityGroups = {
                  msg: 'Security Groups associated with VPC',
                  data: securityGroups
                };
              } catch (error) {
                throw new Error(
                  "Could not describe the security groups, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for Subnets",
            task: async (ctx: Ctx) => {
              try {
                const subnets: Subnet[] = await getSubnets(
                  ctx.region,
                  ctx.profile,
                  ctx.id
                );
                ctx.vpc.subnets = {
                  msg: 'Subnets associated with VPC',
                  data: subnets
                };
              } catch (error) {
                throw new Error(
                  "Could not describe the subnets, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for Transit Gateway attachments",
            task: async (ctx: Ctx) => {
              try {
                const transitGatewayAttachments: TransitGateway[] =
                  await getTransitGatewayAttachments(
                    ctx.region,
                    ctx.profile,
                    ctx.id
                  );
                ctx.vpc.transitGatewayAttachments = {
                  msg: 'Transit Gateway associated with VPC',
                  data: transitGatewayAttachments
                };
              } catch (error) {
                throw new Error(
                  "Could not describe the transit gateways associated, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for vpc endpoints attachments",
            task: async (ctx: Ctx) => {
              try {
                const vpcEndpoints: VpcEndpoint[] = await getVpcEndpoints(
                  ctx.region,
                  ctx.profile,
                  ctx.id
                );
                ctx.vpc.vpcEndpoints = {
                  msg: 'VPC Endpoints associated with VPC',
                  data: vpcEndpoints
                };
              } catch (error) {
                throw new Error(
                  "Could not describe the vpc endpoints associated, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for EC2s",
            task: async (ctx: Ctx) => {
              try {
                const ec2s: EC2Instance[] = await getEC2s(
                  ctx.region,
                  ctx.profile,
                  ctx.id
                );
                ctx.vpc.ec2s = {
                  msg: 'EC2s associated with VPC',
                  data: ec2s
                };
              } catch (error) {
                throw new Error(
                  "Could not describe the EC2s, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for ASGs",
            task: async (ctx: Ctx) => {
              try {
                const asgs: AutoScalingGroup[] = await getAutoScalingGroups(
                  ctx.region,
                  ctx.profile,
                  ctx.id
                );
                ctx.vpc.asgs = {
                  msg: 'ASGs associated with VPC',
                  data: asgs
                };
              } catch (error) {
                throw new Error(
                  "Could not describe the ASGs, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for Network Interfaces",
            task: async (ctx: Ctx) => {
              try {
                const networkInterfaces: NetworkInterface[] =
                  await getNetworkInterfaces(ctx.region, ctx.profile, ctx.id);
                ctx.vpc.networkInterfaces = {
                  msg: 'Network Interfaces associated with VPC',
                  data: networkInterfaces
                };
              } catch (error) {
                throw new Error(
                  "Could not describe the network interfaces, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for Lambda functions",
            task: async (ctx: Ctx) => {
              try {
                const functions: Lambda[] = await getLambdas(
                  ctx.region,
                  ctx.profile,
                  ctx.id
                );
                ctx.vpc.functions = {
                  msg: 'Lambda functions associated with VPC',
                  data: functions
                };
              } catch (error) {
                throw new Error(
                  "Could not list lambda functions, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for RDS instances",
            task: async (ctx: Ctx) => {
              try {
                const dbs: DBInstance[] = await getRDSInstances(
                  ctx.region,
                  ctx.profile,
                  ctx.id
                );
                ctx.vpc.dbs = {
                  msg: 'RDS instances associated with VPC',
                  data: dbs,
                };
              } catch (error) {
                throw new Error(
                  "Could not list RDS instances, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for Cache Clusters",
            task: async (ctx: Ctx) => {
              try {
                const ccs: CacheCluster[] = await getCacheClusters(
                  ctx.region,
                  ctx.profile,
                  ctx.id
                );
                ctx.vpc.ccs = {
                  msg: 'Elasticache clusters associated with VPC',
                  data: ccs
                };
              } catch (error) {
                throw new Error(
                  "Could not list cache clusters, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for open search (formerly elastic search) domains",
            task: async (ctx: Ctx) => {
              try {
                const esDomains: ESDomain[] =
                  await getOpenSearchDomains(ctx.region, ctx.profile, ctx.id);
                ctx.vpc.esDomains = {
                  msg: 'Elasticsearch/Opensearch associated with VPC',
                  data: esDomains
                };
              } catch (error) {
                throw new Error(
                  "Could not list elasticsearch domains, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for classic load balancers",
            task: async (ctx: Ctx) => {
              try {
                const lbs: LoadBalancer[] = await getLoadBalancers(
                  ctx.region,
                  ctx.profile,
                  ctx.id
                );
                ctx.vpc.lbs = {
                  msg: 'Classic Load balancers associated with VPC',
                  data: lbs
                };
              } catch (error) {
                throw new Error(
                  "Could not list classic load balancers, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for v2 load balancers",
            task: async (ctx: Ctx) => {
              try {
                const lbsv2: LoadBalancerV2[] = await getV2LoadBalancers(
                  ctx.region,
                  ctx.profile,
                  ctx.id
                );
                ctx.vpc.lbsv2 = {
                  msg: 'Load balancers v2 associated with VPC',
                  data: lbsv2
                };
              } catch (error) {
                throw new Error(
                  "Could not list v2 load balancers, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for ECS services",
            task: async (ctx: Ctx) => {
              try {
                const ecs: EcsService[] = await getEcsServices(
                  ctx.region,
                  ctx.profile,
                  ctx.id
                );
                ctx.vpc.ecs = {
                  msg: 'ECS services associated with VPC',
                  data: ecs
                };
              } catch (error) {
                throw new Error(
                  "Could not list ECS services, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for VPN Gateways",
            task: async (ctx: Ctx) => {
              try {
                const vpnGateways: VpnGateway[] = await getVPNGateways(
                  ctx.region,
                  ctx.profile,
                  ctx.id
                );
                ctx.vpc.vpnGateways = {
                  msg: 'VPN Gateway associated with VPC',
                  data: vpnGateways
                };
              } catch (error) {
                throw new Error(
                  "Could not list ECS services, please check the vpc id / credentials provided"
                );
              }
            },
          },
        ],
        { concurrent: true }
      );
    },
  },
]);

const describe = async (
  region: string = "us-east-1",
  profile: string = "default",
  outputFormat: string = "tabular",
  id: string
): Promise<void> => {
  try {
    const context: Ctx = await tasks.run({
      region,
      profile,
      id,
      vpc: {},
    });
    // output in tabular form
    if (outputFormat === 'tabular') {
      output(context.vpc);
    }
    else if (outputFormat === 'json') {
      console.log(JSON.stringify(context.vpc));
    }
  } catch (error) {
    console.error(error);
  }
};
