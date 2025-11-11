import * as z from 'zod';
import { BaseMessage } from '@langchain/core/messages';

export const BaseMessageSchema = z.instanceof(BaseMessage);
