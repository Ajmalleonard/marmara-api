import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PackagesModule } from './packages/packages.module';
import { VisitsModule } from './visits/visits.module';
import { PlacesModule } from './places/places.module';
import { BookingsModule } from './bookings/bookings.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module'; 
import { ContactModule } from './contact/contact.module';
import { ConfigModule } from '@nestjs/config';
import { ReservationModule } from './reservation/reservation.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { VisaArrangementModule } from './visa-arrangement/visa-arrangement.module';
import { CarHireModule } from './car-hire/car-hire.module';
import { SecurityModule } from './security/security.module';

@Module({
  imports: [
    PackagesModule,
    VisitsModule,
    PlacesModule,
    BookingsModule,
    PrismaModule,
    AuthModule,
    ContactModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ReservationModule,
    VisaArrangementModule,
    CarHireModule,
    SecurityModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
