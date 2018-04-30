import AWS = require("aws-sdk");
import { HeadObjectRequest, PutObjectRequest, HeadObjectOutput, PutObjectOutput } from "aws-sdk/clients/s3";
import { isNil } from "lodash";

export interface IKeyValueStore {
    save(key: string, value: string): Promise<object>;
}

export class KeyValueStore implements IKeyValueStore {
    private readonly s3: AWS.S3;
    constructor(private readonly bucketName: string = process.env.STORAGE_BUCKET) {
        this.s3 = new AWS.S3({
            apiVersion: "2006-03-01",
            params: {Bucket: bucketName},
        });
    }
    public async save(key: string, value: string): Promise<object> {
        const headRequest = {Bucket: this.bucketName, Key: key} as HeadObjectRequest;
        const headObject  = await this.s3.headObject(headRequest).promise().catch(e => null);
        if (!isNil(headObject)) {
            console.log(`No needs to save ${key} file, record already exists`);
            return null;
        }
        const request = {Bucket: this.bucketName, Key: key, Body: value} as PutObjectRequest;
        const result = await this.s3.putObject(request).promise().catch(e => this.handleError(e));
        return result;
    }

    private handleError(e) {
        console.error(e);
        return null;
    }
}
