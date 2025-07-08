import { Auth, google, sheets_v4 } from 'googleapis';
import { spreadsheetId } from '../constant';

export default class Google {
    private auth: null | Auth.GoogleAuth;
    private client: null | Auth.AnyAuthClient;
    private sheets: null | sheets_v4.Sheets;

    constructor() {
        this.auth = null;
        this.client = null;
        this.sheets = null;
    }

    async init() {
        try {
            this.auth = new google.auth.GoogleAuth({
                keyFile: '../../credentials.json',
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
            process.exit(1);
        }
    }

    async getMetaData() {
        const metaData = await this.sheets?.spreadsheets.get({
            auth: this.auth as any,
            spreadsheetId,
        });
        console.log(metaData);
    }
}
