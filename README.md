# Athena-Express-Plus: Enhanced Version of Athena-Express
## AWS V3 Architecture Support

This fork of Athena-Express is fully compatible with the AWS V3 architecture, providing seamless integration with the latest AWS services and features. It leverages the AWS SDK v3 for Athena and S3, ensuring optimal performance and reliability when executing SQL queries on Amazon Athena.

##### Forked Repository

This repository is a fork of the original [Athena-Express](https://github.com/ghdna/athena-express) project. It includes added support for parameterized queries, allowing users to pass parameters into their SQL queries for dynamic execution.

## Synopsis

Athena-Express-Plus can simplify executing SQL queries in Amazon Athena **AND** fetching _cleaned-up_ JSON results in the same synchronous or asynchronous request, making it well-suited for web applications.

#### Example:
![Athena-Express-Plus Example](https://image.ibb.co/cWNvFV/carbon-1.png)

## Amazon Athena Background

[Amazon Athena](https://aws.amazon.com/athena/), launched at AWS re:Invent 2016, makes it easier to analyze data in Amazon S3 using standard SQL. Under the covers, it uses [Presto](https://prestodb.io/), an open-source SQL engine developed by Facebook in 2012 to query their 300 Petabyte data warehouse. It's incredibly powerful!

Amazon Athena combines the strength of Presto with serverless and self-managed capabilities of AWS. By simply pointing Athena to your data in Amazon S3, you can start querying using standard SQL. Most results are delivered within seconds, and there’s no need for complex ETL jobs to prepare your data for analysis. This makes it easy for anyone with SQL skills to quickly analyze large-scale datasets.

## How Athena-Express-Plus Simplifies Using Amazon Athena

`athena-express-plus` simplifies integrating Amazon Athena with any Node.js application, whether running as a standalone application or as a Lambda function. Athena-Express-Plus bundles the following steps, as listed in the official [AWS Documentation](https://docs.aws.amazon.com/athena/latest/APIReference/Welcome.html):

1. Initiates a query execution.
2. Keeps checking until the query has finished executing.
3. Fetches the results of the query execution from Amazon S3.

Additional features include:

4. Formatting the results into a clean, user-friendly JSON array.
5. Handling specific Athena errors by recursively retrying for `ThrottlingException`, `NetworkingError`, and `TooManyRequestsException`.
6. Providing optional helpful stats, including the cost per query in USD.
7. Fetching results (rows) via Pagination OR as a continuous stream.
8. Synchronous and Asynchronous fetching of results (rows).

Integrating with Amazon Athena without `athena-express-plus` would require you to identify the appropriate API methods, stitch them together sequentially, and then build out error handling and retry mechanisms for each of those methods.

>`athena-express-plus` can help you save time and effort in setting up this integration, allowing you to focus on core application development.

### How Athena-Express-Plus Is Used

The most common use case is integrating a web front-end with Amazon Athena using `athena-express-plus` as a backend. This backend could be any Node.js application, hosted locally, on an EC2 instance, or as an AWS Lambda function.

Here's an example using AWS Lambda:
![Athena-Express-Plus Architecture](https://image.ibb.co/k3RpNA/Screen-Shot-2018-11-22-at-11-17-58-AM.png)

In this architecture, a web front-end invokes an API endpoint hosted on Amazon API Gateway by passing a query request. The query request can be as simple as `SELECT * FROM movies LIMIT 3`.

This API Gateway then triggers a Lambda function that has the `athena-express-plus` library imported.

## Setup

#### Simple Configuration

```javascript
const { Athena } = require("@aws-sdk/client-athena")
const { S3 } = require("@aws-sdk/client-s3");
const athena = new Athena({ region: "REGION" });
const s3 = new S3({ region: "REGION" });
const athenaExpressConfig = { athena, s3, 's3Bucket': "s3://my-bucket" };
const athenaExpress = new AthenaExpress(athenaExpressConfig);
```

#### Using AthenaClient, S3Client

```javascript
const { AthenaClient } = require("@aws-sdk/client-athena")
const { S3Client } = require("@aws-sdk/client-s3");
const athena = new AthenaClient({ region: "REGION" });
const s3 = new S3Client({ region: "REGION" });
const athenaExpressConfig = { athena, s3, 's3Bucket': "s3://my-bucket" };
const athenaExpress = new AthenaExpress(athenaExpressConfig);
```

#### Advance configuration

- Besides the `athena`, `s3` parameter that is required, you can add any of the following optional parameters below



```javascript
const { Athena } = require("@aws-sdk/client-athena")
const { S3 } = require("@aws-sdk/client-s3");

// Example showing all Config parameters.
const athenaExpressConfig = {
    s3: new S3({ region: "REGION" }),  // required
    athena: new Athena({ region: "REGION" }), // required
    s3Bucket: "s3://mybucketname",  // (optional) in case query result location already specified in workgroup
    db: "myDbName", // optional
    workgroup: "myWorkGroupName", // optional
    formatJson: true, // optional
    retry: 200, // optional
    getStats: true, // optional
    ignoreEmpty: true, // optional
    encryption: { EncryptionOption: "SSE_KMS", KmsKey: process.env.kmskey }, // optional
    skipResults: false, // optional
    waitForResults: false, // optional
    catalog: "hive", // optional
    flatKeys: false // optional
    resultReuse: true // optional
    resultReuseMaxAge: 100 // optional
};

// Initializing AthenaExpress
const athenaExpress = new AthenaExpress(athenaExpressConfig);
```

###### Advance config Parameters:

| Parameter  | Format | Default Value | Description |
| ------------- | ------------- | ------------- | ------------- |
| db | string  | `default`  | Athena database name that the SQL queries should be executed in. When a `db` name is specified in the config, you can execute SQL queries without needing to explicitly mention DB name. e.g. <br />` athenaExpress.query("SELECT * FROM movies LIMIT 3")` <br /> as opposed to <br />` athenaExpress.query({sql: "SELECT * FROM movies LIMIT 3", db: "moviedb"});`  |
| workgroup | string  | `primary`  | The name of the workgroup in which the query is being started. <br /> Note: athena-express-plus cannot create workgroups (as it includes a lot of configuration) so you will need to create one beforehand IFF you intend to use a non default workgroup. Learn More here. [Setting up Workgroups](https://docs.aws.amazon.com/athena/latest/ug/user-created-workgroups.html) |
|formatJson  | boolean | `true` |  Override as false if you rather get the raw unformatted output from S3. |
|retry  | integer | `200` milliseconds| Wait interval between re-checking if the specific Athena query has finished executing |
|getStats | boolean | `false`| Set `getStats: true` to capture additional metadata for your query, such as: <ul><li>`EngineExecutionTimeInMillis`</li><li>`DataScannedInBytes`</li><li>`TotalExecutionTimeInMillis`</li><li>`QueryQueueTimeInMillis`</li><li>`QueryPlanningTimeInMillis`</li><li>`ServiceProcessingTimeInMillis`</li><li>`DataScannedInMB`</li><li>`QueryCostInUSD`</li><li>`Count`</li><li>`QueryExecutionId`</li><li>`S3Location`</li></ul> |
|ignoreEmpty  | boolean | `true`| Ignore fields with empty values from the final JSON response.  |
|encryption | object | -- | [Encryption configuation](https://docs.aws.amazon.com/athena/latest/ug/encryption.html) example usage: <br />`{ EncryptionOption: "SSE_KMS", KmsKey: process.env.kmskey}` |
|skipResults | boolean | `false` | For a unique requirement where a user may only want to execute the query in Athena and store the results in S3 but NOT fetch those results in that moment. <br />Perhaps to be retrieved later or simply stored in S3 for auditing/logging purposes. <br />To retrieve the results, you can simply pass the `QueryExecutionId` into athena-express-plus as such: `athenaExpress.query("ab493e66-138f-4b78-a187-51f43fd5f0eb")`  |
|waitForResults  | boolean | `true` | When low latency is the objective, you can skip waiting for a query to be completed in Athena. Returns `QueryExecutionId`, which you can pass into athena-express-plus later as such: `athenaExpress.query("ab493e66-138f-4b78-a187-51f43fd5f0eb")` <br /> Not to be confused with `skipResults`, which actually waits for the query to be completed before returning `QueryExecutionId` and other stats. `waitForResults` is meant for fire-and-forget kind of operations.  <br />  |
|catalog  | string | `null` | The catalog to which the query results belong  |
|flatKeys | boolean | `false` | Don't interpret dots (.) and square brackets in header fields as nested object or array identifiers at all (treat them like regular characters for JSON field identifiers).`To prevent JSON nesting, consider setting the parameter to true.`  |
|resultReuse  | boolean | `false` | If previous query results can be reused when the query is run  |
|resultReuseMaxAge  | number | `0` | Specifies, in minutes, the maximum age of a previous query result that athena should consider for reuse  |




###### Advance Query Parameters:
```javascript
//Example showing all Query parameters.
let myQuery = {
    sql: "SELECT * FROM elb_logs LIMIT 3" // required,
    db: "sampledb", // optional. 
    pagination: 5, //optional
    NextToken: "ARfCDXRjMk...", //optional
    QueryExecutionId: "c274843b-4c5c-4ccf-ac8b-e33d595b927d", //optional
    catalog: "hive" //optional
};
```

| Parameter  | Format | Default Value | Description |
| ------------- | ------------- | ------------- | ------------- |
| sql  | string <br /> `required`  |  | The SQL query statements to be executed. <br /> E.g. "SELECT * FROM elb_logs LIMIT 3  |
| db | string <br />   | `default` |The name of the database used in the query execution. <br /> You can specify the database name here within the query itself OR in athenaExpressConfig during initialization as shown in [Advance Config Parameters](https://github.com/ghdna/athena-express#advance-config-parameters) |
| pagination | number  | `0` <br /> max: `1000` | Maximum number of results (rows) to return in a single paginated response. <br />Response includes results from page 1 along with `NextToken` and `QueryExecutionId` IFF the response was truncated <br /> To obtain the next set of pages, pass in the `NextToken` and `QueryExecutionId` back to Athena. <br /> See [example here](https://github.com/ghdna/athena-express#more-examples)	 |
| NextToken | string  | `null` | A token generated by the Athena service that specifies where to continue pagination if a previous request was truncated. To obtain the next set of pages, pass in the NextToken from the response object of the previous page call.  |
| QueryExecutionId | string  | `null` | The unique ID of the query execution. <br />To be passed into the AthenaExpress query when using the features of `Pagination`, `waitForResults` or `skipResults `  |
|catalog  | string | `null` | The catalog to which the query results belong  |
|values  | string[] | `[]` | Placeholders for the parameters  |

## Usage: Invoking athena-express-plus

###### Using Promises to query Athena:

```javascript
/*Option 1: object notation*/ 
let myQuery = {
	sql: "SELECT elb_name, request_port, request_ip FROM elb_logs LIMIT 3" /* required */,
	db: "sampledb" /* optional. You could specify a database here or in the advance configuration option mentioned above*/
};

/*OR Option 2: string notation*/ 
let myQuery = "SELECT elb_name, request_port, request_ip FROM elb_logs LIMIT 3"

athenaExpress
	.query(myQuery)
	.then(results => {
		console.log(results);
	})
	.catch(error => {
		console.log(error);
	});
```

###### Using Async/Await to query Athena:

```javascript
(async () => {
/*Option 1: object notation*/ 
	let myQuery = {
		sql: "SELECT elb_name, request_port, request_ip FROM elb_logs LIMIT 3" /* required */,
		db: "sampledb" /* optional. You could specify a database here or in the configuration constructor*/
	};
    
/*OR Option 2: string notation*/ 
let myQuery = "SELECT elb_name, request_port, request_ip FROM elb_logs LIMIT 3"

	try {
		let results = await athenaExpress.query(myQuery);
		console.log(results);
	} catch (error) {
		console.log(error);
	}
})();
```
###### Using QueryExecutionID:

Applicable only if you already have the `QueryExecutionID` from an earlier execution. See `skipResults` or `waitForResults` in the advance config params above to learn more.
```javascript
const myQueryExecutionId = "bf6ffb5f-6c36-4a66-8735-3be6275960ae";
let results = await athenaExpress.query(myQueryExecutionId);
console.log(results);
```
## Full Examples

###### Using a standalone NodeJS application

```javascript
"use strict";

const AthenaExpress = require("athena-express-plus"),
const athena = new Athena({ region: "REGION" });
const s3 = new S3({ region: "REGION" });
const athenaExpressConfig = { athena, s3, 's3Bucket': "s3://my-bucket", getStats: true};
const athenaExpress = new AthenaExpress(athenaExpressConfig);

//Invoking a query on Amazon Athena
(async () => {
	let myQuery = {
		sql: "SELECT elb_name, request_port, request_ip FROM elb_logs LIMIT 3",
		db: "sampledb"
	};

	try {
		let results = await athenaExpress.query(myQuery);
		console.log(results);
	} catch (error) {
		console.log(error);
	}
})();
```

###### Using AWS Lambda

```javascript
"use strict";

const AthenaExpress = require("athena-express-plus"),
const athena = new Athena();
const s3 = new S3();
const athenaExpressConfig = { athena, s3, 's3Bucket': "s3://my-bucket", db: "sampledb", getStats: true};

/* AWS Credentials are not required here 
/* Make sure the IAM Execution Role used by this Lambda 
/* has the necessary permission to execute Athena queries 
/* and store the result in Amazon S3 bucket
/* See configuration section above under Setup for more info */

const athenaExpress = new AthenaExpress(athenaExpressConfig);

exports.handler = async event => {
	const sqlQuery = "SELECT elb_name, request_port, request_ip FROM elb_logs LIMIT 3";

	try {
		let results = await athenaExpress.query(sqlQuery);
		return results;
	} catch (error) {
		return error;
	}
};
```

###### Results:

<img src="https://image.ibb.co/fpARNA/carbon-2.png" alt="Athena-Express-Plus result" width="400">

## More Examples
##### Pagination
######  Query to fetch results (rows) for page 1
```javascript
async function main() {
     const myQuery = {
        sql: "SELECT * from students LIMIT 100",
        pagination: 10
    };
    let results = await athenaExpress.query(myQuery);
    console.log(results);
}
main();

```
This will fetch the first 10 results (rows) off the 100 that exits in Athena. To query the next 10 rows, pass the values for `NextToken` and `QueryExecutionId` that were returned in the first query.

###### Query to fetch results (rows) for page 2 and beyond
```javascript
async function main() {
     const myQuery = {
        sql: "SELECT * from students LIMIT 100",
        pagination: 10,
        NextToken: "ARfCDXRjMkQsR1NWziK1ARgiip3umf3q0/bZmNZWeQxUDc7iSToT7uJHy2yo8nL5FyxQoIIkuPh/zDD51xld7SoALA+zhMhpZg==",
        QueryExecutionId: "c274843b-4c5c-4ccf-ac8b-e33d595b927d",
    };
    let results = await athenaExpress.query(myQuery);
    console.log(results);
}
main();

```


##### UTILITY queries
###### Show Tables (single column result)
 ```javascript
 const results = await athenaExpress.query("SHOW TABLES");
console.log(results);

//Output:
{ Items:
   [ { row: 'default' },
     { row: 'sampledb' } ] }
   ```

###### Describe Table (dual column result)

 ```javascript
 const results = await athenaExpress.query("DESCRIBE elb_logs");
console.log(results);

//Output:
{ Items:
   [ { request_timestamp: 'string' },
     { elb_name: 'string' },
     { request_ip: 'string' },
     { request_port: 'int' },
     { backend_ip: 'string' },
     { backend_port: 'int' },
     { request_processing_time: 'double' },
     { backend_processing_time: 'double' },
     { client_response_time: 'double' },
     { elb_response_code: 'string' },
     { backend_response_code: 'string' },
     { received_bytes: 'bigint' },
     { sent_bytes: 'bigint' },
     { request_verb: 'string' },
     { url: 'string' },
     { protocol: 'string' },
     { user_agent: 'string' },
     { ssl_cipher: 'string' },
     { ssl_protocol: 'string' } ] }
   ```

## Support for Parameterized Queries

With this fork, we've added support for parameterized queries. Parameterized queries enable users to build dynamic SQL queries by injecting parameters into the query string. This is especially useful when you need to execute similar queries with different values.

### Example of a Parameterized Query

Here's an example of how to use parameterized queries with Athena-Express-Plus:

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

let myQuery1 = "SELECT * FROM mydatabase.cloudfront_logs LIMIT ?";

athenaExpress
    .query(myQuery1, ['1'])
    .then(results => {
        console.log(results);
    })
    .catch(error => {
        console.log(error);
    });

```

In this example, we define a query with placeholders ? and provide the actual parameter value (string) in the values array.


### Getting Started
To get started with this fork and use parameterized queries, follow the installation and setup instructions in the original Athena-Express README.

## Contributors

Thanks to the following people who have contributed to this project.

![GitHub contributors](https://contrib.rocks/image?repo=sr-26/athena-express-plus)

## License

MIT

## Acknowledgments
I would like to acknowledge the original contributor(s) of this project for their valuable work:

- [Gary Arora](https://twitter.com/AroraGary) - Thank you for creating this amazing project.

