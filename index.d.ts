declare module 'athena-express-plus' {
    import { S3ClientConfig } from '@aws-sdk/client-s3';
    import { AthenaClientConfig } from '@aws-sdk/client-athena';
    interface ConnectionConfigInterface {
        s3: S3ClientConfig;
        athena: AthenaClientConfig;
        s3Bucket: string;
        getStats: boolean;
        db: string,
        workgroup: string,
        formatJson: boolean,
        retry: number,
        ignoreEmpty: boolean,
        encryption: Record<string, string>,
        skipResults: boolean,
        waitForResults: boolean,
        catalog: string,
        pagination: string,
        flatKeys: boolean,
        resultReuse: boolean,
        resultReuseMaxAge: number;
    }

    interface QueryResultsInterface<T> {
        Items: T[];
        DataScannedInMB: number;
        QueryCostInUSD: number;
        EngineExecutionTimeInMillis: number;
        S3Location: string;
        QueryExecutionId: string;
        NextToken: string;
        Count: number;
        DataScannedInBytes: number;
        TotalExecutionTimeInMillis: number;
        QueryQueueTimeInMillis: number;
        QueryPlanningTimeInMillis: number;
        ServiceProcessingTimeInMillis: number;
    }

    interface QueryObjectInterface {
        sql: string;
        db?: string;
        pagination?: number;
        NextToken?: string;
        QueryExecutionId?: string;
        catalog?: string;
        values?: string[]
    }

    interface QueryOptionsInterface {
        resultReuse?: boolean,
        resultReuseMaxAge?: number;
    }

    type DirectQueryString = string;
    type QueryExecutionId = string;

    type OptionalQueryResultsInterface<T> = Partial<QueryResultsInterface<T>> & Pick<QueryResultsInterface<T>, 'QueryExecutionId'>;
    type QueryResult<T> = OptionalQueryResultsInterface<T>;
    type QueryFunc<T> = (query: QueryObjectInterface|DirectQueryString|QueryExecutionId, values?: string[], options?: QueryOptionsInterface) => Promise<QueryResult<T>>;

    class AthenaExpress<T> {
        public new: (config: Partial<ConnectionConfigInterface>) => any;
        public query: QueryFunc<T>;
        constructor(config: Partial<ConnectionConfigInterface>);
    }
}
