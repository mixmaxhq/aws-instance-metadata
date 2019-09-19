import AWS from 'aws-sdk';
import nock from 'nock';
import { fetch, fetchTag } from '../index';

describe('fetch', () => {
  let scope;

  afterEach(() => {
    scope.done();
  });

  it('should fetch the given field', async () => {
    scope = nock('http://169.254.169.254')
      .get('/2018-09-24/meta-data/local-ipv4')
      .reply(200, '10.10.2.229');

    await expect(fetch('local-ipv4')).resolves.toBe('10.10.2.229');
  });

  it('should fail to fetch missing fields', async () => {
    scope = nock('http://169.254.169.254')
      .get('/2018-09-24/meta-data/instance-id')
      .reply(404);

    await expect(fetch('instance-id')).rejects.toThrow('instance-id');
  });
});

describe('fetchTag', () => {
  let ec2;

  let scope;

  beforeEach(() => {
    scope = nock('http://169.254.169.254')
      .get('/2018-09-24/dynamic/instance-identity/document')
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
