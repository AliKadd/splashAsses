import { Injectable, Logger } from '@nestjs/common';
import { ServiceBusClient, ServiceBusReceiver } from '@azure/service-bus';
import { MongoService } from '../../mongo/services/mongo.service';

@Injectable()
export class BigMessageQueueListenerService {
    private serviceBusClient: ServiceBusClient;
    private readonly logger = new Logger(BigMessageQueueListenerService.name);

    constructor(private readonly mongoService: MongoService) {
        this.serviceBusClient = new ServiceBusClient(process.env.AZURE_SERVICEBUS_CONNECTION_STRING);
    }

    async onModuleInit(): Promise<void> {
        await this.startListeningAndStoring();
    }

    async startListeningAndStoring(): Promise<void> {
        const receiver = this.serviceBusClient.createReceiver('bigMessageQueue') as ServiceBusReceiver;

        receiver.subscribe({
            processMessage: async (message) => {
                try {
                    const messageData = JSON.parse(message.body.toString());
                    await this.mongoService.saveMessage(messageData.username, messageData.message, 'bigMessageQueue');
                    this.logger.log(`Message from Big Message Queue has been stored in MongoDB: ${messageData}`);

                    await receiver.completeMessage(message)
                } catch (error) {
                    this.logger.error(`Error processing message from Big Message Queue: ${error}`);
                }
            },
            processError: async (err) => {
                this.logger.error(`Error in Big Message Queue processing: ${err}`);
            },
        });
    }
}
