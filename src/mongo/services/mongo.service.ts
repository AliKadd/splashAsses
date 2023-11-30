import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from '../schemas/message.schema';

@Injectable()
export class MongoService {
  private readonly logger = new Logger(MongoService.name);

  constructor(@InjectModel('Message') private readonly messageModel: Model<Message>) {}

  async saveMessage(username: string, text: string, queue: string): Promise<Message> {
    try {
      const message = new this.messageModel({ username: username, message: text, queue: queue, timestamp: new Date() })
      return message.save()
    } catch (error) {
      this.logger.error(`Error inserting message to MongoDB: ${error}`);
      throw new Error(`Error inserting message to MongoDB: ${error}`);
    }
  }

  async getAllMessages(): Promise<Message[]> {
    try {
      return await this.messageModel.find().exec()
    } catch (error) {
      this.logger.error(`Error fetching message from MongoDB: ${error}`)
      throw new Error(`Error fetching message from MongoDB: ${error}`);
    }
  }
}