import { Command } from 'commander';

const program = new Command();

program
  .version('1.0.0', '-v, --version', 'output the current version')
  .description('describe the provided aws vpc resources')
  .requiredOption('-l, --list <vpcs...>', 'provide the vpc list to describe the resources')
  .option('-r, --region <region>', 'provide the region', 'us-east-1')
  .option('-p, --profile <profile>', 'aws credential profile', 'default');

program.parse();

console.log('Options: ', program.opts());