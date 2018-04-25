import AWS = require("aws-sdk");
import { HeadObjectRequest } from "aws-sdk/clients/s3";

export interface IKeyValueStore {
    save(key: string, value: string): Promise<any>;
}

export class KeyValueStore implements IKeyValueStore {
    private readonly s3: AWS.S3;
    constructor(private readonly bucketName: string = process.env.STORAGE_BUCKET) {
        this.s3 = new AWS.S3({
            apiVersion: "2006-03-01",
            params: {Bucket: bucketName},
        });
    }
    public async save(key: string, value: string): Promise<any> {
        const headRequest = {Bucket: this.bucketName, Key: key} as HeadObjectRequest;
        const headObject  = await this.s3.headObject(headRequest).promise();
        return headObject;
    }
}
