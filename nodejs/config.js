const config = {
  url: process.env.SALESFORCE_URL || 'https://test.salesforce.com',
  username: process.env.SALESFORCE_USER ||'<username>',
  password: process.env.SALESFORCE_PASS ||'<password>',
  numberOfInstances: parseInt(process.env.STRESS_INSTANCE_COUNT) || 20,
};

module.exports = { config };
