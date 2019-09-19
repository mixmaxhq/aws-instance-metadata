import AWS from 'aws-sdk';
import nock from 'nock';
import { fetchTag } from '../index';

describe('fetchTag', () => {
  let ec2;

  let scope;

  beforeEach(() => {
    scope = nock('http://169.254.169.254')
      .get('/latest/dynamic/instance-identity/document')
      .reply(200, { instanceId: 'testInstance', region: 'us-east-1' });
    ec2 = new AWS.EC2({});
    jest.spyOn(AWS, 'EC2').mockImplementation(() => ec2);
  });

  afterEach(() => {
    scope.done();

    expect(ec2.describeTags).toHaveBeenCalledWith({
      Filters: [
        {
          Name: 'resource-id',
          Values: ['testInstance'],
        },
        {
          Name: 'key',
          Values: ['elasticbeanstalk:environment-name'],
        },
      ],
    });
  });

  it('should return the returned tag', async () => {
    jest.spyOn(ec2, 'describeTags').mockImplementation(() => {
      return {
        promise: async () => ({ Tags: [{ Value: 'notifications-worker-production' }] }),
      };
    });

    await expect(fetchTag('elasticbeanstalk:environment-name')).resolves.toEqual(
      'notifications-worker-production'
    );
    expect(ec2.describeTags).toHaveBeenCalledWith({
      Filters: [
        {
          Name: 'resource-id',
          Values: ['testInstance'],
        },
        {
          Name: 'key',
          Values: ['elasticbeanstalk:environment-name'],
        },
      ],
    });
  });

  it('should handle empty responses', async () => {
    jest.spyOn(ec2, 'describeTags').mockImplementation(() => {
      return {
        promise: () => Promise.resolve(),
      };
    });

    await expect(fetchTag('elasticbeanstalk:environment-name')).resolves.toBe(null);
  });
});
