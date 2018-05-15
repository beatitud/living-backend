import * as AWS from "aws-sdk";
import { isNil, get } from "lodash";
import { HeadObjectRequest,
         PutObjectRequest} from "aws-sdk/clients/s3";

export interface IKeyValueStore {
    save(key: string, value: string): Promise<object>;
    hasKey(key: string): Promise<boolean>;
}

export interface IHasKey {
    hasIt: boolean;
    key: string;
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
        if (await this.hasKey(key)) {
            console.log(`No needs to save ${key} file, record already exists`);
            return null;
        }
        const request = {Bucket: this.bucketName, Key: key, Body: value} as PutObjectRequest;
        const result = await this.s3.putObject(request).promise().catch(e => this.handleError(e));
        return result;
    }

    public async hasKey(key: string): Promise<boolean> {
        const headRequest = {Bucket: this.bucketName, Key: key} as HeadObjectRequest;
        const hasHeadObject = await this.s3
            .headObject(headRequest).promise()
            .then(x => true)
            .catch(e => this.handleHeadError(e));

        if (isNil(hasHeadObject)) {
            throw new Error(`Key ${key} has provoked an exception`);
        }

        return hasHeadObject;
    }

    // noinspection JSMethodCanBeStatic
    private handleError(e) {
        console.error(e);
        return null;
    }

    // noinspection JSMethodCanBeStatic
    private handleHeadError(e) {
        if (get(e, "code", "") === "NotFound") {
            return false;
        }
        console.error(e);
        return null;
    }
}
