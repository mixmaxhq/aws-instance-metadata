/**
 * This module is used to retrieve a piece of metadata for a running AWS EC2
 * instance. It takes a callback in order to return the data.
 */

const got = require('got');

/**
 * fetch fetches the given metadata field for the currently running instance
 * and returns that data to done. If there was an error, it is passed to done
 * instead.
 * @param  {String}   field The metadata field to retrieve.
 * @param  {Promise<String>} A promise that resolves to the field data.
 */
function fetch(field) {
  // We use the IP address  as it is referenced from the AWS docs:
  // https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-metadata.html
  return got(`http://169.254.169.254/latest/meta-data/${field}`).then((res) => res.text);
}

module.exports = {
  fetch
};
