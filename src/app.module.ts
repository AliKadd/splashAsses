import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose';
import {AzureEventHubService} from "./azure/services/eventHub.service";
import {BigMessageQueueListenerService} from "./azure/listeners/bigMessageQueueListener.service";
import {SmallMessageQueueListenerService} from "./azure/listeners/smallMessageQueueListener.service";

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_CONNECTION_STRING),
    ConfigModule.forRoot(),
    AzureEventHubService
  ],
  controllers: [AppController],
  providers: [AppService, AzureEventHubService, BigMessageQueueListenerService, SmallMessageQueueListenerService],
})
export class AppModule {}
