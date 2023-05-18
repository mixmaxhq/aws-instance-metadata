## aws-instance-metadata

This module is used to retrieve a piece of metadata for a running AWS EC2
instance. It returns takes a callback in order to return the data.

## Install
```sh
npm install aws-instance-metadata
```

or

```sh
npm install aws-instance-metadata --save
```

## Usage

When using raven.js, it's common to add server level information for debugging
purposes. We can use aws-instance-metadata to do just that. In order to tag all
future error messages with the instance ID, we could do:

```js
const raven = require('raven').Client(/* configuration omitted */);
const awsInstanceMetadata = require('aws-instance-metadata');

awsInstanceMetadata.fetch('instance-id').then((instanceId) => {
  raven.setTagsContext({
    instanceId: instanceId
  });
}, console.error);
```

## Publishing a new version

```
GH_TOKEN=xxx npx semantic-release --no-ci
```