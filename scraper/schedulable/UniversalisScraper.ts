
export interface IScraper {

}

export class UniversalisScraper implements IScraper {

    constructor(readonly baseUrl: string = "http://universalis.com/") {}

    public async scrap() {
    }
}
