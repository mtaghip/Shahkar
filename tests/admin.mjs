import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PGlite} from "@electric-sql/pglite";
import ts from "typescript";
import sharp from "sharp";
import vm from "node:vm";
function load(relative,mocks={}) {
 const source=readFileSync(new URL("../"+relative,import.meta.url),"utf8");
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const exports={};
 vm.runInNewContext(js,{exports,require:name=>{if(name in mocks)return mocks[name];throw new Error("Unexpected import: "+name);},process:{env:{}},FormData,AbortSignal,fetch:globalThis.fetch,Date,console});
 return exports;
}
const {validEmail,pageNumber}=load("src/lib/admin-validation.ts");
assert.equal(validEmail("owner@example.com"),true);
for(const value of ["invalid","x@","a\nb@example.com","a b@example.com"])assert.equal(validEmail(value),false);
assert.equal(pageNumber("-1"),1);assert.equal(pageNumber("NaN"),1);assert.equal(pageNumber("2"),2);
const {poundsToPence}=load("src/lib/money.ts");
assert.equal(poundsToPence("£1,234.50"),123450);
for(const value of ["-1","abc123","1.2.3","1.234","Infinity","9999999999999"])assert.equal(poundsToPence(value),0);
console.log("PASS input validation and money parsing");
const db=new PGlite();
await db.exec(readFileSync(new URL("../prisma/migrations/20260916125200_init/migration.sql",import.meta.url),"utf8"));
await db.exec(`
 INSERT INTO "User" ("id","email","name","passwordHash","role") VALUES ('u1','one@example.com','One','test','customer'),('a1','admin@example.com','Admin','test','admin');
 INSERT INTO "Order" ("id","reference","email","name","address","totalPence","userId") VALUES ('o1','TEST-1','one@example.com','One','Address',12500,'u1'),('o2','TEST-2','Guest@Example.com','Guest','Guest address',15000,NULL);
 INSERT INTO "Product" ("id","slug","name","tag","meta","pricePence","category","description","provenance","imageCaption","updatedAt") VALUES ('p1','test','Test','','',12500,'antique','','','',CURRENT_TIMESTAMP);
`);
await db.exec(readFileSync(new URL("../prisma/migrations/20260916180000_admin_workspace/migration.sql",import.meta.url),"utf8"));
assert.equal((await db.query('SELECT * FROM "Customer"')).rows.length,2);
assert.equal((await db.query('SELECT * FROM "Order" WHERE "customerId" IS NULL')).rows.length,0);
assert.equal((await db.query('SELECT * FROM "Customer" WHERE "marketingConsent" = true')).rows.length,0);
const product=(await db.query('SELECT * FROM "Product"')).rows[0];
assert.equal(product.status,"ACTIVE");assert.deepEqual(product.imageIds,[]);assert.equal(product.pricePence,12500);
const customer=(await db.query('SELECT * FROM "Customer" ORDER BY "email"')).rows[0];
await db.query('INSERT INTO "EmailMessage" ("id","customerId","recipient","subject","body") VALUES ($1,$2,$3,$4,$5)',["m1",customer.id,customer.email,"Hello","Your carpet update"]);
assert.equal((await db.query('UPDATE "EmailMessage" SET "status" = \'SENDING\' WHERE "id" = \'m1\' AND "status" = \'DRAFT\' RETURNING "id"')).rows.length,1);
assert.equal((await db.query('UPDATE "EmailMessage" SET "status" = \'SENDING\' WHERE "id" = \'m1\' AND "status" = \'DRAFT\' RETURNING "id"')).rows.length,0);
await assert.rejects(db.query('INSERT INTO "Customer" ("id","email","name") VALUES ($1,$2,$3)',["duplicate",customer.email,"Duplicate"]));
const photo=await sharp({create:{width:2100,height:1400,channels:3,background:"#8d3229"}}).png().toBuffer();
const webp=await sharp(photo,{limitInputPixels:30_000_000}).rotate().resize(1600,1600,{fit:"inside",withoutEnlargement:true}).webp({quality:80}).toBuffer();
assert.equal((await sharp(webp).metadata()).width,1600);
await db.query('INSERT INTO "Media" ("id","data") VALUES ($1,$2)',["photo1",webp]);
await db.query('UPDATE "Product" SET "imageIds" = ARRAY[$1], "status" = \'DRAFT\' WHERE "id" = \'p1\' ',["photo1"]);
assert.equal((await db.query('SELECT * FROM "Product" WHERE "status" = \'ACTIVE\'')).rows.length,0);
assert.equal((await db.query('SELECT "data" FROM "Media" WHERE "id" = \'photo1\'')).rows[0].data.length,webp.length);
await db.close();
console.log("PASS PostgreSQL migrations, customer backfill, existing product preservation, draft filtering, email send lock, photo conversion and storage");
// Every mutation must reject non-admin access before touching the database.
for(const [file,functions] of [
 ["src/lib/actions/customers.ts",["saveCustomer"]],
 ["src/lib/actions/email.ts",["saveEmail","sendEmail"]],
 ["src/lib/actions/admin.ts",["createProductAction","updateProductAction","deleteProductAction","setOrderStatusAction"]]
]){
 const actions=load(file,{"@/lib/auth":{requireAdmin:async()=>{throw new Error("ADMIN_REQUIRED");}},"@/lib/prisma":{prisma:new Proxy({},{get(){throw new Error("DB accessed before authentication");}})},"@/lib/admin-validation":{validEmail,emailConfigured:()=>false},"next/navigation":{},"next/cache":{},"@/lib/money":{poundsToPence},"@/lib/products":{slugify:x=>x}});
 for(const name of functions)await assert.rejects(actions[name](null,{},new FormData()),/ADMIN_REQUIRED/);
}
console.log("PASS unauthenticated admin mutation protection");
