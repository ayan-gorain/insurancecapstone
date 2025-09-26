// MongoDB initialization script
db = db.getSiblingDB('insurance_db');

// Create collections
db.createCollection('users');
db.createCollection('policys');
db.createCollection('userpolicys');
db.createCollection('claims');
db.createCollection('payments');
db.createCollection('auditlogs');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.policys.createIndex({ "code": 1 }, { unique: true });
db.userpolicys.createIndex({ "userId": 1 });
db.userpolicys.createIndex({ "policyId": 1 });
db.claims.createIndex({ "userId": 1 });
db.claims.createIndex({ "status": 1 });
db.payments.createIndex({ "userId": 1 });
db.payments.createIndex({ "policyId": 1 });
db.auditlogs.createIndex({ "userId": 1 });
db.auditlogs.createIndex({ "timestamp": 1 });

print('Database initialized successfully');
