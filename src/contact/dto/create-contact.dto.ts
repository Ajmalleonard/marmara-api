export class CreateContactDto {
  first_name: string;
  last_name: string;
  email: string;
  help: string;
  trip_type?: string;
  class_type?: string;
  departure_date?: string;
  return_date?: string;
  from_location?: string;
  to_location?: string;
  info?: string;
}
