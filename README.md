# Athena-Plus: Enhanced Version of Athena-Express
## AWS V3 Architecture Support

This fork of Athena-Express is fully compatible with the AWS V3 architecture, providing seamless integration with the latest AWS services and features. It leverages the AWS SDK v3 for Athena and S3, ensuring optimal performance and reliability when executing SQL queries on Amazon Athena.

##### Forked Repository

This repository is a fork of the original [Athena-Express](https://github.com/ghdna/athena-express) project. It includes added support for parameterized queries, allowing users to pass parameters into their SQL queries for dynamic execution.

## Setup

### Prerequisites

-   You will need either an `IAM Role` (if you're running `athena-express` on AWS Lambda or AWS EC2) **OR** an `IAM User` with `accessKeyId` and `secretAccessKey` (if you're running `athena-express` on a standalone NodeJS application)
-   This IAM role/user must have `AmazonAthenaFullAccess` and `AmazonS3FullAccess` policies attached 
    -   Note: As an alternative to granting `AmazonS3FullAccess` you could granularize and limit write access to a specific `bucket`. Just specify this bucket name during `athena-express` initialization

#### Simple configuration

```javascript
  const athenaClient = new AthenaClient({ region: "REGION" });
  const client = new S3Client({ region: "REGION" });
  const athenaExpressConfig = { 'athenaClient': athenaClient, 's3Client': client, 's3': "s3://my-bucket" };
  const athenaExpress = new AthenaExpress(athenaExpressConfig);
```


#### Advance configuration

- Besides the `athenaClient`, `s3Client`, `s3` parameter that is required, you can add any of the following optional parameters below



```javascript
const { AthenaClient } = require("@aws-sdk/client-athena")
const { S3Client } = require("@aws-sdk/client-s3");

//Example showing all Config parameters.
const athenaExpressConfig = {
    s3Client: new S3Client({ region: "REGION"});,  // required
    athenaClient: new AthenaClient({ region: "REGION"}), // required
    s3: "s3://mybucketname",  // required
    db: "myDbName", // optional
    workgroup: "myWorkGroupName", // optional
    formatJson: true, // optional
    retry: 200, // optional
    getStats: true, // optional
    ignoreEmpty: true, // optional
    encryption: { EncryptionOption: "SSE_KMS", KmsKey: process.env.kmskey}, // optional
    skipResults: false, // optional
    waitForResults: false, // optional
    catalog: "hive" //optional
};

//Initializing AthenaExpress
const athenaExpress = new AthenaExpress(athenaExpressConfig);
```



## Support for Parameterized Queries

With this fork, we've added support for parameterized queries. Parameterized queries enable users to build dynamic SQL queries by injecting parameters into the query string. This is especially useful when you need to execute similar queries with different values.

### Example of Parameterized Query

Here's an example of how to use parameterized queries with Athena-Express:

```javascript

let myQuery = {
	sql: "SELECT * FROM cloudfront_logs LIMIT ? ",
	db: "mydatabase",
	values: ['2']
};

athenaExpress
	.query(myQuery)
	.then(results => {
		console.log(results);
	})
	.catch(error => {
		console.log(error);
});

let myQuery1 = "SELECT * FROM mydatabase.cloudfront_logs LIMIT ?"

athenaExpress
	.query(myQuery1, ['1'])
	.then(results => {
		console.log(results);
	})
	.catch(error => {
		console.log(error);
	});

```

In this example, we define a query with placeholders ? and provide the actual parameter value in the values array. Athena-Express replaces the placeholders with the parameter values when executing the query.


### Getting Started
To get started with this fork and use parameterized queries, follow the installation and setup instructions in the original Athena-Express README.

## Contributors

Sachin Rana

## License

MIT

## Acknowledgments
I would like to acknowledge the original contributor(s) of this project for their valuable work:

- [Gary Arora](https://twitter.com/AroraGary) - Thank you for creating this amazing project.

