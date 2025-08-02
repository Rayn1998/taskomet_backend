import { Auth, google, sheets_v4 } from 'googleapis';
import { join } from 'path';
import { readFile } from 'fs/promises';
import { spreadsheetId } from '../constant';

const credentials = join(__dirname, '../..', 'credentials.json');

export default class Google {
    private auth: null | Auth.GoogleAuth;
    private client: null | Auth.AnyAuthClient;
    private sheets: null | sheets_v4.Sheets;

    constructor() {
        this.auth = null;
        this.client = null;
        this.sheets = null;
    }

    public async init(): Promise<boolean> {
        try {
            this.auth = new google.auth.GoogleAuth({
                keyFile: credentials,
                scopes: 'https://www.googleapis.com/auth/spreadsheets',
            });

            this.client = await this.auth.getClient();
            this.sheets = google.sheets({
                version: 'v4',
                auth: this.client as any,
            });

            console.log('google services connected');
        } catch (err) {
            console.error('something went wrong: ', err);
            return false;
        }
        return true;
    }

    public async getProjects() {
        return await this.sheets?.spreadsheets.values.get({
            auth: this.auth as any,
            spreadsheetId,
            range: 'projects',
        });
    }

    //FOR TEST
    public async getHOLtasks() {
        return await this.sheets?.spreadsheets.values.get({
            auth: this.auth as any,
            spreadsheetId,
            range: 'HOL_tasks',
        });
    }

    // FOR TEST
    public async getMetaData() {
        const metaData = await this.sheets?.spreadsheets.get({
            auth: this.auth as any,
            spreadsheetId,
        });
        console.log(metaData);
    }
}
