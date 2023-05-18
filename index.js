/**
 * This module is used to retrieve a piece of metadata for a running AWS EC2
 * instance. It takes a callback in order to return the data.
 */

const got = require('got');
const { EC2Client, DescribeTagsCommand } = require('@aws-sdk/client-ec2');

// We use the IP address  as it is referenced from the AWS docs:
// https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-metadata.html
const baseUrl = 'http://169.254.169.254/2018-09-24';

/**
 * fetch fetches the given metadata field for the currently running instance.
 * @param  {String}   field The metadata field to retrieve.
 * @param  {Promise<String>} A promise that resolves to the field data.
 */
function fetch(field) {
  return got(`${baseUrl}/meta-data/${field}`).then(
    (res) => res.body,
    (err) =>
      Promise.reject(err.statusCode === 404 ? new Error(`no such meta-data field ${field}`) : err)
  );
}

/**
 * fetches and returns the dynamic instance document including instanceId and region
 * for the currently running instance.
 *
 * Full response values are here:
 *   https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-identity-documents.html
 *
 * @return     {Promise<{ [string]: mixed }>} The instance identity document.
 */
function fetchInstanceIdentity() {
  return got(`${baseUrl}/dynamic/instance-identity/document`, {
    json: true,
  }).then((res) => res.body);
}

/**
 * Retrieves a tag of the given name for the currently running instance. For
 * example:
 *
 * // Returns the EB environment, like `notification-production`.
 * const environmentName = await fetchTag('elasticbeanstalk:environment-name');
 *
 * For more details and a list of common tags see:
 *  https://docs.aws.amazon.com/cli/latest/reference/ec2/describe-tags.html
 *
 * @param      {string}   tag     The tag
 * @return     {Promise<string>}  The value of the tag, or nul if it's not found.
 */
async function fetchTag(tag) {
  const { instanceId, region } = await fetchInstanceIdentity();
  const ec2 = new EC2Client({
    region,
  });

  const result = await ec2.send(
    new DescribeTagsCommand({
      Filters: [
        {
          Name: 'resource-id',
          Values: [instanceId],
        },
        {
          Name: 'key',
          Values: [tag],
        },
      ],
    })
  );
  if (!result || !result.Tags || !result.Tags.length) return null;

  return result.Tags[0].Value;
}

module.exports = {
  fetch,
  fetchTag,
  fetchInstanceIdentity,
};
