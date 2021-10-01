import Dexie from 'dexie';

const db = new Dexie('dictionary');
db.version(1).stores({
  portuguese: 'name,value,length',
  english: 'name,value,length',
  versions: 'language,version'
});
console.log({db});
export default db;
