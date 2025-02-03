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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
