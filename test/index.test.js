import AWS from 'aws-sdk';
jest.mock('got');
import got from 'got';
import { fetchTag } from '../index';

describe('fetchTag', () => {
  let ec2;
  beforeEach(() => {
    got.mockResolvedValueOnce({ body: { instanceId: 'testInstance', region: 'us-east-1' } });
    ec2 = new AWS.EC2({});
    jest.spyOn(AWS, 'EC2').mockImplementation(() => ec2);
  });

  afterEach(() => {
    expect(got).toHaveBeenCalledWith(
      'http://169.254.169.254/latest/dynamic/instance-identity/document',
      {
        json: true,
      }
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

  it('should return the returned tag', async () => {
    jest.spyOn(ec2, 'describeTags').mockImplementation(() => {
      return {
        promise: () => Promise.resolve({ Tags: [{ Value: 'notifications-worker-production' }] }),
      };
    });

    expect(await fetchTag('elasticbeanstalk:environment-name')).toEqual(
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

    expect(await fetchTag('elasticbeanstalk:environment-name')).toBe(null);
  });
});
