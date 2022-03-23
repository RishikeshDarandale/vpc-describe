# vpc-describe

[![CircleCI](https://circleci.com/gh/RishikeshDarandale/vpc-describe/tree/main.svg?style=svg)](https://circleci.com/gh/RishikeshDarandale/vpc-describe/tree/main)
![CodeQL Analysis](https://github.com/RishikeshDarandale/vpc-describe/actions/workflows/codeql-analysis.yml/badge.svg)
[![npm](https://img.shields.io/npm/v/vpc-describe)](https://www.npmjs.com/package/vpc-describe)
[![NpmLicense](https://img.shields.io/npm/l/vpc-describe)](https://github.com/RishikeshDarandale/vpc-describe/blob/main/LICENSE)

Describe the aws vpc to list associated resources with it...

## Background

The idea behind the implementation of the tool is to find out all the resources that are associated with aws vpc. This gives a picture of all resources or services that use aws vpc.

## Usage

### With npx

```
npx vpc-describe --network vpc-xxxxxxx --profile default --output tabular
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

`--output <tabular|json>`

Provide an output type. Default is `tabular`

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
