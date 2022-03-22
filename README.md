# vpc-describe

Describe the aws vpc to list associated resources with it...

[![CircleCI](https://circleci.com/gh/RishikeshDarandale/vpc-describe/tree/main.svg?style=svg)](https://circleci.com/gh/RishikeshDarandale/vpc-describe/tree/main)
![CodeQL Analysis](https://github.com/RishikeshDarandale/vpc-describe/actions/workflows/codeql-analysis.yml/badge.svg)
[![npm](https://img.shields.io/npm/dt/vpc-describe.svg)](https://www.npmjs.com/package/vpc-describe)
[![NpmLicense](https://img.shields.io/npm/l/vpc-describe.svg)](https://github.com/RishikeshDarandale/vpc-describe/blob/master/LICENSE)

## Background

The idea behind the implementation tool is to find out all the resources that are associated with aws vpc. This gives a picture of all resources or services that use aws vpc.

## Usage

### With npx

```
npx vpc-describe --help
```

### With Installation

#### Globally

```
npm i --global vpc-describe
```

#### Project level

```
npm i --save[-dev] vpc-describe
```

### Options

`--network <vpc-id>`

Provide a vpc id that needs to be describe.

`--profile <profile-name>`

Provide a AWS credential profile as a credentials.

`--region <region-name>`

Provide a AWS region Name. Default is `us-east-1`.

## Development

```
npm run build
node ./dist/index.js --network vpc-xxxxxxx --profile default --output tabular
```

## Bug or Feature request ?

If you are experiencing a issue or wanted to add a new feature, please create a github issue [here](https://github.com/RishikeshDarandale/vpc-describe/issues/new/choose).

## Contributing

- Fork the repository
- Make the changes in your repository
- Raise a pull request