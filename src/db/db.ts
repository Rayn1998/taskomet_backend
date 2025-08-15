import { Pool } from 'pg';
import { dbData } from '@/constant';

const dataBasePool = new Pool(dbData);

export default dataBasePool;
