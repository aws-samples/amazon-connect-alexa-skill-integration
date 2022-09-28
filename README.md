## amazon-connect-alexa-skill-integration
### Deployment Steps
1.	Clone code repository
2.	Sign into your Amazon Connect instance.
3.	Navigate to the “Routing” tab, select “Contact flows” and click on “Create contact flow”.
4.	Click on the drop-down menu (arrow) next to “Save” and select “Import flow (beta)”.
5.	Click on “Select” and choose the /ConnectContactFlows/CreateCallBackFlow file downloaded from step 1.
6.	Click on “Save” and “Publish”.
7.	Repeat steps 3 through 6 for /ConnectContactFlows/ChatCustomerQueue.
8.	Update Alexa Parameters under /scripts/upload-credentials.sh
    | Parameter Name                            | Service                | Type                      | Description                        |
    | ----------------------------------------- | ---------------------- | ------------------------- | ---------------------------------- |
    | /alexa-cdk-blog/alexa-developer-vendor-id | SSM Parameter          | String                    | Alexa Developer Vendor ID          |
    | /alexa-cdk-blog/lwa-client-id             | SSM Parameter          | String                    | LWA Security Profile Client ID     |
    | /alexa-cdk-blog/lwa-client-secret         | Secrets Manager Secret | Plaintext / secret-string | LWA Security Profile Client Secret |
    | /alexa-cdk-blog/lwa-refresh-token         | Secrets Manager Secret | Plaintext / secret-string | LWA Security Profile Refresh Token 

9.	Update the website (with Amazon Connect Chat widget) URL in the TrainerCallbackIntentHandler section in /src/lambda/skill-backend/index.js file with your website URL.
10.	Update the Amazon Connect attributes in /lib/alexa-cdk-stack.ts file under the “Lambda Function for the Skill Backend” section:
    1.	ContactFlowID: this is the ID for the CreateCallbackFlow contact flow.
    2.	DetinationPhoneNumber: this is your Claimed Phone Number in E.164 format.
    3.	InstanceID: this is your Amazon Connect instance ID.
    4.	QueueID: this is your BasicQueue ID.
11.	Install dependencies in project directory:
    1. cd connectAlexa
    2. npm install
    3. cd connectAlexa/src/layers/ask-sdk-core/nodejs
    4. npm install
    5. cd ../../../../
    6. cd connectAlexa/src/layers/aws-sdk/nodejs
    7. npm install
12.	Bootstrap your AWS account for CDK: npx cdk bootstrap aws://<your_AWS_account>/<your_AWS_region>
13.	Synthesize your project: npx cdk synth
14.	Deploy your project: npx cdk deploy
15.	Approve the IAM policies changes by entering y when prompted.
16. Once the CDK Stack deployment is complete, you are ready to test the Alexa skill from Alexa Developer Console.


## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.