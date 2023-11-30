import { Injectable, Logger } from '@nestjs/common';
import { EventHubConsumerClient } from '@azure/event-hubs';
import { BusSenderService } from './serviceBusSender.service';

@Injectable()
export class AzureEventHubService {
    private eventHubClient: EventHubConsumerClient;
    private readonly logger = new Logger(AzureEventHubService.name);

    constructor(private readonly busServiceSender: BusSenderService) {
        const connectionString = process.env.AZURE_EVENTHUB_CONNECTION_STRING;
        const eventHubName = 'eventHubName';
        const consumerGroup = '$Default';

        this.eventHubClient = new EventHubConsumerClient(consumerGroup, connectionString, eventHubName);
    }

    async onModuleInit(): Promise<void> {
        await this.startListening();
    }

    async startListening(): Promise<void> {
        const subscription = this.eventHubClient.subscribe({
            processEvents: async (events, context) => {
                for (const event of events) {
                    try {
                        const eventData = JSON.parse(event.body.toString());
                        const username = eventData?.username || '';
                        const message = eventData?.message || 'Message empty'
                        if (username === '') {
                            this.logger.error("Username received with event is empty")
                        } else {
                            if (message.length > 240) {
                                await this.busServiceSender.sendMessageToQueue('bigMessageQueue', eventData);
                            } else {
                                await this.busServiceSender.sendMessageToQueue('smallMessageQueue', eventData);
                            }
                        }
                        await context.updateCheckpoint(event)
                        this.logger.log(`Received a message from ${username}`, message)
                    } catch (error) {
                        this.logger.error(`Error processing event: ${error}`);
                    }
                }
            },
            processError: async (err, context) => {
                this.logger.error(`Error in event hub processing: ${err}`);
            },
        });

        process.on('SIGINT', async () => {
            await subscription.close();
            await this.eventHubClient.close();
            process.exit(0);
        });
    }
}