import { Injectable, Logger } from '@nestjs/common';
import { ServiceBusClient } from '@azure/service-bus';

@Injectable()
export class BusSenderService {
    private serviceBusClient: ServiceBusClient;
    private readonly logger = new Logger(BusSenderService.name);

    constructor() {
        this.serviceBusClient = new ServiceBusClient(process.env.AZURE_SERVICEBUS_CONNECTION_STRING);
    }

    async sendMessageToQueue(queueName: string, message: any): Promise<void> {
        const sender = this.serviceBusClient.createSender(queueName);

        try {
            if (message.length > 480) {
                const messageBody = JSON.stringify(message)
                await sender.sendMessages({ body: messageBody })
                this.logger.log(`Message has been sent to ${queueName}: ${messageBody}`)
            } else {
                this.logger.log(`Message is too big ${message}. Skipping.`);
            }
        } catch (error) {
            this.logger.error(`Error sending message to ${queueName}: ${error}`);
        } finally {
            await sender.close();
        }
    }
}