/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import * as lambda from "@aws-cdk/aws-lambda";
import * as ssm from "@aws-cdk/aws-ssm";
import { Skill } from "cdk-alexa-skill";
import {ManagedPolicy, Role, ServicePrincipal, PolicyStatement, Effect, Policy} from "@aws-cdk/aws-iam";




const ALEXA_DEVELOPER_SSM_PARAM_PREFIX = "/alexa-cdk-blog/"

export class AlexaCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Get Alexa Developer credentials from SSM Parameter Store/Secrets Manager.
    // NOTE: Parameters and secrets must have been created in the appropriate account before running `cdk deploy` on this stack.
    // See sample script at scripts/upload-credentials.sh for how to create appropriate resources via AWS CLI.
    const alexaVendorId = ssm.StringParameter.valueForStringParameter(this, `${ALEXA_DEVELOPER_SSM_PARAM_PREFIX}alexa-developer-vendor-id`);
    const lwaClientId = ssm.StringParameter.valueForStringParameter(this, `${ALEXA_DEVELOPER_SSM_PARAM_PREFIX}lwa-client-id`);
    const lwaClientSecret = cdk.SecretValue.secretsManager(`${ALEXA_DEVELOPER_SSM_PARAM_PREFIX}lwa-client-secret`);
    const lwaRefreshToken = cdk.SecretValue.secretsManager(`${ALEXA_DEVELOPER_SSM_PARAM_PREFIX}lwa-refresh-token`);
    
    //Create Lambda Layers that will be used for Skill Backend Lambda
    //Create ask-sdk-core layer

    const asksdkcore = new lambda.LayerVersion(this, "ask-sdk-core", {
      compatibleRuntimes: [
        lambda.Runtime.NODEJS_12_X,
        lambda.Runtime.NODEJS_14_X,
      ],
      code: lambda.Code.fromAsset("src/layers/ask-sdk-core"),
      description: "Uses a 3rd party library called ask-sdk-core",
    });

     //Create ask-sdk-core layer

     const awssdk = new lambda.LayerVersion(this, "aws-sdk", {
      compatibleRuntimes: [
        lambda.Runtime.NODEJS_12_X,
        lambda.Runtime.NODEJS_14_X,
      ],
      code: lambda.Code.fromAsset("src/layers/aws-sdk"),
      description: "Uses a 3rd party library called aws-sdk",
    });

    //Create role for Skill Backend Lambda
      const role = new Role(this, "MyRole", {
        assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      });
  
      role.addToPolicy(new PolicyStatement({
        actions: ["connect:*"],
        resources: ["*"],
      }));

      role.addToPolicy(new PolicyStatement({
        actions: ["sns:*"],
        resources: ["*"],
      }));


    // Create the Lambda Function for the Skill Backend
    const skillBackend = new lambda.Function(this, "SkillBackend", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("src/lambda/skill-backend"),
      handler: "index.handler",
      layers: [asksdkcore,awssdk],
      role:role,
      environment: {
        ContactFlowId: "<CONTACT FLOW ID- CreateCallbackFlow>",
        DestinationPhoneNumber:"<AMAZON CONNECT CLAIMED PHONE NUMBER E.164 FORMAT>",
        InstanceId: "<AMAZON CONNECT INSTANCE ID>",
        QueueId:"<AMAZON CONNECT BASIC QUEUE ID>"
      }
  
    });

    skillBackend.role?.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole",
      ),
    );
  
    // Create the Alexa Skill
    const skill = new Skill(this, "Skill", {
      endpointLambdaFunction: skillBackend,
      skillPackagePath: "src/skill-package",
      alexaVendorId: alexaVendorId,
      lwaClientId: lwaClientId,
      lwaClientSecret: lwaClientSecret,
      lwaRefreshToken: lwaRefreshToken
    });
  }
}