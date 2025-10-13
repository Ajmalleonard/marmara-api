import { Injectable, BadRequestException } from '@nestjs/common';
import { PassengerInput } from '../dto/flight-booking.input';

@Injectable()
export class PassengerValidationService {
  /**
   * Validate passenger information for flight booking
   */
  validatePassengers(passengers: PassengerInput[]): void {
    if (!passengers || passengers.length === 0) {
      throw new BadRequestException('At least one passenger is required');
    }

    // Check for lead passenger
    const leadPassengers = passengers.filter(p => p.isLeadPassenger);
    if (leadPassengers.length !== 1) {
      throw new BadRequestException('Exactly one lead passenger must be specified');
    }

    // Validate each passenger
    passengers.forEach((passenger, index) => {
      this.validateIndividualPassenger(passenger, index);
    });

    // Check for duplicate passengers
    this.checkForDuplicatePassengers(passengers);
  }

  /**
   * Validate individual passenger data
   */
  private validateIndividualPassenger(passenger: PassengerInput, index: number): void {
    const passengerPrefix = `Passenger ${index + 1}`;

    // Validate name format
    this.validateName(passenger.firstName, `${passengerPrefix} first name`);
    this.validateName(passenger.lastName, `${passengerPrefix} last name`);
    if (passenger.middleName) {
      this.validateName(passenger.middleName, `${passengerPrefix} middle name`);
    }

    // Validate date of birth
    this.validateDateOfBirth(passenger.dateOfBirth, passengerPrefix);

    // Validate document information
    this.validateDocument(passenger, passengerPrefix);

    // Validate contact information if provided
    if (passenger.email) {
      this.validateEmail(passenger.email, `${passengerPrefix} email`);
    }

    if (passenger.phone) {
      this.validatePhone(passenger.phone, `${passengerPrefix} phone`);
    }

    // Validate country codes
    this.validateCountryCode(passenger.nationality, `${passengerPrefix} nationality`);
    this.validateCountryCode(passenger.issuingCountry, `${passengerPrefix} issuing country`);
  }

  /**
   * Validate name format (letters, spaces, hyphens, apostrophes only)
   */
  private validateName(name: string, fieldName: string): void {
    if (!name || name.trim().length === 0) {
      throw new BadRequestException(`${fieldName} is required`);
    }

    const nameRegex = /^[a-zA-Z\s\-'\.]+$/;
    if (!nameRegex.test(name)) {
      throw new BadRequestException(
        `${fieldName} can only contain letters, spaces, hyphens, apostrophes, and periods`
      );
    }

    if (name.length < 2 || name.length > 50) {
      throw new BadRequestException(`${fieldName} must be between 2 and 50 characters`);
    }
  }

  /**
   * Validate date of birth
   */
  private validateDateOfBirth(dateOfBirth: string, passengerPrefix: string): void {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const maxAge = 120;
    const minAge = 0;

    if (isNaN(birthDate.getTime())) {
      throw new BadRequestException(`${passengerPrefix} date of birth is invalid`);
    }

    if (birthDate > today) {
      throw new BadRequestException(`${passengerPrefix} date of birth cannot be in the future`);
    }

    const age = today.getFullYear() - birthDate.getFullYear();
    if (age > maxAge) {
      throw new BadRequestException(`${passengerPrefix} age cannot exceed ${maxAge} years`);
    }

    if (age < minAge) {
      throw new BadRequestException(`${passengerPrefix} must be at least ${minAge} years old`);
    }
  }

  /**
   * Validate document information
   */
  private validateDocument(passenger: PassengerInput, passengerPrefix: string): void {
    // Validate document number
    if (!passenger.documentNumber || passenger.documentNumber.trim().length === 0) {
      throw new BadRequestException(`${passengerPrefix} document number is required`);
    }

    // Basic document number format validation
    const docNumber = passenger.documentNumber.trim();
    if (docNumber.length < 3 || docNumber.length > 20) {
      throw new BadRequestException(
        `${passengerPrefix} document number must be between 3 and 20 characters`
      );
    }

    // Validate document expiry if provided
    if (passenger.documentExpiry) {
      const expiryDate = new Date(passenger.documentExpiry);
      const today = new Date();

      if (isNaN(expiryDate.getTime())) {
        throw new BadRequestException(`${passengerPrefix} document expiry date is invalid`);
      }

      if (expiryDate <= today) {
        throw new BadRequestException(`${passengerPrefix} document has expired or expires today`);
      }

      // Document should be valid for at least 6 months from travel date
      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
      
      if (expiryDate < sixMonthsFromNow) {
        throw new BadRequestException(
          `${passengerPrefix} document should be valid for at least 6 months from travel date`
        );
      }
    }
  }

  /**
   * Validate email format
   */
  private validateEmail(email: string, fieldName: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException(`${fieldName} format is invalid`);
    }
  }

  /**
   * Validate phone number format
   */
  private validatePhone(phone: string, fieldName: string): void {
    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');
    
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      throw new BadRequestException(`${fieldName} must be between 7 and 15 digits`);
    }
  }

  /**
   * Validate country code (ISO 3166-1 alpha-2)
   */
  private validateCountryCode(countryCode: string, fieldName: string): void {
    if (!countryCode || countryCode.length !== 2) {
      throw new BadRequestException(`${fieldName} must be a valid 2-letter country code`);
    }

    // Basic format check - should be uppercase letters
    if (!/^[A-Z]{2}$/.test(countryCode)) {
      throw new BadRequestException(`${fieldName} must be uppercase 2-letter country code`);
    }
  }

  /**
   * Check for duplicate passengers based on document number
   */
  private checkForDuplicatePassengers(passengers: PassengerInput[]): void {
    const documentNumbers = new Set<string>();
    
    for (const passenger of passengers) {
      const docNumber = passenger.documentNumber.trim().toLowerCase();
      
      if (documentNumbers.has(docNumber)) {
        throw new BadRequestException(
          `Duplicate passenger found with document number: ${passenger.documentNumber}`
        );
      }
      
      documentNumbers.add(docNumber);
    }
  }

  /**
   * Validate passenger age categories for flight booking
   */
  validatePassengerAgeCategories(passengers: PassengerInput[], travelDate: Date): {
    adults: number;
    children: number;
    infants: number;
  } {
    let adults = 0;
    let children = 0;
    let infants = 0;

    passengers.forEach((passenger, index) => {
      const birthDate = new Date(passenger.dateOfBirth);
      const ageAtTravel = this.calculateAgeAtDate(birthDate, travelDate);

      if (ageAtTravel >= 18) {
        adults++;
      } else if (ageAtTravel >= 2) {
        children++;
      } else {
        infants++;
      }
    });

    // Validate age category rules
    if (adults === 0) {
      throw new BadRequestException('At least one adult passenger (18+) is required');
    }

    if (infants > adults) {
      throw new BadRequestException('Number of infants cannot exceed number of adults');
    }

    return { adults, children, infants };
  }

  /**
   * Calculate age at a specific date
   */
  private calculateAgeAtDate(birthDate: Date, targetDate: Date): number {
    let age = targetDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = targetDate.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && targetDate.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Validate special requirements
   */
  validateSpecialRequirements(specialRequests: string[]): void {
    if (!specialRequests || specialRequests.length === 0) {
      return;
    }

    const validRequests = [
      'WHEELCHAIR', 'BLIND', 'DEAF', 'VEGETARIAN', 'KOSHER', 'HALAL',
      'DIABETIC', 'PREGNANT', 'UNACCOMPANIED_MINOR', 'EXTRA_LEGROOM',
      'AISLE_SEAT', 'WINDOW_SEAT', 'BULKHEAD_SEAT'
    ];

    for (const request of specialRequests) {
      if (!validRequests.includes(request)) {
        throw new BadRequestException(`Invalid special request: ${request}`);
      }
    }
  }
}