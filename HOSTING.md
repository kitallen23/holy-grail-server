# AWS Lambda + RDS Serverless Hosting Guide

This guide walks through deploying the Diablo 2 Holy Grail Server to AWS using Lambda + RDS Serverless v2 for cost-effective, scalable hosting.

## Why This Stack?

- **Cost-effective**: Pay only when used, scales to near-zero when idle
- **DDoS protection**: Built-in AWS protections prevent malicious cost spikes
- **Minimal refactoring**: Fastify works great with Lambda
- **Auto-scaling**: Handles traffic spikes automatically

## Prerequisites

- AWS Account
- macOS/Linux/Windows with terminal access
- Node.js 18+ and pnpm installed
- Basic familiarity with command line

## Step 1: Install Required Tools

### Install AWS SAM CLI

**macOS (via Homebrew):**
```bash
brew install aws-sam-cli
```

**Windows:**
Download from: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html

**Linux:**
```bash
# Download and install
wget https://github.com/aws/aws-sam-cli/releases/latest/download/aws-sam-cli-linux-x86_64.zip
unzip aws-sam-cli-linux-x86_64.zip -d sam-installation
sudo ./sam-installation/install
```

### Verify Installation

```bash
# Check AWS CLI
aws --version

# Check SAM CLI
sam --version

# Verify AWS credentials
aws sts get-caller-identity
```

## Step 2: Prepare Code for Lambda

### Install Lambda Dependencies

```bash
pnpm add @fastify/aws-lambda
pnpm add -D @types/aws-lambda
```

### Create Lambda Handler

Create `src/lambda.ts`:
```typescript
import { awsLambdaFastify } from '@fastify/aws-lambda'
import { app } from './server.js'

export const handler = awsLambdaFastify(app, {
  decorateRequest: false
})
```

### Modify server.ts

Export the Fastify app instance:
```typescript
// At the end of server.ts, export the app
export { fastify as app }

// Modify the start function to only run when not in Lambda
const start = async () => {
  // Only start server if not in Lambda environment
  if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
    try {
      const port = Number(process.env.PORT) || 3000;
      await fastify.listen({ port, host: "0.0.0.0" });
      console.info(`Server running on port ${port}`);

      cleanupExpiredSessions();
      setInterval(
        async () => {
          await cleanupExpiredSessions();
        },
        24 * 60 * 60 * 1000
      );
    } catch (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  }
};

start();
```

### Update package.json Scripts

Add Lambda-specific scripts:
```json
{
  "scripts": {
    "build:lambda": "tsc && cp package.json dist/",
    "sam:build": "sam build",
    "sam:deploy": "sam deploy --guided",
    "sam:local": "sam local start-api"
  }
}
```

## Step 3: Create SAM Template

Create `template.yaml` in project root:
```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: Diablo 2 Holy Grail Server

Globals:
  Function:
    Timeout: 30
    Runtime: nodejs18.x
    Environment:
      Variables:
        NODE_ENV: production

Parameters:
  Environment:
    Type: String
    Default: dev
    AllowedValues: [dev, prod]

Resources:
  # Lambda Function
  HolyGrailApi:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: dist/
      Handler: lambda.handler
      Events:
        ApiEvent:
          Type: Api
          Properties:
            Path: /{proxy+}
            Method: ANY
        RootEvent:
          Type: Api
          Properties:
            Path: /
            Method: ANY
      Environment:
        Variables:
          DATABASE_URL: !Sub 
            - "postgresql://${Username}:${Password}@${Endpoint}:5432/${DatabaseName}"
            - Username: !Ref DBUsername
              Password: !Ref DBPassword
              Endpoint: !GetAtt Database.Endpoint.Address
              DatabaseName: !Ref DatabaseName

  # RDS Serverless v2 Cluster
  Database:
    Type: AWS::RDS::DBCluster
    Properties:
      Engine: aurora-postgresql
      EngineMode: provisioned
      EngineVersion: '15.4'
      DatabaseName: !Ref DatabaseName
      MasterUsername: !Ref DBUsername
      MasterUserPassword: !Ref DBPassword
      ServerlessV2ScalingConfiguration:
        MinCapacity: 0.5
        MaxCapacity: 2
      VpcSecurityGroupIds:
        - !Ref DatabaseSecurityGroup
      DBSubnetGroupName: !Ref DatabaseSubnetGroup

  DatabaseInstance:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceClass: db.serverless
      DBClusterIdentifier: !Ref Database
      Engine: aurora-postgresql

  # VPC and Security Groups
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true

  DatabaseSubnetGroup:
    Type: AWS::RDS::DBSubnetGroup
    Properties:
      DBSubnetGroupDescription: Subnet group for RDS
      SubnetIds:
        - !Ref PrivateSubnet1
        - !Ref PrivateSubnet2

  PrivateSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      CidrBlock: 10.0.1.0/24
      AvailabilityZone: !Select [0, !GetAZs '']

  PrivateSubnet2:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      CidrBlock: 10.0.2.0/24
      AvailabilityZone: !Select [1, !GetAZs '']

  DatabaseSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Security group for RDS
      VpcId: !Ref VPC
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 5432
          ToPort: 5432
          SourceSecurityGroupId: !Ref LambdaSecurityGroup

  LambdaSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Security group for Lambda
      VpcId: !Ref VPC

Parameters:
  DatabaseName:
    Type: String
    Default: d2_holy_grail
  DBUsername:
    Type: String
    Default: postgres
  DBPassword:
    Type: String
    NoEcho: true
    MinLength: 8

Outputs:
  ApiUrl:
    Description: API Gateway endpoint URL
    Value: !Sub "https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/"
  DatabaseEndpoint:
    Description: RDS Cluster Endpoint
    Value: !GetAtt Database.Endpoint.Address
```

## Step 4: Store Secrets in AWS Parameter Store

Before deployment, store your secrets securely in AWS Parameter Store (never commit secrets to git):

```bash
# Store OAuth credentials (replace with your actual values)
aws ssm put-parameter --name "/holy-grail/prod/google-client-id" --value "your-google-client-id" --type "String"
aws ssm put-parameter --name "/holy-grail/prod/google-client-secret" --value "your-google-client-secret" --type "String"
aws ssm put-parameter --name "/holy-grail/prod/discord-client-id" --value "your-discord-client-id" --type "String"
aws ssm put-parameter --name "/holy-grail/prod/discord-client-secret" --value "your-discord-client-secret" --type "String"
```

**Note:** The template.yaml file references these parameters securely:
- `CLIENT_URL` is set directly to your production frontend URL
- All secrets use `{{resolve:ssm:...}}` syntax to pull from Parameter Store
- This keeps your template safe to commit to git

## Step 5: Deploy to AWS

### Build the Application
```bash
pnpm build:lambda
sam build
```

### Deploy (First Time)
```bash
sam deploy --guided
```

This will prompt you for:
- **Stack name**: e.g., `holy-grail-server`
- **AWS Region**: e.g., `us-east-1`
- **Parameter Environment**: `prod` (to use /holy-grail/prod/ parameter paths)
- **Parameter DatabaseName**: Press Enter for default `d2_holy_grail`
- **Parameter DBUsername**: Press Enter for default `postgres`
- **Parameter DBPassword**: Generate strong password with password manager (min 8 chars)
- **Confirm changes before deploy**: `Y`
- **Allow SAM CLI IAM role creation**: `Y` (needed for Lambda permissions)
- **Disable rollback**: Press Enter for default `N` (keeps rollback enabled)
- **HolyGrailApi has no authentication**: `Y` (app handles auth, not API Gateway)
- **Save arguments to configuration file**: `Y` (saves settings to samconfig.toml)
- **SAM configuration environment**: Press Enter for default `default`

### Subsequent Deploys
```bash
pnpm build:lambda
sam build
sam deploy
```

## Step 6: Database Setup

### Run Migrations
After deployment, you'll need to run your database migrations:

```bash
# Get the database URL from AWS Console or SAM outputs
export DATABASE_URL="postgresql://postgres:password@your-cluster.amazonaws.com:5432/d2_holy_grail"

# Run migrations
pnpm db:generate
pnpm db:migrate
```

## Step 7: Update OAuth Settings

Update your OAuth applications with the new Lambda URLs:

### Google OAuth
- Authorized redirect URIs: `https://your-api-id.execute-api.region.amazonaws.com/Prod/auth/google/callback`

### Discord OAuth  
- Redirect URIs: `https://your-api-id.execute-api.region.amazonaws.com/Prod/auth/discord/callback`

## Step 8: Testing

### Test Locally (Optional)
```bash
sam local start-api
# Test at http://localhost:3000
```

### Test Production
```bash
curl https://your-api-id.execute-api.region.amazonaws.com/Prod/health
```

## Cost Monitoring

### Set Up Billing Alerts
1. Go to AWS Billing Console
2. Create billing alert for $10/month
3. Set up CloudWatch alarms for Lambda invocations

### Expected Costs
- **Low traffic**: $2-5/month
- **Medium traffic**: $10-20/month  
- **High traffic**: $30-50/month

RDS Serverless scales to ~$0.90/month when idle.

## Security Features

### Built-in Protections
- API Gateway rate limiting (10,000 requests/second default)
- Lambda concurrency limits prevent runaway costs
- VPC isolation for database
- AWS Shield Standard DDoS protection

### Additional Security (Optional)
Add AWS WAF for advanced protection:
```bash
# Add to template.yaml under Resources
WebACL:
  Type: AWS::WAFv2::WebACL
  Properties:
    Scope: REGIONAL
    DefaultAction:
      Allow: {}
    Rules:
      - Name: RateLimitRule
        Priority: 1
        Statement:
          RateBasedStatement:
            Limit: 2000
            AggregateKeyType: IP
        Action:
          Block: {}
```

## Troubleshooting

### Common Issues

**Lambda timeout:**
- Increase timeout in template.yaml
- Check database connection pooling

**Database connection errors:**
- Verify VPC configuration
- Check security group rules
- Ensure Lambda has VPC permissions

**OAuth redirect errors:**
- Update OAuth app settings with correct Lambda URLs
- Check CORS configuration

### Useful Commands

```bash
# View logs
sam logs -n HolyGrailApi --tail

# Delete stack (cleanup)
sam delete

# Local testing
sam local start-api --env-vars env.json
```

## Maintenance

### Updates
```bash
# Update code
pnpm build:lambda
sam build
sam deploy

# Update dependencies
pnpm update
```

### Monitoring
- CloudWatch logs for Lambda function
- RDS Performance Insights for database
- AWS Cost Explorer for spending

### Backups
RDS Serverless automatically creates backups. Manual backup:
```bash
aws rds create-db-cluster-snapshot \
  --db-cluster-identifier your-cluster \
  --db-cluster-snapshot-identifier manual-backup-$(date +%Y%m%d)
```

## Next Steps

1. Set up custom domain with Route 53
2. Add CloudFront CDN for better performance
3. Implement proper logging and monitoring
4. Set up CI/CD pipeline with GitHub Actions

---

## Support

For issues with this deployment:
1. Check AWS CloudWatch logs
2. Review SAM documentation: https://docs.aws.amazon.com/serverless-application-model/
3. AWS Lambda documentation: https://docs.aws.amazon.com/lambda/
