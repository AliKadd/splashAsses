import { Test, TestingModule } from '@nestjs/testing';
import { SmallMessageQueueListenerService } from '../src/azure/listeners/smallMessageQueueListener.service';
import { BigMessageQueueListenerService } from '../src/azure/listeners/bigMessageQueueListener.service';
import { MongoService } from '../src/mongo/services/mongo.service';

describe('HighValueQueueListenerService', () => {
    let smallMessageListener: SmallMessageQueueListenerService;
    let bigMessageListener: BigMessageQueueListenerService;
    let mongoService: MongoService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [SmallMessageQueueListenerService, BigMessageQueueListenerService, MongoService],
        }).compile();

        smallMessageListener = module.get<SmallMessageQueueListenerService>(SmallMessageQueueListenerService);
        bigMessageListener = module.get<BigMessageQueueListenerService>(BigMessageQueueListenerService);
        mongoService = module.get<MongoService>(MongoService);
    });

    it('should be defined', () => {
        expect(smallMessageListener).toBeDefined();
        expect(bigMessageListener).toBeDefined();
    });

    describe('bigMessageListener', () => {
        it('should process message and save in mongo DB', async () => {
            const sampleMessage = { username: 'test_user', message: 'Here should be a big message' };

            jest.spyOn(bigMessageListener, 'startListeningAndStoring').mockImplementation(async () => {
                await bigMessageListener['processMessage'](sampleMessage);
            });

            const saveMessageSpy = jest.spyOn(mongoService, 'saveMessage').mockResolvedValueOnce({
                username: 'test_user',
                message: 'Here should be a big message',
                queue: 'bigMessageQueue',
                timestamp: new Date(),
            });
            const completeMessageSpy = jest.spyOn(bigMessageListener['receiver'], 'completeMessage').mockResolvedValueOnce();

            await bigMessageListener.startListeningAndStoring();

            expect(saveMessageSpy).toHaveBeenCalledWith(sampleMessage.username, sampleMessage.message);
            expect(completeMessageSpy).toHaveBeenCalled();
        });

    });

    describe('smallMessageListener', () => {
        it('should process message and save in mongo DB', async () => {
            const sampleMessage = { username: 'test_user', message: 'Here should be a small message' };

            jest.spyOn(smallMessageListener, 'startListeningAndStoring').mockImplementation(async () => {
                await smallMessageListener['processMessage'](sampleMessage);
            });

            const saveMessageSpy = jest.spyOn(mongoService, 'saveMessage').mockResolvedValueOnce({
                username: 'test_user',
                message: 'Here should be a small message',
                queue: 'smallMessageQueue',
                timestamp: new Date(),
            });
            const completeMessageSpy = jest.spyOn(smallMessageListener['receiver'], 'completeMessage').mockResolvedValueOnce();

            await smallMessageListener.startListeningAndStoring();

            expect(saveMessageSpy).toHaveBeenCalledWith(sampleMessage.username, sampleMessage.message);
            expect(completeMessageSpy).toHaveBeenCalled();
        });

    });
});