#!/usr/bin/env node

import { AutoScalingGroup } from "@aws-sdk/client-auto-scaling";
import {
  Instance,
  InternetGateway,
  NatGateway,
  NetworkAcl,
  NetworkInterface,
  RouteTable,
  SecurityGroup,
  Subnet,
  TransitGatewayVpcAttachment,
  Vpc,
  VpcEndpoint,
} from "@aws-sdk/client-ec2";
import { LoadBalancerDescription } from "@aws-sdk/client-elastic-load-balancing";
import { LoadBalancer } from "@aws-sdk/client-elastic-load-balancing-v2";
import { CacheCluster } from "@aws-sdk/client-elasticache";
import { ElasticsearchDomainStatus } from "@aws-sdk/client-elasticsearch-service";
import { FunctionConfiguration } from "@aws-sdk/client-lambda";
import { DBInstance } from "@aws-sdk/client-rds";
import { Command } from "commander";
import Listr from "listr";
import { getAutoScalingGroups } from "./network/AutoScalingGroup";
import { getEC2s } from "./network/EC2";
import { EcsService, getEcsServices } from "./network/Ecs";
import { getCacheClusters } from "./network/Elasticache";
import { getInternetGateways } from "./network/InternetGateway";
import { getLambdas } from "./network/Lambda";
import { getLoadBalancers } from "./network/LoadBalancer";
import { getV2LoadBalancers } from "./network/LoadBalancersv2";
import { getNatGateways } from "./network/NatGateway";
import { getNetworkACLs } from "./network/NetworkACL";
import { getNetworkInterfaces } from "./network/NetworkInterfaces";
import { getOpenSearchDomains } from "./network/OpenSearch";
import { getRDSInstances } from "./network/Rds";
import { getRouteTables } from "./network/RouteTable";
import { getSecurityGroups } from "./network/SecurityGroups";
import { getSubnets } from "./network/Subnet";
import { getTransitGatewayAttachments } from "./network/TransitGatewayAttachment";

import { getVpc } from "./network/Vpc";
import { getVpcEndpoints } from "./network/VpcEndpoint";
import { getVPNGateways, VpnGateway } from "./network/VpnGateway";

(async () => {
  const program = new Command();

  program
    .version("1.0.0", "-v, --version", "output the current version")
    .description("describe the provided aws vpc resources")
    .requiredOption(
      "-n, --network <vpc>",
      "provide the vpc id describe the resources"
    )
    .option("-r, --region <region>", "provide the region", "us-east-1")
    .option("-p, --profile <profile>", "aws credential profile", "default")
    .action(
      await Promise.resolve(
        async () =>
          await describe(
            program.opts().region,
            program.opts().profile,
            program.opts().network
          )
      )
    );

  await program.parseAsync();
})();

const tasks = new Listr([
  {
    title: "Finding vpc",
    task: async (ctx) => {
      try {
        const vpc: Vpc = await getVpc(ctx.region, ctx.profile, ctx.id);
        ctx.vpc = {};
        ctx.vpc.vpc = vpc;
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
            task: async (ctx) => {
              try {
                const internetGateways: InternetGateway[] =
                  await getInternetGateways(ctx.region, ctx.profile, ctx.id);
                ctx.vpc.internetGateways = internetGateways;
              } catch (error) {
                throw new Error(
                  "Could not describe the internet gateways, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for NAT Gateways",
            task: async (ctx) => {
              try {
                const natGateways: NatGateway[] = await getNatGateways(
                  ctx.region,
                  ctx.profile,
                  ctx.id
                );
                ctx.vpc.natGateways = natGateways;
              } catch (error) {
                throw new Error(
                  "Could not describe the nat gateways, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for Network ACLs",
            task: async (ctx) => {
              try {
                const nACLs: NetworkAcl[] = await getNetworkACLs(
                  ctx.region,
                  ctx.profile,
                  ctx.id
                );
                ctx.vpc.nACLs = nACLs;
              } catch (error) {
                throw new Error(
                  "Could not describe the network ACLs, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for Route tables",
            task: async (ctx) => {
              try {
                const routeTables: RouteTable[] = await getRouteTables(
                  ctx.region,
                  ctx.profile,
                  ctx.id
                );
                ctx.vpc.routeTables = routeTables;
              } catch (error) {
                throw new Error(
                  "Could not describe the route tables, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for Security Groups",
            task: async (ctx) => {
              try {
                const securityGroups: SecurityGroup[] = await getSecurityGroups(
                  ctx.region,
                  ctx.profile,
                  ctx.id
                );
                ctx.vpc.securityGroups = securityGroups;
              } catch (error) {
                throw new Error(
                  "Could not describe the security groups, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for Subnets",
            task: async (ctx) => {
              try {
                const subnets: Subnet[] = await getSubnets(
                  ctx.region,
                  ctx.profile,
                  ctx.id
                );
                ctx.vpc.subnets = subnets;
              } catch (error) {
                throw new Error(
                  "Could not describe the subnets, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for Transit Gateway attachments",
            task: async (ctx) => {
              try {
                const transitGatewayAttachments: TransitGatewayVpcAttachment[] =
                  await getTransitGatewayAttachments(
                    ctx.region,
                    ctx.profile,
                    ctx.id
                  );
                ctx.vpc.transitGatewayAttachments = transitGatewayAttachments;
              } catch (error) {
                throw new Error(
                  "Could not describe the transit gateways associated, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for vpc endpoints attachments",
            task: async (ctx) => {
              try {
                const vpcEndpoints: VpcEndpoint[] = await getVpcEndpoints(
                  ctx.region,
                  ctx.profile,
                  ctx.id
                );
                ctx.vpc.vpcEndpoints = vpcEndpoints;
              } catch (error) {
                throw new Error(
                  "Could not describe the vpc endpoints associated, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for EC2s",
            task: async (ctx) => {
              try {
                const ec2s: Instance[] = await getEC2s(
                  ctx.region,
                  ctx.profile,
                  ctx.id
                );
                ctx.vpc.ec2s = ec2s;
              } catch (error) {
                throw new Error(
                  "Could not describe the EC2s, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for ASGs",
            task: async (ctx) => {
              try {
                const asgs: AutoScalingGroup[] = await getAutoScalingGroups(
                  ctx.region,
                  ctx.profile,
                  ctx.id
                );
                ctx.vpc.asgs = asgs;
              } catch (error) {
                throw new Error(
                  "Could not describe the ASGs, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for Network Interfaces",
            task: async (ctx) => {
              try {
                const networkInterfaces: NetworkInterface[] = await getNetworkInterfaces(
                  ctx.region,
                  ctx.profile,
                  ctx.id
                );
                ctx.vpc.networkInterfaces = networkInterfaces;
              } catch (error) {
                throw new Error(
                  "Could not describe the network interfaces, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for Lambda functions",
            task: async (ctx) => {
              try {
                const functions: FunctionConfiguration[] = await getLambdas(
                  ctx.region,
                  ctx.profile,
                  ctx.id
                );
                ctx.vpc.functions = functions;
              } catch (error) {
                throw new Error(
                  "Could not list lambda functions, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for RDS instances",
            task: async (ctx) => {
              try {
                const dbs: DBInstance[] = await getRDSInstances(
                  ctx.region,
                  ctx.profile,
                  ctx.id
                );
                ctx.vpc.dbs = dbs;
              } catch (error) {
                throw new Error(
                  "Could not list RDS instances, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for Cache Clusters",
            task: async (ctx) => {
              try {
                const ccs: CacheCluster[] = await getCacheClusters(
                  ctx.region,
                  ctx.profile,
                  ctx.id
                );
                ctx.vpc.ccs = ccs;
              } catch (error) {
                throw new Error(
                  "Could not list cache clusters, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for open search (formerly elastic search) domains",
            task: async (ctx) => {
              try {
                const esDomains: ElasticsearchDomainStatus[] = await getOpenSearchDomains(
                  ctx.region,
                  ctx.profile,
                  ctx.id
                );
                ctx.vpc.esDomains = esDomains;
              } catch (error) {
                throw new Error(
                  "Could not list elasticsearch domains, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for classic load balancers",
            task: async (ctx) => {
              try {
                const lbs: LoadBalancerDescription[] = await getLoadBalancers(
                  ctx.region,
                  ctx.profile,
                  ctx.id
                );
                ctx.vpc.lbs = lbs;
              } catch (error) {
                throw new Error(
                  "Could not list classic load balancers, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for v2 load balancers",
            task: async (ctx) => {
              try {
                const lbsv2: LoadBalancer[] = await getV2LoadBalancers(
                  ctx.region,
                  ctx.profile,
                  ctx.id
                );
                ctx.vpc.lbsv2 = lbsv2;
              } catch (error) {
                throw new Error(
                  "Could not list v2 load balancers, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for ECS services",
            task: async (ctx) => {
              try {
                const ecs: EcsService[] = await getEcsServices(
                  ctx.region,
                  ctx.profile,
                  ctx.id
                );
                ctx.vpc.ecs = ecs;
              } catch (error) {
                throw new Error(
                  "Could not list ECS services, please check the vpc id / credentials provided"
                );
              }
            },
          },
          {
            title: "Checking for VPN Gateways",
            task: async (ctx) => {
              try {
                const vpnGateways: VpnGateway[] = await getVPNGateways(
                  ctx.region,
                  ctx.profile,
                  ctx.id
                );
                ctx.vpc.vpnGateways = vpnGateways;
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
  id: string
): Promise<void> => {
  try {
    const context = await tasks.run({
      region,
      profile,
      id,
    });
    // TODO: remove it
    console.log(JSON.stringify(context));
  } catch (error) {
    console.error(error);
  }
};
