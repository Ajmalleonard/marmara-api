import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const grpcClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    package: 'auth',
    protoPath: join(__dirname, '../../proto/auth.proto'),
    url: process.env.AUTH_SERVICE_URL || 'localhost:50051',
  },
};