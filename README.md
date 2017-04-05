## aws-instance-metadata

This module is used to retrieve a piece of metadata for a running AWS EC2
instance. It returns takes a callback in order to return the data.

## Install
```
$ yarn add aws-instance-metadata
```

or

```
$ npm install aws-instance-metadata --save
```

## Usage

When using raven.js, it's common to add server level information for debugging
purposes. We can use aws-instance-metadata to do just that. In order to tag all
future error messages with the instance ID, we could do:

```
var raven = require('raven').Client(/* configuration omitted */);
var awsInstanceMetadata = require('aws-instance-metadata');

awsInstanceMetadata.fetch('instance-id', (err, instanceId) => {
  if (err) {
    console.error(err);
    return;
  }

  raven.setTagsContext({
    instanceId: instanceId
  });
});
```

## Release History
* 1.0.0 Initial release.
