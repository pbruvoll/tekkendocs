export type CreditPerson = {
  name: string;
  url?: string;
  role: CreditRole;
};

export type CreditRole = 'author' | 'contributor';
