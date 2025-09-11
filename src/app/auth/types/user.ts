export type CreateUserDto = {
  readonly name: string;
  readonly surname: string;
  readonly email: string;
  readonly phone: string;
  readonly birthdaydate: Date | string;
  password: string;
};
